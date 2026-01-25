import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getApi } from '../../../services/axios/api'
import { showToast } from "../../../utils/ToastAndroid"

// STATUS - DONE , [IN USE]
export const getNotificationListThunk = createAsyncThunk(
    'notification/getNotificationListThunk',
    async ({ isRefresh = false, page = 1, search = '', limit = 20, filter = '' } = {}, { rejectWithValue }) => {
        const params = { page, limit, search, filter }
        try {
            const response = await getApi('notification', { params })
            console.log('Notification all list api response ---> ', response.data)
            const { data, pagination } = response.data || {}
            return { data, pagination }
        } catch (error) {
            showToast(error)
            return rejectWithValue(error)
        }
    }
)

// STATUS - DONE , [IN USE]
export const getItemDetailsThunk = createAsyncThunk(
    'notification/getItemDetailsThunk',
    async ({ notificationId }, { rejectWithValue }) => {
        try {
            const response = await getApi(`notification/${notificationId}`)
            console.log('Notification detail api response ---> ', response.data)
            return response.data?.data ?? null
        } catch (error) {
            showToast(error)
            return rejectWithValue(error)
        }
    }
)

const notificationSlice = createSlice({
    name: 'notification',
    initialState: {
        loading: {
            loading: false,
            refreshing: false,
            pagination: false,
            search: false,
            filter: false
        },
        error: null,

        listData: [],             // array for list (paged)
        pagination: null,           // pagination object for list

        // itemDetails is now an object map keyed by id: { id1: {...}, id2: {...} }
        itemDetails: {},

        searchData: null,           // search results
        searchPagination: null      // search pagination
    },
    reducers: {
        // Clear search results completely
        clearSearch(state) {
            state.searchData = null
            state.searchPagination = null
        },

        // Clear a specific item detail by id:
        // dispatch(clearItemDetailById('abc123'))
        clearItemDetailById(state, action) {
            const id = action.payload
            if (id && state.itemDetails && state.itemDetails[id]) {
                delete state.itemDetails[id]
            }
        },

        // Clear all cached item details
        clearAllItemDetails(state) {
            state.itemDetails = {}
        }
    },
    extraReducers: (builder) => {
        builder
            // ---- getNotificationListThunk ----
            .addCase(getNotificationListThunk.pending, (state, action) => {
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

                // reset search lists when there is no search query
                if (!search || search.trim() === '') {
                    state.searchData = null
                    state.searchPagination = null
                }
            })

            .addCase(getNotificationListThunk.fulfilled, (state, action) => {
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

                if (search && search.trim().length > 0) {
                    if (page && page > 1 && Array.isArray(state.searchData)) {
                        state.searchData = [...state.searchData, ...newData]
                    } else {
                        state.searchData = Array.isArray(newData) ? newData : []
                    }
                    state.searchPagination = pagination
                } else {
                    if (page && page > 1 && Array.isArray(state.listData)) {
                        state.listData = [...state.listData, ...newData]
                    } else {
                        state.listData = Array.isArray(newData) ? newData : []
                    }
                    state.pagination = pagination
                }
            })

            .addCase(getNotificationListThunk.rejected, (state, action) => {
                state.loading = {
                    loading: false,
                    refreshing: false,
                    pagination: false,
                    search: false,
                    filter: false,
                }
                state.error = action.payload
            })

            // ---- getItemDetailsThunk ----
            .addCase(getItemDetailsThunk.pending, (state) => {
                state.loading.loading = true
                state.error = null
            })
            .addCase(getItemDetailsThunk.fulfilled, (state, action) => {
                state.loading.loading = false
                const payload = action.payload

                const idFromPayload = payload?._id ?? payload?.id
                const idFromArg = action.meta.arg?.notificationId
                const id = idFromPayload ?? idFromArg

                if (!id) {
                    return
                }

                state.itemDetails[id] = payload
                if (Array.isArray(state.listData) && state.listData.length > 0) {
                    const index = state.listData.findIndex(item => item?._id === id)
                    if (index !== -1) {
                        // Replace with the new object
                        state.listData[index] = payload
                    }
                }
            })
            .addCase(getItemDetailsThunk.rejected, (state, action) => {
                state.loading.loading = false
                state.error = action.payload
            })
    }
})

export const {
    clearSearch,
    clearItemDetailById,
    clearAllItemDetails
} = notificationSlice.actions
export default notificationSlice.reducer
