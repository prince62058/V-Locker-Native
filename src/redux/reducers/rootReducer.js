import { combineReducers } from "@reduxjs/toolkit"
import authReducers from '../slices/auth/authSlice'
import homeReducers from '../slices/main/homeSlice'
import customerReducers from '../slices/main/customerSlice'
import feedbackReducers from '../slices/main/feedbackSlice'
import kycReducers from '../slices/main/kycSlice'
import bankReducers from '../slices/main/bankSlice'
import installationReducers from '../slices/main/installationSlice'
import businessReducers from '../slices/main/businessSlice'
import loanReducers from '../slices/main/loanSlice'
import keyReducers from '../slices/main/keySlice'
import notificationReducers from '../slices/main/notificationSlice'

const rootReducer = combineReducers({
    auth: authReducers,
    home: homeReducers,
    customer: customerReducers,
    feedback: feedbackReducers,
    kyc: kycReducers,
    bank: bankReducers,
    installation: installationReducers,
    business: businessReducers,
    loan: loanReducers,
    keys: keyReducers,
    notification: notificationReducers,
})

export default rootReducer