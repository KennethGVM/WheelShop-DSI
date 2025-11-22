import ToolTip from "@/components/tool-tip";
import { CustomersIcon, GeneralIcon, ReturnIcon } from "@/icons/icons";
import FormSection from "@/layout/form-section";
import { currencyFormatter } from "@/lib/function";
import { ReturnProps } from "@/types/types";


interface ReturnShowProductsProps {
  returns: ReturnProps[];
  saleCode: string;
}

export default function ReturnShowProducts({ returns, saleCode }: ReturnShowProductsProps) {
  return (
    <FormSection>
      <>
        <div className="flex items-center gap-2 mb-4  md:ml-0">
          <div className="inline-flex items-center gap-1 bg-[#affebf] text-[#014b40] px-2 py-0.5 rounded-lg">
            <ReturnIcon className="size-4 stroke-none fill-current" />
            <p className="md:text-2xs text-base font-medium">
              Devolución cerrada ({returns[0].returnDetail
                .filter(item => item.type === false)
                .reduce((sum, item) => sum + item.quantity, 0)})
            </p>
          </div>
          <p className="md:text-2xs text-base font-medium text-primary">
            {saleCode}-R1
          </p>
        </div>
        <div className="border border-gray-300 rounded-lg p-4 mt-4">
          <div className="space-y-4">
            {returns[0].returnDetail
              .filter(item => !item.type) // <--- Solo productos con type === true
              .map((item, index) => (<div key={index} className="border-b border-gray-300 pb-4 last:border-b-0 last:pb-0">
                {/* Product Header */}
                <div className="flex justify-between items-start mb-3 md:text-2xs text-base">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mr-7">
                      <span className="md:text-2xs text-base font-medium text-primary mb-1">{item.productName}</span>
                      <div
                        className="flex items-center justify-center px-2.5 py-1 mb-2 rounded-full bg-[#F3F3F3] cursor-pointer"
                        data-tooltip-id={`storeHouses-${index}`}
                      >
                        <GeneralIcon className="size-4 fill-secondary/80 stroke-none" />
                      </div>
                      <ToolTip id={`storeHouses-${index}`} title={item.storeHouseName} />
                      <div
                        className="flex items-center justify-center px-2.5 py-1 mb-2 rounded-full bg-[#F3F3F3] cursor-pointer"
                        data-tooltip-id={`nameSuppliers-${index}`}
                      >
                        <CustomersIcon className="size-4  fill-secondary/80 stroke-none" />
                      </div>
                      <ToolTip id={`nameSuppliers-${index}`} title={item.supplierName || "Sin proveedor"} />
                    </div>                      </div>
                  <div className="text-right ">
                    <div className="flex items-center gap-2 md:text-2xs text-base ">
                      <span className="font-medium">{currencyFormatter(item.productPrice - item.discount)}</span>
                      <span className="text-secondary/80">×</span>
                      <span className="text-secondary/80">{item.quantity}</span>
                      <span className="font-medium ml-2">{currencyFormatter(item.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Return Details */}
                <div className="space-y-1 md:text-2xs text-base">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="font-medium text-gray-900">Devuelto</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5"></div>
                    <span className=" text-gray-700">
                      <span className="font-medium">Motivo de la devolución:</span> {item.reason || "No especificado"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className=" text-gray-700">Reembolsado</span>
                  </div>
                </div>
              </div>
              ))}
          </div>
        </div>
      </>
    </FormSection>
  )
}