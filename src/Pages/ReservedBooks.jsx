import { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { AppContext } from "../contexts/AppProvider";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const ReservedBooks = () => {
    const { lightTheme, open } = useContext(AppContext);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        id: "",
        title: "",
        author: "",
        isbn: "",
        status: ""
    });
    const [formError, setFormError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const reservationsResponse = await axios.get("https://smart-shelf-server-ykc7.onrender.com/reservations");
                setReservations(reservationsResponse.data);
                setError(null);
            } catch (err) {
                setError("Failed to fetch data. Please try again.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        document.title = "Reserved Books | Smart Shelf";
        return () => {
            document.title = "Smart Shelf";
        };
    }, []);

    const handleCancelReservation = async (id) => {
        setFormError(null);
        try {
            await axios.delete(`https://smart-shelf-server-ykc7.onrender.com/reservations/${id}`);
            setReservations(reservations.filter((reservation) => reservation.id !== id));
        } catch (err) {
            setFormError("Failed to cancel reservation. Please try again.");
            console.error(err);
        }
    };

    const handleEditReservation = (reservation) => {
        setFormData({
            id: reservation.id,
            title: reservation.title,
            author: reservation.author,
            isbn: reservation.isbn,
            status: reservation.status
        });
        setIsEditing(true);
        setEditingId(reservation.id);
        // Scroll to top of the scrollable container smoothly
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleCancelEdit = () => {
        setFormData({
            id: "",
            title: "",
            author: "",
            isbn: "",
            status: ""
        });
        setIsEditing(false);
        setEditingId(null);
        setFormError(null);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRequestReservation = async (e) => {
        e.preventDefault();
        if (!formData.id || !formData.title || !formData.author || !formData.isbn || !formData.status) {
            setFormError("Please fill in all required fields.");
            return;
        }
        setFormError(null);
        try {
            if (isEditing) {
                const updatedReservation = {
                    id: formData.id,
                    title: formData.title,
                    author: formData.author,
                    isbn: formData.isbn,
                    status: formData.status
                };
                const response = await axios.put(`https://smart-shelf-server-ykc7.onrender.com/reservations/${editingId}`, updatedReservation);
                setReservations(reservations.map((reservation) => (reservation.id === editingId ? response.data : reservation)));
                setIsEditing(false);
                setEditingId(null);
            } else {
                const newReservation = {
                    id: formData.id,
                    title: formData.title,
                    author: formData.author,
                    isbn: formData.isbn,
                    status: formData.status
                };
                const response = await axios.post("https://smart-shelf-server-ykc7.onrender.com/reservations", newReservation);
                setReservations([...reservations, response.data]);
            }
            setFormData({
                id: "",
                title: "",
                author: "",
                isbn: "",
                status: ""
            });
        } catch (err) {
            setFormError(isEditing ? "Failed to update reservation. Please try again." : "Failed to reserve book. Please try again.");
            console.error(err);
        }
    };

    return (
        <section className="flex min-h-screen">
            {/* Sidebar */}
            <div className="fixed hidden lg:block">
                <Sidebar />
            </div>
            {/* Navbar + Content */}
            <div className="flex flex-col flex-1 transition-all duration-500">
                <Navbar />
                <section className="flex-1 lg:pt-[70px] m-0 lg:m-2.5 transition-all duration-500">
                    <div
                        ref={scrollContainerRef}
                        className={`h-[87vh] overflow-y-scroll scrollbar-thin overflow-x-hidden pr-0 lg:pr-2 rounded-xl transition-all duration-500 mt-6 ${open
                                ? "lg:ml-68 lg:w-[calc(100%-17rem)]"
                                : "lg:ml-24 lg:w-[calc(100%-6rem)]"
                            } `}
                    >
                        {/* Reserved Books Heading */}
                        <p
                            className={`${lightTheme ? "text-white" : "text-black"
                                } text-3xl pb-3 mt-5 pl-5 font-bold animation transition-all duration-500`}
                        >
                            Reserved Books
                        </p>
                        <div className="min-h-full flex flex-col gap-5 p-3">
                            {/* Reserve Book Form */}
                            <div className={`p-4 rounded-lg shadow-md ${lightTheme ? "bg-gray-800" : "bg-white"}`}>
                                <h2 className={`${lightTheme ? "text-white" : "text-black"} text-xl font-semibold mb-2`}>{isEditing ? "Edit Reservation" : "Reserve a Book"}</h2>
                                <p className={`${lightTheme ? "text-gray-300" : "text-gray-600"} text-base mb-4`}>As an admin, {isEditing ? "edit an existing reservation" : "reserve an existing book from the library catalog"}.</p>
                                <form onSubmit={handleRequestReservation} className="flex flex-col gap-4 max-w-lg">
                                    <div className="flex flex-col">
                                        <label className={`${lightTheme ? "text-gray-300" : "text-gray-700"} text-base mb-1`}>Reservation ID (Required)</label>
                                        <input
                                            type="text"
                                            name="id"
                                            value={formData.id}
                                            onChange={handleFormChange}
                                            className={`w-full p-2 rounded-md border ${lightTheme ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"} focus:outline-none focus:ring-2 focus:ring-purple-500 text-base ${isEditing ? "bg-gray-400 cursor-not-allowed" : ""}`}
                                            aria-label="Reservation ID"
                                            placeholder="e.g., R001"
                                            disabled={isEditing}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className={`${lightTheme ? "text-gray-300" : "text-gray-700"} text-base mb-1`}>Book Title (Required)</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleFormChange}
                                            className={`w-full p-2 rounded-md border ${lightTheme ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"} focus:outline-none focus:ring-2 focus:ring-purple-500 text-base`}
                                            aria-label="Book Title"
                                            placeholder="e.g., Wuthering Heights"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className={`${lightTheme ? "text-gray-300" : "text-gray-700"} text-base mb-1`}>Author Name (Required)</label>
                                        <input
                                            type="text"
                                            name="author"
                                            value={formData.author}
                                            onChange={handleFormChange}
                                            className={`w-full p-2 rounded-md border ${lightTheme ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"} focus:outline-none focus:ring-2 focus:ring-purple-500 text-base`}
                                            aria-label="Author Name"
                                            placeholder="e.g., Emily Brontë"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className={`${lightTheme ? "text-gray-300" : "text-gray-700"} text-base mb-1`}>ISBN (Required)</label>
                                        <input
                                            type="text"
                                            name="isbn"
                                            value={formData.isbn}
                                            onChange={handleFormChange}
                                            className={`w-full p-2 rounded-md border ${lightTheme ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"} focus:outline-none focus:ring-2 focus:ring-purple-500 text-base`}
                                            aria-label="ISBN"
                                            placeholder="e.g., 9780141439556"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className={`${lightTheme ? "text-gray-300" : "text-gray-700"} text-base mb-1`}>Status (Required)</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleFormChange}
                                            className={`w-full p-2 rounded-md border ${lightTheme ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"} focus:outline-none focus:ring-2 focus:ring-purple-500 text-base`}
                                            aria-label="Select Status"
                                        >
                                            <option value="">Select status</option>
                                            <option value="pending">Pending</option>
                                            <option value="active">Active</option>
                                            <option value="canceled">Canceled</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end gap-4">
                                        {isEditing && (
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className={`w-full sm:w-auto py-2 px-6 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${lightTheme ? "bg-gray-600 text-white hover:bg-gray-700" : "bg-gray-500 text-white hover:bg-gray-600"} cursor-pointer text-base`}
                                                aria-label="Cancel Edit"
                                            >
                                                Cancel Edit
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            className={`w-full sm:w-auto py-2 px-6 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${lightTheme ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-purple-500 text-white hover:bg-purple-600"} cursor-pointer text-base`}
                                            aria-label={isEditing ? "Update Reservation" : "Submit Reservation"}
                                        >
                                            {isEditing ? "Update Reservation" : "Reserve Book"}
                                        </button>
                                    </div>
                                </form>
                                {formError && <p className="text-red-500 text-base mt-2">{formError}</p>}
                            </div>

                            {/* Reservations Cards */}
                            {loading && (
                                <div className="flex justify-center items-center min-h-[50vh] w-full">
                                    <span className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
                                </div>
                            )}
                            {error && (
                                <p className="text-red-500 text-center text-lg">Error: {error}</p>
                            )}
                            {!loading && !error && reservations.length === 0 && (
                                <p className={`${lightTheme ? "text-gray-300" : "text-gray-700"} text-center text-lg`}>
                                    No reservations found.
                                </p>
                            )}
                            {!loading && !error && reservations.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {reservations.map((reservation) => (
                                        <div
                                            key={reservation.id}
                                            className={`p-4 rounded-lg shadow-md ${lightTheme ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-200"} border transition-all duration-300 hover:shadow-lg`}
                                            aria-label={`Reservation ${reservation.id}`}
                                        >
                                            <h3 className="text-xl font-semibold mb-2 truncate">{reservation.title}</h3>
                                            <div className="flex flex-col gap-2 text-base">
                                                <p><span className="font-medium">Reservation ID:</span> {reservation.id}</p>
                                                <p><span className="font-medium">Author:</span> {reservation.author}</p>
                                                <p><span className="font-medium">ISBN:</span> {reservation.isbn}</p>
                                                <p>
                                                    <span className="font-medium">Status:</span>
                                                    <span
                                                        className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${reservation.status === "pending" ? "bg-yellow-500 text-white" : reservation.status === "active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"}`}
                                                    >
                                                        {reservation.status ? reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1) : "Unknown"}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="flex gap-4 mt-4">
                                                <button
                                                    onClick={() => handleEditReservation(reservation)}
                                                    className={`w-full py-2 px-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${lightTheme ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-500 text-white hover:bg-blue-600"} cursor-pointer text-base`}
                                                    aria-label={`Edit reservation ${reservation.id}`}
                                                >
                                                    Edit Reservation
                                                </button>
                                                <button
                                                    onClick={() => handleCancelReservation(reservation.id)}
                                                    className={`w-full py-2 px-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${lightTheme ? "bg-red-600 text-white hover:bg-red-700" : "bg-red-500 text-white hover:bg-red-600"} cursor-pointer text-base`}
                                                    aria-label={`Cancel reservation ${reservation.id}`}
                                                >
                                                    Cancel Reservation
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Footer Section */}
                            <Footer />
                        </div>
                    </div>
                </section>
            </div>
        </section>
    );
};

export default ReservedBooks;