import { ReportProps } from '@/types/types';
import { Dispatch, SetStateAction } from 'react';

interface HeaderProps {
  title: string;
  isNumeric: boolean;
  className?: string;
};

interface ReportTableHeaderProps {
  reports: ReportProps[];
  setReports: Dispatch<SetStateAction<ReportProps[]>>;
  HEADERS: HeaderProps[];
  isScrolled: boolean;
}

export default function ReportTableHeader({ HEADERS, reports }: ReportTableHeaderProps) {
  return (
    <thead className="text-2xs text-secondary/80 bg-[#f7f7f7] border-y border-gray-300">
      {reports && reports.length > 0 &&
        <tr className='bg-[#f7f7f7] relative'>
          {HEADERS.map(({ title, isNumeric, className }, index) => (
            <th key={index} scope="col" className={`py-2.5 bg-[#F7F7F7] ${className} px-2 text-secondary/80 font-semibold text-xs ${isNumeric ? "text-right" : "text-left"}`}>
              {title}
            </th>
          ))}
        </tr>
      }
    </thead >
  )
}
