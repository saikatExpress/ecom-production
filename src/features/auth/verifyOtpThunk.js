export const verifyOtp = createAsyncThunk(
    "auth/verifyOtp",

    async (data, thunkAPI) => {
        try {
            const response = await postData("/auth/verify-otp",data);

            return response;

        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data
            );
        }
    }
);