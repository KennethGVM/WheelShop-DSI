import { ChangeEvent, useEffect, useState } from "react";
import { PermissionProps } from "@/types/types";

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