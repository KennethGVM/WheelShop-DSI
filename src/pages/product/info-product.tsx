import { supabase } from "@/api/supabase-client";
import FieldInput from "@/components/form/field-input";
import FieldSelect from "@/components/form/field-select";
import SelectForm from "@/components/form/select-form";
import Modal from "@/components/modal";
import { showToast } from "@/components/toast";
import FormSection from "@/layout/form-section";
import { productCategoryProps, ProductProps, TypeVehicleProps } from "@/types/types";
import { Dispatch, SetStateAction } from "react";

interface InfoProductProps {
  typeVehicles: TypeVehicleProps[];
  brands: { title: string; value: string; }[];
  setBrands: Dispatch<SetStateAction<{ title: string; value: string }[]>>;
  formData: Omit<ProductProps, 'productId' | 'createdAt' | 'brandName' | 'nameRin' | 'storeHouseInventory' | 'storeHouseId' | 'storeHouseName' | 'supplierId' | 'nameSupplier'>;
  handleChangeShowModal: (name: 'typeVehicle' | 'brand', value: boolean) => void;
  handleChangeModalData: (name: 'typeVehicle' | 'brand', value: string) => void;
  handleChangeFormData: (name: 'name' | 'description' | 'numeration' | 'typeVehicleId' | 'brandId' | 'isDiesel' | 'numerationOil', value: string | boolean) => void;
  modalData: { typeVehicle: string; brand: string; rin: string; brandOilName: string };
  isModalOpen: { typeVehicle: boolean; brand: boolean; rin: boolean };
  productCategory: productCategoryProps[];
  setTypeVehicles: Dispatch<SetStateAction<TypeVehicleProps[]>>;
}

export default function InfoProduct({ handleChangeShowModal, setBrands, setTypeVehicles, typeVehicles, formData, brands, handleChangeModalData, handleChangeFormData, modalData, isModalOpen }: InfoProductProps) {

  const handleSubmitTypeVehicle = async () => {
    if (modalData.typeVehicle.trim() === "") {
      showToast("El tipo de vehículo no puede estar vacío.", false);
      return;
    }
    const { data, error } = await supabase.from("typeVehicle").insert({
      nameTypeVehicle: modalData.typeVehicle,
    }).select();

    if (error) {
      showToast(error.message, false);
    } else {
      showToast("Tipo de vehículo registrado exitosamente", true);
      const newTypeVehicle = { nameTypeVehicle: modalData.typeVehicle, typeVehicleId: data[0].typeVehicleId, createdAt: data[0].createdAt }
      setTypeVehicles([...typeVehicles, newTypeVehicle])

      handleChangeShowModal('typeVehicle', false);
      handleChangeModalData('typeVehicle', "");
    }
  };

  const hanndleChangeTypVehicle = (value: string | number) => {
    handleChangeFormData('typeVehicleId', value.toString())
  }

  const handleSubmitBrand = async () => {

    const table = formData.productCategoryName === 'aceites' ? "brandOil" : "brand";
    const brandField = formData.productCategoryName === 'aceites' ? "brandOilName" : "brandName";

    const { data, error } = await supabase.from(table).insert({
      [brandField]: modalData.brand,
    }).select();

    if (error) {
      showToast(error.message, false);
    } else {
      showToast("Marca registrada exitosamente", true);
      const newBrand = formData.productCategoryName === 'aceites' ? { title: modalData.brandOilName, value: data[0].brandOilId } : { title: modalData.brand, value: data[0].brandId };
      setBrands(prevState => [...prevState, newBrand]);

      handleChangeShowModal('brand', false);
      handleChangeModalData("brand", "");
    }
  };

  return (
    <>
      <FormSection name="Información del producto">
        <>
          {formData.productCategoryName !== 'aceites' && (
            <SelectForm className="mb-2"
              name="Tipo de vehículo"
              placeholder="Buscar o crear un nuevo tipo de vehículo"
              value={formData.typeVehicleId}
              options={typeVehicles.map(typeVehicle => ({ title: typeVehicle.nameTypeVehicle, value: typeVehicle.typeVehicleId }))}
              onChange={hanndleChangeTypVehicle}
              onClick={() => handleChangeShowModal('typeVehicle', true)}
            />
          )}
          {isModalOpen.typeVehicle && (
            <Modal
              onClose={() => handleChangeShowModal('typeVehicle', false)}
              name="Nuevo Tipo de Vehículo"
              onClickSave={handleSubmitTypeVehicle}
            >
              <FieldInput className="p-4"
                name="Nombre del Tipo de Vehículo"
                placeholder="Ej: Camioneta, Sedán..."
                id="vehicle-name"
                value={modalData.typeVehicle}
                onChange={(e) => handleChangeModalData('typeVehicle', e.target.value)}
                required
              />
            </Modal>
          )}
          <SelectForm
            name="Marca"
            placeholder="Buscar o crear una nueva marca"
            value={formData.productCategoryName === 'aceites' ? formData.brandOilId : formData.brandId}
            options={brands}
            onChange={(value) => handleChangeFormData('brandId', value.toString())}
            onClick={() => handleChangeShowModal('brand', true)}
          />
          {isModalOpen.brand && (
            <Modal
              onClose={() => handleChangeShowModal('brand', false)}
              name="Nueva Marca"
              onClickSave={handleSubmitBrand}
            >
              <FieldInput className="p-4"
                name="Nombre de marca"
                placeholder="Escribe un nombre de marca..."
                id="brand-name"
                value={modalData.brand}
                onChange={(e) => handleChangeModalData('brand', e.target.value)}
                required
              />
            </Modal>
          )}
          <div className="flex md:flex-row flex-col items-center md:space-x-2 [&>div]:w-full mt-3 [&>div]:mb-0 md:space-y-0 space-y-3">
            <FieldInput
              id="numeration"
              name="Numeración"
              placeholder="Ej: 175/65"
              value={formData.productCategoryName === 'aceites' ? formData.numerationOil : formData.numeration}
              onChange={(e) =>
                handleChangeFormData(
                  formData.productCategoryName === 'aceites' ? 'numerationOil' : 'numeration',
                  e.target.value
                )
              } required
            />
            {formData.productCategoryName === 'aceites' && (
              <FieldSelect name="Tipo de aceite"
                value={formData.isDiesel ? 1 : 0} onChange={(e) => handleChangeFormData('isDiesel', Number(e.target.value) === 1 ? true : false)} id="isDiesel" options={[
                  { name: 'Diesel', value: 1 },
                  { name: 'Otro', value: 0 },
                ]}
              />
            )}
          </div>
        </>
      </FormSection>


    </>
  )
}
