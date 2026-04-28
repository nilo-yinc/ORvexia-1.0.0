import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * This page handles the redirect from Google/GitHub OAuth.
 * The backend sends us back here with ?token=JWT_TOKEN in the URL.
 * We grab it, store it in localStorage, then redirect to /home.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const redirectPath = searchParams.get('redirect');

    if (error) {
      navigate('/login?error=' + error);
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      const target = redirectPath && redirectPath.startsWith('/') ? redirectPath : '/home';
      setTimeout(() => {
        window.location.href = target;
      }, 100);
    } else {
      navigate('/login?error=no_token');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 text-sm font-mono uppercase tracking-widest">
          Authenticating...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
