import ToolTip from "@/components/tool-tip";
import { CustomersIcon, DiscountIcon, GeneralIcon, ShippingIcon } from "@/icons/icons";
import FormSection from "@/layout/form-section";
import { currencyFormatter } from "@/lib/function";
import { ReturnProps } from "@/types/types";

interface ReturnShowChangeProductsProps {
  returns: ReturnProps[];
  saleCode: string;
}

export default function ReturnShowChangeProducts({ returns, saleCode }: ReturnShowChangeProductsProps) {
  return (
    <FormSection name="">
      <>
        <div className="flex items-center gap-2 mb-4  md:ml-0">
          <div className="inline-flex items-center gap-1 bg-[#affebf] text-[#014b40] px-2 py-0.5 rounded-lg">
            {returns[0].shippingCost > 0 ? (
              <ShippingIcon className="size-4 stroke-none fill-current" />
            ) : (
              <GeneralIcon className="size-4 stroke-none fill-current" />
            )}
            <p className="md:text-2xs text-base font-medium">
              preparados ({returns[0].returnDetail
                .filter(item => item.type === true)
                .reduce((sum, item) => sum + item.quantity, 0)})
            </p>
          </div>
          <p className="md:text-2xs text-base font-medium text-primary">
            {saleCode}-F2
          </p>
        </div>
        <div>
          <div className="bg-white border-b border-gray-300 rounded-lg md:rounded-none px-1 md:px-0 pb-2 text-base md:text-2xs space-y-1">
            <div>
              <p className="font-medium text-primary/80">Preparado:</p>
              <p className="font-medium text-secondary">
                {new Date(returns[0].createdAt).toLocaleString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }).replace('.', '')}
              </p>
            </div>
            <div>
              <p className="font-medium text-primary/80">Forma de entrega:</p>
              <p className="font-medium text-primary">
                {returns[0].shippingCost > 0 ? "Envío" : "En tienda"}
              </p>
            </div>
          </div>

          <div className="space-y-4 mt-3 block lg:hidden">
            {returns[0].returnDetail
              .filter(item => item.type)
              .map((item, index) => (
                <div key={index} className="bg-white border-b  border-gray-300 pt-0 p-1 relative space-y-3">
                  <div className="flex flex-wrap items-center gap-2 ">
                    <span className="text-base font-medium text-primary mb-1">{item.productName}</span>
                    <div
                      className="flex items-center justify-center px-2.5 py-1 mb-2 rounded-full bg-[#F3F3F3] cursor-pointer"
                      data-tooltip-id={`storeHouseNameXS-${item.productSupplierId}`}
                    >
                      <GeneralIcon className="size-4 fill-secondary/80 stroke-none" />
                    </div>
                    <ToolTip id={`storeHouseNameXS-${item.productSupplierId}`} title={item.storeHouseName} />
                    <div
                      className="flex items-center justify-center px-2.5 py-1 mb-2 rounded-full bg-[#F3F3F3] cursor-pointer"
                      data-tooltip-id={`nameSupplierX-${index}`}
                    >
                      <CustomersIcon className="size-4 fill-secondary/80 stroke-none" />
                    </div>
                    <ToolTip id={`nameSupplierX-${index}`} title={item.supplierName || "Sin proveedor"} />
                  </div>

                  {/* Precios y cantidad */}
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-blue-600">
                          {currencyFormatter(item.productPrice - item.discount)}
                        </span>
                        {item.discount > 0 && (
                          <span className="text-base text-gray-500 line-through">
                            {currencyFormatter(item.productPrice)}
                          </span>
                        )}
                      </div>
                      {item.discount > 0 && (
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <DiscountIcon className="size-4 text-gray-600" />
                          <span>Descuento (-{currencyFormatter(item.discount)} C$)</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Total</div>
                      <div className="font-semibold text-gray-900">
                        {currencyFormatter(item.total)}
                      </div>
                    </div>

                  </div>
                  <p className="text-secondary/80 font-medium  text-sm w-[96px] text-left">
                    {`${currencyFormatter(item.productPrice - item.discount)} x ${item.quantity}`}
                  </p>
                </div>
              ))}
          </div>

          {returns[0].returnDetail
            .filter(item => item.type)
            .map((item, index) => (
                <tr key={index} className="bg-white  font-medium md:text-sm text-base  hidden lg:table-row-group ">
                  <div className="border-b  border-gray-300">
                  <td className="py-2 w-[65%] ">
                    <div className="flex flex-col w-full gap-2 ">
                      <div className="flex items-start space-x-2 ">
                        <span className="text-gray-800 font-medium text-wrap max-w-[50%]">
                          {item.productName}
                        </span>
                        <div className="flex gap-2 ">
                          <div
                            className="flex items-center justify-center px-2.5 py-1 rounded-full bg-[#F3F3F3] cursor-pointer"
                            data-tooltip-id={`storeHouseRSH-${index}`}
                          >
                            <GeneralIcon className="size-4 fill-secondary/80 stroke-none" />
                          </div>
                          <ToolTip id={`storeHouseRSH-${index}`} title={item.storeHouseName} />

                          <div
                            className="flex items-center justify-center px-2.5 py-1 rounded-full bg-[#F3F3F3] cursor-pointer"
                            data-tooltip-id={`nameSupplier-${index}`}
                          >
                            <CustomersIcon className="size-4 fill-secondary/80 stroke-none" />
                          </div>
                          <ToolTip id={`nameSupplier-${index}`} title={item.supplierName || "Sin proveedor"} />
                        </div>
                      </div>
                      {item.discount > 0 ? (
                        <div className="mt-1 flex flex-col max-w-[60%]">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-0.5 sm:gap-2">
                            <div className="text-sm font-medium text-secondary/70 cursor-not-allowed">
                              {currencyFormatter(item.productPrice - item.discount)}
                            </div>
                            <div className="text-sm text-secondary/80 line-through">
                              {currencyFormatter(item.productPrice)}
                            </div>
                          </div>
                          <div className="text-xs text-secondary/80 mt-1 flex justify-start items-center gap-1">
                            <DiscountIcon className="hidden sm:inline text-[#4a4a4a] stroke-0" />
                            <span>Descuento (-{currencyFormatter(item.discount)} C$)</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1 text-sm font-medium max-w-[60%] text-blue-600">
                          {currencyFormatter(item.productPrice)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="w-96">
                    <p className="text-secondary/80 font-medium text-sm w-[96px] text-right">
                      {`${currencyFormatter(item.productPrice - item.discount)} x ${item.quantity}`}
                    </p>
                  </td>
                  <td>
                    <p className="text-secondary/80 font-bold text-sm w-[80px] text-right">
                      {currencyFormatter(item.total)}
                    </p>
                  </td>
                  </div>
                </tr>
            ))}
        </div>
      </>
    </FormSection>
  )
}