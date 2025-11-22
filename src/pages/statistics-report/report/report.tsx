import { useState } from "react";
import Container from "@/layout/container";
import { useRolePermission } from "@/api/permissions-provider";
import { getPermissions } from "@/lib/function";
import AccessPage from "@/pages/access-page";
import { ReportProps } from "@/types/types";
import ReportSearch from "./report-search";
import ReportTable from "./report-table";

export default function Report() {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canSeeReport = getPermissions(permissions, "Informes y estadísticas", "Informes")?.canAccess;
  const REPORTS: ReportProps[] = [
    { name: 'Ventas mensuales', category: 'Ventas' },
    { name: 'Ventas brutas mensuales', category: 'Ventas' },
    { name: 'Ventas de llantas mensuales', category: 'Ventas' },
    { name: 'Compras mensuales', category: 'Compras' },
    { name: 'Clientes con cuentas pendientes', category: 'Ventas' },
    { name: 'Productos mas vendidos', category: 'Ventas' },
    { name: 'Productos menos vendidos', category: 'Ventas' },
    { name: 'Inventario final del mes', category: 'Inventario' },
    { name: 'Traslados de bodegas', category: 'Inventario' },
    { name: 'Inventario final monetario', category: 'Inventario' },
    { name: "Inventario final monetario por bodega", category: "Inventario" },
  ];

  const [reports, setReports] = useState<ReportProps[]>(REPORTS);

  return (
    <Container>
      {canSeeReport ? (
        <>
          <h2 className="font-bold text-[20px] text-secondary/90 md:px-0 px-4 mb-5">Reportes</h2>
          <div className="relative overflow-x-auto shadow-sm border border-gray-300 md:rounded-xl">
            <ReportSearch
              reports={REPORTS}
              setReports={setReports}
              isSearching={isSearching}
              setIsSearching={setIsSearching}
            />

            <ReportTable reports={reports} setReports={setReports} />
          </div>
        </>
      ) : (
        <AccessPage />
      )}
    </Container>
  );
}
