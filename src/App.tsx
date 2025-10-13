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
    }
  ]);

  return (
    <RouterProvider router={router} />

  )
}

export default App
