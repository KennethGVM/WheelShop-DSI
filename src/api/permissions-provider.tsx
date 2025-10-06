import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabase-client';
import { useAuth } from './auth-provider';
import { PermissionProps } from '@/types/types';

interface RolePermissionData {
  roleId: string | null;
  rolePermissionId: string | null;
  permissions: PermissionProps[];
  name: string;
}

interface RolePermissionContextProps {
  userPermissions: RolePermissionData | null;
  loading: boolean;
}

const RolePermissionContext = createContext<RolePermissionContextProps>({
  userPermissions: null,
  loading: true,
});

export const RolePermissionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState<RolePermissionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRolePermissions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true)

      const { data: roleData, error } = await supabase
        .from('getrolepermissions')
        .select('*')
        .eq('userId', user.id)
        .maybeSingle();

      if (error) {
      } else if (roleData) {
        setUserPermissions({
          roleId: roleData.roleId,
          rolePermissionId: roleData.rolePermissionId,
          permissions: roleData.permissions || [],
          name: roleData.name,
        });
      }

      setLoading(false);
    };

    fetchRolePermissions();
  }, [user]);

  return (
    <RolePermissionContext.Provider value={{ userPermissions, loading }}>
      {children}
    </RolePermissionContext.Provider>
  );
};

export const useRolePermission = () => useContext(RolePermissionContext);
