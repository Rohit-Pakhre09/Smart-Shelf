import { Eye, Pen, BookOpenCheck, Trash2, Star, Text } from "lucide-react";

const BookCard = ({ book, lightTheme, onView, onEdit, onDelete, onIssue }) => {
    return (
        <section
            className={`rounded-lg shadow-md p-4 sm:p-5 flex flex-col gap-3 bg-opacity-90 transition-all duration-300 hover:shadow-lg w-full min-w-0 mx-auto ${lightTheme
                    ? "bg-gray-800 border border-gray-700 text-gray-100"
                    : "bg-white border border-gray-200 text-gray-900"
                }`}
        >
            <div className="flex-1 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 min-h-[250px]">
                    <img
                        src={book.img || "https://via.placeholder.com/120"}
                        alt={book.title || "Book cover"}
                        className="w-full sm:w-20 md:w-25 h-40 sm:h-40 md:h-40 object-cover rounded-md shadow-sm transition-transform duration-300 hover:scale-102"
                        onError={(e) => {
                            e.target.src =
                                "https://via.placeholder.com/120?text=Image+Not+Found";
                        }}
                    />
                    <div className="flex-1 flex flex-col gap-2 min-w-0">
                        <h3
                            className={`text-base sm:text-lg font-semibold tracking-tight line-clamp-2 ${lightTheme ? "text-gray-100" : "text-gray-900"
                                }`}
                        >
                            {book.title || "N/A"}
                        </h3>
                        <p
                            className={`text-xs sm:text-sm truncate ${lightTheme ? "text-gray-400" : "text-gray-600"
                                }`}
                        >
                            by {book.author || "Unknown Author"}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {book.genre?.map((g, i) => (
                                <span
                                    key={i}
                                    className={`px-1.5 py-0.5 text-xs font-medium rounded-full border ${lightTheme
                                            ? "bg-gray-700/80 text-gray-200 border-gray-600"
                                            : "bg-gray-100 text-gray-700 border-gray-300"
                                        }`}
                                >
                                    {g}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < (book.popularity || 0)
                                            ? "text-yellow-400 fill-yellow-400"
                                            : lightTheme
                                                ? "text-gray-600"
                                                : "text-gray-300"
                                        }`}
                                    aria-hidden="true"
                                />
                            ))}
                            <span
                                className={`text-xs font-medium ${lightTheme ? "text-gray-400" : "text-gray-600"
                                    }`}
                            >
                                {book.popularity || 0}/5
                            </span>
                        </div>
                        <div className="hidden sm:flex flex-col gap-1">
                            <p
                                className={`text-xs sm:text-sm truncate ${lightTheme ? "text-gray-300" : "text-gray-700"
                                    }`}
                            >
                                Publisher: {book.publisher || "N/A"}
                            </p>
                            <p
                                className={`text-xs sm:text-sm truncate ${lightTheme ? "text-gray-300" : "text-gray-700"
                                    }`}
                            >
                                Published: {book.year || "N/A"}
                            </p>
                            <p
                                className={`text-xs sm:text-sm truncate ${lightTheme ? "text-gray-300" : "text-gray-700"
                                    }`}
                            >
                                Language: {book.language || "N/A"}
                            </p>
                            <p
                                className={`text-xs sm:text-sm truncate ${lightTheme ? "text-gray-300" : "text-gray-700"
                                    }`}
                            >
                                Pages: {book.pages || "N/A"}
                            </p>
                        </div>
                    </div>
                </div>
                <p
                    className={`text-xs sm:text-sm font-semibold leading-relaxed line-clamp-2 flex gap-2 ${lightTheme ? "text-gray-300" : "text-gray-700"
                        }`}
                >
                    <Text className="h-4 w-4 mt-1" />
                    {book.description || "No description available"}
                </p>
                <p
                    className={`text-sm sm:text-base font-semibold ${lightTheme ? "text-gray-100" : "text-gray-900"
                        }`}
                >
                    Price: ₹{book.price || "N/A"} /-
                </p>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                        onClick={() => onView(book)}
                        className={`flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium cursor-pointer transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-500 ${lightTheme
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                        aria-label={`View details for ${book.title || "book"}`}
                    >
                        <Eye size={14} />
                        View
                    </button>
                    <button
                        onClick={() => onEdit(book)}
                        className={`flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium cursor-pointer transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-amber-500 ${lightTheme
                                ? "bg-amber-600 text-white hover:bg-amber-700"
                                : "bg-amber-500 text-white hover:bg-amber-600"
                            }`}
                        aria-label={`Edit ${book.title || "book"}`}
                    >
                        <Pen size={14} />
                        Edit
                    </button>
                    <button
                        onClick={onIssue}
                        className={`flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium cursor-pointer transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-green-500 ${lightTheme
                                ? book.copies?.some((copy) => copy.availability === "available")
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                                : book.copies?.some((copy) => copy.availability === "available")
                                    ? "bg-green-500 text-white hover:bg-green-600"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        aria-label={`Issue ${book.title || "book"}`}
                        disabled={
                            !book.copies?.some((copy) => copy.availability === "available")
                        }
                    >
                        <BookOpenCheck size={14} />
                        Issue
                    </button>
                    <button
                        onClick={() => onDelete(book)}
                        className={`flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium cursor-pointer transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-red-500 ${lightTheme
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-red-500 text-white hover:bg-red-600"
                            }`}
                        aria-label={`Delete ${book.title || "book"}`}
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>
                </div>
            </div>
            <div
                className={`pt-2 border-t ${lightTheme ? "border-gray-700" : "border-gray-200"
                    } max-h-35 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent`}
            >
                <p
                    className={`text-xs sm:text-sm font-semibold ${lightTheme ? "text-gray-200" : "text-gray-800"
                        } mb-1.5`}
                >
                    Copies:
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {book.copies?.length > 0 ? (
                        book.copies.map((copy, i) => (
                            <span
                                key={i}
                                className={`px-1.5 py-0.5 text-xs font-medium rounded-full border whitespace-nowrap ${copy.availability === "available"
                                        ? lightTheme
                                            ? "bg-green-900/30 text-green-300 border-green-600"
                                            : "bg-green-100 text-green-800 border-green-200"
                                        : copy.availability === "reserved"
                                            ? lightTheme
                                                ? "bg-yellow-900/30 text-yellow-300 border-yellow-600"
                                                : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                            : lightTheme
                                                ? "bg-red-900/30 text-red-300 border-red-600"
                                                : "bg-red-100 text-red-800 border-red-200"
                                    }`}
                            >
                                {copy.id} ({copy.availability}, {copy.condition})
                            </span>
                        ))
                    ) : (
                        <span
                            className={`px-1.5 py-0.5 text-xs font-medium rounded-full border ${lightTheme
                                    ? "bg-gray-700/80 text-gray-300 border-gray-600"
                                    : "bg-gray-100 text-gray-600 border-gray-300"
                                }`}
                        >
                            No copies available
                        </span>
                    )}
                </div>
            </div>
        </section>
    );
};

export default BookCard;
