import { createBrowserRouter } from 'react-router'

import Home from 'src/views/Home'
import Login from 'src/views/Login'
import NotAuth from 'src/views/NotAuth'

// 系统管理
import OnlineUser from 'src/pages/OnlineUser'
import SystemAuthorization from 'src/pages/SystemAuthorization'
import UserManagement from 'src/pages/UserManagement'

// 主页
import Auxiliary from 'src/pages/Auxiliary'
import Balance from 'src/pages/Balance'
import Bank from 'src/pages/Bank'
import BankBalance from 'src/pages/BankBalance'
import CashFlow from 'src/pages/CashFlow'

// 综合询析
import Assetliab from 'src/pages/Comprehensive/Assetliab'
import Expense from 'src/pages/Comprehensive/Expense'
import ProjectActualPerformance from 'src/pages/Comprehensive/ProjectActualPerformance'
import ProjectInventory from 'src/pages/Comprehensive/ProjectInventory'
import ProjectTotal from 'src/pages/Comprehensive/ProjectTotal'

import DetailFixedAssetsDepreciation from 'src/pages/Detail/FixedAssetsDepreciation'
import DetailInventory from 'src/pages/Detail/inventory'
import DetailLongTermDepreciation from 'src/pages/Detail/LongTermDepreciation'
import DetailOtherReceivable from 'src/pages/Detail/OtherReceivable'
import DetailPrepay from 'src/pages/Detail/Prepay'
import DetailReceivable from 'src/pages/Detail/receivable'
import DetailStock from 'src/pages/Detail/Stock'
import DetailStockIn from 'src/pages/Detail/StockIn'
import DetailStockOut from 'src/pages/Detail/StockOut'

import Document from 'src/pages/Document'
import Inventory from 'src/pages/Inventory'
import Receivable from 'src/pages/Receivable'
import Report from 'src/pages/Report'
import RestrictedFunds from 'src/pages/RestrictedFunds'
import TaxReport from 'src/pages/TaxReport'
import Voucher from 'src/pages/Voucher'

export const router = createBrowserRouter([
  {
    path: '/*',
    element: <NotAuth />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <Home />,
    children: [
      // 系统管理
      {
        path: '/userManagement',
        element: <UserManagement />,
      },
      {
        path: '/systemAuthorization',
        element: <SystemAuthorization />,
      },
      {
        path: '/onlineUser',
        element: <OnlineUser />,
      },
      // 主页
      {
        path: '/voucher',
        element: <Voucher />,
      },
      {
        path: '/report',
        element: <Report />,
      },
      {
        path: '/taxReport',
        element: <TaxReport />,
      },
      {
        path: '/bank',
        element: <Bank />,
      },
      {
        path: '/document',
        element: <Document />,
      },
      {
        path: '/auxiliary',
        element: <Auxiliary />,
      },
      {
        path: '/balance',
        element: <Balance />,
      },
      {
        path: '/comprehensive',
        children: [
          {
            path: '/comprehensive/assetliab',
            element: <Assetliab />,
          },
          {
            path: '/comprehensive/expense',
            element: <Expense />,
          },
          {
            path: '/comprehensive/projectTotal',
            element: <ProjectTotal />,
          },
          {
            path: '/comprehensive/projectInventory',
            element: <ProjectInventory />,
          },
          {
            path: '/comprehensive/projectActualPerformance',
            element: <ProjectActualPerformance />,
          },
        ],
      },
      {
        path: '/detail',
        children: [
          {
            path: '/detail/receivable',
            element: <DetailReceivable />,
          },
          {
            path: '/detail/inventory',
            element: <DetailInventory />,
          },
          {
            path: '/detail/otherReceivable',
            element: <DetailOtherReceivable />,
          },
          {
            path: '/detail/prepay',
            element: <DetailPrepay />,
          },
          {
            path: '/detail/stock',
            element: <DetailStock />,
          },
          {
            path: '/detail/stockIn',
            element: <DetailStockIn />,
          },
          {
            path: '/detail/stockOut',
            element: <DetailStockOut />,
          },
          {
            path: '/detail/longTermDepreciation',
            element: <DetailLongTermDepreciation />,
          },
          {
            path: '/detail/fixedAssetsDepreciation',
            element: <DetailFixedAssetsDepreciation />,
          },
        ],
      },
      {
        path: '/bankBalance',
        element: <BankBalance />,
      },
      {
        path: '/receivable',
        element: <Receivable />,
      },
      {
        path: '/inventory',
        element: <Inventory />,
      },
      {
        path: '/cashFlow',
        element: <CashFlow />,
      },
      {
        path: '/restrictedFunds',
        element: <RestrictedFunds />,
      },
    ],
  },
])
