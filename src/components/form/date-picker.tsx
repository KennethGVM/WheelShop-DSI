"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import FieldInput from "./field-input"
import { AngleLeftIcon, AngleRightIcon, CalendarIcon } from "@/icons/icons"
import Button from "./button"
import FieldSelect from "./field-select"

interface DatePickerProps {
  startDate?: Date | null
  endDate?: Date | null
  onChange?: (startDate: Date | null, endDate: Date | null) => void
  placeholder?: string
  disabled?: boolean
}

const DatePicker: React.FC<DatePickerProps> = ({
  startDate = null,
  endDate = null,
  onChange,
  placeholder = "Seleccionar fechas",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectingStart, setSelectingStart] = useState(true)
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate)
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const [startInputValue, setStartInputValue] = useState("")
  const [endInputValue, setEndInputValue] = useState("")
  const [startInputFocused, setStartInputFocused] = useState(false)
  const [endInputFocused, setEndInputFocused] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ]

  const daysOfWeek = ["DO", "LU", "MA", "MI", "JU", "VI", "SA"]

  useEffect(() => {
    setTempStartDate(startDate)
    setTempEndDate(endDate)
  }, [startDate, endDate])

  useEffect(() => {
    if (startDate) {
      setCurrentMonth(new Date(startDate.getFullYear(), startDate.getMonth(), 1))
    }
  }, [startDate])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const formatDate = (date: Date | null) => {
    if (!date) return ""
    return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`
  }

  const formatDateForInput = (date: Date | null) => {
    if (!date) return ""
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const parseDateFromInput = (dateString: string) => {
    if (!dateString) return null
    const [year, month, day] = dateString.split("-").map(Number)
    if (!year || !month || !day) return null
    const date = new Date(year, month - 1, day)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null
    }
    return date
  }

  const getSmartDisplayText = () => {
    if (!startDate && !endDate) return placeholder

    if (selectedPreset) {
      return selectedPreset
    }

    if (startDate && endDate) {
      const startDay = startDate.getDate()
      const startMonth = months[startDate.getMonth()]
      const startYear = startDate.getFullYear()

      const endDay = endDate.getDate()
      const endMonth = months[endDate.getMonth()]
      const endYear = endDate.getFullYear()

      if (startYear === endYear && startDate.getMonth() === endDate.getMonth()) {
        return `${startDay.toString().padStart(2, "0")} - ${endDay.toString().padStart(2, "0")} ${startMonth} ${startYear}`
      }

      if (startYear === endYear) {
        return `${startDay.toString().padStart(2, "0")} ${startMonth} - ${endDay.toString().padStart(2, "0")} ${endMonth} ${startYear}`
      }

      return `${startDay.toString().padStart(2, "0")} ${startMonth} ${startYear} - ${endDay.toString().padStart(2, "0")} ${endMonth} ${endYear}`
    }

    if (startDate) return `Desde ${formatDate(startDate)}`
    if (endDate) return `Hasta ${formatDate(endDate)}`
    return placeholder
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false
    return date1.toDateString() === date2.toDateString()
  }

  const isDateInRange = (date: Date, start: Date | null, end: Date | null) => {
    if (!start || !end) return false
    return date >= start && date <= end
  }

  const handleDateClick = (day: number, monthOffset = 0) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, day)

    setSelectedPreset(null)

    if (selectingStart) {
      setTempStartDate(clickedDate)
      setTempEndDate(null)
      setSelectingStart(false)
    } else {
      if (tempStartDate && clickedDate < tempStartDate) {
        setTempStartDate(clickedDate)
        setTempEndDate(tempStartDate)
      } else {
        setTempEndDate(clickedDate)
      }
      setSelectingStart(true)
    }
  }

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1))
  }

  const renderCalendar = (monthOffset = 0) => {
    const displayMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1)
    const daysInMonth = getDaysInMonth(displayMonth)
    const firstDay = getFirstDayOfMonth(displayMonth)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day)
      const isStart = isSameDay(date, tempStartDate)
      const isEnd = isSameDay(date, tempEndDate)
      const isInRange = isDateInRange(date, tempStartDate, tempEndDate)
      const isToday = isSameDay(date, new Date())

      let dayClasses =
        "aspect-square flex items-center justify-center cursor-pointer text-2xs relative border border-transparent"

      if (isStart || isEnd) {
        dayClasses += " bg-primary text-white border-black"
        if (isStart) dayClasses += " rounded-l-md"
        if (isEnd) dayClasses += " rounded-r-md"
      } else if (isInRange) {
        dayClasses += " bg-gray-100 text-black border-gray-100"
      } else {
        dayClasses += " hover:bg-gray-100 text-secondary/80 font-semibold"
      }

      if (isToday && !isStart && !isEnd) {
        dayClasses += " font-bold text-gray-800"
      }

      days.push(
        <div key={day} className={dayClasses} onClick={() => handleDateClick(day, monthOffset)}>
          {day}
        </div>,
      )
    }

    return (
      <div className="flex-1">
        <div className="flex items-center justify-center mb-4 relative">
          {monthOffset === 0 && (
            <button
              className="absolute left-0 bg-transparent border-none text-lg cursor-pointer p-1 rounded hover:bg-gray-100"
              onClick={() => navigateMonth(-1)}
            >
              <AngleLeftIcon className="size-4 stroke-none fill-secondary/80" />
            </button>
          )}
          <h3 className="m-0 text-sm font-semibold text-secondary/80">
            {months[displayMonth.getMonth()]} {displayMonth.getFullYear()}
          </h3>
          {monthOffset === 1 && (
            <button
              className="absolute right-0 bg-transparent border-none text-lg cursor-pointer p-1 rounded hover:bg-gray-100"
              onClick={() => navigateMonth(1)}
            >
              <AngleRightIcon className="size-4 stroke-none fill-secondary/80" />
            </button>
          )}
        </div>
        <div className="w-full">
          <div className="grid grid-cols-7 gap-0.5 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2 px-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0">{days}</div>
        </div>
      </div>
    )
  }

  const handleStartInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setStartInputValue(value)
    const parsedDate = parseDateFromInput(value)
    if (parsedDate) {
      setTempStartDate(parsedDate)
      setCurrentMonth(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1))
      setSelectedPreset(null)
    }
  }

  const handleEndInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEndInputValue(value)
    const parsedDate = parseDateFromInput(value)
    if (parsedDate) {
      setTempEndDate(parsedDate)
      setSelectedPreset(null)
    }
  }

  const handleStartInputFocus = () => {
    setStartInputFocused(true)
    setStartInputValue(formatDateForInput(tempStartDate))
  }

  const handleStartInputBlur = () => {
    setStartInputFocused(false)
    setStartInputValue("")
  }

  const handleEndInputFocus = () => {
    setEndInputFocused(true)
    setEndInputValue(formatDateForInput(tempEndDate))
  }

  const handleEndInputBlur = () => {
    setEndInputFocused(false)
    setEndInputValue("")
  }

  const handleApply = () => {
    onChange?.(tempStartDate, tempEndDate)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setTempStartDate(startDate)
    setTempEndDate(endDate)
    setIsOpen(false)
  }

  const presetRanges = [
    { label: "Hoy", days: 0 },
    { label: "Ayer", days: 1 },
    { label: "Últimos 7 días", days: 7 },
    { label: "Últimos 30 días", days: 30 },
    { label: "Últimos 90 días", days: 90 },
    { label: "Últimos 365 días", days: 365 },
    { label: "Mes pasado", days: -1 },
    { label: "Últimos 12 meses", days: 365 },
    { label: "Año pasado", days: -365 },
  ]

  const handlePresetClick = (preset: { label: string; days: number }) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // medianoche local
    let start: Date, end: Date

    if (preset.days === 0) {
      start = end = new Date(today)
    } else if (preset.days === 1) {
      start = end = new Date(today)
      start.setDate(start.getDate() - 1)
    } else if (preset.days > 0) {
      end = new Date(today)
      start = new Date(today)
      start.setDate(start.getDate() - (preset.days - 1))
    } else {
      if (preset.days === -1) {
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        end = new Date(today.getFullYear(), today.getMonth(), 0)
      } else {
        start = new Date(today.getFullYear() - 1, 0, 1)
        end = new Date(today.getFullYear() - 1, 11, 31)
      }
    }

    // Asegurarse de que start y end también tengan hora 0
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)

    setTempStartDate(start)
    setTempEndDate(end)
    setSelectedPreset(preset.label)
  }


  const renderMobileCalendar = () => {
    const displayMonth = currentMonth
    const daysInMonth = getDaysInMonth(displayMonth)
    const firstDay = getFirstDayOfMonth(displayMonth)
    const days = []
    const today = new Date()

    const isCurrentMonth =
      displayMonth.getMonth() === today.getMonth() && displayMonth.getFullYear() === today.getFullYear()

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day)
      const isStart = isSameDay(date, tempStartDate)
      const isEnd = isSameDay(date, tempEndDate)
      const isInRange = isDateInRange(date, tempStartDate, tempEndDate)
      const isToday = isSameDay(date, today) && isCurrentMonth

      let dayClasses =
        "aspect-square flex items-center text-secondary/80 font-semibold justify-center cursor-pointer text-base relative border border-transparent"

      if (isStart || isEnd) {
        dayClasses += " bg-black text-white border-black"
        if (isStart) dayClasses += " rounded-l-md"
        if (isEnd) dayClasses += " rounded-r-md"
      } else if (isInRange) {
        dayClasses += " bg-gray-100 border-gray-100"
      } else if (isToday) {
        dayClasses += " text-red-500 font-bold hover:bg-red-50"
      } else {
        dayClasses += " hover:bg-gray-100"
      }

      days.push(
        <div key={day} className={dayClasses} onClick={() => handleDateClick(day)}>
          {day}
        </div>,
      )
    }

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <button className="p-2 hover:bg-gray-100 rounded" onClick={() => navigateMonth(-1)}>
            <AngleLeftIcon className="size-4 stroke-none fill-secondary/80" />
          </button>
          <h3 className="m-0 text-base font-semibold text-secondary/80">
            {months[displayMonth.getMonth()]} {displayMonth.getFullYear()}
          </h3>
          <button className="p-2 hover:bg-gray-100 rounded" onClick={() => navigateMonth(1)}>
            <AngleRightIcon className="size-4 stroke-none fill-secondary/80" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day, index) => {
            const todayDayOfWeek = today.getDay()
            const isCurrentDayOfWeek = index === todayDayOfWeek && isCurrentMonth
            return (
              <div
                key={day}
                className={`text-center text-base text-secondary/80 font-semibold py-2 ${isCurrentDayOfWeek ? "text-red-500" : "text-gray-500"
                  }`}
              >
                {day}
              </div>
            )
          })}
        </div>
        <div className="grid grid-cols-7 gap-0">{days}</div>
      </div>
    )
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <Button
        styleButton="primary"
        className={`px-3 space-x-2 py-1 ${isOpen ? 'shadow-pressed' : ''} text-secondary/80 md:text-2xs text-base font-[550]  bg-white ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400"
          }`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <CalendarIcon className="md:size-4 size-5 stroke-none fill-secondary/80" />
        <span>{getSmartDisplayText()}</span>
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-[1000] w-screen max-w-[95vw] md:w-auto md:max-w-none">
          <div className="md:hidden bg-white w-full max-w-[95vw] mx-auto my-4 rounded-lg shadow-lg flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <FieldSelect
                options={presetRanges.map((p) => ({ name: p.label, value: p.label }))}
                className="w-full"
                value={selectedPreset || ""}
                onChange={(e) => {
                  const preset = presetRanges.find((p) => p.label === e.target.value)
                  if (preset) handlePresetClick(preset)
                }}
              />
            </div>

            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FieldInput
                  value={startInputFocused ? startInputValue : formatDate(tempStartDate)}
                  onChange={handleStartInputChange}
                  onFocus={handleStartInputFocus}
                  onBlur={handleStartInputBlur}
                  className="w-full"
                  placeholder={startInputFocused ? "yyyy-mm-dd" : "Fecha de inicio"}
                />
                <AngleRightIcon className="min-w-4 min-h-4  stroke-none fill-secondary/80 text-secondary/80" />
                <FieldInput
                  type="text"
                  value={endInputFocused ? endInputValue : formatDate(tempEndDate)}
                  onChange={handleEndInputChange}
                  onFocus={handleEndInputFocus}
                  onBlur={handleEndInputBlur}
                  className="w-full"
                  placeholder={endInputFocused ? "yyyy-mm-dd" : "Fecha de fin"}
                />
              </div>
            </div>

            <div className="flex-1 p-4">{renderMobileCalendar()}</div>

            <div className="p-4 border-t border-gray-200 flex items-center justify-between gap-3">
              <Button
                styleButton="primary"
                className="text-base py-1 px-3 cursor-pointer bg-white "
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <Button
                styleButton="secondary"
                className="px-3 py-1 text-base"
                onClick={handleApply}
              >
                Aplicar
              </Button>
            </div>
          </div>

          <div className="hidden md:block bg-white border border-gray-200 rounded-lg shadow-xl min-w-[800px]">
            <div className="flex">
              <div className="w-[200px] border-r border-gray-200 py-4">
                {presetRanges.map((preset, index) => (
                  <button
                    key={index}
                    className={`w-full px-4 py-2 border-none bg-transparent text-left cursor-pointer text-sm flex justify-between items-center hover:bg-gray-100 ${selectedPreset === preset.label ? "bg-gray-100 font-medium" : ""
                      }`}
                    onClick={() => handlePresetClick(preset)}
                  >
                    {preset.label}
                    {selectedPreset === preset.label && <span className="text-green-500 font-bold">✓</span>}
                  </button>
                ))}
              </div>

              <div className="flex-1 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <FieldInput
                    value={startInputFocused ? startInputValue : formatDate(tempStartDate)}
                    onChange={handleStartInputChange}
                    onFocus={handleStartInputFocus}
                    onBlur={handleStartInputBlur}
                    className="min-w-[180px] w-full"
                    placeholder={startInputFocused ? "yyyy-mm-dd" : "Fecha de inicio"}
                  />
                  <AngleRightIcon className="min-w-4 min-h-4  stroke-none fill-secondary/80 text-secondary/80" />
                  <FieldInput
                    type="text"
                    value={endInputFocused ? endInputValue : formatDate(tempEndDate)}
                    onChange={handleEndInputChange}
                    onFocus={handleEndInputFocus}
                    onBlur={handleEndInputBlur}
                    className="min-w-[180px] w-full"
                    placeholder={endInputFocused ? "yyyy-mm-dd" : "Fecha de fin"}
                  />
                </div>

                <div className="flex gap-6 mb-4">
                  <>
                    {renderCalendar(0)}
                    {renderCalendar(1)}
                  </>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-300">
                  <Button
                    styleButton="primary"
                    className="text-2xs py-1 px-3 cursor-pointer bg-white "
                    onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                  <Button
                    styleButton="secondary"
                    className="px-3 py-1 text-2xs"
                    onClick={handleApply}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DatePicker
