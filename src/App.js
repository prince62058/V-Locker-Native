import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import Root from './navigation/Root';
import { persistor, store } from './redux/persist/store';

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Root />
      </PersistGate>
    </Provider>
  );
};

export default App;
