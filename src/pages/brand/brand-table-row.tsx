import CheckBox from "@/components/form/check-box";
import StatusTags from "@/components/status-tags";
import { BrandProps } from "@/types/types"
import { Dispatch, SetStateAction } from "react";

interface BrandTableRowProps {
  brands: BrandProps[];
  brand: BrandProps
  selectedBrandIds: BrandProps[];

  setSelectedBrandIds: Dispatch<SetStateAction<BrandProps[]>>;
  setSelectAll: Dispatch<SetStateAction<boolean>>;
}

export default function BrandTableRow({ brands, brand, selectedBrandIds, setSelectedBrandIds, setSelectAll }: BrandTableRowProps) {
  const handleSelectProduct = (brandId: BrandProps, checked: boolean) => {
    let newSelectedIds;

    if (checked) {
      newSelectedIds = [...selectedBrandIds, brandId];
    } else {
      newSelectedIds = selectedBrandIds.filter((brandId) => brandId.brandId !== brand.brandId);
    }

    setSelectedBrandIds(newSelectedIds);

    if (newSelectedIds.length !== brands.length) {
      setSelectAll(false);
    } else if (newSelectedIds.length === brands.length) {
      setSelectAll(true);
    }
  };

  return (
    <tr
      key={brand.brandId}

      className={`${selectedBrandIds.includes(brand) ? 'bg-whiting2' : 'bg-white'} cursor-pointer md:text-2xs text-sm font-medium ${brand !== brands[brands.length - 1] ? 'border-b' : ''} text-secondary/80 border-gray-300 hover:bg-[#F7F7F7]`}
    >
      <td className="w-4 px-2 py-3">
        <CheckBox
          initialValue={selectedBrandIds.includes(brand)}
          onChange={(value) => handleSelectProduct(brand, value)}
        />
      </td>
      <td className="sm:px-6 px-2 py-3">
        {brand.brandName}
      </td>

      <td className="sm:px-6 px-2 py-3">
        <StatusTags
          status={true}
          text={brand.category}
          color={brand.category === "Llantas" ? "bg-gray-300" : "bg-amber-200"}
          textColor={brand.category === "Llantas" ? "text-gray-800" : "text-amber-800"}
        />
      </td>

      <td className="sm:px-6 px-2 py-3">
        <StatusTags status={brand.state} text={brand.state ? "Activo" : "Inactivo"} />
      </td>
      <td className="sm:px-6 px-2 py-3">
        {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : ''}
      </td>
    </tr>
  )
}
