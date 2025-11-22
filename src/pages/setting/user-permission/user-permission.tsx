import { useEffect, useRef, useState } from "react";
import UserPermissionHeader from "./user-permission-header";
import UserPermissionSearch from "./user-permission-search";
import { UserPermissionProps } from "@/types/types";
import { supabase } from "@/api/supabase-client";
import TablePagination from "@/components/table-pagination";
import { showToast } from "@/components/toast";
import UserPermissionTable from "./user-permission-table";

export default function UserPermission() {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<UserPermissionProps[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;
  const totalPages = Math.ceil(totalUsers / pageSize);
  const usersRef = useRef<UserPermissionProps[]>([]);

  const handleLoadUsers = async (currentPage: number) => {
    setIsLoading(true);

    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await supabase
      .from('getusers')
      .select('*', { count: 'exact' })
      .range(from, to)


    if (error) {
      showToast(error.message, false)
      setIsLoading(false);
      return;
    }
    setUsers(data as UserPermissionProps[]);
    usersRef.current = data as UserPermissionProps[];
    setTotalUsers(count || 0);
    setIsLoading(false);
  };

  useEffect(() => {
    handleLoadUsers(page);
  }, [page]);

  return (
    <>
      <UserPermissionHeader />
      <div className="relative overflow-x-auto shadow-sm border border-gray-300 md:rounded-xl mt-5">
        {!isLoading && (
          <>
            <UserPermissionSearch
              users={usersRef.current}
              setUsers={setUsers}
              isSearching={isSearching}
              setIsSearching={setIsSearching}
            />
          </>
        )}

        <UserPermissionTable
          users={users}
          setUsers={setUsers}
          isLoading={isLoading}
        />

        <TablePagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
        />
      </div>

    </>
  )
}
