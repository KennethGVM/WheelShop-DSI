import { supabase } from "@/api/supabase-client";
import Button from "@/components/form/button";
import DropDownSelector from "@/components/form/dropdown-selector";
import FieldInput from "@/components/form/field-input";
import TextArea from "@/components/form/text-area";
import { CloseIcon, SearchIcon } from "@/icons/icons";
import Container from "@/layout/container";
import FormSection from "@/layout/form-section";
import { ProductModalSaleProps, ProductSupplierProps, SelectedProducts, StoreHouseProps, TransferProps } from "@/types/types";
import { ChangeEvent, useEffect, useState } from "react";
import TransferProductRow from "./transfer-product-row";
import SubHeader from "@/components/sub-header";
import { useAuth } from "@/api/auth-provider";
import { showToast } from "@/components/toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ProductModalSale from "../product/product-modal-sale";

export default function AddTransfer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { transferId } = useParams();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  const supplierId = searchParams.get('supplierId');
  const storeHouseId = searchParams.get('storeHouseId');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [storeHouse, setStoreHouse] = useState<StoreHouseProps[]>([]);
  const [textSearch, setTextSearch] = useState<string>('');
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [products, setProducts] = useState<SelectedProducts[]>([]);

  const HEADER = [
    { label: "Productos", className: "px-4 py-3 w-[75%]" },
    ...(!transferId ? [{ label: "Stock", className: "px-2 py-3 text-right" }] : []),
    { label: "Cantidad", className: "px-2 py-3 text-right" },
  ];

  const [formData, setFormData] = useState({
    codeTransfer: '',
    origin: storeHouseId ?? '',
    destination: '',
    referenceNumber: '',
    observations: '',
  });

  useEffect(() => {
    const handleLoadProductById = async () => {
      const { data } = await supabase.from('getproductsales').select('*').eq('productId', productId);
      const productData = data?.[0] as ProductModalSaleProps;
      const matchedSupplier = data?.[0].suppliers.find((s: ProductSupplierProps) => s.supplierId === supplierId);
      const productSupplierId = matchedSupplier?.productSupplierId ?? '';
      setProducts(prev => [...prev, { productId: productData.productId, name: productData.productName, nameSupplier: productData.suppliers.find((s: ProductSupplierProps) => s.supplierId === supplierId)?.nameSupplier, quantity: 1, productSupplierId: productSupplierId, stock: productData.suppliers.find((s: ProductSupplierProps) => s.supplierId === supplierId)?.stock, cost: productData.suppliers.find((s: ProductSupplierProps) => s.supplierId === supplierId)?.cost }]);
    }

    if (productId) handleLoadProductById();
  }, [productId, supplierId])

  const handleCloseModal = () => {
    setIsShowModal(false);
    setTextSearch('');
  };

  const handleChangeSelectedProducts = (products: SelectedProducts[]) => {
    setProducts(products);
    handleCloseModal();
  };

  const handleChangeFormData = (name: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [name]: value });
  }

  useEffect(() => {
    const handleLoadTransferById = async () => {
      const { data } = await supabase.from('gettransfers').select('*').eq('transferId', transferId);
      const transferData = data?.[0] as TransferProps;
      setFormData({
        codeTransfer: transferData.codeTransfer,
        origin: transferData.origin,
        destination: transferData.destination,
        referenceNumber: transferData.referenceNumber,
        observations: transferData.observations,
      });

      setProducts(transferData.products.map((product) => ({
        productSupplierId: product.productSupplierId,
        name: product.productName,
        quantity: product.quantity,
        nameSupplier: product.nameSupplier,
        productId: '',
      })))
    }

    if (transferId) handleLoadTransferById();
  }, [transferId])

  useEffect(() => {
    const handleLoadStoreHouse = async () => {
      const { data } = await supabase.from('storeHouse').select('*');
      setStoreHouse(data as StoreHouseProps[]);
    };

    handleLoadStoreHouse();
  }, [])

  const handleSearchProducts = (e: ChangeEvent<HTMLInputElement>) => {
    setTextSearch(e.target.value);
    setIsShowModal(true);
  };

  const handleProductChange = (index: number, field: string, value: number | string) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };

    setProducts(updatedProducts);
  };

  const handleDeleteProduct = (index: number) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  const handleSubmit = async () => {
    if (!formData.origin) {
      showToast('Se requiere un origen para la transferencia.', false);
      return;
    }

    if (!formData.destination) {
      showToast('Se requiere un destino para la transferencia.', false);
      return;
    }

    if (products.length === 0) {
      showToast('Se requiere al menos un producto para transferencia.', false);
      return;
    }

    const invalidProduct = products.find(
      (product) => !product.quantity || product.quantity <= 0);

    if (invalidProduct) {
      showToast('Todos los productos deben tener una cantidad mayor a 0.', false);
      return;
    }

    setIsLoading(true);
    const product = products.map(({ productSupplierId, quantity, cost }) => ({ productSupplierId: productSupplierId.split('/')[0], quantity, cost }));
    const { error } = await supabase.rpc('create_transfer', {
      destination: formData.destination,
      observations: formData.observations,
      origin: formData.origin,
      product: product,
      referencenumber: formData.referenceNumber,
      userid: user.id
    })

    if (error) {
      showToast(error.message, false);
    } else {
      showToast('Transferencia creada', true);
      setFormData({
        codeTransfer: '',
        destination: '',
        observations: '',
        origin: '',
        referenceNumber: '',
      });
      setProducts([]);
    }
    setIsLoading(false)
  }

  return (
    <Container text="Transferencia sin guardar" save onSaveClick={handleSubmit} isLoading={isLoading} onClickSecondary={() => navigate("/transfers/")}>
      <>
        <section className="max-w-[950px] flex flex-1 flex-col mt-2 w-full mx-auto">
          <SubHeader backUrl="/transfers" title={transferId ? formData.codeTransfer : "Crea transferencia"} />
          <FormSection className="py-0 px-0">
            <div className="flex md:flex-row flex-col items-center [&>div]:py-5 [&>div]:px-4">
              <DropDownSelector
                name="Origen"
                className="md:border-b-0 md:border-r"
                disabled={transferId ? true : false}
                isCreated={false}
                value={formData.origin}
                items={storeHouse.map((sh) => ({ name: sh.name, value: sh.storeHouseId }))}
                onChange={(value) => handleChangeFormData('origin', value)}
              />

              <DropDownSelector
                name="Destino"
                className="border-none"
                disabled={transferId ? true : false}
                isCreated={false}
                value={formData.destination}
                items={storeHouse.map((sh) => ({ name: sh.name, value: sh.storeHouseId }))}
                onChange={(value) => handleChangeFormData('destination', value)}
              />
            </div>
          </FormSection>

          <FormSection name={`${transferId ? 'Productos transferidos' : 'Agregar productos'}`} className="px-0" classNameLabel="mx-4">
            <>
              {!transferId &&
                <div className="md:flex hidden items-center space-x-2 px-4">
                  <FieldInput
                    placeholder="Buscar productos"
                    className="mb-0 w-full"
                    disabled={!formData.origin}
                    value={textSearch}
                    onChange={handleSearchProducts}
                    appendChild={<SearchIcon className="size-4 text-whiting" />}
                  />
                  <Button type="button" disabled={!formData.origin} onClick={() => setIsShowModal(true)} name="Explorar" styleButton="primary" className="px-2 py-1.5 text-2xs font-semibold text-secondary/90 disabled:shadow-none disabled:cursor-default disabled:bg-[#f2f2f2] disabled:text-[#beb8b5]" />
                </div>
              }

              {!transferId &&
                <div className='px-4 mt-5 md:hidden block'>
                  <button onClick={() => { setTextSearch(''); setIsShowModal(true) }} className='border border-gray-300 rounded-md w-full py-3 text-secondary/90 font-[550] text-sm'>
                    Añadir producto
                  </button>
                </div>
              }
              {products.length > 0 &&
                <>
                  <div className="relative overflow-x-auto mt-3 px-px md:block hidden">
                    <table className="w-full text-left">
                      <thead className="text-primary px-4 font-semibold text-2xs border-b border-gray-300">
                        <tr>
                          {HEADER.map((th, index) => (
                            <th key={index} scope="col" className={th.className}>
                              {th.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(({ name, stock, quantity, nameSupplier }, index) => (
                          <TransferProductRow
                            key={index}
                            transferId={transferId}
                            stock={stock ?? 0}
                            index={index}
                            nameSupplier={nameSupplier ?? ''}
                            name={name}
                            handleProductChange={handleProductChange}
                            handleDeleteProduct={handleDeleteProduct}
                            quantity={quantity}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className='space-y-4 md:hidden block mt-5'>
                    {products.map(({ name, quantity, productId }, index) => (
                      <div key={index} className='border-b border-gray-300 py-3 px-4'>
                        <div className='flex items-center justify-between mb-3'>
                          <a className='text-blueprimary hover:underline text-[15px] font-semibold' href={`/products/add/${productId}`}>{name}</a>
                          <Button onClick={() => handleDeleteProduct(index)} type="button">
                            <CloseIcon className='size-5 stroke-secondary/80 stroke-2' />
                          </Button>
                        </div>
                        <FieldInput
                          isNumber
                          value={quantity}
                          className="mb-0"
                          onChange={(e) => handleProductChange(index, 'quantity', Number(e.target.value))}
                        />
                      </div>
                    ))}
                  </div>
                  <span className="font-medium md:text-2xs text-base text-secondary/90 inline-block mx-4 mt-4">{products.length} productos en la orden de compra</span>
                </>
              }
            </>
          </FormSection>

          <div className="flex md:flex-row flex-col md:space-x-2 [&>section]:w-full items-start">
            <FormSection name="Información adicional">
              <>
                {!transferId ? (
                  <TextArea
                    name="Observaciones"
                    id="observations"
                    className="mb-0"
                    rows={4}
                    value={formData.observations}
                    onChange={(e) => handleChangeFormData('observations', e.target.value)}
                  />
                ) : (
                  <div className='md:text-2xs text-base font-medium space-y-1'>
                    <span className='text-secondary/80'>Observaciones</span>
                    <p className='text-primary'>{formData.observations || 'Ninguna'}</p>
                  </div>
                )}
              </>
            </FormSection>
            <FormSection name="Información adicional">
              <>
                {!transferId ? (
                  <FieldInput
                    name="Numero de referencia"
                    id="reference-number"
                    className="mb-0"
                    value={formData.referenceNumber}
                    onChange={(e) => handleChangeFormData('referenceNumber', e.target.value)}
                  />
                ) : (
                  <div className='md:text-2xs text-base font-medium space-y-1'>
                    <span className='text-secondary/80'>Número de referencia</span>
                    <p className='text-primary'>{formData.referenceNumber || 'Ninguno'}</p>
                  </div>
                )}
              </>
            </FormSection>
          </div>
        </section>
        {isShowModal && <ProductModalSale storeHouse={storeHouse.find((sh) => sh.storeHouseId === formData.origin)} activeProducts={products} onClickSave={handleChangeSelectedProducts} onClose={handleCloseModal} text={textSearch} />}
      </>
    </Container >
  )
}
