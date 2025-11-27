import FormSection from "@/layout/form-section";
import { CurrencyProps, ReturnProps, salePaymentDetailProps, SaleProps, SelectedProducts } from "@/types/types";
import { currencyFormatter, getPermissions } from "@/lib/function";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Modal from "@/components/modal";
import FieldSelect from "@/components/form/field-select";
import FieldInput from "@/components/form/field-input";
import { showToast } from "@/components/toast";
import AddSalePaymentCredit from "./add-sale-payment-credit";
import AddSalePaymentSystem from "./add-sale-payment-system";
import { ClockIcon, PaidIcon, ReturnPaidIcon } from "@/icons/icons";
import { useRolePermission } from "@/api/permissions-provider";

interface AddSalePaymentProps {
  products: SelectedProducts[];
  formData: Omit<SaleProps, 'saleId' | 'salesCode' | 'products' | 'salePaymentDetails' | 'return'>;
  setFormData: Dispatch<SetStateAction<Omit<SaleProps, 'saleId' | 'salesCode' | 'products' | 'salePaymentDetails' | 'return'>>>;
  isModalOpen: { discount: boolean; shippingCost: boolean, sendInvoice: boolean };
  handleChangeShowModal: (name: 'discount' | 'shippingCost' | 'sendInvoice', value: boolean) => void;
  saleId?: string;
  setPendingAmount?: (amount: number) => void;
  salePaymentDetails: salePaymentDetailProps[];
  setSalePaymentDetails: Dispatch<SetStateAction<salePaymentDetailProps[]>>;
  isQuotation: boolean;
  returns: ReturnProps[];
  saleCode: string;
  isAllowToSale: boolean;
}

export default function AddSalePayment({ products, formData, setFormData, isModalOpen, handleChangeShowModal, saleId, setPendingAmount, salePaymentDetails, setSalePaymentDetails, isQuotation, returns, saleCode, isAllowToSale }: AddSalePaymentProps) {
  const [quantity, setQuantity] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [isDiscountApplied, setIsDiscountApplied] = useState<boolean>(false);
  const [isShippingCostApplied, setIsShippingCostApplied] = useState<boolean>(false);
  const [tempShippingCost, setTempShippingCost] = useState<number>(0);
  const [buttonDelete, setButtonDelete] = useState<boolean>(false);
  const [buttonDeleteSC, setButtonDeleteSC] = useState<boolean>(false);
  const [totalPaid, setTotalPaid] = useState(0)
  const [pending, setPendig] = useState(0)
  const [changeAmount, setChangeAmount] = useState(0)
  const [showPaymentSection, setShowPaymentSection] = useState(false);


  const [totalReturned, setTotalReturned] = useState(0);


  const hasChangedProducts = returns.some(ret =>
    ret.returnDetail.some(detail => detail.type === true)
  );

  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canDiscountSale = getPermissions(permissions, "Pedidos", "Aplicar descuentos")?.canAccess;
  const [currencies, setCurrencies] = useState<CurrencyProps[]>([]);


  const handleApplyDiscount = () => {
    if (discountValue <= 0) {
      showToast("El descuento debe ser mayor que 0", false);
      return;
    }

    if (discountType === "percentage") {
      if (discountValue > 100) {
        showToast("El porcentaje no puede ser mayor a 100%", false);
        return;
      }

      const calculatedDiscount = (formData.total * discountValue) / 100;

      setFormData((prev) => ({
        ...prev,
        discount: calculatedDiscount,
      }));
    } else {
      if (discountValue >= formData.total) {
        showToast("El descuento no puede ser mayor o igual al total", false);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        discount: discountValue,
      }));
    }

    setIsDiscountApplied(true);
    handleChangeShowModal("discount", false);
    setButtonDelete(true);
  };



  useEffect(() => {
    if (formData.shippingCost && formData.shippingCost > 0) {
      setShippingCost(formData.shippingCost);
      setTempShippingCost(formData.shippingCost);
      setIsShippingCostApplied(true);
    }
  }, [formData.shippingCost]);

  const handleApplyShippingCost = () => {
    if (tempShippingCost <= 0) {
      showToast("El costo de envío debe ser mayor que 0", false);
      return;
    }
    setShippingCost(tempShippingCost);
    setIsShippingCostApplied(true);
    handleChangeShowModal("shippingCost", false);
    setButtonDeleteSC(true);

  };

  const handleDeleteDiscount = () => {
    setDiscountValue(0);
    setIsDiscountApplied(false);
    setFormData((prev) => ({
      ...prev,
      discount: 0, // 👈 se asegura de eliminar el descuento aplicado
    }));
    handleChangeShowModal("discount", false)
    setButtonDelete(false);
  };

  const handleDeleteShipping = () => {
    setShippingCost(0);
    setTempShippingCost(0);
    handleChangeShowModal("shippingCost", false);
    setButtonDeleteSC(false);
  };

  useEffect(() => {
    let newSubtotal = 0;
    let newOriginalSubtotal = 0;
    let newQuantity = 0;

    if (products.length === 0) {
      setFormData(prev => ({
        ...prev,
        discount: 0,
        shippingCost: 0,
        total: 0,
        subTotal: 0,
      }));
      setShippingCost(0);
      setTempShippingCost(0);
      setDiscountValue(0);
      setIsShippingCostApplied(false);
      setIsDiscountApplied(!!formData.discount);
      setQuantity(0);
      return;
    }

    if (saleId && !isQuotation) {
      const totalSaleQuantity = products.reduce((acc, product) => {
        return acc + Number(product.quantity || 0);
      }, 0);

      const totalReturnQuantity = returns.flatMap(ret => ret.returnDetail || [])
        .filter(detail => detail.type === false) // devueltos
        .reduce((acc, detail) => acc + Number(detail.quantity || 0), 0);

      const totalChangeQuantity = returns.flatMap(ret => ret.returnDetail || [])
        .filter(detail => detail.type === true) // productos de cambio
        .reduce((acc, detail) => acc + Number(detail.quantity || 0), 0);

      // cantidad neta
      const finalQuantity = totalSaleQuantity - totalReturnQuantity + totalChangeQuantity;
      setQuantity(finalQuantity);
    } else {
      products.forEach(product => {
        const quantity = Number(product.quantity);
        const price = Number(product.price);
        const discount = Number(product.discount || 0);

        if (!quantity || !price) return;

        let netQuantity = quantity;

        const itemSubtotal = (price - discount) * quantity;
        newOriginalSubtotal += itemSubtotal;

        newSubtotal += (price - discount) * netQuantity;
        newQuantity += netQuantity;
      });

      let discountAmount = 0;
      if (isDiscountApplied) {
        if (discountType === 'percentage') {
          discountAmount = (newSubtotal * discountValue) / 100;
        } else {
          discountAmount = discountValue;
        }
      } else if (formData.discount && !isDiscountApplied) {
        discountAmount = formData.discount;
      }

      const finalShippingCost = isShippingCostApplied ? shippingCost : 0;
      const total = Number((newSubtotal - discountAmount + finalShippingCost).toFixed(2));


      setFormData(prev => ({
        ...prev,
        subTotal: newSubtotal,
        discount: discountAmount,
        total,
        shippingCost: finalShippingCost,
      }));

      setQuantity(newQuantity);
    }
  }, [
    products,
    discountType,
    discountValue,
    shippingCost,
    setFormData,
    isDiscountApplied,
    isShippingCostApplied,
    saleId,
    returns
  ]);


  useEffect(() => {

    const dollarChange = returns[0]?.dollarChange ?? 0;
    if (!currencies.length) return;
    const returnAmounts = returns.flatMap(ret => ret.returnPaymentDetail || []);

    const tRe = returnAmounts.reduce((sum, item) => {
      const currency = currencies.find(c => c.currencyId === item.currencyId);
      const amount = Number(item.amount || 0);

      if (!currency) return sum;

      const isDollar = currency.currencyName === "Dolares";
      const amountInCordobas = isDollar ? amount * dollarChange : amount;
      return sum + amountInCordobas;


    }, 0);
    setTotalReturned(tRe);


  }, [formData.total, totalReturned, returns, currencies]);

  const finalTotal = hasChangedProducts
    ? (formData.subTotal + (returns?.[0]?.subTotal ?? 0)) + formData.shippingCost + (returns?.[0]?.shippingCost ?? 0) - (returns?.[0]?.discount ?? 0)
    : formData.total + (returns?.[0]?.total ?? 0);
  return (
    <>
      <FormSection name={saleId ? "" : "Pago"} className="flex flex-col">
        <>
          {saleId && !isQuotation && (
            <div className="flex items-center gap-2 mb-4 ml-4 md:ml-0">
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg ${formData.typeSale === 0 && formData.state === 2 ? 'bg-[#ffd6a4]' : 'bg-[#F0F0F0]'
                  }`}
              >
                {returns.length > 0 ? (
                  <>
                    <ReturnPaidIcon className="size-4 stroke-none fill-current" />
                    <p className="md:text-2xs text-base font-normal">
                      {quantity === 0 ? 'Reembolsado' : 'Reembolsado parcialmente'}
                    </p>
                  </>
                ) : formData.typeSale === 0 && formData.state === 2 ? (
                  <>
                    <ClockIcon className="size-4 stroke-none font-semibold fill-current text-[#734d1a]" />
                    <p className="md:text-2xs text-base font-semibold text-[#734d1a]">Pendiente de pago</p>
                  </>
                ) : (
                  <>
                    <PaidIcon className="size-4 stroke-none fill-current" />
                    <p className="md:text-2xs text-base font-normal">Pagado</p>
                  </>
                )}
              </div>
            </div>
          )}
          <div className="flex-grow">
            {saleId && returns.length > 0 ? (
              <>
                <div className="bg-white border border-gray-300 p-4 rounded-xl space-y-2 text-sm">
                  <div className="text-sm space-y-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 text-secondary/80">
                      <span className="md:text-2xs text-base font-medium">Pedido original</span>
                      <span className="hidden md:block md:text-2xs text-base font-medium">
                        {new Date(formData.createdAt).toLocaleDateString("es-NI", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-right md:text-2xs text-base font-medium">
                        {currencyFormatter(formData.total)}
                      </span>
                    </div>
                    {/* Desktop view for Subtotal */}
                    <div className="hidden md:grid md:grid-cols-3 border-t border-gray-300 text-secondary/80">
                      <span className="md:text-2xs text-base font-medium mt-2">Subtotal</span>
                      <span className="md:text-2xs text-base font-medium mt-2">{quantity} articulos</span>
                      <span className="text-right md:text-2xs text-base font-medium mt-2">
                        {currencyFormatter(formData.subTotal + returns[0].subTotal)}
                      </span>
                    </div>

                    {/* Mobile view for Subtotal */}
                    <div className="block md:hidden border-t border-gray-300 text-secondary/80">
                      <span className="text-base font-medium mt-2">Subtotal</span>
                      <div className="flex justify-between text-base font-medium mt-1">
                        <span>{quantity} articulos</span>
                        <span className="text-right">{currencyFormatter(formData.subTotal + returns[0].subTotal)}</span>
                      </div>
                    </div>
                    {returns[0].discount > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 text-secondary/80">
                        <span className="md:text-2xs text-base font-medium ">Descuento</span>
                        <span className="hidden md:block md:text-2xs text-base font-medium ">Descuento personalizado</span>
                        <span className="text-right md:text-2xs text-base font-medium ">
                          -{currencyFormatter(returns[0].discount)}
                        </span>
                      </div>
                    )}
                    {formData.shippingCost > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 text-secondary/80">
                        <span className="md:text-2xs text-base font-medium ">Envio</span>
                        <span className="hidden md:block md:text-2xs text-base font-medium ">Monto aplicado</span>
                        <span className="text-right md:text-2xs text-base font-medium ">
                          {currencyFormatter(formData.shippingCost)}
                        </span>
                      </div>
                    )}
                    {returns[0].shippingCost > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 text-secondary/80">
                        <span className="md:text-2xs text-base font-medium ">Envio por devolución</span>
                        <span className="hidden md:block md:text-2xs text-base font-medium ">Monto aplicado</span>
                        <span className="text-right md:text-2xs text-base font-medium ">
                          {currencyFormatter(returns[0].shippingCost)}
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3">
                      <span className="md:text-2xs text-base font-medium">Total</span>
                      <span className="hidden md:block md:text-2xs text-base font-medium"></span>
                      <span className="text-right md:text-2xs text-base font-medium"> {currencyFormatter(finalTotal)} </span>
                    </div>
                    <div className="flex justify-between font-semibold border-t border-gray-300 py-1 text-secondary/80">
                      <span className="md:text-2xs text-base ">Pagado</span>
                      <span className="hidden md:block md:text-2xs text-base font-medium"></span>
                      <span className="text-right md:text-2xs text-base font-medium">
                        {currencyFormatter(
                          hasChangedProducts && returns[0].total > 0
                            ? formData.subTotal +
                            returns[0].subTotal +
                            formData.shippingCost +
                            returns[0].shippingCost -
                            returns[0].discount
                            : formData.total,
                        )}{" "}
                      </span>
                    </div>
                    {returns[0].total < 0 && (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-3 text-secondary/80">
                          <span className="md:text-2xs text-base font-medium">Reembolsado</span>
                          <span className="hidden md:block md:text-2xs text-base font-medium">Motivo: {saleCode}-R1</span>
                          <span className="text-right md:text-2xs text-base font-medium">
                            {currencyFormatter(returns[0].total)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3">
                          <span className="md:text-2xs text-base font-medium">Pago neto</span>
                          <span className="hidden md:block md:text-2xs text-base font-medium"></span>
                          <span className="text-right md:text-2xs text-base font-medium">
                            {currencyFormatter(formData.total + returns[0].total)}{" "}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div
                className={`bg-white border border-gray-300 md:p-4 p-2 rounded-t-xl ${products.length > 0 ? "rounded-b-xl" : ""}`}
              >
                <div className="text-sm space-y-2">
                  {/* Desktop view for Subtotal */}
                  <div className="hidden md:grid md:grid-cols-3 text-gray-500">
                    <span className="md:text-2xs text-base font-medium">Subtotal</span>
                    <span className="md:text-2xs text-base font-medium">
                      {quantity} {quantity === 1 ? "artículo" : "artículos"}
                    </span>
                    <span className="text-right md:text-2xs text-base font-medium">
                      {currencyFormatter(formData.subTotal)}
                    </span>
                  </div>

                  {/* Mobile view for Subtotal */}
                  <div className="block md:hidden text-gray-500">
                    <span className="text-base font-medium">Subtotal</span>
                    <div className="flex justify-between text-base font-medium mt-1">
                      <span>
                        {quantity} {quantity === 1 ? "artículo" : "artículos"}
                      </span>
                      <span className="text-right">{currencyFormatter(formData.subTotal)}</span>
                    </div>
                  </div>
                  <div
                    className="grid grid-cols-2 md:grid-cols-3 text-gray-500"
                    style={{
                      pointerEvents:
                        products.length === 0 || (saleId && !isQuotation) || (isQuotation && formData.stateQuotation === true)
                          ? "none"
                          : "auto",
                    }}
                  >
                    <span
                      onClick={() => canDiscountSale && handleChangeShowModal("discount", true)}
                      className={`w-fit cursor-pointer font-medium ${products.length !== 0 ? "text-blueprimary hover:underline" : "text-[#bbb]"} md:text-2xs text-base`}
                    >
                      {(saleId && !isQuotation)
                        ? "Descuento"
                        : formData.discount && formData.discount > 0
                          ? "Editar descuento"
                          : "Añadir descuento"}                    </span>
                    <span className="hidden md:block md:text-2xs text-base font-medium">
                      {formData.discount && formData.discount > 0 ? "Descuento aplicado" : "—"}
                    </span>
                    <span className="text-right md:text-2xs text-base font-medium">
                      {currencyFormatter(formData.discount ?? "0,00")}
                    </span>
                  </div>
                  <div
                    className="grid grid-cols-2 md:grid-cols-3 text-gray-500"
                    onClick={() => handleChangeShowModal("shippingCost", true)}
                    style={{
                      pointerEvents:
                        products.length === 0 || (saleId && !isQuotation) || (isQuotation && formData.stateQuotation === true)
                          ? "none"
                          : "auto",
                    }}
                  >
                    <span
                      className={`cursor-pointer font-medium w-auto ${products.length !== 0 ? "text-blueprimary hover:underline" : "text-[#bbb]"} md:text-2xs text-base`}
                    >
                      {(saleId && !isQuotation)
                        ? "Envio"
                        : formData.shippingCost && formData.shippingCost > 0
                          ? "Editar envio"
                          : "Añadir envío"}                    </span>
                    <span className="hidden md:block md:text-2xs text-base font-medium">
                      {formData.shippingCost && formData.shippingCost > 0 ? "Monto aplicado" : "—"}
                    </span>
                    <span className="text-right md:text-2xs text-base font-medium">
                      {currencyFormatter(formData.shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="md:text-2xs text-base ">{formData.state === 2 ? "Saldo" : "Total"}</span>
                    <span className="md:text-2xs text-base">{currencyFormatter(formData.total)}</span>
                  </div>
                  {!(isQuotation && formData.stateQuotation) &&
                    ((showPaymentSection && formData.typeSale === 1 && products.length > 0) ||
                      (saleId && formData.typeSale === 1 && products.length > 0)) && (
                      <>
                        <div className="flex justify-between font-semibold border-t border-gray-300 py-1">
                          <span className="md:text-2xs text-base">Total pagado</span>
                          <span className="md:text-2xs text-base">{currencyFormatter(totalPaid)}</span>
                        </div>
                        {pending > 0 && (
                          <div className="flex justify-between font-semibold">
                            <span className="md:text-2xs text-base">Saldo pendiente:</span>
                            <span
                              className={`md:text-2xs text-base font-semibold ${pending > 0 ? "text-redprimary" : "text-primary"}`}
                            >
                              {currencyFormatter(pending)}
                            </span>
                          </div>
                        )}
                        {changeAmount > 0 && (
                          <div className="flex justify-between text-green-600 font-semibold">
                            <span className="md:text-2xs text-base">Cambio:</span>
                            <span className="md:text-2xs text-base">{currencyFormatter(changeAmount)}</span>
                          </div>
                        )}
                      </>
                    )}
                </div>
                {products.length > 0 && (!(isQuotation && !formData.stateQuotation) || !(isQuotation && !saleId)) && (
                  <AddSalePaymentCredit
                    setFormData={setFormData}
                    formData={formData}
                    setShowPaymentSection={setShowPaymentSection}
                    saleId={saleId}
                    isModalOpen={isModalOpen}
                    isQuotation={isQuotation}
                    salesCode={saleCode}
                    isAllowToSale={isAllowToSale}
                  />
                )}
              </div>
            )}
            {products.length === 0 && !saleId && (
              <footer className="bg-[#F7F7F7] rounded-b-xl px-4 py-2 flex items-center space-x-0.5 border border-gray-1000000">
                <p className="text-sm text-primary/80 p-2">
                  {isQuotation
                    ? "Añade un producto para calcular el total"
                    : "Añade un producto para calcular el total y ver las opciones de pago"}
                </p>
              </footer>
            )}
          </div>
          {isModalOpen.discount && (
            <Modal classNameModal="mt-6"
              onClickSave={handleApplyDiscount}
              onClose={() => handleChangeShowModal("discount", false)}
              name="Aplicar descuento"
              showDeleteButton={buttonDelete}
              deleteButtonLabel="Eliminar descuento"
              onClickDelete={handleDeleteDiscount}
            >
              <div className="mx-4 mb-4">
                <div className="w-full flex flex-col md:flex-row md:items-center md:space-x-2 space-y-3 md:space-y-0 mb-3">
                  <FieldSelect
                    className="w-full"
                    value={discountType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setDiscountType(e.target.value as "amount" | "percentage")}
                    options={[
                      { name: "Monto (C$)", value: "amount" },
                      { name: "Porcentaje (%)", value: "percentage" },
                    ]}
                  />
                  <FieldInput
                    className="w-full"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    min={0}
                    isNumber
                  />
                 
                </div>
              </div>
            </Modal>
          )}
          {isModalOpen.shippingCost && (
            <Modal classNameModal="mt-6"
              onClickSave={handleApplyShippingCost}
              onClose={() => handleChangeShowModal("shippingCost", false)}
              name="Aplicar costo de envío"
              showDeleteButton={buttonDeleteSC}
              deleteButtonLabel="Eliminar envio"
              onClickDelete={handleDeleteShipping} >
              <div className="mx-4 mb-4">
                <div className="flex items-center mb-3">
                  <FieldInput
                    className="mb-2 w-full mr-2"
                    value={shippingCost}
                    onChange={(e) => setTempShippingCost(Number(e.target.value))}
                    min={0}
                    placeholder="Costo de envío (C$)"
                    isNumber
                    appendChild={<span className="text-sm text-gray-600 flex items-center gap-1">C$</span>}
                  />
                </div>
              </div>
            </Modal>
          )}
        </>
      </FormSection>
      {
        (
          !(isQuotation && formData.stateQuotation) &&

          !(isQuotation && !saleId) &&

          (
            (showPaymentSection && formData.typeSale === 1 && products.length > 0) ||
            ((!isQuotation && saleId) && formData.typeSale === 1 && products.length > 0)
          )
        ) && (
          <>
            {(returns.length === 0) ? (
              <AddSalePaymentSystem
                totalSale={formData.total}
                dollarChange={formData.dollarChange}
                setSalePaymentDetails={setSalePaymentDetails}
                salePaymentDetails={salePaymentDetails}
                saleId={saleId}
                setPendingAmount={setPendingAmount}
                setTotalPaid={setTotalPaid}
                setChangeAmount={setChangeAmount}
                setPending={setPendig}
                isQuotation={isQuotation}
                showPaymentSection={showPaymentSection}
                returns={returns}
                currenciesReturns={setCurrencies}
              />
            ) : null}
          </>
        )
      }
    </>
  );
}