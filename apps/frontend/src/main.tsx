import {
  ChakraProvider,
  GlobalStyle,
  LightMode,
  theme,
} from '@chakra-ui/react';

import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './app/app';
import { store } from './data/store/store';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <ChakraProvider theme={theme}>
          <LightMode>
            <GlobalStyle />
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </LightMode>
        </ChakraProvider>
      </HelmetProvider>
    </Provider>
  </StrictMode>
);
