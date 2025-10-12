import FieldInput from "@/components/form/field-input";
import SelectForm from "@/components/form/select-form";
import TextArea from "@/components/form/text-area";
import Modal from "@/components/modal";
import { showToast } from "@/components/toast";
import { ArrowRightIcon, PencilEditIcon, PlusCircleIcon } from "@/icons/icons";
import FormSection from "@/layout/form-section";
import { CustomerProps, DepartmetProps, MunicipalityProps } from "@/types/types";


interface CustomerAddressProps {
  handleChangeShowModal: (name: 'address', value: boolean) => void;
  isModalOpen: { address: boolean }
  formData: Omit<CustomerProps, 'customerId' | 'createdAt' | 'municipalityName' | 'departmentName' | 'categoryCustomerName'>;
  departments: DepartmetProps[];
  handleChangeFormData: (name: keyof Omit<CustomerProps, 'customerId' | 'createdAt' | 'municipalityName' | 'departmentName' | 'categoryCustomerName'>, value: string) => void;
  municipalities: MunicipalityProps[];
  savedAddress: string | null | boolean;
  setSavedAddress: (address: string | null | boolean) => void;
}

export default function CustomerAddress({ handleChangeShowModal, isModalOpen, formData, departments, handleChangeFormData, municipalities, savedAddress, setSavedAddress }: CustomerAddressProps) {

  const handleSaveAddress = () => {
    if (!formData.departmentId) {
      showToast("Por favor, selecciona un departamento.", false);
      return;
    }

    if (!formData.municipalityId) {
      showToast("Por favor, selecciona un municipio.", false);
      return;
    }

    if (!formData.address?.trim()) {
      showToast("Por favor, escribe la dirección.", false);
      return;
    }

    const departmentName = departments.find(d => d.departmentId === formData.departmentId)?.departmentName;
    const municipalityName = municipalities.find(m => m.municipalityId === formData.municipalityId)?.municipalityName;

    const fullAddress = `${municipalityName || ''}\n${departmentName || ''}\nNicaragua\n${formData.address || ''}`

    setSavedAddress(fullAddress);
    handleChangeShowModal('address', false);
  };
  return (
    <FormSection name='Dirección predeterminada' classNameLabel="mb-1">
      <>
        {!savedAddress ? (
          <>
            <h4 className="text-sm font-medium text-secondary/80 mb-4">La dirección principal de este cliente</h4>
            <button type="button" className="px-2 py-3 border border-gray-300 rounded-lg w-full flex justify-between items-center hover:bg-[#f7f7f7]" onClick={() => handleChangeShowModal('address', true)}>
              <div className="flex items-center space-x-3 ">
                <PlusCircleIcon className="md:size-4 size-6 text-secondary/80" />
                <span className="md:text-2xs text-base font-medium text-secondary/80">Agregar dirección</span>
              </div>
              <ArrowRightIcon className="md:size-4 size-5 text-secondary/80" />
            </button>
          </>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4 whitespace-pre-line relative">
            <p className="text-sm text-secondary/90">{savedAddress}</p>
            <button type="button"
              onClick={() => handleChangeShowModal('address', true)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <PencilEditIcon className="md:size-4 size-5 text-secondary/80" />
            </button>
          </div>
        )}

        {isModalOpen.address && (
          <Modal
            classNameModal="h-[500px] max-w-3xl"
            onClose={() =>
              handleChangeShowModal('address', false)}
            name="Añadir dirección predeterminada"
            onClickSave={handleSaveAddress}
          >
            <FieldInput className="p-4"
              name="Pais o región"
              placeholder="Nicaragua"
              classNameDiv="h-[40px]"
              readOnly={true}

            />
            <SelectForm
              className="px-4 pb-4 "
              name="Departamento"
              placeholder="Selecciona un departamento"
              value={formData.departmentId}
              options={departments.map((d) => ({ title: d.departmentName, value: d.departmentId }))}
              onChange={(value) => {
                handleChangeFormData('departmentId', value.toString());
                handleChangeFormData('municipalityId', '');
              }}
              isCreated={false}
            />

            <SelectForm
              className="px-4 pb-4"
              name="municipio"
              placeholder="Selecciona un municipio"
              value={formData.municipalityId}
              options={municipalities.map((m) => ({ title: m.municipalityName, value: m.municipalityId }))}
              onChange={(value) => handleChangeFormData('municipalityId', value.toString())} // Resetear municipio al cambiar departamento
              disabled={!formData.departmentId}
              isCreated={false}

            />
            <TextArea className="pb-4 px-4"
              rows={8}
              name="Dirección"
              placeholder="Ej: Calle 123, Piso 1, Ciudad de Nicaragua"
              value={formData.address}
              onChange={(e) => handleChangeFormData('address', e.target.value)}
            />

          </Modal>
        )}
      </>
    </FormSection>


  )
}