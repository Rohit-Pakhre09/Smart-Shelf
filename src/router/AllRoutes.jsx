
import { Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginPage from "../Pages/LoginPage";
import DashBoard from "../Pages/DashBoard";
import BookManagement from "../Pages/BookManagement";
import MemberManagement from "../Pages/MemberManagement";
import FinePage from "../Pages/FinesPage";
import ErrorPage from "../Pages/ErrorPage";
import AccountPage from "../Pages/AccountPage";
import PrivateRoute from "./PrivateRoute";
import  SignUpPage from "../Pages/SignupPage"
import IssuedBooks from "../Pages/IssuedBooks"
const paths = [
  { path: "/dashboard", element: <DashBoard /> },
  { path: "/books", element: <BookManagement /> },
  { path: "/members", element: <MemberManagement /> },
    { path: '/issuedBooks', element: <IssuedBooks /> },
  { path: "/fines", element: <FinePage /> },
  { path: "/account", element: <AccountPage /> },
  { path: "*", element: <ErrorPage /> }
];

const AllRoutes = () => {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const isAuthenticate = localStorage.getItem("isAuthenticated") === "true";
    setAuth(isAuthenticate);
  }, []);

  if (auth === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={auth ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={<SignUpPage  />}
      />

      {/* Protected routes */}
      {paths.map(({ path, element }, index) => (
        <Route
          key={index}
          path={path}
          element={<PrivateRoute>{element}</PrivateRoute>}
        />
      ))}

      {/* Catch-all error page */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default AllRoutes;
