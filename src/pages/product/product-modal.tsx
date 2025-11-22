import { supabase } from "@/api/supabase-client";
import Button from "@/components/form/button";
import FieldInput from "@/components/form/field-input";
import { CloseIcon, SearchIcon } from "@/icons/icons";
import { ProductProps, ProductSupplierProps, SelectedProducts } from "@/types/types";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import ProductCardModal from "./product-card-modal";

interface Props {
  onClose: () => void;
  onClickSave?: (products: SelectedProducts[]) => void;
  activeProducts: SelectedProducts[];
  text?: string;
  supplierId?: string;
}

export default function ProductModal({ onClose, onClickSave, text, activeProducts, supplierId }: Props) {
  const mainRef = useRef<HTMLDivElement | null>(null);
  const productRef = useRef<ProductProps[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [textSearch, setTextSearch] = useState<string>(text ?? "");
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(true);
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProducts[]>(activeProducts ?? []);

  const handleScroll = () => {
    if (mainRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = mainRef.current;
      setIsScrolled(scrollTop > 0);
      setIsScrolledToEnd(scrollTop + clientHeight >= scrollHeight);
    }
  };

  useEffect(() => {
    const handleLoadProducts = async () => {
      let query = supabase.from("getproducts").select("*").eq("state", true);
      query = query.eq("type", "all");

      const { data } = await query;

      if (supplierId) {
        const filtered = data?.filter(product =>
          product.suppliers.some((s: ProductSupplierProps) => s.supplierId === supplierId)
        );
        setProducts(filtered as ProductProps[]);
        productRef.current = filtered as ProductProps[];
        return;
      }

      productRef.current = data as ProductProps[];
      setProducts(data as ProductProps[]);
    };

    handleLoadProducts();
  }, [supplierId]);

  useEffect(() => {
    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (mainElement) {
        mainElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  const handleSearchProducts = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase().trim();
    setTextSearch(query);

    if (query) {
      const searchTerms = query.split(' ');
      const filtered = productRef.current.filter((product) =>
        searchTerms.every((term) =>
          product.name.toLowerCase().includes(term) ||
          (product.brandName && product.brandName.toLowerCase().includes(term)) ||
          (product.nameRin || '').toLowerCase().includes(term) ||
          (product.numeration || '').toLowerCase().includes(term)
        )
      );
      setProducts(filtered);
    } else {
      setProducts(productRef.current);
    }
  };

  return (
    <div
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="relative w-full h-full sm:max-w-2xl sm:h-auto sm:rounded-2xl bg-white border border-gray-300 shadow-md flex flex-col">
        <header className={`flex ${isScrolled ? "shadow-md" : ""} bg-[#f3f3f3] items-center justify-between px-4 py-2 border-b border-gray-300 sm:rounded-t-2xl`}>
          <h3 className="text-base font-semibold text-gray-900">Añadir productos</h3>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex items-center justify-center"
          >
            <CloseIcon className="size-5" />
          </button>
        </header>

        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto pt-2"
        >
          <div className="px-4 pb-2 border-b md:border-b-0">
            <FieldInput
              placeholder="Buscar productos"
              className="mb-2 w-full"
              autoFocus
              value={textSearch}
              onChange={handleSearchProducts}
              appendChild={<SearchIcon className="size-4 text-whiting" />}
            />
          </div>
          {products.length > 0 ? (
            <ProductCardModal
              supplierId={supplierId ?? ''}
              activeProducts={activeProducts}
              products={products}
              selectedProducts={selectedProducts}
              setSelectedProducts={setSelectedProducts}
            />
          ) : (
            <span className="font-medium text-secondary/80 text-2xs inline-block mx-4 my-3">
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
          className="flex md:flex-row flex-col-reverse items-center justify-end md:space-x-3 px-4 py-3 border-t border-gray-300 sm:rounded-b-2xl"
        >
          <Button
            type="button"
            styleButton="primary"
            onClick={onClose}
            className="px-2 md:w-auto w-full text-center md:py-1.5 py-3 md:text-2xs text-base text-primary"
          >
            <span className="w-full text-center">Cancelar</span>
          </Button>
          <Button
            type="button"
            styleButton="secondary"
            onClick={() => onClickSave?.(selectedProducts)}
            className="bg-primary md:w-auto md:mb-0 mb-2 w-full px-3 text-white md:py-1.5 py-3 md:text-2xs text-base"
          >
            <span className="w-full text-center">Agregar</span>
          </Button>
        </footer>
      </div>
    </div>
  );
}
