// Navbar.jsx
import { useContext } from "react";
import { AppContext } from "../contexts/AppProvider";
import { NavLink } from "react-router-dom";

// Import Heroicons (outline style)
import {
  MagnifyingGlassIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { BadgeCent } from "lucide-react";

const Navbar = () => {
  const { lightTheme, toggleTheme, open, setOpen } = useContext(AppContext);
  const [mobileMenu, setMobileMenu] = useState(() => {
    const saved = localStorage.getItem("LMS-MobileMenu");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("LMS-MobileMenu", JSON.stringify(mobileMenu));
  }, [mobileMenu]);

  // Menu List
  const menus = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6"
        >
          <path
            fillRule="evenodd"
            d="M2.25 2.25a.75.75 0 0 0 0 1.5H3v10.5a3 3 0 0 0 3 3h1.21l-1.172 3.513a.75.75 0 0 0 1.424.474l.329-.987h8.418l.33.987a.75.75 0 0 0 1.422-.474l-1.17-3.513H18a3 3 0 0 0 3-3V3.75h.75a.75.75 0 0 0 0-1.5H2.25Zm6.54 15h6.42l.5 1.5H8.29l.5-1.5Zm8.085-8.995a.75.75 0 1 0-.75-1.299 12.81 12.81 0 0 0-3.558 3.05L11.03 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l2.47-2.47 1.617 1.618a.75.75 0 0 0 1.146-.102 11.312 11.312 0 0 1 3.612-3.321Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: "Books",
      path: "/books",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v12m6-6H6"
          />
        </svg>
      ),
    },

    {
      name: "Issued",
      path: "/issuedBooks",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6"
        >
          <path
            fillRule="evenodd"
            d="M5.478 5.559A1.5 1.5 0 0 1 6.912 4.5H9A.75.75 0 0 0 9 3H6.912a3 3 0 0 0-2.868 2.118l-2.411 7.838a3 3 0 0 0-.133.882V18a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-4.162c0-.299-.045-.596-.133-.882l-2.412-7.838A3 3 0 0 0 17.088 3H15a.75.75 0 0 0 0 1.5h2.088a1.5 1.5 0 0 1 1.434 1.059l2.213 7.191H17.89a3 3 0 0 0-2.684 1.658l-.256.513a1.5 1.5 0 0 1-1.342.829h-3.218a1.5 1.5 0 0 1-1.342-.83l-.256-.512a3 3 0 0 0-2.684-1.658H3.265l2.213-7.191Z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M12 2.25a.75.75 0 0 1 .75.75v6.44l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 1.06-1.06l1.72 1.72V3a.75.75 0 0 1 .75-.75Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: "Members",
      path: "/members",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8z"
          />
        </svg>
      ),
    },
    {
      name: "Fines",
      path: "/fines",
      icon: <BadgeCent />,
    },
    {
      name: "Reserved Books",
      path: "/reserved",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6"
        >
          <path
            fillRule="evenodd"
            d="M6 2.25A3.75 3.75 0 0 1 9.75 6v1.5h4.5V6A3.75 3.75 0 0 1 18 2.25h1.5A2.25 2.25 0 0 1 21.75 4.5v15A2.25 2.25 0 0 1 19.5 21.75H4.5A2.25 2.25 0 0 1 2.25 19.5v-15A2.25 2.25 0 0 1 4.5 2.25H6Zm0 1.5H4.5a.75.75 0 0 0-.75.75v15a.75.75 0 0 0 .75.75h15a.75.75 0 0 0 .75-.75v-15a.75.75 0 0 0-.75-.75H18A2.25 2.25 0 0 0 15.75 6v1.5h-7.5V6A2.25 2.25 0 0 0 6 3.75Zm1.5 5.25a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: "Account",
      path: "/account",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6"
        >
          <path
            fillRule="evenodd"
            d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },

  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className={`fixed top-2.5 left-7 right-0 z-40 flex items-center justify-between 
    h-20 pr-4 rounded-xl transition-all duration-500 ease-in-out shadow-lg
    ${lightTheme ? "bg-gray-900 text-white" : "text-black bg-neutral-50"}
    ${open ? "ml-64 w-[calc(100%-19rem)]" : "ml-20 w-[calc(100%-8rem)]"}
    hidden lg:flex
    ${open ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"} 
  `}
      >
        {/* Button */}
        <button
          onClick={() => setOpen(!open)}
          className={`overflow-hidden transition-all duration-500 ease-in-out rounded-md cursor-pointer
    ${open
              ? "w-0 opacity-0 px-0 mr-0 pointer-events-none"
              : `w-12 opacity-100 px-3 py-3 mr-1 ml-2 ${lightTheme
                ? "hover:bg-gray-800"
                : "hover:bg-neutral-300 hover:text-black"
              } transition-all duration-500 ease-in`
            }
  `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
          >
            <path
              fillRule="evenodd"
              d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75H12a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Left Section */}
        <div className="flex-1 items-center gap-3">
          <h1 className="text-lg font-bold hidden sm:block px-5">
            Library Management System
          </h1>
        </div>

        {/* Middle Section (Search bar) */}
        {/* <div className="flex-1 mx-4 hidden md:flex">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search books, authors, categories..."
            className={`w-full rounded-lg py-2 pl-10 pr-4 outline-none border transition 
              ${lightTheme
                ? "focus:ring-2 focus:ring-sky-500 bg-gray-700 placeholder:text-neutral-200 text-white border-0 outline-0"
                : "bg-neutral-100 outline border-1 border-neutral-600/10 placeholder-black text-black focus:ring-2 focus:ring-gray-400"
              } transition-all duration-500 ease-in-out`}
          />
          <MagnifyingGlassIcon className={`h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 ${lightTheme ? "text-white" : "text-blue-600"}`} />
        </div>
      </div> */}

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${lightTheme
              ? "hover:bg-gray-800"
              : "hover:bg-neutral-300 hover:text-black"
              } transition-all duration-300 ease-in-out cursor-pointer`}
          >
            {lightTheme ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </button>

          {/* Current Date */}
          <div className="flex items-center gap-2">
            <p
              className={`font-bold px-4 py-3 rounded-md ${lightTheme
                ? "bg-gray-800"
                : "bg-indigo-500 text-neutral-50 shadow-sm"
                } transition-all duration-500 ease-in-out`}
            >
              {" "}
              {new Date().toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </nav>

      {/* ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */}

      {/* Mobile & Tablet Navbar */}
      <nav
        className={`fixed top-3.5 left-2 z-50 flex items-center justify-between
    w-[calc(100%-1rem)] px-5 py-3 rounded-lg shadow-md
    transition-all duration-500 ease-in-out
    lg:hidden
    ${lightTheme ? "bg-gray-900 text-white" : "bg-neutral-50 text-black"}
  shadow-lg`}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          {/* Hamburger */}
          <button
            onClick={() => setMobileMenu(true)}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {/* Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75H12a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <h1 className="text-sm md:text-lg font-semibold truncate">
            {/* Mobile (smaller than md) */}
            <span className="block md:hidden font-bold text-lg">
              Smart Shelf
            </span>

            {/* Tablet & Desktop (md and up) */}
            <span className="hidden md:block">Library Management System</span>
          </h1>
        </div>

        {/* Details */}
        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {lightTheme ? (
              <MoonIcon className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <SunIcon className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </button>

          {/* Current Date */}
          <div className="flex items-center gap-2">
            <p
              className={`font-bold px-3 py-2 rounded-md ${lightTheme ? "bg-gray-800" : "bg-neutral-200 text-black"
                } transition-all duration-500 ease-in-out text-[10px]`}
            >
              {" "}
              {new Date().toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div className="visible block lg:hidden opacity-100 lg:opacity-0 transition-all duration-500 ease-in-out h-auto mb-20">
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-500 ease-in-out ${mobileMenu ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          onClick={() => setMobileMenu(false)}
        />

        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full w-64 z-50 p-2
      ${lightTheme ? "bg-gray-900 text-white" : "bg-neutral-50 text-black"}
      shadow-lg transform transition-transform duration-500 ease-in-out
      ${mobileMenu ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <p
              className={`font-bold text-xl ${lightTheme ? "text-white" : "text-black"
                }`}
            >
              Smart{" "}
              <span
                className={`${lightTheme ? "text-blue-600" : "text-black"}`}
              >
                Shelf
              </span>
            </p>
            <button
              className="px-3 py-2 hover:bg-gray-800 rounded-md"
              onClick={() => setMobileMenu(false)}
            >
              ✕
            </button>
          </div>

          {/* Sidebar Links */}
          <ul className={`px-4 py-3 space-y-2 transition-all duration-300`}>
            {menus.map((menu, index) => (
              <li key={index}>
                <NavLink
                  to={menu.path}
                  onClick={() => {
                    setOpen(false);
                    setMobileMenu(false);
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 py-3 px-2 rounded-md transition cursor-pointer 
        ${isActive
                      ? lightTheme
                        ? "bg-gray-800 text-white font-semibold"
                        : "bg-neutral-300 text-black font-semibold"
                      : lightTheme
                        ? "hover:bg-gray-800 hover:text-white"
                        : "hover:bg-neutral-300 hover:text-black"
                    }`
                  }
                >
                  {menu.icon}
                  <span>{menu.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
          <p
            className={`text-[10px] text-center w-full 
    ${lightTheme ? "text-neutral-200" : "text-gray-400"} 
    absolute bottom-10 left-1/2 transform -translate-x-1/2`}
          >
            &copy; {new Date().getFullYear()} <b>Smart Shelf</b>. All Rights
            Reserved
          </p>
        </div>
      </div>
    </>
  );
};

export default Navbar;
