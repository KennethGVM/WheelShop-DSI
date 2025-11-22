import { Dispatch, SetStateAction } from 'react';
import { StoreHouseProps } from '@/types/types';
import { SearchIcon } from '@/icons/icons';
import TableSkeleton from '@/components/table-skeleton';
import StoreHouseTableHeader from './store-house-table-header';
import StoreHouseTableRow from './store-house-table-row';

interface RolesTableProps {
  storeHouses: StoreHouseProps[];
  setStoreHouses: Dispatch<SetStateAction<StoreHouseProps[]>>;
  isLoading: boolean;
}

export default function StoreHouseTable({ storeHouses, setStoreHouses, isLoading }: RolesTableProps) {
  const HEADERS = [
    { title: "Bodega", isNumeric: false },
    { title: "Estado", isNumeric: false },
  ];

  return (
    <div className='relative overflow-x-auto'>
      <table className="w-full  bg-white">
        <StoreHouseTableHeader
          storeHouses={storeHouses}
          setStoreHouses={setStoreHouses}
          HEADERS={HEADERS}
        />
        {isLoading ? (
          <TableSkeleton columns={HEADERS.length + 1} />
        ) : (
          <tbody>
            {storeHouses && storeHouses.length > 0 ? (
              storeHouses.map((storeHouse, key) => (
                <StoreHouseTableRow
                  key={key}
                  storeHouse={storeHouse}
                  storeHouses={storeHouses}
                />
              ))
            ) : (
              <tr>
                <td colSpan={HEADERS.length + 1} className="text-center text-secondary/80">
                  <div className='flex flex-col items-center justify-center space-y-3 py-4'>
                    <SearchIcon className='size-16 fill-[#8c9196]' />
                    <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de bodega</p>
                    <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        )}
      </table>
    </div>
  )
}
