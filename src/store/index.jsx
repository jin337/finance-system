import { configureStore } from '@reduxjs/toolkit'
import commonReducer from './reducers/common'
import homeReducer from './reducers/home'

export const store = configureStore({
  reducer: {
    commonReducer,
    homeReducer,
  },
})
