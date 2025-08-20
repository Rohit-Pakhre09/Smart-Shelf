
import React, { useEffect, useState } from "react";
import { getBooks } from "../api/books";
import BookCard from "../components/BookCard";

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getBooks()
            .then((data) => {
                setBooks(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <p className="text-center mt-8">Loading books...</p>;
    if (error)
        return <p className="text-center mt-8 text-red-600">Error: {error}</p>;

    return (
        <div className="px-4 py-8">
            <h1 className="text-2xl font-bold mb-4 text-center">Library</h1>
            {books.length === 0 ? (
                <p className="text-center text-gray-500">No books available.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.map((book) => (
                        <BookCard key={book.bookId} book={book} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookList;