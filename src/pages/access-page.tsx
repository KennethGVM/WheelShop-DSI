import { useAuth } from "@/api/auth-provider";
import { supabase } from "@/api/supabase-client";
import Button from "@/components/form/button";
import { useNavigate } from "react-router-dom";

export default function AccessPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center w-full h-[80vh]">
      <div className="flex md:flex-row flex-col items-center md:space-x-6">
        <img src='/images/access-icon.svg' className='size-64' />
        <div className="md:px-0 px-4 md:mt-0 mt-7">
          <h2 className="text-2xl md:text-left text-center font-bold text-primary">Necesitas permiso para ver esta función</h2>
          <p className="md:text-sm text-base md:text-left text-center mb-5 font-medium text-secondary/80 mt-3">Tu cuenta {user && user.email} no tiene acceso a esta página</p>

          <div className="flex items-center md:justify-start justify-center">
            <Button onClick={() => navigate('/')} styleButton="secondary" name="Volver al inicio" className="px-3 py-1.5 md:text-2xs text-base" />
            <Button name="Cerrar sesión" onClick={() => supabase.auth.signOut()} className="px-3 text-blueprimary font-[450] hover:text-bluesecondary py-1.5 md:text-2xs text-base" />
          </div>
        </div>
      </div>
    </div>
  )
}
