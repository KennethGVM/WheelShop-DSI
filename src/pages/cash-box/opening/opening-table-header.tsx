import CheckBox from '@/components/form/check-box';
import Button from '@/components/form/button';
import { OpeningProps } from '@/types/types';

interface HeaderProps {
  title: string;
  isNumeric: boolean;
  className?: string;
};

interface OpeningTableHeaderProps {
  openings: OpeningProps[];
  selectedOpeningIds: OpeningProps[];
  selectAll: boolean;
  handleEditOpening: (openingId: OpeningProps) => void;
  HEADERS: HeaderProps[];
  isScrolled: boolean;
  handleSelectAll: (checked: boolean) => void;
}

export default function OpeningTableHeader({ handleSelectAll, isScrolled, openings, selectedOpeningIds, selectAll, HEADERS, handleEditOpening }: OpeningTableHeaderProps) {
  return (
    <thead className="text-2xs sticky top-0 inset-x-0 w-full text-secondary/80 bg-[#f7f7f7] border-y z-40 border-gray-300">
      {openings && openings.length > 0 &&
        <tr className={`${selectedOpeningIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} relative`}>
          <th className={`px-2 py-2 sticky inset-y-0 h-full left-0 z-10 ${selectedOpeningIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} before:content-[''] before:absolute before:top-0 before:right-0 before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative px-2 py-2.5`}>
            <div className='flex items-center space-x-2'>
              <CheckBox
                initialValue={selectAll}
                onChange={(value) => handleSelectAll(value)}
              />
              <div className={`absolute left-8 inset-y-2 flex items-center pl-2`}>
                {selectedOpeningIds.length > 0 && <span className='text-secondary/80 text-xs font-semibold'>Seleccionados: {selectedOpeningIds.length}</span>}
              </div>
              <span className={`text-secondary/80 font-semibold text-xs ${selectedOpeningIds.length === 0 ? 'visible' : 'invisible'}`}>{HEADERS[0].title}</span>
            </div>
          </th>

          {HEADERS.slice(1).map(({ title, isNumeric, className }, index) => (
            <th key={index} scope="col" className={`px-6 py-2.5 bg-[#F7F7F7] ${className} left-5 ${selectedOpeningIds.length === 0 ? 'visible' : 'invisible'} text-secondary/80 font-semibold text-xs ${isNumeric ? "text-right" : "text-left"}`}>
              {title}
            </th>
          ))}

          {selectedOpeningIds.length > 0 &&
            <div className='absolute z-40 right-0 inset-y-0 flex items-center pr-2 space-x-1'>
              <Button onClick={() => handleEditOpening(selectedOpeningIds[0])} name='Ver apertura de caja' styleButton="primary" className="px-2 py-1.5 text-xs font-semibold text-secondary/80" />
            </div>
          }
        </tr>
      }
    </thead>
  )
}
