import './App.css'
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import Home from './pages/home';
import { JSX } from 'react';
import { useAuth } from './api/auth-provider';
import Spinner from './components/spinner';
import Login from './pages/auth/login';
import Customer from './pages/customer/customer';
import Brand from './pages/brand/brand';
import Product from './pages/product/product';
import AddProduct from './pages/product/add-product';
import AddCustomer from './pages/customer/add-customer';
import Supplier from './pages/supplier/supplier';
import AddSupplier from './pages/supplier/add-supplier';
import Sale from './pages/sale/sale';

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
      path: '/brands',
      element: <ProtectedRoute element={<Brand />} />
    },
    {
      path: '/products',
      element: <ProtectedRoute element={<Product />} />
    },
    {
      path: 'products/add/:product_id?',
      element: <ProtectedRoute element={<AddProduct />} />
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
    {
      path: '/sales',
      element: <ProtectedRoute element={<Sale />} />
    },
  ]);

  return (
    <RouterProvider router={router} />

  )
}

export default App
