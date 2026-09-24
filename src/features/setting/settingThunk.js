import { createAsyncThunk } from "@reduxjs/toolkit";
import { getDatas } from "../../services/request";

export const fetchAllSettings = createAsyncThunk(
    "setting/fetchAll",
    async (_, thunkAPI) => {
        try {
            // Calling without group_name to fetch all settings
            const response = await getDatas("/admin/setting");
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data ?? {
                    success: false,
                    message: "Failed to fetch settings",
                }
            );
        }
    }
);
