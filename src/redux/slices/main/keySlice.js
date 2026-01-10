import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { deleteApi, getApi, postApi, putApi } from '../../../services/axios/api'
import { showToast } from "../../../utils/ToastAndroid"

// -------------------- Thunks --------------------

// ✅ Get all keys
export const getKeyListThunk = createAsyncThunk(
    'keys/getKeyListThunk',
    async ({ isRefresh = false, page = 1, search = '', limit = 10, filter = '' } = {}, { rejectWithValue }) => {
        const params = { page, limit, search, filter }
        try {
            const response = await getApi('keys', { params })
            // console.log('All keys API response --->', response.data?.pagination, page)
            const { data, pagination } = response.data || {}
            return { data, pagination }
        } catch (error) {
            showToast(error)
            return rejectWithValue(error)
        }
    }
)

// ✅ Get single key details
export const getKeyDetailsThunk = createAsyncThunk(
    'keys/getKeyDetailsThunk',
    async ({ keyId }, { rejectWithValue }) => {
        try {
            const response = await getApi(`keys/${keyId}`)
            const key = response.data?.data ?? null
            return key
        } catch (error) {
            showToast(error)
            return rejectWithValue(error)
        }
    }
)

// ✅ Update key
export const updateKeyThunk = createAsyncThunk(
    'keys/updateKeyThunk',
    async ({ id, data }, { dispatch, rejectWithValue }) => {
        try {
            const response = await putApi(`keys/${id}`, data)
            const updated = response.data?.data ?? response.data
            // refresh list and details
            dispatch(getKeyListThunk({}))
            dispatch(getKeyDetailsThunk({ keyId: id }))
            return updated
        } catch (error) {
            showToast(error)
            return rejectWithValue(error)
        }
    }
)

// ✅ Delete key
export const deleteKeyThunk = createAsyncThunk(
    'keys/deleteKeyThunk',
    async ({ id }, { dispatch, rejectWithValue }) => {
        try {
            const response = await deleteApi(`keys/${id}`)
            showToast('Key deleted')
            dispatch(getKeyListThunk({}))
            return id
        } catch (error) {
            showToast(error)
            return rejectWithValue(error)
        }
    }
)

// ✅ Create new key
export const createKeyRecordThunk = createAsyncThunk(
    'keys/createKeyRecordThunk',
    async ({ data }, { dispatch, rejectWithValue }) => {
        try {
            const response = await postApi('keys', data)
            console.log('Request keys api response ---> ', response.data)
            dispatch(getKeyListThunk({}))
            return response.data?.data
        } catch (error) {
            showToast(error)
            return rejectWithValue(error)
        }
    }
)

// -------------------- Slice --------------------

const keySlice = createSlice({
    name: 'keySlice',
    initialState: {
        loading: {
            loading: false,
            refreshing: false,
            pagination: false,
            search: false,
            filter: false
        },
        error: null,

        keyData: null,
        pagination: null,

        keyDetails: null,

        searchData: null,
        searchPagination: null
    },
    reducers: {
        clearSearch(state) {
            state.searchData = null
            state.searchPagination = null
        },
        clearKeyDetails(state) {
            state.keyDetails = null
        }
    },
    extraReducers: (builder) => {
        builder
            // ---- getKeyListThunk ----
            .addCase(getKeyListThunk.pending, (state, action) => {
                const { isRefresh, page, search, filter } = action.meta.arg || {}
                state.error = null
                state.loading = {
                    loading: false,
                    refreshing: false,
                    pagination: false,
                    search: false,
                    filter: false,
                }

                if (isRefresh) state.loading.refreshing = true
                else if (page > 1) state.loading.pagination = true
                else if (search && search.trim().length > 0) state.loading.search = true
                else if (filter && filter.trim().length > 0) state.loading.filter = true
                else state.loading.loading = true

                if (!search || search.trim() === '') {
                    state.searchData = null
                    state.searchPagination = null
                }
            })

            .addCase(getKeyListThunk.fulfilled, (state, action) => {
                const { page, search } = action.meta.arg || {}
                state.loading = {
                    loading: false,
                    refreshing: false,
                    pagination: false,
                    search: false,
                    filter: false,
                }

                const newData = action.payload?.data ?? []
                const pagination = action.payload?.pagination ?? {}
                // console.log('Pagination ', pagination, page)

                if (search && search.trim().length > 0) {
                    if (page && page > 1 && Array.isArray(state.searchData)) {
                        state.searchData = [...state.searchData, ...newData]
                    } else {
                        state.searchData = Array.isArray(newData) ? newData : []
                    }
                    state.searchPagination = pagination
                } else {
                    // console.log('else run ')
                    if (page && page > 1 && Array.isArray(state.keyData)) {
                        state.keyData = [...state.keyData, ...newData]
                    } else {
                        state.keyData = Array.isArray(newData) ? newData : []
                    }
                    state.pagination = pagination
                }
            })

            .addCase(getKeyListThunk.rejected, (state, action) => {
                state.loading = {
                    loading: false,
                    refreshing: false,
                    pagination: false,
                    search: false,
                    filter: false,
                }
                state.error = action.payload
            })

            // ---- getKeyDetailsThunk ----
            .addCase(getKeyDetailsThunk.pending, (state) => {
                state.loading.loading = true
                state.error = null
            })
            .addCase(getKeyDetailsThunk.fulfilled, (state, action) => {
                state.loading.loading = false
                state.keyDetails = action.payload ?? null
            })
            .addCase(getKeyDetailsThunk.rejected, (state, action) => {
                state.loading.loading = false
                state.error = action.payload
            })

            // ---- updateKeyThunk ----
            .addCase(updateKeyThunk.pending, (state) => {
                state.loading.loading = true
                state.error = null
            })
            .addCase(updateKeyThunk.fulfilled, (state) => {
                state.loading.loading = false
            })
            .addCase(updateKeyThunk.rejected, (state, action) => {
                state.loading.loading = false
                state.error = action.payload
            })

            // ---- deleteKeyThunk ----
            .addCase(deleteKeyThunk.pending, (state) => {
                state.loading.loading = true
                state.error = null
            })
            .addCase(deleteKeyThunk.fulfilled, (state, action) => {
                state.loading.loading = false
                const removedId = action.payload
                if (removedId) {
                    if (Array.isArray(state.keyData)) {
                        state.keyData = state.keyData.filter(item => item?._id !== removedId)
                    }
                    if (Array.isArray(state.searchData)) {
                        state.searchData = state.searchData.filter(item => item?._id !== removedId)
                    }
                }
            })
            .addCase(deleteKeyThunk.rejected, (state, action) => {
                state.loading.loading = false
                state.error = action.payload
            })

            // ---- createKeyRecordThunk ----
            .addCase(createKeyRecordThunk.pending, (state) => {
                state.loading.loading = true
                state.error = null
            })
            .addCase(createKeyRecordThunk.fulfilled, (state) => {
                state.loading.loading = false
            })
            .addCase(createKeyRecordThunk.rejected, (state, action) => {
                state.loading.loading = false
                state.error = action.payload
            })
    }
})

export const { clearSearch, clearKeyDetails } = keySlice.actions
export default keySlice.reducer
