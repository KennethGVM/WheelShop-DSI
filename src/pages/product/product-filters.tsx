import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger
} from "@/components/form/dropdown";
import { ArrowDownIcon, CheckIcon } from "@/icons/icons";
import { ProductFilter, ProductProps, SupplierProps } from "@/types/types";
import { supabase } from "@/api/supabase-client";
import FieldInput from "@/components/form/field-input";

interface ProductFiltersProps {
  isSearching: boolean;
  products: ProductProps[];
  setProducts: Dispatch<SetStateAction<ProductProps[]>>;
  setFilter: Dispatch<SetStateAction<ProductFilter>>;
  setSelectedSupplierId: Dispatch<SetStateAction<string | null>>;
  selectedSupplierId: string | null;
}

export default function ProductFilters({
  isSearching,
  products,
  setFilter,
  setSelectedSupplierId,
  selectedSupplierId,
}: ProductFiltersProps) {
  const TYPE_PRODUCT: ProductFilter[] = ["Llantas", "Aceites", "Productos Varios"];
  const [suppliers, setSuppliers] = useState<SupplierProps[]>([]);
  const [searchSupplier, setSearchSupplier] = useState("");

  const [selectedFilters, setSelectedFilters] = useState({
    type: "Llantas",
    supplierId: selectedSupplierId ?? "",
    date: new Date(),
  });

  useEffect(() => {
    const handleLoadSuppliers = async () => {
      const { data } = await supabase.from("supplier").select("*");
      setSuppliers(data as SupplierProps[]);
    };

    handleLoadSuppliers();
  }, []);

  useEffect(() => {
    setSelectedFilters((prev) => ({
      ...prev,
      supplierId: selectedSupplierId ?? "",
    }));
  }, [selectedSupplierId]);

  const handleChangeSelectedFilters = (
    name: keyof typeof selectedFilters,
    value: string | number | Date
  ) => {
    setSelectedFilters((prev) => ({ ...prev, [name]: value }));

    if (name === "supplierId") {
      setSelectedSupplierId(value === "" ? null : String(value));
    }

    if (name === "type") {
      setFilter(String(value) as ProductFilter);
    }
  };

  const handleSelectFilter = (option: ProductFilter) => {
    handleChangeSelectedFilters("type", option);
  };

  const filteredSuppliers = suppliers.filter((s) =>
    s.nameSupplier.toLowerCase().includes(searchSupplier.toLowerCase())
  );

  const selectedSupplierName =
    selectedFilters.supplierId === "" || selectedFilters.supplierId === null
      ? "Todos los proveedores"
      : suppliers.find((s) => s.supplierId === selectedFilters.supplierId)?.nameSupplier || "Proveedor";

  return (
    <div
      className={`overflow-hidden ${products && products.length > 0 ? "border-0" : "border-b border-gray-300"
        } transition-all duration-200 ease-out ${isSearching ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
        }`}
    >
      <div className="overflow-x-auto">
        <div className="flex items-center space-x-2 py-1.5 px-2 bg-white transform transition-transform duration-200 ease-out translate-y-0 min-w-max">
          <Dropdown>
            <DropdownTrigger>
              <button className="flex items-center space-x-1 border border-dashed border-gray-300 rounded-md px-1.5 py-0.5 md:text-xs text-sm text-secondary/80 font-medium hover:border-solid whitespace-nowrap">
                <span>Tipo de producto</span>
                <ArrowDownIcon className="fill-secondary/80 size-[13px]" />
              </button>
            </DropdownTrigger>
            <DropdownContent align="start" position="bottom">
              {TYPE_PRODUCT.map((type) => (
                <DropdownItem
                  key={type}
                  onClick={() => handleSelectFilter(type)}
                  className={`text-secondary/80 font-medium md:text-2xs text-base justify-between ${selectedFilters.type === type ? "bg-whiting2" : ""
                    }`}
                >
                  <span>{type}</span>
                  {selectedFilters.type === type && <CheckIcon className="ml-2" />}
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>

          <Dropdown>
            <DropdownTrigger>
              <button className="flex items-center space-x-1 border border-dashed border-gray-300 rounded-md px-1.5 py-0.5 md:text-xs text-sm text-secondary/80 font-medium hover:border-solid whitespace-nowrap ">
                <span>{selectedSupplierName}</span>
                <ArrowDownIcon className="fill-secondary/80 size-[13px]" />
              </button>
            </DropdownTrigger>
            <DropdownContent align="center" position="bottom" className="min-w-[200px] pb-2 px-0 pt-0">
              <div className="sticky top-0 bg-white z-10 px-4 py-2 border-b border-gray-200">
                <FieldInput
                  className="w-full"
                  placeholder="Buscar proveedor"
                  value={searchSupplier}
                  onChange={(e) => setSearchSupplier(e.target.value)}
                />
              </div>

              <div className="max-h-[240px] mt-3 overflow-y-auto">
                <DropdownItem
                  onClick={() => handleChangeSelectedFilters("supplierId", "")}
                  className={`text-secondary/80 font-medium md:text-2xs text-base justify-between ${selectedFilters.supplierId === "" ? "bg-whiting2" : ""
                    }`}
                >
                  Todos los proveedores
                </DropdownItem>

                {filteredSuppliers.map(({ nameSupplier, supplierId }) => (
                  <DropdownItem
                    key={supplierId}
                    onClick={() => handleChangeSelectedFilters("supplierId", supplierId)}
                    className={`text-secondary/80 font-medium md:text-2xs text-base  justify-between ${selectedFilters.supplierId === supplierId ? "bg-whiting2" : ""
                      }`}
                  >
                    <span>{nameSupplier}</span>
                    {selectedFilters.supplierId === supplierId && <CheckIcon className="ml-2" />}
                  </DropdownItem>
                ))}

                {filteredSuppliers.length === 0 && (
                  <p className="text-secondary/80 text-2xs font-medium px-4 py-2">No hay resultados</p>
                )}
              </div>
            </DropdownContent>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}

