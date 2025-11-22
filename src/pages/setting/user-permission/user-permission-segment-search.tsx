import { SearchIcon } from "@/icons/icons";
import { UserPermissionProps } from "@/types/types";
import { Dispatch, RefObject, SetStateAction } from "react";

interface UserPermissionSegmentSearchProps {
  inputRef: RefObject<HTMLInputElement | null>;
  isSearching: boolean;
  users: UserPermissionProps[];
  setUsers: Dispatch<SetStateAction<UserPermissionProps[]>>;
  selectedFilters: { segments: number, sorts: string, typeSort: 'recent' | 'ancient' };
  handleChangeSelectedFilters: (name: 'segments' | 'sorts' | 'typeSort', value: number | string) => void;
}

export default function UserPermissionSegmentSearch({ inputRef, isSearching, users, selectedFilters, setUsers, handleChangeSelectedFilters }: UserPermissionSegmentSearchProps) {
  const SEGMENTS = ["Todos", "Activos", "Inactivos"];

  const handleSegmentUserPermissions = (segment: number) => {
    setUsers(segment === 0 ? users : segment === 1 ? users.filter(p => p.state === true) : users.filter(p => p.state === false));
  };

  const handleSearchUserPermission = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const query = value.toLowerCase().trim();

    if (query) {
      const searchTerms = query.split(' ');
      const filtered = users.filter((user) => {
        return searchTerms.every((term) => {
          return (
            user.email.toLowerCase().includes(term) ||
            user.roleName?.toLowerCase().includes(term)
          );
        });
      });

      setUsers(filtered);
    } else {
      setUsers(users);
    }
  };

  const handleButtonClick = (segment: number) => {
    handleChangeSelectedFilters('segments', segment);
    handleSegmentUserPermissions(segment);
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
            <SearchIcon className="size-[18px] text-secondary/80 stroke-2" />
            <input
              ref={inputRef}
              onChange={handleSearchUserPermission}
              placeholder="Buscando en todos los usuarios"
              className="outline-none md:text-2xs text-base font-medium h-full w-full text-secondary/80 placeholder-secondary/80 md:placeholder:text-2xs placeholder:text-base"
            />
          </div>
        </div>
      )}
    </>
  )
}
