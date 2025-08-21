import { useContext } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { AppContext } from "./contexts/AppProvider";
import AllRoutes from "./router/AllRoutes"; // import your routes file

const App = () => {
  const { lightTheme } = useContext(AppContext);

  return (
    <main
      className={`min-h-screen flex ${
        lightTheme ? "bg-gray-900/90" : "bg-gray-200/70"
      } transition-all duration-300 ease-in-out`}
    >
      {/* Main Content Area */}
      <section className="flex flex-col flex-1 min-h-screen">
        <div className="p-0 flex-1">
          <AllRoutes /> {/* <-- here your pages will load */}
        </div>
      </section>
    </main>
  );
};

export default App;
