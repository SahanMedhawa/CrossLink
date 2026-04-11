import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import axios from 'axios';
import store from './store/index.js';
import './index.css';
import App from './App.jsx';

const configuredApiBase = import.meta.env.VITE_API_URL;
if (configuredApiBase) {
  // Normalize to backend origin so calls using '/api/*' continue to work.
  axios.defaults.baseURL = configuredApiBase.replace(/\/api\/?$/, '');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Redux Provider wraps the entire app so every component can 
        access the store via useSelector / useDispatch */}
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
