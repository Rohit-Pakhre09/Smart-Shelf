import { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AppContext } from "../contexts/AppProvider";
import Footer from "../components/Footer";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";

const booksUrl = "https://smart-shelf-server-qm2u.onrender.com/books";
const membersUrl = "https://smart-shelf-server-qm2u.onrender.com/members";
const issuedBooksUrl = "https://smart-shelf-server-qm2u.onrender.com/issuedBooks";

const IssuedBooks = () => {
  const { lightTheme, open } = useContext(AppContext);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(8);
  const [actionLoading, setActionLoading] = useState({});
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [issuedBooksRes, booksRes, membersRes] = await Promise.all([
          axios.get(issuedBooksUrl),
          axios.get(booksUrl),
          axios.get(membersUrl),
        ]);

        setIssuedBooks(issuedBooksRes.data.filter((book) => book.status === "issued"));
        setBooks(booksRes.data);
        setMembers(membersRes.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getBook = (issuedBook) => {
    const copyId = issuedBook.copyId || issuedBook.id;
    if (!copyId) return null;
    const book = books.find((book) =>
      book.copies?.some((copy) => copy.id === copyId)
    );
    return book || null;
  };

  const getMemberName = (memberId) => {
    if (!memberId) return "Unknown Member";
    const member = members.find((member) => member.id === memberId);
    return member?.name || "Unknown Member";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusStyles = (status, dueDate) => {
    const today = new Date();
    const due = dueDate ? new Date(dueDate) : null;
    const isOverdue = status === "issued" && due && due < today;

    if (isOverdue) {
      return "bg-red-100 text-red-700 border-red-200";
    }
    switch (status?.toLowerCase()) {
      case "returned":
        return "bg-green-100 text-green-700 border-green-200";
      case "issued":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const isOverdue = (status, dueDate) => {
    const today = new Date();
    const due = dueDate ? new Date(dueDate) : null;
    return status === "issued" && due && due < today;
  };

  const markAsReturned = async (issueId) => {
    setActionLoading((prev) => ({ ...prev, [issueId]: { ...prev[issueId], return: true } }));
    setActionError(null);
    try {
      const today = new Date().toISOString().split("T")[0];
      const issuedBook = issuedBooks.find((book) => book.issueId === issueId);
      if (!issuedBook) {
        throw new Error("Issued book not found in local state.");
      }

      // Update issued book status
      await axios.patch(`${issuedBooksUrl}/${issueId}`, {
        status: "returned",
        returnDate: today,
      });

      // Update book copy status
      const copyId = issuedBook.copyId || issuedBook.id;
      const bookToUpdate = books.find((book) =>
        book.copies?.some((copy) => copy.id === copyId)
      );

      if (bookToUpdate) {
        const updatedCopies = bookToUpdate.copies.map((copy) =>
          copy.id === copyId ? { ...copy, status: "available" } : copy
        );
        await axios.patch(`${booksUrl}/${bookToUpdate.id}`, {
          copies: updatedCopies,
        });

        setBooks((prev) =>
          prev.map((b) =>
            b.id === bookToUpdate.id ? { ...b, copies: updatedCopies } : b
          )
        );
      } else {
        console.warn("Book not found for copyId:", copyId);
      }

      // Remove from issued books list
      setIssuedBooks((prev) =>
        prev.filter((book) => book.issueId !== issueId)
      );
    } catch (err) {
      console.error("Error marking book as returned:", err);
      if (err.response?.status === 404) {
        setActionError(`Book with issue ID ${issueId} not found on the server.`);
      } else {
        setActionError("Failed to mark book as returned. Please try again.");
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [issueId]: { ...prev[issueId], return: false } }));
    }
  };

  const addFine = async (memberId, issueId) => {
    setActionLoading((prev) => ({ ...prev, [issueId]: { ...prev[issueId], fine: true } }));
    setActionError(null);
    try {
      const member = members.find((m) => m.id === memberId);
      if (!member) {
        throw new Error("Member not found.");
      }
      const fineAmount = 50;
      await axios.patch(`${membersUrl}/${memberId}`, {
        outstandingFines: (member?.outstandingFines || 0) + fineAmount,
      });
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId
            ? { ...m, outstandingFines: (m.outstandingFines || 0) + fineAmount }
            : m
        )
      );
    } catch (err) {
      console.error("Error adding fine:", err);
      if (err.response?.status === 404) {
        setActionError(`Member with ID ${memberId} not found on the server.`);
      } else {
        setActionError("Failed to add fine. Please try again.");
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [issueId]: { ...prev[issueId], fine: false } }));
    }
  };

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentIssuedBooks = issuedBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(issuedBooks.length / booksPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    const scrollContainer = document.querySelector(".overflow-y-scroll");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let startPage = Math.max(2, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);
      if (startPage > 2) {
        pages.push("...");
      }
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <section className="flex min-h-screen">
      <div className="fixed hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 transition-all duration-500">
        <Navbar />
        <section className="flex-1 pt-0 lg:pt-[70px] m-0 lg:m-2.5 transition-all duration-500">
          <div
            className={`h-[calc(100vh-70px-50px)] overflow-y-scroll scrollbar-thin overflow-x-hidden pr-0 lg:pr-2 rounded-xl transition-all duration-500 lg:mt-6 ${open ? "lg:ml-68 lg:w-[calc(100%-17rem)]" : "lg:ml-24 lg:w-[calc(100%-6rem)]"
              }`}
          >
            <p
              className={`${lightTheme ? "text-white" : "text-gray-900"
                } text-3xl pb-3 mt-5 pl-5 font-bold transition-all duration-500`}
            >
              Issued Books
            </p>
            {(error || actionError) && (
              <div
                className={`mx-5 mb-4 p-3 rounded-lg text-sm ${lightTheme ? "bg-red-900 text-red-300" : "bg-red-100 text-red-700"
                  } flex justify-between items-center`}
              >
                <span>{error || actionError}</span>
                <button
                  onClick={() => {
                    setError(null);
                    setActionError(null);
                  }}
                  className="ml-2 text-red-600 hover:text-red-800 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}
            <div className="min-h-full flex flex-col gap-5 p-3">
              <section
                className={`w-full flex-1 ${lightTheme ? "bg-slate-900 text-white" : "bg-white text-gray-900"
                  } rounded-2xl p-6 shadow-lg transition-all duration-300`}
              >
                {isLoading ? (
                  <div className="flex justify-center items-center min-h-[100vh] w-full">
                    <span className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
                  </div>
                ) : issuedBooks.length === 0 ? (
                  <div
                    className={`flex flex-col items-center justify-center min-h-[50vh] w-full rounded-xl ${lightTheme ? "bg-slate-800" : "bg-gray-50"
                      }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-16 h-16 ${lightTheme ? "text-gray-500" : "text-gray-400"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 006 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                      />
                    </svg>
                    <p className="mt-4 text-gray-500">No issued books available</p>
                  </div>
                ) : (
                  <>
                    <ul className="space-y-3">
                      {currentIssuedBooks.map((issuedBook, i) => {
                        const book = getBook(issuedBook);
                        return (
                          <li
                            key={issuedBook.issueId || i}
                            className={`p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center border transition-all duration-200 ${lightTheme
                              ? "bg-slate-800 border-slate-700 hover:bg-slate-700"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                              }`}
                          >
                            <div className="flex flex-col md:flex-row gap-4">
                              {book?.coverImage && (
                                <img
                                  src={book.coverImage}
                                  alt={book.title}
                                  className="w-16 h-24 object-cover rounded-lg shadow-md"
                                  onError={(e) => {
                                    e.target.src = "/placeholder-book.jpg"; // Fallback image
                                  }}
                                />
                              )}
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm ${lightTheme ? "bg-slate-700 text-blue-300" : "bg-indigo-100 text-indigo-600"
                                      } transition-all duration-200`}
                                  >
                                    <span>{book?.title?.charAt(0).toUpperCase() || "B"}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-base md:text-lg block truncate max-w-[200px] md:max-w-[300px]">
                                      {book?.title || "Unknown Book"}
                                    </span>
                                    <span className="text-xs text-gray-400">Issue ID: {issuedBook.issueId}</span>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-400 space-y-1">
                                  <p>
                                    <span className="font-medium text-gray-500">Member:</span>{" "}
                                    {getMemberName(issuedBook.memberId)}
                                  </p>
                                  <p>
                                    <span className="font-medium text-gray-500">Issued By:</span> {issuedBook.issuedBy}
                                  </p>
                                  <p>
                                    <span className="font-medium text-gray-500">Issue Date:</span>{" "}
                                    {formatDate(issuedBook.issueDate)}
                                  </p>
                                  <p>
                                    <span className="font-medium text-gray-500">Due Date:</span>{" "}
                                    {formatDate(issuedBook.dueDate)}
                                  </p>
                                  <p>
                                    <span className="font-medium text-gray-500">Return Date:</span>{" "}
                                    {formatDate(issuedBook.returnDate)}
                                  </p>
                                  <p>
                                    <span className="font-medium text-gray-500">Renewals:</span>{" "}
                                    {issuedBook.renewals || 0}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 md:mt-0">
                              <span
                                className={`px-3 w-24 text-center py-2 rounded-full text-xs font-semibold tracking-wide border capitalize ${getStatusStyles(
                                  issuedBook.status,
                                  issuedBook.dueDate
                                )}`}
                              >
                                {isOverdue(issuedBook.status, issuedBook.dueDate) ? "overdue" : issuedBook.status}
                              </span>
                              {issuedBook.status === "issued" && (
                                <button
                                  onClick={() => markAsReturned(issuedBook.issueId)}
                                  disabled={actionLoading[issuedBook.issueId]?.return}
                                  className={`px-3 py-1 rounded-lg text-sm ${lightTheme
                                    ? "bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
                                    : "bg-green-500 text-white hover:bg-green-600 active:bg-green-700"
                                    } disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 flex items-center justify-center min-w-[100px]`}
                                >
                                  {actionLoading[issuedBook.issueId]?.return ? (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  ) : (
                                    "Mark Returned"
                                  )}
                                </button>
                              )}
                              {isOverdue(issuedBook.status, issuedBook.dueDate) && (
                                <button
                                  onClick={() => addFine(issuedBook.memberId, issuedBook.issueId)}
                                  disabled={actionLoading[issuedBook.issueId]?.fine}
                                  className={`px-3 py-1 rounded-lg text-sm ${lightTheme
                                    ? "bg-red-600 text-white hover:bg-red-700 active:bg-red-800"
                                    : "bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
                                    } disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 flex items-center justify-center min-w-[100px]`}
                                >
                                  {actionLoading[issuedBook.issueId]?.fine ? (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  ) : (
                                    "Add Fine"
                                  )}
                                </button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    {issuedBooks.length > booksPerPage && (
                      <section
                        className={`flex justify-center items-center gap-1 sm:gap-2 p-3 sm:p-4 transition-all ${lightTheme ? "bg-slate-900" : "bg-white"
                          }`}
                      >
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-full ${lightTheme
                            ? currentPage === 1
                              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                              : "bg-gray-600 text-white hover:bg-gray-700"
                            : currentPage === 1
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                            } transition-all duration-200 transform hover:scale-105 disabled:transform-none`}
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        {getPageNumbers().map((page, index) => (
                          <button
                            key={index}
                            onClick={() => typeof page === "number" && paginate(page)}
                            className={`px-3 py-1 rounded-lg text-sm sm:text-base ${lightTheme
                              ? currentPage === page
                                ? "bg-indigo-600 text-white"
                                : typeof page === "number"
                                  ? "bg-gray-600 text-white hover:bg-gray-700"
                                  : "bg-slate-900 text-gray-400 cursor-default"
                              : currentPage === page
                                ? "bg-indigo-500 text-white"
                                : typeof page === "number"
                                  ? "bg-gray-300 text-gray-800 hover:bg-gray-400"
                                  : "bg-white text-gray-400 cursor-default"
                              } transition-all duration-200 transform hover:scale-105 disabled:transform-none`}
                            disabled={typeof page !== "number"}
                            aria-current={currentPage === page ? "page" : undefined}
                            aria-label={
                              typeof page === "number" ? `Page ${page}` : "Pagination ellipsis"
                            }
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`p-2 rounded-full ${lightTheme
                            ? currentPage === totalPages
                              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                              : "bg-gray-600 text-white hover:bg-gray-700"
                            : currentPage === totalPages
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                            } transition-all duration-200 transform hover:scale-105 disabled:transform-none`}
                          aria-label="Next page"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </section>
                    )}
                  </>
                )}
              </section>
            </div>
            <Footer />
          </div>
        </section>
      </div>
    </section>
  );
};

export default IssuedBooks;