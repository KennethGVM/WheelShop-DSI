import { useGeneralInformation } from '@/api/general-provider';
import { supabase } from '@/api/supabase-client';
import Button from '@/components/form/button';
import FieldInput from '@/components/form/field-input';
import Line from '@/components/form/line';
import Modal from '@/components/modal';
import { showToast } from '@/components/toast';
import { BranchIcon, GeneralIcon, PencilEditIcon } from '@/icons/icons';
import FormSection from '@/layout/form-section';
import { formatNicaraguanPhone } from '@/lib/utils/formatters'; // Importación de tu formateador de teléfono
import { useState } from 'react';

// Formateador en tiempo real para el RUC Nicaragüense (Letra + 13 dígitos o formato unificado de 14 caracteres)
const formatNicaraguanRuc = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 14);
};

export default function General() {
  const {
    dollarValue,
    setDollarValue,
    generalId,
    companyName,
    companyPhone,
    companyAddress,
    companyRuc,
    setCompanyAddress,
    setCompanyName,
    setCompanyPhone,
    setCompanyRuc,
  } = useGeneralInformation();

  const [isShowModal, setIsShowModal] = useState({
    name: false,
    address: false,
  });

  const handleShowModal = (name: keyof typeof isShowModal, value: boolean) => {
    setIsShowModal((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // 1. Validaciones de negocio antes de enviar a Supabase
    if (!companyName || companyName.trim() === '') {
      showToast('El nombre de la compañía es obligatorio.', false);
      return;
    }

    if (!companyPhone || companyPhone.trim() === '') {
      showToast('El teléfono de la compañía es obligatorio.', false);
      return;
    }

    if (!companyRuc || companyRuc.trim() === '') {
      showToast('El RUC de la compañía es obligatorio.', false);
      return;
    }

    if (companyRuc.trim().length < 14) {
      showToast('El RUC debe tener exactamente 14 caracteres.', false);
      return;
    }

    if (!companyAddress || companyAddress.trim() === '') {
      showToast('La dirección de la compañía es obligatoria.', false);
      return;
    }

    if (dollarValue === undefined || dollarValue === null || isNaN(dollarValue) || dollarValue <= 0) {
      showToast('El valor del dólar debe ser un número mayor a 0.', false);
      return;
    }

    const general = {
      dolarValue: dollarValue,
      companyName: companyName.trim(),
      phone: companyPhone.trim(),
      companyAddress: companyAddress.trim(),
      ruc: companyRuc.trim(),
    };

    const { error } = await supabase
      .from('general')
      .update(general)
      .eq('generalId', generalId);

    if (error) {
      showToast(error.message, false);
      return;
    }

    showToast('Valores de la tienda actualizados', true);
    setIsShowModal({ address: false, name: false });
  };

  return (
    <>
      <h3 className="text-secondary/90 font-semibold md:text-lg text-xl md:mx-0 mx-4">
        General
      </h3>

      <FormSection
        name="Detalles de la empresa"
        className="md:rounded-xl rounded-none"
        classNameLabel="md:text-2xs"
      >
        <div className="border border-gray-300 rounded-lg px-3 py-1.5">
          <div className="flex items-center justify-between py-1 group">
            <div className="flex items-center space-x-4">
              <GeneralIcon
                variant="stroke"
                className="md:size-4 size-5 stroke-none fill-secondary/80"
              />
              <div className="space-y-0.5">
                <h4 className="font-medium text-secondary md:text-xs text-base">
                  {companyName || 'Sin nombre configurado'}
                </h4>
                <p className="md:text-xs text-base font-[550] text-secondary/80">
                  {companyPhone || 'Sin teléfono'} • {companyRuc || 'Sin RUC'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleShowModal('name', true)}
              className="p-1 hover:bg-[#F2F2F2] rounded-md"
            >
              <PencilEditIcon className="md:size-4 size-5 fill-secondary/80 stroke-none md:group-hover:block md:hidden block" />
            </Button>
          </div>

          <Line className="my-2" />

          <div className="flex items-center justify-between py-1 group">
            <div className="flex items-center space-x-4">
              <BranchIcon className="md:size-4 size-5 fill-transparent stroke-secondary/80 stroke-[1.5]" />
              <div className="space-y-0.5">
                <h4 className="font-medium text-secondary md:text-xs text-base">
                  {companyAddress || 'Sin dirección configurada'}
                </h4>
                <p className="md:text-xs text-base font-[550] text-secondary/80">
                  Nicaragua
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleShowModal('address', true)}
              className="p-1 hover:bg-[#F2F2F2] rounded-md"
            >
              <PencilEditIcon className="md:size-4 size-5 fill-secondary/80 stroke-none md:group-hover:block md:hidden block" />
            </Button>
          </div>
        </div>
      </FormSection>

      <FormSection
        name="Valores predeterminados de la tienda"
        className="md:rounded-xl rounded-none"
        classNameLabel="md:text-2xs mb-1"
      >
        <>
          <div className="flex lg:flex-row flex-col items-center [&>div]:mb-0 [&>div]:w-full mt-3 lg:space-x-4 space-x-0 md:space-y-0 space-y-3">
            <FieldInput
              name="Moneda"
              id="coin"
              readOnly
              value="Córdoba nicaragüense (NIO C$)"
            />
            <FieldInput
              name="Valor del dolar"
              id="dollarValue"
              isNumber
              onChange={(e) => {
                const value = e.target.value;
                setDollarValue(value === '' ? 0 : Number(value));
              }}
              value={dollarValue ?? 0}
              appendChild={
                <span className="text-secondary/80 md:text-xs text-base font-medium">
                  C$
                </span>
              }
            />
          </div>
          <FieldInput
            name="Zona horaria"
            id="timezone"
            readOnly
            value="(GMT-06:00) Nicaragua, Managua"
            className="mb-0 mt-3"
          />
          <p className="text-xs mt-0.5 text-secondary/80 font-medium">
            Zona horaria para cuando se registran las ventas e informes y estadísticas.
          </p>
        </>
      </FormSection>

      <div className="flex justify-end mt-5 md:px-0 px-4">
        <Button
          onClick={handleSubmit}
          name="Guardar"
          className="px-3 py-1.5 md:text-2xs text-[15px]"
          styleButton="secondary"
        />
      </div>

      {/* Modal: Editar Compañía */}
      {isShowModal.name && (
        <Modal
          name="Editar compañía"
          classNameModal="px-4 py-3"
          onClose={() => handleShowModal('name', false)}
          onClickSave={handleSubmit}
          principalButtonName="Guardar"
        >
          <div className="space-y-4">
            <FieldInput
              id="companyName"
              name="Nombre de la compañía"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />

            <FieldInput
              id="companyPhone"
              name="Teléfono de la compañía"
              value={companyPhone}
              maxLength={14}
              onChange={(e) => setCompanyPhone(formatNicaraguanPhone(e.target.value))}
              placeholder="Ej: +505 8888-8888"
              required
            />

            <FieldInput
              id="companyRuc"
              name="RUC de la compañía"
              value={companyRuc}
              maxLength={14}
              onChange={(e) => setCompanyRuc(formatNicaraguanRuc(e.target.value))}
              placeholder="Ej: J0110000000000"
              required
            />
          </div>
        </Modal>
      )}

      {/* Modal: Editar Dirección */}
      {isShowModal.address && (
        <Modal
          name="Editar dirección"
          classNameModal="px-4 py-3"
          onClose={() => handleShowModal('address', false)}
          onClickSave={handleSubmit}
          principalButtonName="Guardar"
        >
          <div className="space-y-4">
            <FieldInput
              id="companyAddress"
              name="Dirección"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              required
            />
          </div>
        </Modal>
      )}
    </>
  );
}