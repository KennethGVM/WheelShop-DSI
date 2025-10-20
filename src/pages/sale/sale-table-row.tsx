import CheckBox from "@/components/form/check-box";
import { Dropdown, DropdownContent, DropdownTrigger } from "@/components/form/dropdown";
import StatusTags from "@/components/status-tags";
import { ArrowDownIcon, GeneralIcon, InformationCircleIcon } from "@/icons/icons";
import { currencyFormatter } from "@/lib/function";
import {  SaleProps } from "@/types/types"
import { groupProductsByStorehouseWithReturns } from "./sale-table-row-group-products";

interface SaleTableRowProps {
  sales: SaleProps[];
  sale: SaleProps
  selectedSaleIds: string[];
  handleEditSale: (saleId: string) => void;
  isScrolled: boolean;
  handleSelectSale: (saleId: string, checked: boolean) => void;
}

export default function SaleTableRow({ handleSelectSale, isScrolled, sales, sale, handleEditSale, selectedSaleIds }: SaleTableRowProps) {
  return (
    <tr
      onDoubleClick={() => handleEditSale(sale.saleId)}
      className={`${selectedSaleIds.includes(sale.saleId) ? 'bg-whiting2' : 'bg-white'} cursor-pointer text-2xs font-medium ${sale !== sales[sales.length - 1] ? 'border-b' : ''} text-secondary/80 border-gray-300 group hover:bg-[#F7F7F7]`}
    >
      <td
        className={`px-2 py-4 sticky inset-y-0 h-full left-0 z-10 bg-white group-hover:bg-[#F7F7F7]
      before:content-[''] before:absolute before:top-0 before:right-0
      before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity
      ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative ${selectedSaleIds.includes(sale.saleId) ? 'bg-whiting2' : 'bg-white'}`}
      >
        <div className="flex items-center space-x-2">
          <CheckBox
            initialValue={selectedSaleIds.includes(sale.saleId)}
            onChange={(value) => handleSelectSale(sale.saleId, value)}
          />
          <span className="font-semibold text-primary">  {sale?.return?.length > 0 ? `${sale.salesCode}-DEV` : sale.salesCode}</span>
        </div>
      </td>
      <td className="py-4 px-2">
        {sale.typeSale === 2 ? (
          <StatusTags
            status={true}
            text="Cotización"
            color="bg-[#d2ecf8]"
            textColor="text-[#005c84]"
          />
        ) : (
          <StatusTags
            status={sale.typeSale === 1}
            text={sale.typeSale ? 'Contado' : 'Crédito'}
            color={sale.typeSale ? 'bg-[#affebf]' : 'bg-yellow-200'}
            textColor={sale.typeSale ? 'text-[#014b40]' : 'text-yellow-800'}
          />
        )}
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          {sale.state === 3 ? (
            <StatusTags
              status={true}
              text="Borrador"
              color="bg-[#d2ecf8]"
              textColor="text-[#005c84]"
            />
          ) : (
            <StatusTags
              status={true}
              text={
                sale.state === 1
                  ? 'Pagado'
                  : sale.state === 0
                    ? 'Anulado'
                    : 'Pendiente'
              }
              color={
                sale.state === 1
                  ? 'bg-[#affebf]'
                  : sale.state === 0
                    ? 'bg-[#ffabab]'
                    : 'bg-yellow-200'
              }
              textColor={
                sale.state === 1
                  ? 'text-[#014b40]'
                  : sale.state === 0
                    ? 'text-[#d10000]'
                    : 'text-yellow-800'
              }
            />
          )}

          {sale.state === 0 && (
            <Dropdown>
              <DropdownTrigger>
                <button className="flex items-center text-xs text-red-600 hover:underline">
                  <InformationCircleIcon className="size-5 fill-red-600 stroke-none" />
                </button>
              </DropdownTrigger>
              <DropdownContent align="start" className="rounded-2xl w-[280px] p-3 space-y-2 bg-white shadow md:text-2xs text-base text-gray-800">
                <p><strong>Anulado por:</strong> {sale.cancellationUser || 'N/A'}</p>
                <p><strong>Razón:</strong> {sale.cancellationReason || 'N/A'}</p>
                <p><strong>Fecha:</strong> {sale.cancellationDate ? new Date(sale.cancellationDate).toLocaleString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }).replace('.', '')
                  : ''}</p>
              </DropdownContent>
            </Dropdown>
          )}
        </div>
      </td>
      <td className="py-4 px-4">{sale.createdAt ? new Date(sale.createdAt).toLocaleString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace('.', '') : ''} </td>
      <td className="py-4 px-4">{sale.user}</td>
      <td className="py-4 px-4">{sale.customerName + ' ' + sale.customerLastName}</td>
      <td className="py-4 px-4 text-right">{currencyFormatter((sale.return?.[0]?.total || 0) > 0 ? sale.total + (sale.return?.[0]?.total || 0) : sale.total + (sale.return?.[0]?.total || 0))}</td>
      <td className="py-4 px-4 text-left text-secondary/80">
        <Dropdown>
          <DropdownTrigger>
            <button className="flex items-center space-x-1">
              <span>{sale.productCount} artículo{sale.productCount === 1 ? '' : 's'}</span>
              <ArrowDownIcon className="size-4 stroke-none fill-secondary/80" />
            </button>
          </DropdownTrigger>

          {sale.products.length > 0 && (
            <DropdownContent align="end" className="rounded-2xl w-[300px] p-2 space-y-2">
              {groupProductsByStorehouseWithReturns(sale).length > 0 ? (
                groupProductsByStorehouseWithReturns(sale).map((group, index) => (
                  <div key={index} className="rounded-xl border bg-muted p-3">
                    <div className="flex items-center gap-2 md:text-2xs text-base  px-2.5 py-1 rounded-full bg-[#F3F3F3]">
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
                        <span className="md:text-2xs text-base ">x {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 md:text-2xs text-base  px-2.5 py-1 rounded-full bg-[#F3F3F3]">
                  <GeneralIcon className="size-4 fill-secondary/80 stroke-none" />
                  DEVUELTOS
                </div>
              )}
            </DropdownContent>
          )}
        </Dropdown>
      </td>
      <td className="py-4 px-4">{sale.shippingCost === 0 ? 'Local' : 'Envío'}</td>
    </tr >
  )
}