// DashBoard.jsx
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../contexts/AppProvider";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Footer from "../components/Footer";
import axios from "axios";
import { Link } from "react-router-dom";
import growingChart from "../assets/barChartFallback.svg";
import pieChart from "../assets/pieChartFallBack.svg";
import booksFallback from "../assets/booksFallback.svg";
import membersFallback from "../assets/membersFallback.svg";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// URL's
const booksUrl = "https://smart-shelf-server-qm2u.onrender.com/books";
const memebersUrl = "https://smart-shelf-server-qm2u.onrender.com/members";

const DashBoard = () => {
  const { lightTheme, open } = useContext(AppContext);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get(booksUrl);
        setBooks(res.data);
      } catch (err) {
        console.error("Error fetching books:", err);
      }
    };

    fetchBooks();
  }, []);

  // Fetch members from API
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(memebersUrl);
        setMembers(res.data);
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };

    fetchMembers();
  }, []);

  // Popular Books
  const topBooks = [...books]
    .filter((b) => b.popularity !== undefined)
    .sort((a, b) => a.popularity - b.popularity)
    .slice(0, 5);

  const chartData = {
    labels: topBooks.map((b) =>
      b.title.length > 12 ? b.title.slice(0, 12) + "..." : b.title
    ),
    datasets: [
      {
        label: "Popularity",
        data: topBooks.map((b) => b.popularity),
        backgroundColor: "rgba(99, 102, 241, 0.7)", // Indigo
        borderRadius: 8,
        fullTitles: topBooks.map((b) => b.title),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Top Books by Popularity",
        font: { size: 18 },
        color: lightTheme ? "#fff" : "#000",
      },
      tooltip: {
        callbacks: {
          title: () => null,
          label: (ctx) => {
            const fullTitle = ctx.dataset.fullTitles[ctx.dataIndex];
            const popularity = ctx.raw;
            return `${fullTitle} - Popularity: ${popularity}`;
          },
        },
      },
    },
    animation: {
      duration: 1200,
      easing: "easeOutBounce",
    },
    scales: {
      x: {
        ticks: {
          color: lightTheme ? "#fff" : "#000",
          autoSkip: false,
          maxRotation: window.innerWidth < 1497 ? 45 : 0,
          minRotation: window.innerWidth < 1497 ? 30 : 0,
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: lightTheme ? "#fff" : "#000" },
        grid: { color: lightTheme ? "#374151" : "#E5E7EB" },
      },
    },
    datasets: {
      bar: {
        maxBarThickness: 40,
        borderRadius: 8,
      },
    },
    onHover: (event, chartElement) => {
      event.native.target.style.cursor = chartElement[0]
        ? "pointer"
        : "default";
    },
  };

  // Stats Calculation
  const totalBooks = books.length || (
    <span className="inline-flex space-x-1">
      <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
    </span>
  );
  const borrowedBooks = books.filter((b) => b.status === "borrowed").length;
  const availableBooks = totalBooks - borrowedBooks || (
    <span className="inline-flex space-x-1">
      <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
    </span>
  );

  // Members Stats for Pie Chart
  const totalMembers = members.length || (
    <span className="inline-flex space-x-1">
      <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
    </span>
  );
  const activeMembers = members.filter((m) => m.status === "active").length || (
    <span className="inline-flex space-x-1">
      <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
    </span>
  );
  const inactiveMembers = totalMembers - activeMembers;

  // Capitalize helper
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // Count conditions across all copies
  const conditionCounts = books
    .flatMap((book) => book.copies)
    .reduce((acc, copy) => {
      if (copy.condition) {
        acc[copy.condition] = (acc[copy.condition] || 0) + 1;
      }
      return acc;
    }, {});

  // Prepare chart data with capitalized labels
  const conditionData = {
    labels: Object.keys(conditionCounts).map(capitalize),
    datasets: [
      {
        data: Object.values(conditionCounts),
        backgroundColor: ["#10B981", "#3B82F6", "#F59E0B"],
        hoverBackgroundColor: ["#34D399", "#60A5FA", "#FBBF24"],
      },
    ],
  };

  const conditionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: lightTheme ? "#fff" : "#000" },
      },
      title: {
        display: true,
        text: "Book Copies by Condition",
        font: { size: 16 },
        color: lightTheme ? "#fff" : "#000",
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${capitalize(ctx.label)}: ${ctx.raw}`,
        },
      },
    },
    onHover: (event, chartElement) => {
      event.native.target.style.cursor = chartElement.length
        ? "pointer"
        : "default";
    },
  };

  // // Overdue Books
  // const today = new Date();
  // const overdueBooks = books.filter(
  //   (b) => b.status === "borrowed" && b.dueDate && new Date(b.dueDate) < today
  // ).length;

  // Top Performing Book (highest popularity)
  const topBook = [...books].sort(
    (a, b) => (b.popularity || 0) - (a.popularity || 0)
  )[0]?.title || (
    <span className="inline-flex space-x-1">
      <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
    </span>
  );

  return (
    <section className="flex min-h-screen">
      {/* Sidebar */}
      <div className="fixed hidden lg:block">
        <Sidebar />
      </div>

      {/* Navbar + Content */}
      <div className="flex flex-col flex-1 transition-all duration-500 ">
        <Navbar />

        <section className="flex-1 pt-0 lg:pt-[70px] m-0 lg:m-2.5 transition-all duration-500 ease-in-out">
          <div
            className={`h-[87vh] overflow-y-scroll scrollbar-thin overflow-x-hidden pr-0 lg:pr-2 rounded-xl transition-all duration-500 lg:mt-6 ${
              open
                ? "lg:ml-68 lg:w-[calc(100%-17rem)]"
                : "lg:ml-24 lg:w-[calc(100%-6rem)]"
            }`}
          >
            {/* Dashboard Heading */}
            <p
              className={`${
                lightTheme ? "text-white" : "text-black"
              } text-3xl pb-3 mt-5 pl-5 font-bold animation transition-all duration-500`}
            >
              Dashboard
            </p>

            <div className="min-h-full flex flex-col gap-5 p-3">
              <section className="flex flex-col items-center lg:flex-row gap-5 lg:items-start lg:justify-between">
                {/* Stats + Info */}
                <div className="flex flex-col gap-5 w-full lg:flex-1">
                  {/* Quick Stats */}
                  <div
                    className={`w-auto ${
                      lightTheme ? "bg-slate-900 text-white" : "bg-white"
                    } rounded-xl p-6 shadow-lg  animation flex flex-col gap-6`}
                  >
                    <h2 className="text-xl md:text-3xl font-bold mb-2 pb-2 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`size-8 animation ${
                          lightTheme ? "text-blue-500" : "text-indigo-500"
                        }`}
                      >
                        <path d="M21 6.375c0 2.692-4.03 4.875-9 4.875S3 9.067 3 6.375 7.03 1.5 12 1.5s9 2.183 9 4.875Z" />
                        <path d="M12 12.75c2.685 0 5.19-.586 7.078-1.609a8.283 8.283 0 0 0 1.897-1.384c.016.121.025.244.025.368C21 12.817 16.97 15 12 15s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.285 8.285 0 0 0 1.897 1.384C6.809 12.164 9.315 12.75 12 12.75Z" />
                        <path d="M12 16.5c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 0 0 1.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 0 0 1.897 1.384C6.809 15.914 9.315 16.5 12 16.5Z" />
                        <path d="M12 20.25c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 0 0 1.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 0 0 1.897 1.384C6.809 19.664 9.315 20.25 12 20.25Z" />
                      </svg>
                      Quick Statistic
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-center">
                      {/* Total Books */}
                      <div
                        className={`p-5 rounded-xl shadow-blue-300 ${
                          lightTheme
                            ? "bg-slate-800 shadow-md"
                            : "bg-gray-100 shadow-sm"
                        } duration-300 flex flex-col justify-between hover:scale-[1.03] transition-transform gap-3`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {/* Books Icon */}
                          <svg
                            className="w-7 h-7 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6v12m8-6H4"
                            />
                          </svg>
                          <p className="text-3xl font-bold">{totalBooks}</p>
                        </div>
                        <p className="text-sm opacity-80 font-medium md:text-md">
                          Total Books
                        </p>

                        {/* New SVG → Book Stack */}
                        <svg viewBox="0 0 100 40" className="w-full h-14">
                          <rect
                            x="10"
                            y="20"
                            width="20"
                            height="12"
                            fill="#3b82f6"
                            rx="2"
                          />
                          <rect
                            x="35"
                            y="15"
                            width="20"
                            height="12"
                            fill="#2563eb"
                            rx="2"
                          />
                          <rect
                            x="60"
                            y="10"
                            width="20"
                            height="12"
                            fill="#1d4ed8"
                            rx="2"
                          />
                        </svg>
                      </div>

                      {/* Borrowed */}
                      <div
                        className={`p-5 rounded-xl shadow-red-300 ${
                          lightTheme
                            ? "bg-slate-800 shadow-md"
                            : "bg-gray-100 shadow-sm"
                        } duration-300 flex flex-col justify-between hover:scale-[1.03] transition-transform gap-3`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {/* Borrowed Icon */}
                          <svg
                            className="w-7 h-7 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <p className="text-3xl font-bold">{borrowedBooks}</p>
                        </div>
                        <p className="text-sm opacity-80 font-medium md:text-md">
                          Borrowed
                        </p>

                        {/* New SVG → Borrowed Trend */}
                        <svg viewBox="0 0 100 40" className="w-full h-14">
                          <circle cx="20" cy="25" r="6" fill="#ef4444" />
                          <circle cx="50" cy="15" r="6" fill="#ef4444" />
                          <circle cx="80" cy="30" r="6" fill="#ef4444" />
                          <path
                            d="M20 25 L50 15 L80 30"
                            stroke="#ef4444"
                            strokeWidth="2"
                            fill="none"
                          />
                        </svg>
                      </div>

                      {/* Available */}
                      <div
                        className={`p-5 rounded-xl shadow-green-300 ${
                          lightTheme
                            ? "bg-slate-800 shadow-md"
                            : "bg-gray-100 shadow-sm"
                        } duration-300 flex flex-col justify-between hover:scale-[1.03] transition-transform gap-3`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {/* Available Icon */}
                          <svg
                            className="w-7 h-7 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <p className="text-3xl font-bold">{availableBooks}</p>
                        </div>
                        <p className="text-sm opacity-80 font-medium md:text-md">
                          Available
                        </p>

                        {/* New SVG → Circular Progress Gauge */}
                        <svg viewBox="0 0 36 36" className="w-14 h-14 mx-auto">
                          <path
                            className="text-gray-300"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            stroke="#22c55e"
                            strokeWidth="3"
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={`${
                              (availableBooks / totalBooks) * 100
                            }, 100`}
                            d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div
                    className={`h-auto lg:h-70 w-full ${
                      lightTheme ? "bg-slate-900 text-white" : "bg-white"
                    } rounded-lg p-5 shadow-md animation flex flex-col gap-3 duration-500 transition-all`}
                  >
                    <h2 className="text-xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`size-8 animation ${
                          lightTheme ? "text-blue-500" : "text-indigo-500"
                        }`}
                      >
                        <path d="M12 .75a8.25 8.25 0 0 0-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 0 0 .577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.714 6.714 0 0 1-.937-.171.75.75 0 1 1 .374-1.453 5.261 5.261 0 0 0 2.626 0 .75.75 0 1 1 .374 1.452 6.712 6.712 0 0 1-.937.172v4.66c0 .327.277.586.6.545.364-.047.722-.112 1.074-.195a.75.75 0 0 0 .577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0 0 12 .75Z" />
                        <path
                          fillRule="evenodd"
                          d="M9.013 19.9a.75.75 0 0 1 .877-.597 11.319 11.319 0 0 0 4.22 0 .75.75 0 1 1 .28 1.473 12.819 12.819 0 0 1-4.78 0 .75.75 0 0 1-.597-.876ZM9.754 22.344a.75.75 0 0 1 .824-.668 13.682 13.682 0 0 0 2.844 0 .75.75 0 1 1 .156 1.492 15.156 15.156 0 0 1-3.156 0 .75.75 0 0 1-.668-.824Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Library Insights
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                      {/* Total Members */}
                      <div
                        className={`p-3 rounded-lg shadow ${
                          lightTheme ? "bg-slate-800" : "bg-gray-100"
                        } animation`}
                      >
                        <p className="text-2xl font-bold">{totalMembers}</p>
                        <p className="text-sm">Total Members</p>
                      </div>

                      {/* Available Books */}
                      <div
                        className={`p-3 rounded-lg shadow ${
                          lightTheme ? "bg-slate-800" : "bg-gray-100"
                        } animation`}
                      >
                        <p className="text-2xl font-bold">{availableBooks}</p>
                        <p className="text-sm">Available Books</p>
                      </div>

                      {/* Active Members */}
                      <div
                        className={`p-3 rounded-lg shadow ${
                          lightTheme ? "bg-slate-800" : "bg-gray-100"
                        } animation`}
                      >
                        <p className="text-2xl font-bold">{activeMembers}</p>
                        <p className="text-sm">Active Members</p>
                      </div>

                      {/* Top Performing Book */}
                      <div
                        className={`p-3 rounded-lg shadow ${
                          lightTheme ? "bg-slate-800" : "bg-gray-100"
                        } animation`}
                      >
                        <p className="text-xl font-bold">{topBook}</p>
                        <p className="text-sm">Top Performing Book</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Graph + Pie Chart */}
                <div className="flex flex-col gap-5 w-full lg:w-1/3">
                  {/* Bar Graph */}
                  <div
                    className={`min-h-75 w-full flex justify-center items-center rounded-lg p-5 shadow-md animation ${
                      lightTheme ? "bg-slate-900 text-white" : "bg-white"
                    }`}
                  >
                    {topBooks.length > 0 ? (
                      <Bar data={chartData} options={chartOptions} />
                    ) : (
                      <p
                        className={`${
                          lightTheme ? "text-neutral-400" : "text-black"
                        } italic flex justify-center items-center`}
                      >
                        <img
                          src={growingChart}
                          alt="Loading Bar Chart"
                          className="w-60 h-60"
                        />
                      </p>
                    )}
                  </div>

                  {/* Pie Chart */}
                  <div
                    className={`h-70 flex justify-center items-center ${
                      lightTheme ? "bg-slate-900 text-white" : "bg-white"
                    } rounded-lg p-5 shadow-md animation`}
                  >
                    {books.length > 0 ? (
                      <Pie data={conditionData} options={conditionOptions} />
                    ) : (
                      <p
                        className={`${
                          lightTheme ? "text-neutral-400" : "text-black"
                        } italic flex justify-center items-center`}
                      >
                        <img
                          src={pieChart}
                          alt="Loading Pie Chart"
                          className="w-40 h-40"
                        />
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Books Rendering Corner */}
              <section
                className={`h-auto w-full mb-3 ${
                  lightTheme ? "bg-slate-900 text-white" : "bg-white"
                } rounded-lg p-5 shadow-md animation`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl md:text-3xl font-bold mb-5 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`w-8 h-8 ${
                          lightTheme ? "text-blue-500" : "text-indigo-500"
                        }`}
                      >
                        <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
                      </svg>
                      Books Corner
                    </p>
                  </div>

                  {/* View All button */}
                  <Link
                    to="/books"
                    className={`px-2 py-1 md:px-3 md:py-2 ${
                      lightTheme
                        ? "bg-blue-500 text-white hover:bg-blue-700"
                        : "bg-indigo-500 hover:bg-indigo-700 text-white"
                    } font-medium rounded-md cursor-pointer mb-2 animation`}
                  >
                    View All
                  </Link>
                </div>

                {/* Books Row */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(6rem,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-6 pb-3 p-4 pt-7">
                  {books && books.length > 0 ? (
                    books.slice(31, 40).map((book, index) => (
                      <div key={index} className="flex flex-col items-center">
                        {/* Circle Image */}
                        <div
                          className={`w-20 h-20 sm:w-24 sm:h-24 md:w-35 md:h-35 
  rounded-full overflow-hidden shadow-lg border-2 
  ${
    lightTheme
      ? "border-indigo-500 hover:border-indigo-400 hover:shadow-indigo-500 shadow-md"
      : "border-blue-600 hover:border-blue-400 hover:shadow-blue-500 shadow-md"
  } 
  transform transition duration-200 ease-in hover:scale-105 cursor-pointer`}
                        >
                          <img
                            src={book.img || "https://via.placeholder.com/150"}
                            alt={book.title}
                            className="w-full h-full object-fit"
                          />
                        </div>
                        {/* Title */}
                        <p
                          className="mt-5 text-xs sm:text-sm font-medium text-center truncate w-full"
                          title={book.title}
                        >
                          {book.title}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center">
                      <img
                        src={booksFallback}
                        alt="Loading Books"
                        className="w-40 h-40"
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Recent Memebers */}
              <section
                className={`w-full flex-1 ${
                  lightTheme ? "bg-slate-900 text-white" : "bg-white"
                } rounded-2xl p-6 shadow-lg animation`}
              >
                {/* Header */}
                <section className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl md:text-3xl font-bold mb-5 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`w-8 h-8 ${
                          lightTheme ? "text-blue-500" : "text-indigo-500"
                        }`}
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Recent Members
                    </h2>
                  </div>

                  {/* View All button */}
                  <Link
                    to="/members"
                    className={`px-2 py-1 md:px-3 md:py-2 ${
                      lightTheme
                        ? "bg-blue-500 text-white hover:bg-blue-700"
                        : "bg-indigo-500 hover:bg-indigo-700 text-white"
                    } font-medium rounded-md cursor-pointer mb-2 animation`}
                  >
                    View All
                  </Link>
                </section>

                {/* Member List */}
                <ul className="space-y-3">
                  {members.length > 0 ? (
                    members.slice(0, 5).map((member, i) => (
                      <li
                        key={i}
                        className={`p-4 rounded-xl shadow-sm flex justify-between items-center border animation ${
                          lightTheme
                            ? "bg-slate-800 border-slate-700 hover:bg-slate-700"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {/* Left side - Member Avatar + Name */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm ${
                              lightTheme
                                ? "bg-slate-700 text-blue-300"
                                : "bg-indigo-100 text-indigo-600"
                            } animation`}
                          >
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-base md:text-lg block truncate max-w-[200px]">
                              {member.name}
                            </span>
                            <span className="text-xs text-gray-400">
                              {member.email}
                            </span>
                          </div>
                        </div>

                        {/* Right side - Role/Status */}
                        <span
                          className={`px-3 w-20 text-center py-2 rounded-full text-xs font-semibold tracking-wide ${
                            member.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          } capitalize`}
                        >
                          {member.status}
                        </span>
                      </li>
                    ))
                  ) : (
                    <div className="flex items-center justify-center">
                      <img
                        src={membersFallback}
                        alt="Loading Books"
                        className="w-40 h-40"
                      />
                    </div>
                  )}
                </ul>
              </section>
            </div>

            {/* Footer Section */}
            <Footer />
          </div>
        </section>
      </div>
    </section>
  );
};

export default DashBoard;
