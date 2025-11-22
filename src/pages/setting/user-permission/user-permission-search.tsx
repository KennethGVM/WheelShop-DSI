import { UserPermissionProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import UserPermissionSegmentSearch from "./user-permission-segment-search";
import UserPermissionSort from "./user-permission-sort";

interface UserPermissionSearchProps {
  users: UserPermissionProps[];
  setUsers: Dispatch<SetStateAction<UserPermissionProps[]>>;
  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
}

interface SelectedFilters {
  segments: number;
  sorts: string;
  typeSort: 'recent' | 'ancient';
}

export default function UserPermissionSearch({ users, setUsers, isSearching, setIsSearching }: UserPermissionSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const SORTS_USER_PERMISSION = ["Nombre de usuario", "Ultimo inicio de sesión", "Fecha de creación", "Ultima actualización", "Estado"];
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    segments: 0,
    sorts: "Nombre de usuario",
    typeSort: 'recent'
  });

  const handleChangeSelectedFilters = (name: keyof typeof selectedFilters, value: number | string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev, [name]: value };

      if (name !== 'segments') {
        sortUserPermission(newFilters.sorts, newFilters.typeSort);
      }
      return newFilters;
    });
  };

  useEffect(() => {
    if (!isSearching) return;
    inputRef.current?.focus();
  }, [isSearching]);


  const sortUserPermission = (field: string, direction: 'recent' | 'ancient') => {
    const sortIndex = SORTS_USER_PERMISSION.indexOf(field);

    const comparisonFunctions: ((a: UserPermissionProps, b: UserPermissionProps) => number)[] = [
      (a, b) => a.email.localeCompare(b.email),
      (a, b) => {
        const dateA = a.lastSignInAt ? new Date(a.lastSignInAt).getTime() : 0;
        const dateB = b.lastSignInAt ? new Date(b.lastSignInAt).getTime() : 0;
        return dateB - dateA;
      },
      (a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      },
      (a, b) => {
        const dateA = a.updateAt ? new Date(a.updateAt).getTime() : 0;
        const dateB = b.updateAt ? new Date(b.updateAt).getTime() : 0;
        return dateB - dateA;
      },
      (a) => a.state ? -1 : 1
    ];

    if (sortIndex === -1) return;

    const sortedUserPermission = [...users].sort((a, b) => {
      const result = comparisonFunctions[sortIndex](a, b);
      return direction === 'recent' ? result * -1 : result;
    });

    setUsers(sortedUserPermission);
  };

  return (
    <div className={`flex items-center justify-between px-2 py-2 bg-white space-x-6 border-gray-300`}>
      <UserPermissionSegmentSearch
        inputRef={inputRef}
        isSearching={isSearching}
        users={users}
        selectedFilters={selectedFilters}
        setUsers={setUsers}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
      />

      <UserPermissionSort
        SORTS_USER_PERMISSION={SORTS_USER_PERMISSION}
        users={users}
        isSearching={isSearching}
        selectedFilters={selectedFilters}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
        setIsSearching={setIsSearching}
        inputRef={inputRef}
        setUsers={setUsers}
      />
    </div>
  );
}
