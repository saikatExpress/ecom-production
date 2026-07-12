import { createAsyncThunk } from "@reduxjs/toolkit";
import { postData } from "../../services/request";

export const resendOtp = createAsyncThunk(
    "auth/resendOtp",

    async (formData, thunkAPI) => {

        try {

            const response = await postData("/auth/resend-otp",formData);

            return response;

        } catch (error) {

            return thunkAPI.rejectWithValue(
                error.response?.data ?? {
                    success: false,
                    message: "Something went wrong",
                }
            );

        }

    }
);