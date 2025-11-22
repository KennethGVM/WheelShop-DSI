import CheckBox from "@/components/form/check-box";
import StatusTags from "@/components/status-tags";
import { RoleProps } from "@/types/types"
import { Dispatch, SetStateAction } from "react";

interface RoleTableRowProps {
  roles: RoleProps[];
  role: RoleProps
  selectedRoleIds: RoleProps[];
  setSelectedRoleIds: Dispatch<SetStateAction<RoleProps[]>>;
  setSelectAll: Dispatch<SetStateAction<boolean>>;
  handleEditRole: (roleId: string) => void;
}

export default function RoleTableRow({ handleEditRole, roles, role, selectedRoleIds, setSelectedRoleIds, setSelectAll }: RoleTableRowProps) {
  const handleSelectRole = (roleId: RoleProps, checked: boolean) => {
    let newSelectedIds;

    if (checked) {
      newSelectedIds = [...selectedRoleIds, roleId];
    } else {
      newSelectedIds = selectedRoleIds.filter((selectedUser) => selectedUser.roleId !== role.roleId);
    }

    setSelectedRoleIds(newSelectedIds);

    if (newSelectedIds.length !== roles.length) {
      setSelectAll(false);
    } else if (newSelectedIds.length === roles.length) {
      setSelectAll(true);
    }
  };

  return (
    <tr
      key={role.roleId}
      onDoubleClick={() => handleEditRole(role.roleId)}
      className={`${selectedRoleIds.includes(role) ? 'bg-whiting2' : 'bg-white'} group cursor-pointer md:text-2xs text-sm font-medium ${role !== roles[roles.length - 1] ? 'border-b' : ''} text-secondary/80 border-gray-300 hover:bg-[#F7F7F7]`}
    >
      <td className="w-4 px-2 py-3">
        <CheckBox
          initialValue={selectedRoleIds.includes(role)}
          onChange={(value) => handleSelectRole(role, value)}
        />
      </td>
      <td className="px-2 py-3 w-[30%]">{role.name}</td>
      <td className="px-2 py-3">
        <StatusTags status={role.state} text={role.state ? 'Activo' : 'Inactivo'} />
      </td>
      <td className="px-4 py-3 text-right">{role.users}</td>
    </tr>
  )
}
