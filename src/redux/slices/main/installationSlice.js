import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getApi } from "../../../services/axios/api";
import { showToast } from "../../../utils/ToastAndroid";

export const getVideosThunk = createAsyncThunk(
    "installation/getVideosThunk",
    async ({ isRefresh = false }, { rejectWithValue }) => {
        try {
            const response = await getApi("upload");
            console.log("Installation video API response --->", response.data);
            return response.data;
        } catch (error) {
            showToast(error);
            return rejectWithValue(error);
        }
    }
);

const installationSlice = createSlice({
    name: "installationSlice",
    initialState: {
        loading: false,
        refreshing: false,
        error: null,
        videosData: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getVideosThunk.pending, (state, action) => {
                const { isRefresh } = action.meta.arg;
                if (isRefresh) {
                    state.refreshing = true;
                } else {
                    state.loading = true;
                }
                state.error = null;
            })
            .addCase(getVideosThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.refreshing = false;
                state.videosData = action.payload;
            })
            .addCase(getVideosThunk.rejected, (state, action) => {
                state.loading = false;
                state.refreshing = false;
                state.error = action.payload;
            });
    },
});

export default installationSlice.reducer;
