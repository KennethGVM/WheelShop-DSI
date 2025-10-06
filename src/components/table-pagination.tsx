import { Dispatch, SetStateAction } from "react";
import Button from "@/components/form/button";
import { ArrowLeftIcon, ArrowRightIcon } from "@/icons/icons";
import { twMerge } from "tailwind-merge";

interface TablePaginationProps {
  totalPages: number;
  page: number;
  className?: string;
  setPage: Dispatch<SetStateAction<number>>;
}


export default function TablePagination({ className, totalPages, page, setPage }: TablePaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <footer className={twMerge("bg-[#F7F7F7] rounded-b-xl px-4 py-2 flex items-center space-x-0.5 border-t border-gray-300", className)}>
      <Button
        styleButton="simple"
        className={`p-1.5 text-xs disabled:shadow-none disabled:cursor-default font-medium rounded-r-none ${page === 1 ? "bg-[#ebebeb]" : "bg-[#e3e3e3] hover:bg-[#d0d0d0]"
          }`}
        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <ArrowLeftIcon className={`md:size-4 size-5 stroke-none ${page === 1 ? 'fill-[#cccccc]' : 'fill-[#4a4a4a]'}`} />
      </Button>

      <Button
        styleButton="simple"
        className={`p-1.5 text-xs disabled:shadow-none disabled:cursor-default font-medium rounded-l-none ${page === totalPages ? "bg-[#ebebeb]" : "bg-[#e3e3e3] hover:bg-[#d0d0d0]"
          }`}
        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <ArrowRightIcon
          className={`md:size-4 size-5 stroke-none ${page === totalPages ? 'fill-[#cccccc]' : 'fill-[#4a4a4a]'}`}
        />

      </Button>
    </footer>
  );
}