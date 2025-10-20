import { supabase } from "@/api/supabase-client";
import FieldInput from "@/components/form/field-input";
import FieldSelect from "@/components/form/field-select";
import TextArea from "@/components/form/text-area";
import FormSection from "@/layout/form-section";
import { BrandOilProps, BrandProps, productCategoryProps, ProductProps } from "@/types/types";
import { ChangeEvent, Dispatch, SetStateAction } from "react";


interface GeneralInformationProps {
  formData: Omit<ProductProps, 'productId' | 'nameRin' | 'createdAt' | 'brandName' | 'storeHouseInventory' | 'storeHouseId' | 'storeHouseName' | 'supplierId' | 'nameSupplier'>;
  setFormData: Dispatch<SetStateAction<Omit<ProductProps, 'productId' | 'nameRin' | 'createdAt' | 'brandName' | 'storeHouseInventory' | 'storeHouseId' | 'storeHouseName' | 'supplierId' | 'nameSupplier'>>>;
  setBrands: Dispatch<SetStateAction<{ title: string; value: string }[]>>;
  brands: { title: string; value: string }[];
  productCategories: productCategoryProps[];
  product_id?: string;
}

export default function GeneralInformation({ brands, setBrands, setFormData, productCategories, formData, product_id }: GeneralInformationProps) {
  const handleCategoryProduct = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, brandId: '', brandOilId: '', productCategoryId: e.target.value, productCategoryName: e.target.options[e.target.selectedIndex].text });
    if (e.target.options[e.target.selectedIndex].text === "llantas") {
      handleLoadBrand()
    } else if (e.target.options[e.target.selectedIndex].text === "aceites") {
      handleLoadBrandOil();
    }
  }

  const handleLoadBrandOil = async () => {
    const { data } = await supabase.from('brandOil').select('*').eq('state', true);
    const brandOilData = data as BrandOilProps[];
    setBrands(brandOilData.map(brandOil => ({ title: brandOil.brandOilName, value: brandOil.brandOilId })));
  };

  const handleLoadBrand = async () => {
    const { data } = await supabase.from('brand').select('*');
    const brandsData = data as BrandProps[];
    setBrands(brandsData.map(brand => ({ title: brand.brandName, value: brand.brandId })));
  }

  return (
    <>
      <FormSection>
        <>
          <FieldInput
            id="title"
            name="Titulo"
            required={true}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Camiseta de manga corta"
            readOnly={formData.productCategoryName !== "productos varios"}
            value={formData.productCategoryName !== "productos varios" ? formData.brandId && `${brands.find(brand => brand.value === formData.brandId)?.title} ${formData.productCategoryName === 'aceites' ? formData.numerationOil : formData.numeration}` : formData.name}
          />

          <TextArea className={`${product_id ? 'mb-0' : 'mb-5'}`}
            id="description"
            name="Descripción"
            rows={8}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {!product_id && (
            <FieldSelect
              name="Categoria"
              options={productCategories.map(productCategory => ({
                name: productCategory.productCategoryName,
                value: productCategory.productCategoryId
              }))}
              id="productCategory"
              onChange={handleCategoryProduct}

              value={formData.productCategoryId}
            />
          )}
        </>
      </FormSection>



    </>
  )
}
