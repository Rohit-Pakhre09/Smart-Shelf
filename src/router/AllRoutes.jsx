import { Route, Routes } from "react-router-dom";
import LoginPage from "../Pages/LoginPage";
import DashBoard from "../Pages/DashBoard";
import BookManagement from "../Pages/BookManagement";
import MemberManagement from "../Pages/MemberManagement";
import BorrowedBooks from "../Pages/BorrowedBooks";
import RequestBooks from "../Pages/RequestBooks";

const paths = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: <DashBoard />,
  },
  {
    path: "/books",
    element: <BookManagement />,
  },
  {
    path: "/members",
    element: <MemberManagement />,
  },
  {
    path: "/borrowedbooks",
    element: <BorrowedBooks />,
  },
  {
    path: "/request",
    element: <RequestBooks />,
  },
];

const AllRoutes = () => {
  return (
    <Routes>
      <Route></Route>
    </Routes>
  );
};
