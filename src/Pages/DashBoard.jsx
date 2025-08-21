import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useContext } from "react";
import { AppContext } from "../contexts/AppProvider";

const DashBoard = () => {
  const { lightTheme, open } = useContext(AppContext);

  return (
    <section className="flex min-h-screen m-0 p-0">
      {/* Sidebar */}
      <div className="fixed hidden lg:block">
        <Sidebar />
      </div>

      {/* Navbar + Content */}
      <div className="flex flex-col flex-1 transition-all duration-300">
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <section className="flex-1 pt-[80px] lg:m-2.5 transition-all duration-300">
          {/* Dashboard Heading */}
          <p
            className={`${
              lightTheme ? "text-white" : "text-black"
            } text-3xl pb-3 mt-5 font-medium animation transition-all duration-500 ${
              open ? "lg:ml-70" : "lg:ml-24"
            }`}
          >
            Dashboard
          </p>

          {/* Main Content Area */}
          <div
            className={`h-[85vh] overflow-y-scroll scrollbar-thin overflow-x-hidden pr-2 bg-amber-500 rounded-xl shadow-md transition-all duration-500 ${
              open
                ? "lg:ml-68 lg:w-[calc(100%-17rem)]"
                : "lg:ml-24 lg:w-[calc(100%-6rem)]"
            }`}
          >
            <div className="min-h-full flex flex-col gap-5 p-3">
              {/* Div 1 */}
              <section className="flex flex-col items-center lg:flex-row lg:items-center lg:justify-between">
                <div
                  className={`h-70 w-full mb-3 lg:w-[50%] ${
                    lightTheme ? "bg-gray-900 text-white" : "bg-white"
                  } rounded-lg p-3 shadow-md animation`}
                >
                  <p>Hello</p>
                </div>

                <div
                  className={`h-70 w-full mb-3 lg:w-[46%] ${
                    lightTheme ? "bg-gray-900 text-white" : "bg-white"
                  } rounded-lg p-3 shadow-md animation`}
                >
                  <p>World</p>
                </div>
              </section>

              {/* Div 2 */}
              <section
                className={`h-70 w-full mb-3 flex-1 ${
                  lightTheme ? "bg-gray-900 text-white" : "bg-white"
                } rounded-lg p-3 shadow-md animation`}
              >
                <p></p>
              </section>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default DashBoard;
