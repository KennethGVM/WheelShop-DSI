import { supabase } from "@/api/supabase-client";
import FieldInput from "@/components/form/field-input";
import SelectForm from "@/components/form/select-form";
import TextArea from "@/components/form/text-area";
import Modal from "@/components/modal";
import { showToast } from "@/components/toast";
import ToolTip from "@/components/tool-tip";
import { CloseIcon, PencilEditIcon } from "@/icons/icons";
import FormSection from "@/layout/form-section";
import { CategoryCustomerProps, CustomerProps, DepartmetProps, MunicipalityProps, SaleProps } from "@/types/types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AddSaleInformationProps {
  saleId?: string;
  handleChangeFormData: (name: keyof Omit<SaleProps, 'saleId' | 'createdAt' | 'products' | 'salePaymentDetails' | 'typeSale' | 'expirationDate' | 'discount' | 'shippingCost' | 'subtotal' | 'tax' | 'total' | 'userId' | 'salesCode' | 'return'>, value: string | number | string[] | boolean) => void;
  formData: Omit<SaleProps, 'saleId' | 'createdAt' | 'categoryCustomer' | 'products' | 'salePaymentDetails' | 'typeSale' | 'expirationDate' | 'discount' | 'shippingCost' | 'subtotal' | 'tax' | 'userId' | 'salesCode' | 'return'>;
  handleChangeShowModal: (name: 'customers' | 'observations' | 'categoryCustomer' | 'address' | 'paymentMethod', value: boolean) => void;
  isModalOpen: { customers: boolean; observations: boolean; categoryCustomer: boolean; address: boolean; paymentMethod: boolean };

}
export default function AddSaleInformation({ handleChangeFormData, formData, handleChangeShowModal, isModalOpen, saleId }: AddSaleInformationProps) {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerProps[]>([]);
  const [observations, setObservations] = useState(formData.observation || '');
  const [hasAddedObservations, setHasAddedObservations] = useState(!!formData.observation);
  const maxLength = 5000
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
  };
  const [formCustomerData, setFormCustomerData] = useState<Omit<CustomerProps, 'customerId' | 'createdAt' | 'categoryCustomerName'>>(INITIAL_CUSTOMER_FORM_DATA);

  useEffect(() => {
    setObservations(formData.observation || "");
  }, [formData.observation]);

  const handleLimitObservations = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxLength) {
      setObservations(e.target.value)

    }
  }

  useEffect(() => {
    const handleLoadDepartments = async () => {
      const { data } = await supabase.from('department').select('*');
      setDepartments(data as DepartmetProps[]);
    }

    handleLoadDepartments();
  }, [])


  useEffect(() => {
    const handleLoadCategoryCustomers = async () => {
      const { data } = await supabase.from('categoryCustomer').select('*');
      setCategoryCustomers(data as CategoryCustomerProps[]);
    }

    handleLoadCategoryCustomers();
  }, [])

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

    if (observations.trim().length > 0) {
      setHasAddedObservations(true);
    } else {
      setHasAddedObservations(false);
    }
  };
  useEffect(() => {
    const handleLoadCustomers = async () => {
      const { data } = await supabase.from('customer').select('*').eq('state', true);
      setCustomers(data as CustomerProps[]);
    }
    handleLoadCustomers();
  }, []);

  const handleCustomerFieldChange = (field: keyof typeof formCustomerData, value: string) => {
    setFormCustomerData(prev => ({ ...prev, [field]: value }));
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
      ...cleanedData
    } = formCustomerData;

    // Validaciones obligatorias
    if (!customerName.trim()) {
      showToast("El nombre es obligatorio", false);
      return;
    }

    if (!customerLastName.trim()) {
      showToast("El apellido es obligatorio", false);
      return;
    }

    if (!categoryCustomerId) {
      showToast("La categoría es obligatoria", false);
      return;
    }

    // Validaciones de unicidad (solo si tienen valor)
    if (dni) {
      const { data: dniData } = await supabase
        .from("customer")
        .select("dni")
        .eq("dni", dni)
        .maybeSingle();

      if (dniData) {
        showToast("La identificación ya está registrada", false);
        return;
      }
    }

    if (phone) {
      const { data: phoneData } = await supabase
        .from("customer")
        .select("phone")
        .eq("phone", phone)
        .maybeSingle();

      if (phoneData) {
        showToast("El número de teléfono ya está registrado", false);
        return;
      }
    }

    if (email) {
      const { data: emailData } = await supabase
        .from("customer")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (emailData) {
        showToast("El correo electrónico ya está registrado", false);
        return;
      }
    }

    // Preparar datos finales
    const finalData = {
      ...cleanedData,
      customerName,
      customerLastName,
      categoryCustomerId,
      dni,
      email,
      phone,
      municipalityId: departmentId ? (formCustomerData.municipalityId || null) : null,
    };

    // Insertar cliente
    const { data, error } = await supabase
      .from("customer")
      .insert(finalData)
      .select()
      .single();

    if (error || !data) {
      showToast("Error al guardar el cliente", false);
      return;
    }

    const newCustomer = data as CustomerProps;
    
    handleChangeFormData("customerId", newCustomer.customerId);
    handleChangeFormData("customerName", newCustomer.customerName);
    handleChangeFormData("customerLastName", newCustomer.customerLastName);
    handleChangeFormData("dni", newCustomer.dni || "");
    handleChangeFormData("phone", newCustomer.phone || "");
    handleChangeFormData("email", newCustomer.email || "");


    setCustomers(prev => [...prev, newCustomer]);


    setSelectedCustomer(newCustomer); //



    handleChangeFormData("customerId", newCustomer.customerId);

    const fetched = await handleLoadCustomerById(newCustomer.customerId);
    if (fetched) setSelectedCustomer(fetched);

    showToast("Cliente guardado exitosamente", true);
    handleChangeShowModal("customers", false);
    setFormCustomerData(INITIAL_CUSTOMER_FORM_DATA);
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

  const handleLoadCustomerById = async (id: string | number) => {
    const { data, error } = await supabase
      .from("getcustomers")
      .select("*")
      .eq("customerId", id)
      .single();

    if (error) {
      return null;
    }

    return data;
  };

  return (
    <>
      <FormSection name="Observaciones" className="relative">
        <>
          {(!saleId) && (
            <button type="button"
              className="absolute top-2 right-2 text-gray-primary rounded-md hover:bg-[#f7f7f7] p-1.5 "
              onClick={() => handleChangeShowModal('observations', true)}
            >
              <PencilEditIcon className="text-secondary/80 size-4  cursor-pointer " />
            </button>
          )}
          <p className="text-sm text-gray-700 pr-6 break-words whitespace-pre-wrap">{formData.observation || 'Sin observaciones'}</p>

          {isModalOpen.observations && (
            <Modal
              name={hasAddedObservations ? "Editar observaciones" : "Añadir observaciones"}
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
                    <p className="md:text-2xs text-base  text-blueprimary mb-4">{selectedCustomer.phone}</p>
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
              {(!saleId) && (
                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    handleChangeFormData("customerId", "");
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
              options={customers.map(customer => ({
                title: `${customer.customerName} ${customer.customerLastName} `,
                value: customer.customerId
              }))} value={formData.customerId}
              onChange={(value) => {
                handleLoadCustomerById(value).then((data) => {
                  if (data) {
                    setSelectedCustomer(data);
                    handleChangeFormData("customerId", data.customerId);
                    handleChangeFormData("customerName", data.customerName)
                    handleChangeFormData("customerLastName", data.customerLastName);
                    handleChangeFormData("dni", data.dni);
                    handleChangeFormData("phone", data.phone);
                    handleChangeFormData("email", data.email);
                  }
                });
              }}
              onClick={() => handleChangeShowModal('customers', true)}
            />
          )}

          {isModalOpen.customers && (
            <Modal
              name="Nuevo Cliente"
              classNameModal="max-w-3xl"
              onClose={() => handleChangeShowModal('customers', false)}
              onClickSave={handleSubmitCustomer}
            >
              <FormSection className="md:mb-4 md:pb-0 md:py-5 py-1 pb-2 md:mx-4">
                <>
                  <div className='flex md:flex-row flex-col md:space-y-0 space-y-3 space-x-0 md:space-x-2 items-center w-full mb-3'>
                    <FieldInput
                      name='Nombre'
                      id="nameCustomer"
                      value={formCustomerData.customerName}
                      onChange={(e) => handleCustomerFieldChange("customerName", e.target.value)}
                      className="mb-0 w-full"
                      required />
                    <FieldInput
                      name='Apellido'
                      id="lastNameCustomer"
                      value={formCustomerData.customerLastName}
                      onChange={(e) => handleCustomerFieldChange("customerLastName", e.target.value)}
                      className="mb-0 w-full"
                      required
                      placeholder="Apellido o razon social" />

                  </div>
                  <div className='flex items-center md:flex-row space-x-0 md:space-x-2 flex-col md:space-y-0 space-y-3 w-full'>
                    <FieldInput
                      required
                      name='Identificación'
                      id='dni'
                      className='w-full'
                      placeholder="Cedula de identidad o RUC"
                      value={formCustomerData.dni}
                      onChange={(e) => handleCustomerFieldChange("dni", e.target.value)}
                    />

                    <SelectForm
                      name="Categoria cliente"
                      placeholder="Buscar o crear nueva categoria cliente"
                      id="categoryCustomer"
                      options={categoryCustomers.map((categoryCustomer) =>
                        ({ title: categoryCustomer.categoryCustomerName, value: categoryCustomer.categoryCustomerId }))} value={formCustomerData.categoryCustomerId}
                      onChange={(value) => setFormCustomerData(prev => ({ ...prev, categoryCustomerId: value.toString() }))}
                      isCreated={false}
                    />
                  </div>
                  <SelectForm
                    className="mr-2 mt-3"
                    name="Departamento"
                    placeholder="Selecciona un departamento"
                    value={formCustomerData.departmentId}
                    options={departments.map((department) =>
                      ({ title: department.departmentName, value: department.departmentId }))} isCreated={false}
                    onChange={(value) => setFormCustomerData(prev => ({ ...prev, departmentId: value.toString() }))}

                  />
                  <SelectForm
                    className="mt-3"
                    name="Municipio"
                    placeholder="Selecciona un Municipio"
                    value={formCustomerData.municipalityId}
                    options={municipalities.map((municipality) =>
                      ({ title: municipality.municipalityName, value: municipality.municipalityId }))} isCreated={false}
                    disabled={!formCustomerData.departmentId}
                    onChange={(value) =>
                      setFormCustomerData((prev) => ({
                        ...prev,
                        municipalityId: value.toString(),
                      }))
                    }
                  />
                  <TextArea className="mt-3"
                    rows={5}
                    name="Dirección"
                    placeholder="Ej: Calle 123, Piso 1, Ciudad de Nicaragua"
                    value={formCustomerData.address}
                    onChange={(e) => setFormCustomerData((prev) => ({ ...prev, address: e.target.value }))}
                  />
                  <FieldInput
                    required={false}
                    value={formCustomerData.email}
                    name="Correo"
                    id="email"
                    className="mb-3 mt-3"
                    placeholder="Ej: correo@ejemplo.com"
                    onChange={(e) => setFormCustomerData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                  <FieldInput
                    required={false}
                    value={formCustomerData.phone}
                    name="Telefono"
                    id="phone"
                    className="mt-3"
                    onChange={(e) => setFormCustomerData((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </>
              </FormSection>

            </Modal>
          )}
        </>
      </FormSection>
    </>
  )
}