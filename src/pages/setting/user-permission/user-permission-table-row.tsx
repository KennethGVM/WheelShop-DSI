import CheckBox from "@/components/form/check-box";
import StatusTags from "@/components/status-tags";
import { UserPermissionProps } from "@/types/types"
import { useNavigate } from "react-router-dom";

interface UserPermissionTableRowProps {
  users: UserPermissionProps[];
  user: UserPermissionProps
  selectedUsersIds: UserPermissionProps[];
  handleSelectUser: (userId: UserPermissionProps, checked: boolean) => void;
}

export default function UserPermissionTableRow({ users, user, selectedUsersIds, handleSelectUser }: UserPermissionTableRowProps) {
  const navigate = useNavigate();

  return (
    <tr
      key={user.userId}
      onDoubleClick={() => navigate(`/settings/users/add/${user.userId}`)}
      className={`${selectedUsersIds.includes(user) ? 'bg-whiting2' : 'bg-white'} group cursor-pointer text-2xs font-medium ${user !== users[users.length - 1] ? 'border-b' : ''} text-secondary/80 border-gray-300 hover:bg-[#F7F7F7]`}
    >
      <td className="w-4 px-2 py-3">
        <CheckBox
          initialValue={selectedUsersIds.includes(user)}
          onChange={(value) => handleSelectUser(user, value)}
        />
      </td>
      <td className="px-2 py-3 w-[30%]">{user.email}</td>
      <td className="px-2 py-3">
        <StatusTags status={user.state} text={user.state ? 'Activo' : 'Inactivo'} />
      </td>
      <td className="px-2 py-3">{user.roleName ? user.roleName : 'Ninguna'}</td>
    </tr>
  )
}
