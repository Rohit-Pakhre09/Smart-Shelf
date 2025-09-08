import { useContext } from "react";
import { AppContext } from "../contexts/AppProvider";
import { NavLink } from "react-router-dom";
import { BadgeCent } from "lucide-react";

const Sidebar = () => {
  const { open, lightTheme, setOpen } = useContext(AppContext);

  // Main Menu List
  const mainMenus = [
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
      name: "Issued Books",
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
  ];

  // Bottom menu item
  const bottomMenu = [
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
      {/* Desktop Sidebar */}
      <aside
        className={`fixed top-2 left-2 h-[98vh] rounded-xl 
    ${open ? "w-64" : "w-20"} 
    ${lightTheme ? "bg-gray-900" : "bg-neutral-50"}
    text-white transition-all duration-500 ease-in-out relative flex flex-col justify-between invisible opacity-0 lg:visible lg:opacity-100 shadow-lg`}
      >
        {/* Top section */}
        <div>
          {/* Logo and toggle */}
          <div className="flex items-center justify-between px-4 py-5">
            <p
              className={`text-3xl font-bold ${lightTheme ? "text-white" : "text-black"
                } transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap ${open
                  ? "opacity-100 max-w-full sm:text-2xl md:text-3xl"
                  : "opacity-0 max-w-0"
                }`}
            >
              Smart{" "}
              <span
                className={`text-blue-600 transition-all duration-500 ease-in-out`}
              >
                Shelf
              </span>
            </p>

            {/* Left arrow */}
            {open && (
              <button
                className={`p-2 rounded-md ${lightTheme
                  ? "hover:bg-gray-800"
                  : "hover:bg-neutral-300 text-black"
                  } transition cursor-pointer duration-500 ease-in-out`}
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
              <NavLink
                key={index}
                to={menu.path}
                title={menu.name}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-5 py-3 mt-3 rounded-md m-2 transition-all duration-300 ease-in cursor-pointer
        ${isActive
                    ? "bg-blue-600 text-white"
                    : lightTheme
                      ? "hover:bg-gray-800"
                      : "hover:bg-neutral-300 hover:text-black text-black"
                  }`
                }
              >
                <div className="transition-transform duration-500 ease-in-out">
                  {menu.icon}
                </div>
                <span
                  className={`font-medium transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap ${open ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
                    }`}
                >
                  {menu.name}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Menu Item */}
        <div className="mb-5">
          {bottomMenu.map((menu, index) => (
            <NavLink
              key={index}
              to={menu.path}
              title={menu.name}
              className={({ isActive }) =>
                `flex items-center gap-4 px-6 py-3 cursor-pointer rounded-md m-2 transition-all duration-300 ease-in
      ${lightTheme
                  ? "hover:bg-gray-800"
                  : "hover:bg-neutral-300 hover:text-black text-black"
                }
      ${isActive ? "bg-indigo-500 text-white" : ""}`
              }
            >
              {menu.icon}
              {/* Only show name if sidebar is open */}
              {open && (
                <span className="font-medium transition-all duration-500 ease-in-out overflow-hidden">
                  {menu.name}
                </span>
              )}
            </NavLink>
          ))}

          {/* LMS copyright */}
          <div
            className={`text-[8px] sm:text-[10px] text-center transition-all duration-700 ease-in-out
      ${lightTheme ? "text-neutral-400" : "text-gray-700"}
      hidden md:block overflow-hidden
      ${open ? "max-h-10 opacity-100" : "max-h-0 opacity-0"}
    `}
          >
            &copy; {new Date().getFullYear()} <b>Smart Shelf</b>. All rights
            reserved.
          </div>
        </div>

        {/* Home SVG after the sidebar close */}
        <div
          title="Home"
          className={`absolute top-6.5 left-5 transition-all duration-500 ease-in-out ${open
            ? "opacity-0 pointer-events-none"
            : "opacity-100 pointer-events-auto"
            }`}
        >
          <button
            onClick={() => setOpen(true)}
            className={`px-1.5 py-1 rounded-md ${lightTheme
              ? "hover:bg-gray-800"
              : "hover:bg-neutral-300 hover:text-black text-black"
              } transition-all duration-300 ease-in flex items-center justify-center delay-200`}
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
    </>
  );
};

export default Sidebar;
