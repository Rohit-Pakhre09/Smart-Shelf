import { useContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AppContext } from "../contexts/AppProvider";
import Footer from "../components/Footer";
import { fetchFines, editFine, markAsPaid } from "../modules/finesSlice";
import { PencilIcon, CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

const FinesPage = () => {
  const { lightTheme, open } = useContext(AppContext);
  const dispatch = useDispatch();
  const finesState = useSelector((state) => state.fines || { fines: [], loading: false, error: null });
  const { fines, loading, error } = finesState;
  const [editingFine, setEditingFine] = useState(null);
  const [editForm, setEditForm] = useState({
    id: "",
    memberId: "",
    bookId: "",
    amount: "",
    status: "",
    reason: "",
    calculatedOn: "",
    paymentMethod: "",
    paymentDate: "",
  });
  const [showWarning, setShowWarning] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [customApiUrl, setCustomApiUrl] = useState("");

  // Log context and state issues
  useEffect(() => {
    if (lightTheme === undefined || open === undefined) {
      console.error(
        "AppContext is missing required values. Ensure FinesPage is wrapped in AppContext.Provider. Using fallback values: { lightTheme: false, open: false }"
      );
    }
    if (!finesState.fines) {
      console.warn("Redux state.fines is undefined. Ensure the fines reducer is added to the store.");
    }
  }, [lightTheme, open, finesState]);

  // Fetch fines on mount
  useEffect(() => {
    dispatch(fetchFines());
  }, [dispatch]);

  // Show warning when error indicates local update
  useEffect(() => {
    if (error && error.includes("Changes applied locally")) {
      setShowWarning(true);
      const timer = setTimeout(() => setShowWarning(false), 5000); // Hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle Edit button click
  const handleEditClick = (fine) => {
    setEditingFine(fine);
    setEditForm({
      id: fine.id,
      memberId: fine.memberId,
      bookId: fine.bookId,
      amount: fine.amount,
      status: fine.status,
      reason: fine.reason,
      calculatedOn: fine.calculatedOn,
      paymentMethod: fine.paymentMethod || "",
      paymentDate: fine.paymentDate || "",
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editingFine) {
      setLastUpdate({ id: editingFine.id, updates: editForm, customApiUrl });
      dispatch(editFine({ id: editingFine.id, updates: editForm, customApiUrl }));
      setEditingFine(null);
    }
  };

  // Handle Cancel button click
  const handleCancelEdit = () => {
    setEditingFine(null);
    setEditForm({
      id: "",
      memberId: "",
      bookId: "",
      amount: "",
      status: "",
      reason: "",
      calculatedOn: "",
      paymentMethod: "",
      paymentDate: "",
    });
  };

  // Handle Mark as Paid button click
  const handleMarkAsPaid = (id) => {
    const today = new Date().toISOString().split("T")[0];
    const updates = { status: "paid", paymentMethod: "UPI", paymentDate: today };
    setLastUpdate({ id, updates, customApiUrl });
    dispatch(markAsPaid({ id, updates, customApiUrl }));
  };

  // Handle Retry with custom API URL
  const handleRetry = () => {
    if (lastUpdate) {
      if (lastUpdate.updates.status === "paid") {
        dispatch(markAsPaid({ ...lastUpdate, customApiUrl }));
      } else {
        dispatch(editFine({ ...lastUpdate, customApiUrl }));
      }
    }
  };

  return (
    <section className="flex min-h-screen">
      {/* Sidebar */}
      <div className="fixed hidden lg:block">
        <Sidebar />
      </div>

      {/* Navbar + Content */}
      <div className="flex flex-col flex-1 animation">
        <Navbar />

        <section className="flex-1 pt-0 lg:pt-[70px] m-0 lg:m-2.5 animation">
          <div
            className={`h-[87vh] overflow-y-scroll scrollbar-thin overflow-x-hidden pr-0 lg:pr-2 rounded-xl animation mt-6 ${open ? "lg:ml-68 lg:w-[calc(100%-17rem)]" : "lg:ml-24 lg:w-[calc(100%-6rem)]"
              }`}
          >
            {/* Warning Notification */}
            {showWarning && (
              <div
                className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 p-4 rounded-md shadow-lg z-50 animate-fadeIn ${lightTheme ? "bg-yellow-600 text-white" : "bg-yellow-500 text-black"
                  }`}
              >
                <p>Warning: Changes were applied locally but not saved to the server. Check the API endpoint or try a custom URL.</p>
                <input
                  type="text"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  className={`mt-2 w-full p-2 rounded-md border text-sm ${lightTheme ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"
                    }`}
                  placeholder="Enter custom API URL"
                />
                <button
                  onClick={handleRetry}
                  className={`mt-2 px-3 py-1 rounded-md text-sm font-semibold cursor-pointer ${lightTheme ? "bg-blue-400 text-gray-800" : "bg-blue-500 text-white"
                    } hover:bg-blue-600 animation w-full sm:w-auto`}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Fines Management Heading */}
            <p
              className={`${lightTheme ? "text-white" : "text-black"} text-3xl pb-3 mt-5 pl-5 font-bold animation animate-fadeIn`}
            >
              Fines Management
            </p>

            <div className="min-h-full flex flex-col gap-5 p-3">
              {loading ? (
                <div className="flex justify-center items-center min-h-[50vh] w-full">
                  <span className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
                </div>
              ) : error ? (
                <p
                  className={`text-left animation animate-fadeIn text-lg pl-5 ${lightTheme ? "text-red-400" : "text-red-500"
                    }`}
                >
                  {error} {error.includes("404") && "(API endpoint not found. Using mock data or local updates.)"}
                </p>
              ) : fines.length === 0 ? (
                <p
                  className={`text-left animation animate-fadeIn text-lg pl-5 ${lightTheme ? "text-white" : "text-black"
                    }`}
                >
                  No fines found.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 px-2">
                  {fines.map((fine) => (
                    <div
                      key={fine.id}
                      className={`relative p-3 sm:p-4 lg:p-5 rounded-xl shadow-md hover:shadow-lg transform animation animate-fadeIn min-w-[250px] w-full sm:max-w-md ${lightTheme ? "bg-gray-800 text-white" : "bg-white text-black"
                        }`}
                    >
                      {/* Status Badge */}
                      <div
                        className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${fine.status === "paid"
                            ? lightTheme
                              ? "bg-green-400 text-gray-800"
                              : "bg-green-500 text-white"
                            : lightTheme
                              ? "bg-red-400 text-gray-800"
                              : "bg-red-500 text-white"
                          }`}
                      >
                        {fine.status.charAt(0).toUpperCase() + fine.status.slice(1)}
                      </div>

                      {/* Fine Details */}
                      <h3 className="text-base sm:text-lg font-bold mb-2 truncate">{fine.id}</h3>
                      <div className="space-y-1.5 text-xs sm:text-sm lg:text-base">
                        <p className="truncate">
                          <span className="font-medium">Member:</span> {fine.memberId}
                        </p>
                        <p className="truncate">
                          <span className="font-medium">Book:</span> {fine.bookId}
                        </p>
                        <p>
                          <span className="font-medium">Amount:</span> ₹{fine.amount}
                        </p>
                        <p className="truncate">
                          <span className="font-medium">Reason:</span> {fine.reason}
                        </p>
                        <p>
                          <span className="font-medium">Calculated:</span>{" "}
                          {new Date(fine.calculatedOn).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="truncate">
                          <span className="font-medium">Payment Method:</span>{" "}
                          {fine.paymentMethod || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Paid On:</span>{" "}
                          {fine.paymentDate
                            ? new Date(fine.paymentDate).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                            : "N/A"}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleEditClick(fine)}
                          className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold cursor-pointer ${lightTheme ? "bg-blue-400 text-gray-800" : "bg-blue-500 text-white"
                            } hover:bg-blue-600 animation w-full sm:w-auto`}
                        >
                          <PencilIcon className="h-4 w-4" />
                          Edit
                        </button>
                        {fine.status !== "paid" && (
                          <button
                            onClick={() => handleMarkAsPaid(fine.id)}
                            className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold cursor-pointer ${lightTheme ? "bg-green-400 text-gray-800" : "bg-green-500 text-white"
                              } hover:bg-green-600 animation w-full sm:w-auto`}
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            Mark as Paid
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Footer Section - Only shown when not loading */}
              {!loading && <Footer />}
            </div>

            {/* Edit Modal */}
            {editingFine && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div
                  className={`p-6 rounded-xl shadow-lg max-w-md w-full ${lightTheme ? "bg-gray-800 text-white" : "bg-white text-black"
                    }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Edit Fine</h2>
                    <button className="cursor-pointer" onClick={handleCancelEdit}>
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium">Member ID</label>
                      <input
                        type="text"
                        name="memberId"
                        value={editForm.memberId}
                        onChange={handleInputChange}
                        className={`mt-1 w-full p-2 rounded-md border ${lightTheme ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"
                          }`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Book ID</label>
                      <input
                        type="text"
                        name="bookId"
                        value={editForm.bookId}
                        onChange={handleInputChange}
                        className={`mt-1 w-full p-2 rounded-md border ${lightTheme ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"
                          }`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Amount</label>
                      <input
                        type="number"
                        name="amount"
                        value={editForm.amount}
                        onChange={handleInputChange}
                        className={`mt-1 w-full p-2 rounded-md border ${lightTheme ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"
                          }`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Status</label>
                      <select
                        name="status"
                        value={editForm.status}
                        onChange={handleInputChange}
                        className={`mt-1 w-full p-2 rounded-md border ${lightTheme ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"
                          }`}
                        required
                      >
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Reason</label>
                      <input
                        type="text"
                        name="reason"
                        value={editForm.reason}
                        onChange={handleInputChange}
                        className={`mt-1 w-full p-2 rounded-md border ${lightTheme ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"
                          }`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Calculated On</label>
                      <input
                        type="date"
                        name="calculatedOn"
                        value={editForm.calculatedOn}
                        onChange={handleInputChange}
                        className={`mt-1 w-full p-2 rounded-md border ${lightTheme ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"
                          }`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Payment Method</label>
                      <input
                        type="text"
                        name="paymentMethod"
                        value={editForm.paymentMethod}
                        onChange={handleInputChange}
                        className={`mt-1 w-full p-2 rounded-md border ${lightTheme ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Payment Date</label>
                      <input
                        type="date"
                        name="paymentDate"
                        value={editForm.paymentDate}
                        onChange={handleInputChange}
                        className={`mt-1 w-full p-2 rounded-md border ${lightTheme ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"
                          }`}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className={`flex-1 px-3 py-1.5 rounded-md text-sm font-semibold cursor-pointer ${lightTheme ? "bg-blue-400 text-gray-800" : "bg-blue-500 text-white"
                          } hover:bg-blue-600 animation cursor-pointer`}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className={`flex-1 px-3 py-1.5 rounded-md text-sm font-semibold cursor-pointer ${lightTheme ? "bg-gray-400 text-gray-800" : "bg-gray-500 text-white"
                          } hover:bg-gray-600 animation cursor-pointer`}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
};

export default FinesPage;