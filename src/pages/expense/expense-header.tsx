import Button from "@/components/form/button";
import { useEffect, useState } from "react";
import { ExpenseProps } from "@/types/types";
import { Dispatch, SetStateAction } from "react";
import AddExpense from "./add-expense";
import { supabase } from "@/api/supabase-client";
import ExportDataModal from "@/components/export-data-modal";

interface ExpenseHeaderProps {
  expenses: ExpenseProps[]
  setExpenses: Dispatch<SetStateAction<ExpenseProps[]>>;
}

export default function ExpenseHeader({ expenses, setExpenses }: ExpenseHeaderProps) {
  const [allExpenses, setAllExpenses] = useState<unknown[]>([]);
  const [isModalOpen, setIsModalOpen] = useState({
    expenseModal: false,
    exportModal: false,
  });
  const [isAllowToSale, setIsAllowToSale] = useState(false);

  useEffect(() => {
    const handleLoadStatus = async () => {
      const { data } = await supabase.from('cashbox_status').select('*').single();
      setIsAllowToSale(data.anyOpen);
    };

    handleLoadStatus();
  }, []);

  const handleChangeModal = (name: keyof typeof isModalOpen, value: boolean) => {
    setIsModalOpen((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoadAllExpenses = async () => {
    const { data } = await supabase.from('getexpenses').select('*');
    const expensesData = data as ExpenseProps[];
    const all: unknown[] = expensesData.map(expense => ({
      Nombre: expense.name,
      Fecha: new Date(expense.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      "Método de pago": expense.paymentMethodName,
      "Cuenta": expense.userName,
      "Moneda": expense.currencyName,
      "Cantidad": expense.amount,
    }));

    setAllExpenses(all);
    handleChangeModal('exportModal', true);
  }

  const dataExport = expenses.map(expense => ({
    Nombre: expense.name,
    Fecha: new Date(expense.createdAt).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    "Método de pago": expense.paymentMethodName,
    "Cuenta": expense.userName,
    "Moneda": expense.currencyName,
    "Cantidad": expense.amount,
  }));

  return (
    <>
      <header className="flex items-center justify-between mb-5 md:px-0 px-4">
        <h2 className="font-bold text-[20px] text-secondary/90">Gastos / Comisiones</h2>
        <div className="flex items-center space-x-2">
          <Button
            name="Exportar"
            onClick={handleLoadAllExpenses}
            className="md:px-3 md:py-1 px-4 py-2.5 bg-[#d4d4d4] md:text-2xs text-base font-medium text-secondary"
            styleButton="simple"
          />
          {isAllowToSale &&
          <Button
            onClick={() => handleChangeModal('expenseModal', true)}
            name="Añadir Gasto / Comisión"
            styleButton="secondary"
            className="md:px-3 md:py-1 p-2.5 md:text-2xs text-base font-medium"
          />
          }
        </div>
      </header>

      {isModalOpen.expenseModal && (
        <AddExpense
          isOpen={isModalOpen.expenseModal}
          onClose={() => handleChangeModal('expenseModal', false)}
          setExpenses={setExpenses}
        />
      )}

      <ExportDataModal isOpen={isModalOpen.exportModal} onClose={() => handleChangeModal('exportModal', false)} data={dataExport} fileName="gastos / comisiones" allData={allExpenses} />
    </>
  );
}
