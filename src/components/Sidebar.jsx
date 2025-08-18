import { useState, useContext, useEffect } from "react";
import { ThemeContext } from "../contexts/AppProvider";

const Sidebar = () => {
  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem("LMS-Sidebar");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const { lightTheme } = useContext(ThemeContext);

  useEffect(() => {
    localStorage.setItem("LMS-Sidebar", JSON.stringify(open));
  }, [open]);

  // Main Menu List
  const mainMenus = [
    {
      name: "Dashboard",
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
            d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6"
          />
        </svg>
      ),
    },
    {
      name: "Books",
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
      name: "Members",
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
      name: "Borrowed Books",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6"
        >
          <path
            fill-rule="evenodd"
            d="M5.478 5.559A1.5 1.5 0 0 1 6.912 4.5H9A.75.75 0 0 0 9 3H6.912a3 3 0 0 0-2.868 2.118l-2.411 7.838a3 3 0 0 0-.133.882V18a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-4.162c0-.299-.045-.596-.133-.882l-2.412-7.838A3 3 0 0 0 17.088 3H15a.75.75 0 0 0 0 1.5h2.088a1.5 1.5 0 0 1 1.434 1.059l2.213 7.191H17.89a3 3 0 0 0-2.684 1.658l-.256.513a1.5 1.5 0 0 1-1.342.829h-3.218a1.5 1.5 0 0 1-1.342-.83l-.256-.512a3 3 0 0 0-2.684-1.658H3.265l2.213-7.191Z"
            clip-rule="evenodd"
          />
          <path
            fill-rule="evenodd"
            d="M12 2.25a.75.75 0 0 1 .75.75v6.44l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 1.06-1.06l1.72 1.72V3a.75.75 0 0 1 .75-.75Z"
            clip-rule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: "Requests",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6"
        >
          <path
            fill-rule="evenodd"
            d="M10.5 3A1.501 1.501 0 0 0 9 4.5h6A1.5 1.5 0 0 0 13.5 3h-3Zm-2.693.178A3 3 0 0 1 10.5 1.5h3a3 3 0 0 1 2.694 1.678c.497.042.992.092 1.486.15 1.497.173 2.57 1.46 2.57 2.929V19.5a3 3 0 0 1-3 3H6.75a3 3 0 0 1-3-3V6.257c0-1.47 1.073-2.756 2.57-2.93.493-.057.989-.107 1.487-.15Z"
            clip-rule="evenodd"
          />
        </svg>
      ),
    },
  ];

  // Bottom menu item
  const bottomMenu = [
    {
      name: "Account",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6"
        >
          <path
            fill-rule="evenodd"
            d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
            clip-rule="evenodd"
          />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={`${
        open ? "w-64" : "w-20"
      } h-screen bg-gray-900 text-white shadow-lg transition-all duration-500 relative flex flex-col justify-between`}
    >
      {/* Top section */}
      <div>
        {/* Logo and toggle */}
        <div className="flex items-center justify-between px-4 py-5">
          <p
            className={`text-3xl font-bold text-white transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap ${
              open ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
            }`}
          >
            Smart{" "}
            <span
              className={`${lightTheme ? "text-blue-600" : "text-blue-500"}`}
            >
              Shelf
            </span>
          </p>

          {/* Only show close button if sidebar is open */}
          {open && (
            <button
              className="p-2 rounded-md hover:bg-gray-800 transition cursor-pointer duration-500"
              onClick={() => setOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Main menu items */}
        <nav className="mt-5">
          {mainMenus.map((menu, index) => (
            <div
              key={index}
              className="flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-gray-800 transition-colors rounded-md m-2"
            >
              <div className="transition-transform duration-500 ease-in-out">
                {menu.icon}
              </div>
              <span
                className={`font-medium transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap ${
                  open ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
                }`}
              >
                {menu.name}
              </span>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="mb-5">
        {bottomMenu.map((menu, index) => (
          <div
            key={index}
            className="flex items-center gap-4 px-6 py-3 cursor-pointer hover:bg-gray-800 transition-colors rounded-md m-2"
          >
            {menu.icon}
            {open && <span className="font-medium">{menu.name}</span>}
          </div>
        ))}

        {/* LMS copyright */}
        <div
          className={`text-[12px] text-center py-2 ${
            lightTheme ? "text-neutral-200" : "text-gray-400"
          } transition-all duration-1000 delay-700 overflow-hidden whitespace-nowrap ease-in-out transform ${
            open ? "opacity-100 visible block" : "opacity-0 invisible hidden"
          }`}
        >
          &copy; {new Date().getFullYear()} <b>Smart Shelf</b>. All rights
          reserved.
        </div>
      </div>

      {/* Reopen button when sidebar is closed */}
      <div
        className={`absolute top-5 left-5 transition-all duration-500 ease-in-out ${
          open
            ? "opacity-0 pointer-events-none"
            : "opacity-100 pointer-events-auto"
        }`}
      >
        <button
          onClick={() => setOpen(true)}
          className="px-1.5 py-1 rounded-md bg-gray-900 hover:bg-gray-800 transition flex items-center justify-center delay-200"
        >
          {/* Library icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-8 w-8 cursor-pointer"
          >
            <path d="M11.584 2.376a.75.75 0 0 1 .832 0l9 6a.75.75 0 1 1-.832 1.248L12 3.901 3.416 9.624a.75.75 0 0 1-.832-1.248l9-6Z" />
            <path
              fillRule="evenodd"
              d="M20.25 10.332v9.918H21a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1 0-1.5h.75v-9.918a.75.75 0 0 1 .634-.74A49.109 49.109 0 0 1 12 9c2.59 0 5.134.202 7.616.592a.75.75 0 0 1 .634.74Zm-7.5 2.418a.75.75 0 0 0-1.5 0v6.75a.75.75 0 0 0 1.5 0v-6.75Zm3-.75a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0v-6.75a.75.75 0 0 1 .75-.75ZM9 12.75a.75.75 0 0 0-1.5 0v6.75a.75.75 0 0 0 1.5 0v-6.75Z"
              clipRule="evenodd"
            />
            <path d="M12 7.875a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" />
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
