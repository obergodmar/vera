import {
  AdaptivityProvider,
  AppRoot,
  ConfigProvider,
  WebviewType,
} from '@vkontakte/vkui';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import '@vkontakte/vkui/dist/vkui.css';
import 'reflect-metadata';

import App from './app/app';
import { store } from './data/store';
import { SnackbarProvider } from './hooks/useSnackbar';

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <ConfigProvider appearance="light" webviewType={WebviewType.INTERNAL}>
          <AdaptivityProvider>
            <BrowserRouter>
              <AppRoot>
                <App />
                <SnackbarProvider />
              </AppRoot>
            </BrowserRouter>
          </AdaptivityProvider>
        </ConfigProvider>
      </HelmetProvider>
    </Provider>
  </StrictMode>
);
