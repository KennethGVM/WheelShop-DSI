import { supabase } from "@/api/supabase-client";
import FieldInput from "@/components/form/field-input";
import FieldSelect from "@/components/form/field-select";
import SubHeader from "@/components/sub-header";
import { showToast } from "@/components/toast";
import Container from "@/layout/container";
import FormSection from "@/layout/form-section";
import { CategoryCustomerProps, CustomerProps, DepartmetProps, MunicipalityProps } from "@/types/types";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GeneralInformationCustomer from "./general-information-customer";
import CustomerAddress from "./customer-address";
import { formatNicaraguanPhone, validateEmailFormat } from "@/lib/utils/formatters";

const validateNicaraguanCedula = (cedula: string): { isValid: boolean; message?: string } => {
  const cedulaRegex = /^\d{3}-\d{6}-\d{4}[A-Z]$/;
  if (!cedulaRegex.test(cedula)) {
    return { isValid: false, message: "El formato de la cédula debe ser 000-000000-0000A" };
  }

  const day = parseInt(cedula.substring(4, 6), 10);
  const month = parseInt(cedula.substring(6, 8), 10) - 1;
  const yearShort = parseInt(cedula.substring(8, 10), 10);

  let year = 2000 + yearShort;
  if (year > 2026) {
    year = 1900 + yearShort;
  }

  const birthDate = new Date(year, month, day);

  if (birthDate.getFullYear() !== year || birthDate.getMonth() !== month || birthDate.getDate() !== day) {
    return { isValid: false, message: "La fecha de nacimiento en la cédula no es una fecha válida." };
  }

  const today = new Date(2026, 5, 16);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 18) {
    return { isValid: false, message: "El cliente debe ser mayor de edad (mínimo 18 años)." };
  }

  return { isValid: true };
};

const validateNicaraguanRuc = (ruc: string): { isValid: boolean; message?: string } => {
  if (!ruc.startsWith('J')) {
    return { isValid: false, message: "El RUC debe iniciar con la letra 'J'." };
  }
  if (ruc.includes('-')) {
    return { isValid: false, message: "El RUC no debe contener guiones." };
  }
  return { isValid: true };
};

export default function AddCustomer() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [categoryCustomer, setCategoryCustomer] = useState<CategoryCustomerProps[]>([]);
  const [isModalOpen, setIsModalOpen] = useState({ categoryCustomer: false, address: false });
  const [modalData, setModalData] = useState({ categoryCustomer: '' });
  const [departments, setDepartments] = useState<DepartmetProps[]>([]);
  const [municipalities, setMunicipalities] = useState<MunicipalityProps[]>([]);
  const [savedAddress, setSavedAddress] = useState<string | null | boolean>(false);

  const INITIAL_FORM_DATA = {
    customerName: '',
    customerLastName: '',
    dni: '',
    email: '',
    phone: '',
    categoryCustomerId: '',
    state: true,
    address: '',
    departmentId: '',
    municipalityId: '',
    departmentName: '',
    municipalityName: '',
    isNatural: true,
    identificationType: 0
  };

  const handleChangeModalData = (name: keyof typeof modalData, value: string) => {
    setModalData((prev) => ({ ...prev, [name]: value }));
  }

  const handleChangeShowModal = (name: keyof typeof isModalOpen, value: boolean) => {
    setIsModalOpen((prev) => ({ ...prev, [name]: value }));
  }

  const [formData, setFormData] = useState<Omit<CustomerProps, 'customerId' | 'createdAt' | 'categoryCustomerName'>>(INITIAL_FORM_DATA);
  const handleChangeFormData = (name: keyof typeof formData, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  useEffect(() => {
    const handleLoadCategoryCustomers = async () => {
      const { data } = await supabase.from('categoryCustomer').select('*');
      setCategoryCustomer(data as CategoryCustomerProps[]);
    }
    handleLoadCategoryCustomers();
  }, [])

  useEffect(() => {
    const handleLoadDepartments = async () => {
      const { data } = await supabase.from('department').select('*');
      setDepartments(data as DepartmetProps[]);
    }
    handleLoadDepartments();
  }, [])

  useEffect(() => {
    const handleLoadMunicipalitiesByDepartment = async () => {
      if (!formData.departmentId) {
        setMunicipalities([]);
        return;
      }
      const { data, error } = await supabase
        .from('municipality')
        .select('*')
        .eq('departmentId', formData.departmentId);

      if (!error) {
        setMunicipalities(data as MunicipalityProps[]);
      }
    };
    handleLoadMunicipalitiesByDepartment();
  }, [formData.departmentId]);

  useEffect(() => {
    const handleLoadCustomerById = async () => {
      const { data, error } = await supabase.from('getcustomers').select('*').eq('customerId', customerId).single();
      const customerData = data as CustomerProps;
      if (error) {
        showToast('Error al cargar cliente', false);
      } else if (data) {
        setFormData({
          customerName: customerData.customerName || '',
          dni: data.dni || '',
          customerLastName: customerData.customerLastName || '',
          email: customerData.email || '',
          phone: customerData.phone || '',
          state: customerData.state,
          categoryCustomerId: customerData.categoryCustomerId || '',
          address: customerData.address || '',
          departmentId: customerData.departmentId || '',
          municipalityId: customerData.municipalityId || '',
          departmentName: customerData.departmentName || '',
          municipalityName: customerData.municipalityName || '',
          isNatural: customerData.isNatural,
          identificationType: customerData.identificationType || 0
        });
        const fullAddress = `${customerData.municipalityName || ''}\n${customerData.departmentName || ''}\nNicaragua\n${customerData.address || ''}`
        setSavedAddress(fullAddress)
      }
    }
    if (customerId) handleLoadCustomerById();
  }, [customerId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      showToast("El nombre del cliente es obligatorio.", false);
      return;
    }

    if (!formData.customerLastName.trim()) {
      showToast("El apellido del cliente es obligatorio.", false);
      return;
    }

    if (!formData.categoryCustomerId || formData.categoryCustomerId.trim() === "") {
      showToast("La categoría del cliente no puede estar vacía.", false);
      return;
    }

    if (!formData.dni || formData.dni.trim() === "") {
      showToast("La identificación del cliente no puede estar vacía.", false);
      return;
    }

    if (formData.identificationType === 0) {
      const cedulaCheck = validateNicaraguanCedula(formData.dni.trim());
      if (!cedulaCheck.isValid) {
        showToast(cedulaCheck.message || "Identificación inválida", false);
        return;
      }
    }

    if (formData.identificationType === 3) {
      const rucCheck = validateNicaraguanRuc(formData.dni.trim());
      if (!rucCheck.isValid) {
        showToast(rucCheck.message || "Identificación inválida", false);
        return;
      }
    }

    if (!formData.departmentId || formData.departmentId.trim() === "") {
      showToast("El departamento es obligatorio.", false);
      return;
    }

    if (!formData.municipalityId || formData.municipalityId.trim() === "") {
      showToast("El municipio es obligatorio.", false);
      return;
    }

    if (!formData.address || formData.address.trim() === "") {
      showToast("La dirección es obligatoria.", false);
      return;
    }

    if (formData.email && formData.email.trim() !== '') {
      if (!validateEmailFormat(formData.email.trim())) {
        showToast('El correo electrónico no tiene un formato válido.', false);
        return; // Detiene la ejecución
      }
    }

    const validations = [
      { field: 'dni', message: 'Ya existe un cliente con esta identificación.' },
      { field: 'email', message: 'Ya existe un cliente con este correo.' },
      { field: 'phone', message: 'Ya existe un cliente con este teléfono.' },
    ] as const;

    for (const { field, message } of validations) {
      const value = formData[field];
      if (!value || value.toString().trim() === '') continue;

      const query = supabase
        .from('customer')
        .select('customerId')
        .eq(field, value.toString().trim());

      if (customerId) {
        query.neq('customerId', customerId);
      }

      const { data, error } = await query;

      if (error) {
        showToast(`Error al validar el campo "${field}"`, false);
        return;
      }

      if (data && data.length > 0) {
        showToast(message, false);
        return;
      }
    }

    const { departmentId, departmentName, municipalityName, categoryCustomerId, ...rest } = formData;

    const dataToSave = {
      ...rest,
      ...(categoryCustomerId.trim() ? { categoryCustomerId } : {}),
      municipalityId: formData.municipalityId.trim() === "" ? null : formData.municipalityId.trim(),
    };

    const { error } = customerId
      ? await supabase.from('customer').update(dataToSave).eq('customerId', customerId)
      : await supabase.from('customer').insert(dataToSave);

    if (error) {
      showToast(error.message, false);
    } else {
      showToast(customerId ? 'Cliente actualizado exitosamente' : 'Cliente registrado exitosamente', true);
      if (!customerId) handleCleanForm();
    }
  };

  const handleCleanForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setSavedAddress(false);
  };

  const handleChangeFormState = (name: keyof typeof formData, value: string | number | boolean) => {
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <Container text='Cliente no guardado' save onSaveClick={handleFormSubmit} onClickSecondary={() => navigate("/customers/")}>
      <>
        <section className="flex flex-col items-center h-full">
          <div className="max-w-screen-lg mt-2 w-full mx-auto">
            <SubHeader title={!customerId ? 'Añadir cliente' : `${formData.customerName} ${formData.customerLastName}`} backUrl="/customers" isShowButtons={customerId ? true : false} status={formData.state} />

            <form onSubmit={handleSubmit} ref={formRef} className="flex flex-1 xl:space-x-6 flex-col xl:flex-row items-start w-full">
              <div className="flex-1 md:w-auto w-full">
                <GeneralInformationCustomer
                  categoryCustomer={categoryCustomer}
                  setCategoryCustomer={setCategoryCustomer}
                  modalData={modalData}
                  handleChangeShowModal={handleChangeShowModal}
                  handleChangeModalData={handleChangeModalData}
                  handleChangeFormData={handleChangeFormData}
                  isModalOpen={isModalOpen}
                  formData={formData}
                />
                <CustomerAddress
                  handleChangeFormData={handleChangeFormData}
                  handleChangeShowModal={handleChangeShowModal}
                  isModalOpen={isModalOpen}
                  departments={departments}
                  formData={formData}
                  savedAddress={savedAddress}
                  setSavedAddress={setSavedAddress}
                  municipalities={municipalities}
                />

                <FormSection name='Metodos de contacto'>
                  <>
                    <FieldInput value={formData.email} onChange={(e) =>
                      handleChangeFormState('email', e.target.value)} name='Correo' id='email' className='mb-5' placeholder="Ej: correo@ejemplo.com" />
                    <FieldInput
                      name='Telefono'
                      id='phone'
                      value={formData.phone}
                      maxLength={14}
                      onChange={(e) => {
                        const formattedPhone = formatNicaraguanPhone(e.target.value);
                        handleChangeFormState('phone', formattedPhone);
                      }}
                    />
                  </>
                </FormSection>
              </div>
              <div className="w-full md:w-1/3">
                <FormSection name='Estado'>
                  <FieldSelect
                    value={formData.state ? 1 : 0}
                    onChange={(e) =>
                      handleChangeFormState('state', Number(e.target.value) === 1)
                    }
                    id="state"
                    options={[
                      { name: 'Activo', value: 1 },
                      { name: 'Inactivo', value: 0 },
                    ]}
                  />
                </FormSection>
              </div>
            </form>
          </div>
        </section>
      </>
    </Container>
  )
}