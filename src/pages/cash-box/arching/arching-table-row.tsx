import Button from "@/components/form/button";
import CheckBox from "@/components/form/check-box";
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from "@/components/form/dropdown";
import StatusTags from "@/components/status-tags";
import { ArrowDownIcon } from "@/icons/icons";
import { currencyFormatter } from "@/lib/function";
import { ArchingProps } from "@/types/types"

interface ArchingTableRowProps {
  archings: ArchingProps[];
  arching: ArchingProps;
  selectedArchingIds: ArchingProps[];
  handleEditArching: (archingId: ArchingProps) => void;
  isScrolled: boolean;
  handleSelectArching: (archingId: ArchingProps, checked: boolean) => void;
}

export default function ArchingTableRow({ handleSelectArching, isScrolled, archings, arching, handleEditArching, selectedArchingIds }: ArchingTableRowProps) {
  return (
    <tr
      key={arching.cashBoxId}
      onDoubleClick={() => handleEditArching(arching)}
      className={`${selectedArchingIds.includes(arching) ? 'bg-whiting2' : 'bg-white'} cursor-pointer text-2xs font-medium group ${arching !== archings[archings.length - 1] ? 'border-b' : ''} text-secondary/80 border-gray-300 hover:bg-[#F7F7F7]`}
    >
      <td
        className={`px-2 py-2 md:w-auto w-[20%] sticky inset-y-0 h-full left-0 z-10 bg-white group-hover:bg-[#F7F7F7]
                before:content-[''] before:absolute before:top-0 before:right-0
                before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity
                ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative ${selectedArchingIds.includes(arching) ? 'bg-whiting2' : 'bg-white'}`}
      >
        <div className="flex items-center space-x-2">
          <CheckBox
            initialValue={selectedArchingIds.includes(arching)}
            onChange={(value) => handleSelectArching(arching, value)}
          />
          <span>{arching.cashBoxName}</span>
        </div>
      </td>
      <td className="px-6 py-2">{arching.email}</td>
      <td className="px-6 py-2">
        <StatusTags status={arching.state} text={arching.state ? 'Completado' : 'Faltante'} />
      </td>
      <td className="px-6 py-2">
        {arching.archingDate ? new Date(arching.archingDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : ''}
      </td>
      <td className="px-6 py-0 text-right">
        <Dropdown>
          <DropdownTrigger>
            <Button className="flex items-center space-x-0.5">
              <span>{currencyFormatter(arching.total)}</span>
              <ArrowDownIcon className="size-4 invisible group-hover:visible stroke-none fill-secondary/80" />
            </Button>
          </DropdownTrigger>
          <DropdownContent align="end" className="rounded-2xl">
            <DropdownItem className="justify-between w-[250px] hover:bg-transparent">
              <div className="flex items-center space-x-3">
                <div className="size-2.5 rounded-[3px] border border-gray-400" />
                <span>Total denominación</span>
              </div>
              <span>{currencyFormatter(arching.totalTicket)}</span>
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem className="justify-between w-[250px] hover:bg-transparent">
              <div className="flex items-center space-x-3">
                <div className="size-2.5 rounded-[3px] border border-gray-400" />
                <span>Total tarjeta</span>
              </div>
              <span>{currencyFormatter(arching.totalBank)}</span>
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem className="justify-between w-[250px] hover:bg-transparent">
              <div className="flex items-center space-x-3">
                <div className="size-2.5 rounded-[3px] border border-gray-400" />
                <span>Total transferencia</span>
              </div>
              <span>{currencyFormatter(arching.totalTransfer)}</span>
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </td>
      <td className="px-6 py-2 text-right">{currencyFormatter(arching.systemTotal)}</td>
      <td className="px-6 py-2 text-right">{currencyFormatter(arching.diference)}</td>
    </tr>
  )
}
