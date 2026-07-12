import { createSlice } from "@reduxjs/toolkit";
import { loginUser } from "./authThunk";
import { verifyOtp } from "./verifyOtpThunk";

const initialState = {
    user: null,
    token: null,
    role: null,
    permissions: [],
    loading: false,
    isAuthenticated: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {

        logout(state) {

            state.user = null;
            state.token = null;
            state.role = null;
            state.permissions = [];
            state.loading = false;
            state.isAuthenticated = false;
            state.error = null;

            localStorage.removeItem("access_token");

        },

    },

    extraReducers: (builder) => {

        builder

            .addCase(loginUser.pending, (state) => {

                state.loading = true;
                state.error = null;

            })

            .addCase(loginUser.fulfilled, (state, action) => {

                state.loading = false;

                if (action.payload.data?.otp_required) {
                    return;
                }

                const user = action.payload.data;

                state.user = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    phone_number: user.phone_number,
                    image: user.image,
                    status: user.status,
                };

                state.token = user.token.plainTextToken;
                state.role = user.role;
                state.permissions = user.permissions;
                state.isAuthenticated = true;

                localStorage.setItem(
                    "access_token",
                    user.token.plainTextToken
                );

            })

            .addCase(loginUser.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;

            })

            .addCase(verifyOtp.pending, (state) => {

                state.loading = true;
                state.error = null;

            })

            .addCase(verifyOtp.fulfilled, (state, action) => {

                state.loading = false;
                const user = action.payload.data;

                state.user = {
                    id          : user.id,
                    username    : user.username,
                    email       : user.email,
                    phone_number: user.phone_number,
                    image       : user.image,
                    status      : user.status,
                };

                state.token = user.token.plainTextToken;
                state.role = user.role;
                state.permissions = user.permissions;
                state.isAuthenticated = true;

                localStorage.setItem(
                    "access_token",
                    user.token.plainTextToken
                );

            })

            .addCase(verifyOtp.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;

            })

    },

});

export const { logout } = authSlice.actions;

export default authSlice.reducer;