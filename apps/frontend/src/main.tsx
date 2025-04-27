import { createRoot } from 'react-dom/client';

import { enableMapSet } from 'immer';

const root = createRoot(document.getElementById('root') as HTMLElement);
enableMapSet();

import('./app').then(({ default: App }) => root.render(<App />));
