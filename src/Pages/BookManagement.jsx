import { useContext } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AppContext } from "../contexts/AppProvider";
import Footer from "../components/Footer";

const BookManagement = () => {
  const { lightTheme, open } = useContext(AppContext);
  return (
    <section className="flex min-h-screen">
      {/* Sidebar */}
      <div className="fixed hidden lg:block">
        <Sidebar />
      </div>

      {/* Navbar + Content */}
      <div className="flex flex-col flex-1 transition-all duration-500 ">
        <Navbar />

        <section className="flex-1 pt-[70px] m-0 lg:m-2.5 transition-all duration-500">
          <div
            className={`h-[87vh] overflow-y-scroll scrollbar-thin overflow-x-hidden pr-0 lg:pr-2 rounded-xl transition-all duration-500 mt-6 ${
              open
                ? "lg:ml-68 lg:w-[calc(100%-17rem)]"
                : "lg:ml-24 lg:w-[calc(100%-6rem)]"
            } `}
          >
            {/* Books Management Heading */}
            <p
              className={`${
                lightTheme ? "text-white" : "text-black"
              } text-3xl pb-3 mt-5 pl-5 font-bold animation transition-all duration-500`}
            >
              Books Management
            </p>

            <div className="min-h-full flex flex-col gap-5 p-3"></div>

            {/* Footer Section */}
            <Footer />
          </div>
        </section>
      </div>
    </section>
  );
};

export default BookManagement;
