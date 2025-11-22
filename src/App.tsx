import './App.css'
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import Home from '@/pages/home';
import AddProduct from '@/pages/product/add-product';
import AddSupplier from '@/pages/supplier/add-supplier';
import Supplier from '@/pages/supplier/supplier';
import Product from './pages/product/product';
import AddCustomer from './pages/customer/add-customer';
import Customer from './pages/customer/customer';
import AddPurchase from './pages/purchase/add-purchase';
import Purchase from './pages/purchase/purchase';
import PurchaseReceiveInventory from './pages/purchase/purchase-receive-inventory';
import Login from './pages/auth/login';
import { JSX } from 'react';
import { useAuth } from '@/api/auth-provider';

const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  return user ? element : <Navigate to="/login" replace />;
};

import PurchaseReceive from './pages/purchase/purchase-receive/purchase-receive';
import Inventory from './pages/inventory/inventory';
import AddSale from './pages/sale/add-sale';
import Sale from './pages/sale/sale';
import Spinner from './components/spinner';
import General from './pages/setting/general';
import UserPermission from '@/pages/setting/user-permission/user-permission';
import Settings from './pages/setting/settings';
import Notification from './pages/setting/notification/notification';
import NotificationCustomer from './pages/setting/notification/notification-customer';
import AddUser from './pages/setting/user-permission/add-user';
import AddPurchaseDeferredPayment from './pages/purchase/purchase-deferred-payment/add-purchase-deferred-payment';
import AdjustmentHistory from './pages/product/adjustment-history';
import AddTransfer from './pages/transfer/add-transfer';
import Transfer from './pages/transfer/transfer';
import Quotation from './pages/quotation/quotation';
import Return from './pages/return/return';
import CashBox from './pages/cash-box/cash-box';
import CashBoxOpening from './pages/cash-box/cash-box-opening';
import CashBoxArching from './pages/cash-box/arching/cash-box-arching';
import Arching from './pages/cash-box/arching/arching';
import Role from './pages/setting/role/role';
import AddRole from './pages/setting/role/add-role';
import Account from './pages/setting/account';
import AddSaleDeferredPayment from './pages/sale/sale-deferred-payment/add-sale-deferred-payment';
import PendingAccount from './pages/pendingAccount/pending-account';
import StoreHouse from './pages/setting/store-house/store-house';
import AddStoreHouse from './pages/setting/store-house/add-store-house';
import Expense from './pages/expense/expense';
import Opening from './pages/cash-box/opening/opening';
import Brand from './pages/brand/brand';
import Closing from './pages/cash-box/closing/closing';
import CashBoxClosing from './pages/cash-box/closing/cash-box-closing';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <ProtectedRoute element={<Home />} />
    },
    {
      path: 'products/add/:product_id?',
      element: <ProtectedRoute element={<AddProduct />} />
    },
    {
      path: '/products',
      element: <ProtectedRoute element={<Product />} />
    },
    {
      path: '/brands',
      element: <ProtectedRoute element={<Brand />} />
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
      path: '/customers',
      element: <ProtectedRoute element={<Customer />} />
    },
    {
      path: 'customers/add/:customerId?',
      element: <ProtectedRoute element={<AddCustomer />} />
    },
    {
      path: '/purchases/add/:purchaseId?',
      element: <ProtectedRoute element={<AddPurchase />} />
    },
    {
      path: '/purchases',
      element: <ProtectedRoute element={<Purchase />} />
    },
    {
      path: '/purchases/add/:purchaseId?/receive',
      element: <ProtectedRoute element={<PurchaseReceiveInventory />} />
    },
    {
      path: '/login',
      element: <Login />
    },
    {
      path: '/purchases/receive/:purchaseId?',
      element: <ProtectedRoute element={<PurchaseReceive />} />
    },
    {
      path: '/inventory',
      element: <ProtectedRoute element={<Inventory />} />
    },
    {
      path: '/sales',
      element: <ProtectedRoute element={<Sale />} />
    },
    {
      path: '/sales/add/:saleId?',
      element: <ProtectedRoute element={<AddSale />} />
    },
    {
      path: '/quotations/add/:saleId?',
      element: <ProtectedRoute element={<AddSale />} />
    },
    {
      path: '/cash-box/',
      element: <CashBox />
    },
    {
      path: '/cash-box/opening/:cashBoxId',
      element: <CashBoxOpening />
    },
    {
      path: '/openings',
      element: <Opening />
    },
    {
      path: '/archings',
      element: <Arching />
    },
    {
      path: '/archings/add/:cashBoxId',
      element: <CashBoxArching />
    },
    {
      path: '/transfers',
      element: <ProtectedRoute element={<Transfer />} />
    },
    {
      path: '/transfers/add/:transferId?',
      element: <ProtectedRoute element={<AddTransfer />} />
    },
    {
      path: '/products/add/:product_id/adjustment_history',
      element: <ProtectedRoute element={<AdjustmentHistory />} />
    },
    {
      path: 'purchases/payment/add/:purchaseId?',
      element: <ProtectedRoute element={<AddPurchaseDeferredPayment />} />
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
    {
      path: '/quotations',
      element: <ProtectedRoute element={<Quotation />} />
    },
    {
      path: '/sales/return/add/:saleId?',
      element: <ProtectedRoute element={<Return />} />
    },
    {
      path: 'sales/payment/add/:saleId?',
      element: <ProtectedRoute element={<AddSaleDeferredPayment />} />
    },
    {
      path: '/pending-accounts',
      element: <ProtectedRoute element={<PendingAccount />} />
    },
    {
      path: '/expenses',
      element: <ProtectedRoute element={<Expense />} />
    },
    {
      path: '/closings',
      element: <Closing />
    },
    {
      path: '/closings/add/:cashBoxId',
      element: <CashBoxClosing />
    },
  ]);

  return (
    <RouterProvider router={router} />
  )
}

export default App
