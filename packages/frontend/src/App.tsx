import { Navigate, Route, RouterProvider, Routes, createBrowserRouter, useLocation, useNavigate } from 'react-router-dom';

import { ThemeProvider, createTheme } from '@mui/material';

import { SnackbarProvider } from 'notistack';

import { AuthContextProvider, useAuthContext, useUser } from './auth-context';
import { AdminPage, ClientPage, DoctorPage, LandingPage, Page403, SignInPage, SignUpPage } from './pages';
import { Alert } from './ui-components/notification';

declare module '@mui/material/styles/createPalette' {
  interface PaletteOptions {
    accent?: PaletteColorOptions;
  }
  interface Palette {
    accent: PaletteColor;
  }
}
const theme = createTheme({
  typography: {
    fontFamily: ['Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
    fontSize: 14,
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#5757EC',
      light: '#F8F8FF',
    },
    secondary: {
      main: '#b73dfd',
      dark: '#2a1a4e',
    },
    accent: {
      main: '#ff5051',
      light: '#ffb100',
    },
    info: {
      main: '#e8e8e8',
      contrastText: '#000',
    },
  },
});

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export const Routing = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const redirectToSignIn = () => navigate('/signin', { state: { from: location.pathname } });

  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      Components={{
        error: Alert,
        success: Alert,
      }}
    >
      <AuthContextProvider onRefreshFail={redirectToSignIn}>
        <Routes>
          <Route path="/" element={<RedirectIfUser component={<LandingPage />} to="/edit" />} />
          <Route path="/edit" element={<RequireAuth component={<MainPage />} />} />
          <Route path="/promo" element={<LandingPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/403" element={<Page403 />} />
        </Routes>
      </AuthContextProvider>
    </SnackbarProvider>
  );
};

const MainPage = () => {
  const user = useUser();

  const navigate = useNavigate();

  if (!user) {
    navigate('/signin', { state: { from: location.pathname } });
    return;
  }

  return (
    <>
      {user.role === 'user' && <ClientPage />}
      {user.role === 'admin' && <AdminPage />}
      {user.role === 'doctor' && <DoctorPage />}
    </>
  );
};

const router = createBrowserRouter([{ path: '*', element: <Routing /> }]);

const RequireAuth = ({ component }: { component: React.ReactNode }) => {
  const { getUser } = useAuthContext();

  if (!getUser()) {
    return <Navigate to="/signin" state={{ from: location.pathname }} />;
  }

  return component;
};

const RedirectIfUser = ({ to, component }: { to: string; component: React.ReactNode }) => {
  const { getUser } = useAuthContext();

  if (getUser()) {
    return <Navigate to={to} />;
  }

  return component;
};
