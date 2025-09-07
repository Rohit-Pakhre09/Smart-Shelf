import { Route, Routes, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../contexts/AppProvider';
import LoginPage from '../pages/LoginPage.jsx';
import SignUpPage from '../pages/SignupPage.jsx';
import Dashboard from '../pages/DashBoard.jsx';
import BookManagement from '../pages/BookManagement.jsx';
import MemberManagement from '../pages/MemberManagement.jsx';
import IssuedBooks from '../pages/IssuedBooks.jsx';
import FinePage from '../pages/FinesPage.jsx';
import ErrorPage from '../pages/ErrorPage.jsx';
import AccountPage from '../pages/AccountPage.jsx';
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
  const { isAuthenticated } = useContext(AppContext);

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