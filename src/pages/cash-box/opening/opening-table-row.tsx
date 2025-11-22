import Button from "@/components/form/button";
import CheckBox from "@/components/form/check-box";
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from "@/components/form/dropdown";
import StatusTags from "@/components/status-tags";
import { ArrowDownIcon } from "@/icons/icons";
import { currencyFormatter } from "@/lib/function";
import { OpeningProps } from "@/types/types"

interface OpeningTableRowProps {
  openings: OpeningProps[];
  opening: OpeningProps;
  selectedOpeningIds: OpeningProps[];
  handleEditOpening: (openingId: OpeningProps) => void;
  isScrolled: boolean;
  handleSelectOpening: (openingId: OpeningProps, checked: boolean) => void;
}

export default function OpeningTableRow({ handleSelectOpening, isScrolled, openings, opening, handleEditOpening, selectedOpeningIds }: OpeningTableRowProps) {
  return (
    <tr
      key={opening.cashBoxId}
      onDoubleClick={() => handleEditOpening(opening)}
      className={`${selectedOpeningIds.includes(opening) ? 'bg-whiting2' : 'bg-white'} cursor-pointer text-2xs font-medium group ${opening !== openings[openings.length - 1] ? 'border-b' : ''} text-secondary/80 border-gray-300 hover:bg-[#F7F7F7]`}
    >
      <td
        className={`px-2 py-2 md:w-auto w-[20%] sticky inset-y-0 h-full left-0 z-10 bg-white group-hover:bg-[#F7F7F7]
          before:content-[''] before:absolute before:top-0 before:right-0
          before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity
          ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative ${selectedOpeningIds.includes(opening) ? 'bg-whiting2' : 'bg-white'}`}
      >
        <div className="flex items-center space-x-2">
          <CheckBox
            initialValue={selectedOpeningIds.includes(opening)}
            onChange={(value) => handleSelectOpening(opening, value)}
          />
          <span>{opening.cashBoxName}</span>
        </div>
      </td>
      <td className="px-6 py-2">{opening.email}</td>
      <td className="px-6 py-2">
        <StatusTags status={opening.status} text={opening.status ? 'Abierta' : 'Cerrada'} />
      </td>
      <td className="px-6 py-2">
        {opening.openingDate
          ? new Date(opening.openingDate).toLocaleString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }).replace('.', '')
          : ''}
      </td>
      <td className="px-6 py-0 text-right">
        <Dropdown>
          <DropdownTrigger>
            <Button className="flex items-center space-x-0.5">
              <span>{currencyFormatter(opening.total)}</span>
              <ArrowDownIcon className="size-4 invisible group-hover:visible stroke-none fill-secondary/80" />
            </Button>
          </DropdownTrigger>
          <DropdownContent align="end" className="rounded-2xl">
            {Object.entries(
              opening.details.reduce((acc, detail) => {
                const { currencyName } = detail;
                if (!acc[currencyName]) acc[currencyName] = [];
                acc[currencyName].push(detail);
                return acc;
              }, {} as Record<string, typeof opening.details>)
            ).map(([currency, items], groupIndex) => (
              <div key={currency}>
                <DropdownItem className="text-xs font-semibold text-secondary/60 cursor-default hover:bg-transparent">
                  {currency}
                </DropdownItem>
                {items.map(({ denominationName, total }, index) => (
                  <div key={`${currency}-${index}`}>
                    <DropdownItem className="justify-between w-[250px] hover:bg-transparent">
                      <div className="flex items-center space-x-3">
                        <div className="size-2.5 rounded-[3px] border border-gray-400" />
                        <span>{denominationName}</span>
                      </div>
                      <span>{currencyFormatter(total)}</span>
                    </DropdownItem>
                    {index !== items.length - 1 && <DropdownSeparator />}
                  </div>
                ))}
                {groupIndex !== Object.entries(opening.details).length - 1 && <DropdownSeparator />}
              </div>
            ))}

          </DropdownContent>
        </Dropdown>
      </td>
    </tr>
  )
}
