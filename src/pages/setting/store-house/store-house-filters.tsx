import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/components/form/dropdown";
import { ArrowDownIcon } from "@/icons/icons";
import { StoreHouseProps } from "@/types/types";
import RadioButton from "@/components/form/radio-button";
import Button from "@/components/form/button";

interface StoreHouseFilterProps {
  isSearching: boolean;
  storeHouses: StoreHouseProps[];
  setStoreHouses: Dispatch<SetStateAction<StoreHouseProps[]>>;
}

export default function StoreHouseFilters({ isSearching, storeHouses, setStoreHouses }: StoreHouseFilterProps) {
  const [selectedState, setSelectedState] = useState<"true" | "false" | null>(null);
  const [originalStoreHouses, setOriginalStoreHouses] = useState<StoreHouseProps[]>(storeHouses);

  useEffect(() => {
    if (originalStoreHouses.length === 0 && storeHouses.length > 0) {
      setOriginalStoreHouses(storeHouses);
    }

    if (selectedState === null) {
      setStoreHouses(originalStoreHouses);
    } else {
      const isActive = selectedState === "true";
      const filtered = originalStoreHouses.filter(sh => sh.state === isActive);
      setStoreHouses(filtered);
    }
  }, [selectedState]);

  const handleClearFilter = () => {
    setSelectedState(null);
  };

  return (
    <div className={`overflow-hidden ${storeHouses && storeHouses.length > 0 ? 'border-0' : 'border-b border-gray-300'} transition-all duration-200 ease-out ${isSearching ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}>
      <div className="flex items-center space-x-2 py-1.5 px-2 bg-white transform transition-transform duration-200 ease-out translate-y-0">
        <Dropdown>
          <DropdownTrigger>
            <button className="flex items-center space-x-1 border border-dashed border-gray-300 rounded-md px-1.5 py-0.5 text-xs text-secondary/80 font-medium hover:border-solid">
              <span>Estado</span>
              <ArrowDownIcon className="fill-secondary/80 size-[13px]" />
            </button>
          </DropdownTrigger>
          <DropdownContent align="start" className="w-[200px] rounded-xl [&>div]:hover:bg-transparent">
            <DropdownItem>
              <RadioButton
                name="Activa"
                checked={selectedState === "true"}
                onClick={() => setSelectedState("true")}
              />
            </DropdownItem>
            <DropdownItem>
              <RadioButton
                name="Inactiva"
                checked={selectedState === "false"}
                onClick={() => setSelectedState("false")}
              />
            </DropdownItem>
            <div className="px-4 pt-2">
              <Button
                name="Borrar"
                className="text-blueprimary disabled:text-[#c0c0c0] disabled:no-underline disabled:cursor-autoo
                 text-2xs font-medium hover:underline"
                onClick={handleClearFilter}
                disabled={selectedState === null}
              />
            </div>
          </DropdownContent>
        </Dropdown>
      </div>
    </div>
  );
}
