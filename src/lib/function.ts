import { ChangeEvent, useEffect, useState } from "react";
import { PermissionProps } from "@/types/types";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { showToast } from "@/components/toast";

export const handleAllowNumber = (e: ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  let sanitizedValue = value.replace(/[^0-9.]/g, '');
  if (sanitizedValue.startsWith('.')) {
    sanitizedValue = '0' + sanitizedValue;
  }
  sanitizedValue = sanitizedValue.replace(/(\..*?)\..*/g, '$1');
  e.target.value = sanitizedValue;
};

export const handleAllowNegativeNumber = (e: React.ChangeEvent<HTMLInputElement>): string => {
  const newValue = e.target.value;
  if (/^-?\d*$/.test(newValue)) {
    return newValue;
  }
  return e.target.defaultValue;
};

export function currencyFormatter(value: number | string, currency: string = "NIO") {
  const locale = currency === 'USD' ? 'en-US' : 'es-NI';
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    minimumFractionDigits: 2,
    currency: currency
  })
  return formatter.format(value as number)
}

export const getPermissions = (
  permissions: PermissionProps[] | null,
  moduleName: string,
  subModuleName?: string,
  subSubModuleName?: string
) => {
  if (!permissions) return null;

  const module = permissions.find((p) => p.moduleName === moduleName);
  if (!module) return null;

  if (!subModuleName) {
    return module;
  }

  const subModule = module.subModules?.find((sm) => sm.subModuleName === subModuleName);
  if (!subModule) return null;

  if (!subSubModuleName) {
    return subModule;
  }

  const subSubModule = subModule.subSubModules?.find(
    (ssm) => ssm.subSubModuleName === subSubModuleName
  );
  return subSubModule || null;
};

export function useDebounce<T>(value: T): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), 500);

    return () => clearTimeout(handler);
  }, [value]);

  return debouncedValue;
}

export function exportToExcel(data: unknown[], fileName: string) {
  if (!data || data.length === 0) {
    showToast('No hay datos para exportar', false);
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `${fileName}.xlsx`);
}

export const formatDate = (date: Date | null) => {
  if (!date) return
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}