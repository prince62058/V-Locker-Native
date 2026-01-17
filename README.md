# V-Locker Mobile App (React Native)

The V-Locker Mobile Application is designed for customers and dealers to manage device financing and security. It includes features for EMI tracking, device locking/unlocking (Kiosk Mode), and real-time notifications.

## Features

- **Device Locking (Kiosk Mode)**: Secures financed devices, preventing unauthorized use if payments are missed. Includes `MyDeviceAdminReceiver` for admin privileges.
- **EMI Dashboard**: View loan details, upcoming EMI dates, and payment history.
- **Push Notifications**: Real-time alerts for loan updates and lock/unlock actions via Firebase Cloud Messaging (FCM).
- **Secure Authentication**: Mobile OTP-based login for customers and employees.
- **Offline Support**: Redux Persist ensures data availability offline.

## Tech Stack

- **Framework**: React Native (v0.81)
- **Language**: JavaScript / React
- **State Management**: Redux Toolkit & React-Redux
- **Navigation**: React Navigation (Bottom Tabs, Native Stack)
- **Networking**: Axios
- **Local Storage**: Async Storage & React Native Keychain (Secure)
- **UI**: React Native Vector Icons, Linear Gradient, Lottie Animations
- **Native Modules**: `react-native-device-info`, `react-native-permissions`

## Prerequisites

- Node.js (v18+)
- Java JDK 17
- Android Studio & Android SDK
- React Native CLI

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/satyakabiroffical/V-Locker-React-Native-Frontend-.git
    cd V-Locker-React-Native-Frontend-
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **API Configuration:**
    The API base URL is configured in `src/services/axios/api.js`.
    
    *   **For Development (Local)**:
        Update the URL to your local backend IP:
        ```javascript
        baseURL: Platform.OS === 'android' 
          ? 'http://192.168.1.X:5000/api/' 
          : 'http://localhost:5000/api/'
        ```

    *   **For Production**:
        Uncomment the production URL line:
        ```javascript
        baseURL: 'https://vlockerbackend.onrender.com/api/'
        ```

4.  **Run the application:**

    *   **Android:**
        ```bash
        npm run android
        # or
        npx react-native run-android
        ```

    *   **Start Metro Bundler:**
        ```bash
        npm start
        ```

## Troubleshooting

-   **Gradle Errors**: Ensure you are using JDK 17 (`java -version`).
-   **App Not Installed**: Uninstall the old version completely before installing a new build (especially if signatures differ).
-   **"Package Invalid"**: Ensure `android:testOnly="true"` is NOT present in `AndroidManifest.xml` for release builds.

## Folder Structure

```
src/
├── assets/          # Images, Fonts, Animations
├── components/      # Reusable UI Components
├── constants/       # App Constants (Colors, Strings)
├── navigation/      # Stack & Tab Navigators
├── redux/           # Redux Slices & Services
├── screens/         # Application Screens (Main, Auth)
├── services/        # API (Axios) & Firebase Config
└── utils/           # Helper Functions
```

## License

Private
