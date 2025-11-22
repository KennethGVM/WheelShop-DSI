import CheckBox from "@/components/form/check-box";
import StatusTags from "@/components/status-tags";
import { currencyFormatter } from "@/lib/function";
import { PendingAccountProps } from "@/types/types"

interface PendingAccountTableRowProps {
  pendingAccounts: PendingAccountProps[];
  pendingAccount: PendingAccountProps
  selectedPendingAccountIds: string[];
  handleEditPendingAccount: (saleId: string) => void;
  isScrolled: boolean;
  handleSelectPendingAccount: (saleId: string, checked: boolean) => void;
}

export default function PendingAccountTableRow({ handleSelectPendingAccount, isScrolled, pendingAccounts, pendingAccount, handleEditPendingAccount, selectedPendingAccountIds }: PendingAccountTableRowProps) {
  return (
    <tr
      onDoubleClick={() => handleEditPendingAccount(pendingAccount.saleId)}
      className={`${selectedPendingAccountIds.includes(pendingAccount.saleId) ? 'bg-whiting2' : 'bg-white'} cursor-pointer text-2xs font-medium ${pendingAccount !== pendingAccounts[pendingAccounts.length - 1] ? 'border-b' : ''} text-secondary/80 border-gray-300 group hover:bg-[#F7F7F7]`}
    >
      <td
        className={`px-2 py-4 sticky inset-y-0 h-full left-0 z-10 bg-white group-hover:bg-[#F7F7F7]
      before:content-[''] before:absolute before:top-0 before:right-0
      before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity
      ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative ${selectedPendingAccountIds.includes(pendingAccount.saleId) ? 'bg-whiting2' : 'bg-white'}`}
      >
        <div className="flex items-center space-x-2">
          <CheckBox
            initialValue={selectedPendingAccountIds.includes(pendingAccount.saleId)}
            onChange={(value) => handleSelectPendingAccount(pendingAccount.saleId, value)}
          />
          <span className="text-nowrap capitalize">{pendingAccount.customerName}</span>
        </div>
      </td>
      <td className="py-4 px-4">{pendingAccount.salesCode}</td>
      <td className="py-4 px-4">{pendingAccount.createdAt ? new Date(pendingAccount.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : ''} </td>
      <td className="py-4 px-4">{pendingAccount.expirationDate ? new Date(pendingAccount.expirationDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : ''} </td>
      <td className="py-4 px-4">
        <StatusTags
          status={pendingAccount.daysPending > 0}
          text={
            pendingAccount.daysPending < 1
              ? 'Vencido'
              : pendingAccount.daysPending === 1
                ? '1 día'
                : `${pendingAccount.daysPending} días`
          }
          color={pendingAccount.daysPending > 0 ? 'bg-[#affebf]' : 'bg-[#ffabab]'}
          textColor={pendingAccount.daysPending > 0 ? 'text-[#014b40]' : 'text-[#d10000]'}
        />
      </td>
      <td className="py-4 px-4 text-right">{currencyFormatter(pendingAccount.total)}</td>
      <td className="py-4 px-4 text-right">{currencyFormatter(pendingAccount.saldo === 0 || pendingAccount.saldo === null ? pendingAccount.total : pendingAccount.saldo)}</td>
    </tr>
  )
}