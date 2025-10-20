import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FieldInput from '@/components/form/field-input';
import FieldSelect from '@/components/form/field-select';
import Container from '@/layout/container';
import SubHeader from '@/components/sub-header';
import { supabase } from '@/api/supabase-client';
import { showToast } from '@/components/toast';
import FormSection from '@/layout/form-section';

export default function AddSupplier() {
  const navigate = useNavigate();
  const { supplierId } = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [supplierName, setSupplierName] = useState<string>('');
  const formRef = useRef<HTMLFormElement | null>(null);

  const [formData, setFormData] = useState({
    nameSupplier: '',
    ruc: '',
    socialReason: '',
    email: '',
    phone: '',
    state: true,
  });


  useEffect(() => {
    if (supplierId) {
      const fetchSupplier = async () => {
        const { data, error } = await supabase.from('supplier').select('*').eq('supplierId', supplierId).single();

        if (error) {
          showToast('Error al cargar proveedor', false);
        } else if (data) {
          setFormData({
            nameSupplier: data.nameSupplier || '',
            ruc: data.ruc || '',
            socialReason: data.socialReason || '',
            email: data.email || '',
            phone: data.phone || '',
            state: data.state,
          });

          setSupplierName(data.nameSupplier || '');
        }
      };
      fetchSupplier();
    }
  }, [supplierId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Validar que el nombre no esté vacío
    if (!formData.nameSupplier.trim()) {
      showToast("El nombre del proveedor es obligatorio.", false);
      setIsLoading(false);
      return;
    }

    // Validaciones individuales por campo
    const validations = [
      { field: 'nameSupplier', label: 'nombre', message: 'Ya existe un proveedor con este nombre.' },
      { field: 'ruc', label: 'RUC', message: 'Ya existe un proveedor con este RUC.' },
      { field: 'socialReason', label: 'razón social', message: 'Ya existe un proveedor con esta razón social.' },
      { field: 'email', label: 'correo', message: 'Ya existe un proveedor con este correo.' },
      { field: 'phone', label: 'teléfono', message: 'Ya existe un proveedor con este teléfono.' },
    ] as const;

    for (const { field, message } of validations) {
      const value = formData[field];
      if (!value.trim()) continue;

      const query = supabase
        .from('supplier')
        .select('supplierId')
        .eq(field, value.trim());

      if (supplierId) {
        query.neq('supplierId', supplierId); // Excluir proveedor actual si es edición
      }

      const { data, error } = await query;

      if (error) {
        showToast(`Error al validar el campo "${field}"`, false);
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        showToast(message, false);
        setIsLoading(false);
        return;
      }
    }

    // Guardar o actualizar proveedor
    const { error } = supplierId
      ? await supabase.from('supplier').update(formData).eq('supplierId', supplierId)
      : await supabase.from('supplier').insert(formData);

    if (error) {
      showToast(error.message, false);
    } else {
      showToast(supplierId ? 'Proveedor actualizado exitosamente' : 'Proveedor registrado exitosamente', true);
      if (!supplierId) handleCleanForm();
    }

    setIsLoading(false);
  };



  const handleCleanForm = () => {
    setFormData({
      nameSupplier: '',
      ruc: '',
      socialReason: '',
      email: '',
      phone: '',
      state: true,
    });
  };

  const handleChangeFormState = (
    name: keyof typeof formData,
    value: string | number | boolean
  ) => {
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <Container text='Proveedor no guardado' save onSaveClick={handleFormSubmit} isLoading={isLoading} onClickSecondary={() => navigate("/suppliers/")} >
      <>
        <section className="flex flex-col items-center h-full flex-1">
          <div className="max-w-screen-lg mt-2 w-full mx-auto flex-1 flex flex-col">
            <SubHeader title={!supplierId ? 'Añadir proveedor' : supplierName} backUrl="/suppliers" isShowButtons={supplierId ? true : false} status={formData.state ? true : false} />
            <form onSubmit={handleSubmit} ref={formRef} className="flex flex-1 xl:space-x-6 flex-col xl:flex-row items-start w-full">
              <div className="flex-1 xl:w-auto w-full">
                <FormSection name='Información del proveedor'>
                  <>
                    <FieldInput value={formData.nameSupplier} onChange={(e) => handleChangeFormState('nameSupplier', e.target.value)} name='Nombre' id='nameSupplier' className='mb-5' />
                    <div className='flex items-center w-full mt-5'>
                      <FieldInput required={false} value={formData.ruc} onChange={(e) => handleChangeFormState('ruc', e.target.value)} name='RUC' id='ruc' className='w-full mr-2' />
                      <FieldInput required={false} value={formData.socialReason} onChange={(e) => handleChangeFormState('socialReason', e.target.value)} name='Razón Social' id='SocialReason' className='w-full ml-2' />
                    </div>
                  </>
                </FormSection>

                <FormSection name='Metodos de contacto'>
                  <>
                    <FieldInput required={false} value={formData.email} onChange={(e) => handleChangeFormState('email', e.target.value)} name='Correo' id='email' className='mb-5' placeholder='Ej: correo@ejemplo.com' />
                    <FieldInput required={false} value={formData.phone} onChange={(e) => handleChangeFormState('phone', e.target.value)} name='Telefono' id='phone' />
                  </>
                </FormSection>
              </div>
              <div className="w-full xl:w-1/3">
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