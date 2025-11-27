import SubHeader from "@/components/sub-header";
import Container from "@/layout/container";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import AddSaleProduct from "./add-sale-product";
import AddSalePayment from "./add-sale-payment";
import AddSaleInformation from "./add-sale-information";
import { QuotationProps, ReturnProps, salePaymentDetailProps, SaleProps, SelectedProducts } from "@/types/types";
import { supabase } from "@/api/supabase-client";
import { useNavigate, useParams } from "react-router-dom";
import { showToast } from "@/components/toast";
import { useAuth } from "@/api/auth-provider";
import Modal from "@/components/modal";
import TextArea from "@/components/form/text-area";
import StatusTags from "@/components/status-tags";
import { ArrowDownIcon, DeleteIcon, InformationCircleIcon, ThreeDotsIcon, UploadIcon } from "@/icons/icons";
import Button from "@/components/form/button";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/components/form/dropdown";
import SaleBill from "./sale-bill";
import QuotationBill from "../quotation/quotation-bill";
import { useRolePermission } from "@/api/permissions-provider";
import { getPermissions } from "@/lib/function";
import AccessPage from "../access-page";
import { useGeneralInformation } from "@/api/general-provider";
import AccessSale from "../access-sale";

type FormDataProps = Omit<SaleProps, 'salesCode' | 'saleId' | 'products' | 'salePaymentDetails' | 'return'>;

export default function AddSale() {
  const navigate = useNavigate();
  const { dollarValue = 0 } = useGeneralInformation
    ();
  const { saleId } = useParams();
  const [saleCode, setSaleCode] = useState<string>('');
  const [salePaymentDetails, setSalePaymentDetails] = useState<salePaymentDetailProps[]>([]);
  const [pendingAmount, setPendingAmount] = useState(0);
  const formRef = useRef<HTMLFormElement | null>(null);
  const INITIAL_FORM_DATA: FormDataProps = {
    userId: '',
    customerId: '',
    discount: 0,
    shippingCost: 0,
    subTotal: 0,
    total: 0,
    observation: '',
    typeSale: 1,
    expirationDate: null,
    createdAt: new Date(),
    userIdCancellation: null,
    cancellationUser: '',
    cancellationReason: '',
    cancellationDate: null,
    customerName: '',
    phone: '',
    email: '',
    dni: '',
    state: 1,
    dollarChange: 0,
  }
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [products, setProducts] = useState<SelectedProducts[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormDataProps>(INITIAL_FORM_DATA);
  const [returns, setReturns] = useState<ReturnProps[]>([]);

  const [isQuotation, setIsQuotation] = useState(false);
  const [isTypeChecked, setIsTypeChecked] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState({ quotationBill: false, billSale: false, customers: false, observations: false, products: false, categoryCustomer: false, address: false, discount: false, shippingCost: false, cancellationReason: false, paymentMethod: false, sendInvoice: false, quotation: false });
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canCreateSale = getPermissions(permissions, "Pedidos", "Crear")?.canAccess;
  const canCreateQuotation = getPermissions(permissions, "Cotizaciones", "Crear y editar")?.canAccess;
  const canCancelSale = getPermissions(permissions, "Pedidos", "Cancelar")?.canAccess;
  const canReturnSale = getPermissions(permissions, "Pedidos", "Gestionar devoluciones")?.canAccess;
  const handleChangeShowModal = (name: keyof typeof isModalOpen, value: boolean) => {
    setIsModalOpen((prev) => ({ ...prev, [name]: value }));
  }

  const [discountIdsUsed, setDiscountIdsUsed] = useState<string[]>([]);
  const handleDiscountIdsChange = (newDiscountIds: string[]) => {
    setDiscountIdsUsed(newDiscountIds);
  };
  const [isAllowToSale, setIsAllowToSale] = useState(false);

  useEffect(() => {
    const handleLoadStatus = async () => {
      const { data } = await supabase.from('cashbox_status').select('*').single();
      setIsAllowToSale(data.anyOpen);
    };

    handleLoadStatus();
  }, []);

  const { user } = useAuth();

  useEffect(() => {

    if ((!saleId || (isQuotation && saleId))) {
      setFormData((prev) => ({
        ...prev,
        userId: user.id
      }));
    }
  }, [saleId, user]);


  useEffect(() => {
    const pathname = location.pathname;

    if (pathname.includes("/quotations")) {
      setIsQuotation(true);
    } else {
      setIsQuotation(false);
    }

    setIsTypeChecked(true);
  }, [location.pathname]);

  const handleCloseBillSale = () => {
    setIsModalOpen((prev) => ({ ...prev, billSale: false }));
    if (!saleId) {
      setFormData((prev) => ({ ...INITIAL_FORM_DATA, userId: prev.userId }));
      setProducts([]);
      setSalePaymentDetails([]);
    } else if (saleId && isQuotation) {
      setFormData((prev) => ({ ...prev, stateQuotation: true }));
    }
  };

  const handleCloseQuotationBill = () => {
    setIsModalOpen((prev) => ({ ...prev, quotationBill: false }));
    if (!saleId) {
      setFormData((prev) => ({ ...INITIAL_FORM_DATA, userId: prev.userId }));
      setProducts([]);
      setSalePaymentDetails([]);
    }
  };
  const [lastSaleCode, setLastSaleCode] = useState<string>('');
  const canCancelByDate = (() => {
    if (!formData.createdAt) return false;

    const createdTime = new Date(formData.createdAt).getTime();
    const now = new Date().getTime();
    const diffInMs = now - createdTime;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    return diffInHours <= 24;
  })();

  useEffect(() => {
    const handleLoadSaleById = async () => {
      const { data } = await supabase.from('getsales').select('*').eq('saleId', saleId);
      const saleData = data?.[0] as SaleProps;
      setSaleCode(saleData.salesCode);

      setFormData({
        userId: saleData.userId,
        customerId: saleData.customerId,
        customerName: saleData.customerName,
        customerLastName: saleData.customerLastName,
        discount: saleData.discount,
        shippingCost: saleData.shippingCost,
        observation: saleData.observation,
        subTotal: saleData.subTotal,
        total: saleData.total,
        typeSale: saleData.typeSale,
        expirationDate: saleData.expirationDate ? new Date(saleData.expirationDate) : null,
        createdAt: new Date(saleData.createdAt),
        userIdCancellation: saleData.userIdCancellation,
        cancellationUser: saleData.cancellationUser,
        cancellationReason: saleData.cancellationReason,
        cancellationDate: saleData.cancellationDate ? new Date(saleData.cancellationDate) : null,
        state: saleData.state,
        dollarChange: saleData.dollarChange,
        pays: saleData.pays,
      });

      setProducts((saleData.products.map((product) => ({
        productSupplierId: product.productSupplierId,
        productId: product.productId,
        name: product.productName,
        quantity: product.quantity,
        discount: product.productDiscount,
        price: product.productPrice,
        subTotal: product.subTotal,
        total: product.total,
        storeHouseId: product.storeHouseId,
        storeHouseName: product.storeHouseName,
        supplierId: product.supplierId,
        nameSupplier: product.nameSupplier,
      }))));

      if (saleData.return && saleData.return.length > 0) {
        setReturns(
          saleData.return.map((returns) => ({
            returnId: returns.returnId,
            subTotal: returns.subTotal,
            shippingCost: returns.shippingCost,
            discount: returns.discount,
            total: returns.total,
            userId: returns.userId || "",
            createdAt: new Date(returns.createdAt),
            dollarChange: returns.dollarChange,
            returnDetail: (returns.returnDetail || []).map((detail) => ({
              returnDetailId: detail.returnDetailId || crypto.randomUUID(),
              returnId: returns.returnId,
              productSupplierId: detail.productSupplierId,
              productName: detail.productName,
              productPrice: detail.productPrice,
              quantity: detail.quantity,
              subTotal: detail.subTotal,
              discount: detail.discount,
              total: detail.total,
              reason: detail.reason,
              type: detail.type,
              storeHouseId: detail.storeHouseId,
              storeHouseName: detail.storeHouseName || "",
              supplierId: detail.supplierId || "",
              supplierName: detail.supplierName || "",
              createdAt: new Date(detail.createdAt),
            })),
            returnPaymentDetail: (returns.returnPaymentDetail || []).map((payment) => ({
              returnPaymentDetailId: payment.returnPaymentDetailId || crypto.randomUUID(),
              returnId: returns.returnId,
              amount: payment.amount,
              reference: payment.reference,
              bankId: payment.bankId,
              currencyId: payment.currencyId,
              currencyName: payment.currencyName,
              paymentMethodId: payment.paymentMethodId,
              namePaymentMethod: payment.namePaymentMethod || "",
              bankName: payment.bankName || "",
              createdAt: new Date(payment.createdAt),
            })),
          }))
        );
      } else {
        setReturns([]);
      }

      if (!isQuotation && saleData.typeSale === 1) {
        setSalePaymentDetails(
          saleData.salePaymentDetails.map((payment) => ({
            salePaymentDetailId: payment.salePaymentDetailId,
            saleId: saleData.saleId,
            paymentMethodId: payment.paymentMethodId,
            namePaymentMethod: payment.namePaymentMethod,
            amount: payment.amount,
            currencyId: payment.currencyId,
            currencyName: payment.currencyName,
            reference: payment.reference,
            bankId: payment.bankId || "",
            bankName: payment.bankName || "",
          }))
        );
      } else {
        setSalePaymentDetails([]);
      }
    }

    if (saleId && isTypeChecked && !isQuotation) {
      handleLoadSaleById();
    }
  }, [saleId, isQuotation, isTypeChecked]);


  useEffect(() => {
    const handleLoadQuotationById = async () => {
      const { data } = await supabase.from('getquotations').select('*').eq('quotationId', saleId);
      const quotationData = data?.[0] as QuotationProps;
      setSaleCode(quotationData.quotationCode);

      setFormData({
        userId: quotationData.userId,
        customerId: quotationData.customerId,
        customerName: quotationData.customerName,
        customerLastName: quotationData.customerLastName,
        discount: quotationData.discount,
        shippingCost: quotationData.shippingCost,
        observation: quotationData.observation,
        subTotal: quotationData.subTotal,
        total: quotationData.total,
        state: 1,
        stateQuotation: quotationData.state,
        phone: quotationData.phone,
        email: quotationData.email,
        dni: quotationData.dni,

        typeSale: 1,
        expirationDate: null,
        createdAt: quotationData.createdAt ? new Date(quotationData.createdAt) : new Date(),
        userIdCancellation: null,
        cancellationUser: null,
        cancellationReason: '',
        cancellationDate: null,
        dollarChange: 0,
      });

      const loadedProducts = (quotationData.products || []).map((product) => ({
        productSupplierId: product.productSupplierId,
        productId: product.productId,
        name: product.productName,
        quantity: product.quantity,
        discount: product.productDiscount,
        price: product.productPrice,
        subTotal: product.subTotal,
        total: product.total,
        storeHouseId: product.storeHouseId,
        storeHouseName: product.storeHouseName,
        supplierId: product.supplierId,
        nameSupplier: product.nameSupplier,
      }));

      const newProducts = (quotationData.newProducts || []).map((product) => ({
        productId: product.productId,
        name: product.productName,
        quantity: product.quantity,
        discount: product.discount,
        price: product.price,
        subTotal: product.subTotal,
        total: product.total,
        productSupplierId: '',
        storeHouseId: '',
        storeHouseName: '',
        supplierId: '',
        nameSupplier: '',
      }));
      setProducts([...loadedProducts, ...newProducts]);
    };

    if (saleId && isTypeChecked && isQuotation) {
      handleLoadQuotationById();
    }
  }, [saleId, isQuotation, isTypeChecked]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isQuotation && saleId) {
      showToast("No se puede guardar una venta ya existente", false);
      return;
    }


    if (products.length === 0) {
      showToast("Debe agregar al menos un producto", false);
      return;
    }
    if (!formData.customerId) {
      showToast("Debe seleccionar un cliente", false);
      return;
    }
    if (formData.typeSale === 1 && pendingAmount > 0) {
      showToast(`saldo pendiente`, false);
      return;
    }

    setIsLoading(true);
    const { data: saleCode, error } = await supabase.rpc('submitsale', {
      p_user_id: formData.userId,
      p_customer_id: formData.customerId,
      p_discount: formData.discount,
      p_shipping_cost: formData.shippingCost,
      p_observation: formData.observation,
      p_sub_total: formData.subTotal,
      p_type_sale: formData.typeSale,
      p_user_id_cancellation: formData.userIdCancellation,
      p_state: formData.state,
      p_expiration_date: formData.expirationDate,
      p_total: Number(formData.total),
      p_quotation_id: isQuotation && saleId ? saleId : null,
      p_dollar_change: dollarValue,
      p_products: products.map(p => ({
        productSupplierId: p.productSupplierId.split('/')[0],
        quantity: p.quantity,
        productPrice: p.price,
        subTotal: Number(p.price) * Number(p.quantity),
        discount: Number(p.discount ?? 0),
        total: Number(p.quantity) * (Number(p.price) - Number(p.discount ?? 0)),
        storeHouseId: p.storeHouseId
      })),
      p_payment_details: salePaymentDetails.map(p => ({
        paymentMethodId: p.paymentMethodId,
        amount: Number(p.amount),
        currencyId: p.currencyId,
        reference: p.reference,
        bankId: p.bankId
      })),
      p_discount_ids: discountIdsUsed
    });

    if (error) {
      showToast(error.message, false);
    } else {
      setLastSaleCode(saleCode);
      showToast('Venta creada exitosamente', true);
      setIsModalOpen((prev) => ({ ...prev, billSale: true }));
    }
    setIsLoading(false);
  };

  const handleSubmitQuotation = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    if (products.length === 0) {
      showToast("Debe agregar al menos un producto", false);
      return;
    }
    if (!formData.customerId) {
      showToast("Debe seleccionar un cliente", false);
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.rpc('submitquotation', {
      p_user_id: formData.userId,
      p_customer_id: formData.customerId,
      p_discount: formData.discount,
      p_shipping_cost: formData.shippingCost,
      p_observation: formData.observation,
      p_sub_total: formData.subTotal,
      p_state: false,
      p_total: Number(formData.total),
      p_products: products
        .filter(p =>
          p.productSupplierId &&
          !p.productSupplierId.toLowerCase().includes('/new')
        )
        .map(p => ({
          productSupplierId: p.productSupplierId.split('/')[0],
          quantity: p.quantity,
          productPrice: p.price,
          subTotal: Number(p.price) * Number(p.quantity),
          discount: Number(p.discount ?? 0),
          total: Number(p.quantity) * (Number(p.price) - Number(p.discount ?? 0)),
          storeHouseId: p.storeHouseId
        })),
      p_new_products: products
        .filter(p => p.productId.includes("New"))
        .map(p => ({
          productId: p.productId,
          productName: p.name,
          price: p.price,
          quantity: p.quantity,
          subTotal: Number(p.price) * Number(p.quantity),
          discount: Number(p.discount ?? 0),
          total: Number(p.quantity) * (Number(p.price) - Number(p.discount ?? 0)),

        }))

    });

    if (error) {
      showToast(error.message, false);
    } else {
      showToast('Cotización creada exitosamente', true);
      setIsModalOpen((prev) => ({ ...prev, quotationBill: true }));

    }
    setIsLoading(false);
  };

  const handleDeleteSale = () => {
    setIsModalOpen((prev) => ({ ...prev, cancellationReason: true }));
  };

  const handleChangeFormData = useCallback((name: keyof typeof formData, value: string | number | string[] | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, [])

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit();
  }

  const handleSubmitCancellationReason = async () => {
    const reason = formData.cancellationReason?.trim();

    if (!reason || reason.length < 10) {
      showToast('La razón de anulación debe tener al menos 10 caracteres.', false);
      return;
    }

    if (saleId) {
      const { error } = await supabase.rpc('cancelsale', {
        p_sale_id: saleId,
        p_user_id_cancellation: user?.id,
        p_cancellation_reason: reason
      });

      if (error) {
        showToast(error.message, false);
      } else {
        showToast('Venta anulada exitosamente', true);
        window.location.reload();
        setIsModalOpen((prev) => ({ ...prev, cancellationReason: false }));
      }
    }
  };

  const getStateText = () => {
    if (isQuotation) {
      return formData.stateQuotation ? "Completado" : "Pendiente";
    }

    switch (formData.state) {
      case 0:
        return "Anulada";
      case 1:
        return "Pagado";
      case 2:
        return "Pendiente";
      default:
        return "";
    }
  };

  const InfoCancellationSale = () => {
    return (
      <div className="flex space-x-2 items-center">
        {formData.typeSale !== undefined && saleId && (
          <StatusTags
            status
            text={
              isQuotation
                ? "Cotización"
                : formData.typeSale === 1
                  ? "Contado"
                  : formData.typeSale === 0
                    ? "Crédito"
                    : ""
            }
            color={
              isQuotation
                ? "bg-[#d3f0f7]"
                : formData.typeSale === 1
                  ? "bg-[#affebf]"
                  : formData.typeSale === 0
                    ? "bg-yellow-200"
                    : "bg-gray-200"
            }
            textColor={
              isQuotation
                ? "text-[#004d61]"
                : formData.typeSale === 1
                  ? "text-[#014b40]"
                  : formData.typeSale === 0
                    ? "text-yellow-800"
                    : "text-gray-800"
            }
            className="text-xs"
          />

        )}
        {formData.state !== undefined && saleId && (
          <div className="flex items-center">
            <StatusTags
              status={formData.state === 1}
              text={getStateText()}
              color={
                isQuotation
                  ? formData.stateQuotation
                    ? "bg-[#affebf]"
                    : "bg-[#ffabab]"
                  : formData.state === 1
                    ? "bg-[#affebf]"
                    : formData.state === 0
                      ? "bg-[#ffabab]"
                      : formData.state === 2
                        ? "bg-yellow-200"
                        : "bg-gray-200"
              }
              textColor={
                isQuotation
                  ? formData.stateQuotation
                    ? "text-[#014b40]"
                    : "text-[#d10000]"
                  : formData.state === 1
                    ? "text-[#014b40]"
                    : formData.state === 0
                      ? "text-[#d10000]"
                      : formData.state === 2
                        ? "text-yellow-800"
                        : "text-gray-800"
              }
              className="text-xs"
            />
            {formData.state === 0 && (
              <div
                className="relative ml-2"
                onMouseEnter={() => setIsInfoVisible(true)}
                onMouseLeave={() => setIsInfoVisible(false)}
              >
                <InformationCircleIcon className="text-[#d10000] cursor-pointer size-5" />
                {isInfoVisible && (
                  <div className="absolute bg-white text-secondary text-2xs p-3 rounded-lg shadow-lg top-full left-36 transform -translate-x-1/2 mt-2 w-64 max-h-64 overflow-y-auto z-10">
                    <p className="font-semibold">Anulado por: </p>
                    <p className="font-medium break-words pb-2 text-secondary/80">{formData.cancellationUser}</p>

                    <p className="font-semibold">Razón: </p>
                    <p className="font-medium break-words text-secondary/80">{formData.cancellationReason || 'Anulación no especificada'}</p>

                    <p className="font-semibold mt-2 ">Fecha: </p>
                    <p className="font-medium break-words text-secondary/80">
                      {formData.cancellationDate
                        ? new Date(formData.cancellationDate).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        }).replace('.', '')
                        : ''}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <Container text={
      formData.state === 0
        ? "Venta anulada"
        : !saleId && !isQuotation
          ? "Venta sin guardar"
          : !saleId && isQuotation
            ? "Cotización sin guardar"
            : isQuotation && formData.stateQuotation == false
              ? "Venta sin guardar (Cotización)"
              : "Venta guardada"
    } save={(!isQuotation && saleId) || (isQuotation && formData.stateQuotation == true) || (!isAllowToSale && !isQuotation) || (!isAllowToSale && isQuotation && saleId) ? false : true} onSaveClick={handleFormSubmit} isLoading={isLoading}
   onClickSecondary={() => navigate(isQuotation ? "/quotations/" : "/sales/")}>
      {(isAllowToSale && !saleId) || (saleId) || isQuotation ? (
        <>
          {(isQuotation && canCreateQuotation) || (!isQuotation && canCreateSale) ? (
            <section className="flex flex-col items-center h-full flex-1">
              <div className="max-w-screen-lg mt-2 w-full mx-auto flex-1 flex flex-col">
                <SubHeader title={
                  isQuotation && !saleId
                    ? 'Nueva cotización'
                    : !saleId
                      ? 'Nueva venta'
                      : returns.length > 0 ? `${saleCode}-DEV` : saleCode}
                  backUrl={isQuotation ? "/quotations" : "/sales"} isShowButtons={saleId ? true : false} secondChildren={<InfoCancellationSale />} >
                  <>

                    {saleId && (
                      <div className="flex md:pr-0 pr-4 items-center space-x-2">
                        {!returns.length && !isQuotation && formData.state === 1 && (isAllowToSale && !isQuotation) && (
                          <Button
                            className="md:flex hidden items-center space-x-1 md:px-3 md:p-0 p-2.5 md:py-1 bg-[#e3e3e3] text-2xs text-secondary/80 font-semibold active:shadow-pressed rounded-md"
                            type="button"
                            name="Devolución"
                            onClick={() => navigate(`/sales/return/add/${saleId}`)}

                          >
                          </Button>
                        )}
                        <Dropdown closeToClickOption>
                          <DropdownTrigger>
                            <button className="flex items-center space-x-1 md:px-3 md:p-0 p-2.5 md:py-1 bg-[#e3e3e3] text-2xs font-semibold text-primary active:shadow-pressed rounded-md" type="button">
                              <span className="text-secondary/80 md:block hidden font-semibold">Más opciones</span>
                              <ArrowDownIcon className="size-4 md:block hidden fill-secondary/80 stroke-none" />
                              <ThreeDotsIcon className="size-5 md:hidden block fill-secondary/80 stroke-none" />
                            </button>
                          </DropdownTrigger>

                          <DropdownContent align="end" className="rounded-xl">
                            <DropdownItem onClick={() => isQuotation ? handleChangeShowModal('quotationBill', true) : handleChangeShowModal('billSale', true)} className="space-x-2">
                              <UploadIcon className='size-4 fill-secondary/80' />
                              <span className="text-2xs">Exportar PDF</span>
                            </DropdownItem>
                            {canReturnSale && !returns.length && (
                              <DropdownItem className="md:hidden">
                                <Button
                                  className='flex items-center space-x-2 text-2xs font-medium'
                                  onClick={() => navigate('/return')}
                                  name="Devolución"
                                >
                                </Button>
                              </DropdownItem>
                            )}

                            {canCancelSale && saleId && formData.state !== 0 && !isQuotation && returns.length === 0 && formData.pays === null && canCancelByDate && (isAllowToSale && !isQuotation) && (
                              <DropdownItem onClick={handleDeleteSale} className='hover:bg-[#fec1c7] text-red-900 space-x-2'>
                                <DeleteIcon className='size-4 fill-[#8e0b21]' />
                                <span>Cancelar venta</span>
                              </DropdownItem>
                            )}
                          </DropdownContent>
                        </Dropdown>
                      </div>
                    )}
                  </>
                </SubHeader>
                <main className="flex flex-1 flex-col xl:flex-row items-start w-full">
                  <form ref={formRef} onSubmit={
                    isQuotation && saleId
                      ? handleSubmit
                      : isQuotation && !saleId
                        ? handleSubmitQuotation
                        : handleSubmit
                  } className="flex flex-1 xl:space-x-6 flex-col-reverse xl:flex-row items-start w-full">
                    <div className="flex-1 xl:w-auto w-full space-y-4">
                      <AddSaleProduct onDiscountIdsChange={handleDiscountIdsChange} products={products} setProducts={setProducts} saleId={saleId} returns={returns} formData={formData} saleCode={saleCode} isQuotation={isQuotation} stateQuotation={formData.stateQuotation || false} />
                      <AddSalePayment
                        isModalOpen={isModalOpen}
                        handleChangeShowModal={handleChangeShowModal}
                        products={products}
                        formData={formData}
                        setFormData={setFormData}
                        saleId={saleId}
                        setPendingAmount={setPendingAmount}
                        salePaymentDetails={salePaymentDetails}
                        setSalePaymentDetails={setSalePaymentDetails}
                        isQuotation={isQuotation}
                        returns={returns}
                        saleCode={saleCode}
                        isAllowToSale={isAllowToSale}
                      />
                    </div>
                    <div className="w-full xl:w-1/3 space-y-4">
                      <AddSaleInformation
                        handleChangeFormData={handleChangeFormData}
                        formData={formData}
                        handleChangeShowModal={handleChangeShowModal}
                        isModalOpen={isModalOpen}
                        saleId={saleId}
                      />
                    </div>
                  </form>
                </main>
              </div>
              {isModalOpen.cancellationReason && (
                <Modal
                  name="Anular venta"
                  classNameModal="max-w-3xl"
                  onClose={() => handleChangeShowModal('cancellationReason', false)}
                  onClickSave={handleSubmitCancellationReason}
                >
                  <div className="relative">
                    <TextArea
                      className="px-4 pb-4 pt-2"
                      name="Razon de anulación"
                      rows={3}
                      value={formData.cancellationReason}
                      onChange={(e) => handleChangeFormData('cancellationReason', e.target.value)}
                      placeholder="Escribe la razón de la anulación aquí..."
                      required
                    />
                  </div>
                </Modal>
              )}
              <SaleBill isOpen={isModalOpen.billSale} onClose={handleCloseBillSale} codeSale={saleCode && saleCode.trim() !== "" ? saleCode : lastSaleCode} typeSale={formData.typeSale} state={formData.state} salePaymentDetail={salePaymentDetails} customerName={formData.customerName ?? ''} customerLastName={formData.customerLastName ?? ''} dollarChange={formData.dollarChange} discount={formData.discount} subTotal={formData.subTotal} total={formData.total} createdAt={formData.createdAt} shippingCost={formData.shippingCost} returns={returns} products={products.map(p => ({ name: p.name, quantity: p.quantity, price: Number(p.price), discount: Number(p.discount ?? 0) }))} />
              {
                <QuotationBill quotationData={{
                  quotationNumber: saleCode,
                  date: new Date(formData.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }),
                  isOpen: isModalOpen.quotationBill,
                  onClose: () => handleCloseQuotationBill(),
                  customerName: formData.customerName,
                  customerLastName: formData.customerLastName ?? '',
                  customerRuc: formData.dni,
                  customerPhone: formData.phone,
                  customerEmail: formData.email,
                  products: [
                    ...(products?.map(p => ({
                      name: p.name,
                      quantity: p.quantity,
                      productId: p.productId,
                      cost: Number(p.price),
                      discount: Number(p.discount ?? 0)
                    })) ?? []),
                  ],
                  observations: formData.observation,
                  shippingCost: formData.shippingCost,
                  subTotal: formData.subTotal,
                  total: formData.total,
                  discount: formData.discount,
                }} />
              }
            </section>
          ) : (
            <AccessPage />
          )}
        </>) : (
        <AccessSale />
      )}
    </Container>
  );
}