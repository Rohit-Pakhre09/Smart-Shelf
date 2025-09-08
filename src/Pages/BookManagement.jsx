import { useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AppContext } from "../contexts/AppProvider";
import Footer from "../components/Footer";
import {
  BookOpen,
  Users,
  Star,
  Bookmark,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import BookCard from "../components/BookCard";
import BookNotFound from "../assets/undraw_taken_mshk.svg";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBooks,
  fetchIssuedBooks,
  addBook,
  updateBook,
  deleteBook,
  clearError,
  issueBook,
} from "../modules/booksSlice";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Debouncing Function
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

// Book Modal
const BookFormModal = ({
  showModal,
  setShowModal,
  modalType,
  selectedBook,
  lightTheme,
  dispatch,
  setError,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    publisher: "",
    language: "",
    year: "",
    pages: "",
    description: "",
    price: "",
    img: "",
    popularity: "",
    copies: [],
  });
  const [newCopy, setNewCopy] = useState({
    id: "",
    isbn: "",
    availability: "available",
    edition: "",
    condition: "new",
    addedOn: new Date().toISOString(),
  });
  const [localError, setLocalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate props and handle invalid selectedBook
  useEffect(() => {
    if (!showModal) {
      document.title = "Smart Shelf";
      setLocalError(null);
      dispatch(clearError());
      return;
    }

    // Handle document title
    document.title = "Books | Smart Shelf";

    // Validate modalType
    if (!["add", "edit", "view"].includes(modalType)) {
      console.error("Invalid modalType:", modalType);
      setError("Invalid modal type. Please try again.");
      setShowModal(false);
      return;
    }

    // Handle form data initialization
    if (modalType !== "add" && (!selectedBook || !selectedBook.id || typeof selectedBook !== "object")) {
      console.error("Invalid selectedBook:", selectedBook);
      setError("Invalid book data. Please try again.");
      setShowModal(false);
      return;
    }

    if (modalType !== "add" && selectedBook) {
      setFormData({
        title: selectedBook.title || "",
        author: selectedBook.author || "",
        genre: Array.isArray(selectedBook.genre)
          ? selectedBook.genre.join(", ")
          : selectedBook.genre || "",
        publisher: selectedBook.publisher || "",
        language: selectedBook.language || "",
        year: selectedBook.year ? String(selectedBook.year) : "",
        pages: selectedBook.pages ? String(selectedBook.pages) : "",
        description: selectedBook.description || "",
        price: selectedBook.price ? String(selectedBook.price) : "",
        img: selectedBook.img || "",
        popularity: selectedBook.popularity
          ? String(selectedBook.popularity)
          : "",
        copies: Array.isArray(selectedBook.copies)
          ? [...selectedBook.copies]
          : [],
      });
    } else if (modalType === "add") {
      setFormData({
        title: "",
        author: "",
        genre: "",
        publisher: "",
        language: "",
        year: "",
        pages: "",
        description: "",
        price: "",
        img: "",
        popularity: "",
        copies: [],
      });
      setNewCopy({
        id: "",
        isbn: "",
        availability: "available",
        edition: "",
        condition: "new",
        addedOn: new Date().toISOString(),
      });
    }

    setLocalError(null);
    dispatch(clearError());

    return () => {
      console.log("Combined useEffect cleanup");
      document.title = "Smart Shelf";
    };
  }, [showModal, modalType, selectedBook, dispatch, setError, setShowModal]);

  if (!showModal) return null;

  const handleAddCopy = () => {
    if (!newCopy.id || !newCopy.isbn) {
      setLocalError("Copy ID and ISBN are required for adding a copy.");
      return;
    }
    if (!/^\d{10}|\d{13}$/.test(newCopy.isbn)) {
      setLocalError("ISBN must be 10 or 13 digits.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      copies: [...prev.copies, { ...newCopy }],
    }));
    setNewCopy({
      id: "",
      isbn: "",
      availability: "available",
      edition: "",
      condition: "new",
      addedOn: new Date().toISOString(),
    });
    setLocalError(null);
  };

  const handleRemoveCopy = (index) => {
    setFormData((prev) => ({
      ...prev,
      copies: prev.copies.filter((_, i) => i !== index),
    }));
  };

  const handleCopyChange = (e) => {
    setNewCopy({ ...newCopy, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["year", "pages", "price", "popularity"].includes(name)) {
      if (value && isNaN(value)) {
        setLocalError(
          `${name.charAt(0).toUpperCase() + name.slice(1)} must be a valid number.`
        );
        return;
      }
      if (name === "year") {
        // Allow empty or partial input without setting an error
        if (!value || isNaN(value)) {
          setLocalError(null); // Clear error for empty or non-numeric input
          setFormData((prev) => ({ ...prev, [name]: value }));
          return;
        }

        const year = Number(value);
        if (year < 1000 || year > new Date().getFullYear()) {
          setLocalError("Year must be between 1000 and the current year.");
        } else {
          setLocalError(null); // Clear error if valid
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      if (name === "pages" && value && value < 1) {
        setLocalError("Pages must be a positive number.");
        return;
      }
      if (name === "price" && value && value < 0) {
        setLocalError("Price cannot be negative.");
        return;
      }
      if (name === "popularity" && value && (value < 0 || value > 5)) {
        setLocalError("Popularity must be between 0 and 5.");
        return;
      }
    }
    setFormData({ ...formData, [name]: value });
    setLocalError(null);
  };

  const handleSubmit = async (e, retries = 3) => {
    e.preventDefault();
    let isMounted = true;
    setLocalError(null);
    setIsSubmitting(true);
    try {
      if (!formData.title || !formData.author) {
        throw new Error("Title and Author are required.");
      }
      if (
        formData.img &&
        !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(formData.img)
      ) {
        throw new Error("Invalid image URL.");
      }
      if (modalType === "edit" && !selectedBook?.id) {
        throw new Error("Invalid book ID. Please select a valid book.");
      }
      const data = {
        title: formData.title,
        author: formData.author,
        genre: formData.genre
          ? formData.genre
            .split(",")
            .map((g) => g.trim())
            .filter((g) => g)
          : [],
        publisher: formData.publisher || undefined,
        language: formData.language || undefined,
        year: formData.year ? Number(formData.year) : undefined,
        pages: formData.pages ? Number(formData.pages) : undefined,
        description: formData.description || undefined,
        price: formData.price ? Number(formData.price) : undefined,
        img: formData.img || undefined,
        popularity: formData.popularity
          ? Number(formData.popularity)
          : undefined,
        copies: Array.isArray(formData.copies) ? formData.copies : [],
      };
      if (modalType === "edit") {
        await dispatch(
          updateBook({ id: String(selectedBook.id), updatedBook: data })
        ).unwrap();
      } else if (modalType === "add") {
        await dispatch(addBook(data)).unwrap();
      }
      await dispatch(fetchBooks()).unwrap();
      if (isMounted) {
        setShowModal(false);
      }
    } catch (err) {
      console.error("Submit error:", err);
      if (err.status >= 500 && retries > 0 && isMounted) {
        console.warn(`Server error (${err.status}). Retrying... (${retries} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return handleSubmit(e, retries - 1);
      }
      const errorMessage =
        typeof err === "string"
          ? err
          : err.message || "Failed to save book. Please check your input and try again.";
      if (isMounted) {
        setLocalError(errorMessage);
        setError(errorMessage);
      }
    } finally {
      if (isMounted) {
        setIsSubmitting(false);
      }
    }
    return () => {
      isMounted = false;
    };
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity p-4 sm:p-5">
      <div
        className={`relative p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg max-h-[80vh] overflow-y-auto scrollbar-thin transform transition-all scale-100 hover:scale-102 ${lightTheme
          ? "bg-gray-800 text-white border border-gray-700"
          : "bg-white text-black border border-gray-200"
          }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            {modalType === "view"
              ? "Book Details"
              : modalType === "edit"
                ? "Edit Book"
                : "Add Book"}
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
            disabled={isSubmitting}
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {localError && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
            {localError}
            <button
              onClick={() => setLocalError(null)}
              className="ml-2 text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}
        {modalType === "view" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Title
              </label>
              <p
                className={`p-3 border rounded-lg ${lightTheme ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                  }`}
              >
                {selectedBook?.title || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Author
              </label>
              <p
                className={`p-3 border rounded-lg ${lightTheme ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                  }`}
              >
                {selectedBook?.author || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Genres
              </label>
              <p
                className={`p-3 border rounded-lg ${lightTheme ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                  }`}
              >
                {Array.isArray(selectedBook?.genre)
                  ? selectedBook.genre.join(", ")
                  : selectedBook?.genre || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Publisher
              </label>
              <p
                className={`p-3 border rounded-lg ${lightTheme ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                  }`}
              >
                {selectedBook?.publisher || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Language
              </label>
              <p
                className={`p-3 border rounded-lg ${lightTheme ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                  }`}
              >
                {selectedBook?.language || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Year
              </label>
              <p
                className={`p-3 border rounded-lg ${lightTheme ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                  }`}
              >
                {selectedBook?.year || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Pages
              </label>
              <p
                className={`p-3 border rounded-lg ${lightTheme ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                  }`}
              >
                {selectedBook?.pages || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Description
              </label>
              <p
                className={`p-3 border rounded-lg ${lightTheme ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                  }`}
              >
                {selectedBook?.description || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Price
              </label>
              <p
                className={`p-3 border rounded-lg ${lightTheme ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                  }`}
              >
                ₹{selectedBook?.price || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Image URL
              </label>
              <p
                className={`p-3 border rounded-lg truncate ${lightTheme ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                  }`}
              >
                {selectedBook?.img || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Popularity
              </label>
              <p
                className={`p-3 border rounded-lg ${lightTheme ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                  }`}
              >
                {selectedBook?.popularity ? `${selectedBook.popularity}/5` : "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Copies
              </label>
              <div
                className={`p-3 border rounded-lg ${lightTheme ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                  }`}
              >
                {selectedBook?.copies && selectedBook.copies.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedBook.copies.map((copy, index) => (
                      <li key={copy.id || `copy-${index}`} className="text-sm">
                        Copy ID: {copy.id || "N/A"}, ISBN: {copy.isbn || "N/A"},
                        Availability: {copy.availability || "N/A"}, Edition: {copy.edition || "N/A"},
                        Condition: {copy.condition || "N/A"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm">No copies available</p>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition-all transform hover:scale-105 text-sm sm:text-base ${lightTheme
                  ? "bg-gray-600 text-white hover:bg-gray-700"
                  : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                  }`}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base ${lightTheme
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-black border-gray-300"
                  }`}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Author
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base ${lightTheme
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-black border-gray-300"
                  }`}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Genres (comma separated)
              </label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base ${lightTheme
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-black border-gray-300"
                  }`}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Publisher
              </label>
              <input
                type="text"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base ${lightTheme
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-black border-gray-300"
                  }`}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Language
              </label>
              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base ${lightTheme
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-black border-gray-300"
                  }`}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Year
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base ${lightTheme
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-black border-gray-300"
                  }`}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Pages
              </label>
              <input
                type="number"
                name="pages"
                value={formData.pages}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base ${lightTheme
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-black border-gray-300"
                  }`}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base ${lightTheme
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-black border-gray-300"
                  }`}
                rows="4"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base ${lightTheme
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-black border-gray-300"
                  }`}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Image URL
              </label>
              <input
                type="text"
                name="img"
                value={formData.img}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base ${lightTheme
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-black border-gray-300"
                  }`}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Popularity
              </label>
              <input
                type="number"
                name="popularity"
                value={formData.popularity}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base ${lightTheme
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-black border-gray-300"
                  }`}
                step="0.01"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Copies
              </label>
              <div
                className={`p-3 border rounded-lg ${lightTheme ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                  }`}
              >
                {formData.copies.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 mb-4">
                    {formData.copies.map((copy, index) => (
                      <li
                        key={copy.id || `copy-${index}`}
                        className="text-sm flex justify-between items-center"
                      >
                        <span>
                          Copy ID: {copy.id || "N/A"}, ISBN: {copy.isbn || "N/A"},
                          Availability: {copy.availability || "N/A"}, Edition: {copy.edition || "N/A"},
                          Condition: {copy.condition || "N/A"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCopy(index)}
                          className={`ml-2 text-red-500 hover:text-red-700 ${lightTheme ? "text-red-400" : "text-red-600"
                            }`}
                          disabled={isSubmitting}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm">No copies added</p>
                )}
              </div>
              <div className="mt-4 space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Copy ID
                  </label>
                  <input
                    type="text"
                    name="id"
                    value={newCopy.id}
                    onChange={handleCopyChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base ${lightTheme
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-black border-gray-300"
                      }`}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    ISBN
                  </label>
                  <input
                    type="text"
                    name="isbn"
                    value={newCopy.isbn}
                    onChange={handleCopyChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base ${lightTheme
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-black border-gray-300"
                      }`}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Availability
                  </label>
                  <select
                    name="availability"
                    value={newCopy.availability}
                    onChange={handleCopyChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base ${lightTheme
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-black border-gray-300"
                      }`}
                    disabled={isSubmitting}
                  >
                    <option value="available">Available</option>
                    <option value="issued">Issued</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Edition
                  </label>
                  <input
                    type="text"
                    name="edition"
                    value={newCopy.edition}
                    onChange={handleCopyChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base ${lightTheme
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-black border-gray-300"
                      }`}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Condition
                  </label>
                  <select
                    name="condition"
                    value={newCopy.condition}
                    onChange={handleCopyChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base ${lightTheme
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-black border-gray-300"
                      }`}
                    disabled={isSubmitting}
                  >
                    <option value="new">New</option>
                    <option value="good">Good</option>
                    <option value="worn">Worn</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddCopy}
                  className={`mt-2 px-4 py-2 rounded-lg font-medium cursor-pointer transition-all transform hover:scale-105 text-sm sm:text-base ${lightTheme
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-green-500 text-white hover:bg-green-600"
                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isSubmitting}
                >
                  Add Copy
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition-all transform hover:scale-105 text-sm sm:text-base ${lightTheme
                  ? "bg-gray-600 text-white hover:bg-gray-700"
                  : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition-all transform hover:scale-105 text-sm sm:text-base flex items-center gap-2 ${lightTheme
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-indigo-500 text-white hover:bg-indigo-600"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                )}
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

BookFormModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  setShowModal: PropTypes.func.isRequired,
  modalType: PropTypes.oneOf(["add", "edit", "view"]).isRequired,
  selectedBook: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    author: PropTypes.string,
    genre: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string,
    ]),
    publisher: PropTypes.string,
    language: PropTypes.string,
    year: PropTypes.number,
    pages: PropTypes.number,
    description: PropTypes.string,
    price: PropTypes.number,
    img: PropTypes.string,
    popularity: PropTypes.number,
    copies: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        isbn: PropTypes.string,
        availability: PropTypes.string,
        edition: PropTypes.string,
        condition: PropTypes.string,
        addedOn: PropTypes.string,
      })
    ),
  }),
  lightTheme: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
};

// Issue Book Modal
const IssueBookModal = ({ showModal, setShowModal, selectedBook, lightTheme, dispatch, setError }) => {
  const [issueData, setIssueData] = useState({
    copyId: "",
    memberId: "",
    issuedBy: "",
    issueDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
  });
  const debouncedIssueData = useDebounce(issueData, 300);
  const [localError, setLocalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate props and handle invalid selectedBook
  useEffect(() => {
    if (!showModal) {
      setLocalError(null);
      dispatch(clearError());
      return;
    }

    if (!selectedBook || !selectedBook.id || typeof selectedBook !== "object") {
      console.error("Invalid selectedBook in IssueBookModal:", selectedBook);
      setError("Invalid book data. Please try again.");
      setShowModal(false);
    }
  }, [showModal, selectedBook, dispatch, setError, setShowModal]);

  if (!showModal) return null;

  const handleChange = (e) => {
    setIssueData({ ...issueData, [e.target.name]: e.target.value });
    setLocalError(null);
  };

  const handleDateChange = (date, name) => {
    setIssueData({ ...issueData, [name]: date });
    setLocalError(null);
  };

  const handleSubmit = async (e, retries = 3) => {
    e.preventDefault();
    let isMounted = true;
    setLocalError(null);
    setIsSubmitting(true);
    try {
      if (!debouncedIssueData.copyId) {
        throw new Error("Please select a copy to issue.");
      }
      if (!debouncedIssueData.memberId.trim()) {
        throw new Error("Member ID is required.");
      }
      if (!debouncedIssueData.issuedBy.trim()) {
        throw new Error("Issued By is required.");
      }
      const issuePayload = {
        copyId: debouncedIssueData.copyId,
        memberId: debouncedIssueData.memberId,
        issuedBy: debouncedIssueData.issuedBy,
        issueDate: debouncedIssueData.issueDate.toISOString().split("T")[0],
        dueDate: debouncedIssueData.dueDate.toISOString().split("T")[0],
        status: "issued",
        renewals: 0,
      };
      await dispatch(
        issueBook({
          bookId: String(selectedBook.id),
          copyId: debouncedIssueData.copyId,
          issueData: issuePayload,
        })
      ).unwrap();
      await dispatch(fetchBooks()).unwrap();
      await dispatch(fetchIssuedBooks()).unwrap();
      if (isMounted) {
        setShowModal(false);
        setIssueData({
          copyId: "",
          memberId: "",
          issuedBy: "",
          issueDate: new Date(),
          dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
        });
      }
    } catch (err) {
      console.error("Issue book error:", err);
      if (err.status >= 500 && retries > 0 && isMounted) {
        console.warn(`Server error (${err.status}). Retrying... (${retries} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return handleSubmit(e, retries - 1);
      }
      const errorMessage =
        typeof err === "string"
          ? err
          : err.message || "Failed to issue book. Please try again.";
      if (isMounted) {
        setLocalError(errorMessage);
        setError(errorMessage);
      }
    } finally {
      if (isMounted) {
        setIsSubmitting(false);
      }
    }
    return () => {
      isMounted = false;
    };
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className={`relative p-6 rounded-xl shadow-2xl max-w-md max-h-[80vh] overflow-y-auto ${lightTheme ? "bg-gray-800 text-white" : "bg-white text-black"
          }`}
      >
        <h2 className="text-2xl font-semibold mb-4">Issue Book: {selectedBook?.title}</h2>
        {localError && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">
            {localError}
            <button
              onClick={() => setLocalError(null)}
              className="ml-2 text-red-600"
            >
              Dismiss
            </button>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Select Copy
            </label>
            <select
              name="copyId"
              value={issueData.copyId}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${lightTheme ? "bg-gray-700 text-white" : "bg-white text-black"
                }`}
              required
              disabled={isSubmitting}
            >
              <option value="">Select a copy</option>
              {selectedBook?.copies
                ?.filter((copy) => copy.availability === "available")
                .map((copy) => (
                  <option key={copy.id} value={copy.id}>
                    Copy ID: {copy.id}, ISBN: {copy.isbn}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Member ID
            </label>
            <input
              type="text"
              name="memberId"
              value={issueData.memberId}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${lightTheme ? "bg-gray-700 text-white" : "bg-white text-black"
                }`}
              required
              placeholder="Enter Member ID"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Issued By
            </label>
            <input
              type="text"
              name="issuedBy"
              value={issueData.issuedBy}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${lightTheme ? "bg-gray-700 text-white" : "bg-white text-black"
                }`}
              required
              placeholder="Enter Issued By"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Issue Date
            </label>
            <DatePicker
              selected={issueData.issueDate}
              onChange={(date) => handleDateChange(date, "issueDate")}
              dateFormat="yyyy-MM-dd"
              className={`w-full p-3 border rounded-lg ${lightTheme ? "bg-gray-700 text-white" : "bg-white text-black"
                }`}
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Due Date
            </label>
            <DatePicker
              selected={issueData.dueDate}
              onChange={(date) => handleDateChange(date, "dueDate")}
              dateFormat="yyyy-MM-dd"
              className={`w-full p-3 border rounded-lg ${lightTheme ? "bg-gray-700 text-white" : "bg-white text-black"
                }`}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${lightTheme
                ? "bg-gray-600 text-white hover:bg-gray-700"
                : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center gap-2 ${lightTheme
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-indigo-500 text-white hover:bg-indigo-600"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
              )}
              Issue Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

IssueBookModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  setShowModal: PropTypes.func.isRequired,
  selectedBook: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    copies: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        isbn: PropTypes.string,
        availability: PropTypes.string,
      })
    ),
  }),
  lightTheme: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
};

// Main Logic
const BookManagement = () => {
  const [title, setTitle] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filterBy, setFilterBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(8);
  const [showModal, setShowModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [modalType, setModalType] = useState(null); // Initialize as null to indicate no modal
  const [selectedBook, setSelectedBook] = useState(null);
  const [error, setError] = useState(null);
  const debouncedTitle = useDebounce(title, 300);
  const debouncedSortBy = useDebounce(sortBy, 300);
  const debouncedFilterBy = useDebounce(filterBy, 300);
  const { lightTheme, open } = useContext(AppContext);
  const dispatch = useDispatch();
  const {
    books,
    issuedBooks,
    loading,
    error: reduxError,
  } = useSelector((state) => state.books);

  // Memoize selectedBook to prevent unnecessary re-renders
  const memoizedSelectedBook = useMemo(() => selectedBook, [selectedBook]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedBooks = await dispatch(fetchBooks()).unwrap();
        console.log("Fetched books:", fetchedBooks);
        // Normalize book IDs to strings
        const normalizedBooks = fetchedBooks.map((book) => ({
          ...book,
          id: String(book.id),
        }));
        // Validate books
        const invalidBooks = normalizedBooks.filter(
          (book) => !book || !book.id || typeof book !== "object"
        );
        if (invalidBooks.length > 0) {
          console.warn("Invalid books detected:", invalidBooks);
          setError("Invalid book data detected in the library. Please refresh or contact support.");
        }
      } catch (err) {
        console.error("Fetch books error:", err);
        setError(err.message || "Failed to fetch books.");
      }
      try {
        await dispatch(fetchIssuedBooks()).unwrap();
      } catch (err) {
        console.error("Fetch issued books error:", err);
        setError(err.message || "Failed to fetch issued books.");
      }
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (reduxError) {
      setError(reduxError);
      setTimeout(() => {
        dispatch(clearError());
        setError(null);
      }, 5000);
    }
  }, [reduxError, dispatch]);

  const booksLength = loading ? (
    <span className="inline-flex space-x-1">
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
    </span>
  ) : (
    books.length
  );

  const authorLength = loading ? (
    <span className="inline-flex space-x-1">
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
    </span>
  ) : books.length > 0 ? (
    new Set(books.map((b) => b.author)).size
  ) : (
    0
  );

  const popularBook = loading ? (
    <span className="inline-flex space-x-1">
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
    </span>
  ) : books.length > 0 ? (
    books.reduce((max, book) => {
      const currentPopularity = Number(book.popularity) || 0;
      const maxPopularity = Number(max?.popularity) || 0;
      if (currentPopularity > maxPopularity) {
        return book;
      }
      if (currentPopularity === maxPopularity && max) {
        return book.title < max.title ? book : max;
      }
      return max || book;
    }, null)?.title || "N/A"
  ) : (
    "N/A"
  );

  const issuedLength = loading ? (
    <span className="inline-flex space-x-1">
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
    </span>
  ) : (
    issuedBooks.length
  );

  const filteredBooks = books
    .filter(
      (book) =>
        book.title?.toLowerCase().includes(debouncedTitle.toLowerCase()) ||
        book.author?.toLowerCase().includes(debouncedTitle.toLowerCase())
    )
    .filter((book) => {
      if (debouncedFilterBy === "fiction") {
        return book.genre?.includes("Fiction");
      }
      if (debouncedFilterBy === "classic") {
        return book.genre?.includes("Classic Literature");
      }
      if (debouncedFilterBy === "legendary") {
        return book.genre?.includes("Legendary");
      }
      if (debouncedFilterBy === "english") {
        return book.language === "English";
      }
      if (debouncedFilterBy === "new") {
        return book.copies?.some((copy) => {
          const addedOn = new Date(copy.addedOn);
          return (Date.now() - addedOn.getTime()) / (1000 * 60 * 60 * 24) <= 30;
        });
      }
      if (debouncedFilterBy === "condition-new") {
        return book.copies?.some((copy) => copy.condition === "new");
      }
      if (debouncedFilterBy === "condition-good") {
        return book.copies?.some((copy) => copy.condition === "good");
      }
      if (debouncedFilterBy === "condition-worn") {
        return book.copies?.some((copy) => copy.condition === "worn");
      }
      if (debouncedFilterBy === "reserved") {
        return book.copies?.some((copy) => copy.availability === "reserved");
      }
      if (debouncedFilterBy === "available") {
        return book.copies?.some((copy) => copy.availability === "available");
      }
      if (debouncedFilterBy === "issued") {
        return book.copies?.some((copy) => copy.availability === "issued");
      }
      return true;
    })
    .sort((a, b) => {
      if (debouncedSortBy === "title")
        return a.title?.localeCompare(b.title) || 0;
      if (debouncedSortBy === "author")
        return a.author?.localeCompare(b.author) || 0;
      if (debouncedSortBy === "popularity")
        return (Number(b.popularity) || 0) - (Number(a.popularity) || 0);
      return 0;
    });

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    const scrollContainer = document.querySelector(".overflow-y-scroll");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleAddBook = () => {
    setSelectedBook(null);
    setModalType("add");
    setShowModal(true);
    setError(null);
    dispatch(clearError());
  };

  const handleEditBook = (book) => {
    if (!book?.id || typeof book !== "object") {
      console.error("Invalid book selected for edit:", book);
      setError("Cannot edit book: Invalid or missing book ID.");
      return;
    }
    setSelectedBook({ ...book, id: String(book.id) });
    setModalType("edit");
    setShowModal(true);
    setError(null);
    dispatch(clearError());
  };

  const handleViewBook = (book) => {
    console.log("handleViewBook called with book:", book);
    if (!book || !book.id || typeof book !== "object") {
      console.error("Invalid book selected for view:", book);
      setError("Cannot view book: Invalid or missing book data.");
      return;
    }
    setSelectedBook({ ...book, id: String(book.id) });
    setModalType("view");
    setShowModal(true);
    setError(null);
    dispatch(clearError());
  };

  const handleDeleteBook = async (id) => {
    if (!id) {
      console.error("Invalid book ID for deletion:", id);
      setError("Cannot delete book: Invalid book ID.");
      return;
    }
    const originalBooks = [...books];
    const originalIssuedBooks = [...issuedBooks];
    setError(null);
    try {
      await dispatch(deleteBook(String(id))).unwrap();
      await dispatch(fetchBooks()).unwrap();
    } catch (err) {
      console.error("Delete book error:", err);
      setError("Failed to delete book. It may have been deleted already. Refreshing...");
      try {
        await dispatch(fetchBooks()).unwrap();
      } catch (refreshErr) {
        setError("Failed to refresh books.");
      }
    }
  };

  const handleOpenIssueModal = (book) => {
    if (
      !book?.id ||
      !book.copies?.some((copy) => copy.availability === "available")
    ) {
      console.error(
        "Cannot issue book: Invalid book or no available copies.",
        book
      );
      setError("Cannot issue book: No available copies or invalid book data.");
      return;
    }
    setSelectedBook({ ...book, id: String(book.id) });
    setShowIssueModal(true);
    setError(null);
    dispatch(clearError());
  };

  return (
    <section className="flex min-h-screen flex-col">
      <div className="fixed hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 transition-all duration-500">
        <Navbar />
        <section className="flex-1 pt-0 lg:pt-[70px] m-0 lg:m-2.5 transition-all duration-500 ease-in-out">
          <div
            className={`overflow-y-scroll scrollbar-thin overflow-x-hidden pr-0 lg:pr-2 rounded-xl transition-all duration-500 lg:mt-6 ${open
              ? "lg:ml-68 lg:w-[calc(100%-17rem)]"
              : "lg:ml-24 lg:w-[calc(100%-6rem)]"
              }`}
            style={{ height: "calc(100vh - 70px - 50px)" }}
          >
            <div className="flex justify-between items-center">
              <p
                className={`${lightTheme ? "text-white" : "text-black"
                  } text-3xl pb-3 mt-5 pl-5 font-bold transition-all duration-500`}
              >
                Books Management
              </p>
            </div>
            {error && (
              <div className="mx-5 mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                {error}
                <button
                  onClick={() => {
                    setError(null);
                    dispatch(clearError());
                  }}
                  className="ml-2 text-red-600 hover:text-red-800 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}
            <div className="flex flex-col gap-5 p-3 h-full">
              <section
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-2xl shadow-lg transition-colors ${lightTheme ? "bg-gray-900" : "bg-white"
                  }`}
              >
                <div
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl shadow-sm hover:scale-102 shadow-blue-400 ${lightTheme ? "bg-gray-800" : "bg-gray-100"
                    }`}
                >
                  <BookOpen
                    className={`w-10 h-10 ${lightTheme ? "text-indigo-400" : "text-indigo-600"
                      }`}
                  />
                  <p
                    className={`font-medium text-lg ${lightTheme ? "text-gray-200" : "text-gray-800"
                      }`}
                  >
                    Total Books
                  </p>
                  <p
                    className={`text-3xl font-bold ${lightTheme ? "text-white" : "text-gray-900"
                      }`}
                  >
                    {booksLength}
                  </p>
                </div>
                <div
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl shadow-sm hover:scale-102 shadow-blue-400 ${lightTheme ? "bg-gray-800" : "bg-gray-100"
                    }`}
                >
                  <Users
                    className={`w-10 h-10 ${lightTheme ? "text-green-400" : "text-green-600"
                      }`}
                  />
                  <p
                    className={`font-medium text-lg ${lightTheme ? "text-gray-200" : "text-gray-800"
                      }`}
                  >
                    Total Authors
                  </p>
                  <p
                    className={`text-3xl font-bold ${lightTheme ? "text-white" : "text-gray-900"
                      }`}
                  >
                    {authorLength}
                  </p>
                </div>
                <div
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl shadow-sm hover:scale-102 shadow-blue-400 ${lightTheme ? "bg-gray-800" : "bg-gray-100"
                    }`}
                >
                  <Star
                    className={`w-10 h-10 ${lightTheme ? "text-yellow-400" : "text-yellow-500"
                      }`}
                  />
                  <p
                    className={`font-medium text-lg ${lightTheme ? "text-gray-200" : "text-gray-800"
                      }`}
                  >
                    Popular Book
                  </p>
                  <p
                    className={`text-xl font-semibold text-center ${lightTheme ? "text-white" : "text-gray-900"
                      }`}
                  >
                    {popularBook}
                  </p>
                </div>
                <div
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl shadow-sm hover:scale-102 shadow-blue-400 ${lightTheme ? "bg-gray-800" : "bg-gray-100"
                    }`}
                >
                  <Bookmark
                    className={`w-10 h-10 ${lightTheme ? "text-red-400" : "text-red-600"
                      }`}
                  />
                  <p
                    className={`font-medium text-lg ${lightTheme ? "text-gray-200" : "text-gray-800"
                      }`}
                  >
                    Issued Books
                  </p>
                  <p
                    className={`text-3xl font-bold ${lightTheme ? "text-white" : "text-gray-900"
                      }`}
                  >
                    {issuedLength}
                  </p>
                </div>
              </section>
              <section
                className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl shadow-md ${lightTheme ? "bg-gray-900" : "bg-white"
                  }`}
              >
                <div
                  className={`flex items-center w-full md:max-w-lg px-4 py-2 border rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 ${lightTheme ? "bg-gray-800 border-gray-600" : "bg-gray-50 border-gray-200"
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 mr-2 ${lightTheme ? "text-gray-300" : "text-gray-500"
                      }`}
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
                    className={`flex-1 bg-transparent outline-none text-sm md:text-base ${lightTheme
                      ? "text-white placeholder-gray-400"
                      : "text-gray-700 placeholder-gray-400"
                      }`}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Search by title, author, or keyword..."
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                  <select
                    className={`px-4 py-2 rounded-lg shadow-sm border text-sm cursor-pointer w-full sm:w-auto ${lightTheme
                      ? "bg-gray-800 text-white border-gray-600"
                      : "bg-white text-gray-700 border-gray-300"
                      }`}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="">Sort By</option>
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="popularity">Popularity</option>
                  </select>
                  <select
                    className={`px-4 py-2 rounded-lg shadow-sm border text-sm cursor-pointer w-full sm:w-auto ${lightTheme
                        ? "bg-gray-800 text-white border-gray-600"
                        : "bg-white text-gray-700 border-gray-300"
                      }`}
                    onChange={(e) => setFilterBy(e.target.value)}
                  >
                    <option value="">Filter By</option>
                    <option value="fiction">Fiction</option>
                    <option value="classic">Classic Literature</option>
                    <option value="legendary">Legendary</option>
                    <option value="english">English</option>
                    <option value="new">New Arrivals</option>
                    <option value="condition-new">Condition: New</option>
                    <option value="condition-good">Condition: Good</option>
                    <option value="condition-worn">Condition: Worn</option>
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="issued">Issued</option>
                  </select>
                  <button
                    onClick={handleAddBook}
                    className={`flex items-center justify-center gap-2 rounded-md shadow-md cursor-pointer ${lightTheme
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-indigo-500 hover:bg-indigo-600 text-white"
                      }`}
                  >
                    <span className="flex md:hidden w-10 h-10 rounded-full items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </span>
                    <span className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Book
                    </span>
                  </button>
                </div>
              </section>
              <section
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 rounded-2xl ${lightTheme ? "bg-gray-900" : "bg-white"
                  }`}
              >
                {loading ? (
                  <div className="flex justify-center items-center min-h-[50vh] w-full col-span-full">
                    <span className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
                  </div>
                ) : currentBooks.length > 0 ? (
                  currentBooks.map((book) => (
                    <BookCard
                      key={String(book.id)}
                      book={book}
                      lightTheme={lightTheme}
                      onEdit={() => handleEditBook(book)}
                      onDelete={() => handleDeleteBook(book.id)}
                      onView={() => handleViewBook(book)}
                      onIssue={() => handleOpenIssueModal(book)}
                    />
                  ))
                ) : (
                  <div className="flex justify-center flex-col items-center min-h-[50vh] w-full col-span-full gap-10">
                    <img
                      src={BookNotFound}
                      alt="Books not found"
                      className="w-64 h-auto mx-auto"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/256x256?text=Book+Not+Found";
                      }}
                    />
                    <p
                      className={`text-lg font-medium ${lightTheme ? "text-gray-300" : "text-gray-600"
                        }`}
                    >
                      No books found
                    </p>
                  </div>
                )}
              </section>
              {!loading && totalPages > 1 && (
                <div className="flex justify-center items-center gap-1 sm:gap-2 mt-3 sm:mt-4 flex-wrap">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => paginate(currentPage - 1)}
                    className={`px-2 sm:px-3 py-1 rounded disabled:opacity-50 transition-all cursor-pointer ${lightTheme
                      ? "bg-gray-800 text-white hover:bg-gray-700"
                      : "bg-gray-100 text-black hover:bg-gray-200"
                      }`}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => paginate(i + 1)}
                      className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-all cursor-pointer ${currentPage === i + 1
                        ? lightTheme
                          ? "bg-blue-600 text-white"
                          : "bg-blue-200 text-blue-900"
                        : lightTheme
                          ? "bg-gray-800 text-white hover:bg-gray-700"
                          : "bg-gray-100 text-black hover:bg-gray-200"
                        }`}
                      aria-label={`Page ${i + 1}`}
                      aria-current={currentPage === i + 1 ? "page" : undefined}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => paginate(currentPage + 1)}
                    className={`px-2 sm:px-3 py-1 rounded disabled:opacity-50 transition-all cursor-pointer ${lightTheme
                      ? "bg-gray-800 text-white hover:bg-gray-700"
                      : "bg-gray-100 text-black hover:bg-gray-200"
                      }`}
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
              <Footer />
            </div>
          </div>
        </section>
      </div>
      {showModal && modalType && (
        <BookFormModal
          showModal={showModal}
          setShowModal={setShowModal}
          modalType={modalType}
          selectedBook={memoizedSelectedBook}
          lightTheme={lightTheme}
          dispatch={dispatch}
          setError={setError}
        />
      )}
      {showIssueModal && selectedBook && (
        <IssueBookModal
          showModal={showIssueModal}
          setShowModal={setShowIssueModal}
          selectedBook={memoizedSelectedBook}
          lightTheme={lightTheme}
          dispatch={dispatch}
          setError={setError}
        />
      )}
    </section>
  );
};

export default BookManagement;