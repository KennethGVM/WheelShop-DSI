import CheckBox from "@/components/form/check-box";
import StatusTags from "@/components/status-tags";
import { currencyFormatter } from "@/lib/function";
import { DiscountProps, TYPEDISCOUNTS } from "@/types/types"
import { Dispatch, SetStateAction } from "react";

interface DiscountTableRowProps {
  discounts: DiscountProps[];
  discount: DiscountProps
  selectedDiscountIds: DiscountProps[];
  handleEditDiscount: (discountId: DiscountProps) => void;
  setSelectedDiscountIds: Dispatch<SetStateAction<DiscountProps[]>>;
  setSelectAll: Dispatch<SetStateAction<boolean>>;
  isScrolled: boolean;
}

export default function DiscountTableRow({ isScrolled, discounts, discount, handleEditDiscount, selectedDiscountIds, setSelectedDiscountIds, setSelectAll }: DiscountTableRowProps) {
  const handleSelectProduct = (discountId: DiscountProps, checked: boolean) => {
    let newSelectedIds;

    if (checked) {
      newSelectedIds = [...selectedDiscountIds, discountId];
    } else {
      newSelectedIds = selectedDiscountIds.filter((disc) => disc.discountId !== discount.discountId);
    }

    setSelectedDiscountIds(newSelectedIds);

    if (newSelectedIds.length !== discounts.length) {
      setSelectAll(false);
    } else if (newSelectedIds.length === discounts.length) {
      setSelectAll(true);
    }
  };

  const getDiscountStatusText = (start: Date, end: Date | null) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('es-NI', {
        day: 'numeric',
        month: 'long',
      }).format(date);
    };

    const isSameDay = (a: Date, b: Date) =>
      a.toDateString() === b.toDateString();

    if (endDate && isSameDay(startDate, endDate)) {
      return `Activo el ${formatDate(startDate)}`;
    }

    if (isSameDay(startDate, now) && !endDate) {
      return 'Activo hoy';
    }

    if (isSameDay(startDate, now) && endDate) {
      return `Activo hoy hasta ${formatDate(endDate)}`;
    }

    if (!isSameDay(startDate, now) && endDate) {
      return `Activo el ${formatDate(startDate)} hasta ${formatDate(endDate)}`;
    }

    return `Activo el ${formatDate(startDate)}`;
  };

  return (
    <tr
      key={discount.discountId}
      onClick={() => {
        handleEditDiscount(discount);
      }}
      className={`${selectedDiscountIds.includes(discount) ? 'bg-whiting2' : 'bg-white'} group cursor-pointer text-2xs font-medium ${discount !== discounts[discounts.length - 1] ? 'border-b' : ''} text-secondary/80 border-gray-300 hover:bg-[#F7F7F7]`}
    >
      <td
        className={`px-2 py-2 md:w-auto w-[40%] sticky inset-y-0 h-full left-0 z-10 bg-white group-hover:bg-[#F7F7F7]
          before:content-[''] before:absolute before:top-0 before:right-0
          before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity
          ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative ${selectedDiscountIds.includes(discount) ? 'bg-whiting2' : 'bg-white'}`}
      >
        <div className="flex items-center space-x-2">
          <CheckBox
            initialValue={selectedDiscountIds.includes(discount)}
            onChange={(value) => handleSelectProduct(discount, value)}
          />
          <div className="flex flex-col space-y-1 ">
            <span className="font-semibold text-primary">{discount.title}</span>
            <span className="">{discount.isPercentage ? discount.amount : currencyFormatter(discount.amount)}{discount.isPercentage && '%'} de descuento en {discount.products.length} productos • {discount.typeRequirement === 0 ? 'Sin requisitos minimos' : discount.typeRequirement === 1 ? `Monto mínimo de compra: ${currencyFormatter(discount.minimumPurchase ?? 0)}` : `Cantidad mínima de artículos: ${discount.minimumProduct}`}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-2">
        <StatusTags status={discount.state} text={discount.state ? 'Activo' : 'Inactivo'} />
      </td>
      <td className="px-6 py-2">Automatico</td>
      <td className="px-6 py-2">{discount.typeDiscount === 0 ? TYPEDISCOUNTS.ProductAmount : discount.typeDiscount === 1 ? TYPEDISCOUNTS.BuyXGetY : TYPEDISCOUNTS.OrderAmount}</td>

      <td className="px-6 py-2">{getDiscountStatusText(discount.startDate, discount.endDate)}</td>
      <td className="px-6 py-2 text-right">{discount.uses}</td>

    </tr>
  )
}
