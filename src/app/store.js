import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import settingReducer from "../features/setting/settingSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        setting: settingReducer,
    },
});