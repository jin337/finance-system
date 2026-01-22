import { createSlice } from '@reduxjs/toolkit'

export const common = createSlice({
  name: 'common',
  initialState: {
    company: [],
    currentCompany: null,
    account: null,
    parmission: null,
    pageHeight: 0,
    isAdmin: 0,
  },
  reducers: {
    setCompany: (state, action) => {
      state.company = action.payload
    },
    setSelectCompany: (state, action) => {
      state.currentCompany = action.payload
    },
    setAccount: (state, action) => {
      state.account = action.payload
      state.isAdmin = action.payload.user_type
    },
    setParmission: (state, action) => {
      state.parmission = action.payload
    },
    setPageHeight: (state, action) => {
      state.pageHeight = action.payload
    },
  },
})

export const { setCompany, setSelectCompany, setAccount, setParmission, setPageHeight } = common.actions
export default common.reducer
