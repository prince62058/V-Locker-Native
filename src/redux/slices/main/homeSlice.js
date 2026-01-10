import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {getApi} from '../../../services/axios/api'
import { showToast } from "../../../utils/ToastAndroid";

export const getHomeThunk = createAsyncThunk(
    'home/getHomeThunk',
    async(_,{rejectWithValue})=>{
        try {
            const response = await getApi('home')
            console.log('Home api response --->', response.data)
            return response.data?.data
        } catch (error) {
            showToast(error)
            rejectWithValue(error)
        }
    }
)


const homeSlice = createSlice({
    name:'homeSlice',
    initialState:{
        loading : false ,
        error : null,
        homeData : null
    },
    reducers: {},
    extraReducers: (builder)=>{
        builder
            .addCase(getHomeThunk.pending, (state, action)=>{
                state.loading = true
                state.error = null
            })
            .addCase(getHomeThunk.fulfilled,(state, action)=>{
                state.loading = false
                state.homeData = action.payload
            })
            .addCase(getHomeThunk.rejected,(state, action)=>{
                state.loading = false
                state.error = action.payload
            })
    }
})

export default homeSlice.reducer