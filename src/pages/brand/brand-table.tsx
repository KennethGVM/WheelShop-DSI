import { Dispatch, SetStateAction, useState } from 'react';
import { BrandProps} from '@/types/types';
import { SearchIcon } from '@/icons/icons';


import BrandTableHeader from './brand-table-header';
import  BrandTableRow from './brand-table-row';
import TableSkeleton from '../../components/table-skeleton';


interface BrandTableProps {
  brands: BrandProps[];
  setBrands: Dispatch<SetStateAction<BrandProps[]>>;
  isLoading: boolean;
  setSelectedBrandToEdit: Dispatch<SetStateAction<BrandProps | null>>;
  selectedBrandIds: BrandProps[];
  setSelectedBrandIds: Dispatch<SetStateAction<BrandProps[]>>;
}

export default function BrandTable({ brands, setBrands, isLoading, setSelectedBrandToEdit, selectedBrandIds, setSelectedBrandIds }: BrandTableProps) {

  const [selectAll, setSelectAll] = useState<boolean>(false);
  
  const HEADERS = [
    { title: "Marca", isNumeric: false },
    { title: "Categoría", isNumeric: false },
    { title: "Estado", isNumeric: false },
    { title: "Fecha ", isNumeric: false },
  ];

  return (
    <table className="w-full bg-white">
      <BrandTableHeader
        brands={brands}
        setBrands={setBrands}
        selectedBrandIds={selectedBrandIds}
        selectAll={selectAll}
        setSelectAll={setSelectAll}
        setSelectedBrandIds={setSelectedBrandIds}
        HEADERS={HEADERS}
        setSelectedBrandToEdit={setSelectedBrandToEdit}
      />
      {isLoading ? (
        <TableSkeleton columns={HEADERS.length + 1} />
      ) : (
        <tbody>
          {brands && brands.length > 0 ? (
            brands.map((brand, key) => (
              <BrandTableRow
                key={key}
                brands={brands}
                brand={brand}
                selectedBrandIds={selectedBrandIds}
                setSelectedBrandIds={setSelectedBrandIds}
                setSelectAll={setSelectAll}
              />
            ))
          ) : (
            <tr>
              <td colSpan={HEADERS.length + 1} className="text-center text-secondary/80">
                <div className='flex flex-col items-center justify-center space-y-3 py-4'>
                  <SearchIcon className='size-16 fill-[#8c9196]' />
                  <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de marcas</p>
                  <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      )}
    </table>
  )
}
