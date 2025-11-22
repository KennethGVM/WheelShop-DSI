import StatusTags from "@/components/status-tags";
import { StoreHouseProps } from "@/types/types"
import { useNavigate } from "react-router-dom";

interface StoreHouseTableRowProps {
  storeHouses: StoreHouseProps[];
  storeHouse: StoreHouseProps
}

export default function StoreHouseTableRow({ storeHouse, storeHouses }: StoreHouseTableRowProps) {
  const navigate = useNavigate();
  return (
    <tr
      key={storeHouse.storeHouseId}
      onDoubleClick={() => navigate(`/settings/store-houses/add/${storeHouse.storeHouseId}`)}
      className={`bg-white group cursor-pointer md:text-2xs text-base font-medium ${storeHouse !== storeHouses[storeHouses.length - 1] ? 'border-b' : ''} text-secondary/80 border-gray-300 hover:bg-[#F7F7F7]`}
    >
      <td className="px-4 py-3 w-[70%]">
        <div className="flex flex-col space-y-1 md:text-2xs text-base">
          <span className="font-[550] text-secondary/80">{storeHouse.name}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <StatusTags status={storeHouse.state} text={storeHouse.state ? 'Activa' : 'Inactiva'} />
      </td>
    </tr>
  )
}
