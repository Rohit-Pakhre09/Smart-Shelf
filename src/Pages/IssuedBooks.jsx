import { useContext, useEffect, useMemo, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AppContext } from "../contexts/AppProvider";
import Footer from "../components/Footer";
import axios from "axios";
import { CheckCircle, Calendar, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import issuedBookFallback from "../assets/issueBooksFallback.svg"

// API Endpoints
const booksUrl = "https://smart-shelf-server-qm2u.onrender.com/books";
const membersUrl = "https://smart-shelf-server-qm2u.onrender.com/members";
const issuedBooksUrl = "https://smart-shelf-server-qm2u.onrender.com/issuedBooks";
const alternativeIssuedBooksUrl = "https://smart-shelf-server-qm2u.onrender.com/issued-books";
const issuesUrl = "https://smart-shelf-server-qm2u.onrender.com/issues";

// Debouncing Hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const IssuedBooks = () => {
  const { lightTheme, open } = useContext(AppContext);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [actionError, setActionError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [returnButtonText, setReturnButtonText] = useState({});
  const [booksPerPage] = useState(8);
  const isMounted = useRef(true);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedSortBy = useDebounce(sortBy, 300);

  // Normalize issuedBooks data
  const normalizeIssuedBooks = (data) => {
    const validBooks = data
      .filter((book) => {
        const copyId = book.copyId || book.bookId || book.id;
        const memberId = book.memberId;
        if (!copyId || typeof copyId !== "string" || !copyId.includes("-")) {
          console.warn("Skipping issued book with invalid copyId:", book);
          return false;
        }
        if (!memberId || typeof memberId !== "string") {
          console.warn("Skipping issued book with invalid memberId:", book);
          return false;
        }
        return true;
      })
      .map((book) => ({
        id: book.issueId || book.id || `unknown-${Math.random().toString(36).substr(2, 9)}`,
        bookId: book.copyId || book.bookId || book.id,
        memberId: book.memberId,
        issuedBy: book.issuedBy || "N/A",
        issueDate: book.issueDate || new Date().toISOString().split("T")[0],
        dueDate: book.dueDate || new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split("T")[0],
        returnDate: book.returnDate || null,
        status: book.status || "issued",
        renewals: book.renewals || 0,
      }));
    if (validBooks.length !== data.length) {
      console.warn(`Filtered out ${data.length - validBooks.length} invalid issued book records`);
    }
    return validBooks;
  };

  // Utility functions
  const getBook = (issuedBook) => {
    const bookId = issuedBook.bookId;
    if (!bookId || typeof bookId !== "string") {
      console.warn("Invalid or missing bookId for issued book:", issuedBook);
      return { title: "Unknown Book", img: null };
    }
    const book = books.find((book) =>
      book.copies?.some((copy) => copy.id === bookId)
    );
    if (!book) {
      console.warn("No book found for bookId:", bookId);
    }
    return book || { title: "Unknown Book", img: null };
  };

  const getMemberName = (memberId) => {
    if (!memberId || typeof memberId !== "string") {
      console.warn("Invalid or missing memberId:", memberId);
      return "Unknown Member";
    }
    const member = members.find((member) => member.id === memberId);
    if (!member) {
      console.warn("No member found for memberId:", memberId);
    }
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
      return lightTheme
        ? "bg-red-900 text-red-300 border-red-700"
        : "bg-red-100 text-red-700 border-red-200";
    }
    switch (status?.toLowerCase()) {
      case "returned":
        return lightTheme
          ? "bg-green-900 text-green-300 border-green-700"
          : "bg-green-100 text-green-700 border-green-200";
      case "issued":
        return lightTheme
          ? "bg-yellow-900 text-yellow-300 border-yellow-700"
          : "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return lightTheme
          ? "bg-gray-700 text-gray-300 border-gray-600"
          : "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const isOverdue = (status, dueDate) => {
    const today = new Date();
    const due = dueDate ? new Date(dueDate) : null;
    return status === "issued" && due && due < today;
  };

  const isDueToday = (status, dueDate) => {
    const today = new Date();
    const due = dueDate ? new Date(dueDate) : null;
    return (
      status === "issued" &&
      due &&
      due.getDate() === today.getDate() &&
      due.getMonth() === today.getMonth() &&
      due.getFullYear() === today.getFullYear()
    );
  };

  // Filter and sort issued books
  const filteredBooks = useMemo(() => {
    const filtered = issuedBooks
      .filter((issuedBook) => {
        const book = getBook(issuedBook);
        const memberName = getMemberName(issuedBook.memberId).toLowerCase();
        const query = debouncedSearchQuery.toLowerCase();
        return (
          book?.title?.toLowerCase().includes(query) ||
          memberName.includes(query) ||
          issuedBook.id?.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (debouncedSortBy === "issueDate") {
          return new Date(a.issueDate) - new Date(b.issueDate);
        }
        if (debouncedSortBy === "dueDate") {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        if (debouncedSortBy === "member") {
          return getMemberName(a.memberId).localeCompare(getMemberName(b.memberId));
        }
        return 0;
      });
    return filtered;
  }, [issuedBooks, debouncedSearchQuery, debouncedSortBy]);

  // Pagination
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentIssuedBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  // Fetch data with retry mechanism
  useEffect(() => {
    isMounted.current = true;
    const abortController = new AbortController();

    const fetchData = async (retries = 5) => {
      setIsLoading(true);
      try {
        // Simulate slight delay for testing spinner visibility (remove in production if not needed)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const [issuedBooksRes, booksRes, membersRes] = await Promise.all([
          axios.get(issuedBooksUrl, { signal: abortController.signal }).catch((err) => {
            console.warn("Issued books fetch failed:", err);
            return { data: [] };
          }),
          axios.get(booksUrl, { signal: abortController.signal }).catch((err) => {
            console.warn("Books fetch failed:", err);
            return { data: [] };
          }),
          axios.get(membersUrl, { signal: abortController.signal }).catch((err) => {
            console.warn("Members fetch failed:", err);
            return { data: [] };
          }),
        ]);

        if (!isMounted.current) return;

        if (!issuedBooksRes.data.length) {
          setError("No issued books found. Please check the backend.");
          setIsLoading(false);
          return;
        }
        if (!booksRes.data.length) {
          setError("No books found. Please check the backend.");
          setIsLoading(false);
          return;
        }
        if (!membersRes.data.length) {
          setError("No members found. Please check the backend.");
          setIsLoading(false);
          return;
        }

        const normalizedIssuedBooks = normalizeIssuedBooks(issuedBooksRes.data);

        setIssuedBooks(normalizedIssuedBooks);
        setBooks(booksRes.data);
        setMembers(membersRes.data);
        setError(null);

        const unmatchedBooks = normalizedIssuedBooks.filter((b) => !books.some(book => book.copies?.some(copy => copy.id === b.bookId)));
        const unmatchedMembers = normalizedIssuedBooks.filter((b) => !members.some(m => m.id === b.memberId));
        if (unmatchedBooks.length || unmatchedMembers.length) {
          console.warn("Unmatched Books:", unmatchedBooks);
          console.warn("Unmatched Members:", unmatchedMembers);
          if (retries > 0) {
            console.warn(`Retrying fetch due to missing matches (${retries} attempts left)`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return fetchData(retries - 1);
          } else {
            setError("Some issued books lack matching books or members. Displaying available data.");
          }
        }
      } catch (err) {
        if (err.name === "AbortError") {
        } else if (retries > 0) {
          console.warn(`Fetch failed, retrying (${retries} attempts left):`, err);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return fetchData(retries - 1);
        } else {
          console.error("Error fetching data:", err);
          setError("Failed to load data. Please try again later.");
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted.current = false;
      abortController.abort();
    };
  }, []);

  // Refetch issued books
  const refetchIssuedBooks = useCallback(async () => {
    try {
      const response = await axios.get(issuedBooksUrl);
      if (isMounted.current) {
        const normalized = normalizeIssuedBooks(response.data);
        setIssuedBooks(normalized);
        setActionError(null);
        normalized.forEach((issuedBook) => {
          if (!getBook(issuedBook)) {
            console.warn("Refetched issued book without matching book:", issuedBook);
          }
        });
      }
    } catch (err) {
      console.error("Error refetching issued books:", err);
      if (isMounted.current) {
        setActionError("Failed to refresh issued books. Please try again.");
      }
    }
  }, []);

  // Mark book as returned
  const markAsReturned = useCallback(async (id) => {
    const issuedBook = issuedBooks.find((book) => book.id === id);
    if (!issuedBook) {
      console.error("Issued book not found for id:", id);
      setActionError("Issued book not found in local data.");
      return;
    }

    if (issuedBook.status === "returned") {
      console.warn("Book already returned:", id);
      setActionError("Book is already marked as returned.");
      return;
    }

    const isBookOverdue = isOverdue(issuedBook.status, issuedBook.dueDate);
    if (isBookOverdue) {
      const confirmReturn = window.confirm(
        "This book is overdue. Are you sure you want to mark it as returned?"
      );
      if (!confirmReturn) {
        return;
      }
    } else {
      const confirmReturn = window.confirm(
        `Are you sure you want to mark "${getBook(issuedBook)?.title || "this book"}" as returned?`
      );
      if (!confirmReturn) {
        return;
      }
    }

    setActionLoading((prev) => ({ ...prev, [id]: { ...prev[id], return: true } }));
    setActionError(null);

    try {
      const today = new Date().toISOString().split("T")[0];
      const abortController = new AbortController();
      let response;

      const identifiers = [id, issuedBook.issueId].filter(Boolean);
      const endpoints = [
        issuedBooksUrl,
        alternativeIssuedBooksUrl,
        issuesUrl,
      ];

      for (const identifier of identifiers) {
        for (const endpoint of endpoints) {
          const url = `${endpoint}/${identifier}`;
          try {
            response = await axios.patch(
              url,
              { status: "returned", returnDate: today },
              { signal: abortController.signal }
            );
            break;
          } catch (patchErr) {
            console.warn(`PATCH to ${url} failed:`, patchErr.response?.data || patchErr.message);
            if (patchErr.response?.status === 404) {
              try {
                response = await axios.put(
                  url,
                  { ...issuedBook, status: "returned", returnDate: today },
                  { signal: abortController.signal }
                );
                break;
              } catch (putErr) {
                console.warn(`PUT to ${url} failed:`, putErr.response?.data || putErr.message);
                try {
                  response = await axios.post(
                    `${url}/return`,
                    { status: "returned", returnDate: today },
                    { signal: abortController.signal }
                  );
                  break;
                } catch (postErr) {
                  console.warn(`POST to ${url}/return failed:`, postErr.response?.data || postErr.message);
                }
              }
            } else {
              throw patchErr;
            }
          }
        }
        if (response) break;
      }

      if (!response) {
        throw new Error("All endpoints and methods failed");
      }

      const bookId = issuedBook.bookId;
      const bookToUpdate = books.find((book) =>
        book.copies?.some((copy) => copy.id === bookId)
      );
      if (bookToUpdate) {
        const updatedCopies = bookToUpdate.copies.map((copy) =>
          copy.id === bookId ? { ...copy, availability: "available" } : copy
        );
        const bookResponse = await axios.patch(
          `${booksUrl}/${bookToUpdate.id}`,
          { copies: updatedCopies },
          { signal: abortController.signal }
        );
        setBooks((prev) =>
          prev.map((b) =>
            b.id === bookToUpdate.id ? { ...b, copies: updatedCopies } : b
          )
        );
      } else {
        console.warn("Book not found for bookId:", bookId);
        setActionError("Book not found for the given book ID. Refreshing data...");
        await refetchIssuedBooks();
      }

      setIssuedBooks((prev) => {
        const updatedBooks = prev.map((book) =>
          book.id === id
            ? { ...book, status: "returned", returnDate: today }
            : book
        );
        return updatedBooks;
      });
      setReturnButtonText((prev) => {
        const updatedText = { ...prev, [id]: "Returned" };
        return updatedText;
      });
    } catch (err) {
      if (err.name === "AbortError") {
      } else {
        console.error("Error marking book as returned:", err.response?.data || err.message);
        setActionError(
          `Failed to mark book as returned: ${err.response?.data?.message || err.message}. Refreshing data...`
        );
        await refetchIssuedBooks();
      }
    } finally {
      setActionLoading((prev) => {
        const updated = { ...prev, [id]: { ...prev[id], return: false } };
        return updated;
      });
    }
  }, [issuedBooks, books, refetchIssuedBooks]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    const scrollContainer = document.querySelector(".overflow-y-scroll");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Statistics
  const totalIssuedBooks = isLoading ? (
    <span className="inline-flex space-x-1">
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
    </span>
  ) : (
    issuedBooks.filter((book) => book.status === "issued").length
  );

  const returnedBooks = isLoading ? (
    <span className="inline-flex space-x-1">
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
    </span>
  ) : (
    issuedBooks.filter((book) => book.status === "returned").length
  );

  const dueTodayBooks = isLoading ? (
    <span className="inline-flex space-x-1">
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
    </span>
  ) : (
    issuedBooks.filter((book) => isDueToday(book.status, book.dueDate)).length
  );

  return (
    <section className="flex min-h-screen">
      <div className="fixed hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 transition-all duration-500">
        <Navbar />
        <section className="flex-1 pt-0 lg:pt-[70px] m-0 lg:m-2.5 transition-all duration-500">
          <div
            className={`h-[calc(100vh-70px-50px)] overflow-y-scroll scrollbar-thin overflow-x-hidden pr-0 lg:pr-2 rounded-xl transition-all duration-500 lg:mt-6 ${open ? "lg:ml-68 lg:w-[calc(100%-17rem)]" : "lg:ml-24 lg:w-[calc(100%-6rem)]"}`}
          >
            <div className="flex justify-between items-center">
              <p
                className={`${lightTheme ? "text-white" : "text-gray-900"} text-3xl pb-3 mt-5 pl-5 font-bold transition-all duration-500`}
              >
                Issued Books
              </p>
            </div>
            <div className="flex flex-col gap-5 p-3">
              {/* Statistics Section */}
              <section
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 rounded-2xl shadow-lg transition-colors justify-center ${lightTheme ? "bg-gray-900" : "bg-white"}`}
              >
                <div
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl shadow-sm hover:scale-102 shadow-blue-400 w-full max-w-md mx-auto ${lightTheme ? "bg-gray-800" : "bg-gray-100"}`}
                >
                  <BookOpen
                    className={`w-10 h-10 ${lightTheme ? "text-blue-400" : "text-blue-600"}`}
                  />
                  <p
                    className={`font-medium text-lg ${lightTheme ? "text-gray-200" : "text-gray-800"}`}
                  >
                    Total Issued Books
                  </p>
                  <p
                    className={`text-3xl font-bold ${lightTheme ? "text-white" : "text-gray-900"}`}
                  >
                    {totalIssuedBooks}
                  </p>
                </div>
                <div
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl shadow-sm hover:scale-102 shadow-blue-400 w-full max-w-md mx-auto ${lightTheme ? "bg-gray-800" : "bg-gray-100"}`}
                >
                  <CheckCircle
                    className={`w-10 h-10 ${lightTheme ? "text-green-400" : "text-green-600"}`}
                  />
                  <p
                    className={`font-medium text-lg ${lightTheme ? "text-gray-200" : "text-gray-800"}`}
                  >
                    Returned Books
                  </p>
                  <p
                    className={`text-3xl font-bold ${lightTheme ? "text-white" : "text-gray-900"}`}
                  >
                    {returnedBooks}
                  </p>
                </div>
                <div
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl shadow-sm hover:scale-102 shadow-blue-400 w-full max-w-md mx-auto ${lightTheme ? "bg-gray-800" : "bg-gray-100"}`}
                >
                  <Calendar
                    className={`w-10 h-10 ${lightTheme ? "text-yellow-400" : "text-yellow-600"}`}
                  />
                  <p
                    className={`font-medium text-lg ${lightTheme ? "text-gray-200" : "text-gray-800"}`}
                  >
                    Due Today
                  </p>
                  <p
                    className={`text-3xl font-bold ${lightTheme ? "text-white" : "text-gray-900"}`}
                  >
                    {dueTodayBooks}
                  </p>
                </div>
              </section>
              {/* Filter and Sort Section */}
              <section
                className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl shadow-md ${lightTheme ? "bg-gray-900" : "bg-white"}`}
              >
                <div
                  className={`flex items-center w-full md:max-w-lg px-4 py-2 border rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 ${lightTheme ? "bg-gray-800 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 mr-2 ${lightTheme ? "text-gray-300" : "text-gray-500"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                    />
                  </svg>
                  <input
                    className={`flex-1 bg-transparent outline-none text-sm md:text-base ${lightTheme ? "text-white placeholder-gray-400" : "text-gray-700 placeholder-gray-400"}`}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, member, or ID..."
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                  <select
                    className={`px-4 py-2 rounded-lg shadow-sm border text-sm cursor-pointer w-full sm:w-auto ${lightTheme ? "bg-gray-800 text-white border-gray-600" : "bg-white text-gray-700 border-gray-300"}`}
                    onChange={(e) => setSortBy(e.target.value)}
                    value={sortBy}
                  >
                    <option value="">Sort By</option>
                    <option value="issueDate">Issue Date</option>
                    <option value="dueDate">Due Date</option>
                    <option value="member">Member Name</option>
                  </select>
                </div>
              </section>
              {/* Issued Books List */}
              <section
                className={`w-full flex-1 ${lightTheme ? "bg-gray-900 text-white" : "bg-white text-gray-900"} rounded-2xl p-6 shadow-lg transition-all duration-300`}
              >
                {isLoading ? (
                  <div className="flex justify-center items-center min-h-[50vh] w-full col-span-full">
                    <span className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
                  </div>
                ) : filteredBooks.length === 0 ? (
                  <div
                    className={`flex flex-col items-center justify-center min-h-[50vh] w-full rounded-xl ${lightTheme ? "bg-gray-800" : "bg-gray-50"}`}
                  >
                    <img src={issuedBookFallback} className="h-60 w-60" alt="No issue book found" />
                    <p className="mt-4 text-gray-500">No issued books found</p>
                  </div>
                ) : (
                  <>
                    <ul className="space-y-3">
                      {currentIssuedBooks.map((issuedBook, i) => {
                        const book = getBook(issuedBook);
                        return (
                          <li
                            key={issuedBook.id || i}
                            className={`p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center border transition-all duration-200 hover:scale-[1.01] ${lightTheme ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-gray-50 border-gray-200 hover:bg-gray-100"}`}
                          >
                            <div className="flex flex-col md:flex-row gap-4">
                              {book?.img && (
                                <img
                                  src={book.img}
                                  alt={book.title}
                                  className="w-16 h-24 object-cover rounded-lg shadow-md"
                                  onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/100x150?text=Book+Cover";
                                  }}
                                  loading="lazy"
                                />
                              )}
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                  {!book.img && (
                                    <div
                                      className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm ${lightTheme ? "bg-gray-700 text-indigo-300" : "bg-indigo-100 text-indigo-600"} transition-all duration-200`}
                                    >
                                      <span>B</span>
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-medium text-base md:text-lg block truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">
                                      {book.title}
                                    </span>
                                    <span className="text-xs text-gray-400">ID: {issuedBook.id}</span>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-400 space-y-1">
                                  <p>
                                    <span className="font-medium text-gray-500">Member:</span>{" "}
                                    {getMemberName(issuedBook.memberId)}
                                  </p>
                                  <p>
                                    <span className="font-medium text-gray-500">Issued By:</span>{" "}
                                    {issuedBook.issuedBy || "N/A"}
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
                                  <p>
                                    <span className="font-medium text-gray-500">Status:</span>{" "}
                                    {issuedBook.status || "Unknown"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 md:mt-0 flex-wrap">
                              <span
                                className={`px-3 py-2 rounded-full text-xs font-semibold tracking-wide border capitalize ${getStatusStyles(issuedBook.status, issuedBook.dueDate)}`}
                              >
                                {isOverdue(issuedBook.status, issuedBook.dueDate) ? "Overdue" : issuedBook.status || "Unknown"}
                              </span>
                              {issuedBook.status === "issued" && (
                                <button
                                  onClick={() => markAsReturned(issuedBook.id)}
                                  disabled={actionLoading[issuedBook.id]?.return || issuedBook.status === "returned"}
                                  className={`px-3 py-1 rounded-lg text-sm ${lightTheme ? "bg-green-600 text-white hover:bg-green-700 active:bg-green-800" : "bg-green-500 text-white hover:bg-green-600 active:bg-green-700"} disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 flex items-center justify-center min-w-[100px] transition-all duration-200 hover:scale-105`}
                                >
                                  {actionLoading[issuedBook.id]?.return ? (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  ) : (
                                    returnButtonText[issuedBook.id] || "Mark Returned"
                                  )}
                                </button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    {filteredBooks.length > booksPerPage && (
                      <section
                        className={`flex justify-center items-center gap-1 sm:gap-2 p-3 sm:p-4 transition-all ${lightTheme ? "bg-gray-900" : "bg-white"}`}
                      >
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-full ${lightTheme ? currentPage === 1 ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-gray-600 text-white hover:bg-gray-700" : currentPage === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-300 text-gray-800 hover:bg-gray-400"} transition-all duration-200 transform hover:scale-105 disabled:transform-none`}
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => paginate(page)}
                            className={`px-3 py-1 rounded-lg text-sm sm:text-base ${lightTheme ? currentPage === page ? "bg-indigo-600 text-white" : "bg-gray-600 text-white hover:bg-gray-700" : currentPage === page ? "bg-indigo-500 text-white" : "bg-gray-300 text-gray-800 hover:bg-gray-400"} transition-all duration-200 transform hover:scale-105`}
                            aria-current={currentPage === page ? "page" : undefined}
                            aria-label={`Page ${page}`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`p-2 rounded-full ${lightTheme ? currentPage === totalPages ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-gray-600 text-white hover:bg-gray-700" : currentPage === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-300 text-gray-800 hover:bg-gray-400"} transition-all duration-200 transform hover:scale-105 disabled:transform-none`}
                          aria-label="Next page"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </section>
                    )}
                  </>
                )}
              </section>
              <Footer />
            </div>

          </div>
        </section>
      </div>
    </section>
  );
};

IssuedBooks.propTypes = {
  lightTheme: PropTypes.bool,
  open: PropTypes.bool,
};

export default IssuedBooks;