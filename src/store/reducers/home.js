import { createSlice } from '@reduxjs/toolkit'

export const home = createSlice({
  name: 'home',
  initialState: {
    menuList: [],
    menuSelect: {},
    visibleVoucher: false,
  },
  reducers: {
    setMenuList: (state, action) => {
      state.menuList = action.payload
    },
    setMenuSelect: (state, action) => {
      state.menuSelect = action.payload
    },
    setCloseVoucherDetail: (state, action) => {
      state.visibleVoucher = action.payload
    },
  },
})

export const { setMenuSelect, setMenuList, setCloseVoucherDetail } = home.actions
export default home.reducer
