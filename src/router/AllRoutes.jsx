import { Route, Routes } from "react-router-dom";
import LoginPage from "../Pages/LoginPage";
import DashBoard from "../Pages/DashBoard";
import BookManagement from "../Pages/BookManagement";
import MemberManagement from "../Pages/MemberManagement";
import BorrowedBooks from "../Pages/BorrowedBooks";
import RequestBooks from "../Pages/RequestBooks";
import ErrorPage from "../Pages/ErrorPage";

const paths = [
  { path: "/login", element: <LoginPage /> },
  { path: "/", element: <DashBoard /> },
  { path: "/books", element: <BookManagement /> },
  { path: "/members", element: <MemberManagement /> },
  { path: "/borrowedbooks", element: <BorrowedBooks /> },
  { path: "/request", element: <RequestBooks /> },
  { path: "*", element: <ErrorPage /> },
];

const AllRoutes = () => {
  return (
    <Routes>
      {paths.map(({ path, element }, index) => (
        <Route key={index} path={path} element={element} />
      ))}
    </Routes>
  );
};

export default AllRoutes;
