import { useContext } from "react";
import Sidebar from "./components/Sidebar";
import { ThemeContext } from "./contexts/AppProvider";

const App = () => {
  const { lightTheme } = useContext(ThemeContext);
  return (
    <main
      className={`min-h-screen flex items-center ${
        lightTheme ? "bg-black/90" : "bg-white"
      } transition-all duration-300 ease-in-out`}
    >
      <section className="min-h-screen flex items-center justify-between">
        <Sidebar />
      </section>
    </main>
  );
};

export default App;
