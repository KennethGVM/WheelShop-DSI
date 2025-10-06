import {
  BillingIcon,
  ClockIcon,
  CloseIcon,
  CustomersIcon,
  DiscountIcon,
  HomeIcon,
  OrdersIcon,
  ProductsIcon,
  ReportStadisticsIcon,
  SearchIcon,
  SupplierIcon,
} from "@/icons/icons";
import FieldInput from "./form/field-input";
import { useEffect, useState } from "react";
import { supabase } from "@/api/supabase-client";
import { Link } from "react-router-dom";
import { useDebounce } from "@/lib/function";
import StatusTags from "./status-tags";

interface GlobalSearchModalProps {
  onClose: () => void;
  modalRef: React.RefObject<HTMLDivElement | null>;
}

interface SubItem {
  text: string;
  href: string;
}

interface MenuItem {
  text: string;
  href: string;
  icon: React.ReactNode;
  subItems?: SubItem[];
}


interface ResultsProps {
  source: "product" | "customer" | "purchase" | "sale" | "menu";
  title: string;
  description: string;
  metadata?: { state: boolean };
  url: string;
  Icon?: React.ReactNode;
  isSubItem?: boolean;
}

export default function GlobalSearchModal({ onClose, modalRef }: GlobalSearchModalProps) {
  const menuItems = [
    {
      text: "Inicio",
      href: "/",
      icon: <HomeIcon className="md:size-4 size-5 fill-[#4a4a4a] stroke-none" />,
    },
    {
      text: "Ventas",
      href: "/sales",
      icon: <OrdersIcon className="md:size-4 size-5 fill-[#4a4a4a] stroke-none" />,
      subItems: [{ text: "Cotizaciones", href: "/quotations" }],
    },
    {
      text: "Caja",
      href: "/cash-box",
      icon: <BillingIcon className="md:size-4 size-5 fill-[#4a4a4a] stroke-none" />,
      subItems: [
        { text: "Aperturas de caja", href: "/openings" },
        { text: "Arqueos", href: "/archings" },
        { text: "Cierres de caja", href: "/closings" },
        { text: "Gastos / Comisiones", href: "/expenses" },
      ],
    },
    {
      text: "Productos",
      href: "/products",
      icon: <ProductsIcon className="md:size-4 size-5 fill-[#4a4a4a] stroke-none" />,
      subItems: [
        { text: "Marcas", href: "/brands" },
        { text: "Inventario", href: "/inventory" },
        { text: "Órdenes de compra", href: "/purchases" },
        { text: "Transferencias", href: "/transfers" },
      ],
    },
    {
      text: "Clientes",
      href: "/customers",
      icon: <CustomersIcon className="md:size-4 size-5 fill-[#4a4a4a] stroke-none" />,
      subItems: [{ text: "Cuentas pendientes", href: "/pending-accounts" }],
    },
    {
      text: "Proveedores",
      href: "/suppliers",
      icon: <SupplierIcon className="md:size-4 size-5 fill-[#4a4a4a] stroke-none" />,
    },
    {
      text: "Informes y estadísticas",
      href: "/reports",
      icon: <ReportStadisticsIcon className="md:size-4 size-5 fill-[#4a4a4a] stroke-none" />,
    },
    {
      text: "Descuentos",
      href: "/discounts",
      icon: <DiscountIcon className="md:size-4 size-5 fill-[#4a4a4a] stroke-none" />,
    },
  ];

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);


  const TAGS = [
    { name: "Clientes", value: "customer" },
    { name: "Ventas", value: "sale" },
    { name: "Productos", value: "product" },
    { name: "Órdenes de compra", value: "purchase" },
  ];

  const [textSearch, setTextSearch] = useState<string>("");
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [results, setResults] = useState<ResultsProps[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  const debouncedSearch = useDebounce(textSearch);

  useEffect(() => {
    const saved = localStorage.getItem("global_search_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    setTextSearch(debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    const handleLoadSearch = async () => {
      const params: { query: string; source_filter?: string } = {
        query: debouncedSearch,
      };
      if (selectedSource) params.source_filter = selectedSource;

      const { data } = await supabase.rpc("global_search", params);

      const filteredMenuResults = filterMenuItems(menuItems, debouncedSearch);

      const combinedResults = [...filteredMenuResults, ...(data || [])];

      setResults(combinedResults);
    };

    if (debouncedSearch.trim() !== "") handleLoadSearch();
    else setResults([]);
  }, [debouncedSearch, selectedSource]);

  function filterMenuItems(menu: MenuItem[], query: string) {
    if (!query) return [];

    const lowerQuery = query.toLowerCase().trim();

    const filtered: ResultsProps[] = [];

    for (const item of menu) {
      if (item.text.toLowerCase().includes(lowerQuery)) {
        filtered.push({
          source: "menu",
          title: item.text,
          description: "",
          url: item.href,
          Icon: item.icon,
          isSubItem: false,
        });
      }
      if (item.subItems && item.subItems.length > 0) {
        for (const sub of item.subItems) {
          if (sub.text.toLowerCase().includes(lowerQuery)) {
            filtered.push({
              source: "menu",
              title: sub.text,
              description: "",
              url: sub.href,
              Icon: item.icon,
              isSubItem: true,
            });
          }
        }
      }
    }

    return filtered;
  }

  const addToHistory = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...history.filter((t) => t !== term)].slice(0, 10);
    setHistory(updated);
    localStorage.setItem("global_search_history", JSON.stringify(updated));
  };

  return (
    <div
      tabIndex={-1}
      ref={modalRef}
      className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 p-3 w-full md:min-w-[300px] md:w-[800px] rounded-none bg-white border border-gray-300 shadow-md md:rounded-2xl"
    >
      <FieldInput
        autoFocus
        placeholder="Buscar"
        className="mb-2 w-full"
        classNameDiv="md:h-8 h-9"
        value={textSearch}
        onChange={(e) => setTextSearch(e.target.value)}
        appendChild={<SearchIcon className="md:size-4 size-5 text-whiting" />}
      />

      <div className="flex items-center space-x-3 mt-3">
        {TAGS.map(({ name, value }, index) => (
          <button
            key={index}
            onClick={() => setSelectedSource(value)}
            className={`flex items-center space-x-2 text-secondary/80 rounded-lg font-medium md:text-xs text-2xs px-1.5 py-1 ${selectedSource === value ? "bg-[#d4d4d4]" : "bg-[#E3E3E3] hover:bg-[#d4d4d4]"
              }`}
          >
            <span>{name}</span>
            {selectedSource === value && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSource("");
                }}
              >
                <CloseIcon className="size-4 stroke-2" />
              </span>
            )}
          </button>
        ))}
      </div>

      {results.length > 0 ? (
        <div className="mt-2 max-h-[300px] overflow-y-auto pr-1 space-y-1">
          {results.map(({ source, url, title, description, metadata, Icon }, index) => (
            <Link key={index} to={url} onClick={() => addToHistory(title)}>
              <div className="flex items-center space-x-2 px-3.5 hover:bg-[#f2f2f2] py-1.5 rounded-lg">
                {source === "menu" ? (
                  Icon && <div className="md:size-4 size-5 text-secondary/80">{Icon}</div>
                ) : source === "customer" ? (
                  <CustomersIcon className="md:size-4 size-5 fill-secondary/80 stroke-none" />
                ) : source === "purchase" ? (
                  <BillingIcon className="md:size-4 size-5 fill-secondary/80 stroke-none" />
                ) : source === "sale" ? (
                  <OrdersIcon className="md:size-4 size-5 fill-secondary/80 stroke-none" />
                ) : source === "product" ? (
                  <ProductsIcon className="md:size-4 size-5 fill-secondary/80 stroke-none" />
                ) : null}

                <div>
                  <div
                    className={`flex items-center space-x-2 ${source === "product" ? "mb-2" : ""}`}
                  >
                    <span className="font-semibold text-primary md:text-2xs text-base">
                      {title}
                    </span>
                    {source === "product" && (
                      <StatusTags
                        className="px-1 py-0.5 rounded-lg"
                        status={metadata?.state ?? true}
                        text={metadata?.state ? "Activo" : "Inactivo"}
                      />
                    )}
                  </div>
                  <p className="text-secondary/80 md:text-xs text-sm font-medium">{description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : debouncedSearch.trim() === "" && history.length > 0 ? (
        <div className="mt-4">
          <div className="flex items-center justify-between space-x-2">
            <span className="md:text-2xs text-sm font-[550] text-secondary/80 px-1">Búsquedas recientes</span>
            <button
              onClick={() => {
                setHistory([]);
                localStorage.removeItem("global_search_history");
              }}
              className="md:text-2xs text-sm font-medium text-blueprimary hover:underline hover:to-bluesecondary"
            >
              Borrar historial
            </button>
          </div>
          <div className="max-h-[300px] overflow-y-auto pr-1 space-y-0.5">
            {history.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setTextSearch(item)}
                className="flex items-center space-x-3 cursor-pointer px-3.5 py-2 hover:bg-[#f2f2f2] rounded-lg md:text-2xs text-base font-medium text-secondary/80"
              >
                <ClockIcon className="md:size-4 size-5 fill-secondary/80 " />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-7 mt-4 text-center">
          <SearchIcon className="size-14 text-[#a5a5a5]" />
          <p className="text-[15px] font-medium text-secondary/80">Busca cualquier cosa en WHEELSHOP</p>
        </div>
      )}
    </div>
  );
}
