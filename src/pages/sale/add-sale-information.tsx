import { supabase } from '@/api/supabase-client';
import FieldInput from '@/components/form/field-input';
import FieldSelect from '@/components/form/field-select';
import SelectForm from '@/components/form/select-form';
import TextArea from '@/components/form/text-area';
import Modal from '@/components/modal';
import { showToast } from '@/components/toast';
import ToolTip from '@/components/tool-tip';
import { CloseIcon, PencilEditIcon } from '@/icons/icons';
import FormSection from '@/layout/form-section';
import { formatNicaraguanPhone, validateEmailFormat } from '@/lib/utils/formatters';
import {
  CategoryCustomerProps,
  CustomerProps,
  DepartmetProps,
  MunicipalityProps,
  SaleProps,
} from '@/types/types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// =================================================================
// FUNCIONES DE FORMATEO Y VALIDACIÓN DE DOCUMENTOS (SISTEMA PROPIO)
// =================================================================
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

interface AddSaleInformationProps {
  saleId?: string;
  handleChangeFormData: (
    name: keyof Omit<
      SaleProps,
      | 'saleId'
      | 'createdAt'
      | 'products'
      | 'salePaymentDetails'
      | 'typeSale'
      | 'expirationDate'
      | 'discount'
      | 'shippingCost'
      | 'subtotal'
      | 'tax'
      | 'total'
      | 'userId'
      | 'salesCode'
      | 'return'
    >,
    value: string | number | string[] | boolean,
  ) => void;
  formData: Omit<
    SaleProps,
    | 'saleId'
    | 'createdAt'
    | 'categoryCustomer'
    | 'products'
    | 'salePaymentDetails'
    | 'typeSale'
    | 'expirationDate'
    | 'discount'
    | 'shippingCost'
    | 'subtotal'
    | 'tax'
    | 'userId'
    | 'salesCode'
    | 'return'
  >;
  handleChangeShowModal: (
    name:
      | 'customers'
      | 'observations'
      | 'categoryCustomer'
      | 'address'
      | 'paymentMethod',
    value: boolean,
  ) => void;
  isModalOpen: {
    customers: boolean;
    observations: boolean;
    categoryCustomer: boolean;
    address: boolean;
    paymentMethod: boolean;
  };
}

export default function AddSaleInformation({
  handleChangeFormData,
  formData,
  handleChangeShowModal,
  isModalOpen,
  saleId,
}: AddSaleInformationProps) {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerProps[]>([]);
  const [observations, setObservations] = useState(formData.observation || '');
  const [hasAddedObservations, setHasAddedObservations] = useState(
    !!formData.observation,
  );
  const maxLength = 5000;
  const [departments, setDepartments] = useState<DepartmetProps[]>([]);
  const [municipalities, setMunicipalities] = useState<MunicipalityProps[]>([]);
  const [categoryCustomers, setCategoryCustomers] = useState<CategoryCustomerProps[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProps | null>(null);

  const INITIAL_CUSTOMER_FORM_DATA = {
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
    identificationType: 0,
  };

  const [formCustomerData, setFormCustomerData] = useState<
    Omit<CustomerProps, 'customerId' | 'createdAt' | 'categoryCustomerName'> & {
      departmentId: string;
      identificationType: number;
    }
  >({
    ...INITIAL_CUSTOMER_FORM_DATA,
    departmentId: '',
  });

  useEffect(() => {
    setObservations(formData.observation || '');
  }, [formData.observation]);

  const handleLimitObservations = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxLength) {
      setObservations(e.target.value);
    }
  };

  useEffect(() => {
    const handleLoadDepartments = async () => {
      const { data } = await supabase.from('department').select('*');
      setDepartments(data as DepartmetProps[]);
    };
    handleLoadDepartments();
  }, []);

  useEffect(() => {
    const handleLoadCategoryCustomers = async () => {
      const { data } = await supabase.from('categoryCustomer').select('*');
      setCategoryCustomers(data as CategoryCustomerProps[]);
    };
    handleLoadCategoryCustomers();
  }, []);

  useEffect(() => {
    const handleLoadMunicipalitiesByDepartment = async () => {
      if (!formCustomerData.departmentId) {
        setMunicipalities([]);
        return;
      }
      const { data, error } = await supabase
        .from('municipality')
        .select('*')
        .eq('departmentId', formCustomerData.departmentId);

      if (!error) {
        setMunicipalities(data as MunicipalityProps[]);
      }
    };
    handleLoadMunicipalitiesByDepartment();
  }, [formCustomerData.departmentId]);

  const handleSaveObservations = () => {
    handleChangeFormData('observation', observations);
    handleChangeShowModal('observations', false);
    setHasAddedObservations(observations.trim().length > 0);
  };

  useEffect(() => {
    const handleLoadCustomers = async () => {
      const { data } = await supabase
        .from('customer')
        .select('*')
        .eq('state', true);
      setCustomers(data as CustomerProps[]);
    };
    handleLoadCustomers();
  }, []);

  const handleCustomerFieldChange = (field: string, value: any) => {
    setFormCustomerData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLoadCustomerById = async (id: string | number) => {
    const { data, error } = await supabase
      .from('getcustomers')
      .select('*')
      .eq('customerId', id)
      .single();

    if (error) return null;
    return data;
  };

  const handleSubmitCustomer = async () => {
    const {
      customerName,
      customerLastName,
      categoryCustomerId,
      dni,
      email,
      phone,
      departmentId,
      departmentName,
      municipalityName,
      address,
      isNatural,
      identificationType,
      ...cleanedData
    } = formCustomerData;

    if (!customerName.trim()) {
      showToast(isNatural ? 'El nombre del cliente es obligatorio.' : 'La razón social es obligatoria.', false);
      return;
    }

    if (isNatural && !customerLastName.trim()) {
      showToast('El apellido del cliente es obligatorio.', false);
      return;
    }

    if (!categoryCustomerId || categoryCustomerId.trim() === '') {
      showToast('La categoría del cliente no puede estar vacía.', false);
      return;
    }

    if (!dni || dni.trim() === '') {
      showToast('La identificación del cliente no puede estar vacía.', false);
      return;
    }

    if (!departmentId || departmentId.trim() === '') {
      showToast('El departamento es obligatorio.', false);
      return;
    }

    if (!formCustomerData.municipalityId || formCustomerData.municipalityId.trim() === '') {
      showToast('El municipio es obligatorio.', false);
      return;
    }

    if (!address || address.trim() === '') {
      showToast('La dirección es obligatoria.', false);
      return;
    }

    if (email && email.trim() !== '') {
      if (!validateEmailFormat(email.trim())) {
        showToast('El correo electrónico no tiene un formato válido.', false);
        return; // Detiene la ejecución
      }
    }

    const validations = [
      { field: 'dni', value: dni.trim(), message: 'Ya existe un cliente con esta identificación.' },
      { field: 'email', value: email.trim(), message: 'Ya existe un cliente con este correo.' },
      { field: 'phone', value: phone.trim(), message: 'Ya existe un cliente con este teléfono.' },
    ] as const;

    for (const { field, value, message } of validations) {
      if (!value || value === '') continue;

      const { data, error } = await supabase
        .from('customer')
        .select('customerId')
        .eq(field, value);

      if (error) {
        showToast(`Error al validar el campo "${field}"`, false);
        return;
      }

      if (data && data.length > 0) {
        showToast(message, false);
        return;
      }
    }

    const finalData = {
      ...cleanedData,
      customerName: customerName.trim(),
      customerLastName: isNatural ? customerLastName.trim() : '',
      categoryCustomerId,
      dni: dni.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      address: address.trim(),
      municipalityId: formCustomerData.municipalityId,
      isNatural,
      identificationType,
      state: true
    };

    const { data: insertedData, error: insertError } = await supabase
      .from('customer')
      .insert(finalData)
      .select()
      .single();

    if (insertError || !insertedData) {
      showToast(insertError?.message || 'Error al guardar el cliente', false);
      return;
    }

    const newCustomer = insertedData as CustomerProps;

    handleChangeFormData('customerId', newCustomer.customerId);
    handleChangeFormData('customerName', newCustomer.customerName);
    handleChangeFormData('customerLastName', newCustomer.customerLastName);
    handleChangeFormData('dni', newCustomer.dni || '');
    handleChangeFormData('phone', newCustomer.phone || '');
    handleChangeFormData('email', newCustomer.email || '');

    setCustomers((prev) => [...prev, newCustomer]);

    const fetchedFullCustomer = await handleLoadCustomerById(newCustomer.customerId);
    if (fetchedFullCustomer) setSelectedCustomer(fetchedFullCustomer);

    showToast('Cliente guardado exitosamente', true);
    handleChangeShowModal('customers', false);
    setFormCustomerData({ ...INITIAL_CUSTOMER_FORM_DATA, departmentId: '' });
  };

  useEffect(() => {
    const loadCustomerFromFormData = async () => {
      if (formData.customerId && !selectedCustomer) {
        const data = await handleLoadCustomerById(formData.customerId);
        if (data) {
          setSelectedCustomer(data);
        }
      }
    };
    loadCustomerFromFormData();
  }, [formData.customerId, selectedCustomer]);

  const isNaturalActive = formCustomerData.isNatural === true || String(formCustomerData.isNatural) === 'true';

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
    <>
      {/* Sección Observaciones */}
      <FormSection name="Observaciones" className="relative">
        <>
          {!saleId && (
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-primary rounded-md hover:bg-[#f7f7f7] p-1.5 "
              onClick={() => handleChangeShowModal('observations', true)}
            >
              <PencilEditIcon className="text-secondary/80 size-4 cursor-pointer " />
            </button>
          )}
          <p className="text-sm text-gray-700 pr-6 break-words whitespace-pre-wrap">
            {formData.observation || 'Sin observaciones'}
          </p>

          {isModalOpen.observations && (
            <Modal
              name={hasAddedObservations ? 'Editar observaciones' : 'Añadir observaciones'}
              classNameModal=" max-w-3xl"
              onClose={() => handleChangeShowModal('observations', false)}
              onClickSave={handleSaveObservations}
            >
              <div className="relative">
                <TextArea
                  className="px-4 pb-4 pt-2"
                  name=""
                  rows={3}
                  value={observations}
                  onChange={handleLimitObservations}
                  placeholder="Escribe tu comentario aquí..."
                  maxLength={maxLength}
                />
                <div className="absolute bottom-6 right-7 text-2xs text-secondary/80 text-muted-foreground">
                  {observations.length}/{maxLength}
                </div>
              </div>
            </Modal>
          )}
        </>
      </FormSection>

      {/* Sección Cliente */}
      <FormSection name="" className="relative">
        <>
          {selectedCustomer && formData.customerId ? (
            <>
              <div className="flex justify-between items-start ">
                <div>
                  <div className="max-w-full">
                    <p
                      onClick={() => navigate(`/customers/add/${selectedCustomer.customerId}`)}
                      className="md:text-2xs text-base text-blueprimary cursor-pointer hover:underline m-0 truncate max-w-[200px]"
                      data-tooltip-id="customerNameTooltip"
                    >
                      {selectedCustomer.customerName + ' ' + selectedCustomer.customerLastName}
                    </p>

                    <ToolTip
                      id="customerNameTooltip"
                      title={`${selectedCustomer.customerName} ${selectedCustomer.customerLastName}`}
                    />

                    <p className="md:text-2xs text-base font-medium text-gray-700 m-0 select-none mt-1 max-w-[200px] truncate">
                      {selectedCustomer.categoryCustomerName}
                    </p>
                  </div>

                  <div className="mt-3">
                    <p className="md:text-2xs text-base font-semibold mb-3">Información de contacto</p>
                    <p className="md:text-2xs text-base text-blueprimary">{selectedCustomer.dni}</p>
                    <p className="md:text-2xs text-base text-blueprimary">{selectedCustomer.email}</p>
                    <p className="md:text-2xs text-base text-blueprimary mb-4">{selectedCustomer.phone}</p>
                  </div>

                  <div className="mt-2">
                    <p className="md:text-2xs text-base font-semibold mb-3">Dirección de envío</p>
                    <p className="md:text-2xs text-base">{selectedCustomer.address}</p>
                    <p className="md:text-2xs text-base">{selectedCustomer.municipalityName}</p>
                    <p className="md:text-2xs text-base">{selectedCustomer.departmentName}</p>
                    <p className="md:text-2xs text-base">Nicaragua</p>
                  </div>
                </div>
              </div>
              {!saleId && (
                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    handleChangeFormData('customerId', '');
                  }}
                  className="text-secondary/80 hover:text-gray-primary text-lg font-bold absolute top-5 right-3 hover:bg-[#f7f7f7] p-1.5"
                >
                  <CloseIcon className="size-5" />
                </button>
              )}
            </>
          ) : (
            <SelectForm
              name="Cliente"
              placeholder="Buscar o crear un cliente"
              options={customers.map((customer) => ({
                title: `${customer.customerName} ${customer.customerLastName} `,
                value: customer.customerId,
              }))}
              value={formData.customerId}
              onChange={(value) => {
                handleLoadCustomerById(value).then((data) => {
                  if (data) {
                    setSelectedCustomer(data);
                    handleChangeFormData('customerId', data.customerId);
                    handleChangeFormData('customerName', data.customerName);
                    handleChangeFormData('customerLastName', data.customerLastName);
                    handleChangeFormData('dni', data.dni);
                    handleChangeFormData('phone', data.phone);
                    handleChangeFormData('email', data.email);
                  }
                });
              }}
              onClick={() => handleChangeShowModal('customers', true)}
            />
          )}

          {/* Modal de Nuevo Cliente */}
          {isModalOpen.customers && (
            <Modal
              name="Nuevo Cliente"
              classNameModal="max-w-3xl md:max-h-[70vh]"
              onClose={() => handleChangeShowModal('customers', false)}
              onClickSave={handleSubmitCustomer}
            >
              <FormSection className="md:mb-4 md:pb-0 md:py-5 py-1 pb-2 md:mx-4">
                <>
                  {/* Tipo de Persona (Usa FieldSelect nativo del sistema) */}
                  <FieldSelect
                    name="Tipo de Persona"
                    className="mb-5"
                    id="isNatural"
                    value={isNaturalActive ? 'true' : 'false'}
                    onChange={(e) => {
                      const valueStr = e.target.value;
                      const isNaturalBool = valueStr === 'true';

                      setFormCustomerData((prev) => ({
                        ...prev,
                        isNatural: isNaturalBool,
                        identificationType: isNaturalBool ? 0 : 3,
                        dni: '',
                      }));
                    }}
                    options={[
                      { name: 'Persona Natural', value: 'true' },
                      { name: 'Persona Jurídica', value: 'false' },
                    ]}
                  />

                  {/* Nombre o Razón Social adaptativo */}
                  <FieldInput
                    name={isNaturalActive ? 'Nombre' : 'Razón Social'}
                    className="mb-5"
                    id="nameCustomer"
                    value={formCustomerData.customerName}
                    onChange={(e) => handleCustomerFieldChange('customerName', e.target.value)}
                    required
                  />

                  {/* Apellido condicional solo si es persona natural */}
                  {isNaturalActive && (
                    <FieldInput
                      name="Apellido"
                      id="lastNameCustomer"
                      className="mb-5"
                      value={formCustomerData.customerLastName}
                      onChange={(e) => handleCustomerFieldChange('customerLastName', e.target.value)}
                      required
                      placeholder="Apellido del cliente"
                    />
                  )}

                  {/* Tipo de Identificación Dinámico */}
                  <FieldSelect
                    name="Tipo de identificación"
                    className="mb-5"
                    value={formCustomerData.identificationType}
                    id="identificationType"
                    options={identificationOptions}
                    onChange={(e) => {
                      setFormCustomerData((prev) => ({
                        ...prev,
                        identificationType: Number(e.target.value),
                        dni: '',
                      }));
                    }}
                  />

                  {/* Identificación estructurada con máscara activa en onChange */}
                  <div className="flex md:flex-row flex-col md:space-y-0 space-y-4 space-x-0 md:space-x-2 items-center w-full mt-5">
                    <FieldInput
                      id="dni"
                      name="Identificación"
                      className="w-full"
                      placeholder={
                        formCustomerData.identificationType === 0 ? "001-000000-0000A" :
                          formCustomerData.identificationType === 3 ? "J0110000000000" : "Número de documento"
                      }
                      value={formCustomerData.dni}
                      onChange={(e) => {
                        const formattedValue = formatNicaraguanDocument(e.target.value, formCustomerData.identificationType);
                        handleCustomerFieldChange('dni', formattedValue);

                        // Validación reactiva inmediata si es cédula y se completan los 16 caracteres
                        if (formCustomerData.identificationType === 0 && formattedValue.length === 16) {
                          const ageValidation = validateCedulaAge(formattedValue);
                          if (!ageValidation.isValid) {
                            showToast(ageValidation.message || "Cédula inválida", false);
                            handleCustomerFieldChange('dni', '');
                          }
                        }
                      }}
                      required
                    />

                    <SelectForm
                      name="Categoria cliente"
                      placeholder="Buscar o crear nueva categoria cliente"
                      id="categoryCustomer"
                      options={categoryCustomers.map((cat) => ({
                        title: cat.categoryCustomerName,
                        value: cat.categoryCustomerId,
                      }))}
                      value={formCustomerData.categoryCustomerId}
                      onChange={(value) => handleCustomerFieldChange('categoryCustomerId', value.toString())}
                      isCreated={false}
                    />
                  </div>

                  {/* Configuración de Direcciones Regionales */}
                  <SelectForm
                    className="mr-2 mt-3"
                    name="Departamento"
                    placeholder="Selecciona un departamento"
                    value={formCustomerData.departmentId}
                    options={departments.map((dept) => ({
                      title: dept.departmentName,
                      value: dept.departmentId,
                    }))}
                    isCreated={false}
                    onChange={(value) =>
                      setFormCustomerData((prev) => ({
                        ...prev,
                        departmentId: value.toString(),
                        municipalityId: '',
                      }))
                    }
                  />

                  <SelectForm
                    className="mt-3"
                    name="Municipio"
                    placeholder="Selecciona un Municipio"
                    value={formCustomerData.municipalityId}
                    options={municipalities.map((mun) => ({
                      title: mun.municipalityName,
                      value: mun.municipalityId,
                    }))}
                    isCreated={false}
                    disabled={!formCustomerData.departmentId}
                    onChange={(value) => handleCustomerFieldChange('municipalityId', value.toString())}
                  />

                  <TextArea
                    className="mt-3"
                    rows={5}
                    name="Dirección"
                    placeholder="Ej: Calle 123, Piso 1, Ciudad de Nicaragua"
                    value={formCustomerData.address}
                    onChange={(e) => handleCustomerFieldChange('address', e.target.value)}
                  />

                  {/* Información de Contacto Adicional */}
                  <FieldInput
                    value={formCustomerData.email}
                    name="Correo"
                    id="email"
                    className="mb-3 mt-3"
                    placeholder="Ej: correo@ejemplo.com"
                    onChange={(e) => handleCustomerFieldChange('email', e.target.value)}
                  />

                  <FieldInput
                    value={formCustomerData.phone}
                    name="Teléfono"
                    id="phone"
                    maxLength={14}
                    className="mt-3"
                    onChange={(e) => {
                      const formattedPhone = formatNicaraguanPhone(e.target.value);
                      handleCustomerFieldChange('phone', formattedPhone);
                    }}
                  />
                </>
              </FormSection>
            </Modal>
          )}
        </>
      </FormSection>
    </>
  );
}