import Button from '@/components/form/button'
import FieldInput from '@/components/form/field-input'
import { CloseIcon, SearchIcon } from '@/icons/icons'
import FormSection from '@/layout/form-section'
import { PurchaseProps, SelectedProducts } from '@/types/types'
import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react'
import { currencyFormatter } from '@/lib/function'
import { Link } from 'react-router-dom'
import ProductModal from '../product/product-modal'
import PurchaseRowProduct from './purchase-row-product'

interface PurchaseProductsProps {
  formData: Omit<PurchaseProps, 'purchaseOrderId' | 'nameSupplier' | 'namestorehouse' | 'namePaymentMethod' | 'products'>;
  products: SelectedProducts[]
  setProducts: Dispatch<SetStateAction<SelectedProducts[]>>
}

export default function PurchaseProducts({ formData, products, setProducts }: PurchaseProductsProps) {
  const HEADER = [
    { label: "Productos", className: "px-4 py-3 w-[30%]" },
    { label: formData?.state < 1 ? "Cantidad" : "Recibido", className: "px-2 py-3" },
    { label: "Costo", className: `px-2 py-3 ${formData?.state < 1 ? 'text-left' : 'text-right'}` },
    { label: "Total", className: `${formData.state < 1 ? 'px-2' : 'px-4'} py-3 text-right w-[15%]` },
    ...(formData?.state < 1 ? [{ label: "", className: "px-2 py-3" }] : [])
  ];

  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [textSearch, setTextSearch] = useState<string>('');

  const handleCloseModal = () => {
    setIsShowModal(false);
    setTextSearch('');
  };

  const handleChangeSelectedProducts = (products: SelectedProducts[]) => {
    setProducts(products);
    handleCloseModal();
  };

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

  return (
    <FormSection name={formData.state < 1 ? "Añadir productos" : "Productos ordenados"} className="px-0" classNameLabel="mx-4">
      <>
        <div className="md:flex hidden items-center space-x-2 px-4">
          <FieldInput
            placeholder="Buscar productos"
            className="mb-0 w-full"
            value={textSearch}
            onChange={handleSearchProducts}
            disabled={formData.state === 1 || !formData.supplierId}
            appendChild={<SearchIcon className="size-4 text-whiting" />}
          />
          <Button type="button" disabled={!formData.supplierId} onClick={() => setIsShowModal(true)} name="Explorar" styleButton="primary" className="px-2 py-1.5 text-2xs font-semibold text-secondary/90 disabled:shadow-none disabled:cursor-default disabled:bg-[#f2f2f2] disabled:text-[#beb8b5]" />
        </div>

        <div className='px-4 mt-5 md:hidden block'>
          <button type='button' disabled={!formData.supplierId} onClick={() => { setTextSearch(''); setIsShowModal(true) }} className='border border-gray-300 rounded-md w-full py-3 text-secondary/90 font-[550] text-sm'>
            Añadir producto
          </button>
        </div>
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
                  {products.map(({ productId, name, quantity, cost }, index) => (
                    <PurchaseRowProduct
                      key={index}
                      productId={productId}
                      state={formData && formData!.state}
                      cost={Number(cost)}
                      index={index}
                      name={name}
                      handleProductChange={handleProductChange}
                      handleDeleteProduct={handleDeleteProduct}
                      quantity={quantity}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className='space-y-4'>
              {products.map(({ name, quantity, cost, productId }, index) => (
                <div key={index} className='md:hidden block border-b border-gray-300 py-3 px-4'>
                  <div className='flex items-center justify-between mb-3'>
                    <Link className='text-blueprimary hover:underline text-[15px] font-semibold' to={`/products/add/${productId}`}>{name}</Link>
                    <Button onClick={() => handleDeleteProduct(index)} type="button">
                      <CloseIcon className='size-5 stroke-secondary/80 stroke-2' />
                    </Button>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <FieldInput
                      isNumber
                      value={quantity}
                      className="mb-0"
                      onChange={(e) => handleProductChange(index, 'quantity', Number(e.target.value))}
                    />
                    <FieldInput
                      isNumber
                      appendChild={<span className="text-2xs font-medium text-secondary/80">C$</span>}
                      value={cost}
                      placeholder="0.00"
                      className="mb-0"
                      onChange={(e) => handleProductChange(index, 'cost', Number(e.target.value))}
                    />
                  </div>
                  <div className='mt-3 flex flex-col'>
                    <span className='text-secondary/80 font-medium text-base'>Total</span>
                    <span className='text-secondary/90 font-[550] text-base'>{currencyFormatter(quantity * Number(cost))}</span>
                  </div>
                </div>
              ))}
            </div>

            <span className="font-medium md:text-2xs text-base text-secondary/90 inline-block mx-4 mt-4">{products.length} productos en la orden de compra</span>
          </>
        }
        {isShowModal && <ProductModal supplierId={formData.supplierId} activeProducts={products} onClickSave={handleChangeSelectedProducts} onClose={handleCloseModal} text={textSearch} />}
      </>
    </FormSection>
  )
}