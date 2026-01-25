import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CustomerAddress from '../../screens/main/customer/CustomerAddress';
import CutomerList from '../../screens/main/customer/CutomerList';
import VerifyCustomer from '../../screens/main/customer/VerifyCustomer';
import ViewCustomer from '../../screens/main/customer/ViewCustomer';
import DeviceList from '../../screens/main/devices/DeviceList';
import Aadhar from '../../screens/main/kyc/Aadhar';
import Pan from '../../screens/main/kyc/Pan';
import Passbook from '../../screens/main/kyc/Passbook';
import LoanInfo from '../../screens/main/loan/LoanInfo';
import Notification from '../../screens/main/notification/Notification';
import TabNavigation from '../tab/TabNavigation';
import EditProfile from '../../screens/main/profile/EditProfile';
import BusinessProfile from '../../screens/main/profile/BusinessProfile';
import AppLock from '../../screens/main/profile/AppLock';
import Feedback from '../../screens/main/profile/Feedback';
import BankList from '../../screens/main/bank/BankList';
import AddBank from '../../screens/main/bank/AddBank';
import InstallationVideo from '../../screens/main/profile/InstallationVideo';
import Support from '../../screens/main/profile/Support';
import CustomerQr from '../../screens/main/profile/CustomerQr';
import ExtraFeatures from '../../screens/main/profile/ExtraFeatures';
import LockDevices from '../../screens/main/devices/LockDevices';
import CreateLoan from '../../screens/main/loan/CreateLoan';
import EditBank from '../../screens/main/bank/EditBank';
import BankQRCode from '../../screens/main/bank/BankQRCode';
import EditCustomer from '../../screens/main/customer/EditCustomer';
import RequestKeys from '../../screens/main/keys/RequestKeys';
import AddKeys from '../../screens/main/keys/AddKeys';
import KeysHistory from '../../screens/main/keys/KeysHistory';
import LockScreen from '../../screens/auth/LockScreen';

const Stack = createNativeStackNavigator();

const Main = ({ initialRouteName = 'Tab' }) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false, animation: 'ios_from_right' }}
    >
      <Stack.Screen name="Tab" component={TabNavigation} />
      <Stack.Screen name="DeviceList" component={DeviceList} />

      <Stack.Screen name="CutomerList" component={CutomerList} />
      <Stack.Screen name="VerifyCustomer" component={VerifyCustomer} />
      <Stack.Screen name="ViewCustomer" component={ViewCustomer} />
      <Stack.Screen name="CustomerAddress" component={CustomerAddress} />
      <Stack.Screen name="EditCustomer" component={EditCustomer} />

      <Stack.Screen name="LoanInfo" component={LoanInfo} />
      <Stack.Screen name="Notification" component={Notification} />

      <Stack.Screen name="Aadhar" component={Aadhar} />
      <Stack.Screen name="Pan" component={Pan} />
      <Stack.Screen name="Passbook" component={Passbook} />

      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="BusinessProfile" component={BusinessProfile} />
      <Stack.Screen name="AppLock" component={AppLock} />
      <Stack.Screen name="Feedback" component={Feedback} />

      <Stack.Screen name="BankList" component={BankList} />
      <Stack.Screen name="AddBank" component={AddBank} />
      <Stack.Screen name="EditBank" component={EditBank} />
      <Stack.Screen name="BankQRCode" component={BankQRCode} />

      <Stack.Screen name="InstallationVideo" component={InstallationVideo} />
      <Stack.Screen name="Support" component={Support} />
      <Stack.Screen name="LockScreen" component={LockScreen} />
      <Stack.Screen name="LockDevices" component={LockDevices} />
      <Stack.Screen name="CreateLoan" component={CreateLoan} />

      <Stack.Screen name="RequestKeys" component={RequestKeys} />
      <Stack.Screen name="AddKeys" component={AddKeys} />
      <Stack.Screen name="KeysHistory" component={KeysHistory} />
      <Stack.Screen name="CustomerQr" component={CustomerQr} />
      <Stack.Screen name="ExtraFeatures" component={ExtraFeatures} />
    </Stack.Navigator>
  );
};

export default Main;
