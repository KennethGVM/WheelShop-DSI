import './App.css'
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import Home from './pages/home';
import { JSX } from 'react';
import { useAuth } from './api/auth-provider';
import Spinner from './components/spinner';
import Login from './pages/auth/login';
import Customer from './pages/customer/customer';
import AddSupplier from './pages/supplier/add-supplier';
import Supplier from './pages/supplier/supplier';
import AddCustomer from './pages/customer/add-customer';

const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  return user ? element : <Navigate to="/login" replace />;
};

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <ProtectedRoute element={<Home />} />
    },
    {
      path: '/login',
      element: <Login />
    },
    {
      path: '/customers',
      element: <ProtectedRoute element={<Customer />} />
    },
    {
      path: '/suppliers/add/:supplierId?',
      element: <ProtectedRoute element={<AddSupplier />} />
    },
    {
      path: '/suppliers',
      element: <ProtectedRoute element={<Supplier />} />
    },
    {
      path: '/customers/add',
      element: <ProtectedRoute element={<AddCustomer />} />
    },
    {
      path: 'customers/add/:customerId?',
      element: <ProtectedRoute element={<AddCustomer />} />
    },
  ]);

  return (
    <RouterProvider router={router} />

  )
}

export default App
