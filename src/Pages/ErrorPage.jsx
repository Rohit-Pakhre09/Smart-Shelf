import { useContext } from "react";
import errorImg from "../assets/404.svg"
import { AppContext } from "../contexts/AppProvider";
import { Link } from "react-router-dom";

const ErrorPage = () => {
  const { lightTheme } = useContext(AppContext);
  return (
    <section className="flex flex-col items-center justify-center min-h-screen">
      <img
        src={errorImg}
        alt="Error"
        className="w-64 h-64 text-white"
      />
      <h1
        className={`text-2xl font-bold mt-4 ${lightTheme ? "text-white" : "text-black"
          }`}
      >
        Page Not Found
      </h1>

      {/* Button to Dashboard */}
      <Link
        to="/"
        className={`py-3 px-5 mt-5 font-medium cursor-pointer 
    ${lightTheme
            ? "text-white bg-blue-600 hover:bg-blue-800"
            : "text-white bg-indigo-600 hover:bg-indigo-400"
          } 
    rounded-md transition-all duration-500 ease-in-out`}
      >
        Return to the DashBoard
      </Link>
    </section>
  );
};

export default ErrorPage;
