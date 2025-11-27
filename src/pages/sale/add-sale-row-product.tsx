
import Button from "@/components/form/button"
import FieldInput from "@/components/form/field-input"
import Modal from "@/components/modal"
import { showToast } from "@/components/toast"
import ToolTip from "@/components/tool-tip"
import { CloseIcon, CustomersIcon, DiscountIcon, GeneralIcon, MinusIcon, PlusIcon } from "@/icons/icons"
import { currencyFormatter, getPermissions } from "@/lib/function"
import { useEffect, useState } from "react"
import { DiscountProps, ReturnProps } from "@/types/types"
import { supabase } from "@/api/supabase-client";
import { useRolePermission } from "@/api/permissions-provider"

interface SaleRowProductProps {
  index: number
  quantity: number
  price: number
  name: string
  productId: string
  productSupplierId: string
  discount: number
  storeHouseName: string
  storeHouseId: string | undefined
  handleProductChange: (index: number, field: string, value: number | string) => void
  handleDeleteProduct: (index: number) => void
  saleId?: string
  supplierId: string | undefined
  nameSupplier: string | undefined
  isMobile?: boolean
  returns: ReturnProps[]
  adjustedQuantity: number
  updateDiscountForProductId: (productId: string, discount: number) => void
  isQuotation: boolean
  stateQuotation: boolean
  total: number
  productCount: number
  onDiscountApplied: (discountId: string | null) => void;

}

export default function AddSaleRowProduct({
  index,
  price,
  name,
  productId,
  productSupplierId,
  quantity,
  discount,
  storeHouseName,
  nameSupplier,
  handleDeleteProduct,
  handleProductChange,
  saleId,
  isMobile = false,
  returns,
  adjustedQuantity,
  updateDiscountForProductId,
  isQuotation,
  stateQuotation,
  total,
  productCount,
  onDiscountApplied,
}: SaleRowProductProps) {
  const [isShowModal, setIsShowModal] = useState<boolean>(false)
  const [newPrice, setNewPrice] = useState<number | null>(null);
  const [isCustomDiscountActive, setIsCustomDiscountActive] = useState(false);
  const [originalCustomDiscount, setOriginalCustomDiscount] = useState<number | null>(null);
  const [wasCustomDiscountRemoved, setWasCustomDiscountRemoved] = useState(false);
  const [wasManualPriceSet, setWasManualPriceSet] = useState(false);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canDiscountSale = getPermissions(permissions, "Pedidos", "Aplicar descuentos")?.canAccess;

  const [discounts, setDiscounts] = useState<DiscountProps>({
    discountId: '',
    title: '',
    amount: 0,
    typeRequirement: 0,
    minimumPurchase: 0,
    minimumProduct: 0,
    startDate: new Date(),
    endDate: null,
    isOnce: false,
    state: false,
    createdAt: new Date(),
    products: [],
    isPercentage: false,
    typeDiscount: 0,
    quantity: 0,
    secondProducts: [],
    isFree: false,
    uses: 0
  })

  const isDiscountValid = false;

  useEffect(() => {
    if (saleId) return;

    const handleLoadDiscounts = async () => {
      const now = new Date();

      const { data, error } = await supabase
        .from('getdiscounts')
        .select('*')
        .filter('products', 'cs', JSON.stringify([{ productId }]));

      if (error) {
        return;
      }

      const discountData = data?.[0] as DiscountProps;
      if (!discountData) return;

      const start = new Date(discountData.startDate);
      const end = discountData.endDate ? new Date(discountData.endDate) : null;

      const isDiscountActive =
        discountData?.state === true &&
        now >= start &&
        (!end || now <= end);

      // Guardar en estado
      setDiscounts({
        discountId: discountData.discountId,
        title: discountData.title,
        amount: discountData.amount,
        typeRequirement: discountData.typeRequirement,
        minimumPurchase: discountData.minimumPurchase ?? 0,
        minimumProduct: discountData.minimumProduct ?? 0,
        startDate: discountData.startDate,
        endDate: discountData.endDate,
        isOnce: discountData.isOnce,
        state: discountData.state,
        createdAt: new Date(discountData.createdAt),
        products: discountData.products,
        isPercentage: discountData.isPercentage,
        typeDiscount: discountData.typeDiscount,
        quantity: discountData.quantity,
        secondProducts: discountData.secondProducts,
        isFree: discountData.state,
        uses: discountData.uses
      });

      if (!isDiscountActive) {
        updateDiscountForProductId(productSupplierId, 0);
        setIsCustomDiscountActive(false);
        return;
      }

      let meetsRequirement = false;
      switch (discountData.typeRequirement) {
        case 0:
          meetsRequirement = true;
          break;
        case 1:
          meetsRequirement = total >= (discountData.minimumPurchase ?? 0);
          break;
        case 2:
          meetsRequirement = productCount >= (discountData.minimumProduct ?? 0);
          break;
        default:
          meetsRequirement = false;
      }

      const matchedProduct = discountData.products.find(
        (p) => p.productId === productId
      );

      if (meetsRequirement && matchedProduct) {
        const autoDiscount = discountData.isPercentage
          ? (price * discountData.amount) / 100
          : discountData.amount;

        const finalDiscount = Math.min(autoDiscount, price);

        updateDiscountForProductId(productSupplierId, finalDiscount);
        setOriginalCustomDiscount(finalDiscount);
        setIsCustomDiscountActive(true);

        onDiscountApplied(discountData.discountId);
      } else {
        updateDiscountForProductId(productSupplierId, 0);
        setIsCustomDiscountActive(false);
        onDiscountApplied(null);

      }
    };

    handleLoadDiscounts();
  }, [saleId, price, productId, productSupplierId, total, productCount]);


  const applyDiscount = () => {
    if (isCustomDiscount) {
      showToast("No puedes cambiar el precio manualmente mientras haya un descuento automático.", false);
      return;
    }

    if (newPrice === null || newPrice <= 0) {
      showToast("El precio debe ser mayor que 0", false);
      return;
    }

    const manualDiscount = price - newPrice;
    handleProductChange(index, "discount", manualDiscount);
    setWasManualPriceSet(true);
    setIsShowModal(false);
  }

  const discountedPrice = Math.max(0, price - (discount || 0))

  const handleDeleteDiscount = () => {
    if (isCustomDiscountActive) {
      // Caso 1: tenía descuento automático
      handleProductChange(index, "discount", 0);
      setIsCustomDiscountActive(false);
      setNewPrice(null);
      setWasCustomDiscountRemoved(true);
      setWasManualPriceSet(false); // reseteamos
      showToast("Descuento eliminado. Ahora puedes ingresar un nuevo precio.", true);
    } else if (wasCustomDiscountRemoved) {
      // Restaurar descuento automático original
      handleProductChange(index, "discount", originalCustomDiscount || 0);
      setIsCustomDiscountActive(true);
      setWasCustomDiscountRemoved(false);
      setNewPrice(null);
      setWasManualPriceSet(false);
      setIsShowModal(false);
      showToast("Descuento restaurado.", true);
    } else if (wasManualPriceSet) {
      // Restaurar al precio original (sin descuento automático previo)
      handleProductChange(index, "discount", 0);
      setNewPrice(null);
      setWasManualPriceSet(false);
      setIsShowModal(false);
      showToast("Precio restaurado al original.", true);
    }
  };

  const incrementQuantity = () => {
    handleProductChange(index, "quantity", quantity + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      handleProductChange(index, "quantity", quantity - 1)
    }
  }

  const isCustomDiscount = isDiscountValid && discounts.products.some(p => p.productId === productId);

  const hasReturnForThisProduct = returns
    .flatMap((r) => r.returnDetail)
    .some((d) => d.productSupplierId === productSupplierId && d.type === false);

  if (isMobile) {
    return (
      <>
        <div className="bg-white border-b border-gray-300  p-1 relative space-y-4">
          {(!saleId || (isQuotation && !stateQuotation)) && (
            <button
              onClick={() => handleDeleteProduct(index)}
              className="absolute top-4 left-[330px] p-1 hover:bg-gray-100 rounded-full"
            >
              <CloseIcon className="size-6 text-gray-500" />
            </button>
          )}

          <div className="flex flex-wrap items-center gap-2 mr-7">
            <span className="md:text-2xs text-base font-medium text-primary mb-1">{name}</span>
            <div
              className="flex items-center justify-center px-2.5 py-1 mb-2 rounded-full bg-[#F3F3F3] cursor-pointer"
              data-tooltip-id={`storeHouseRPR-${index}`}
            >
              <GeneralIcon className="size-4 fill-secondary/80 stroke-none" />
            </div>
            <ToolTip id={`storeHouseRPR-${index}`} title={storeHouseName} />
            <div
              className="flex items-center justify-center px-2.5 py-1 mb-2 rounded-full bg-[#F3F3F3] cursor-pointer"
              data-tooltip-id={`nameSupplier-${index}`}
            >
              <CustomersIcon className="size-4  fill-secondary/80 stroke-none" />
            </div>
            <ToolTip id={`nameSupplier-${index}`} title={nameSupplier || "Sin proveedor"} />
          </div>

          <div className="flex justify-between items-center">
            {discount ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-base font-semibold ${(!saleId || (isQuotation && !stateQuotation)) ? "text-blueprimary cursor-pointer hover:underline" : "text-blueprimary"}`}
                    onClick={(canDiscountSale && !saleId || (isQuotation && !stateQuotation)) ? () => setIsShowModal(true) : undefined}
                  >
                    {currencyFormatter(discountedPrice)}
                  </span>
                  <span className="text-base text-gray-500 line-through">
                    {currencyFormatter(Number(price))}
                  </span>
                </div>

                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <DiscountIcon className="size-4 text-gray-600" />
                  <span>
                    {isCustomDiscountActive ? discounts.title : "Diferencia"} (
                    {(discount < 0 ? "+" : "-") + currencyFormatter(Math.abs(discount))} NIO)
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className={`text-base font-semibold ${(!saleId || (isQuotation && !stateQuotation)) ? "text-blueprimary cursor-pointer hover:underline" : "text-blueprimary"}`}
                  onClick={(!saleId || (isQuotation && !stateQuotation)) ? () => setIsShowModal(true) : undefined}
                >
                  {currencyFormatter(Number(price))}
                </span>

              </div>
            )}
            <div className="text-right">
              <div className="text-sm text-gray-500">Total</div>
              <div className="font-semibold text-gray-900">
                {currencyFormatter((hasReturnForThisProduct ? adjustedQuantity : quantity) * discountedPrice)}
              </div>
            </div>
          </div>
          {(!saleId || (isQuotation && !stateQuotation)) ? (
            <div className="relative w-full group">
              <input
                type="number"
                min="1"
                value={quantity}
                disabled={!!saleId}
                onChange={(e) => handleProductChange(index, "quantity", Number(e.target.value))}

                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-16 text-left text-gray-900 font-medium"
              />
              <div className="absolute top-1/2 -translate-y-1/2 flex flex-row gap-1 right-2 md:hidden">
                <button
                  type="button"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1 || !!saleId && !(isQuotation && !stateQuotation)}
                  className="size-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MinusIcon className="size-5 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={incrementQuantity}
                  disabled={!!saleId && !(isQuotation && !stateQuotation)}
                  className="size-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusIcon className="size-6 text-gray-600" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-secondary/80 font-medium  text-sm w-[96px] text-left text-nowrap">
              {`${currencyFormatter(discountedPrice)} x ${hasReturnForThisProduct ? adjustedQuantity : quantity}`}
            </p>
          )}
        </div>

        {isShowModal && (
          <Modal
            classNameModal="mt-6"
            onClickSave={applyDiscount}
            onClose={() => setIsShowModal(false)}
            name="Cambiar precio"
            showDeleteButton={isCustomDiscountActive || wasCustomDiscountRemoved || wasManualPriceSet}
            deleteButtonLabel={
              isCustomDiscountActive
                ? "Eliminar descuento"
                : (wasCustomDiscountRemoved || wasManualPriceSet)
                  ? "Restaurar"
                  : undefined
            }
            onClickDelete={handleDeleteDiscount}
          >
            <div className="mx-4 mb-4">
              <div className="flex items-center mb-3">
                <FieldInput
                  className="mb-0 mr-2 w-full"
                  name="Precio original"
                  appendChild={<span className="text-sm text-gray-600 flex items-center gap-1">C$</span>}
                  value={price}
                  min={0}
                  isNumber
                  readOnly
                />
                <FieldInput
                  className="mb-0 w-full"
                  name="Nuevo precio"
                  appendChild={<span className="text-sm text-gray-600 flex items-center gap-1">C$</span>}
                  value={newPrice !== null ? newPrice : 0}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setNewPrice(value);
                  }}
                  min={0}
                  isNumber
                  disabled={isCustomDiscountActive}
                />
              </div>
            </div>
          </Modal>
        )}
      </>
    );
  }

  return (
    <>
      <tr className="bg-white border-b font-medium text-sm border-gray-200">
        <td className="py-2 w-[65%]">
          <div className="flex flex-col w-full gap-2 ">
            <div className="flex items-start space-x-2">
              <span className="text-gray-800 font-medium text-wrap max-w-[50%]">{name}</span>

              <div className="flex gap-2">
                <div
                  className="flex items-center justify-center px-2.5 py-1 rounded-full bg-[#F3F3F3] cursor-pointer"
                  data-tooltip-id={`storeHouseRp-${index}`}
                >
                  <GeneralIcon className="size-4 fill-secondary/80 stroke-none" />
                </div>
                <ToolTip id={`storeHouseRp-${index}`} title={storeHouseName || "Sin bodega"} />

                <div
                  className="flex items-center justify-center px-2.5 py-1 rounded-full bg-[#F3F3F3] cursor-pointer"
                  data-tooltip-id={`nameSupplierRp-${index}`}
                >
                  <CustomersIcon className="size-4 fill-secondary/80 stroke-none" />
                </div>
                <ToolTip id={`nameSupplierRp-${index}`} title={nameSupplier || "Sin proveedor"} />
              </div>
            </div>

            {discount ? (
              <div className="mt-1 flex flex-col max-w-[60%]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-0.5 sm:gap-2">
                  <div
                    className={`text-sm font-medium ${(!saleId || (isQuotation && !stateQuotation)) ? "text-blueprimary cursor-pointer hover:underline" : "text-blueprimary"}`}
                    onClick={(!saleId || (isQuotation && !stateQuotation)) ? () => setIsShowModal(true) : undefined}
                  >
                    {currencyFormatter(discountedPrice)}
                  </div>
                  <div className="text-sm text-secondary/80 line-through">{currencyFormatter(Number(price))}</div>
                </div>
                <div className="text-xs text-secondary/80 mt-1 flex justify-start items-center gap-1">
                  <DiscountIcon className="hidden sm:inline text-[#4a4a4a] stroke-0" />
                  <span>
                    {isCustomDiscountActive ? discounts.title : "Diferencia"} (
                    {(discount < 0 ? "+" : "-") + currencyFormatter(Math.abs(discount))} NIO)
                  </span>
                </div>
              </div>
            ) : (
              <div
                className={`mt-1 text-sm font-medium max-w-[60%] ${(!saleId || (isQuotation && !stateQuotation)) ? "text-blueprimary cursor-pointer hover:underline" : "text-blueprimary"}`}
                onClick={(!saleId || (isQuotation && !stateQuotation)) ? () => setIsShowModal(true) : undefined}
              >
                {currencyFormatter(Number(price))}
              </div>
            )}

          </div>
        </td>
        {(!saleId || (isQuotation && !stateQuotation)) ? (
          <td className="w-96">
            <FieldInput
              isNumber
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              value={quantity}
              min={1}
              className="mb-0 w-24"
              onChange={(e) => handleProductChange(index, "quantity", Number(e.target.value))}
              type="number"
            />
          </td>
        ) : (
          <td className="px-11">
            <p className="text-secondary/80 font-medium text-sm  text-right text-nowrap">
              {`${currencyFormatter(discountedPrice)} x ${hasReturnForThisProduct ? adjustedQuantity : quantity}`}
            </p>
          </td>
        )}
        <td>
          <p className="text-secondary/80 font-bold text-sm  text-right text-nowrap">
            {currencyFormatter((hasReturnForThisProduct ? adjustedQuantity : quantity) * discountedPrice)}
          </p>
        </td>
        {(!saleId || (isQuotation && !stateQuotation)) && (
          <td>

            <Button
              onClick={() => handleDeleteProduct(index)}
              type="button"
              className="p-1.5 rounded-md hover:bg-[#f2f2f2]"
              styleButton="none"
            >
              <CloseIcon className="size-5 text-graying" />
            </Button>
          </td>
        )}

      </tr >



      {isShowModal && (
        <Modal
          classNameModal="mt-6"
          onClickSave={applyDiscount}
          onClose={() => setIsShowModal(false)}
          name="Cambiar precio"
          showDeleteButton={isCustomDiscountActive || wasCustomDiscountRemoved || wasManualPriceSet}
          deleteButtonLabel={
            isCustomDiscountActive
              ? "Eliminar descuento"
              : (wasCustomDiscountRemoved || wasManualPriceSet)
                ? "Restaurar"
                : undefined
          }
          onClickDelete={handleDeleteDiscount}
        >
          <div className="mx-4 mb-4">
            <div className="flex items-center mb-3">
              <FieldInput
                className="mb-0 mr-2 w-full"
                name="Precio original"
                appendChild={<span className="text-sm text-gray-600 flex items-center gap-1">C$</span>}
                value={price}
                min={0}
                isNumber
                readOnly
              />
              <FieldInput
                className="mb-0 w-full"
                name="Nuevo precio"
                appendChild={<span className="text-sm text-gray-600 flex items-center gap-1">C$</span>}
                value={newPrice !== null ? newPrice : 0}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setNewPrice(value);
                }}
                min={0}
                isNumber
                disabled={isCustomDiscountActive}
              />
            </div>
          </div>
        </Modal>
      )
      }
    </>
  )



}