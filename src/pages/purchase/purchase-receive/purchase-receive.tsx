import SubHeader from "@/components/sub-header";
import Container from "@/layout/container";
import { PaymentMethodProps, PurchaseOrderReceiptProps, SupplierProps } from "@/types/types";
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/api/supabase-client";
import { showToast } from "@/components/toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "@/components/form/button";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/components/form/dropdown";
import { ArrowDownIcon, CloseIcon, DeferredPaymentsIcon, ReOpenIcon, ThreeDotsIcon, UploadIcon } from "@/icons/icons";
import StatusTags from "@/components/status-tags";
import PurchaseReceiveHeader from "./purchase-receive-header";
import PurchaseReceiveShipping from "./purchase-shipping";
import PurchaseReceiveProducts from "./purchase-receive-products";
import PurchaseReceiveAdditionalInformation from "./purchase-receive-additional-information";
import PurchaseReceiveCost from "./purchase-receive-cost";
import { useRolePermission } from "@/api/permissions-provider";
import { getPermissions } from "@/lib/function";
import AccessPage from "@/pages/access-page";
import { PDFViewer } from "@react-pdf/renderer";
import PurchaseBill from "@/pages/pdf/purchases/purchase-bill";
import Modal from "@/components/modal";

const INITIAL_FORM_DATA: PurchaseOrderReceiptProps = {
  supplierId: '',
  storeHouseId: '',
  paymentMethodId: '',
  shippingCost: 0,
  arrivalDate: null,
  observations: '',
  subTotal: 0,
  total: 0,
  referenceNumber: '',
  codePurchaseOrder: '',
  state: 0,
  createdAt: new Date(),
  products: [],
  purchaseOrderId: '',
  expirationDate: null,
  paymentConditionId: null,
  purchaseType: 0,
  discount: 0,
  currencyId: '',
  currencyName: '',
  paymentConditionName: '',
};

export default function PurchaseReceive() {
  const { purchaseId } = useParams();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement | null>(null);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canViewPurchase = getPermissions(permissions, "Ordenes de compras", "Ver")?.canAccess;
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const viewerRef = useRef<HTMLDivElement>(null)
  const [suppliers, setSuppliers] = useState<SupplierProps[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodProps[]>([]);

  const [formData, setFormData] = useState<PurchaseOrderReceiptProps>(INITIAL_FORM_DATA);

  useEffect(() => {
    if (!purchaseId) return;

    const handleLoadPurchaseById = async () => {
      const { data } = await supabase
        .from('getpurchasereceipt')
        .select('*')
        .eq('purchaseOrderId', purchaseId);

      const purchaseData = data?.[0] as PurchaseOrderReceiptProps;
      setFormData(purchaseData);
    };

    handleLoadPurchaseById();
  }, [purchaseId]);

  const handleChangeFormData = (name: keyof typeof formData, value: string | number | Date) => {
    setFormData({ ...formData, [name]: value });
  };

  const StatusTagPurchaseHeader = (): React.ReactNode => (
    <StatusTags status={true} text={formData.state === 0 ? 'Borrador' : formData.state === 1 ? 'Comprado' : 'Cerrado'} color={formData.state === 0 ? 'bg-[#ffd6a4]' : formData.state === 1 ? 'bg-[#d5ebff]' : 'bg-[#e2e2e2]'} textColor={formData.state === 0 ? 'text-[#5E4200]' : formData.state === 1 ? 'text-[#003A5A]' : 'text-[#737373]'} />
  );

  const handleClickButtonHeader = () => {
    navigate(`/purchases/add/${purchaseId}/receive`);
  };

  const handleChangeStatePurchase = async (newState: number) => {
    const { error } = await supabase.from('purchaseOrder').update({ state: newState }).eq('purchaseOrderId', purchaseId);
    if (error) {
      showToast(error.message, false);
    } else {
      showToast(`Orden de compra ${newState === 1 ? 'reabrida' : 'cerrada'}`, true);
      setFormData({ ...formData, state: newState });
    }
  }

  const handlePrint = () => {
    if (!viewerRef.current) return

    const iframe = viewerRef.current.querySelector("iframe") as HTMLIFrameElement | null
    if (!iframe || !iframe.contentWindow) return

    iframe.contentWindow.focus()
    iframe.contentWindow.print()
  }

  return (
    <Container>
      {canViewPurchase ? (
        <section className="max-w-[950px] flex flex-1 flex-col mt-2 w-full mx-auto">
          <SubHeader backUrl="/purchases" title={formData.codePurchaseOrder} secondChildren={purchaseId && <StatusTagPurchaseHeader />}>
            {purchaseId && (
              <div className="flex md:pr-0 pr-4 items-center space-x-2">
                <Dropdown closeToClickOption>
                  <DropdownTrigger>
                    <button className="flex items-center md:space-x-1 md:px-3 md:p-0 p-2.5 md:py-1 bg-[#e3e3e3] text-2xs font-semibold text-primary active:shadow-pressed rounded-md" type="button">
                      <span className="text-secondary/80 md:block hidden font-semibold">Más opciones</span>
                      <ArrowDownIcon className="size-4 md:block hidden fill-secondary/80 stroke-none" />
                      <ThreeDotsIcon className="size-5 md:hidden block fill-secondary/80 stroke-none" />
                    </button>
                  </DropdownTrigger>
                  <DropdownContent align="end" className="rounded-xl">
                    <DropdownItem onClick={() => setIsShowModal(true)} className="space-x-2">
                      <UploadIcon className='md:size-4 size-5 fill-secondary/80' />
                      <span className="md:text-2xs text-base">Exportar PDF</span>
                    </DropdownItem>
                    {getPermissions(permissions, "Ordenes de compras", "Registrar pagos")?.canAccess && formData.purchaseType !== 0 && formData.state >= 1 &&
                      <DropdownItem>
                        <Link to={`/purchases/payment/add/${formData.purchaseOrderId}`} className='flex items-center space-x-2'>
                          <DeferredPaymentsIcon className="md:size-4 size-5 fill-secondary/80 stroke-none" />
                          <span className="md:text-2xs text-base">Pagos diferidos</span>
                        </Link>
                      </DropdownItem>
                    }
                    {getPermissions(permissions, 'Ordenes de compras', 'Cancelar')?.canAccess && formData.state < 2 &&
                      <DropdownItem onClick={() => handleChangeStatePurchase(3)}>
                        <button className='flex items-center space-x-2'>
                          <CloseIcon className="md:size-4 size-5 fill-secondary/80" />
                          <span className="md:text-2xs text-base">Cerrar orden de compra</span>
                        </button>
                      </DropdownItem>
                    }
                    {getPermissions(permissions, 'Ordenes de compras', 'Cancelar')?.canAccess && formData.state === 3 &&
                      <DropdownItem onClick={() => handleChangeStatePurchase(1)}>
                        <button className='flex items-center space-x-2'>
                          <ReOpenIcon className="size-4 fill-secondary/80 stroke-none" />
                          <span>Reabrir order de compra</span>
                        </button>
                      </DropdownItem>
                    }
                  </DropdownContent>
                </Dropdown>
                {getPermissions(permissions, "Ordenes de compras", 'Recibir inventario')?.canAccess && formData.state !== 3 && <Button onClick={handleClickButtonHeader} name={`${formData.state >= 2 ? 'Ver' : 'Recibir'} inventario`} className="px-3 md:py-1 py-2.5 bg-[#e3e3e3] text-2xs font-medium text-secondary" styleButton="secondary" />}
              </div>
            )}
          </SubHeader>
          <form ref={formRef} className="w-full">
            <PurchaseReceiveHeader paymentMethods={paymentMethods} setPaymentMethods={setPaymentMethods} suppliers={suppliers} setSuppliers={setSuppliers} formData={formData} handleChangeFormData={handleChangeFormData} />
            <PurchaseReceiveShipping formData={formData} />
            <PurchaseReceiveProducts formData={formData} products={formData.products} />
            <div className="flex md:flex-row flex-col md:space-x-2 space-x-0 [&>section]:w-full items-start">
              <PurchaseReceiveAdditionalInformation formData={formData} />
              <PurchaseReceiveCost isEditing={purchaseId ? true : false} currencyName={formData.currencyName} formData={formData} setFormData={setFormData} />
            </div>
          </form>

          {isShowModal && (
            <Modal
              name="Orden de compra"
              onClose={() => setIsShowModal(false)}
              onClickSave={handlePrint}
              principalButtonName="Imprimir"
              classNameModal="md:max-h-[95vh]"
              className="md:max-w-4xl"
            >
              <div className="bg-white">
                <div
                  className="max-h-[78vh] overflow-y-auto"
                  ref={viewerRef}
                  style={{ minHeight: "700px" }}
                >
                  <PDFViewer
                    style={{ width: "100%", height: "700px", border: "none" }}
                    showToolbar={false}
                  >
                    <PurchaseBill
                      data={{
                        codePurchaseOrder: formData.codePurchaseOrder,
                        date: new Date(formData.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }),
                        supplierName: suppliers.find(s => s.supplierId === formData.supplierId)?.nameSupplier ?? "",
                        products:
                          formData.products?.map((p) => ({
                            name: p.productName,
                            quantity: p.orderedQuantity,
                            productId: p.productId,
                            cost: Number(p.cost),
                          })) ?? [],
                        observations: formData.observations,
                        shippingCost: formData.shippingCost,
                        subTotal: formData.subTotal,
                        total: formData.total,
                        discount: formData.discount,
                        typePurchase: formData.purchaseType !== 0,
                        currencyName: formData.currencyName,
                        paymentMethodName: paymentMethods.find(pm => pm.paymentMethodId === formData.paymentMethodId)?.namePaymentMethod ?? "",
                        expirationDate: formData.expirationDate
                          ? new Date(formData.expirationDate).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                          : "",
                      }}
                    />
                  </PDFViewer>
                </div>
              </div>
            </Modal>
          )}
        </section>
      ) : (
        <AccessPage />
      )}
    </Container>
  );
}
