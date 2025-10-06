import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './api/auth-provider.tsx'
import { GeneralInformationProvider } from './api/general-provider.tsx'
import { RolePermissionProvider } from './api/permissions-provider.tsx'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <RolePermissionProvider>
      <GeneralInformationProvider>
        <App />
      </GeneralInformationProvider>
    </RolePermissionProvider>
  </AuthProvider>
)
