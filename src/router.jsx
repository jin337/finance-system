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

import TemplateOne from 'src/pages/Detail/TemplateOne'

import DetailStock from 'src/pages/Detail/Stock'
import DetailStockIn from 'src/pages/Detail/Stock/StockIn'
import DetailStockOut from 'src/pages/Detail/Stock/StockOut'

import Taxes from 'src/pages/Detail/Taxes'
import AddTax from 'src/pages/Detail/Taxes/AddTax'

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
            path: '/detail/bill-receive',
            element: <TemplateOne />,
          },
          {
            path: '/detail/account-receive',
            element: <TemplateOne />,
          },
          {
            path: '/detail/ohter-receive',
            element: <TemplateOne />,
          },
          {
            path: '/detail/prepay',
            element: <TemplateOne />,
          },
          {
            path: '/detail/longterm',
            element: <TemplateOne />,
          },
          {
            path: '/detail/depreciation',
            element: <TemplateOne />,
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
            element: <TemplateOne />,
          },
          {
            path: '/detail/bill-pay',
            element: <TemplateOne />,
          },
          {
            path: '/detail/account-pay',
            element: <TemplateOne />,
          },
          {
            path: '/detail/account-receive',
            element: <TemplateOne />,
          },
          {
            path: '/detail/wages-pay',
            element: <TemplateOne />,
          },
          {
            path: '/detail/expense-sell',
            element: <TemplateOne />,
          },
          {
            path: '/detail/expense-manage',
            element: <TemplateOne />,
          },
          {
            path: '/detail/expense-develop',
            element: <TemplateOne />,
          },
          {
            path: '/detail/expense-exp',
            element: <TemplateOne />,
          },
          {
            path: '/detail/taxes',
            element: <Taxes />,
          },
          {
            path: '/detail/taxes/addtaxin',
            element: <AddTax />,
          },
          {
            path: '/detail/taxes/addtaxin-jy',
            element: <AddTax />,
          },
          {
            path: '/detail/taxes/addtaxout',
            element: <AddTax />,
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
