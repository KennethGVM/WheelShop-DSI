import Button from "@/components/form/button"
import FieldInput from "@/components/form/field-input"
import { GeneralIcon, ReturnIcon, SearchIcon, ShippingIcon } from "@/icons/icons"
import FormSection from "@/layout/form-section"
import type { ReturnProps, SaleProps, SelectedProducts } from "@/types/types"
import { type ChangeEvent, type Dispatch, type SetStateAction, useRef, useState } from "react"
import AddSaleRowProduct from "./add-sale-row-product"
import ProductModalSale from "../product/product-modal-sale"
import ReturnShowProducts from "../return/return-show-products"
import ReturnShowChangeProducts from "../return/return-show-change-products"
import Modal from "@/components/modal"
import { showToast } from "@/components/toast"

interface AddSaleProductProps {
  products: SelectedProducts[]
  setProducts: Dispatch<SetStateAction<SelectedProducts[]>>
  saleId?: string
  returns: ReturnProps[]
  formData: Omit<SaleProps, 'saleId' | 'salesCode' | 'products' | 'salePaymentDetails' | 'return'>;
  saleCode: string;
  isQuotation: boolean;
  stateQuotation: boolean;
  onDiscountIdsChange: (discountIds: string[]) => void;

}

export default function AddSaleProduct({ products, setProducts, saleId, returns, formData, saleCode, isQuotation, stateQuotation, onDiscountIdsChange }: AddSaleProductProps) {
  const HEADER = [
    { label: "Producto", className: "py-3 w-[30%]" },
    { label: "Cantidad", className: "" },
    { label: "Total", className: "text-right" },
  ]

  const [isShowModal, setIsShowModal] = useState<boolean>(false)
  const [newProductModal, setNewProductModal] = useState<boolean>(false)
  const [textSearch, setTextSearch] = useState<string>("")

  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState<number | ''>('');
  const [productQuantity, setProductQuantity] = useState<number | ''>('');
  const discountIdsUsedRef = useRef<string[]>([]);


  const handleSaveProduct = () => {
    if (!productName || !productPrice || !productQuantity) {
      showToast("Todos los campos son obligatorios.", false);
      return;
    }

    const productsNew: SelectedProducts = {
      productId: `${crypto.randomUUID()}/New`,
      name: productName,
      price: productPrice,
      quantity: productQuantity,
      discount: 0,
      storeHouseName: "",
      storeHouseId: "",
      supplierId: "",
      nameSupplier: "",
      productSupplierId: "",
      cost: 0,
    };

    setProducts((prev) => [...prev, productsNew]);

    setProductName('');
    setProductPrice('');
    setProductQuantity('');
    handleCloseModalNewProduct();
  };

  const handleCloseModal = () => {
    setIsShowModal(false)
    setTextSearch("")
  }

  const handleChangeSelectedProducts = (products: SelectedProducts[]) => {
    setProducts(products)
    handleCloseModal()
  }

  const handleSearchProducts = (e: ChangeEvent<HTMLInputElement>) => {
    setTextSearch(e.target.value)
    setIsShowModal(true)
  }

  const handleCloseModalNewProduct = () => {
    setNewProductModal(false)
  }


  const handleProductChange = (index: number, field: string, value: number | string) => {
    const updatedProducts = [...products]
    updatedProducts[index] = { ...updatedProducts[index], [field]: value }
    setProducts(updatedProducts)

  }

  const handleDeleteProduct = (index: number) => {
    const updatedProducts = [...products]
    updatedProducts.splice(index, 1)
    setProducts(updatedProducts)
  }

  const getReturnedQuantitiesMap = () => {
    const map = new Map<string, number>();
    returns.forEach(ret => {
      ret.returnDetail.forEach(detail => {
        if (detail.type === false && detail.productSupplierId) {
          const prev = map.get(detail.productSupplierId) || 0;
          map.set(detail.productSupplierId, prev + Number(detail.quantity || 0));
        }
      });
    });
    return map;
  };

  const returnedMap = getReturnedQuantitiesMap();

  const filteredProducts = products.filter(product => {
    const returnedQty = returnedMap.get(product.productSupplierId || '') || 0;
    const qty = Number(product.quantity || 0);
    const adjustedQuantity = qty - returnedQty;

    // Si NO hay saleId (nueva venta), no filtrar ningún producto
    if (!saleId) return true;
    if (saleId && isQuotation) return true;

    // Si HAY saleId (editando venta o devolución), eliminar si cantidad - devuelto es 0
    return adjustedQuantity > 0;
  });

  const totalQuantity = products.reduce((sum, product) => sum + Number(product.quantity || 0), 0) -
    returns.reduce((total, ret) => {
      const returnedQty = ret.returnDetail
        .filter(detail => detail.type === false)
        .reduce((sum, detail) => sum + Number(detail.quantity || 0), 0);
      return total + returnedQty;
    }, 0);

  const updateDiscountForProductId = (productSupplierId: string, discount: number) => {
    setProducts(prev =>
      prev.map(p =>
        p.productSupplierId === productSupplierId
          ? { ...p, discount }
          : p
      )
    );
  };

  const productCount = products.reduce((sum, p) => sum + Number(p.quantity || 0), 0);

  // ⚠️ IMPORTANTE: No restes el descuento aquí, ya que se está calculando para aplicar.
  const total = products.reduce((sum, p) => {
    const price = Number(p.price || 0);
    const qty = Number(p.quantity || 0);
    return sum + (price * qty);
  }, 0);


  const updateDiscountIds = (index: number, discountId: string | null) => {
    const newIds = [...discountIdsUsedRef.current];

    if (discountId) {
      newIds[index] = discountId;
    } else {
      newIds.splice(index, 1);
    }

    const filteredIds = newIds.filter(Boolean);
    discountIdsUsedRef.current = filteredIds;
    onDiscountIdsChange(filteredIds); // Notifica al padre
  };

  return (
    <>
      {returns.length > 0 &&
        <ReturnShowProducts returns={returns} saleCode={saleCode} />
      }
      <FormSection name={!saleId || isQuotation ? "Productos" : ""}>
        <>
          {saleId && !isQuotation && (
            <div className="flex items-center gap-2 mb-4 md:ml-0">
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg ${isQuotation
                ? "bg-[#D3F0F7] text-secondary"
                : "bg-[#affebf] text-[#014b40]" // o los estilos que quieras cuando no es quotation
                }`}>
                {formData.shippingCost > 0 ? (
                  <ShippingIcon className="size-4 stroke-none fill-current" />
                ) : isQuotation ? (
                  <ReturnIcon className="size-4 stroke-none fill-current" />
                ) : (
                  <GeneralIcon className="size-4 stroke-none fill-current" />
                )}
                <p className="md:text-2xs text-base font-medium">
                  preparados ({totalQuantity})
                </p>
              </div>
              <p className="md:text-2xs text-base font-medium text-primary">
                {isQuotation ? saleCode : `${saleCode}${returns.length > 0 ? "-F1" : ""}`}
              </p>
            </div>
          )}
          <div className=" rounded-lg  ">
            <>
              {saleId && !isQuotation && (
                <div className="bg-white border-b border-gray-300 rounded-lg md:rounded-none px-1 md:px-0 pb-2 text-base md:text-2xs space-y-1">
                  <div>
                    <p className="font-medium text-primary/80">Preparado:</p>
                    <p className="font-medium text-secondary">
                      {new Date(formData.createdAt).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      }).replace('.', '')}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-primary/80">Forma de entrega:</p>
                    <p className="font-medium text-primary">
                      {formData.shippingCost > 0 ? "Envío" : "En tienda"}
                    </p>
                  </div>
                </div>
              )}
              {((!saleId || (isQuotation && !stateQuotation)) || (isQuotation && saleId)) && (
                <>
                  {/* Desktop search */}
                  <div className="md:flex hidden items-center justify-between space-x-1 mt-2 ">
                    <FieldInput
                      placeholder="Buscar productos"
                      className="w-full mb-0"
                      value={textSearch}
                      onChange={handleSearchProducts}
                      appendChild={<SearchIcon className="size-4 text-whiting" />}
                    />
                    <Button
                      type="button"
                      styleButton="primary"
                      name="Explorar"
                      className="bg-white text-2xs py-1.5 px-3"
                      onClick={() => setIsShowModal(true)}
                    />
                    {isQuotation && !saleId && (
                      <Button
                        type="button"
                        styleButton="primary"
                        name="Agregar producto personalizado"
                        className="bg-white text-2xs py-1.5 px-3 whitespace-nowrap"
                        onClick={() => setNewProductModal(true)}
                      />
                    )}
                  </div>
                  {(!saleId || (isQuotation && !stateQuotation)) &&
                    <div className="md:hidden block space-y-3">
                      <Button
                        onClick={() => {
                          setTextSearch("")
                          setIsShowModal(true)
                        }}
                        className="border border-gray-300 rounded-md w-full py-3 text-secondary/90 font-[550] text-sm"
                        type="button"
                        name="Agregar productos"
                        styleButton="secondary"
                      />
                      {isQuotation && !saleId && (
                        <Button
                          onClick={() => {
                            setNewProductModal(true)
                          }}
                          className="border border-gray-300 rounded-md w-full py-3  text-secondary/90 font-[550] text-sm"
                          type="button"
                          name="Agregar producto personalizado"
                          styleButton="primary"
                        />
                      )}
                    </div>
                  }
                </>
              )}

              <>
                {/* Desktop table view */}
                <div className="hidden md:block relative  mt-3 px-px overflow-x-hidden">
                  {filteredProducts.length > 0 ? (
                    <table className="w-full text-left">
                      {!saleId && (
                        <thead className="text-primary px-4 font-semibold text-2xs border-b  border-gray-300">
                          <tr>
                            {HEADER.map((th, index) => (
                              <th key={index} scope="col" className={th.className}>
                                {th.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                      )}
                      <tbody>
                        {filteredProducts.map((item, index) => {
                          const returnedQty = returnedMap.get(item.productSupplierId || '') || 0;
                          const adjustedQuantity = Number(item.quantity || 0) - returnedQty;

                          return (
                            <AddSaleRowProduct
                              key={item.productSupplierId || index}
                              price={Number(item.price) || 0}
                              index={index}
                              name={item.name}
                              productId={item.productId}
                              productSupplierId={item.productSupplierId}
                              handleProductChange={handleProductChange}
                              handleDeleteProduct={handleDeleteProduct}
                              quantity={item.quantity}
                              discount={Number(item.discount) || 0}
                              storeHouseName={item.storeHouseName || ""}
                              storeHouseId={item.storeHouseId}
                              saleId={saleId}
                              supplierId={item.supplierId}
                              nameSupplier={item.nameSupplier}
                              isMobile={false}
                              returns={returns}
                              adjustedQuantity={adjustedQuantity}
                              updateDiscountForProductId={updateDiscountForProductId}
                              isQuotation={isQuotation}
                              stateQuotation={stateQuotation}
                              total={total}
                              productCount={productCount}
                              onDiscountApplied={(discountId) => updateDiscountIds(index, discountId)}

                            />
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    saleId && <p className="text-center text-gray-500 py-6">No hay productos para mostrar.</p>
                  )}
                </div>

                {/* Mobile card view */}
                <div className="md:hidden block mt-2 space-y-2">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((item, index) => {
                      const returnedQty = returnedMap.get(item.productSupplierId || '') || 0;
                      const adjustedQuantity = Number(item.quantity || 0) - returnedQty;

                      return (
                        <AddSaleRowProduct
                          key={item.productSupplierId || index}
                          price={Number(item.price) || 0}
                          index={index}
                          name={item.name}
                          productId={item.productId}
                          productSupplierId={item.productSupplierId}
                          handleProductChange={handleProductChange}
                          handleDeleteProduct={handleDeleteProduct}
                          quantity={item.quantity}
                          discount={Number(item.discount) || 0}
                          storeHouseName={item.storeHouseName || ""}
                          storeHouseId={item.storeHouseId}
                          saleId={saleId}
                          supplierId={item.supplierId}
                          nameSupplier={item.nameSupplier}
                          isMobile={true}
                          returns={returns}
                          adjustedQuantity={adjustedQuantity}
                          updateDiscountForProductId={updateDiscountForProductId}
                          isQuotation={isQuotation}
                          stateQuotation={stateQuotation}
                          total={total}
                          productCount={productCount}
                          onDiscountApplied={(discountId) => updateDiscountIds(index, discountId)}
                        />
                      );
                    })
                  ) : (
                    saleId && <p className="text-center text-gray-500 py-6">No hay productos para mostrar.</p>
                  )}
                </div>
              </>

              {isShowModal && (
                <ProductModalSale
                  activeProducts={products}
                  onClickSave={handleChangeSelectedProducts}
                  onClose={handleCloseModal}
                  text={textSearch}
                />
              )}
              {newProductModal && (
                <Modal
                  classNameModal="mt-6"
                  name="Agregar producto personalizado"
                  onClose={handleCloseModalNewProduct}
                  onClickSave={() => {
                    handleSaveProduct();
                  }}
                >
                  <div className="mx-4 mb-4">
                    <div className="flex flex-col md:flex-row md:items-center mb-3 space-y-3 md:space-y-0 md:space-x-4">
                      <FieldInput
                        className="w-full md:mb-0"
                        name="Nombre del producto"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                      />
                      <FieldInput
                        className="w-full md:w-[340px] md:mb-0"
                        name="Precio"
                        prependChild={<span className="text-sm text-gray-600 flex items-center gap-1">C$</span>}
                        min={1}
                        isNumber
                        value={productPrice}
                        onChange={(e) => setProductPrice(Number(e.target.value))}
                      />
                      <FieldInput
                        className="w-full md:w-[340px] md:mb-0"
                        name="Cantidad"
                        min={1}
                        isNumber
                        type="number"
                        value={productQuantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setProductQuantity('');
                          } else {
                            const numberValue = Number(val);
                            if (!isNaN(numberValue) && numberValue >= 0) {
                              setProductQuantity(numberValue);
                            }
                          }
                        }}
                      />
                    </div>
                  </div>


                </Modal>

              )}
            </>
          </div>
        </>
      </FormSection>
      {returns.some(ret => ret.returnDetail.some(detail => detail.type)) && (
        <ReturnShowChangeProducts returns={returns} saleCode={saleCode} />
      )}
    </>
  )
}
