import { useContext, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AppContext } from "../contexts/AppProvider";
import Footer from "../components/Footer";
import { useDispatch } from "react-redux";
import { deleteMember, addMembers, updateMember } from "../modules/MemberSlice";
import {
  Mail,
  Phone,
  MapPin,
  UserCheck,
  Calendar,
  Clock,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import membersFallback from "../assets/membersPageFallback.svg";

const MemberManagement = () => {
  const { lightTheme, open } = useContext(AppContext);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [brokenImages, setBrokenImages] = useState({});
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  const membersUrl = "https://smart-shelf-server-ykc7.onrender.com/members";
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMembers = async (retries = 3) => {
      try {
        const res = await fetch(membersUrl);
        if (!res.ok) {
          if (retries > 0 && res.status >= 500) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return fetchMembers(retries - 1);
          }
          throw new Error(`Failed to fetch members: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setMembers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching members:", err);
        setError("Failed to load members. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const membershipTypes = useMemo(() => {
    if (!members || members.length === 0) return ["all"];
    const types = new Set(members.map((m) => m.membershipType));
    return ["all", ...Array.from(types)];
  }, [members]);

  const statuses = useMemo(() => {
    if (!members || members.length === 0) return ["all"];
    const stats = new Set(members.map((m) => m.status));
    return ["all", ...Array.from(stats)];
  }, [members]);

  const filteredMembers = useMemo(() => {
    if (loading) return [];
    return members.filter((m) => {
      const searchLower = debouncedSearch.toLowerCase();
      if (
        searchLower &&
        !(
          m.name?.toLowerCase()?.includes(searchLower) ||
          m.email?.toLowerCase()?.includes(searchLower) ||
          m.id?.toString()?.toLowerCase()?.includes(searchLower) ||
          m.phone?.toLowerCase()?.includes(searchLower)
        )
      ) {
        return false;
      }
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (membershipFilter !== "all" && m.membershipType !== membershipFilter)
        return false;
      return true;
    });
  }, [members, debouncedSearch, statusFilter, membershipFilter, loading]);

  const sortedMembers = useMemo(() => {
    return [...filteredMembers].sort((a, b) => {
      let valA = a[sortBy] ?? "";
      let valB = b[sortBy] ?? "";

      if (sortBy === "joinDate" || sortBy === "membershipExpiry") {
        valA = valA ? new Date(valA) : new Date(0);
        valB = valB ? new Date(valB) : new Date(0);
        if (isNaN(valA.getTime())) valA = new Date(0);
        if (isNaN(valB.getTime())) valB = new Date(0);
      } else if (sortBy === "outstandingFines") {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = valA?.toString()?.toLowerCase() || "";
        valB = valB?.toString()?.toLowerCase() || "";
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredMembers, sortBy, sortDir]);

  const totalPages = Math.ceil(sortedMembers.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const currentMembers = sortedMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const handleAddMember = () => {
    setSelectedMember(null);
    setModalType("add");
    setShowModal(true);
    setError(null);
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    const originalMembers = [...members]; // For rollback
    setMembers((prev) => prev.filter((m) => m.id !== id)); // Optimistic update
    try {
      const res = await fetch(`${membersUrl}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        if (res.status === 404) {
          setError("Member not found. It may have been deleted already.");
        } else {
          throw new Error(`Failed to delete member: ${res.status} ${res.statusText}`);
        }
        setMembers(originalMembers); // Rollback
        return;
      }
      dispatch(deleteMember(id));
      setError(null);
    } catch (err) {
      console.error("Error deleting member:", err);
      setError("Failed to delete member. Please try again.");
      setMembers(originalMembers); // Rollback
    }
  };

  const getStatusClasses = (status) => {
    if (status === "active") {
      return lightTheme
        ? "bg-green-800 text-green-100"
        : "bg-green-200 text-green-700";
    }
    return lightTheme ? "bg-red-800 text-red-100" : "bg-red-200 text-red-700";
  };

  const handleImageError = (memberId) => {
    setBrokenImages((prev) => ({ ...prev, [memberId]: true }));
  };

  const MemberModal = () => {
    const [formData, setFormData] = useState({
      id: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      membershipType: "basic",
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
      membershipExpiry: "",
      profileImage: "",
      outstandingFines: 0,
    });
    const [formError, setFormError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      if (modalType === "edit" && selectedMember) {
        setFormData({
          id: selectedMember.id || "",
          name: selectedMember.name || "",
          email: selectedMember.email || "",
          phone: selectedMember.phone || "",
          address: selectedMember.address || "",
          membershipType: selectedMember.membershipType || "basic",
          status: selectedMember.status || "active",
          joinDate: selectedMember.joinDate
            ? new Date(selectedMember.joinDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          membershipExpiry: selectedMember.membershipExpiry
            ? new Date(selectedMember.membershipExpiry).toISOString().split("T")[0]
            : "",
          profileImage: selectedMember.profileImage || "",
          outstandingFines: selectedMember.outstandingFines || 0,
        });
      } else {
        setFormData({
          id: "",
          name: "",
          email: "",
          phone: "",
          address: "",
          membershipType: "basic",
          status: "active",
          joinDate: new Date().toISOString().split("T")[0],
          membershipExpiry: "",
          profileImage: "",
          outstandingFines: 0,
        });
      }
      setFormError(null);
    }, [modalType, selectedMember]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setFormError(null);
      setError(null);
    };

    const validateForm = () => {
      if (!formData.id.trim() && modalType === "add") return "Member ID is required";
      if (!formData.name.trim()) return "Name is required";
      if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email))
        return "Valid email is required";
      if (!formData.phone.trim() || !/^\+?\d{7,15}$/.test(formData.phone))
        return "Valid phone number (7-15 digits) is required";
      if (!formData.address.trim()) return "Address is required";
      if (!formData.joinDate) return "Join date is required";
      if (formData.profileImage && !/^https?:\/\/\S+$/.test(formData.profileImage))
        return "Valid profile image URL is required";
      return null;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const validationError = validateForm();
      if (validationError) {
        setFormError(validationError);
        return;
      }

      setIsSubmitting(true);
      try {
        if (modalType === "add") {
          const res = await fetch(membersUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });
          if (!res.ok) {
            if (res.status === 400) throw new Error("Invalid member data");
            if (res.status === 409) throw new Error("Member ID already exists");
            throw new Error(`Failed to add member: ${res.status} ${res.statusText}`);
          }
          const newMember = await res.json();
          setMembers((prev) => [...prev, newMember]);
          dispatch(addMembers(newMember));
        } else if (modalType === "edit" && selectedMember) {
          const res = await fetch(`${membersUrl}/${selectedMember.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });
          if (!res.ok) {
            if (res.status === 400) throw new Error("Invalid member data");
            if (res.status === 404) throw new Error("Member not found");
            throw new Error(`Failed to update member: ${res.status} ${res.statusText}`);
          }
          const updatedMember = await res.json();
          setMembers((prev) =>
            prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
          );
          dispatch(updateMember({ id: selectedMember.id, updatedData: updatedMember }));
        }
        setShowModal(false);
        setError(null);
        setFormError(null);
      } catch (err) {
        console.error("Error saving member:", err);
        setFormError(err.message || "Failed to save member. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        <div
          className={`relative w-full max-w-md sm:max-w-lg rounded-2xl shadow-2xl border overflow-y-auto max-h-[90vh] p-4 sm:p-6 scrollbar-thin
            ${lightTheme
              ? "bg-gray-800 text-white border-gray-700"
              : "bg-white text-gray-900 border-gray-200"
            }`}
        >
          <div className="flex justify-between items-center mb-4 sm:mb-5">
            <h2 id="modal-title" className="text-lg sm:text-xl font-bold tracking-wide">
              {modalType === "add" ? "Add Member" : "Edit Member"}
            </h2>
            <button
              aria-label="Close modal"
              className="text-gray-400 hover:text-red-500"
              onClick={() => setShowModal(false)}
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

          {formError && (
            <div
              className={`p-2 rounded-lg text-sm mb-4 
                ${lightTheme ? "bg-red-800 text-red-100" : "bg-red-200 text-red-700"}`}
            >
              {formError}
            </div>
          )}

          <form className="flex flex-col gap-3 sm:gap-4" onSubmit={handleSubmit}>
            {modalType === "add" && (
              <div>
                <label htmlFor="id" className="block text-sm font-medium mb-1 opacity-80">
                  Member ID
                </label>
                <input
                  id="id"
                  type="text"
                  name="id"
                  placeholder="Member ID (e.g., M001)"
                  value={formData.id}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  disabled={isSubmitting}
                  className={`w-full p-2.5 sm:p-3 rounded-xl text-sm sm:text-base border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition 
                    ${lightTheme
                      ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                      : "bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500"
                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>
            )}
            {modalType === "edit" && (
              <div>
                <label htmlFor="id" className="block text-sm font-medium mb-1 opacity-80">
                  Member ID
                </label>
                <input
                  id="id"
                  type="text"
                  name="id"
                  value={formData.id}
                  readOnly
                  className={`w-full p-2.5 sm:p-3 rounded-xl text-sm sm:text-base border bg-gray-300 text-gray-600 cursor-not-allowed
                    ${lightTheme
                      ? "bg-gray-600 text-gray-300 border-gray-600"
                      : "bg-gray-200 text-gray-600 border-gray-300"
                    }`}
                />
              </div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1 opacity-80">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                aria-required="true"
                disabled={isSubmitting}
                className={`w-full p-2.5 sm:p-3 rounded-xl text-sm sm:text-base border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition 
                  ${lightTheme
                    ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                    : "bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 opacity-80">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                aria-required="true"
                disabled={isSubmitting}
                className={`w-full p-2.5 sm:p-3 rounded-xl text-sm sm:text-base border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition 
                  ${lightTheme
                    ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                    : "bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1 opacity-80">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="Phone Number (e.g., +91-9876543210)"
                value={formData.phone}
                onChange={handleChange}
                required
                aria-required="true"
                disabled={isSubmitting}
                className={`w-full p-2.5 sm:p-3 rounded-xl text-sm sm:text-base border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition 
                  ${lightTheme
                    ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                    : "bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium mb-1 opacity-80">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                required
                aria-required="true"
                rows={3}
                disabled={isSubmitting}
                className={`w-full p-2.5 sm:p-3 rounded-xl text-sm sm:text-base border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition resize-none 
                  ${lightTheme
                    ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                    : "bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1 opacity-80">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full p-2.5 sm:p-3 rounded-xl text-sm sm:text-base border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition 
                  ${lightTheme
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-50 text-gray-900 border-gray-300"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label htmlFor="joinDate" className="block text-sm font-medium mb-1 opacity-80">
                Join Date
              </label>
              <input
                id="joinDate"
                type="date"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
                required
                aria-required="true"
                disabled={isSubmitting}
                className={`w-full p-2.5 sm:p-3 rounded-xl text-sm sm:text-base border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition 
                  ${lightTheme
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-50 text-gray-900 border-gray-300"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              />
            </div>
            <div>
              <label htmlFor="membershipExpiry" className="block text-sm font-medium mb-1 opacity-80">
                Membership Expiry
              </label>
              <input
                id="membershipExpiry"
                type="date"
                name="membershipExpiry"
                value={formData.membershipExpiry}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full p-2.5 sm:p-3 rounded-xl text-sm sm:text-base border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition 
                  ${lightTheme
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-50 text-gray-900 border-gray-300"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              />
            </div>
            <div>
              <label htmlFor="profileImage" className="block text-sm font-medium mb-1 opacity-80">
                Profile Image URL
              </label>
              <input
                id="profileImage"
                type="url"
                name="profileImage"
                placeholder="Profile Image URL"
                value={formData.profileImage}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full p-2.5 sm:p-3 rounded-xl text-sm sm:text-base border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition 
                  ${lightTheme
                    ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                    : "bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              />
            </div>
            <div>
              <label htmlFor="outstandingFines" className="block text-sm font-medium mb-1 opacity-80">
                Outstanding Fines
              </label>
              <input
                id="outstandingFines"
                type="number"
                name="outstandingFines"
                placeholder="Outstanding Fines"
                value={formData.outstandingFines}
                onChange={handleChange}
                min="0"
                disabled={isSubmitting}
                className={`w-full p-2.5 sm:p-3 rounded-xl text-sm sm:text-base border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition 
                  ${lightTheme
                    ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                    : "bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              />
            </div>
            <div className="flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm 
                  ${lightTheme
                    ? "bg-gray-600 text-white hover:bg-gray-700"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm flex items-center gap-2
                  ${lightTheme
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-indigo-500 text-white hover:bg-indigo-600"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                aria-label="Save member"
              >
                {isSubmitting && (
                  <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                )}
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <section className="flex min-h-screen w-full">
      <div className="fixed hidden lg:block w-16 lg:w-64">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 w-full">
        <Navbar />
        <section className="flex-1 pt-16 lg:pt-[70px] px-2 sm:px-4 lg:px-6">
          <div
            className={`h-[87vh] overflow-y-scroll scrollbar-thin overflow-x-hidden pr-0 lg:pr-2 rounded-xl transition-all duration-500 lg:mt-6 ${open
              ? "lg:ml-68 lg:w-[calc(100%-17rem)]"
              : "lg:ml-20 lg:w-[calc(100%-6rem)]"
              }`}
          >
            <p
              className={`${lightTheme ? "text-white" : "text-black"} 
              text-2xl sm:text-3xl pb-3 mt-4 sm:mt-5 px-2 sm:pl-4 font-bold`}
            >
              Members Management
            </p>

            {error && (
              <div
                className={`p-2 rounded-lg text-sm mx-2 sm:mx-4 mb-4 
                ${lightTheme ? "bg-red-800 text-red-100" : "bg-red-200 text-red-700"}`}
              >
                {error}
              </div>
            )}

            <div className="min-h-full flex flex-col gap-4 sm:gap-5 p-2 sm:p-3">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center flex-wrap">
                <div className="relative w-full sm:w-64">
                  <Search
                    size={18}
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 
                    ${lightTheme ? "text-gray-400" : "text-gray-500"}`}
                  />
                  <input
                    type="text"
                    placeholder="Search by member's name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search members"
                    className={`pl-10 p-2 rounded-lg w-full text-sm sm:text-base 
                    ${lightTheme
                        ? "bg-gray-800 text-white placeholder-gray-400 border border-gray-700"
                        : "bg-gray-100 text-black placeholder-gray-500 border border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <select
                  value={membershipFilter}
                  onChange={(e) => setMembershipFilter(e.target.value)}
                  aria-label="Filter by membership type"
                  className={`p-2 rounded-lg w-full sm:w-40 text-sm sm:text-base 
                  ${lightTheme
                      ? "bg-gray-800 text-white border border-gray-700"
                      : "bg-gray-100 text-black border border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {membershipTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "all" ? "All Memberships" : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter by status"
                  className={`p-2 rounded-lg w-full sm:w-40 text-sm sm:text-base 
                  ${lightTheme
                      ? "bg-gray-800 text-white border border-gray-700"
                      : "bg-gray-100 text-black border border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {statuses.map((stat) => (
                    <option key={stat} value={stat}>
                      {stat === "all" ? "All Statuses" : stat.charAt(0).toUpperCase() + stat.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort members"
                  className={`p-2 rounded-lg w-full sm:w-40 text-sm sm:text-base 
                  ${lightTheme
                      ? "bg-gray-800 text-white border border-gray-700"
                      : "bg-gray-100 text-black border border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="name">Sort by Name</option>
                  <option value="joinDate">Sort by Join Date</option>
                  <option value="membershipExpiry">Sort by Expiry</option>
                  <option value="outstandingFines">Sort by Fines</option>
                </select>
                <button
                  onClick={handleAddMember}
                  className={`flex items-center justify-center gap-2 rounded-md shadow-md cursor-pointer w-full sm:w-auto px-3 py-2 text-sm sm:text-base
                  ${lightTheme
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-indigo-500 hover:bg-indigo-600 text-white"
                    }`}
                  aria-label="Add new member"
                >
                  <span className="flex sm:hidden w-8 h-8 rounded-full items-center justify-center">
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
                  </span>
                  <span className="hidden sm:flex items-center gap-2">
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
                    Add Member
                  </span>
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center min-h-[50vh] w-full">
                  <span
                    className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"
                    aria-label="Loading members"
                  ></span>
                </div>
              ) : sortedMembers.length === 0 ? (
                <div
                  className={`flex flex-col items-center justify-center min-h-[50vh] text-center 
                  ${lightTheme ? "text-gray-400" : "text-gray-600"}`}
                >
                  <img
                    src={membersFallback}
                    alt="No members found"
                    className="w-32 sm:w-48 h-32 sm:h-48 mb-4"
                  />
                  <p className="text-lg sm:text-xl font-semibold">No members found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-lg shadow">
                    <table
                      className={`hidden md:table w-full border-collapse 
                      ${lightTheme ? "bg-gray-900 text-white" : "bg-white text-black"}`}
                    >
                      <thead>
                        <tr
                          className={`${lightTheme ? "bg-gray-800 text-blue-300" : "bg-gray-200 text-blue-700"}`}
                        >
                          <th
                            className="p-2 sm:p-3 text-left cursor-pointer"
                            onClick={() => handleSort("name")}
                            scope="col"
                          >
                            Member{" "}
                            {sortBy === "name" &&
                              (sortDir === "asc" ? (
                                <ArrowUp size={14} className="inline ml-1" />
                              ) : (
                                <ArrowDown size={14} className="inline ml-1" />
                              ))}
                          </th>
                          <th className="p-2 sm:p-3 text-left" scope="col">
                            Contact
                          </th>
                          <th className="p-2 sm:p-3 text-left" scope="col">
                            Address
                          </th>
                          <th
                            className="p-2 sm:p-3 text-left cursor-pointer"
                            onClick={() => handleSort("membershipExpiry")}
                            scope="col"
                          >
                            Membership{" "}
                            {sortBy === "membershipExpiry" &&
                              (sortDir === "asc" ? (
                                <ArrowUp size={14} className="inline ml-1" />
                              ) : (
                                <ArrowDown size={14} className="inline ml-1" />
                              ))}
                          </th>
                          <th className="p-2 sm:p-3 text-left" scope="col">
                            Status
                          </th>
                          <th
                            className="p-2 sm:p-3 text-left cursor-pointer"
                            onClick={() => handleSort("outstandingFines")}
                            scope="col"
                          >
                            Fines{" "}
                            {sortBy === "outstandingFines" &&
                              (sortDir === "asc" ? (
                                <ArrowUp size={14} className="inline ml-1" />
                              ) : (
                                <ArrowDown size={14} className="inline ml-1" />
                              ))}
                          </th>
                          <th className="p-2 sm:p-3 text-center" scope="col">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentMembers.map((member) => (
                          <tr
                            key={member.id}
                            className={`border-b ${lightTheme
                              ? "border-gray-700 hover:bg-gray-800"
                              : "border-gray-200 hover:bg-gray-100"
                              }`}
                          >
                            <td className="p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
                              {member.profileImage && !brokenImages[member.id] ? (
                                <img
                                  src={member.profileImage}
                                  alt={member.name || "Member"}
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                                  onError={() => handleImageError(member.id)}
                                />
                              ) : (
                                <div
                                  className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full font-bold text-base sm:text-lg 
                                  ${lightTheme ? "bg-blue-600 text-white" : "bg-blue-200 text-blue-900"}`}
                                >
                                  {member.name?.charAt(0).toUpperCase() || "U"}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-sm sm:text-base">{member.name || "Unknown"}</p>
                                <p className="text-xs sm:text-sm text-gray-400">ID: {member.id || "N/A"}</p>
                              </div>
                            </td>
                            <td className="p-2 sm:p-3">
                              <p className="flex items-center gap-1 text-xs sm:text-sm">
                                <Mail size={14} /> {member.email || "N/A"}
                              </p>
                              <p className="flex items-center gap-1 text-xs sm:text-sm">
                                <Phone size={14} /> {member.phone || "N/A"}
                              </p>
                            </td>
                            <td className="p-2 sm:p-3 text-xs sm:text-sm flex items-center gap-1">
                              <MapPin size={14} /> {member.address || "N/A"}
                            </td>
                            <td className="p-2 sm:p-3 text-xs sm:text-sm">
                              <p className="flex items-center gap-1">
                                <UserCheck size={14} /> {member.membershipType || "N/A"}
                              </p>
                              <p className="flex items-center gap-1 text-xs text-gray-400">
                                <Calendar size={12} /> {member.joinDate || "N/A"}
                              </p>
                              <p className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock size={12} /> Exp: {member.membershipExpiry || "N/A"}
                              </p>
                            </td>
                            <td className="p-2 sm:p-3">
                              <span
                                className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold 
                                ${getStatusClasses(member.status)}`}
                              >
                                {member.status || "N/A"}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 flex items-center gap-1 text-xs sm:text-sm">
                              <AlertCircle size={14} /> ₹{member.outstandingFines ?? 0}
                            </td>
                            <td className="p-2 sm:p-3">
                              <div className="flex justify-center gap-1 sm:gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setModalType("edit");
                                    setShowModal(true);
                                  }}
                                  className="px-2 sm:px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs sm:text-sm"
                                  aria-label={`Edit ${member.name || "member"} cursor-pointer`}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteMember(member.id)}
                                  className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs sm:text-sm"
                                  aria-label={`Delete ${member.name || "member"}`}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="grid md:hidden gap-3 sm:gap-4">
                      {currentMembers.map((member) => (
                        <div
                          key={member.id}
                          className={`p-3 sm:p-4 rounded-lg shadow 
                          ${lightTheme ? "bg-gray-900 text-white" : "bg-white text-black"}`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            {member.profileImage && !brokenImages[member.id] ? (
                              <img
                                src={member.profileImage}
                                alt={member.name || "Member"}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                                onError={() => handleImageError(member.id)}
                              />
                            ) : (
                              <div
                                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full font-bold text-base sm:text-lg 
                                ${lightTheme ? "bg-blue-600 text-white" : "bg-blue-200 text-blue-900"}`}
                              >
                                {member.name?.charAt(0).toUpperCase() || "U"}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-sm sm:text-base">{member.name || "Unknown"}</p>
                              <p className="text-xs sm:text-sm text-gray-400">ID: {member.id || "N/A"}</p>
                            </div>
                          </div>
                          <p className="flex items-center gap-1 text-xs sm:text-sm mb-1">
                            <Mail size={14} /> {member.email || "N/A"}
                          </p>
                          <p className="flex items-center gap-1 text-xs sm:text-sm mb-1">
                            <Phone size={14} /> {member.phone || "N/A"}
                          </p>
                          <p className="flex items-center gap-1 text-xs sm:text-sm mb-1">
                            <MapPin size={14} /> {member.address || "N/A"}
                          </p>
                          <div className="text-xs sm:text-sm mb-2">
                            <p className="flex items-center gap-1">
                              <UserCheck size={14} /> {member.membershipType || "N/A"}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-gray-400">
                              <Calendar size={12} /> {member.joinDate || "N/A"}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock size={12} /> Exp: {member.membershipExpiry || "N/A"}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span
                              className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
                                member.status
                              )} capitalize`}
                            >
                              {member.status || "N/A"}
                            </span>
                            <span className="flex items-center gap-1 text-xs sm:text-sm">
                              <AlertCircle size={14} /> ₹{member.outstandingFines ?? 0}
                            </span>
                          </div>
                          <div className="flex gap-1 sm:gap-2">
                            <button
                              onClick={() => {
                                setSelectedMember(member);
                                setModalType("edit");
                                setShowModal(true);
                              }}
                              className="flex-1 py-1.5 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs sm:text-sm"
                              aria-label={`Edit ${member.name || "member"}`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="flex-1 py-1.5 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs sm:text-sm"
                              aria-label={`Delete ${member.name || "member"}`}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-1 sm:gap-2 mt-3 sm:mt-4 flex-wrap">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        className={`px-2 sm:px-3 py-1 rounded disabled:opacity-50 
                        ${lightTheme
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
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm 
                          ${currentPage === i + 1
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
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className={`px-2 sm:px-3 py-1 rounded disabled:opacity-50 
                        ${lightTheme
                            ? "bg-gray-800 text-white hover:bg-gray-700"
                            : "bg-gray-100 text-black hover:bg-gray-200"
                          }`}
                        aria-label="Next page"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            <Footer />
          </div>
        </section>
        {showModal && <MemberModal />}
      </div>
    </section>
  );
};

export default MemberManagement;