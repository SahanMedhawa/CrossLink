import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/index.js';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Redux Provider wraps the entire app so every component can 
        access the store via useSelector / useDispatch */}
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
