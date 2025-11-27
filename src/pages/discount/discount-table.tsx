import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { DiscountProps } from '@/types/types';
import { SearchIcon } from '@/icons/icons';
import { useNavigate } from 'react-router-dom';
import TableSkeleton from '../../components/table-skeleton';
import DiscountTableHeader from './discount-table-header';
import DiscountTableRow from './discount-table-row';
import { currencyFormatter } from '@/lib/function';
import StatusTags from '@/components/status-tags';

interface DiscountTableProps {
  discounts: DiscountProps[];
  setDiscounts: Dispatch<SetStateAction<DiscountProps[]>>;
  isLoading: boolean;
}

export default function DiscountTable({ discounts, setDiscounts, isLoading }: DiscountTableProps) {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedDiscountIds, setSelectedDiscountIds] = useState<DiscountProps[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      setIsScrolled(scrollContainer.scrollLeft > 0);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const HEADERS = [
    { title: "Titulo", isNumeric: false, className: 'sticky' },
    { title: "Estado", isNumeric: false },
    { title: "Metodo", isNumeric: false },
    { title: "Tipo", isNumeric: false },
    { title: "Fecha de activación", isNumeric: false },
    { title: "Usos", isNumeric: true },
  ];

  const handleEditDiscount = (discount: DiscountProps) => {
    navigate(`/discounts/add/${discount.discountId}`);
  };

  return (
    <>
      <div ref={scrollContainerRef} className='relative overflow-x-auto sm:block hidden'>
        <table className="w-full bg-white min-w-[1200px]">
          <DiscountTableHeader
            isScrolled={isScrolled}
            discounts={discounts}
            setDiscounts={setDiscounts}
            selectedDiscountIds={selectedDiscountIds}
            selectAll={selectAll}
            setSelectAll={setSelectAll}
            setSelectedDiscountIds={setSelectedDiscountIds}
            handleEditDiscount={handleEditDiscount}
            HEADERS={HEADERS}
          />
          {isLoading ? (
            <TableSkeleton columns={HEADERS.length + 1} />
          ) : (
            <tbody>
              {discounts && discounts.length > 0 ? (
                discounts.map((discount, key) => (
                  <DiscountTableRow
                    key={key}
                    handleEditDiscount={handleEditDiscount}
                    discounts={discounts}
                    discount={discount}
                    selectedDiscountIds={selectedDiscountIds}
                    setSelectedDiscountIds={setSelectedDiscountIds}
                    setSelectAll={setSelectAll}
                    isScrolled={isScrolled}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={HEADERS.length + 1} className="text-center text-secondary/80">
                    <div className='flex flex-col items-center justify-center space-y-3 py-4'>
                      <SearchIcon className='size-16 fill-[#8c9196]' />
                      <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de descuentos</p>
                      <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>

      <div className={`bg-white sm:hidden block border-gray-300 ${discounts.length > 0 ? 'border-t' : ''}`}>
        {discounts && discounts.length > 0 ? (
          discounts.map((discount, index) => (
            <div className={`flex px-4 py-2 items-center justify-between border-gray-300 ${discounts.length - 1 === index ? 'border-none' : 'border-b'}`} key={discount.discountId}>
              <div className="flex flex-col space-y-1">
                <span className="font-semibold text-base text-secondary">{discount.title}</span>
                <span className="text-secondary/80 max-w-[90%] font-medium text-2xs">{discount.isPercentage ? discount.amount : currencyFormatter(discount.amount)}{discount.isPercentage && '%'} de descuento en {discount.products.length} productos • {discount.typeRequirement === 0 ? 'Sin requisitos minimos' : discount.typeRequirement === 1 ? `Monto mínimo de compra: ${currencyFormatter(discount.minimumPurchase ?? 0)}` : `Cantidad mínima de artículos: ${discount.minimumProduct}`}</span>
              </div>

              <div className='flex flex-col space-y-1'>
                <StatusTags status={discount.state} text={discount.state ? 'Activo' : 'Inactivo'} className='px-1.5 rounded-lg py-0.5' />
                <span className='text-secondary/80 font-medium text-sm'>{discount.uses} usos</span>
              </div>
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center space-y-3 py-4'>
            <SearchIcon className='size-16 fill-[#8c9196]' />
            <p className='text-primary font-semibold text-center text-xl'>No se encontró ningún recurso de inventario</p>
            <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
          </div>
        )}
      </div>
    </>
  )
}
