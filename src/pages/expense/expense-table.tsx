import Button from "@/components/form/button";
import CheckBox from "@/components/form/check-box";
import { ArchiveIcon, ArrowDownIcon, SearchIcon, } from "@/icons/icons";
import { ExpenseProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { supabase } from "@/api/supabase-client";
import { showToast } from "@/components/toast";
import Modal from "@/components/modal";
import TableSkeleton from "@/components/table-skeleton";
import { currencyFormatter } from "@/lib/function";
import StatusTags from "@/components/status-tags";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/components/form/dropdown";

interface ExpenseTableProps {
  expenses: ExpenseProps[];
  setExpenses: Dispatch<SetStateAction<ExpenseProps[]>>;
  isLoading: boolean;
}

export default function ExpenseTable({ expenses, setExpenses, isLoading }: ExpenseTableProps) {
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      setIsScrolled(scrollContainer.scrollLeft > 0);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const HEADERS = [
    { title: "Nombre", isNumeric: false },
    { title: "Descripción", isNumeric: false },
    { title: "Categoria", isNumeric: false },
    { title: "Monto", isNumeric: false },
    { title: "Moneda", isNumeric: false },
    { title: "Metodo de pago", isNumeric: false },
    { title: "Fecha", isNumeric: false },
    { title: "Usuario", isNumeric: false },
  ];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = expenses.map(expense => expense.expenseId);
      setSelectedExpenseIds(allIds);
      setSelectAll(true);
    } else {
      setSelectedExpenseIds([]);
      setSelectAll(false);
    }
  };

  const handleSelectExpense = (expenseId: string, checked: boolean) => {
    const newSelectedIds = checked
      ? [...selectedExpenseIds, expenseId]
      : selectedExpenseIds.filter(id => id !== expenseId);

    setSelectedExpenseIds(newSelectedIds);
    setSelectAll(newSelectedIds.length === expenses.length);
  };


  const deleteSelectedExpenses = async () => {
    if (selectedExpenseIds.length === 0) return;

    const { error } = await supabase
      .from("expense")
      .delete()
      .in("expenseId", selectedExpenseIds);

    if (error) {
      showToast("Error al eliminar", false);
      return;
    }

    setExpenses(prev =>
      prev.filter(expense => !selectedExpenseIds.includes(expense.expenseId))
    );
    setSelectedExpenseIds([]);
    setSelectAll(false);
    showToast("Eliminado correctamente", true);
    setIsModalOpen(false);
  };

  return (
    <>
      <div ref={scrollContainerRef} className='relative overflow-x-auto sm:block hidden'>
        <table className="w-full min-w-[1200px] bg-white">
          {expenses && expenses.length > 0 &&
            <thead className="text-2xs text-secondary/80 bg-[#f7f7f7] border-y border-gray-300">
              <tr className={`${selectedExpenseIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} relative`}>
                <th className={`px-2 py-2 sticky inset-y-0 h-full left-0 z-10 ${selectedExpenseIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} before:content-[''] before:absolute before:top-0 before:right-0 before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative px-2 py-2.5`}>
                  <div className='flex items-center space-x-2'>
                    <CheckBox
                      initialValue={selectAll}
                      onChange={(value) => handleSelectAll(value)}
                    />
                    <div className={`absolute left-8 inset-y-2 flex items-center pl-2`}>
                      {selectedExpenseIds.length > 0 && <span className='text-secondary/80 text-xs font-semibold'>Seleccionados: {selectedExpenseIds.length}</span>}
                    </div>
                    <span className={`text-secondary/80 font-semibold text-xs ${selectedExpenseIds.length === 0 ? 'visible' : 'invisible'}`}>{HEADERS[0].title}</span>
                  </div>
                </th>
                {HEADERS.slice(1).map(({ title, isNumeric }, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={`px-6 py-2.5 ${selectedExpenseIds.length === 0 ? 'visible' : 'invisible'} text-secondary/80 font-semibold text-xs ${isNumeric ? "text-right" : "text-left"}`}
                  >
                    {title}
                  </th>
                ))}

                {selectedExpenseIds.length > 0 && (
                  <div className="absolute right-0 inset-y-0 flex items-center pr-2 space-x-1">
                    <Button
                      name="Eliminar"
                      styleButton="primary"
                      className="px-2 py-1.5 text-xs font-semibold text-secondary/80"
                      onClick={() => setIsModalOpen(true)}
                    />
                  </div>
                )}
              </tr>
            </thead>
          }

          {isLoading ? (
            <TableSkeleton columns={HEADERS.length + 1} />
          ) : (
            <tbody>
              {expenses && expenses.length > 0 ? (
                expenses.map((expense) => (
                  <tr
                    key={expense.expenseId}
                    className={`${selectedExpenseIds.includes(expense.expenseId)
                      ? 'bg-whiting2'
                      : 'bg-white'
                      } cursor-pointer text-2xs font-medium ${expense !== expenses[expenses.length - 1] ? 'border-b' : 'border-b-0'
                      } group text-secondary/80 border-gray-300 hover:bg-[#F7F7F7]`}
                  >
                    <td
                      className={`px-2 py-4 md:w-auto w-[20%] sticky inset-y-0 h-full left-0 z-10 bg-white group-hover:bg-[#F7F7F7]
                           before:content-[''] before:absolute before:top-0 before:right-0
                           before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity
                           ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative ${selectedExpenseIds.includes(expense.expenseId) ? 'bg-whiting2' : 'bg-white'}`}
                    >
                      <div className="flex items-center space-x-2">
                        <CheckBox
                          initialValue={selectedExpenseIds.includes(expense.expenseId)}
                          onChange={(value) => handleSelectExpense(expense.expenseId, value)}
                        />
                        <span>{expense.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{expense.description}</td>
                    <td className="py-4 px-4">
                      {expense.isCommission === true ? (
                        <StatusTags
                          status={true}
                          text="Comisión"
                          color="bg-[#affebf]"
                          textColor="text-[#014b40]"
                        />
                      ) : (
                        <StatusTags
                          status={false}
                          text="Gasto"
                          color="bg-[#ffabab]"
                          textColor="text-[#d10000]"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {currencyFormatter(
                        expense.amount,
                        expense.currencyName === "Dolares" ? "USD" : "NIO"
                      )}
                    </td>
                    <td className="px-6 py-4">{expense.currencyName}</td>
                    <td className="px-6 py-4">
                      {expense.paymentMethodName}
                    </td>
                    <td className="px-6 py-4">
                      {expense.createdAt
                        ? new Date(expense.createdAt).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        }).replace('.', '') : ''}
                    </td>
                    <td className="px-6 py-4">{expense.userName}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={HEADERS.length + 1} className="text-center border-t text-secondary/80">
                    <div className='flex flex-col items-center justify-center space-y-3 py-4'>
                      <SearchIcon className='size-16 fill-[#8c9196]' />
                      <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de gastos / comisiones</p>
                      <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>

      <div className={`bg-white ${expenses.length > 0 ? 'border-t' : ''} sm:hidden block border-gray-300`}>
        {expenses && expenses.length > 0 ? (
          expenses.map((expense, index) => (
            <div className={`flex items-start justify-between ${index !== expenses.length - 1 ? 'border-b' : ''} w-full`}>
              <div key={expense.expenseId} className='flex space-x-1 items-start px-4 py-3 w-full'>
                <CheckBox
                  initialValue={selectedExpenseIds.includes(expense.expenseId)}
                  onChange={(value) => handleSelectExpense(expense.expenseId, value)}
                />
                <div className='flex flex-col space-y-1 w-full'>
                  <div className="flex items-center justify-between w-full">
                    <span className='text-secondary font-medium text-base'>{expense.name}</span>
                    <span className='text-secondary/80 font-medium text-base'>{currencyFormatter(expense.amount)}</span>
                  </div>
                  <span className='text-secondary/80 font-medium text-base'>{expense.paymentMethodName} • {expense.currencyName}</span>
                  <span className='text-secondary/80 font-[550] text-sm'>{expense.userName}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center space-y-3 py-4'>
            <SearchIcon className='size-16 fill-[#8c9196]' />
            <p className='text-primary font-semibold text-xl text-center'>No se encontró ningún recurso de orden de compras</p>
            <p className='text-2xs font-medium text-secondary/80 text-center'>Prueba a cambiar los filtros o el término de búsqueda</p>
          </div>
        )}
      </div>

      {selectedExpenseIds.length > 0 && (
        <div className="fixed sm:hidden block bottom-4 left-4 right-4 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#F7F7F7] border border-gray-300 rounded-lg shadow-lg px-4 py-2">
              <div className="flex items-center justify-between">
                <Dropdown closeToClickOption>
                  <DropdownTrigger>
                    <Button className="flex items-center space-x-1 text-primary text-sm font-medium border border-gray-300 px-2 py-1 bg-white">
                      <span>{selectedExpenseIds.length} seleccionado(s)</span>
                      <ArrowDownIcon className='size-4 stroke-none fill-primary' />
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent align="start" position='top' className="rounded-xl px-0 py-0">
                    {!selectAll && <DropdownItem onClick={() => handleSelectAll(true)} className='mx-0 rounded-b-none text-base py-3 px-4'>Seleccionar los {expenses.length} en la página</DropdownItem>}
                    <DropdownItem onClick={() => handleSelectAll(false)} className='mx-0 rounded-t-none text-base py-3 px-4'>Deseleccionar todo</DropdownItem>
                  </DropdownContent>
                </Dropdown>

                <Dropdown closeToClickOption>
                  <DropdownTrigger>
                    <Button className="space-x-1 text-primary text-sm font-medium border border-gray-300 px-2 py-1 bg-white">
                      <span>Acciones</span>
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent align="end" position='top' className="rounded-xl px-0 py-0">
                    <DropdownItem onClick={() => setIsModalOpen(true)}
                      className='space-x-2 mx-0 rounded-b-none text-base py-3 px-4'>
                      <ArchiveIcon className='size-5' />
                      <span>Eliminar</span>
                    </DropdownItem>
                  </DropdownContent>
                </Dropdown>
              </div>

            </div>
          </div>
        </div >
      )}

      {isModalOpen && (

        <Modal
          name='Eliminar gastos / comisiones'
          onClickSave={deleteSelectedExpenses}
          classNameModal='px-4 py-3'
          principalButtonName='Guardar'
          onClose={() => setIsModalOpen(false)}>
          <p className='font-normal text-secondary/80 md:text-2xs text-base'>
            ¿Está seguro de eliminar los gastos / comisiones seleccionados?
          </p>
        </Modal>
      )}
    </>
  );
}
