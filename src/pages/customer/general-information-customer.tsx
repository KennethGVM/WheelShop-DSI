import { supabase } from "@/api/supabase-client";
import FieldInput from "@/components/form/field-input";
import FieldSelect from "@/components/form/field-select";
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
  formData: { isNatural: boolean, identificationType: number, customerName: string, customerLastName: string, dni: string, categoryCustomerId: string, address: string };
  setCategoryCustomer: Dispatch<SetStateAction<CategoryCustomerProps[]>>;
}

const formatNicaraguanDocument = (value: string, type: number): string => {
  const clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  switch (type) {
    case 0: {
      const digits = clean.slice(0, 13).replace(/[^0-9]/g, '');
      const letter = clean.slice(13, 14).replace(/[^A-Z]/g, '');
      const combined = digits + letter;

      let formatted = combined.slice(0, 3);
      if (combined.length > 3) formatted += '-' + combined.slice(3, 9);
      if (combined.length > 9) formatted += '-' + combined.slice(9, 13);
      if (combined.length > 13) formatted += combined.slice(13, 14);
      return formatted;
    }
    case 3: {
      if (!clean) return '';
      const digits = clean.startsWith('J')
        ? clean.slice(1).replace(/[^0-9]/g, '')
        : clean.replace(/[^0-9]/g, '');
      return ('J' + digits).slice(0, 14);
    }
    default:
      return clean.slice(0, 15);
  }
};

const validateCedulaAge = (cedula: string): { isValid: boolean; message?: string } => {
  if (cedula.length < 10) return { isValid: true };

  const day = parseInt(cedula.substring(4, 6), 10);
  const month = parseInt(cedula.substring(6, 8), 10) - 1;
  const yearShort = parseInt(cedula.substring(8, 10), 10);

  let year = 2000 + yearShort;
  if (year > 2026) {
    year = 1900 + yearShort;
  }

  const birthDate = new Date(year, month, day);

  if (birthDate.getFullYear() !== year || birthDate.getMonth() !== month || birthDate.getDate() !== day) {
    return { isValid: false, message: "La fecha de nacimiento en la cédula no es válida." };
  }

  const today = new Date(2026, 5, 16);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 18) {
    return { isValid: false, message: "El ciudadano debe ser mayor de edad (mínimo 18 años)." };
  }

  return { isValid: true };
};

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

      setCategoryCustomer([...categoryCustomer, newCategory]);
      handleChangeFormData("categoryCustomerId", data[0].categoryCustomerId);
      showToast("Categoria de cliente registrada exitosamente", true);
      handleChangeShowModal('categoryCustomer', false);
      handleChangeModalData("categoryCustomer", "");
    }
  };

  const isNaturalActive = formData.isNatural === true || String(formData.isNatural) === 'true';

  const identificationOptions = isNaturalActive
    ? [
      { name: 'Cédula de Identidad Ciudadana', value: 0 },
      { name: 'Pasaporte', value: 1 },
      { name: 'Carnet de residencia', value: 2 },
    ]
    : [
      { name: 'RUC', value: 3 },
    ];

  return (
    <FormSection name='Información del cliente'>
      <>
        <FieldSelect
          name='Tipo de Persona'
          className='mb-5'
          id='isNatural'
          value={isNaturalActive ? 'true' : 'false'}
          onChange={(e) => {
            const valueStr = e.target.value;
            const isNaturalBool = valueStr === 'true';

            handleChangeFormData('isNatural', valueStr);
            handleChangeFormData('identificationType', isNaturalBool ? 0 : 3);
            handleChangeFormData('dni', '');
          }}
          options={[
            { name: 'Persona Natural', value: 'true' },
            { name: 'Persona Jurídica', value: 'false' },
          ]}
        />

        <FieldInput
          name={isNaturalActive ? 'Nombre' : 'Razón Social'}
          className='mb-5'
          id='nameCustomer'
          value={formData.customerName}
          onChange={(e) => handleChangeFormData('customerName', e.target.value)}
        />

        {isNaturalActive && (
          <FieldInput
            value={formData.customerLastName}
            onChange={(e) => handleChangeFormData('customerLastName', e.target.value)}
            name='Apellido'
            id='lastNameCustomer'
            className='mb-5'
            placeholder="Apellido del cliente"
          />
        )}

        <FieldSelect
          name="Tipo de identificación"
          value={formData.identificationType}
          onChange={(e) => {
            handleChangeFormData('identificationType', Number(e.target.value));
            handleChangeFormData('dni', '');
          }}
          id="identificationType"
          options={identificationOptions}
        />

        <div className='flex md:flex-row md:space-y-0 md:space-x-2 space-x-0 space-y-4 flex-col items-center w-full mt-5'>
          <FieldInput
            id='dni'
            value={formData.dni}
            name='Identificación'
            className='w-full'
            placeholder={
              formData.identificationType === 0 ? "001-000000-0000A" :
                formData.identificationType === 3 ? "J0110000000000" : "Número de documento"
            }
            onChange={(e) => {
              const formattedValue = formatNicaraguanDocument(e.target.value, formData.identificationType);
              handleChangeFormData('dni', formattedValue);

              if (formData.identificationType === 0 && formattedValue.length === 16) {
                const ageValidation = validateCedulaAge(formattedValue);
                if (!ageValidation.isValid) {
                  showToast(ageValidation.message || "Cédula inválida", false);
                  handleChangeFormData('dni', '');
                }
              }
            }}
          />
          <SelectForm
            name="Categoria cliente"
            placeholder="Buscar o crear nueva categoria cliente"
            id="categoryCustomer"
            options={categoryCustomer.map((categoryCustomer) =>
              ({ title: categoryCustomer.categoryCustomerName, value: categoryCustomer.categoryCustomerId }))}
            onClick={() => handleChangeShowModal('categoryCustomer', true)}
            onChange={(value) => {
              handleChangeFormData('categoryCustomerId', value.toString())
            }}
            value={formData.categoryCustomerId}
          />
        </div>

        {isModalOpen.categoryCustomer && (
          <Modal
            onClose={() => handleChangeShowModal('categoryCustomer', false)}
            name="Nueva categoria de cliente"
            onClickSave={handleSubmitCategoryCustomer}>
            <FieldInput className="p-4"
              name="Nombre de categoria de cliente"
              placeholder="Escribe un nombre de categoria de cliente..."
              id="categoryCustomer-name"
              value={modalData.categoryCustomer}
              onChange={(e) => handleChangeModalData('categoryCustomer', e.target.value)}
            />
          </Modal>
        )}
      </>
    </FormSection>
  )
}