import { useContext } from "react";
import Sidebar from "./components/Sidebar";
import { AppContext } from "./contexts/AppProvider";
import Navbar from "./components/Navbar";

const App = () => {
  const { lightTheme } = useContext(AppContext);
  return (
    <main

      className={`min-h-screen flex items-center ${lightTheme ? "bg-gray-900/90" : "bg-gray-200/70"
        } transition-all duration-300 ease-in-out`}
    >
      <section className="min-h-screen flex flex-1 items-center justify-between">
        <Sidebar />
        <Navbar />
      </section>
    </main>
  );
};

export default App;
