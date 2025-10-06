import './App.css'
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import Home from './pages/home';
import { JSX } from 'react';
import { useAuth } from './api/auth-provider';
import Spinner from './components/spinner';
import Login from './pages/auth/login';

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
  ]);

  return (
    <RouterProvider router={router} />

  )
}

export default App
