import { SearchIcon } from "@/icons/icons";
import { RoleProps } from "@/types/types";
import { Dispatch, RefObject, SetStateAction } from "react";

interface RoleSegmentSearchProps {
  inputRef: RefObject<HTMLInputElement | null>;
  isSearching: boolean;
  roles: RoleProps[];
  setRoles: Dispatch<SetStateAction<RoleProps[]>>;
  selectedFilters: { segments: number, sorts: string, typeSort: 'recent' | 'ancient' };
  handleChangeSelectedFilters: (name: 'segments' | 'sorts' | 'typeSort', value: number | string) => void;
}

export default function RoleSegmentSearch({ inputRef, isSearching, roles, selectedFilters, setRoles, handleChangeSelectedFilters }: RoleSegmentSearchProps) {
  const SEGMENTS = ["Todos", "Activos", "Inactivos"];

  const handleSegmentRoles = (segment: number) => {
    if (segment === 0) {
      setRoles(roles);
    } else if (segment === 1) {
      setRoles(roles.filter(role => role.state === true));
    } else if (segment === 2) {
      setRoles(roles.filter(role => role.state === false));
    }
  };

  const handleSearchUserPermission = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const query = value.toLowerCase().trim();

    if (query) {
      const searchTerms = query.split(' ');
      const filtered = roles.filter((role) => {
        return searchTerms.every((term) => {
          return (
            role.name.toLowerCase().includes(term)
          );
        });
      });

      setRoles(filtered);
    } else {
      setRoles(roles);
    }
  };

  const handleButtonClick = (segment: number) => {
    handleChangeSelectedFilters('segments', segment);
    handleSegmentRoles(segment);
  };

  return (
    <>
      {!isSearching ? (
        <div className="flex items-center space-x-2">
          {SEGMENTS.map((segment, index) => (
            <button key={index} onClick={() => handleButtonClick(index)} className={`text-primary/90 font-medium md:text-2xs text-base ${selectedFilters.segments === index ? 'bg-[#ebebeb]' : 'bg-transparent'} rounded-md px-3 py-1 hover:bg-[#f2f2f2]`}>
              {segment}
            </button>
          ))}
        </div>
      ) : (
        <div className="border border-transparent rounded-lg flex items-center px-3 h-full py-1 w-full group focus-within:border-blue-500">
          <div className='flex items-center space-x-2 w-full'>
            <SearchIcon className="md:size-[18px] size-[22px] text-secondary/80 stroke-2" />
            <input
              ref={inputRef}
              onChange={handleSearchUserPermission}
              placeholder="Buscando en todos los roles"
              className="outline-none md:text-2xs text-base font-medium h-full w-full text-secondary/80 placeholder-secondary/80 md:placeholder:text-2xs placeholder:text-base"
            />
          </div>
        </div>
      )}
    </>
  )
}
