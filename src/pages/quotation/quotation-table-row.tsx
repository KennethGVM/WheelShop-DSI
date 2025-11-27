import CheckBox from "@/components/form/check-box";
import { Dropdown, DropdownContent, DropdownTrigger } from "@/components/form/dropdown";
import StatusTags from "@/components/status-tags";
import { ArrowDownIcon, GeneralIcon } from "@/icons/icons";
import { currencyFormatter } from "@/lib/function";
import { newProduct, QuotationProductProps, QuotationProps } from "@/types/types"

interface QuotationTableRowProps {
  quotations: QuotationProps[];
  quotation: QuotationProps
  selectedQuotationIds: string[];
  handleViewQuotation: (quotationId: string) => void;
  isScrolled: boolean;
  handleSelectQuotation: (saleId: string, checked: boolean) => void;
  groupProductsByStorehouse: (products: QuotationProductProps[] , newProducts: newProduct[]) => { storeHouse: string; items: { productName: string; quantity: number; }[]; }[];
}

export default function QuotationTableRow({
  groupProductsByStorehouse,
  handleSelectQuotation,
  isScrolled,
  quotations,
  quotation,
  selectedQuotationIds,
  handleViewQuotation
}: QuotationTableRowProps) {

  // Productos y productos personalizados de esta cotización
  const products = quotation.products ?? [];
  const newProducts = quotation.newProducts ?? [];

  // Total de artículos sumando ambos arrays
  const totalProductCount =
    products.reduce((acc, p) => acc + (p.quantity || 0), 0) +
    newProducts.reduce((acc, p) => acc + (p.quantity || 0), 0);

  // Mostrar dropdown si hay productos normales o personalizados
  const hasProducts = products.length > 0 || newProducts.length > 0;

  return (
    <>
      <tr
        onDoubleClick={() => handleViewQuotation(quotation.quotationId)}
        className={`${selectedQuotationIds.includes(quotation.quotationId) ? 'bg-whiting2' : 'bg-white'} cursor-pointer text-2xs font-medium ${quotation !== quotations[quotations.length - 1] ? 'border-b' : ''} text-secondary/80 border-gray-300 group hover:bg-[#F7F7F7]`}
      >
        <td
          className={`px-2 py-4 sticky inset-y-0 h-full left-0 z-10 bg-white group-hover:bg-[#F7F7F7]
          before:content-[''] before:absolute before:top-0 before:right-0
          before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity
          ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative ${selectedQuotationIds.includes(quotation.quotationId) ? 'bg-whiting2' : 'bg-white'}`}
        >
          <div className="flex items-center space-x-2">
            <CheckBox
              initialValue={selectedQuotationIds.includes(quotation.quotationId)}
              onChange={(value) => handleSelectQuotation(quotation.quotationId, value)}
            />
            <span className="font-semibold text-primary">{quotation.quotationCode}</span>
          </div>
        </td>
        <td className="py-4 px-2">
          {quotation.state === true ? (
            <StatusTags
              status={true}
              text="Completada"
              color="bg-[#affebf]"
              textColor="text-[#014b40]"
            />
          ) : (
            <StatusTags
              status={false}
              text="Pendiente"
              color="bg-[#ffabab]"
              textColor="text-[#d10000]"
            />
          )}
        </td>

        <td className="py-4 px-4">{quotation.createdAt ? new Date(quotation.createdAt).toLocaleString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).replace('.', '') : ''} </td>
        <td className="py-4 px-4">{quotation.user}</td>
        <td className="py-4 px-4">{quotation.customerName + ' ' + quotation.customerLastName}</td>
        <td className="py-4 px-4 text-right">{currencyFormatter(quotation.total)}</td>
        <td className="py-4 px-4 text-left text-secondary/80">
          <Dropdown>
            <DropdownTrigger>
              <button className="flex items-center space-x-1">
                {/* Aquí el contador suma productos normales + personalizados */}
                <span>{totalProductCount} artículo{totalProductCount === 1 ? '' : 's'}</span>
                <ArrowDownIcon className="size-4 stroke-none fill-secondary/80" />
              </button>
            </DropdownTrigger>

            {hasProducts && (
              <DropdownContent align="end" className="rounded-2xl w-[300px] p-2 space-y-2">
                {groupProductsByStorehouse(products, newProducts).map((group, index) => (
                  <div key={index} className="rounded-xl border bg-muted p-3">
                    <div className="flex items-center gap-2 md:text-2xs text-base px-2.5 py-1 rounded-full bg-[#F3F3F3]">
                      <GeneralIcon className="size-4 fill-secondary/80 stroke-none" />
                      {group.storeHouse}
                    </div>
                    {group.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center justify-between rounded-lg bg-background p-2 shadow-sm mb-1"
                      >
                        <div className="flex items-center space-x-2">
                          <div>
                            <div className="md:text-2xs text-base">{item.productName}</div>
                          </div>
                        </div>
                        <span className="md:text-2xs text-base">x {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </DropdownContent>
            )}
          </Dropdown>
        </td>
        <td className="py-4 px-4">{quotation.shippingCost === 0 ? 'Local' : 'Envío'}</td>
      </tr >
    </>
  )
}