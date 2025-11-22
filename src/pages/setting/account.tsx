import { useAuth } from "@/api/auth-provider";
import { useRolePermission } from "@/api/permissions-provider";
import FieldInput from "@/components/form/field-input";
import FormSection from "@/layout/form-section";
import AddUserPermissionSummary from "./user-permission/add-user-permission-summary";
import Button from "@/components/form/button";
import { supabase } from "@/api/supabase-client";
import { useState } from "react";
import { showToast } from "@/components/toast";

export default function Account() {
  const ADMIN_ROLE_NAME = 'Administrador';
  const { user } = useAuth();
  const { userPermissions } = useRolePermission();
  const [formData, setFormData] = useState({
    email: user?.email ?? '',
    password: ''
  });

  const handleSubmit = async () => {
    const updates: { email?: string; password?: string } = {};

    if (formData.email && formData.email !== user?.email) {
      updates.email = formData.email;
    }

    if (formData.password !== '') {
      updates.password = formData.password;
    }

    if (Object.keys(updates).length === 0) {
      showToast('No hay cambios para guardar', false);
      return;
    }

    const { error } = await supabase.auth.updateUser(updates);

    if (error) {
      showToast(error.message, false);
      return;
    }

    showToast('Cuenta actualizada', true);

    setTimeout(() => {
      supabase.auth.signOut();
    }, 300);
  };

  const isSaveDisabled =
    (formData.email === '' || formData.email === user?.email) &&
    formData.password === '';

  return (
    <>
      <h3 className="text-secondary font-semibold text-lg md:mx-0 mx-4">Cuenta</h3>
      <FormSection name="General">
        <>
          <FieldInput
            name="Correo"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <FieldInput
            name="Contraseña"
            className="mb-0"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </>
      </FormSection>
      {userPermissions?.roleId &&
        <AddUserPermissionSummary
          ADMIN_ROLE_NAME={ADMIN_ROLE_NAME}
          selectedRole={{
            createdAt: new Date(),
            name: userPermissions?.name ?? '',
            description: '',
            state: true,
            roleId: userPermissions?.roleId ?? '',
            users: 0
          }}
        />
      }

      <div className="flex justify-end mt-4 md:px-0 px-4 md:mb-0 mb-4">
        <Button
          onClick={handleSubmit}
          type="button"
          name="Guardar"
          disabled={isSaveDisabled}
          className="md:px-2 disabled:shadow-none disabled:cursor-default disabled:bg-[#c8c8c8] disabled:text-white px-4 md:py-1 md:text-2xs text-base py-2"
          styleButton="secondary"
        />
      </div>
    </>
  );
}
