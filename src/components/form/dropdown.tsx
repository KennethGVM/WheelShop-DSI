import React, { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { twMerge } from "tailwind-merge"

type Position = "top" | "bottom" | "left" | "right"

interface DropdownProps {
  children: React.ReactNode
  className?: string
  closeToClickOption?: boolean
  onOpenChange?: (isOpen: boolean) => void // 👈 nuevo
}

interface DropdownContextType {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  triggerRef: React.RefObject<HTMLDivElement | null>
  contentRef?: React.RefObject<HTMLDivElement | null>
  closeDropdown?: boolean
  position?: Position
}

const DropdownContext = React.createContext<DropdownContextType | undefined>(undefined)

export function Dropdown({ children, className, closeToClickOption, onOpenChange }: DropdownProps) {
  const [open, setOpenState] = useState(false)
  const closeDropdown = closeToClickOption ?? false
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null) // 👈 agregamos esto

  const setOpen: React.Dispatch<React.SetStateAction<boolean>> = (value) => {
    const nextValue = typeof value === "function" ? (value as (prev: boolean) => boolean)(open) : value
    setOpenState(nextValue)
    if (onOpenChange) {
      onOpenChange(nextValue)
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        triggerRef.current &&
        contentRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef, contentRef, closeDropdown }}>
      <div className={`relative inline-block ${className || ""}`}>{children}</div>
    </DropdownContext.Provider>
  )
}

interface DropdownTriggerProps {
  children: React.ReactNode
  className?: string
}

export function DropdownTrigger({ children, className }: DropdownTriggerProps) {
  const context = React.useContext(DropdownContext)

  if (!context) {
    throw new Error("DropdownTrigger must be used within a Dropdown")
  }

  const { setOpen, open, triggerRef } = context

  return (
    <div ref={triggerRef} onClick={() => setOpen(!open)} className={`cursor-pointer ${className || ""}`}>
      {children}
    </div>
  )
}

interface DropdownContentProps {
  children: React.ReactNode
  className?: string
  position?: Position
  align?: "start" | "center" | "end"
  sideOffset?: number
  fullWidth?: boolean
  maxHeight?: string
}

export function DropdownContent({
  children,
  className,
  position = "bottom",
  align = "center",
  sideOffset = 8,
  fullWidth = false,
  maxHeight = "400px",
}: DropdownContentProps) {
  const context = React.useContext(DropdownContext)
  const contentRef = context?.contentRef
  const [mounted, setMounted] = useState(false)
  const [dimensions, setDimensions] = useState({ top: 0, left: 0, width: 0 })

  if (!context) {
    throw new Error("DropdownContent must be used within a Dropdown")
  }

  const { open, triggerRef } = context

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open && triggerRef.current && contentRef?.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const contentRect = contentRef.current.getBoundingClientRect()

      let top = 0
      let left = 0

      // Calcular posición vertical (top) según la posición
      switch (position) {
        case "bottom":
          top = triggerRect.bottom + window.scrollY + sideOffset
          break
        case "top":
          top = triggerRect.top + window.scrollY - contentRect.height - sideOffset
          break
        case "left":
          top = triggerRect.top + window.scrollY + triggerRect.height / 2 - contentRect.height / 2
          left = triggerRect.left + window.scrollX - contentRect.width - sideOffset
          break
        case "right":
          top = triggerRect.top + window.scrollY + triggerRect.height / 2 - contentRect.height / 2
          left = triggerRect.right + window.scrollX + sideOffset
          break
      }

      if (position === "top" || position === "bottom") {
        switch (align) {
          case "start":
            left = triggerRect.left + window.scrollX
            break
          case "center":
            left = triggerRect.left + window.scrollX + triggerRect.width / 2 - contentRect.width / 2
            break
          case "end":
            left = triggerRect.right + window.scrollX - contentRect.width
            break
        }
      }

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      if (left < 0) left = 0
      if (left + contentRect.width > viewportWidth) left = viewportWidth - contentRect.width
      if (top < 0) top = 0
      if (top + contentRect.height > viewportHeight + window.scrollY) {
        if (position === "bottom") {
          top = triggerRect.top + window.scrollY - contentRect.height - sideOffset
        }
      }

      // Si fullWidth es true, se iguala el ancho al del trigger.
      const width = fullWidth ? triggerRect.width : contentRect.width

      setDimensions({ top, left, width })
    }
  }, [open, position, align, sideOffset, triggerRef, fullWidth])

  if (!mounted) return null

  const animationClasses = twMerge(
    "bg-white rounded-md shadow-lg border border-gray-300 py-2 min-w-[8rem]",
    "animate-in fade-in-0 zoom-in-95",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
    "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
    "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
    className
  )

  return createPortal(
    open && (
      <div
        ref={contentRef}
        style={{
          position: "absolute",
          top: `${dimensions.top}px`,
          left: `${dimensions.left}px`,
          zIndex: 50,
          width: fullWidth ? `${dimensions.width}px` : undefined,
          maxHeight: maxHeight, // Agregado max-height
          overflowY: "auto", // Para que el contenido sea desplazable si se excede el max-height
        }}
        className={animationClasses}
        data-side={position}
      >
        {children}
      </div>
    ),
    document.body
  )
}

interface DropdownItemProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function DropdownItem({ children, className, onClick }: DropdownItemProps) {
  const context = React.useContext(DropdownContext)

  if (!context) {
    throw new Error("DropdownItem must be used within a Dropdown")
  }

  const { setOpen, closeDropdown } = context

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (onClick) onClick()
    if (closeDropdown) setOpen(false)
  }

  const itemClasses = twMerge(
    "relative flex text-red-900 cursor-pointer select-none items-center mx-2 px-2 py-1.5 text-2xs font-medium rounded-md outline-none transition-colors hover:bg-whiting2 text-secondary/80",
    className
  )

  return (
    <div onClick={handleClick} className={itemClasses}>
      {children}
    </div>
  )
}

export function DropdownSeparator({ className }: { className?: string }) {
  return <div className={`h-px my-1 bg-slate-200 ${className || ""}`} />
}
