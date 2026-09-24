import { createSlice } from "@reduxjs/toolkit";
import { fetchAllSettings } from "./settingThunk";

const initialState = {
    data: {}, // Flat key-value pairs (e.g. data.site_name)
    raw: {},  // Raw grouped data from API
    loading: false,
    error: null,
};

const settingSlice = createSlice({
    name: "setting",
    initialState,
    reducers: {
        // Fallback or manual update if needed
        setSettings: (state, action) => {
            state.data = { ...state.data, ...action.payload };
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllSettings.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.success && action.payload?.data) {
                    state.raw = action.payload.data;
                    
                    // Flatten groups into a single key-value object
                    const flattened = {};
                    Object.values(action.payload.data).forEach(groupArray => {
                        if (Array.isArray(groupArray)) {
                            groupArray.forEach(item => {
                                flattened[item.setting_key] = item.value;
                            });
                        }
                    });
                    
                    state.data = flattened;
                }
            })
            .addCase(fetchAllSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch settings";
            });
    },
});

export const { setSettings } = settingSlice.actions;
export default settingSlice.reducer;
