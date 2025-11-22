import StatusTags from "@/components/status-tags";
import { ReportProps } from "@/types/types"

interface DiscountTableRowProps {
  reports: ReportProps[];
  report: ReportProps
  isScrolled: boolean;
  handleShowReport: (report: string) => void;
}

export default function ReportTableRow({ isScrolled, handleShowReport, reports, report }: DiscountTableRowProps) {
  return (
    <tr
      key={report.name}
      onDoubleClick={() => handleShowReport(report.name)}
      className={`'bg-white group cursor-pointer text-2xs font-medium ${report !== reports[reports.length - 1] ? 'border-b' : ''} text-secondary/80 border-gray-300 hover:bg-[#F7F7F7]`}
    >
      <td
        className={`px-2 py-4 md:w-auto w-[40%] sticky inset-y-0 h-full left-0 z-10 bg-white group-hover:bg-[#F7F7F7]
          before:content-[''] before:absolute before:top-0 before:right-0
          before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity
          ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative bg-white`}
      >
        {report.name}
      </td>
      <td className="px-2 py-4">
        <StatusTags status text='Activo' />
      </td>
      <td className="px-2 py-4">{new Date().toLocaleDateString('es-NI', { day: 'numeric', month: 'long', year: 'numeric' }).replace('.', '')}</td>
      <td className="px-2 py-4">{report.category}</td>
    </tr>
  )
}
