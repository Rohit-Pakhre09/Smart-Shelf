import { Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from '../Pages/LoginPage';
import SignUpPage from '../Pages/SignupPage';
import Dashboard from '../Pages/DashBoard';
import BookManagement from '../Pages/BookManagement';
import MemberManagement from '../Pages/MemberManagement';
import IssuedBooks from '../Pages/IssuedBooks';
import FinePage from '../Pages/FinesPage';
import ErrorPage from '../pages/ErrorPage';
import AccountPage from '../Pages/AccountPage';
import PrivateRoute from '../router/PrivateRoute';

const paths = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/books', element: <BookManagement /> },
  { path: '/members', element: <MemberManagement /> },
  { path: '/issuedBooks', element: <IssuedBooks /> },
  { path: '/fines', element: <FinePage /> },
  { path: '/account', element: <AccountPage /> },
  { path: '*', element: <ErrorPage /> },
];

const AllRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex justify-center items-center min-h-[50vh] w-full">
          <span className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignUpPage />}
      />
      {paths.map(({ path, element }, index) => (
        <Route
          key={index}
          path={path}
          element={<PrivateRoute>{element}</PrivateRoute>}
        />
      ))}
    </Routes>
  );
};

export default AllRoutes;