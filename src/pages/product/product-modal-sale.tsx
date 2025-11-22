"use client"

import { supabase } from "@/api/supabase-client"
import Button from "@/components/form/button"
import FieldInput from "@/components/form/field-input"
import { ArrowDownIcon, CheckIcon, CloseIcon, SearchIcon } from "@/icons/icons"
import type {
  productCategoryProps,
  ProductModalSaleProps,
  SelectedProducts,
  StoreHouseProps,
  SupplierProps,
} from "@/types/types"
import { type ChangeEvent, useEffect, useRef, useState } from "react"
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/components/form/dropdown"
import { currencyFormatter } from "@/lib/function"
import CheckBox from "@/components/form/check-box"
import { twMerge } from "tailwind-merge"

interface Props {
  onClose: () => void
  onClickSave?: (products: SelectedProducts[]) => void
  activeProducts: SelectedProducts[]
  text?: string
  storeHouse?: StoreHouseProps
  classNameModal?: string
  className?: string
}

export default function ProductModalSale({
  onClose,
  onClickSave,
  storeHouse,
  text,
  activeProducts,
  classNameModal,
  className,
}: Props) {
  const mainRef = useRef<HTMLDivElement | null>(null)
  const productRef = useRef<ProductModalSaleProps[]>([])
  const [isScrolled, setIsScrolled] = useState(false)
  const [textSearch, setTextSearch] = useState<string>(text ?? "")
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(true)
  const [products, setProducts] = useState<ProductModalSaleProps[]>([])
  const [selectedProducts, setSelectedProducts] = useState<SelectedProducts[]>(activeProducts ?? [])
  const [storeHouses, setStoreHouses] = useState<StoreHouseProps[]>([])
  const [selectedStoreHouse, setSelectedStoreHouse] = useState<StoreHouseProps | null>(storeHouse ?? null)
  const [suppliers, setSuppliers] = useState<SupplierProps[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierProps | null>(null)
  const [categories, setCategories] = useState<productCategoryProps[]>([])
  const [selectedCategory, setSelectedCategory] = useState<productCategoryProps | null>(null)
  const [search, setSearch] = useState("")

  const handleScroll = () => {
    if (mainRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = mainRef.current
      setIsScrolled(scrollTop > 0)
      setIsScrolledToEnd(scrollTop + clientHeight >= scrollHeight)
    }
  }

  useEffect(() => {
    const handleLoadStoreHouses = async () => {
      const { data } = await supabase.from("storeHouse").select("*")
      const houses = data as StoreHouseProps[]
      setStoreHouses(houses)
      if (!storeHouse && houses.length > 0) {
        setSelectedStoreHouse(houses[0])
      }
    }
    const handleLoadSuppliers = async () => {
      const { data } = await supabase.from("supplier").select("*")
      const supp = data as SupplierProps[]
      setSuppliers(supp)
      if (supp.length > 0) {
        setSelectedSupplier(null)
      }
    }
    const handleLoadCategories = async () => {
      const { data } = await supabase.from("productCategory").select("*")
      const categories = data as productCategoryProps[]
      setCategories(categories)
      if (categories.length > 0) {
        setSelectedCategory(categories[0])
      }
    }
    handleLoadCategories()
    handleLoadSuppliers()
    handleLoadStoreHouses()
  }, [])

  useEffect(() => {
    const fetchAndFilterProducts = async () => {
      if (!selectedStoreHouse) return
      const query = supabase.from("getproductsales").select("*")
      if (selectedCategory) {
        query.eq("productCategoryId", selectedCategory?.productCategoryId)
      }
      const { data } = await query
      if (!data) return
      productRef.current = data as ProductModalSaleProps[]
      const filteredProducts = (data as ProductModalSaleProps[]).map((product) => {
        const filteredSuppliers = product.suppliers.filter((supplier) => {
          const storeHouseMatches = supplier.storeHouseId === selectedStoreHouse.storeHouseId
          const supplierMatches = selectedSupplier ? supplier.supplierId === selectedSupplier.supplierId : true
          return storeHouseMatches && supplierMatches
        })
        return { ...product, suppliers: filteredSuppliers }
      })
      const nonEmptyProducts = filteredProducts.filter((product) => product.suppliers.length > 0)
      setProducts(nonEmptyProducts)
    }
    fetchAndFilterProducts()
  }, [selectedStoreHouse, selectedSupplier, selectedCategory])

  useEffect(() => {
    const filterSuppliers = () => {
      if (productRef.current.length === 0) return
      const filteredProducts = productRef.current.map((product) => {
        const filteredSuppliers = product.suppliers.filter((supplier) => {
          const storeHouseMatches = supplier.storeHouseId === selectedStoreHouse?.storeHouseId
          const supplierMatches = selectedSupplier ? supplier.supplierId === selectedSupplier.supplierId : true
          return storeHouseMatches && supplierMatches
        })
        return {
          ...product,
          suppliers: filteredSuppliers,
        }
      })
      const nonEmptyProducts = filteredProducts.filter((product) => product.suppliers.length > 0)
      setProducts(nonEmptyProducts)
    }
    filterSuppliers()
  }, [selectedStoreHouse, selectedSupplier])

  useEffect(() => {
    const mainElement = mainRef.current
    if (mainElement) {
      mainElement.addEventListener("scroll", handleScroll)
    }
    return () => {
      if (mainElement) {
        mainElement.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEscKey)
    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [onClose])

  const handleSearchProducts = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase().trim()
    setTextSearch(query)
    const baseProducts = productRef.current
      .map((product) => {
        const filteredSuppliers = product.suppliers.filter((supplier) => {
          const storeHouseMatches = supplier.storeHouseId === selectedStoreHouse?.storeHouseId
          const supplierMatches = selectedSupplier ? supplier.supplierId === selectedSupplier.supplierId : true
          return storeHouseMatches && supplierMatches
        })
        return { ...product, suppliers: filteredSuppliers }
      })
      .filter((product) => product.suppliers.length > 0)

    if (query) {
      const searchTerms = query.split(" ")
      const filtered = baseProducts.filter((product) =>
        searchTerms.every(
          (term) =>
            product.productName?.toLowerCase().includes(term) ||
            product.brandName?.toLowerCase().includes(term) ||
            product.nameRin?.toLowerCase().includes(term) ||
            product.nameTypeVehicle?.toLowerCase().includes(term) ||
            product.numeration?.toLowerCase().includes(term) ||
            product.brandOilName?.toLowerCase().includes(term) ||
            product.numerationOil?.toLowerCase().includes(term),
        ),
      )
      setProducts(filtered)
    } else {
      setProducts(baseProducts)
    }
  }

  const handleClearSupplierFilter = () => {
    setSelectedSupplier(null)
  }

  return (
    <div
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center w-full h-full bg-black bg-opacity-50"
    >
      <div className="relative w-full h-full flex items-end md:items-center justify-center p-0 md:p-4">
        <div
          className={twMerge(
            "w-full md:max-w-2xl md:h-auto bg-white border border-gray-300 md:rounded-2xl shadow-md transition-transform transform translate-y-0 md:translate-y-0",
            className,
          )}
        >
          <header
            className={`flex ${isScrolled && "shadow-md"} bg-[#f3f3f3] items-center justify-between px-4 py-2 border-b border-gray-300 md:rounded-t-2xl`}
          >
            <h3 className="md:text-sm text-base font-semibold text-gray-900">Seleccionar productos</h3>
            <button
              onClick={onClose}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="default-modal"
            >
              <CloseIcon className="md:size-5 size-[22px]" />
            </button>
          </header>
          <main
            ref={mainRef}
            className={twMerge("pt-2 overflow-y-auto md:max-h-[80vh] max-h-[70vh]", classNameModal)}
            style={{ scrollbarWidth: "thin" }}
          >
            <header className="px-3 sm:px-4 pb-2">
              <FieldInput
                placeholder="Buscar productos"
                className="mb-2 w-full"
                autoFocus
                value={textSearch}
                onChange={handleSearchProducts}
                appendChild={<SearchIcon className="size-4 text-whiting" />}
              />
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {!storeHouse && selectedStoreHouse && (
                  <Dropdown closeToClickOption>
                    <DropdownTrigger>
                      <button
                        type="button"
                        className="flex items-center space-x-1 border border-dashed border-gray-300 rounded-md px-1.5 py-0.5 text-xs text-secondary/80 font-medium hover:border-solid"
                      >
                        <span className="md:text-2xs text-base">{selectedStoreHouse?.name || "Seleccionar bodega"}</span>
                        <ArrowDownIcon className="fill-secondary/80 md:size-3.5 size-5" />
                      </button>
                    </DropdownTrigger>
                    <DropdownContent align="start" position="bottom">
                      {storeHouses.map((store) => (
                        <DropdownItem
                          key={store.storeHouseId}
                          onClick={() => setSelectedStoreHouse(store)}
                          className={`text-secondary/80 font-medium md:text-2xs text-base justify-between ${selectedStoreHouse?.storeHouseId === store.storeHouseId ? "bg-whiting2" : ""}`}
                        >
                          <span>{store.name}</span>
                          {selectedStoreHouse?.storeHouseId === store.storeHouseId && <CheckIcon className="ml-2 md:size-3.5 size-5" />}
                        </DropdownItem>
                      ))}
                    </DropdownContent>
                  </Dropdown>
                )}
                {selectedCategory && (
                  <Dropdown closeToClickOption>
                    <DropdownTrigger>
                      <button
                        type="button"
                        className="flex items-center space-x-1 border border-dashed border-gray-300 rounded-md px-1.5 py-0.5 text-xs text-secondary/80 font-medium hover:border-solid"
                      >
                        <span className="md:text-2xs text-base">{selectedCategory?.productCategoryName || "Seleccionar categoría"}</span>
                        <ArrowDownIcon className="fill-secondary/80 md:size-3.5 size-5" />
                      </button>
                    </DropdownTrigger>
                    <DropdownContent align="start" position="bottom" >
                      {categories.map((cat) => (
                        <DropdownItem
                          key={cat.productCategoryId}
                          onClick={() => setSelectedCategory(cat)}
                          className={`text-secondary/80 font-medium md:text-2xs text-base justify-between ${selectedCategory?.productCategoryId === cat.productCategoryId ? "bg-whiting2" : ""}`}
                        >
                          <span>{cat.productCategoryName}</span>
                          {selectedCategory?.productCategoryId === cat.productCategoryId && (
                            <CheckIcon className="ml-2 md:size-3.5 size-5" />
                          )}
                        </DropdownItem>
                      ))}
                    </DropdownContent>
                  </Dropdown>
                )}
                <Dropdown closeToClickOption>
                  <DropdownTrigger>
                    <button
                      type="button"
                      className="flex items-center space-x-1 border border-dashed border-gray-300 rounded-md px-1.5 py-0.5 text-xs text-secondary/80 font-medium hover:border-solid"
                    >
                      <span className="md:text-2xs text-base">{selectedSupplier?.nameSupplier || "Todos los proveedores"}</span>
                      <ArrowDownIcon className="fill-secondary/80 md:size-3.5 size-5" />
                    </button>
                  </DropdownTrigger>
                  <DropdownContent align="start" position="bottom">
                    <div className="p-2">
                      <FieldInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar proveedor..."
                        autoFocus
                        className="mb-1"
                      />
                    </div>
                    <DropdownItem
                      onClick={handleClearSupplierFilter}
                      className={`text-secondary/80 font-medium md:text-2xs text-base justify-between ${!selectedSupplier ? "bg-whiting2" : ""}`}
                    >
                      <span>Todos los proveedores</span>
                      {!selectedSupplier && <CheckIcon className="ml-2 md:size-3.5 size-5" />}
                    </DropdownItem>
                    {suppliers
                      .filter((supplier) => supplier.nameSupplier.toLowerCase().includes(search.toLowerCase()))
                      .map((supplier) => (
                        <DropdownItem
                          key={supplier.supplierId}
                          onClick={() => setSelectedSupplier(supplier)}
                          className={`text-secondary/80 font-medium md:text-2xs text-base justify-between ${selectedSupplier?.supplierId === supplier.supplierId ? "bg-whiting2" : ""}`}
                        >
                          <span>{supplier.nameSupplier}</span>
                          {selectedSupplier?.supplierId === supplier.supplierId && <CheckIcon className="ml-2 md:size-3.5 size-5" />}
                        </DropdownItem>
                      ))}
                  </DropdownContent>
                </Dropdown>
              </div>
            </header>
            {products.length > 0 ? (
              <div>
                {/* Encabezado */}
                <div className="grid grid-cols-4 px-0 sm:px-4 py-3 [&>span]:text-primary [&>span]:font-medium [&>span]:text-sm border-y border-gray-300">
                  <span className="col-span-2 pl-4 sm:pl-8">Productos</span>
                  <span className="text-center">Precio</span>
                  <span className="text-center">Stock</span>
                </div>

                {/* Lista de productos */}
                {products.map((product, index) => (
                  <div key={`group-${index}`} className="border-b border-gray-300">
                    {/* Nombre del producto */}
                    <div className="sticky top-0 bg-white z-10">
                      <div className="bg-gray-50 px-0 sm:px-4 py-3 grid grid-cols-4">
                        <div className="text-sm text-secondary/80 font-bold col-span-2 pl-4 sm:pl-8">
                          {product.productName}
                        </div>
                        <div className="col-span-1"></div>
                        <div className="text-sm text-secondary/80 font-bold text-center">
                          {product.suppliers.reduce((acc, supplier) => acc + supplier.stock, 0)}
                        </div>
                      </div>
                    </div>

                    {/* Lista de suppliers */}
                    {product.suppliers.map((supplier, key) => {
                      const isSelected = selectedProducts.some(
                        (p) => p.productSupplierId === supplier.productSupplierId,
                      )
                      const isActive = activeProducts.some(
                        (p) => p.productSupplierId === supplier.productSupplierId,
                      )
                      const isFaded = isActive

                      return (
                        <button
                          key={`${supplier.supplierId}-${key}`}
                          type="button"
                          disabled={isFaded || supplier.stock <= 0}
                          onClick={() => {
                            if (supplier.stock <= 0) return
                            setSelectedProducts((prev) => {
                              const isAlreadySelected = prev.some(
                                (p) => p.productSupplierId === supplier.productSupplierId,
                              )
                              return isAlreadySelected
                                ? prev.filter((p) => p.productSupplierId !== supplier.productSupplierId)
                                : [
                                  ...prev,
                                  {
                                    name: product.productName,
                                    productId: product.productId,
                                    productSupplierId: supplier.productSupplierId,
                                    cost: supplier?.cost || 0,
                                    price: supplier?.price || 0,
                                    quantity: 1,
                                    supplierId: supplier?.supplierId || "",
                                    nameSupplier: supplier?.nameSupplier || "",
                                    storeHouseId: supplier?.storeHouseId || "",
                                    storeHouseName: supplier?.storeHouseName || "",
                                    stock: supplier?.stock || 0,
                                  },
                                ]
                            })
                          }}
                          className={`grid w-full grid-cols-4 items-center hover:bg-[#f7f7f7] px-0 sm:px-4 py-3 ${isSelected ? "bg-[#f7f7f7]" : ""} ${isFaded || supplier.stock <= 0 ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                            }`}
                        >
                          <div className="col-span-2 flex items-center space-x-2 pl-2 sm:pl-4 ml-2 sm:ml-4">
                            <CheckBox  onChange={() => {
                            if (supplier.stock <= 0) return
                            setSelectedProducts((prev) => {
                              const isAlreadySelected = prev.some(
                                (p) => p.productSupplierId === supplier.productSupplierId,
                              )
                              return isAlreadySelected
                                ? prev.filter((p) => p.productSupplierId !== supplier.productSupplierId)
                                : [
                                  ...prev,
                                  {
                                    name: product.productName,
                                    productId: product.productId,
                                    productSupplierId: supplier.productSupplierId,
                                    cost: supplier?.cost || 0,
                                    price: supplier?.price || 0,
                                    quantity: 1,
                                    supplierId: supplier?.supplierId || "",
                                    nameSupplier: supplier?.nameSupplier || "",
                                    storeHouseId: supplier?.storeHouseId || "",
                                    storeHouseName: supplier?.storeHouseName || "",
                                    stock: supplier?.stock || 0,
                                  },
                                ]
                            })
                          }} className={isFaded ? "opacity-40" : "opacity-100"} initialValue={isSelected} />
                            <div className="w-full text-left">
                              <span className="text-sm text-secondary/80">{supplier.nameSupplier}</span>
                            </div>
                          </div>
                          <span className="text-center font-medium text-2xs text-secondary/90">
                            {currencyFormatter(supplier?.price ?? 0)}
                          </span>
                          <span className="text-center font-medium text-2xs text-secondary/90">
                            {supplier.stock}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <span className="font-medium text-secondary/80 md:text-2xs text-base inline-block mx-4 my-3">
                No se encontraron resultados para "<span className="text-secondary">{textSearch}</span>"
              </span>
            )}
          </main>
          <footer
            style={{
              boxShadow: !isScrolledToEnd
                ? "0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)"
                : "none",
            }}
            className="flex flex-col md:flex-row md:space-x-3 items-center justify-between p-3 sm:px-4 sm:py-3 border-t border-gray-300 rounded-b-2xl"
          >
            {/* Texto - en móviles arriba de los botones */}
            <div className="text-sm text-gray-500 w-full text-center md:text-left mb-3 md:mb-0">
              {selectedProducts.length}{" "}
              {selectedProducts.length === 1 ? "producto" : "productos"} seleccionados
            </div>

            {/* Botones */}
            <div className="flex flex-col-reverse md:flex-row md:space-x-3 w-full sm:w-auto">
              <Button
                styleButton="primary"
                name="Cancelar"
                onClick={onClose}
                className="md:w-auto w-full text-center md:py-1.5 py-3 md:text-2xs text-base mt-2 md:mt-0 px-3"
              />
              <Button
                type="button"
                styleButton="secondary"
                onClick={() => onClickSave?.(selectedProducts)}
                name="Listo"
                className="bg-primary md:w-auto w-full px-3 text-white md:py-1.5 py-3 md:text-2xs text-base"
              />
            </div>
          </footer>

        </div>
      </div>
    </div>
  )
}
