import { useState } from "react";
import FieldInput from "@/components/form/field-input";
import Modal from "@/components/modal"; // Usa tu componente de modal actual
import { showToast } from "@/components/toast";
import { supabase } from "@/api/supabase-client";
import { SupplierProps } from "@/types/types";

interface AddSupplierModalProps {
  onClose: () => void;
  onCreated: (newSupplier: SupplierProps) => void; // ← tipo completo
}

export default function AddSupplierModal({ onClose, onCreated }: AddSupplierModalProps) {
  const [formData, setFormData] = useState({
    nameSupplier: "",
    ruc: "",
    socialReason: "",
    email: "",
    phone: "",
  });


  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

const handleSave = async () => {
  if (!formData.nameSupplier.trim()) {
    showToast("El nombre del proveedor es obligatorio", false);
    return;
  }

  const validations = [
    { field: "nameSupplier", message: "Ya existe un proveedor con este nombre." },
    { field: "ruc", message: "Ya existe un proveedor con este RUC." },
    { field: "socialReason", message: "Ya existe un proveedor con esta razón social." },
    { field: "email", message: "Ya existe un proveedor con este correo." },
    { field: "phone", message: "Ya existe un proveedor con este teléfono." },
  ] as const;

  for (const { field, message } of validations) {
    const value = formData[field];
    if (!value.trim()) continue;

    const { data, error } = await supabase
      .from("supplier")
      .select("supplierId")
      .eq(field, value.trim());

    if (error) {
      showToast(`Error al validar el campo "${field}"`, false);
      return;
    }

    if (data && data.length > 0) {
      showToast(message, false);
      return;
    }
  }

  const { data, error } = await supabase
    .from("supplier")
    .insert({ ...formData, state: 1 }) // state siempre activo
    .select()
    .single();

  if (error || !data) {
    showToast("Error al registrar proveedor", false);
  } else {
    showToast("Proveedor registrado exitosamente", true);
    onCreated(data);
    onClose();
  }
};

  return (
    <Modal
      name="Registrar proveedor"
      classNameModal="max-w-3xl"
      onClose={onClose}
      onClickSave={handleSave}
    >
      <div className="md:mb-4 md:pb-0 md:py-5 py-1 pb-2 md:mx-4 mx-4">
        <>
          <div className="flex md:flex-row flex-col md:space-y-0 space-y-3 space-x-0 md:space-x-2 items-center w-full mb-3">
            <FieldInput
              name="Nombre"
              id="nameSupplier"
              value={formData.nameSupplier}
              onChange={(e) => handleChange("nameSupplier", e.target.value)}
              className="mb-0 w-full"
              required
            />
            <FieldInput
              name="Razón Social"
              id="socialReason"
              value={formData.socialReason}
              onChange={(e) => handleChange("socialReason", e.target.value)}
              className="mb-0 w-full"
              required={false}
            />
          </div>

          <div className="flex items-center md:flex-row flex-col md:space-y-0 space-y-3 space-x-0 md:space-x-2 w-full mb-3">
            <FieldInput
              name="RUC"
              id="ruc"
              value={formData.ruc}
              onChange={(e) => handleChange("ruc", e.target.value)}
              className="w-full"
              required={false}
            />
            <FieldInput
              name="Teléfono"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full"
              required={false}
            />
          </div>

          <FieldInput
            name="Correo"
            id="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="mt-3"
            placeholder="Ej: correo@ejemplo.com"
            required={false}
          />
        </>
      </div>
    </Modal>
  );
}
