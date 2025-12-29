import { createSlice } from '@reduxjs/toolkit'

export const home = createSlice({
  name: 'home',
  initialState: {
    menuList: [],
    menuSelect: {},
  },
  reducers: {
    setMenuList: (state, action) => {
      state.menuList = action.payload
    },
    setMenuSelect: (state, action) => {
      state.menuSelect = action.payload
    },
  },
})

export const { setMenuSelect, setMenuList } = home.actions
export default home.reducer
