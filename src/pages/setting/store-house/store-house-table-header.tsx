import { StoreHouseProps } from '@/types/types';
import { Dispatch, SetStateAction } from 'react';
import { twMerge } from 'tailwind-merge';

interface HeaderProps {
  title: string;
  isNumeric: boolean;
  className?: string;
};

interface StoreHouseTableHeaderProps {
  storeHouses: StoreHouseProps[];
  setStoreHouses: Dispatch<SetStateAction<StoreHouseProps[]>>;
  HEADERS: HeaderProps[];
}

export default function StoreHouseTableHeader({ storeHouses, HEADERS }: StoreHouseTableHeaderProps) {
  return (
    <thead className="text-2xs text-secondary/80 bg-[#f7f7f7] border-y border-gray-300">
      {storeHouses && storeHouses.length > 0 &&
        <tr className='bg-[#f7f7f7] relative'>
          {HEADERS.map(({ title, isNumeric, className }, index) => (
            <th key={index} scope="col" className={twMerge(`px-4 py-2.5 bg-[#F7F7F7] left-5 text-secondary/80 font-semibold md:text-xs text-sm ${isNumeric ? "text-right" : "text-left"}`, className)}>
              {title}
            </th>
          ))}
        </tr>
      }
    </thead>
  )
}
