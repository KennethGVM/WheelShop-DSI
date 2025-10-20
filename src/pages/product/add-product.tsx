import { supabase } from "@/api/supabase-client";
import SubHeader from "@/components/sub-header";
import { showToast } from "@/components/toast";
import Container from "@/layout/container";
import { BrandOilProps, BrandProps, productCategoryProps, ProductProps, ProductSupplierProps, SupplierProps, TypeVehicleProps } from "@/types/types";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import GeneralInformation from "@/pages/product/general-information";
import InfoProduct from "@/pages/product/info-product";
import PriceProduct from "@/pages/product/price-product";
import OrganizationProduct from "@/pages/product/organization-product";
import { useNavigate, useParams } from "react-router-dom";
import { getPermissions } from "@/lib/function";
import { useRolePermission } from "@/api/permissions-provider";
import AccessPage from "../access-page";

export default function AddProduct() {
  const navigate = useNavigate();
  const INITIAL_FORM_DATA = {
    name: '',
    description: '',
    brandId: '',
    numeration: '',
    suppliers: [],
    state: true,
    typeVehicleId: '',
    productCategoryId: '',
    productCategoryName: '',
    brandOilId: '',
    isDiesel: false,
    numerationOil: '',
    nameTypeVehicle: '',
    brandOilName: '',
  }
  const { product_id } = useParams();
  const [productName, setProductName] = useState<string>('');
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [brands, setBrands] = useState<{ title: string; value: string }[]>([]);
  const [typeVehicles, setTypeVehicles] = useState<TypeVehicleProps[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierProps[]>([]);
  const [isModalOpen, setIsModalOpen] = useState({ typeVehicle: false, brand: false, rin: false });
  const [modalData, setModalData] = useState({ typeVehicle: '', brand: '', rin: '', brandOilName: '' });
  const [productCategory, setProductCategory] = useState<productCategoryProps[]>([]);
  const [formData, setFormData] = useState<Omit<ProductProps, 'productId' | 'nameRin' | 'createdAt' | 'brandName' | 'storeHouseInventory' | 'storeHouseId' | 'storeHouseName' | 'supplierId' | 'nameSupplier'>>(INITIAL_FORM_DATA);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canSaveProduct = getPermissions(permissions, "Productos", "Crear y editar")?.canAccess;
  const handleChangeFormData = useCallback((name: keyof typeof formData, value: string | number | string[] | boolean | ProductSupplierProps[]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, [])

  const handleChangeShowModal = (name: keyof typeof isModalOpen, value: boolean) => {
    setIsModalOpen((prev) => ({ ...prev, [name]: value }));
  }

  const handleChangeModalData = (name: keyof typeof modalData, value: string) => {
    setModalData((prev) => ({ ...prev, [name]: value }));
  }
  const handleLoadBrands = async () => {
    const { data, error } = await supabase
      .from('brand')
      .select('*')
      .eq('state', true); 

    if (error) {
      showToast("Error al cargar marcas", false);
      return;
    }

    const brandsData = data as BrandProps[];
    setBrands(brandsData.map(brand => ({ title: brand.brandName, value: brand.brandId })));
  };

  const handleLoadBrandsOil = async () => {
    const { data } = await supabase.from('brandOil').select('*').eq('state', true);;
    const brandsOilData = data as BrandOilProps[];
    setBrands(brandsOilData.map(brandOil => ({ title: brandOil.brandOilName, value: brandOil.brandOilId })));
  }

  useEffect(() => {
    const handleLoadCategory = async () => {
      const { data } = await supabase.from('productCategory').select('*');
      setProductCategory(data as productCategoryProps[]);
      if (product_id) return
      setFormData({ ...formData, productCategoryId: data?.[0].productCategoryId, productCategoryName: data?.[0].productCategoryName })
    }

    const handleLoadTypeVehicles = async () => {
      const { data } = await supabase.from('typeVehicle').select('*');
      const typeVehicles: TypeVehicleProps[] = data as TypeVehicleProps[];
      const { typeVehicleId } = typeVehicles[0]

      setTypeVehicles(typeVehicles);
      if (product_id) return
      handleChangeFormData('typeVehicleId', typeVehicleId)
    }

    const handleLoadSuppliers = async () => {
      const { data } = await supabase.from('supplier').select('*');
      setSuppliers(data as SupplierProps[]);
    }
    handleLoadCategory();

    if (!product_id) handleLoadBrands();

    handleLoadTypeVehicles();
    handleLoadSuppliers();
  }, [handleChangeFormData])

  const handleAddSupplier = (newSupplier: SupplierProps) => {
  setSuppliers((prev) => [...prev, newSupplier]);

  setFormData((prev) => ({
    ...prev,
    suppliers: [
      ...prev.suppliers,
      {
        supplierId: newSupplier.supplierId,
        price: 0,
        cost: 0,
        minPrice: 0,
        suggestedPrice: 0,
        productSupplierId: "",
      },
    ],
  }));


};
  useEffect(() => {
    const handleLoadProductById = async () => {
      const { data } = await supabase.from('getproducts').select('*').eq('productId', product_id);
      const productData = data?.[0] as ProductProps
      setProductName(productData.name)

      setFormData({
        name: productData.name,
        description: productData.description,
        brandId: productData.brandId,
        numeration: productData.numeration,
        suppliers: productData.suppliers,
        state: productData.state,
        typeVehicleId: productData.typeVehicleId,
        productCategoryId: productData.productCategoryId,
        productCategoryName: productData.productCategoryName,
        brandOilId: productData.brandOilId,
        isDiesel: productData.isDiesel,
        numerationOil: productData.numerationOil,
        nameTypeVehicle: productData.nameTypeVehicle,
        brandOilName: productData.brandOilName,

      })


      if (productData.productCategoryName === 'aceites') {
        handleLoadBrandsOil();
      } else {
        handleLoadBrands();
      }
      if (!product_id) return;
    }
    if (product_id) handleLoadProductById();
  }, [product_id])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if ((formData.productCategoryName === "llantas" || formData.productCategoryName === "aceites") && formData.brandId?.trim() === "") {
      showToast("Se requiere una marca para el producto.", false);
      return;
    }

    if (formData.suppliers.length === 0) {
      showToast("Se requiere al menos un proveedor para el producto.", false);
      return;
    }

    setIsLoading(true);

    const suppliers = formData.suppliers.map(supplier => ({ supplierId: supplier.supplierId, price: supplier.price, cost: supplier.cost, minPrice: supplier.minPrice, suggestedPrice: supplier.suggestedPrice }));
    const isNew = !product_id;
    const commonPayload = {
      p_name: formData.productCategoryName !== "productos varios" ? `${brands.find(brand => brand.value === formData.brandId)?.title} ${formData.productCategoryName === 'aceites' ? formData.numerationOil : formData.numeration}` : formData.name,
      p_description: formData.description,
      p_state: formData.state,
      p_categoryid: formData.productCategoryId,
      p_categoryname: formData.productCategoryName,
      p_typevehicleid: formData.productCategoryName === "llantas" ? formData.typeVehicleId : null,
      p_brandid: formData.brandId || null,
      p_brandoilid: formData.brandOilId || formData.brandId || null,
      p_isdiesel: formData.isDiesel,
      p_numeration: formData.numeration || null,
      p_numerationoil: formData.numerationOil || null,
      p_suppliers: suppliers,
    };

    const payload = isNew
      ? commonPayload
      : { ...commonPayload, p_productid: product_id };

    const { error } = await supabase.rpc(
      isNew ? 'create_product' : 'edit_product',
      payload
    );

    if (error) {
      showToast(error.message, false);
    } else {
      showToast(`Producto ${isNew ? 'creado' : 'actualizado'}`, true);
      if (!product_id) setFormData(INITIAL_FORM_DATA)
    }

    setIsLoading(false);
  }

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit()
  }

  return (
    <Container text="Producto sin guardar" save onSaveClick={handleFormSubmit} isLoading={isLoading} onClickSecondary={() => navigate("/products/")}>
      {canSaveProduct ? (
        <section className="flex flex-col items-center h-full flex-1">
          <div className="max-w-screen-lg mt-2 w-full mx-auto flex-1 flex flex-col">
            <SubHeader title={!product_id ? 'Añadir producto' : productName} backUrl="/products" isShowButtons={product_id ? true : false} status={formData.state} />
            <main className="flex flex-1 flex-col xl:flex-row items-start w-full">
              <form ref={formRef} onSubmit={handleSubmit} className="flex flex-1 xl:space-x-6 flex-col xl:flex-row items-start w-full">
                <div className="flex-1 xl:w-auto w-full">
                  <GeneralInformation
                    setBrands={setBrands}
                    setFormData={setFormData}
                    productCategories={productCategory}
                    formData={formData}
                    product_id={product_id}
                    brands={brands}
                  />
                  {formData.productCategoryName !== 'productos varios' && (
                    <InfoProduct
                      handleChangeShowModal={handleChangeShowModal}
                      typeVehicles={typeVehicles}
                      setTypeVehicles={setTypeVehicles}
                      formData={formData}
                      setBrands={setBrands}
                      brands={brands}
                      handleChangeModalData={handleChangeModalData}
                      handleChangeFormData={handleChangeFormData}
                      modalData={modalData}
                      isModalOpen={isModalOpen}
                      productCategory={productCategory}
                    />
                  )}
                  <PriceProduct
                    formData={formData}
                    suppliers={suppliers}
                    isEditing={product_id ? true : false}
                    handleChangeFormData={handleChangeFormData}
                  />
                </div>
                <div className="w-full xl:w-1/3">
                  <OrganizationProduct
                    formData={formData}
                    handleChangeFormData={handleChangeFormData}
                    suppliers={suppliers}
                    onAddSupplier={handleAddSupplier} 
                  />
                </div>
              </form>
            </main>
          </div>
        </section>
      ) : (
        <AccessPage />
      )}
    </Container>
  );
}