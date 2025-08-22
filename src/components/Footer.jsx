import { useContext } from "react";
import { AppContext } from "../contexts/AppProvider";

const Footer = () => {
  const { lightTheme } = useContext(AppContext);
  return (
    <footer
      className={`w-[90%] mx-auto md:w-[95.7%] lg:w-[98%] py-4 mt-6 mb-5 rounded-xl shadow-inner transition-all duration-500 ${
        lightTheme ? "bg-slate-900 text-neutral-500" : "bg-white text-gray-700"
      }`}
    >
      <div className="w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-3 px-5">
        {/* Left Section */}
        <div className="flex items-center gap-2 text-sm md:text-base ">
          <span>
            © {new Date().getFullYear()} <b>Smart Shelf</b> . All rights
            reserved.
          </span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 text-sm md:text-base">
          <a href="#" className="hover:text-blue-500 animation">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-blue-500 animation">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
