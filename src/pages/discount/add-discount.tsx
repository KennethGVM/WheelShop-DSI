import Button from "@/components/form/button";
import CheckBox from "@/components/form/check-box";
import DateTimePicker from "@/components/form/datetimepicker";
import FieldInput from "@/components/form/field-input";
import FieldSelect from "@/components/form/field-select";
import RadioButton from "@/components/form/radio-button";
import SubHeader from "@/components/sub-header";
import { CloseIcon, ProductsIcon, SearchIcon } from "@/icons/icons";
import Container from "@/layout/container";
import FormSection from "@/layout/form-section";
import { currencyFormatter } from "@/lib/function";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import ProductModal from "../product/product-modal";
import { DiscountProps, SelectedProducts } from "@/types/types";
import { supabase } from "@/api/supabase-client";
import { showToast } from "@/components/toast";
import { useParams } from "react-router-dom";

interface DiscountFormDataById extends Omit<DiscountProps, 'products'> {
  products: { productId: string; name: string }[];
}

export default function AddDiscount() {
  const { discountId } = useParams();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const requirements = ['Sin requisitos minimos', 'Monto minimo de compra (C$)', 'Cantidad minima de artículos'];
  const [textSearch, setTextSearch] = useState<string>('');
  const [products, setProducts] = useState<SelectedProducts[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    typeDiscount: 0,
    discountValue: 0,
    requirements: 0,
    minimumPurchase: 0,
    minimumProducts: 0,
    startDate: new Date(),
    endDate: null as Date | null,
    activeEndDate: false,
    isOnce: true,
    uses: 0,
  });

  useEffect(() => {
    const handleLoadDiscountById = async () => {
      const { data, error } = await supabase.from('getdiscounts').select('*').eq('discountId', discountId).single();
      if (error) {
        showToast(error.message, false)
        return;
      }

      const discount = data as DiscountFormDataById;

      setFormData({
        title: discount.title,
        typeDiscount: discount.typeDiscount,
        discountValue: discount.amount,
        requirements: discount.typeRequirement,
        minimumPurchase: discount.minimumPurchase ?? 0,
        minimumProducts: discount.minimumProduct ?? 0,
        startDate: new Date(discount.startDate),
        endDate: new Date(discount.endDate ?? new Date()),
        activeEndDate: discount.endDate ? true : false,
        isOnce: discount.isOnce,
        uses: discount.uses,
      })

      setProducts(discount.products.map(({ productId, name }) => ({ productId, name, quantity: 0, productSupplierId: '' })));
    }

    if (discountId) handleLoadDiscountById();

  }, [discountId]);

  const handleChangeFormData = (name: keyof typeof formData, value: string | number | Date | boolean) => {
    setFormData({ ...formData, [name]: value });
  }

  const handleCloseModal = () => {
    setIsShowModal(false);
    setTextSearch('');
  };

  const handleChangeSelectedProducts = (products: SelectedProducts[]) => {
    setProducts(products);
    handleCloseModal();
  };

  const getDiscountStatusText = () => {
    const now = new Date();
    const startDate = new Date(formData.startDate);
    const endDate = formData.endDate ? new Date(formData.endDate) : null;

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('es-NI', {
        day: 'numeric',
        month: 'long',
      }).format(date);
    };

    const isSameDay = (a: Date, b: Date) =>
      a.toDateString() === b.toDateString();

    if (endDate && isSameDay(startDate, endDate)) {
      return `Activo el ${formatDate(startDate)}`;
    }

    if (isSameDay(startDate, now) && !endDate) {
      return 'Activo hoy';
    }

    if (isSameDay(startDate, now) && endDate) {
      return `Activo hoy hasta ${formatDate(endDate)}`;
    }

    if (!isSameDay(startDate, now) && endDate) {
      return `Activo el ${formatDate(startDate)} hasta ${formatDate(endDate)}`;
    }

    return `Activo el ${formatDate(startDate)}`;
  };

  const handleSearchProducts = (e: ChangeEvent<HTMLInputElement>) => {
    setTextSearch(e.target.value);
    setIsShowModal(true);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.title.trim() === "") {
      showToast("El nombre no puede estar vacío", false);
      return;
    }

    if (formData.discountValue === 0) {
      showToast("El valor del descuento no puede ser 0", false);
      return;
    }

    const newDiscount = {
      p_amount: formData.discountValue,
      p_enddate: formData.endDate,
      p_isonce: formData.isOnce,
      p_minimumproduct: formData.minimumProducts,
      p_minimumpurchase: formData.minimumPurchase,
      p_products: products.map(({ productId }) => productId),
      p_startdate: new Date(formData.startDate),
      p_state: new Date(formData.startDate).toDateString() === new Date().toDateString(),
      p_title: formData.title,
      p_typerequirement: formData.requirements,
      p_ispercentage: formData.typeDiscount === 0 ? true : false,
      p_typediscount: 0,
      p_isfree: false,
      p_quantity: 0,
      p_secondproducts: null
    }

    const { error } = !discountId ? await supabase.rpc('create_discount', newDiscount) : await supabase.rpc('update_discount', { ...newDiscount, p_discountid: discountId })

    if (error) {
      showToast(error.message, false)
    } else {
      showToast(`Descuento ${discountId ? 'actualizado' : 'creado'}`, true)
      if (!discountId) setFormData({ ...formData, title: '', typeDiscount: 0, discountValue: 0, requirements: 0, minimumPurchase: 0, minimumProducts: 0, startDate: new Date(), endDate: null as Date | null, activeEndDate: false, isOnce: false })
    }
  }

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit()
  }

  return (
    <Container save={formData.uses > 0 ? false : true} onSaveClick={handleFormSubmit} text="Descuento no guardado">
      <section className="flex flex-col items-center h-full flex-1">
        <div className="max-w-screen-lg mt-2 w-full mx-auto flex-1 flex flex-col">
          <SubHeader title={discountId ? formData.title : "Crear descuento"} backUrl="/discounts" />
          <main className="flex flex-1 flex-col xl:flex-row items-start w-full">
            <form onSubmit={handleSubmit} ref={formRef} className="flex flex-1 xl:space-x-6 flex-col-reverse xl:flex-row items-start w-full">
              <div className="flex-1 xl:w-auto w-full">
                <FormSection name="Descuento sobre productos">
                  <FieldInput
                    name="Titulo"
                    value={formData.title}
                    onChange={(e) => handleChangeFormData('title', e.target.value)}
                    id="title"
                    readOnly={formData.uses > 0 ? true : false}
                    className="mb-0"
                  />
                </FormSection>

                <FormSection name="Valor del descuento">
                  <>
                    <div className="flex items-center space-x-3 mt-3">
                      <FieldSelect
                        options={[{ name: 'Porcentaje', value: 0 }, { name: 'Monto fijo', value: 1 }]}
                        className="w-2/3"
                        value={formData.typeDiscount}
                        disabled={formData.uses > 0 ? true : false}
                        onChange={(e) => handleChangeFormData('typeDiscount', Number(e.target.value))}
                      />

                      <FieldInput
                        className="mb-0"
                        readOnly={formData.uses > 0 ? true : false}
                        value={formData.discountValue}
                        onChange={(e) => handleChangeFormData('discountValue', Number(e.target.value))}
                        prependChild={<span className="text-secondary/80 text-2xs font-medium">{formData.typeDiscount === 0 ? '%' : 'C$'}</span>}
                      />
                    </div>

                    <div className="items-end space-x-2 mt-5 md:flex hidden">
                      <FieldInput
                        placeholder="Buscar productos"
                        name="Se aplica a"
                        value={textSearch}
                        onChange={handleSearchProducts}
                        readOnly={formData.uses > 0 ? true : false}
                        className="mb-0 w-full"
                        appendChild={<SearchIcon className="size-4 text-whiting" />}
                      />
                      <Button disabled={formData.uses > 0 ? true : false} onClick={() => setIsShowModal(true)} type="button" name="Explorar" styleButton="primary" className="px-2 py-1.5 text-2xs font-semibold text-secondary/90 disabled:shadow-none disabled:cursor-default disabled:bg-[#f2f2f2] disabled:text-[#beb8b5]" />
                    </div>

                    <div className='mt-5 md:hidden block'>
                      <button type="button" disabled={formData.uses > 0 ? true : false} onClick={() => setIsShowModal(true)} className='border border-gray-300 rounded-md w-full py-3 text-secondary/90 font-[550] text-sm'>
                        Añadir producto
                      </button>
                    </div>

                    {formData.typeDiscount === 1 &&
                      <div className="space-y-2 mt-5">
                        <CheckBox disabled={formData.uses > 0 ? true : false} initialValue={formData.isOnce} onChange={(value) => handleChangeFormData('isOnce', value)} name="Una vez por pedido" classNameLabel="text-2xs" />
                        <p className="text-xs font-medium text-secondary/80">Si no lo seleccionas, el monto se descontará de cada artículo elegible en un pedido.</p>
                      </div>
                    }
                    {products.length > 0 &&
                      <div className="border border-gray-300 rounded-md mt-4">
                        {products.map(({ name }, index) => (
                          <div className={`flex items-center ${index !== products.length - 1 ? 'border-b' : ''} border-gray-300 py-4 justify-between px-4`} key={index}>
                            <span className="font-medium md:text-2xs text-base text-secondary/90 truncate block">{name}</span>

                            <Button type="button" onClick={() => handleChangeSelectedProducts(products.filter((_, i) => i !== index))}>
                              <CloseIcon className="md:size-3 size-4 stroke-secondary/80 md:stroke-[3] stroke-2" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    }
                  </>
                </FormSection>

                <FormSection name="Requisitos minimos de compra">
                  <div className="space-y-3">
                    {requirements.map((requirement, index) => (
                      <div key={index}>
                        <RadioButton
                          disabled={formData.uses > 0 ? true : false}
                          onClick={() => handleChangeFormData('requirements', index)}
                          name={requirement}
                          checked={formData.requirements === index}
                        />

                        {formData.requirements === 1 && index === 1 && (
                          <div className="mt-2 ml-5">
                            <FieldInput
                              isNumber
                              appendChild={<span className="text-2xs font-medium text-secondary/80">C$</span>}
                              value={formData.minimumPurchase}
                              readOnly={formData.uses > 0 ? true : false}
                              className="w-40"
                              onChange={(e) =>
                                handleChangeFormData('minimumPurchase', Number(e.target.value))
                              }
                            />
                            <span className="font-medium text-2xs text-secondary/80">Se aplica solo a los productos seleccionados.</span>
                          </div>
                        )}

                        {formData.requirements === 2 && index === 2 && (
                          <div className="mt-2 ml-5">
                            <FieldInput
                              isNumber
                              type="number"
                              readOnly={formData.uses > 0 ? true : false}
                              className="w-40"
                              value={formData.minimumProducts}
                              onChange={(e) =>
                                handleChangeFormData('minimumProducts', Number(e.target.value))
                              }
                            />
                            <span className="font-medium text-2xs text-secondary/80">Se aplica solo a los productos seleccionados.</span>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                </FormSection>

                <FormSection name="Fechas de activación">
                  <>
                    <div className="flex mb-5 items-center space-x-3 [&>div]:w-full">
                      <DateTimePicker
                        name="Fecha de inicio"
                        position="top"
                        disabled={formData.uses > 0 ? true : false}
                        value={formData.startDate}
                        onChange={(date: Date) => handleChangeFormData('startDate', date)}
                      />
                      <FieldInput name="Hora de inicio" value='00:00' readOnly className="mb-0" />
                    </div>

                    <CheckBox
                      name="Establecer fecha de finalización"
                      classNameLabel="md:text-2xs text-base font-[550]"
                      disabled={formData.uses > 0 ? true : false}
                      initialValue={formData.activeEndDate}
                      onChange={(value) =>
                        setFormData({ ...formData, activeEndDate: value, endDate: value ? new Date() : null })
                      }
                    />

                    {formData.activeEndDate && (
                      <div className="flex mt-5 items-center space-x-3 [&>div]:w-full">
                        <DateTimePicker
                          name="Fecha de finalización"
                          position="top"
                          value={formData.endDate}
                          disabled={formData.uses > 0 ? true : false}
                          onChange={(date: Date) => handleChangeFormData('endDate', date)}
                        />
                        <FieldInput name="Hora de finalización" value='12:00' readOnly className="mb-0" />
                      </div>
                    )}
                  </>
                </FormSection>
              </div>
              <div className="w-full xl:w-1/3">
                <FormSection name={formData.title.trim() === '' ? 'Aun no hay título' : formData.title} classNameLabel="mb-0">
                  <>
                    <p className="font-normal md:text-2xs text-base text-secondary/80">Automático</p>

                    <div className="mt-5">
                      <h3 className="font-[550] text-sm text-primary">Tipo</h3>
                      <p className="font-medium md:text-2xs text-base text-secondary/80 mt-2 mb-1">Descuento sobre productos</p>

                      <div className="flex items-center space-x-2">
                        <ProductsIcon className="fill-transparent stroke-[1.5] size-4 stroke-secondary/80" />
                        <span className="font-medium md:text-2xs text-base text-secondary/80">Descuento de productos</span>
                      </div>
                    </div>

                    <div className="mt-5">
                      <h3 className="font-[550] text-sm text-primary">Detalles</h3>

                      <ul className="list-disc space-y-0.5 marker:text-secondary/80 mt-2 px-6">
                        <li className="md:text-2xs text-base font-[550] text-secondary/80">Para el modulo de ventas</li>
                        {formData.typeDiscount === 1 && <li className="md:text-2xs text-base font-[550] text-secondary/80">{formData.isOnce ? 'Se aplica una vez por pedido' : 'Se aplica a cada artículo elegible por pedido'}</li>}
                        {(
                          formData.requirements === 0 ||
                          (formData.requirements === 1 && formData.minimumPurchase > 0) ||
                          (formData.requirements === 2 && formData.minimumProducts > 0)
                        ) && (
                            <li className="md:text-2xs text-base font-[550] text-secondary/80">
                              {
                                formData.requirements === 0
                                  ? 'Sin requisito de compra mínima'
                                  : formData.requirements === 1
                                    ? `Compra mínima de ${currencyFormatter(formData.minimumPurchase)}`
                                    : `Compra mínima de ${formData.minimumProducts} artículo${formData.minimumProducts > 1 ? 's' : ''}`
                              }
                            </li>
                          )}

                        <li className="md:text-2xs text-base font-[550] text-secondary/80">Todos los clientes</li>
                        <li className="md:text-2xs text-base font-[550] text-secondary/80">{getDiscountStatusText()}</li>
                      </ul>
                    </div>
                  </>
                </FormSection>
              </div>
            </form>
          </main>
        </div>
        {isShowModal && <ProductModal activeProducts={products} onClickSave={handleChangeSelectedProducts} onClose={handleCloseModal} text={textSearch} />}
      </section>
    </Container >
  )
}
