import { useRolePermission } from "@/api/permissions-provider";
import CheckBox from "@/components/form/check-box";
import StatusTags from "@/components/status-tags";
import { currencyFormatter, getPermissions } from "@/lib/function";
import { PurchaseProps } from "@/types/types"

interface PurchaseTableRowProps {
  isScrolled: boolean;
  purchases: PurchaseProps[];
  purchase: PurchaseProps
  selectedPurchaseIds: PurchaseProps[];
  handleEditPurchase: (purchaseId: PurchaseProps) => void;
  handleSelectPurchase: (purchaseId: PurchaseProps, checked: boolean) => void;
}

export default function PurchaseTableRow({ handleSelectPurchase, isScrolled, purchases, purchase, handleEditPurchase, selectedPurchaseIds }: PurchaseTableRowProps) {
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canEditPurchase = getPermissions(permissions, 'Ordenes de compras', 'Editar ordenes de compra')?.canAccess;

  return (
    <tr
      key={purchase.purchaseOrderId}
      onDoubleClick={() => canEditPurchase && handleEditPurchase(purchase)}
      className={`${selectedPurchaseIds.includes(purchase) ? 'bg-whiting2' : 'bg-white'} group cursor-pointer text-2xs font-medium ${purchase !== purchases[purchases.length - 1] ? 'border-b' : ''} text-secondary/80 border-gray-300 hover:bg-[#F7F7F7]`}
    >
      <td
        className={`px-2 py-4 md:w-auto w-[20%] sticky inset-y-0 h-full left-0 z-10 bg-white group-hover:bg-[#F7F7F7]
          before:content-[''] before:absolute before:top-0 before:right-0
          before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity
          ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative ${selectedPurchaseIds.includes(purchase) ? 'bg-whiting2' : 'bg-white'}`}
      >
        <div className="flex items-center space-x-2">
          <CheckBox
            initialValue={selectedPurchaseIds.includes(purchase)}
            onChange={(value) => handleSelectPurchase(purchase, value)}
          />
          <div className="flex flex-col space-y-1">
            <span className="font-semibold text-primary">{purchase.codePurchaseOrder}</span>
            <span>{purchase.referenceNumber}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-2">{purchase.nameSupplier}</td>
      <td className="px-6 py-2">{purchase.namestorehouse}</td>
      <td className="px-6 py-2">
        <StatusTags status={purchase.purchaseType === 0 ? true : false} text={purchase.purchaseType === 0 ? 'Contado' : purchase.purchaseType === 1 ? 'Credito' : 'Pagado'} color={purchase.purchaseType === 0 ? 'bg-[#affebf]' : purchase.purchaseType === 1 ? 'bg-[#ffabab]' : 'bg-[#e9e9e9]'} textColor={purchase.purchaseType === 0 ? 'text-[#014b40]' : purchase.purchaseType === 1 ? 'text-[#d10000]' : 'text-[#656161]'} />
      </td>
      <td className="px-6 py-2">
        <StatusTags status={purchase.state === 0 ? true : false} text={purchase.state === 0 ? 'Borrador' : purchase.state === 1 ? 'Comprado' : purchase.state === 2 ? 'Recibido' : 'Cerrado'} color={purchase.state === 0 ? 'bg-[#ffd6a4]' : purchase.state === 1 ? 'bg-[#d5ebff]' : 'bg-[#e9e9e9]'} textColor={purchase.state === 0 ? 'text-[#5E4200]' : purchase.state === 1 ? 'text-[#003A5A]' : 'text-[#656161]'} />
      </td>
      <td className="px-6 py-2 text-right">{currencyFormatter(purchase.discount, purchase.currencyName === 'Cordobas' ? 'NIO' : 'USD')}</td>
      <td className="px-6 py-2 text-right">{currencyFormatter(purchase.total, purchase.currencyName === 'Cordobas' ? 'NIO' : 'USD')}</td>
      <td className="px-6 py-2">
        {purchase.arrivalDate ? new Date(purchase.arrivalDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : ''}
      </td>
    </tr>
  )
}
