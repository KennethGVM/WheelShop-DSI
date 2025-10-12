import { JSX } from "react";
import { twMerge } from 'tailwind-merge'

interface Props {
  children?: JSX.Element;
  name?: string;
  className?: string;
  classNameLabel?: string;
}

export default function FormSection({ children, name, className, classNameLabel }: Props) {
  return (
    <section className={twMerge('bg-white md:border border-gray-300 md:rounded-xl rounded-none mt-4 shadow-sm py-5 px-4', className)}>
      {name && <h2 className={twMerge('font-[550] md:text-sm text-base text-secondary/90 mb-3', classNameLabel)}>{name}</h2>}
      {children}
    </section>
  )
}
