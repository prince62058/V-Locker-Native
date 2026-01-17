import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  deleteApi,
  getApi,
  postApi,
  putApi,
  putMediaApi,
  postMediaApi,
} from '../../../services/axios/api';
import { showToast } from '../../../utils/ToastAndroid';
import { getHomeThunk } from './homeSlice';

export const getCustomerThunk = createAsyncThunk(
  'customer/getCustomerThunk',
  async (
    { isRefresh = false, page = 1, search = '', limit = 10, filter = '' },
    { rejectWithValue },
  ) => {
    const params = {
      page,
      limit,
      search,
      filter,
    };
    try {
      const response = await getApi('customers', { params });
      console.log('customers api response --->', response.data);
      const { data, pagination, ...rest } = response.data;
      return { data, pagination };
    } catch (error) {
      showToast(error);
      rejectWithValue(error);
    }
  },
);

export const getCustomerProfileThunk = createAsyncThunk(
  'customer/getCustomerProfileThunk',
  async ({ customerId }, { rejectWithValue }) => {
    try {
      const response = await getApi(`customers/${customerId}`);
      console.log('customers profile api response --->', response.data);
      return response.data?.data;
    } catch (error) {
      showToast(error);
      rejectWithValue(error);
    }
  },
);

export const sendCustomerOtpThunk = createAsyncThunk(
  'customer/sendCustomerOtpThunk',
  async (data, { rejectWithValue }) => {
    try {
      const response = await postApi(`customers/send-otp`, data);
      console.log('send otp api response --->', response.data);
      showToast('OTP sent successfully');
      return response.data;
    } catch (error) {
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const verifyCustomerOtpThunk = createAsyncThunk(
  'customer/verifyCustomerOtpThunk',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postApi(`customers/verify-and-create`, data);
      console.log('verify otp api response --->', response.data);
      showToast('Customer created successfully');
      dispatch(getCustomerThunk({}));
      return response.data?.data;
    } catch (error) {
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const createCustomerThunk = createAsyncThunk(
  'customer/createCustomerThunk',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const { profileUrl, ...restData } = data;
      const response = await postApi(`customers/register`, restData);
      console.log('customers create api response --->', response.data);

      if (response.data?.customer?._id && profileUrl) {
        await putMediaApi(`customers/${response.data.customer._id}`, {
          profileUrl,
        });
      }

      dispatch(getCustomerThunk({}));
      return response.data?.customer;
    } catch (error) {
      showToast(error);
      rejectWithValue(error);
    }
  },
);

export const updateCustomerThunk = createAsyncThunk(
  'customer/updateCustomerThunk',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await putMediaApi(`customers/${id}`, data);
      console.log('customer update api response --->', response.data);
      dispatch(getCustomerProfileThunk({ customerId: id }));
      dispatch(getCustomerThunk({}));
      return response.data?.customer;
    } catch (error) {
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const deleteCustomerThunk = createAsyncThunk(
  'customer/deleteCustomerThunk',
  async ({ id }, { dispatch, rejectWithValue }) => {
    try {
      const response = await deleteApi(`customers/${id}`);
      console.log('customer delete api response --->', response.data);
      showToast('Customer deleted');
      // dispatch(getCustomerThunk({})); // [MODIFIED] Removed to rely on optimistic update
      return id; // returning id to remove from UI list if needed
    } catch (error) {
      showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const createLoanThunk = createAsyncThunk(
  'customer/createLoanThunk',
  async ({ customerId, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await postApi(`customerLoan/${customerId}`, data);
      console.log('customer loan api response --->', response.data);
      dispatch(getCustomerThunk({}));
      dispatch(getCustomerProfileThunk({ customerId }));
      dispatch(getHomeThunk());
      return customerId; // returning id to remove from UI list if needed
    } catch (error) {
      showToast(error);
      console.log('loan create error ', error);
      return rejectWithValue(error);
    }
  },
);

const customerSlice = createSlice({
  name: 'customerSlice',
  initialState: {
    loading: {
      loading: false,
      refreshing: false,
      pagination: false,
      search: false,
      filter: false,
    },
    error: null,
    customerData: null,
    pagination: null,
    customerProfile: null,

    searchData: null,
    searchPagination: null,
  },
  reducers: {
    clearSearch(state) {
      state.searchData = null;
      state.searchPagination = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getCustomerThunk.pending, (state, action) => {
        const { isRefresh, page, search, filter } = action.meta.arg;
        state.error = null;
        state.loading = {
          loading: false,
          refreshing: false,
          pagination: false,
          search: false,
          filter: false,
        };

        if (isRefresh) {
          state.loading.refreshing = true;
        } else if (page > 1) {
          state.loading.pagination = true;
        } else if (search && search.trim().length > 0) {
          state.loading.search = true;
        } else if (filter && filter.trim().length > 0) {
          state.loading.filter = true;
        } else {
          state.loading.loading = true;
        }
      })

      .addCase(getCustomerThunk.fulfilled, (state, action) => {
        const { page, search } = action.meta.arg;

        state.loading = {
          loading: false,
          refreshing: false,
          pagination: false,
          search: false,
          filter: false,
        };
        const newData = action.payload?.data || [];
        const pagination = action.payload?.pagination || {};

        // if (page && page > 1) {
        //     state.customerData = [...state.customerData, ...newData]
        // } else {
        //     state.customerData = newData
        // }
        // state.pagination = pagination;

        // ✅ if a search keyword exists, manage searchData separately
        if (search && search.trim().length > 0) {
          if (page && page > 1 && Array.isArray(state.searchData)) {
            state.searchData = [...state.searchData, ...newData];
          } else {
            state.searchData = Array.isArray(newData) ? newData : [];
          }
          state.searchPagination = pagination;
        }
        // ✅ otherwise, manage normal customerData
        else {
          if (page && page > 1 && Array.isArray(state.customerData)) {
            state.customerData = [...state.customerData, ...newData];
          } else {
            state.customerData = Array.isArray(newData) ? newData : [];
          }
          state.pagination = pagination;
        }
      })

      .addCase(getCustomerThunk.rejected, (state, action) => {
        state.loading = {
          loading: false,
          refreshing: false,
          pagination: false,
          search: false,
          filter: false,
        };

        state.error = action.payload;
      })
      .addCase(sendCustomerOtpThunk.pending, (state, action) => {
        state.loading.loading = true;
        state.error = null;
      })
      .addCase(sendCustomerOtpThunk.fulfilled, (state, action) => {
        state.loading.loading = false;
      })
      .addCase(sendCustomerOtpThunk.rejected, (state, action) => {
        state.loading.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyCustomerOtpThunk.pending, (state, action) => {
        state.loading.loading = true;
        state.error = null;
      })
      .addCase(verifyCustomerOtpThunk.fulfilled, (state, action) => {
        state.loading.loading = false;
      })
      .addCase(verifyCustomerOtpThunk.rejected, (state, action) => {
        state.loading.loading = false;
        state.error = action.payload;
      })
      .addCase(getCustomerProfileThunk.pending, (state, action) => {
        state.loading.loading = true;
        state.error = null;
      })
      .addCase(getCustomerProfileThunk.fulfilled, (state, action) => {
        state.loading.loading = false;
        state.customerProfile = action.payload;
      })
      .addCase(getCustomerProfileThunk.rejected, (state, action) => {
        state.loading.loading = false;
        state.error = action.payload;
      })
      .addCase(createCustomerThunk.pending, (state, action) => {
        state.loading.loading = true;
        state.error = null;
      })
      .addCase(createCustomerThunk.fulfilled, (state, action) => {
        state.loading.loading = false;
      })
      .addCase(createCustomerThunk.rejected, (state, action) => {
        state.loading.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCustomerThunk.pending, state => {
        state.loading.loading = true;
        state.error = null;
      })
      .addCase(updateCustomerThunk.fulfilled, state => {
        state.loading.loading = false;
      })
      .addCase(updateCustomerThunk.rejected, (state, action) => {
        state.loading.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCustomerThunk.pending, state => {
        state.loading.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomerThunk.fulfilled, (state, action) => {
        state.loading.loading = false;
        const deletedId = String(action.payload);
        if (Array.isArray(state.customerData)) {
          state.customerData = state.customerData.filter(
            item => String(item._id) !== deletedId,
          );
        }
        if (Array.isArray(state.searchData)) {
          state.searchData = state.searchData.filter(
            item => String(item._id) !== deletedId,
          );
        }
      })
      .addCase(deleteCustomerThunk.rejected, (state, action) => {
        state.loading.loading = false;
        state.error = action.payload;
      })
      .addCase(createLoanThunk.pending, state => {
        state.loading.loading = true;
        state.error = null;
      })
      .addCase(createLoanThunk.fulfilled, state => {
        state.loading.loading = false;
      })
      .addCase(createLoanThunk.rejected, (state, action) => {
        state.loading.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSearch } = customerSlice.actions;
export default customerSlice.reducer;
