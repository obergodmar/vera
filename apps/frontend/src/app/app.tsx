import { Navigate, Route, Routes } from 'react-router-dom';

import { Private } from '../components/private';
import { Content } from './content';
import { Login } from './login';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Private />}>
        <Route index element={<Content />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
