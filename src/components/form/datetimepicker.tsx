import { useState, useEffect } from "react"
import { CalendarIcon, AngleLeftIcon, AngleRightIcon } from "@/icons/icons"
import { DAYS, MONTHS } from "@/constants/constants"
import { formatDate } from "@/lib/function"
import { twMerge } from "tailwind-merge";

interface DateTimePickerProps {
  name?: string;
  id?: string;
  value?: Date | null;
  onChange?: (value: Date) => void;
  disabled?: boolean;
  className?: string;
  position?: "top" | "bottom";
}

export default function DateTimePicker({ name, id, onChange, value, disabled = false, className, position = "bottom", }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState<Date>(
    selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1) : new Date(),
  )
  const [inputValue, setInputValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const today = new Date()
  const currentDate = value !== undefined ? value : selectedDate

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  useEffect(() => {
    if (value !== undefined) {
      setInputValue(formatDate(value) ?? "")

      if (value) {
        setCurrentMonth(new Date(value.getFullYear(), value.getMonth(), 1))
      }
    }
  }, [value])


  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    )
  }
  const isTodayDayOfWeek = (dayIndex: number) => {
    return today.getDay() === dayIndex
  }

  const renderCalendarDays = () => {
    const firstDay = getFirstDayOfMonth(currentMonth).getDay()
    const daysInMonth = getDaysInMonth(currentMonth)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-cell"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const isCurrentDay = isToday(day)
      const isSelected =
        currentDate &&
        currentDate.getDate() === day &&
        currentDate.getMonth() === currentMonth.getMonth() &&
        currentDate.getFullYear() === currentMonth.getFullYear()

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(date)}
          className={`
            calendar-cell text-sm text-secondary/80
            ${isSelected ? "bg-secondary text-white" : "hover:bg-primary hover:text-white"}
            ${isCurrentDay ? "font-bold" : "font-medium"}
          `}
        >
          {day}
        </button>,
      )
    }

    return days
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isOpen && !target.closest(".date-picker-container")) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const parseInputDate = (value: string) => {
    const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/
    const match = value.match(dateRegex)

    if (match) {
      const year = Number.parseInt(match[1])
      const month = Number.parseInt(match[2]) - 1
      const day = Number.parseInt(match[3])

      const date = new Date(year, month, day)
      if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
        setSelectedDate(date)
        setCurrentMonth(new Date(year, month, 1))
        return true
      }
    }
    return false
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (!value.trim()) {
      setSelectedDate(null)
      return
    }

    if (parseInputDate(value)) {
      if (!isOpen) {
        setIsOpen(true)
      }
    }
  }
  useEffect(() => {
    if (selectedDate) {
      setInputValue(formatDate(selectedDate) ?? "")
    }
  }, [selectedDate])

  const handleDateSelect = (date: Date) => {
    // Actualizar el estado interno
    setSelectedDate(date)
    setIsOpen(false)

    // Notificar al componente padre si existe onChange
    if (onChange) {
      onChange(date)
    }
  }

  return (
    <div className={twMerge("relative w-full date-picker-container", className)}>
      <div className="space-y-2">
        {name && <label htmlFor={id} className="block mb-2 md:text-2xs text-[15px] font-medium text-secondary/80">{name}</label>}
        <div className="relative" onClick={() => disabled === true ? null : setIsOpen(!isOpen)}>
          <input
            id={id}
            type="text"
            placeholder="AAAA-MM-DD"
            value={inputValue}
            disabled={disabled}
            onChange={handleInputChange}
            className="w-full rounded-md md:h-8 h-11 border border-gray-400 pl-3 pr-10 placeholder-secondary/80 md:placeholder:text-2xs placeholder:text-sm text-secondary/80 font-medium md:text-2xs text-sm focus:outline-none focus:border-blue-500"
          />
          <CalendarIcon className="absolute right-3 top-1/2 md:size-4 size-5 -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      {isOpen && (
        <div
          className={twMerge(
            "absolute z-10 w-64 rounded-xl border border-gray-300 bg-white p-2 shadow-lg",
            position === "top" ? "bottom-8 mb-1" : "top-full mt-1"
          )}
        >
          <div className="mb-1 flex items-center justify-between">
            <button type="button" onClick={prevMonth} className="rounded-md p-1.5 hover:bg-gray-100">
              <AngleLeftIcon className="size-4 text-secondary/80" />
            </button>
            <div className="text-sm font-semibold text-primary">
              {`${MONTHS[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`}
            </div>
            <button type="button" onClick={nextMonth} className="rounded-md p-1.5 hover:bg-gray-100">
              <AngleRightIcon className="size-4 text-secondary/80" />
            </button>
          </div>

          <div className="calendar-grid">
            {DAYS.map((day, index) => (
              <div
                key={day}
                className={`calendar-cell text-2xs text-secondary/80 ${isTodayDayOfWeek(index) ? "font-bold" : "font-medium"}`}
              >
                {day}
              </div>
            ))}
            {renderCalendarDays()}
          </div>
        </div>
      )}
    </div>
  )
}