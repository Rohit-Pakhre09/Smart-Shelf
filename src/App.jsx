import { useContext } from "react";
import Sidebar from "./components/Sidebar";
import { ThemeContext } from "./contexts/AppProvider";
import BookCard from "./components/BookCard";
import { AppContext } from "./contexts/AppProvider";
import Navbar from "./components/Navbar";

const App = () => {
  const { lightTheme } = useContext(AppContext);
  return (
    <main
      className={`min-h-screen flex items-center ${lightTheme ? "bg-black/90" : "bg-white"
        } transition-all duration-300 ease-in-out`}
    >
      <section className="min-h-screen flex flex-1 items-center justify-between">
        <Sidebar />
        <Navbar />
      </section>
F    </main>
  );
};

export default App;
