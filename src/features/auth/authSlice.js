import { createSlice } from "@reduxjs/toolkit";

import { loginUser } from "./authThunk";
import { getMe } from "./meThunk";
import { verifyOtp } from "./verifyOtpThunk";


const saveAuth = (state, user) => {

    if (!user) {
        return;
    }


    state.user = {
        id          : user.id,
        username    : user.username,
        email       : user.email,
        phone_number: user.phone_number,
        image       : user.image,
        status      : user.status,
    };


    // Login response এ token থাকবে
    // Me response এ token null থাকবে
    if (user.token?.plainTextToken) {

        state.token = user.token.plainTextToken;

        localStorage.setItem(
            "access_token",
            user.token.plainTextToken
        );

    }


    state.roles = user.roles ?? [];

    state.permissions = user.permissions ?? [];

    state.isAuthenticated = true;

    state.loading = false;

    state.error = null;

};



const clearAuth = (state) => {

    state.user = null;

    state.token = null;

    state.roles = [];

    state.permissions = [];

    state.isAuthenticated = false;

    state.loading = false;

    state.error = null;


    localStorage.removeItem(
        "access_token"
    );

};



const initialState = {

    user: null,

    token: null,

    roles: [],

    permissions: [],

    loading: false,

    isAuthenticated: false,

    authChecked: false,

    error: null,

};



const authSlice = createSlice({

    name: "auth",

    initialState,


    reducers: {


        logout(state) {

            clearAuth(state);

        },


        authInitialized(state) {

            state.authChecked = true;

        },


    },


    extraReducers: (builder) => {


        builder


        // =========================
        // LOGIN
        // =========================

        .addCase(loginUser.pending, (state) => {

            state.loading = true;

            state.error = null;

        })


        .addCase(loginUser.fulfilled, (state, action) => {


            state.loading = false;


            /*
                Login response:

                {
                    otp_required:true
                }

                হলে user login complete হয়নি,
                তাই auth save করবো না।
            */

            if(action.payload.data?.otp_required){

                return;

            }


            saveAuth(
                state,
                action.payload.data
            );


        })


        .addCase(loginUser.rejected, (state, action) => {


            state.loading = false;

            state.error = action.payload;

            state.isAuthenticated = false;


        })



        // =========================
        // VERIFY OTP
        // =========================


        .addCase(verifyOtp.pending, (state)=>{

            state.loading = true;

            state.error = null;

        })


        .addCase(verifyOtp.fulfilled, (state, action)=>{


            saveAuth(
                state,
                action.payload.data
            );


        })


        .addCase(verifyOtp.rejected,(state, action)=>{


            state.loading = false;

            state.error = action.payload;

            state.isAuthenticated = false;


        })



        // =========================
        // GET ME
        // =========================


        .addCase(getMe.pending,(state)=>{

            state.loading = true;

        })


        .addCase(getMe.fulfilled,(state, action)=>{


            saveAuth(
                state,
                action.payload.data
            );


            state.authChecked = true;


        })


        .addCase(getMe.rejected,(state)=>{


            clearAuth(state);


            state.authChecked = true;


        });


    },


});


export const {
    logout,
    authInitialized

} = authSlice.actions;


export default authSlice.reducer;