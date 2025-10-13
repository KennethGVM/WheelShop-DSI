import Button from "@/components/form/button";
import Modal from "../../components/modal";
import FieldInput from "@/components/form/field-input";
import { useEffect, useState } from "react";
import { BrandProps } from "@/types/types";
import { supabase } from "@/api/supabase-client";
import { showToast } from "@/components/toast";
import FieldSelect from "@/components/form/field-select";

interface BrandHeaderProps {
  selectedBrandToEdit: BrandProps | null;
  setSelectedBrandToEdit: (brand: BrandProps | null) => void;
  onUpdateLocalBrand: (updatedBrand: BrandProps) => void;
  clearSelection: () => void;
}

export default function BrandHeader({ selectedBrandToEdit, setSelectedBrandToEdit, onUpdateLocalBrand, clearSelection }: BrandHeaderProps) {
  const [formDataBrand, setFormDataBrand] = useState<Omit<BrandProps, 'brandId' | 'createdAt'>>({
    brandName: '',
    state: true,
    category: 'Llantas'
  });

  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  useEffect(() => {
    if (isShowModal) {
      if (selectedBrandToEdit) {
        setFormDataBrand({
          brandName: selectedBrandToEdit.brandName,
          state: selectedBrandToEdit.state,
          category: selectedBrandToEdit.category

        });
      } else {
        setFormDataBrand({ brandName: '', state: true, category: 'Llantas' });
      }
    }
  }, [isShowModal]);
  // Cuando hay una marca seleccionada, llena el formulario
  useEffect(() => {
    if (selectedBrandToEdit) {
      setFormDataBrand({
        brandName: selectedBrandToEdit.brandName,
        state: selectedBrandToEdit.state,
        category: selectedBrandToEdit.category
      });
      setIsShowModal(true);
    }
  }, [selectedBrandToEdit]);

  const handleChangeFormDataBrand = (name: keyof typeof formDataBrand, value: string) => {
    setFormDataBrand((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitBrand = async () => {
    const trimmedName = formDataBrand.brandName.trim();

    // Validación: el nombre es obligatorio
    if (!trimmedName) {
      showToast("El nombre de la marca es obligatorio.", false);
      return;
    }

    // Definir tabla y campo según categoría
    const isLlantas = formDataBrand.category === "Llantas";
    const tableName = isLlantas ? "brand" : "brandOil";
    const nameField = isLlantas ? "brandName" : "brandOilName";
    const idField = "brandId";

    // Validación: buscar si ya existe en la tabla correspondiente
    const { data: existingBrands, error: searchError } = await supabase
      .from(tableName)
      .select("*")
      .ilike(nameField, trimmedName);

    if (searchError) {
      showToast("Error al validar la marca. Intenta nuevamente.", false);
      return;
    }

    const foundBrand = existingBrands?.find(brand => {
      if (selectedBrandToEdit) {
        return brand[idField] !== (selectedBrandToEdit as any)[idField];
      }
      return true;
    });

    if (foundBrand) {
      showToast("Ya existe una marca con este nombre.", false);
      return;
    }

    let error;
    let data;

    if (selectedBrandToEdit) {
      // ACTUALIZAR
      const response = await supabase
        .from(tableName)
        .update({
          [nameField]: formDataBrand.brandName,
          state: formDataBrand.state,
        })
        .eq(isLlantas ? "brandId" : "brandOilId", selectedBrandToEdit?.brandId) // id real de la tabla
        .select()
        .single();

      error = response.error;
      data = response.data;
    } else {
      // INSERTAR
      const response = await supabase
        .from(tableName)
        .insert({
          [nameField]: formDataBrand.brandName,
          state: formDataBrand.state,
        })
        .select()
        .single();

      error = response.error;
      data = response.data;
    }

    if (error) {
      showToast(error.message, false);
    } else {
      showToast(selectedBrandToEdit ? "Marca actualizada" : "Marca creada", true);

      setIsShowModal(false);
      setFormDataBrand({ brandName: "", state: true, category: "Llantas" });
      setSelectedBrandToEdit(null);
      if (data) {
        onUpdateLocalBrand({ brandId: formDataBrand.category === 'Aceites' ? data.brandOilId : data.brandId, createdAt: new Date(), state: data.state, brandName: formDataBrand.category === 'Aceites' ? data.brandOilName : data.brandName, category: formDataBrand.category }); 
        clearSelection();
      }
    }
  };

  return (
    <header className="flex items-center justify-between md:px-0 px-4 mb-5">
      <h2 className="font-bold text-[20px] text-secondary/90">Marcas</h2>
      <div className="flex items-center space-x-2">
        <Button name="Exportar" className="md:px-3 md:py-1 p-2.5 bg-[#d4d4d4] md:text-2xs text-base font-medium text-secondary" styleButton="simple" />
        <Button
          onClick={() => {
            setFormDataBrand({ brandName: '', state: true, category: '' });
            setSelectedBrandToEdit(null);
            setIsShowModal(true);
          }}
          name="Añadir marcas"
          styleButton="secondary"
          className="md:px-3 md:py-1 p-2.5 md:text-2xs text-base font-medium"
        />
      </div>

      {isShowModal && (
        <Modal
          name={selectedBrandToEdit ? "Editar marca" : "Registrar nueva marca"}
          onClose={() => {
            setIsShowModal(false);
            setSelectedBrandToEdit(null);
          }}
          classNameModal="px-4 py-3"
          onClickSave={handleSubmitBrand}
        >
          <div className="flex items-center space-x-3 [&>*]:w-full mt-2">

            <FieldInput
              name="Marca"
              id="brand"
              value={formDataBrand.brandName}
              onChange={(e) => handleChangeFormDataBrand('brandName', e.target.value)}
              className="mb-0"
            />
            <FieldSelect
              name="Categoria"
              id="type"
              value={formDataBrand.category}
              onChange={(e) => handleChangeFormDataBrand("category", e.target.value)}
              options={[
                { name: "Llantas", value: "Llantas" },
                { name: "Aceites", value: "Aceites" },
              ]}
              disabled={!!selectedBrandToEdit} // 🔒 en edición no se puede cambiar categoría
            />
          </div>
        </Modal>
      )}
    </header>
  );
}
