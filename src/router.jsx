import { createBrowserRouter } from 'react-router'

import ExcelView from 'src/views/ExcelView'
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
import BankBalance from 'src/pages/BankBalance'
import CashFlow from 'src/pages/CashFlow'

import BankStatement from 'src/pages/BankStatement'

import Assetliab from 'src/pages/Comprehensive/Assetliab'
import Expense from 'src/pages/Comprehensive/Expense'
import ProjectActualPerformance from 'src/pages/Comprehensive/ProjectActualPerformance'
import ProjectInventory from 'src/pages/Comprehensive/ProjectInventory'
import ProjectTotal from 'src/pages/Comprehensive/ProjectTotal'

import Detail from 'src/pages/Detail'
import DetailStock from 'src/pages/Detail/Stock'
import DetailStockIn from 'src/pages/Detail/Stock/StockIn'
import DetailStockOut from 'src/pages/Detail/Stock/StockOut'
import DetailTaxes from 'src/pages/Detail/Taxes'
import DetailAddTax from 'src/pages/Detail/Taxes/AddTax'

import Inventory from 'src/pages/Inventory'
import Receivable from 'src/pages/Receivable'
import RestrictedFunds from 'src/pages/RestrictedFunds'
import Voucher from 'src/pages/Voucher'
import VoucherDetail from 'src/pages/Voucher/Detail'

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
    path: '/excel/view/:id',
    element: <ExcelView />,
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
      {
        path: '/voucher',
        element: <Voucher />,
      },
      {
        path: '/voucher/detail/:id',
        element: <VoucherDetail />,
      },
      {
        path: '/report',
        element: <BankStatement />,
      },
      {
        path: '/taxReport',
        element: <BankStatement />,
      },
      {
        path: '/bank',
        element: <BankStatement />,
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
            path: '/detail/bill-receive',
            element: <Detail />,
          },
          {
            path: '/detail/account-receive',
            element: <Detail />,
          },
          {
            path: '/detail/ohter-receive',
            element: <Detail />,
          },
          {
            path: '/detail/prepay',
            element: <Detail />,
          },
          {
            path: '/detail/longterm',
            element: <Detail />,
          },
          {
            path: '/detail/depreciation',
            element: <Detail />,
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
            path: '/detail/shortbrrow',
            element: <Detail />,
          },
          {
            path: '/detail/bill-pay',
            element: <Detail />,
          },
          {
            path: '/detail/account-pay',
            element: <Detail />,
          },
          {
            path: '/detail/account-receive',
            element: <Detail />,
          },
          {
            path: '/detail/wages-pay',
            element: <Detail />,
          },
          {
            path: '/detail/expense-sell',
            element: <Detail />,
          },
          {
            path: '/detail/expense-manage',
            element: <Detail />,
          },
          {
            path: '/detail/expense-develop',
            element: <Detail />,
          },
          {
            path: '/detail/expense-exp',
            element: <Detail />,
          },
          {
            path: '/detail/taxes',
            element: <DetailTaxes />,
          },
          {
            path: '/detail/taxes/addtaxin',
            element: <DetailAddTax />,
          },
          {
            path: '/detail/taxes/addtaxin-jy',
            element: <DetailAddTax />,
          },
          {
            path: '/detail/taxes/addtaxout',
            element: <DetailAddTax />,
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
