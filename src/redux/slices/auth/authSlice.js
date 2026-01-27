import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getApi, postApi, putMediaApi } from '../../../services/axios/api';
import {
  deleteSecureItem,
  setSecureItem,
} from '../../../services/storage/keychain';
import { showToast } from '../../../utils/ToastAndroid';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  token: null,
  user: null,
  company: null,
  stateData: null,
  brandData: null,
  modelData: null,

  loading: false,
  refreshing: false,
  error: null,
};

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await postApi('user/complete-profile', data);
      console.log('Register api Response:', response.data);
      return response?.data?.data;
    } catch (error) {
      // showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (data, { rejectWithValue }) => {
    try {
      const response = await postApi('auth/send-otp', data);
      console.log('OTP Response:', response.data);
      showToast('OTP sent successfully');
      return response?.data?.data;
    } catch (error) {
      // showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (data, { rejectWithValue }) => {
    try {
      const response = await postApi('auth/verify-otp', data);
      console.log('Verify OTP Response:', response.data);
      const { token, ...userData } = response?.data?.data;
      await setSecureItem('USER_TOKEN', token);
      return { token, userData };
    } catch (error) {
      // showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await postApi('auth/login', data);
      console.log('Login API Response:', response.data);
      const { token, ...userData } = response?.data?.data;
      await setSecureItem('USER_TOKEN', token);
      return { token, userData };
    } catch (error) {
      // showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const userProfile = createAsyncThunk(
  'auth/userProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await getApi(`user/${userId}`);
      console.log('User Profile Response:', response.data);
      return response?.data?.data;
    } catch (error) {
      // showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ data }, { rejectWithValue }) => {
    try {
      const response = await putMediaApi(`user`, data);
      console.log('User Profile edit Response:', response.data);
      return response?.data?.data;
    } catch (error) {
      // showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const companyData = createAsyncThunk(
  'auth/companyData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getApi(`company`);
      console.log('Company api response --->', response.data);
      return response?.data?.data;
    } catch (error) {
      // showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const getStateThunk = createAsyncThunk(
  'auth/getStateThunk',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getApi(`states`);
      console.log('State api response --->', response.data);
      return response?.data;
    } catch (error) {
      // showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const saveFCMThunk = createAsyncThunk(
  'auth/saveFCMThunk',
  async (data, { rejectWithValue }) => {
    try {
      const response = await postApi(`user/saveFcmToken`, data);
      console.log('Save fcm api response --->', response.data);
      return response?.data;
    } catch (error) {
      // showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const getMobileBrandThunk = createAsyncThunk(
  'auth/getMobileBrandThunk',
  async ({ page = 1, limit = 100, search = '' }, { rejectWithValue }) => {
    const params = { page, limit, search };
    try {
      const response = await getApi(`mobile-brands`, { params });
      // console.log('Mobile brand api response --->', response.data)
      return response?.data;
    } catch (error) {
      // showToast(error);
      return rejectWithValue(error);
    }
  },
);
export const getMobileModelThunk = createAsyncThunk(
  'auth/getMobileModelThunk',
  async ({ page = 1, limit = 100, search = '' }, { rejectWithValue }) => {
    const params = { page, limit, search };
    try {
      const response = await getApi(`mobile-models`, { params });
      // console.log('Mobile model api response --->', response.data)
      return response?.data;
    } catch (error) {
      // showToast(error);
      return rejectWithValue(error);
    }
  },
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await deleteSecureItem('USER_TOKEN');
      // Keep vlocker_loan_imei for persistent locking after logout
      return true;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutAction(state) {
      state.token = null;
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: builder =>
    builder
      .addCase(logoutThunk.fulfilled, state => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(sendOtp.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
      })
      .addCase(sendOtp.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(verifyOtp.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.userData;
        state.token = payload.token;
      })
      .addCase(verifyOtp.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.userData;
        state.token = payload.token;
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(userProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
      })
      .addCase(updateProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
      })
      .addCase(updateProfile.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(companyData.pending, (state, { payload }) => {
        state.loading = true;
      })
      .addCase(companyData.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.company = payload;
      })
      .addCase(companyData.rejected, (state, { payload }) => {
        state.loading = false;
      })
      .addCase(getStateThunk.pending, (state, { payload }) => {
        state.loading = true;
      })
      .addCase(getStateThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.stateData = payload;
      })
      .addCase(getStateThunk.rejected, (state, { payload }) => {
        state.loading = false;
      })
      .addCase(saveFCMThunk.pending, (state, { payload }) => {
        // state.loading = true
      })
      .addCase(saveFCMThunk.fulfilled, (state, { payload }) => {
        // state.loading = false
        // state.stateData = payload
      })
      .addCase(saveFCMThunk.rejected, (state, { payload }) => {
        // state.loading = false
      })
      .addCase(getMobileBrandThunk.pending, (state, { payload }) => {
        state.loading = true;
      })
      .addCase(getMobileBrandThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.brandData = payload;
      })
      .addCase(getMobileBrandThunk.rejected, (state, { payload }) => {
        state.loading = false;
      })
      .addCase(getMobileModelThunk.pending, (state, { payload }) => {
        state.loading = true;
      })
      .addCase(getMobileModelThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.modelData = payload;
      })
      .addCase(getMobileModelThunk.rejected, (state, { payload }) => {
        state.loading = false;
      }),
});

export const { logoutAction } = authSlice.actions;
export default authSlice.reducer;
