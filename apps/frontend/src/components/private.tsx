import { FC } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

import { RootState } from '../data/store';

export const Private: FC = () => {
  const authorized = useSelector<RootState>((state) => state.authorization);

  return authorized ? <Outlet /> : <Navigate to="/login" />;
};
