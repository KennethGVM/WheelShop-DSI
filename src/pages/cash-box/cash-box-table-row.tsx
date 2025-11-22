import CheckBox from "@/components/form/check-box";
import StatusTags from "@/components/status-tags";
import { CashBoxProps } from "@/types/types"

interface CashBoxTableRowProps {
  cashBoxes: CashBoxProps[];
  cashBox: CashBoxProps
  selectedCashBoxesIds: CashBoxProps[];
  isScrolled: boolean;
  handleSelectCashBoxes: (cashBoxId: CashBoxProps, checked: boolean) => void;
}

export default function CashBoxTableRow({ handleSelectCashBoxes, isScrolled, cashBox, cashBoxes, selectedCashBoxesIds }: CashBoxTableRowProps) {
  return (
    <tr
      key={cashBox.cashBoxId}
      className={`${selectedCashBoxesIds.includes(cashBox) ? 'bg-whiting2' : 'bg-white'} group cursor-pointer text-2xs font-medium ${cashBox !== cashBoxes[cashBoxes.length - 1] ? 'border-b' : ''} text-secondary/80 border-gray-300 hover:bg-[#F7F7F7]`}
    >
      <td
        className={`px-2 py-4 md:w-auto w-[20%] sticky inset-y-0 h-full left-0 z-10 bg-white group-hover:bg-[#F7F7F7]
          before:content-[''] before:absolute before:top-0 before:right-0
          before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity
          ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative ${selectedCashBoxesIds.includes(cashBox) ? 'bg-whiting2' : 'bg-white'}`}
      >
        <div className="flex items-center space-x-2">
          <CheckBox
            initialValue={selectedCashBoxesIds.includes(cashBox)}
            onChange={(value) => handleSelectCashBoxes(cashBox, value)}
          />
          <span>{cashBox.name}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <StatusTags status={cashBox.isOpen} text={cashBox.isOpen ? 'Abierta' : 'Cerrada'} />
      </td>
      <td className="px-6 py-4">
        <StatusTags status={cashBox.state} text={cashBox.state ? 'Activo' : 'Inactivo'} />
      </td>
      <td className="px-6 py-4">
        {cashBox.createdAt ? new Date(cashBox.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : ''}
      </td>
    </tr>
  )
}
