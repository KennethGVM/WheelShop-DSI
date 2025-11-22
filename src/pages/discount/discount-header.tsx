import { useRolePermission } from '@/api/permissions-provider';
import Button from '@/components/form/button';
import { getPermissions } from '@/lib/function';
import { useNavigate } from 'react-router-dom';

export default function DiscountHeader() {
  const navigate = useNavigate();
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canCreateDiscount = getPermissions(permissions, "Descuentos", "Crear y editar")?.canAccess;

  return (
    <header className="flex items-center justify-between mb-5 md:px-0 px-4">
      <h2 className="font-bold text-[20px] text-secondary/90">Descuentos</h2>
      {canCreateDiscount && <Button onClick={() => navigate('/discounts/add')} name="Crear descuento" styleButton="secondary" className="md:px-2 px-4 py-3 md:py-0.5 md:text-2xs text-base font-medium" />}
    </header>
  );
}
