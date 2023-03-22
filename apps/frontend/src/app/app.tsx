import { Navigate, Route, Routes } from 'react-router-dom';

import { Navigation } from '../components/navigation';
import { panels } from '../components/panels';
import { Private } from '../components/private';
import { Content } from './content';
import { Login } from './login';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<Private />}>
        <Route path="/" element={<Content />}>
          <Route path="/navigation" element={<Navigation />} />

          {panels.map(({ value, content }) => (
            <Route key={value} path={`/${value}`} element={content} />
          ))}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
