import {
  AdaptivityProvider,
  AppRoot,
  ConfigProvider,
  SizeType,
} from '@vkontakte/vkui';

import { StrictMode } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import '@vkontakte/vkui/dist/vkui.css';
import 'reflect-metadata';
import '../styles.css';

import { store } from '../data/store';
import { SnackbarProvider } from '../hooks/useSnackbar';
import App from './app';

function Index() {
  return (
    <StrictMode>
      <Provider store={store}>
        <HelmetProvider>
          <ConfigProvider>
            <AdaptivityProvider sizeY={SizeType.COMPACT}>
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
}

export default Index;
