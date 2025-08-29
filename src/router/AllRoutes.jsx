import { Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginPage from "../Pages/LoginPage";
import DashBoard from "../Pages/DashBoard";
import BookManagement from "../Pages/BookManagement";
import MemberManagement from "../Pages/MemberManagement";
import BorrowedBooks from "../Pages/BorrowedBooks";
import FinePage from "../Pages/FinesPage";
import ErrorPage from "../Pages/ErrorPage";
import AccountPage from "../Pages/AccountPage";
import PrivateRoute from "./PrivateRoute";

const paths = [
  { path: "/dashboard", element: <DashBoard /> },
  { path: "/books", element: <BookManagement /> },
  { path: "/members", element: <MemberManagement /> },
  { path: "/borrowedbooks", element: <BorrowedBooks /> },
  { path: "/fines", element: <FinePage /> },
  { path: "/account", element: <AccountPage /> },
  { path: "*", element: <ErrorPage /> },
];

const AllRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
  }

  return (
    <Routes>
      {/* Public route for LoginPage or redirect to dashboard if authenticated */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      {/* Protected routes */}
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