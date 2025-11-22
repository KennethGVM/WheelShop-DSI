import CheckBox from "@/components/form/check-box";
import { TransferProps } from "@/types/types"

interface TransferTableRowProps {
  transfers: TransferProps[];
  transfer: TransferProps
  selectedTransferIds: TransferProps[];
  handleEditTransfer: (transferId: TransferProps) => void;
  isScrolled: boolean;
  handleSelectTransfer: (transferId: TransferProps, checked: boolean) => void;
}

export default function TransferTableRow({ handleSelectTransfer, isScrolled, transfer, transfers, handleEditTransfer, selectedTransferIds }: TransferTableRowProps) {
  return (
    <tr
      key={transfer.transferId}
      onDoubleClick={() => handleEditTransfer(transfer)}
      className={`${selectedTransferIds.includes(transfer) ? 'bg-whiting2' : 'bg-white'} group cursor-pointer text-2xs font-medium ${transfer !== transfers[transfers.length - 1] ? 'border-b' : ''} text-secondary/80 border-gray-300 hover:bg-[#F7F7F7]`}
    >
      <td
        className={`px-2 py-2 md:w-auto w-[20%] sticky inset-y-0 h-full left-0 z-10 bg-white group-hover:bg-[#F7F7F7]
          before:content-[''] before:absolute before:top-0 before:right-0
          before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity
          ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative ${selectedTransferIds.includes(transfer) ? 'bg-whiting2' : 'bg-white'}`}
      >
        <div className="flex items-center space-x-2">
          <CheckBox
            initialValue={selectedTransferIds.includes(transfer)}
            onChange={(value) => handleSelectTransfer(transfer, value)}
          />
          <div className="flex flex-col space-y-1">
            <span className="font-semibold text-primary">{transfer.codeTransfer}</span>
            <span>{transfer.referenceNumber}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-2">{transfer.originName}</td>
      <td className="px-6 py-2">{transfer.destinationName}</td>
      <td className="px-6 py-2">{transfer.email}</td>
      <td className="px-6 py-2">
        {transfer.createdAt ? new Date(transfer.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : ''}
      </td>
    </tr>
  )
}
