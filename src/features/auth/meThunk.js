import { createAsyncThunk } from "@reduxjs/toolkit";
import { getData } from "../../services/request";

export const getMe = createAsyncThunk(
    "auth/me",

    async (_, thunkAPI) => {

        try {

            const response = await getData("/auth/me");

            return response;

        } catch (error) {

            return thunkAPI.rejectWithValue(
                error.response?.data ?? {
                    success: false,
                    message: "Unauthorized",
                }
            );

        }

    }
);