import { supabase } from "@/api/supabase-client";
import FieldInput from "@/components/form/field-input";
import SelectForm from "@/components/form/select-form";
import Modal from "@/components/modal";
import { showToast } from "@/components/toast";
import FormSection from "@/layout/form-section";
import { CategoryCustomerProps, CustomerProps } from "@/types/types";
import { Dispatch, SetStateAction } from "react";

interface GeneralInformationCustomerProps {
  categoryCustomer: CategoryCustomerProps[];
  modalData: { categoryCustomer: string };
  handleChangeShowModal: (name: 'categoryCustomer', value: boolean) => void;
  handleChangeModalData: (name: 'categoryCustomer', value: string) => void;
  handleChangeFormData: (name: keyof Omit<CustomerProps, 'customerId' | 'createdAt' | 'categoryCustomerName'>, value: string | number) => void;
  isModalOpen: { categoryCustomer: boolean }
  formData: { customerName: string, customerLastName: string, dni: string, categoryCustomerId: string, address: string };
  setCategoryCustomer: Dispatch<SetStateAction<CategoryCustomerProps[]>>;
}

export default function GeneralInformationCustomer({ modalData, handleChangeShowModal, handleChangeModalData, handleChangeFormData, isModalOpen, formData, categoryCustomer, setCategoryCustomer }: GeneralInformationCustomerProps) {

const handleSubmitCategoryCustomer = async () => {
  if (modalData.categoryCustomer.trim() === "") {
    showToast("El nombre de la categoria de cliente no puede estar vacío.", false);
    return;
  }

  const { data, error } = await supabase.from("categoryCustomer").insert({
    categoryCustomerName: modalData.categoryCustomer,
  }).select();

  if (error) {
    showToast(error.message, false);
  } else {
    const newCategory = {
      categoryCustomerName: modalData.categoryCustomer,
      categoryCustomerId: data[0].categoryCustomerId,
      createdAt: data[0].createdAt,
      state: true
    };

    // Agregar a la lista
    setCategoryCustomer([...categoryCustomer, newCategory]);

    // 🔥 Asignar el nuevo ID directamente al formulario principal
    handleChangeFormData("categoryCustomerId", data[0].categoryCustomerId);

    showToast("Categoria de cliente registrada exitosamente", true);
    handleChangeShowModal('categoryCustomer', false);
    handleChangeModalData("categoryCustomer", "");
  }
};
  return (
    <FormSection name='Información del cliente'>
      <>
        <FieldInput
          name='Nombre'
          className='mb-5'
          id='nameCustomer'
          value={formData.customerName}
          onChange={(e) => handleChangeFormData('customerName', e.target.value)}
        />
        <FieldInput
          value={formData.customerLastName}
          onChange={(e) => handleChangeFormData('customerLastName', e.target.value)}
          name='Apellido' id='lastNameCustomer'
          className='mb-5'
          placeholder="Apellido o razon social"
        />

        <div className='flex md:flex-row md:space-y-0 md:space-x-2 space-x-0 space-y-4 flex-col items-center w-full mt-5'>
          <FieldInput
            id='dni'
            value={formData.dni}
            name='Identificación'
            className='w-full'
            placeholder="Cedula de identidad o RUC"
            onChange={(e) => handleChangeFormData('dni', e.target.value)}
          />
          <SelectForm
            name="Categoria cliente"
            placeholder="Buscar o crear nueva categoria cliente"
            id="categoryCustomer"
            options={categoryCustomer.map((categoryCustomer) =>
              ({ title: categoryCustomer.categoryCustomerName, value: categoryCustomer.categoryCustomerId }))}
            onClick={() => handleChangeShowModal('categoryCustomer', true)}
            onChange={(value) => {  console.log("Valor seleccionado del select:", value);
handleChangeFormData('categoryCustomerId', value.toString())}}
            value={formData.categoryCustomerId}
          />

        </div>
        {isModalOpen.categoryCustomer && (
          <Modal
            onClose={() =>
              handleChangeShowModal('categoryCustomer', false)}
            name="Nueva categoria de cliente"
            onClickSave={handleSubmitCategoryCustomer}>
            <FieldInput className="p-4"
              name="Nombre de categoria de cliente"
              placeholder="Escribe un nombre de categoria de cliente..."
              id="categoryCustomer-name"
              value={modalData.categoryCustomer}
              onChange={(e) =>
                handleChangeModalData('categoryCustomer', e.target.value)}
            />
          </Modal>
        )}
      </>
    </FormSection>
  )
}