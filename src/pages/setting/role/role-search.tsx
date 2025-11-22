import { RoleProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import RoleSegmentSearch from "./role-segment-search";
import RoleSort from "./role-sort";

interface RoleSearchProps {
  roles: RoleProps[];
  setRoles: Dispatch<SetStateAction<RoleProps[]>>;
  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
}

interface SelectedFilters {
  segments: number;
  sorts: string;
  typeSort: 'recent' | 'ancient';
}

export default function RoleSearch({ roles, setRoles, isSearching, setIsSearching }: RoleSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const SORTS_ROLES = ["Nombre"];
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    segments: 0,
    sorts: "Nombre",
    typeSort: 'recent'
  });

  const handleChangeSelectedFilters = (name: keyof typeof selectedFilters, value: number | string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev, [name]: value };

      if (name !== 'segments') {
        sortRoles(newFilters.sorts, newFilters.typeSort);
      }
      return newFilters;
    });
  };

  useEffect(() => {
    if (!isSearching) return;
    inputRef.current?.focus();
  }, [isSearching]);


  const sortRoles = (field: string, direction: 'recent' | 'ancient') => {
    const sortIndex = SORTS_ROLES.indexOf(field);

    const comparisonFunctions: ((a: RoleProps, b: RoleProps) => number)[] = [
      (a, b) => a.name.localeCompare(b.name),
    ];

    if (sortIndex === -1) return;

    const sortedRole = [...roles].sort((a, b) => {
      const result = comparisonFunctions[sortIndex](a, b);
      return direction === 'recent' ? result * -1 : result;
    });

    setRoles(sortedRole);
  };

  return (
    <div className={`flex items-center justify-between px-2 py-2 bg-white space-x-6 border-gray-300`}>
      <RoleSegmentSearch
        inputRef={inputRef}
        isSearching={isSearching}
        roles={roles}
        selectedFilters={selectedFilters}
        setRoles={setRoles}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
      />

      <RoleSort
        SORTS_ROLES={SORTS_ROLES}
        roles={roles}
        isSearching={isSearching}
        selectedFilters={selectedFilters}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
        setIsSearching={setIsSearching}
        inputRef={inputRef}
        setRoles={setRoles}
      />
    </div>
  );
}
