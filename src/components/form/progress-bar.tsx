import { ArrowDownIcon } from "@/icons/icons"
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from "./dropdown"
import { twMerge } from "tailwind-merge";

interface ProgressBarProps {
  value1: number;
  value2: number;
  total: number;
  isShowLabel?: boolean;
  className?: string;
  progressBarName?: string;
}

export default function ProgressBar({ value1, value2, total, isShowLabel = true, className, progressBarName= "Total recibido: " }: ProgressBarProps) {
  const hasValues = value1 > 0 || value2 > 0
  const totalValue = value1 + value2
  const percent1 = (value1 / total) * 100
  const percent2 = (value2 / total) * 100
  const completedPercent = Math.min(100, (totalValue / total) * 100)
  const unfilledPercent = Math.max(0, 100 - completedPercent)

  return (
    <div className={twMerge('w-full', className)}>
      <div className="relative w-full bg-gray-200 rounded-full overflow-hidden" style={{ height: "8px" }}>
        {hasValues ? (
          <>
            <div
              className="absolute h-full bg-emerald-600 transition-all duration-300 ease-in-out"
              style={{ width: `${percent1}%` }}
            />

            <div
              className="absolute h-full transition-all duration-300 ease-in-out overflow-hidden"
              style={{
                width: `${percent2}%`,
                left: `${percent1}%`,
                background: `repeating-linear-gradient(135deg, #fed1d7, #fed1d7 .25rem, #a30a24 .25rem, #a30a24 .4375rem)`,
              }}
            />

            {unfilledPercent > 0 && (
              <div
                className="absolute h-full transition-all duration-300 ease-in-out"
                style={{
                  width: `${unfilledPercent}%`,
                  left: `${completedPercent}%`,
                  backgroundColor: "#cccccc",
                }}
              />
            )}
          </>
        ) : (
          <div
            className="absolute h-full transition-all duration-300 ease-in-out"
            style={{ width: "100%", backgroundColor: "#cccccc" }}
          />
        )}
      </div>

      <div className="flex justify-end mt-1 md:text-sm text-[15px] font-normal text-secondary">
        <Dropdown>
          <DropdownTrigger>
            <button type="button" className="flex items-center space-x-1">
              <span className="cursor-pointer">{isShowLabel ? progressBarName : ''}{totalValue} de {total}</span>
              <ArrowDownIcon />
            </button>
          </DropdownTrigger>
          <DropdownContent className="md:w-[180px] w-52 py-0.5 rounded-xl" align="end">
            {value1 === 0 && value2 === 0 &&
              <DropdownItem className="flex items-center justify-between hover:bg-transparent">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-5 h-2 rounded-full bg-[#cccccc]"
                  />
                  <span className="md:text-2xs text-[15px]">No recibido</span>
                </div>
                <span className="md:text-2xs text-[15px]">{total}</span>
              </DropdownItem>
            }
            {(value1 > 0 || value2 > 0) &&
              <>
                <DropdownItem className="flex items-center justify-between hover:bg-transparent">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-5 h-2 rounded-full bg-emerald-600 "
                    />
                    <span className="md:text-2xs text-[15px]">Aceptado</span>
                  </div>
                  <span className="md:text-2xs text-[15px]">{value1}</span>
                </DropdownItem>
                {value2 > 0 &&
                  <>
                    <DropdownSeparator />
                    <DropdownItem className="space-x-2 flex items-center justify-between hover:bg-transparent">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-5 h-2 rounded-full"
                          style={{ background: `repeating-linear-gradient(135deg,#fed1d7, #fed1d7 .25rem, #a30a24 .25rem, #a30a24 .4375rem)` }}
                        />
                        <span className="md:text-2xs text-[15px]">Rechazado</span>
                      </div>
                      <span className="md:text-2xs text-[15px]">{value2}</span>
                    </DropdownItem>
                  </>
                }
                {(value1 + value2) < total &&
                  <>
                    <DropdownSeparator />
                    <DropdownItem className="flex items-center justify-between hover:bg-transparent">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-5 h-2 rounded-full bg-[#cccccc]"
                        />
                        <span className="md:text-2xs text-[15px]">No recibido</span>
                      </div>
                      <span className="md:text-2xs text-[15px]">{value1 - value2}</span>
                    </DropdownItem>
                  </>
                }
              </>
            }
          </DropdownContent>
        </Dropdown>
      </div>
    </div >
  )
}

