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
import AddPurchase from './pages/purchase/add-purchase';
import Purchase from './pages/purchase/purchase';
import Inventory from './pages/inventory/inventory';
import Transfer from './pages/transfer/transfer';
import AddTransfer from './pages/transfer/add-transfer';
import Settings from './pages/setting/settings';
import General from './pages/setting/general';
import Account from './pages/setting/account';
import UserPermission from './pages/setting/user-permission/user-permission';
import Role from './pages/setting/role/role';
import AddRole from './pages/setting/role/add-role';
import StoreHouse from './pages/setting/store-house/store-house';
import AddStoreHouse from './pages/setting/store-house/add-store-house';
import NotificationCustomer from './pages/setting/notification/notification-customer';
import Notification from './pages/setting/notification/notification';
import AddUser from './pages/setting/user-permission/add-user';

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
    {
      path: 'purchases',
      element: <ProtectedRoute element={<Purchase />} />
    },
    {
      path: 'purchases/add/:purchaseId?',
      element: <ProtectedRoute element={<AddPurchase />} />
    },
    {
      path: 'inventory',
      element: <ProtectedRoute element={<Inventory />} />
    },
    {
      path: 'transfers',
      element: <ProtectedRoute element={<Transfer />} />
    },
    {
      path: '/transfers/add/:transferId?',
      element: <ProtectedRoute element={<AddTransfer />} />
    },
    {
      path: "/settings",
      element: <ProtectedRoute element={<Settings />} />,
      children: [
        {
          path: "general",
          element: <ProtectedRoute element={<General />} />,
        },
        {
          path: "account",
          element: <ProtectedRoute element={<Account />} />,
        },
        {
          path: "users",
          element: <ProtectedRoute element={<UserPermission />} />,
        },
        {
          path: 'roles',
          element: <ProtectedRoute element={<Role />} />
        },
        {
          path: 'roles/add/:roleId?',
          element: <ProtectedRoute element={<AddRole />} />
        },
        {
          path: "store-houses",
          element: <ProtectedRoute element={<StoreHouse />} />,
        },
        {
          path: "store-houses/add/:storeHouseId?",
          element: <ProtectedRoute element={<AddStoreHouse />} />,
        },
        {
          path: "notifications",
          element: <ProtectedRoute element={<Notification />} />,
        },
        {
          path: "notifications/customer",
          element: <ProtectedRoute element={<NotificationCustomer />} />,
        },
        {
          path: "users/add/:userId?",
          element: <ProtectedRoute element={<AddUser />} />,
        }

      ],
    },
  ]);

  return (
    <RouterProvider router={router} />

  )
}

export default App
