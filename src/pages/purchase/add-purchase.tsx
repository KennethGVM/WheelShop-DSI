import SubHeader from "@/components/sub-header";
import Container from "@/layout/container";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { supabase } from "@/api/supabase-client";
import { showToast } from "@/components/toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Button from "@/components/form/button";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/components/form/dropdown";
import { ArrowDownIcon, DeleteIcon, ThreeDotsIcon, UploadIcon } from "@/icons/icons";
import StatusTags from "@/components/status-tags";
import Modal from "@/components/modal";
import { useRolePermission } from "@/api/permissions-provider";
import { getPermissions } from "@/lib/function";
import AccessPage from "../access-page";
import { useAuth } from "@/api/auth-provider";
import { CurrencyProps, PaymentMethodProps, ProductProps, ProductSupplierProps, PurchaseProps, SelectedProducts, SupplierProps } from "@/types/types";
import PurchaseHeader from "./purchase-header";
import PurchaseShipping from "./purchase-shipping";
import PurchaseProducts from "./purchase-products";
import PurchaseAdditionalInformation from "./purchase-additional-information";
import PurchaseCost from "./purchase-cost";
import { PDFViewer } from "@react-pdf/renderer";
import PurchaseBill from "./purchase-bill";

type FormDataProps = Omit<PurchaseProps, 'purchaseOrderId' | 'nameSupplier' | 'namestorehouse' | 'namePaymentMethod' | 'products'>
export default function AddPurchase() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { purchaseId } = useParams();
  const viewerRef = useRef<HTMLDivElement>(null)
  const productId = searchParams.get('productId');
  const supplierId = searchParams.get('supplierId');
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canEditPurchase = getPermissions(permissions, "Ordenes de compras", "Editar ordenes de compra")?.canAccess;
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement | null>(null);
  const INITIAL_FORM_DATA: FormDataProps = {
    supplierId: supplierId || '',
    storeHouseId: '',
    paymentMethodId: '',
    shippingCost: 0,
    arrivalDate: null,
    observations: '',
    subTotal: 0,
    discount: 0,
    total: 0,
    referenceNumber: '',
    codePurchaseOrder: '',
    state: 0,
    createdAt: new Date(),
    expirationDate: null,
    paymentConditionId: null,
    purchaseType: 0,
    currencyId: '',
    currencyName: ''
  }
  const [suppliers, setSuppliers] = useState<SupplierProps[]>([]);
  const [products, setProducts] = useState<SelectedProducts[]>([]);
  const [formData, setFormData] = useState<FormDataProps>(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currencies, setCurrencies] = useState<CurrencyProps[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodProps[]>([]);
  const [isShowModal, setIsShowModal] = useState({
    selectByOrder: false,
    deleteOrder: false,
    print: false
  });

  useEffect(() => {
    const handleLoadProductById = async () => {
      const { data } = await supabase.from('getproducts').select('*').eq('productId', productId).eq('type', 'all');
      const productData = data?.[0] as ProductProps;
      const matchedSupplier = data?.[0].suppliers.find((s: ProductSupplierProps) => s.supplierId === formData.supplierId);
      const productSupplierId = matchedSupplier?.productSupplierId ?? '';

      setProducts(prev => [...prev, { productId: productData.productId, name: productData.name, quantity: 1, cost: 0, productSupplierId: productSupplierId }]);
    }

    if (productId) handleLoadProductById();
  }, [productId, formData.supplierId])

  useEffect(() => {
    const handleLoadCurrency = async () => {
      const { data } = await supabase.from('currency').select('*');
      setCurrencies(data as CurrencyProps[]);

      if (!purchaseId) {
        handleChangeFormData('currencyId', data?.[0].currencyId);
      }
    }

    handleLoadCurrency();
  }, [])

  useEffect(() => {
    const handleLoadPurchaseById = async () => {
      const { data } = await supabase.from('getpurchases').select('*').eq('purchaseOrderId', purchaseId);
      const purchaseData = data?.[0] as PurchaseProps;
      setFormData({
        supplierId: purchaseData.supplierId,
        storeHouseId: purchaseData.storeHouseId,
        paymentMethodId: purchaseData.paymentMethodId,
        shippingCost: purchaseData.shippingCost,
        arrivalDate: purchaseData.arrivalDate ? new Date(purchaseData.arrivalDate) : null,
        referenceNumber: purchaseData.referenceNumber,
        observations: purchaseData.observations,
        subTotal: purchaseData.subTotal,
        discount: purchaseData.discount,
        total: purchaseData.total,
        codePurchaseOrder: purchaseData.codePurchaseOrder,
        state: purchaseData.state,
        createdAt: purchaseData.createdAt ? new Date(purchaseData.createdAt) : new Date(),
        expirationDate: purchaseData.expirationDate ? new Date(purchaseData.expirationDate) : null,
        paymentConditionId: purchaseData.paymentConditionId,
        purchaseType: purchaseData.purchaseType,
        currencyId: purchaseData.currencyId,
        currencyName: purchaseData.currencyName
      });

      setProducts((purchaseData.products.map((product) => ({
        productId: product.productSupplierId,
        name: product.productName,
        quantity: product.quantity,
        cost: product.cost,
        productSupplierId: product.productSupplierId,
      }))))
    }


    if (purchaseId) handleLoadPurchaseById();
  }, [purchaseId]);


  const handlePrint = () => {
    if (!viewerRef.current) return

    const iframe = viewerRef.current.querySelector("iframe") as HTMLIFrameElement | null
    if (!iframe || !iframe.contentWindow) return

    iframe.contentWindow.focus()
    iframe.contentWindow.print()
  }

  const handleChangeFormData = (name: keyof typeof formData, value: string | number | Date) => {
    setFormData({ ...formData, [name]: value });
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.supplierId) {
      showToast('Se requiere un proveedor para la orden de compra.', false);
      return;
    }

    if (!formData.storeHouseId) {
      showToast('Se requiere una bodega para la orden de compra.', false);
      return;
    }

    if (products.length === 0) {
      showToast('Se requiere al menos un producto para la orden de compra.', false);
      return;
    }

    const invalidProduct = products.find(
      (product) => !product.quantity || product.quantity <= 0 || !product.cost || Number(product.cost) <= 0
    );

    if (invalidProduct) {
      showToast('Todos los productos deben tener una cantidad y costo mayor a 0.', false);
      return;
    }

    setIsLoading(true);

    const purchaseProducts = products.map((product) => ({
      productSupplierId: product.productSupplierId,
      quantity: Number(product.quantity),
      cost: Number(product.cost).toFixed(2),
      total: (Number(product.quantity) * Number(product.cost)).toFixed(2)
    }));

    const newPurchase = {
      o_arrivaldate: formData.arrivalDate,
      o_observations: formData.observations,
      o_paymentmethodid: formData.paymentMethodId,
      o_referencenumber: formData.referenceNumber,
      o_shippingcost: formData.shippingCost,
      o_storehouseid: formData.storeHouseId,
      o_subtotal: formData.subTotal,
      o_supplierid: formData.supplierId,
      o_discount: formData.discount,
      o_total: formData.total,
      o_expirationdate: formData.expirationDate,
      o_paymentconditionid: formData.paymentConditionId,
      o_purchasetype: formData.purchaseType,
      o_products: purchaseProducts,
      o_currencyid: formData.currencyId,
      o_userid: user.id
    }

    const { data, error } = !purchaseId ?
      await supabase.rpc("createPurchase", newPurchase) :
      await supabase.rpc("updatePurchase", { ...newPurchase, o_purchaseorderid: purchaseId });

    if (error) {
      showToast(error.message, false);
      setIsLoading(false);
    } else {
      showToast(`Orden de compra ${purchaseId ? 'actualizada' : 'creada'}`, true);
      if (formData.state === 0) {
        navigate(`/purchases/add/${data}`);
      } else {
        navigate(`/purchases/add/${data}/receive`);
      }
    }
    setIsLoading(false);
  }

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit();
  }

  const StatusTagPurchaseHeader = (): React.ReactNode => (
    <StatusTags status={true} text={formData.state === 0 ? 'Borrador' : formData.state === 1 ? 'Comprado' : 'Cerrado'} color={formData.state === 0 ? 'bg-[#ffd6a4]' : formData.state === 1 ? 'bg-[#d5ebff]' : 'bg-[#e2e2e2]'} textColor={formData.state === 0 ? 'text-[#5E4200]' : formData.state === 1 ? 'text-[#003A5A]' : 'text-[#737373]'} />
  )

  const handleChangeModal = (name: keyof typeof isShowModal, value: boolean) => {
    setIsShowModal((prev) => ({ ...prev, [name]: value }));
  }

  const handleChangeStatePurchase = async (newState: number) => {
    const { error } = await supabase.from('purchaseOrder').update({ state: newState }).eq('purchaseOrderId', purchaseId);
    handleChangeFormData('state', newState);

    if (error) {
      showToast(error.message, false);
    } else {
      showToast('Marcado como ordenado', true);
      handleChangeModal('selectByOrder', false);
      navigate(`/purchases/receive/${purchaseId}`);
    }
  }

  const handleClickButtonHeader = () => {
    if (formData.state === 0) {
      handleChangeModal('selectByOrder', true);
    } else {
      navigate(`/purchases/add/${purchaseId}/receive`);
    }
  }

  const handleDeletePurchase = async () => {
    const { error } = await supabase.from('purchaseOrder').delete().eq('purchaseOrderId', purchaseId);

    if (error) {
      showToast(error.message, false);
    } else {
      showToast('Orden de compra eliminada', true);
      handleChangeModal('deleteOrder', false);
      navigate('/purchases');
    }
  }

  return (
    <Container text="Orden de compra no guardada" save={formData.state < 1} onSaveClick={handleFormSubmit} isLoading={isLoading} onClickSecondary={() => navigate("/purchases/")}>
      {canEditPurchase ? (
        <section className="max-w-[950px] flex flex-1 flex-col mt-2 w-full mx-auto">
          <SubHeader backUrl="/purchases" title={purchaseId ? formData.codePurchaseOrder : "Crear orden de compra"} secondChildren={purchaseId && <StatusTagPurchaseHeader />}>
            {purchaseId && (
              <div className="flex items-center space-x-2 md:pr-0 pr-4">
                <Dropdown closeToClickOption>
                  <DropdownTrigger>
                    <button className="flex items-center md:space-x-1 md:px-3 md:py-1 md:p-0 p-2 bg-[#e3e3e3] text-2xs font-semibold text-primary active:shadow-pressed rounded-md" type="button">
                      <span className="text-secondary/80 md:block hidden font-semibold">Más opciones</span>
                      <ArrowDownIcon className="size-4 md:block hidden fill-secondary/80 stroke-none" />
                      <ThreeDotsIcon className="size-5 md:hidden fill-secondary/80 stroke-none" />
                    </button>
                  </DropdownTrigger>
                  <DropdownContent align="start" className="rounded-xl">
                    <DropdownItem className="space-x-2" onClick={() => handleChangeModal('print', true)}>
                      <UploadIcon className='size-4 fill-secondary/80' />
                      <span>Exportar PDF</span>
                    </DropdownItem>
                    {getPermissions(permissions, 'Ordenes de compras', 'Eliminar')?.canAccess && formData.state === 0 &&
                      <DropdownItem onClick={() => handleChangeModal('deleteOrder', true)} className='hover:bg-[#fec1c7] text-red-900 space-x-2'>
                        <DeleteIcon className='size-4 fill-[#8e0b21]' />
                        <span>Eliminar</span>
                      </DropdownItem>
                    }
                  </DropdownContent>
                </Dropdown>
                {getPermissions(permissions, 'Ordenes de compras', 'Establecer como ordenado')?.canAccess && <Button onClick={handleClickButtonHeader} name={formData.state === 0 ? 'Marcar como ordenado' : 'Recibir inventario'} className="px-3 md:py-1 py-2 bg-[#e3e3e3] text-2xs font-medium text-secondary" styleButton="secondary" />}
              </div>
            )}
            {isShowModal.selectByOrder &&
              <Modal onClickSave={() => handleChangeStatePurchase(1)} onClose={() => handleChangeModal('selectByOrder', false)} name="¿Marcar como ordenado?" principalButtonName="Marcar como ordenado">
                <p className="font-medium md:text-2xs text-base text-secondary/80 p-4">Después de marcar como ordenado podrás recibir inventario entrante de tu proveedor. Esta orden de compra no se puede volver a convertir en borrador.</p>
              </Modal>
            }
            {isShowModal.deleteOrder &&
              <Modal onClickSave={() => handleDeletePurchase()} onClose={() => handleChangeModal('deleteOrder', false)} name="¿Deseas eliminar orden de compra?" principalButtonName="Deseas eliminar orden de compra">
                <p className="font-medium md:text-2xs text-base text-secondary/80 p-4">Eliminar esta orden de compra no se puede deshacer.</p>
              </Modal>
            }

          </SubHeader>
          <form onSubmit={handleSubmit} ref={formRef} className="w-full">
            <PurchaseHeader setSuppliers={setSuppliers} suppliers={suppliers} paymentMethod={paymentMethods} setPaymentMethod={setPaymentMethods} setFormData={setFormData} currencies={currencies} setProducts={setProducts} isEditing={purchaseId !== undefined ? true : false} formData={formData} handleChangeFormData={handleChangeFormData} />
            <PurchaseShipping currencyName={currencies.find(cr => cr.currencyId === formData.currencyId)?.currencyName ?? 'Cordobas'} formData={formData} handleChangeFormData={handleChangeFormData} />
            <PurchaseProducts formData={formData} products={products} setProducts={setProducts} />

            <div className="flex md:flex-row flex-col md:space-x-2 [&>section]:w-full items-start">
              <PurchaseAdditionalInformation formData={formData} handleChangeFormData={handleChangeFormData} />
              <PurchaseCost currencyName={currencies.find(cr => cr.currencyId === formData.currencyId)?.currencyName ?? 'Cordobas'} formData={formData} setFormData={setFormData} products={products} canPaymentCondition={getPermissions(permissions, 'Ordenes de compras', 'Establecer términos de pago')?.canAccess ?? true} canAddDiscount={getPermissions(permissions, 'Ordenes de compras', 'Editar ordenes de compra', 'Aplicar descuentos')?.canAccess ?? true} />
            </div>
          </form>

          {isShowModal.print && (
            <Modal
              name="Orden de compra"
              onClose={() => handleChangeModal("print", false)}
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
                        supplierName: "",
                        products:
                          products?.map((p) => ({
                            name: p.name,
                            quantity: p.quantity,
                            productId: p.productId,
                            cost: Number(p.cost),
                          })) ?? [],
                        observations: formData.observations,
                        shippingCost: formData.shippingCost,
                        subTotal: formData.subTotal,
                        total: formData.total,
                        discount: formData.discount,
                        typePurchase: formData.purchaseType !== 0,
                        currencyName:
                          currencies.find(
                            (cr) => cr.currencyId === formData.currencyId
                          )?.currencyName ?? "Cordobas",
                        paymentMethodName:
                          paymentMethods.find(
                            (pm) => pm.paymentMethodId === formData.paymentMethodId
                          )?.namePaymentMethod ?? "",
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
