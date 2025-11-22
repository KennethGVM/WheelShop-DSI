import FieldInput from "@/components/form/field-input"
import FieldSelect from "@/components/form/field-select"
import ToolTip from "@/components/tool-tip"
import { ArrowDownIcon, ArrowUpIcon, CustomersIcon, DiscountIcon, GeneralIcon, MinusIcon, PlusIcon } from "@/icons/icons"
import FormSection from "@/layout/form-section"
import { currencyFormatter } from "@/lib/function"
import { SelectedProducts } from "@/types/types"

interface ReturnProductsProps {
  productsSales: SelectedProducts[]
  saleCode?: string
  quantities: number[]
  setQuantities: React.Dispatch<React.SetStateAction<number[]>>
  returnReasons: string[]
  setReturnReasons: React.Dispatch<React.SetStateAction<string[]>>
}

export default function ReturnProducts({ productsSales, saleCode, quantities, setQuantities, returnReasons, setReturnReasons }: ReturnProductsProps) {

  const handleQuantityChange = (index: number, newValue: number, max: number) => {
    const value = Math.max(0, Math.min(newValue, max))
    setQuantities((prev: number[]) => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }

  const handleReasonChange = (index: number, reason: string) => {
    setReturnReasons((prev: string[]) => {
      const updated = [...prev]
      updated[index] = reason
      return updated
    })
  }

  return (
    <FormSection name="Selecciona los artículos para devolver">
      <>
        <div className="text-sm text-gray-600 mb-2 mt-4">
          <span className="font-semibold">{saleCode}</span>
        </div>

        <div className="space-y-4">
          {productsSales.map((product: any, index: number) => (
            <div key={index} className="border rounded-md p-4 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Info del producto */}
                <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
                  <div className="flex flex-col">
                    <div className="flex flex-wrap items-center gap-2 mr-7">
                      <span className="md:text-2xs text-base font-medium text-primary mb-1">{product.name}</span>
                      <div
                        className="flex items-center justify-center px-2.5 py-1 mb-2 rounded-full bg-[#F3F3F3] cursor-pointer"
                        data-tooltip-id={`storeHouse-${index}`}
                      >
                        <GeneralIcon className="size-4 fill-secondary/80 stroke-none" />
                      </div>
                      <ToolTip id={`storeHouse-${index}`} title={product.storeHouseName} />
                      <div
                        className="flex items-center justify-center px-2.5 py-1 mb-2 rounded-full bg-[#F3F3F3] cursor-pointer"
                        data-tooltip-id={`nameSupplier-${index}`}
                      >
                        <CustomersIcon className="size-4  fill-secondary/80 stroke-none" />
                      </div>
                      <ToolTip id={`nameSupplier-${index}`} title={product.nameSupplier || "Sin proveedor"} />
                    </div>
                    {product.discount ? (
                      <div className="flex flex-col">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-base md:text-2xs text-blueprimary font-medium">
                            {currencyFormatter(product.price - product.discount)} × {product.quantity}
                          </span>
                          <span className="text-base md:text-2xs text-secondary/80 line-through">
                            {currencyFormatter(product.price)}
                          </span>
                        </div>
                        <div className="text-xs text-secondary/80 mt-1 flex items-center gap-1">
                          <DiscountIcon className="hidden sm:inline text-[#4a4a4a] stroke-0" />
                          <span>
                            Diferencia ({product.discount < 0 ? "+" : "-"}{currencyFormatter(Math.abs(product.discount))} NIO)
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-base md:text-2xs text-secondary/80 font-medium">
                        {currencyFormatter(product.price)} × {product.quantity}
                      </span>
                    )}
                  </div>
                </div>

                {/* Control de cantidad y subtotal */}
                <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-end w-full">
                  <div className="flex items-center gap-2 md:mr-8 w-full md:w-auto">
                    <div className="relative w-full md:w-28 group">
                      <FieldInput
                        isNumber
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                          }
                        }}
                        min="0"
                        max={product.quantity}
                        value={quantities[index]}
                        onChange={(e) => {
                          const newValue = Number.parseInt(e.target.value) || 0;
                          handleQuantityChange(index, newValue, product.quantity);
                        }}
                        className="w-full"
                      />

                      {/* /cantidad más pegado en móvil */}
                      <span className="absolute top-1/2 -translate-y-1/2 md:text-2xs text-base font-medium text-secondary/80 select-none pointer-events-none pr-2 md:right-6 ml-8">
                        / {product.quantity}
                      </span>

                      {/* Botones móviles (Plus / Minus siempre visibles) */}
                      <div className="absolute top-1/2 -translate-y-1/2 flex flex-row gap-1 right-1 md:hidden">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(index, quantities[index] - 1, product.quantity)}
                          disabled={quantities[index] <= 0}
                          className="size-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <MinusIcon className="size-5 text-gray-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(index, quantities[index] + 1, product.quantity)}
                          disabled={quantities[index] >= product.quantity}
                          className="size-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <PlusIcon className="size-6 text-gray-600" />
                        </button>
                      </div>

                      {/* Botones escritorio (ArrowUp / ArrowDown solo al hacer hover) */}
                      <div className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        hidden md:flex md:flex-col gap-0.5 right-1">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(index, quantities[index] + 1, product.quantity)}
                          disabled={quantities[index] >= product.quantity}
                          className="h-3.5 w-3.5 flex items-center justify-center rounded-sm hover:bg-gray-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowUpIcon className="size-4 text-gray-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(index, quantities[index] - 1, product.quantity)}
                          disabled={quantities[index] <= 0}
                          className="h-3.5 w-3.5 flex items-center justify-center rounded-sm hover:bg-gray-200 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowDownIcon className="size-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto">
                    {/* Solo en celular: con borde, texto “Total:” y alineado a la derecha */}
                    <div className="md:hidden border border-gray-300 rounded-md p-2 flex justify-between">
                      <span className="text-base font-semibold text-secondary/80">Total:</span>
                      <span className="text-base font-medium text-primary">
                        {currencyFormatter(quantities[index] * (product.price - product.discount))}
                      </span>
                    </div>

                    {/* Solo en pantallas medianas en adelante */}
                    <div className="hidden md:block text-right">
                      <div className="text-2xs font-medium text-primary">
                        {currencyFormatter(quantities[index] * (product.price - product.discount))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Motivo de devolución */}
              {quantities[index] > 0 && (
                <div >
                  <label className="md:text-2xs text-base text-secondary/80">Motivo de la devolución</label>
                  <FieldSelect
                    value={returnReasons[index]}
                    onChange={(e) => handleReasonChange(index, e.target.value)}
                    className="w-full md:w-80 rounded-md text-sm"
                    options={[
                      { value: "", name: "Seleccionar motivo" },
                      { value: "Desconocido", name: "Desconocido" },
                      { value: "Producto defectuoso", name: "Producto defectuoso" },
                      { value: "Talla incorrecta", name: "Talla incorrecta" },
                      { value: "No cumple expectativas", name: "No cumple expectativas" },
                      { value: "Cambio de opinión", name: "Cambio de opinión" },
                    ]}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    </FormSection>
  )
}
