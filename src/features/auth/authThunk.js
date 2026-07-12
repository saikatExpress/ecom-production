import { createAsyncThunk } from "@reduxjs/toolkit";
import { postData } from "../../services/request";

export const loginUser = createAsyncThunk(
    "auth/login",

    async (credentials, thunkAPI) => {
        try {
            const response = await postData("/auth/login",credentials);

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