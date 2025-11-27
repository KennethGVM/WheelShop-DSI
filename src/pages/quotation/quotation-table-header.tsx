import { useState } from 'react';
import Button from '@/components/form/button';
import CheckBox from '@/components/form/check-box';
import { QuotationProps } from '@/types/types';
import QuotationBill from './quotation-bill';

interface HeaderProps {
  title: string;
  isNumeric: boolean;
}

interface QuotationTableHeaderProps {
  quotations: QuotationProps[];
  selectedQuotationIds: string[];
  selectAll: boolean;
  handleSelectAll: (checked: boolean) => void;
  handleViewQuotation: (quotationId: string) => void;
  isScrolled: boolean;
  HEADERS: HeaderProps[];
}

export default function QuotationTableHeader({
  handleSelectAll,
  isScrolled,
  quotations,
  selectedQuotationIds,
  selectAll,
  HEADERS,
  handleViewQuotation
}: QuotationTableHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState({ quotationBill: false });

  const handleChangeShowModal = (name: keyof typeof isModalOpen, value: boolean) => {
    setIsModalOpen(prev => ({ ...prev, [name]: value }));
  };

  const selected = quotations.find(q => q.quotationId === selectedQuotationIds[0]);

  return (
    <>
      <thead className="text-2xs text-secondary/80 bg-[#f7f7f7] border-y border-gray-300">
        {quotations.length > 0 && (
          <tr className={`${selectedQuotationIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} relative`}>
            <th
              className={`px-2 py-2 sticky inset-y-0 h-full left-0 z-10 ${selectedQuotationIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} before:content-[''] before:absolute before:top-0 before:right-0 before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative px-2 py-2.5`}
            >
              <div className="flex items-center space-x-2">
                <CheckBox initialValue={selectAll} onChange={value => handleSelectAll(value)} />
                <div className="absolute left-8 inset-y-2 flex items-center pl-2">
                  {selectedQuotationIds.length > 0 && (
                    <span className="text-secondary/80 text-xs font-semibold">
                      Seleccionados: {selectedQuotationIds.length}
                    </span>
                  )}
                </div>
                <span
                  className={`text-secondary/80 font-semibold text-xs ${selectedQuotationIds.length === 0 ? 'visible' : 'invisible'
                    }`}
                >
                  {HEADERS[0].title}
                </span>
              </div>
            </th>

            {HEADERS.slice(1).map(({ title, isNumeric }, index) => (
              <th
                key={index}
                scope="col"
                className={`${selectedQuotationIds.length === 0 ? 'visible' : 'invisible'
                  } text-secondary/80 px-4 font-semibold text-xs ${isNumeric ? 'text-right' : 'text-left'}`}
              >
                {title}
              </th>
            ))}

            {selectedQuotationIds.length > 0 && (
              <div className='absolute right-0 inset-y-0 flex items-center pr-2 space-x-1'>
                <Button
                  onClick={() => handleChangeShowModal('quotationBill', true)}
                  name="Imprimir"
                  styleButton="primary"
                  className="px-2 py-1.5 text-xs font-semibold text-secondary/80"
                />
                <Button
                  onClick={() => handleViewQuotation(selectedQuotationIds[0])}
                  name="Ver cotización"
                  styleButton="primary"
                  className="px-2 py-1.5 text-xs font-semibold text-secondary/80"
                />
              </div>
            )}
          </tr>
        )}
      </thead>

      {selected && (
        <QuotationBill
          quotationData={{
            quotationNumber: selected.quotationCode,
            date: new Date(selected.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            isOpen: isModalOpen.quotationBill,
            onClose: () => handleChangeShowModal('quotationBill', false),
            customerName: selected.customerName,
            customerLastName: selected.customerLastName ?? '',
            customerRuc: selected.dni,
            customerPhone: selected.phone,
            customerEmail: selected.email,
            products: [
              ...(selected?.products?.map(p => ({
                name: p.productName,
                quantity: p.quantity,
                productId: p.productId,
                cost: Number(p.productPrice),
                discount: Number(p.productDiscount ?? 0)
              })) ?? []),
              ...(selected?.newProducts?.map(np => ({
                name: np.productName,
                quantity: np.quantity,
                productId: np.productId,
                cost: Number(np.price),
                discount: Number(np.discount ?? 0)
              })) ?? [])
            ],
            observations: selected.observation,
            shippingCost: selected.shippingCost,
            subTotal: selected.subTotal,
            total: selected.total,
            discount: selected.discount,
          }}
        />
      )}

    </>
  );
}
