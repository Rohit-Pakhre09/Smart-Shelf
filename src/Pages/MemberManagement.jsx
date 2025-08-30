import { useContext, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AppContext } from "../contexts/AppProvider";
import Footer from "../components/Footer";
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
  const itemsPerPage = 10;

  const membersUrl = "https://smart-shelf-server-ykc7.onrender.com/members";

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(membersUrl);
        const data = await res.json();
        setMembers(data);
      } catch (err) {
        console.error("Error fetching members:", err);
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
  }, [members]); // Fixed typo: miembers -> members

  const filteredMembers = useMemo(() => {
    if (loading) return [];
    return members.filter((m) => {
      const searchLower = debouncedSearch.toLowerCase();
      if (
        searchLower &&
        !(
          m.name?.toLowerCase().includes(searchLower) ||
          m.email?.toLowerCase().includes(searchLower) ||
          m.id?.toLowerCase().includes(searchLower) ||
          m.phone?.toLowerCase().includes(searchLower)
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
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === "joinDate" || sortBy === "membershipExpiry") {
        valA = new Date(valA);
        valB = new Date(valB);
      } else if (sortBy === "outstandingFines") {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = valA?.toLowerCase() || "";
        valB = valB?.toLowerCase() || "";
      }

      if (valA < valB) {
        return sortDir === "asc" ? -1 : 1;
      }
      if (valA > valB) {
        return sortDir === "asc" ? 1 : -1;
      }
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

  const getStatusClasses = (status) => {
    if (status === "active") {
      return lightTheme
        ? "bg-green-800 text-green-100"
        : "bg-green-200 text-green-700";
    } else {
      return lightTheme ? "bg-red-800 text-red-100" : "bg-red-200 text-red-700";
    }
  };

  const handleImageError = (memberId) => {
    setBrokenImages((prev) => ({ ...prev, [memberId]: true }));
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
            className={`h-[87vh] overflow-y-scroll scrollbar-thin overflow-x-hidden pr-0 lg:pr-2 rounded-xl animation lg:mt-6 ${open
                ? "lg:ml-68 lg:w-[calc(100%-17rem)]"
                : "lg:ml-24 lg:w-[calc(100%-6rem)]"
              } `}
          >
            {/* Heading */}
            <p
              className={`${lightTheme ? "text-white" : "text-black"
                } text-3xl pb-3 mt-5 pl-5 font-bold animation`}
            >
              Members Management
            </p>

            <div className="min-h-full flex flex-col gap-5 p-3">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-wrap">
                {/* Search Input with Icon */}
                <div className="relative w-full md:w-auto flex-1">
                  <Search
                    size={20}
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${lightTheme ? "text-gray-400" : "text-gray-500"
                      }`}
                  />
                  <input
                    type="text"
                    placeholder="Search by member's name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 p-2 rounded-lg w-full ${lightTheme
                        ? "bg-gray-800 text-white placeholder-gray-400 border border-gray-700"
                        : "bg-gray-100 text-black placeholder-gray-500 border border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <select
                  value={membershipFilter}
                  onChange={(e) => setMembershipFilter(e.target.value)}
                  className={`p-2 rounded-lg w-full md:w-auto ${lightTheme
                      ? "bg-gray-800 text-white border border-gray-700"
                      : "bg-gray-100 text-black border border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {membershipTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "all"
                        ? "All Memberships"
                        : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`p-2 rounded-lg w-full md:w-auto ${lightTheme
                      ? "bg-gray-800 text-white border border-gray-700"
                      : "bg-gray-100 text-black border border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {statuses.map((stat) => (
                    <option key={stat} value={stat}>
                      {stat === "all"
                        ? "All Statuses"
                        : stat.charAt(0).toUpperCase() + stat.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`p-2 rounded-lg w-full md:w-auto ${lightTheme
                      ? "bg-gray-800 text-white border border-gray-700"
                      : "bg-gray-100 text-black border border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="name">Sort by Name</option>
                  <option value="joinDate">Sort by Join Date</option>
                  <option value="membershipExpiry">Sort by Expiry</option>
                  <option value="outstandingFines">Sort by Fines</option>
                </select>
                <select
                  value={sortDir}
                  onChange={(e) => setSortDir(e.target.value)}
                  className={`p-2 rounded-lg w-full md:w-auto ${lightTheme
                      ? "bg-gray-800 text-white border border-gray-700"
                      : "bg-gray-100 text-black border border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>

              {loading ? (
                // Spinner
                <div className="flex justify-center items-center min-h-[50vh] w-full col-span-full">
                  <span className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
                </div>
              ) : sortedMembers.length === 0 ? (
                <div
                  className={`flex flex-col items-center justify-center min-h-[50vh] text-center ${lightTheme ? "text-gray-400" : "text-gray-600"
                    }`}
                >
                  <img
                    src={membersFallback}
                    alt="No members found"
                    className="w-48 h-48 mb-4"
                  />
                  <p className="text-xl font-semibold">No members found</p>
                  <p className="text-sm">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-lg shadow">
                    <table
                      className={`hidden md:table w-full border-collapse ${lightTheme
                          ? "bg-gray-900 text-white"
                          : "bg-white text-black"
                        }`}
                    >
                      <thead>
                        <tr
                          className={`${lightTheme
                              ? "bg-gray-800 text-blue-300"
                              : "bg-gray-200 text-blue-700"
                            }`}
                        >
                          <th
                            className="p-3 text-left cursor-pointer"
                            onClick={() => handleSort("name")}
                          >
                            Member{" "}
                            {sortBy === "name" && (
                              <>
                                {sortDir === "asc" ? (
                                  <ArrowUp size={16} className="inline ml-1" />
                                ) : (
                                  <ArrowDown
                                    size={16}
                                    className="inline ml-1"
                                  />
                                )}
                              </>
                            )}
                          </th>
                          <th className="p-3 text-left">Contact</th>
                          <th className="p-3 text-left">Address</th>
                          <th
                            className="p-3 text-left cursor-pointer"
                            onClick={() => handleSort("membershipExpiry")}
                          >
                            Membership{" "}
                            {sortBy === "membershipExpiry" && (
                              <>
                                {sortDir === "asc" ? (
                                  <ArrowUp size={16} className="inline ml-1" />
                                ) : (
                                  <ArrowDown
                                    size={16}
                                    className="inline ml-1"
                                  />
                                )}
                              </>
                            )}
                          </th>
                          <th className="p-3 text-left">Status</th>
                          <th
                            className="p-3 text-left cursor-pointer"
                            onClick={() => handleSort("outstandingFines")}
                          >
                            Fines{" "}
                            {sortBy === "outstandingFines" && (
                              <>
                                {sortDir === "asc" ? (
                                  <ArrowUp size={16} className="inline ml-1" />
                                ) : (
                                  <ArrowDown
                                    size={16}
                                    className="inline ml-1"
                                  />
                                )}
                              </>
                            )}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentMembers.map((member, idx) => (
                          <tr
                            key={idx}
                            className={`border-b ${lightTheme
                                ? "border-gray-700 hover:bg-gray-800"
                                : "border-gray-200 hover:bg-gray-100"
                              }`}
                          >
                            <td className="p-3 flex items-center gap-3">
                              {member.profileImage &&
                                !brokenImages[member.id] ? (
                                <img
                                  src={member.profileImage}
                                  alt={member.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                  onError={() => handleImageError(member.id)}
                                />
                              ) : (
                                <div
                                  className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg ${lightTheme
                                      ? "bg-blue-600 text-white"
                                      : "bg-blue-200 text-blue-900"
                                    }`}
                                >
                                  {member.name?.charAt(0).toUpperCase() || "U"}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold">{member.name}</p>
                                <p className="text-sm text-gray-400">
                                  ID: {member.id}
                                </p>
                              </div>
                            </td>

                            <td className="p-3">
                              <p className="flex items-center gap-1 text-sm">
                                <Mail size={16} /> {member.email}
                              </p>
                              <p className="flex items-center gap-1 text-sm">
                                <Phone size={16} /> {member.phone}
                              </p>
                            </td>

                            <td className="p-3 text-sm flex items-center gap-1">
                              <MapPin size={16} /> {member.address}
                            </td>

                            <td className="p-3 text-sm">
                              <p className="flex items-center gap-1">
                                <UserCheck size={16} /> {member.membershipType}
                              </p>
                              <p className="flex items-center gap-1 text-xs text-gray-400">
                                <Calendar size={14} /> {member.joinDate}
                              </p>
                              <p className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock size={14} /> Exp:{" "}
                                {member.membershipExpiry}
                              </p>
                            </td>

                            <td className="p-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
                                  member.status
                                )}`}
                              >
                                {member.status}
                              </span>
                            </td>

                            <td className="p-3 flex items-center gap-1 text-sm">
                              <AlertCircle size={16} /> ₹
                              {member.outstandingFines}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Mobile Card Layout */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                      {currentMembers.map((member, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg shadow ${lightTheme
                              ? "bg-gray-900 text-white"
                              : "bg-white text-black"
                            }`}
                        >
                          {/* Top: Avatar + Name */}
                          <div className="flex items-center gap-3 mb-2">
                            {member.profileImage && !brokenImages[member.id] ? (
                              <img
                                src={member.profileImage}
                                alt={member.name}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={() => handleImageError(member.id)}
                              />
                            ) : (
                              <div
                                className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg ${lightTheme
                                    ? "bg-blue-600 text-white"
                                    : "bg-blue-200 text-blue-900"
                                  }`}
                              >
                                {member.name?.charAt(0).toUpperCase() || "U"}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold">{member.name}</p>
                              <p className="text-sm text-gray-400">
                                ID: {member.id}
                              </p>
                            </div>
                          </div>

                          {/* Contact */}
                          <p className="flex items-center gap-1 text-sm">
                            <Mail size={16} /> {member.email}
                          </p>
                          <p className="flex items-center gap-1 text-sm mb-2">
                            <Phone size={16} /> {member.phone}
                          </p>

                          {/* Address */}
                          <p className="flex items-center gap-1 text-sm mb-2">
                            <MapPin size={16} /> {member.address}
                          </p>

                          {/* Membership */}
                          <div className="text-sm mb-2">
                            <p className="flex items-center gap-1">
                              <UserCheck size={16} /> {member.membershipType}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-gray-400">
                              <Calendar size={14} /> {member.joinDate}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock size={14} /> Exp: {member.membershipExpiry}
                            </p>
                          </div>

                          {/* Status + Fines */}
                          <div className="flex justify-between items-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
                                member.status
                              )} capitalize`}
                            >
                              {member.status}
                            </span>
                            <span className="flex items-center gap-1 text-sm">
                              <AlertCircle size={16} /> ₹
                              {member.outstandingFines}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4 flex-wrap cursor-pointer">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        className={`px-3 py-1 rounded disabled:opacity-50 ${lightTheme
                            ? "bg-gray-800 text-white hover:bg-gray-700"
                            : "bg-gray-100 text-black hover:bg-gray-200"
                          }`}
                      >
                        <ChevronLeft />
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-3 py-1 rounded ${currentPage === i + 1
                              ? lightTheme
                                ? "bg-blue-600 text-white"
                                : "bg-blue-200 text-blue-900"
                              : lightTheme
                                ? "bg-gray-800 text-white hover:bg-gray-700"
                                : "bg-gray-100 text-black hover:bg-gray-200"
                            } cursor-pointer`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className={`px-3 py-1 rounded disabled:opacity-50 cursor-pointer ${lightTheme
                            ? "bg-gray-800 text-white hover:bg-gray-700"
                            : "bg-gray-100 text-black hover:bg-gray-200"
                          }`}
                      >
                        <ChevronRight />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <Footer />
          </div>
        </section>
      </div>
    </section>
  );
};

export default MemberManagement;
