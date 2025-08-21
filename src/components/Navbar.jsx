// Navbar.jsx
import { useContext } from "react";
import { AppContext } from "../contexts/AppProvider";

// Import Heroicons (outline style)
import {
  MagnifyingGlassIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { lightTheme, toggleTheme, open, setOpen } = useContext(AppContext);
  const [mobileMenu, setMobileMenu] = useState(() => {
    const saved = localStorage.getItem("LMS-MobileMenu");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("LMS-MobileMenu", JSON.stringify(mobileMenu));
  }, [mobileMenu]);

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
    ${
      open
        ? "w-0 opacity-0 px-0 mr-0 pointer-events-none"
        : `w-12 opacity-100 px-3 py-3 mr-1 ml-2 ${
            lightTheme
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
            className={`p-2 rounded-full ${
              lightTheme
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
              className={`font-bold px-4 py-3 rounded-md ${
                lightTheme ? "bg-gray-800" : "bg-neutral-200 text-black"
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
              className={`font-bold px-3 py-2 rounded-md ${
                lightTheme ? "bg-gray-800" : "bg-neutral-200 text-black"
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
      <div className="visible block lg:hidden opacity-100 lg:opacity-0 transition-all duration-500 ease-in-out">
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-500 ease-in-out ${
            mobileMenu ? "opacity-100" : "opacity-0 pointer-events-none"
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
              className={`font-bold text-xl ${
                lightTheme ? "text-white" : "text-black"
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
          <ul className="px-4 py-3 space-y-2">
            {[
              {
                name: "Dashboard",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M3 12l9-9 9 9M4 10v10h16V10" />
                  </svg>
                ),
              },
              {
                name: "Books",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6"
                  >
                    <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
                  </svg>
                ),
              },
              {
                name: "Members",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M17 20h5v-2a4 4 0 0 0-5-4M9 20H4v-2a4 4 0 0 1 5-4m3-4a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                  </svg>
                ),
              },
              {
                name: "Borrowed",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M9 12h6M9 16h6M5 20h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                  </svg>
                ),
              },
              {
                name: "Request",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M12 20h9" />
                    <path d="M12 4h9" />
                    <path d="M4 9h16M4 15h16" />
                  </svg>
                ),
              },
              {
                name: "Account",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M5.121 17.804A10.97 10.97 0 0 1 12 15c2.386 0 4.577.832 6.879 2.804M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                  </svg>
                ),
              },
            ].map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-3 hover:bg-gray-800 py-3 px-2 cursor-pointer rounded-md transition"
              >
                {item.icon}
                <span>{item.name}</span>
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
