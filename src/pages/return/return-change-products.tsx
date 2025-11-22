import Button from "@/components/form/button";
import { PlusCircleIcon } from "@/icons/icons";
import FormSection from "@/layout/form-section";
import ProductModalSale from "../product/product-modal-sale";
import { Dispatch, SetStateAction, useState } from "react";
import { ReturnProps, SelectedProducts } from "@/types/types";
import AddSaleRowProduct from "../sale/add-sale-row-product";

interface ReturnChangeProductsProps {
  isModalOpen: { products: boolean };
  handleChangeShowModal: (name: 'products', value: boolean) => void;
  productsChange: SelectedProducts[]
  setProductsChange: Dispatch<SetStateAction<SelectedProducts[]>>
}

export default function ReturnChangeProducts({ isModalOpen, handleChangeShowModal, productsChange, setProductsChange }: ReturnChangeProductsProps) {
  const [textSearch, setTextSearch] = useState<string>("")
  const HEADER = [
    { label: "Producto", className: "py-3 w-[30%] pl-3" },
    { label: "Cantidad", className: "px-2 py-3 'text-right'}" },
    { label: "Total", className: "text-right pr-20" },
  ]
  const [returns, setReturns] = useState<ReturnProps[]>([])
  const [adjustedQuantity, setAdjustedQuantity] = useState(0)

  const handleCloseModal = () => {
    handleChangeShowModal('products', false)
    setTextSearch("")
  }
  const handleChangeSelectedProducts = (products: SelectedProducts[]) => {
    setProductsChange(products)
    handleCloseModal()
  }

  const handleProductChange = (index: number, field: string, value: number | string) => {
    const updatedProducts = [...productsChange]
    updatedProducts[index] = { ...updatedProducts[index], [field]: value }
    setProductsChange(updatedProducts)
  }

  const handleDeleteProduct = (index: number) => {
    const updatedProducts = [...productsChange]
    updatedProducts.splice(index, 1)
    setProductsChange(updatedProducts)
  }
  const updateDiscountForProductId = (productId: string, discount: number) => {
    setProductsChange(prev =>
      prev.map(p =>
        p.productId === productId
          ? { ...p, discount }
          : p
      )
    );
  };
  return (
    <FormSection name="Cambiar artículos">
      <>
        <span className="text-sm text-secondary/80 mb-4 block">
          Artículos que se enviarán al cliente. Los artículos no se reservarán hasta que proceses la
          devolución.
        </span>
        {productsChange.length > 0 && (
          <>
            {/* Desktop table view */}
            <div className="hidden md:block relative overflow-x-auto mt-3 px-px">
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
                  {productsChange.map(
                    (
                      { productId, name, quantity, price, discount, storeHouseName, storeHouseId, supplierId, nameSupplier, productSupplierId },
                      index,
                    ) => (
                      <AddSaleRowProduct
                        key={index}
                        price={Number(price) || 0}
                        index={index}
                        name={name}
                        handleProductChange={handleProductChange}
                        handleDeleteProduct={handleDeleteProduct}
                        quantity={quantity}
                        discount={Number(discount) || 0}
                        storeHouseName={storeHouseName || ""}
                        storeHouseId={storeHouseId}
                        supplierId={supplierId}
                        nameSupplier={nameSupplier}
                        isMobile={false}
                        returns={returns}
                        adjustedQuantity={adjustedQuantity}
                        productId={productId}
                        updateDiscountForProductId={updateDiscountForProductId}
                        productSupplierId={productSupplierId}
                        isQuotation={false}
                        stateQuotation={false}

                      />
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden block mt-4 space-y-3">
              {productsChange.map(
                (
                  { productId, name, quantity, price, discount, storeHouseName, storeHouseId, supplierId, nameSupplier, productSupplierId },
                  index,
                ) => (
                  <AddSaleRowProduct
                    key={index}
                    price={Number(price) || 0}
                    index={index}
                    name={name}
                    handleProductChange={handleProductChange}
                    handleDeleteProduct={handleDeleteProduct}
                    quantity={quantity}
                    discount={Number(discount) || 0}
                    storeHouseName={storeHouseName || ""}
                    storeHouseId={storeHouseId}
                    supplierId={supplierId}
                    nameSupplier={nameSupplier}
                    isMobile={true}
                    returns={returns}
                    adjustedQuantity={adjustedQuantity}
                    productId={productId}
                    updateDiscountForProductId={updateDiscountForProductId}
                    productSupplierId={productSupplierId}
                    isQuotation={false}
                    stateQuotation={false}


                  />
                ),
              )}
            </div>
          </>
        )}
        <div className="border rounded-lg p-1">
          <Button onClick={() => { handleChangeShowModal('products', true) }} type="button" >
            <div className="inline-flex items-center gap-2 hover:bg-gray-100 rounded-lg cursor-pointer px-3 py-2 w-fit   ">
              <PlusCircleIcon className="size-5 text-primary/80" />
              <span className="text-sm font-medium text-primary/80">Agregar productos</span>
            </div>
          </Button>

        </div>
        {isModalOpen.products && (
          <ProductModalSale
            activeProducts={productsChange}
            onClickSave={handleChangeSelectedProducts}
            onClose={handleCloseModal}
            text={textSearch}
          />
        )}
      </>
    </FormSection>
  )
}