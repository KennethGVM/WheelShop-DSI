import { supabase } from "@/api/supabase-client";
import SubHeader from "@/components/sub-header"
import { ArrowRightIcon } from "@/icons/icons"
import Container from "@/layout/container"
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import ReturnProducts from "./return-products"
import ReturnChangeProducts from "./return-change-products"
import ReturnSummary from "./return-summary"
import { ReturnPaymentDetailProps, ReturnProps, SaleProps, SelectedProducts } from "@/types/types"
import { showToast } from "@/components/toast"
import { useAuth } from "@/api/auth-provider";
import { useGeneralInformation } from "@/api/general-provider";

type FormDataProps = Omit<ReturnProps, 'returnId' | 'returnDetail' | 'returnPaymentDetail'>;

export default function Return() {
  const navigate = useNavigate();
  const [sale, setSale] = useState<SaleProps>();
  const { saleId } = useParams();
  const { dollarValue = 0 } = useGeneralInformation();

  const formRef = useRef<HTMLFormElement | null>(null)

  const [quantities, setQuantities] = useState<number[]>([]);

  useEffect(() => {
    if (sale?.products) {
      setQuantities(sale.products.map(() => 0));
    }
  }, [sale]); const [productsChange, setProductsChange] = useState<SelectedProducts[]>([]);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [returnPaymentDetails, setReturnPaymentDetails] = useState<ReturnPaymentDetailProps[]>([]);
  const INITIAL_FORM_DATA: FormDataProps = {
    userId: '',
    shippingCost: 0,
    discount: 0,
    subTotal: 0,
    total: 0,
    createdAt: new Date(),
    dollarChange: 0
  }
  const [formData, setFormData] = useState<FormDataProps>(INITIAL_FORM_DATA);
  const [productsSale, setProductsSale] = useState<SelectedProducts[]>([]);
  const [saleCode, setSaleCode] = useState<string>("");
  useEffect(() => {
    if (sale) {
      setProductsSale(sale.products.map((product) => ({
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
        reason: product.reason,
      })));
      setSaleCode(sale.salesCode || "");
      setQuantities(sale.products.map(() => 0));
      setReturnReasons(sale.products.map(() => ""));
    }
  }, [sale]);

  const [isModalOpen, setIsModalOpen] = useState({ products: false, shippingCost: false });
  const handleChangeShowModal = (name: keyof typeof isModalOpen, value: boolean) => {
    setIsModalOpen((prev) => ({ ...prev, [name]: value }));
  }
  const [returnReasons, setReturnReasons] = useState(productsSale.map(() => ""));
  const { user } = useAuth();

  useEffect(() => {
    const handleLoadSaleById = async () => {
      const { data } = await supabase.from('getsales').select('*').eq('saleId', saleId);
      setSale(data?.[0] as SaleProps);
    }

    if (saleId) handleLoadSaleById();
  }, [saleId]);

  useEffect(() => {

    setFormData((prev) => ({
      ...prev,
      userId: user.id
    }));
  }, [user]);

  const handleFormSubmit = async () => {
    if (pendingAmount > 0) {
      showToast("Saldo pendiente", false);
      return;
    }

    try {
      const productsToReturn = productsSale
        .map((p: any, index: number) => ({
          ...p,
          quantity: quantities?.[index],
          reason: returnReasons[index] || ''
        }))
        .filter((p: any) => p.quantity > 0); // solo los productos seleccionados para devolución

      if (productsToReturn.length === 0 ) {
        showToast("Debe seleccionar al menos un producto para devolución ", false);
        return;
      }

      const returnDetails = [
        ...productsToReturn.map((p: any) => ({
          productSupplierId: p.productSupplierId.split('/')[0],
          productPrice: p.price,
          quantity: p.quantity,
          subTotal: Number(p.price) * Number(p.quantity),
          discount: Number(p.discount ?? 0),
          total: Number(p.quantity) * (Number(p.price) - Number(p.discount ?? 0)),
          reason: p.reason || '', // Asegúrate de capturar esta razón
          type: false, // devolución
          storeHouseId: p.storeHouseId
        })),
        ...productsChange.map((p) => ({
          productSupplierId: p.productSupplierId.split('/')[0],
          productPrice: p.price,
          quantity: p.quantity,
          subTotal: Number(p.price) * Number(p.quantity),
          discount: Number(p.discount ?? 0),
          total: Number(p.quantity) * (Number(p.price) - Number(p.discount ?? 0)),
          reason: p.reason || '',
          type: true, // cambio
          storeHouseId: p.storeHouseId
        }))
      ];

      const paymentDetails = returnPaymentDetails.map(p => ({
        amount: Number(p.amount),
        reference: p.reference,
        bankId: p.bankId,
        currencyId: p.currencyId,
        paymentMethodId: p.paymentMethodId
      }));

      const { error } = await supabase.rpc('submitreturn', {
        p_user_id: formData.userId,
        p_sale_id: saleId,
        p_shipping_cost: formData.shippingCost,
        p_discount: formData.discount,
        p_sub_total: formData.subTotal,
        p_total: Number(formData.total),
        p_return_details: returnDetails,
        p_payment_details: paymentDetails,
        p_dollar_change: dollarValue ?? 0
      });

      if (error) {
        showToast(error.message, false);
      } else {
        showToast("Devolución registrada exitosamente", true);
        navigate(`/sales/add/${saleId}`);
      }
    } catch (err) {
      showToast("Error inesperado al guardar la devolución", false);
    }
  };

  return (
    <Container  onSaveClick={handleFormSubmit}>
      <section className="flex flex-col items-center h-full flex-1">
        <div className="max-w-screen-lg mt-2 w-full mx-auto flex-1 flex flex-col">
          <SubHeader
            secondChildren={
              <span className="flex items-center gap-1">
                <span className="text-[19px] font-semibold text-secondary/80">{saleCode}</span>
                <ArrowRightIcon className="size-4 text-secondary/80" />
                <span className="text-[20px] font-semibold text-primary/80">Devolución y cambio</span>
              </span>
            }
            backUrl={`/sales/add/${saleId}`}
          ></SubHeader>
          <main className="flex flex-1 flex-col xl:flex-row items-start w-full">
            <form
              ref={formRef}
              onSubmit={handleFormSubmit}
              className="flex flex-1 xl:space-x-6 flex-col xl:flex-row items-start w-full"
            >
              <div className="flex-1 xl:w-auto w-full space-y-4">
                <ReturnProducts saleCode={saleCode} productsSales={productsSale} quantities={quantities ?? []} setQuantities={setQuantities} returnReasons={returnReasons ?? []} setReturnReasons={setReturnReasons} />
                <ReturnChangeProducts isModalOpen={isModalOpen} handleChangeShowModal={handleChangeShowModal} productsChange={productsChange} setProductsChange={setProductsChange} />
              </div>

              <div className="w-full xl:w-1/3 space-y-4">
                <ReturnSummary
                  productsSale={productsSale}
                  quantities={quantities ?? []}
                  isModalOpen={isModalOpen}
                  handleChangeShowModal={handleChangeShowModal}
                  productsChange={productsChange}
                  returnPaymentDetails={returnPaymentDetails}
                  setReturnPaymentDetails={setReturnPaymentDetails}
                  setPendingAmount={setPendingAmount}
                  handleFormSubmit={handleFormSubmit}
                  setFormData={setFormData}
                  formData={formData}
                  sale={sale}
                />
              </div>
            </form>
          </main>
        </div>
      </section>
    </Container>
  )
}