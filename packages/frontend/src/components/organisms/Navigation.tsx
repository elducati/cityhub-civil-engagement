import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          CityHub
        </Link>

        <div className="nav-links">
          <Link
            to="/proposals"
            className={location.pathname.startsWith('/proposals') ? 'active' : ''}
          >
            Proposals
          </Link>
        </div>

        <div className="nav-auth">
          {user ? (
            <>
              <span className="user-email">{user.email}</span>
              <button onClick={logout} className="btn btn-outline btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}