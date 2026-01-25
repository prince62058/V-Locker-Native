import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { putApi, putMediaApi } from '../../../services/axios/api'
import { showToast } from "../../../utils/ToastAndroid"
import { getCustomerProfileThunk } from "./customerSlice"

export const updateAadharThunk = createAsyncThunk(
    "kyc/updateAadharThunk",
    async ({ customerId, data }, { dispatch, rejectWithValue }) => {
        try {
            const response = await putMediaApi(`customers/${customerId}/kyc/aadhaar`, data)
            console.log("customer update aadhar api response --->", response.data)
            dispatch(getCustomerProfileThunk({ customerId }))
            return response.data
        } catch (error) {
            showToast(error)
            return rejectWithValue(error)
        }
    }
)

export const updatePanThunk = createAsyncThunk(
    "kyc/updatePanThunk",
    async ({ customerId, data }, { dispatch, rejectWithValue }) => {
        try {
            const response = await putMediaApi(`customers/${customerId}/kyc/pan`, data)
            console.log("customer update PAN api response --->", response.data)
            dispatch(getCustomerProfileThunk({ customerId }))
            return response.data
        } catch (error) {
            showToast(error)
            return rejectWithValue(error)
        }
    }
)

export const updatePassbookThunk = createAsyncThunk(
    "kyc/updatePassbookThunk",
    async ({ customerId, data }, { dispatch, rejectWithValue }) => {
        try {
            const response = await putMediaApi(`customers/${customerId}/kyc/bankpassbook`, data)
            console.log("customer update passbook api response --->", response.data)
            dispatch(getCustomerProfileThunk({ customerId }))
            return response.data
        } catch (error) {
            showToast(error)
            return rejectWithValue(error)
        }
    }
)

export const updateAddressThunk = createAsyncThunk(
    "kyc/updateAddressThunk",
    async ({ customerId, data }, { dispatch, rejectWithValue }) => {
        try {
            const response = await putApi(`address/${customerId}`, data)
            console.log("customer update address api response --->", response.data)
            dispatch(getCustomerProfileThunk({ customerId }))
            return response.data
        } catch (error) {
            showToast(error)
            return rejectWithValue(error)
        }
    }
)

const kycSlice = createSlice({
    name: "kycSlice",
    initialState: {
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(updateAadharThunk.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateAadharThunk.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(updateAadharThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            .addCase(updatePanThunk.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updatePanThunk.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(updatePanThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            .addCase(updatePassbookThunk.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updatePassbookThunk.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(updatePassbookThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            .addCase(updateAddressThunk.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateAddressThunk.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(updateAddressThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    }
})

export default kycSlice.reducer
