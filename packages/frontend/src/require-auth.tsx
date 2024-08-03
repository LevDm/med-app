import { Navigate, Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import { useAuthContext } from './auth-context';

export const RequireAuth = () => {
  const { getUser } = useAuthContext();
  const location = useLocation();

  if (!getUser()) {
    return <Navigate to="/signin" state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
