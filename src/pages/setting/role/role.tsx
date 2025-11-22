import { useEffect, useRef, useState } from "react";
import { RoleProps } from "@/types/types";
import { supabase } from "@/api/supabase-client";
import TablePagination from "@/components/table-pagination";
import { showToast } from "@/components/toast";
import RoleHeader from "./role-header";
import RoleSearch from "./role-search";
import RoleTable from "./role-table";

export default function Role() {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [roles, setRoles] = useState<RoleProps[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;
  const totalPages = Math.ceil(totalUsers / pageSize);
  const rolesRef = useRef<RoleProps[]>([]);

  const handleLoadRoles = async (currentPage: number) => {
    setIsLoading(true);

    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await supabase
      .from('getroles')
      .select('*', { count: 'exact' })
      .range(from, to)


    if (error) {
      showToast(error.message, false)
      setIsLoading(false);
      return;
    }
    setRoles(data as RoleProps[]);
    rolesRef.current = data as RoleProps[];
    setTotalUsers(count || 0);
    setIsLoading(false);
  };

  useEffect(() => {
    handleLoadRoles(page);
  }, [page]);

  return (
    <>
      <RoleHeader />

      <div className="relative overflow-x-auto shadow-sm border border-gray-300 sm:rounded-xl mt-5">
        {!isLoading && (
          <>
            <RoleSearch
              roles={rolesRef.current}
              setRoles={setRoles}
              isSearching={isSearching}
              setIsSearching={setIsSearching}
            />
          </>
        )}

        <RoleTable
          roles={roles}
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
