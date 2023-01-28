import { AdaptivityProvider, AppRoot, ConfigProvider } from '@vkontakte/vkui';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import '@vkontakte/vkui/dist/vkui.css';

import App from './app/app';
import { store } from './data/store';

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <ConfigProvider>
          <AdaptivityProvider>
            <BrowserRouter>
              <AppRoot>
                <App />
              </AppRoot>
            </BrowserRouter>
          </AdaptivityProvider>
        </ConfigProvider>
      </HelmetProvider>
    </Provider>
  </StrictMode>
);
