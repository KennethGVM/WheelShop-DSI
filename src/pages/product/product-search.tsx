import ProductSegmentSearch from "./product-segment-search";
import ProductSort from "./product-sort";
import { ProductFilter, ProductProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

interface ProductSearchProps {
  products: ProductProps[];
  setTextSearch: Dispatch<SetStateAction<string>>;
  textSearch: string;
  setProducts: Dispatch<SetStateAction<ProductProps[]>>;
  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
  filter: ProductFilter;
}

interface SelectedFilters {
  segments: number;
  sorts: string;
  typeSort: 'recent' | 'ancient';
}

export default function ProductSearch({ setTextSearch, textSearch, products, setProducts, isSearching, setIsSearching, filter }: ProductSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const getSortOptions = (filter: string): string[] => {
    const common = [
      "Titulo del producto",
      "Creado",
      "Estado",
    ];

    if (filter === "Llantas") {
      return [
        ...common,
        "Tipo de vehiculo",
        "Marca",
        "Numeracion",
      ];
    }

    else if (filter === "Aceites") {
      return [
        ...common,
        "Marca de aceite",
        "¿Es diésel?",
        "Numeración del aceite",
      ];
    }
    else {
      return [
        ...common,
      ];
    }
  };
  const SORTS_PRODUCTS = getSortOptions(filter);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    segments: 0,
    sorts: "Titulo del producto",
    typeSort: 'recent'
  });

  const handleChangeSelectedFilters = (name: keyof typeof selectedFilters, value: number | string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev, [name]: value };

      if (name !== 'segments') {
        sortProducts(newFilters.sorts, newFilters.typeSort);
      }
      return newFilters;
    });
  };

  useEffect(() => {
    if (!isSearching) return;
    inputRef.current?.focus();
  }, [isSearching]);


  const sortProducts = (field: string, direction: 'recent' | 'ancient') => {
    const sortIndex = SORTS_PRODUCTS.indexOf(field);
    if (sortIndex === -1) return;


    const common = [
      (a: ProductProps, b: ProductProps) => a.name.localeCompare(b.name),
      (a: ProductProps, b: ProductProps) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      },
      (a: ProductProps, b: ProductProps) => Number(a.state) - Number(b.state),
    ];

    let specific: ((a: ProductProps, b: ProductProps) => number)[] = [];

    if (filter === "Llantas") {
      specific = [
        (a, b) => a.nameTypeVehicle.localeCompare(b.nameTypeVehicle),
        (a, b) => a.brandName.localeCompare(b.brandName),
        (a, b) => a.numeration.localeCompare(b.numeration),
      ];
    }

    else if (filter === "Aceites") {
      specific = [
        (a, b) => a.brandOilName.localeCompare(b.brandOilName),
        (a, b) => Number(a.isDiesel) - Number(b.isDiesel),
        (a, b) => a.numerationOil.localeCompare(b.numerationOil),
      ];
    }

    const comparisonFunctions = [...common, ...specific];

    const sortedProducts = [...products].sort((a, b) => {
      const result = comparisonFunctions[sortIndex](a, b);
      return direction === 'recent' ? result * -1 : result;
    });

    setProducts(sortedProducts);
  };

  return (
    <div className={`flex items-center justify-between px-2 py-2 bg-white space-x-6 ${isSearching ? 'border-b' : 'border-b-0'} border-gray-300`}>
      <ProductSegmentSearch
        setTextSearch={setTextSearch}
        textSearch={textSearch}
        inputRef={inputRef}
        isSearching={isSearching}
        products={products}
        selectedFilters={selectedFilters}
        setProducts={setProducts}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
      />

      <ProductSort
        setTextSearch={setTextSearch}
        SORTS_PRODUCTS={SORTS_PRODUCTS}
        products={products}
        isSearching={isSearching}
        selectedFilters={selectedFilters}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
        setIsSearching={setIsSearching}
        setProducts={setProducts}
      />
    </div>
  );
}
