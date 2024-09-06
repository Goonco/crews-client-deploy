import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import useSession from '../../hooks/use-session';
import useRefreshToken from '../../hooks/use-refresh-token';
import { printCustomError } from '../../lib/utils/error';
import { validatePublicRoute } from '../../lib/utils/regex.ts';
import Header from '../shared/header.tsx';
import Loading from '../shared/loading.tsx';

const AuthRedirectWrapper = () => {
  const [loading, setLoading] = useState(true);
  const { accessToken, role } = useSession();
  const { refresh } = useRefreshToken();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const redirectByAuth = async () => {
      if (!accessToken) {
        try {
          await refresh();
        } catch (e) {
          printCustomError(e, 'redirectByAuth');
          !validatePublicRoute(location.pathname) && navigate('/sign-in');
          setLoading(false);
        }
      }

      if (accessToken) {
        const recruitmentCode = localStorage.getItem('recruitmentCode');

        switch (role) {
          case 'ADMIN':
            location.pathname !== '/recruit' &&
              location.pathname !== '/error' &&
              navigate('/recruit');
            break;
          case 'APPLICANT':
            !/^\/apply\/.+$/.test(location.pathname) &&
              location.pathname !== '/error' &&
              recruitmentCode &&
              navigate(`/apply/${recruitmentCode}`);
            break;
        }
        setLoading(false);
      }
    };

    (async () => await redirectByAuth())();
  }, [location.pathname, accessToken]);

  if (loading) return <Loading />;
  if (!accessToken) return <Outlet />;
  if (accessToken)
    return (
      <>
        <Header />
        <Outlet />
      </>
    );
};

export default AuthRedirectWrapper;
