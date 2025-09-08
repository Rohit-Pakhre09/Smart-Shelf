import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AppContext } from "../contexts/AppProvider";
import Footer from "../components/Footer";
import ExportButtons from "../components/ExportButtons";

const AccountPage = () => {
  const { lightTheme, open, csvMember, csvBook } = useContext(AppContext);
  const navigate = useNavigate();
  const [librarianDetails, setLibrarianDetails] = useState({
    email: "",
    name: "",
    dob: "",
    phone: "",
    address: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    document.title = "Account | Smart Shelf";
    return () => {
      document.title = "Smart Shelf";
    };
  }, []);

  // Load initial data from localStorage
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("SS-AC")) || {};
    const libAccDetail = JSON.parse(localStorage.getItem("currentUser")) || {};

    setLibrarianDetails({
      email: storedData.email || libAccDetail.email || "",
      name: storedData.name || libAccDetail.name || "",
      dob: storedData.dob || "",
      phone: storedData.phone || "",
      address: storedData.address || "",
    });
    if (storedData.profileImage) {
      setProfileImage(storedData.profileImage);
    }
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLibrarianDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form save
  const handleSave = () => {
    if (!validateEmail(librarianDetails.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    // Update localStorage with new data
    const dataToSave = { ...librarianDetails, profileImage };
    try {
      localStorage.setItem("SS-AC", JSON.stringify(dataToSave));
      localStorage.setItem("email", librarianDetails.email); // Keep for backward compatibility
      localStorage.setItem("token", btoa(librarianDetails.email)); // Update token
    } catch (e) {
      alert("Error saving data: Storage limit exceeded or other issue.");
      console.error(e);
      return;
    }
    setIsEditing(false);
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // Check if file size > 5MB
        alert("Image size exceeds 5MB. Please choose a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const imageData = reader.result;
        setProfileImage(imageData);
        setImageError(false);
        // Save image to localStorage immediately
        const dataToSave = { ...librarianDetails, profileImage: imageData };
        try {
          localStorage.setItem("SS-AC", JSON.stringify(dataToSave));
        } catch (e) {
          alert("Error saving image: Storage limit exceeded or other issue.");
          console.error(e);
        }
      };
      reader.onerror = () => {
        setImageError(true);
        alert("Error reading image file.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setProfileImage(null);
    setImageError(false);
    // Update localStorage to remove the image
    const dataToSave = { ...librarianDetails, profileImage: null };
    try {
      localStorage.setItem("SS-AC", JSON.stringify(dataToSave));
    } catch (e) {
      alert("Error removing image: Storage limit exceeded or other issue.");
      console.error(e);
    }
  };

  // Handle logout
  const handleLogOut = () => {
    localStorage.removeItem("SS-AC");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("currentUser");
    navigate("/", { replace: true });
    window.location.reload();
  };

  // Get initial for fallback
  const getInitial = () => {
    return librarianDetails.name ? librarianDetails.name.charAt(0).toUpperCase() : "U";
  };

  return (
    <section className="flex min-h-screen">
      {/* Sidebar */}
      <div className={`${open ? "block" : "hidden"} lg:block fixed lg:static w-64 lg:w-auto z-50`}>
        <Sidebar />
      </div>

      {/* Navbar + Content */}
      <div className="flex flex-col flex-1 transition-all duration-500">
        <Navbar />
        <section className="flex-1 lg:pt-[70px] m-0 lg:m-2.5 transition-all duration-500 p-5">
          <div
            className={`h-[87vh] overflow-y-scroll scrollbar-thin overflow-x-hidden pr-0 sm:pr-2 rounded-xl transition-all duration-500 mt-6 ${open ? "lg:ml-5 lg:w-[calc(100%-2rem)]" : "lg:ml-0 lg:w-[calc(100%-0rem)]"
              }`}
          >
            {/* Account Management Heading */}
            <p
              className={`${lightTheme ? "text-white" : "text-black"
                } text-2xl sm:text-3xl pb-3 mt-5 pl-0 sm:pl-5 font-bold animation transition-all duration-500`}
            >
              Account Management
            </p>
            <div className="min-h-full flex flex-col gap-4 sm:gap-5 p-3 sm:p-4">
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-8 sm:mb-10">
                {/* Profile Image */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 flex-shrink-0 mx-auto sm:mx-0">
                  {profileImage && !imageError ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover border-2 border-gray-300"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div
                      className={`w-full h-full rounded-full flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl font-bold transition-all duration-300 animation ${lightTheme ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700"
                        } border-2 border-gray-300`}
                    >
                      {getInitial()}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="profileImageInput"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <label
                      htmlFor="profileImageInput"
                      className={`rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center cursor-pointer text-base sm:text-lg transition-all duration-300 animation ${lightTheme ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      title="Upload Profile Image"
                    >
                      +
                    </label>
                    {profileImage && !imageError && (
                      <button
                        onClick={handleRemoveImage}
                        className={`rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center cursor-pointer text-base sm:text-lg transition-all duration-300 animation ${lightTheme ? "bg-red-500 text-white hover:bg-red-600" : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                        title="Remove Profile Image"
                      >
                        −
                      </button>
                    )}
                  </div>
                </div>

                {/* Librarian Details */}
                <div className="flex-1 w-full">
                  <h3
                    className={`text-lg sm:text-xl font-semibold mb-4 transition-all duration-300 animation ${lightTheme ? "text-white" : "text-black"
                      }`}
                  >
                    Librarian Details
                  </h3>
                  <div className="grid gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium transition-all duration-300 animation ${lightTheme ? "text-gray-300" : "text-gray-700"
                          }`}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={librarianDetails.email}
                        onChange={handleInputChange}
                        className={`mt-1 w-full px-3 py-2 sm:px-4 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 animation ${lightTheme
                          ? isEditing
                            ? "bg-gray-900 text-white border-gray-600"
                            : "bg-gray-800 text-white border-gray-600 cursor-not-allowed"
                          : isEditing
                            ? "bg-white text-black border-gray-300"
                            : "bg-gray-100 text-black border-gray-300 cursor-not-allowed"
                          }`}
                        disabled={!isEditing}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium transition-all duration-300 animation ${lightTheme ? "text-gray-300" : "text-gray-700"
                          }`}
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={librarianDetails.name}
                        onChange={handleInputChange}
                        className={`mt-1 w-full px-3 py-2 sm:px-4 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 animation ${lightTheme
                          ? isEditing
                            ? "bg-gray-900 text-white border-gray-600"
                            : "bg-gray-800 text-white border-gray-600 cursor-not-allowed"
                          : isEditing
                            ? "bg-white text-black border-gray-300"
                            : "bg-gray-100 text-black border-gray-300 cursor-not-allowed"
                          }`}
                        disabled={!isEditing}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium transition-all duration-300 animation ${lightTheme ? "text-gray-300" : "text-gray-700"
                          }`}
                      >
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={librarianDetails.dob}
                        onChange={handleInputChange}
                        className={`mt-1 w-full px-3 py-2 sm:px-4 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 animation ${lightTheme
                          ? isEditing
                            ? "bg-gray-900 text-white border-gray-600"
                            : "bg-gray-800 text-white border-gray-600 cursor-not-allowed"
                          : isEditing
                            ? "bg-white text-black border-gray-300"
                            : "bg-gray-100 text-black border-gray-300 cursor-not-allowed"
                          }`}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium transition-all duration-300 animation ${lightTheme ? "text-gray-300" : "text-gray-700"
                          }`}
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={librarianDetails.phone}
                        onChange={handleInputChange}
                        className={`mt-1 w-full px-3 py-2 sm:px-4 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 animation ${lightTheme
                          ? isEditing
                            ? "bg-gray-900 text-white border-gray-600"
                            : "bg-gray-800 text-white border-gray-600 cursor-not-allowed"
                          : isEditing
                            ? "bg-white text-black border-gray-300"
                            : "bg-gray-100 text-black border-gray-300 cursor-not-allowed"
                          }`}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium transition-all duration-300 animation ${lightTheme ? "text-gray-300" : "text-gray-700"
                          }`}
                      >
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={librarianDetails.address}
                        onChange={handleInputChange}
                        className={`mt-1 w-full px-3 py-2 sm:px-4 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 animation ${lightTheme
                          ? isEditing
                            ? "bg-gray-900 text-white border-gray-600"
                            : "bg-gray-800 text-white border-gray-600 cursor-not-allowed"
                          : isEditing
                            ? "bg-white text-black border-gray-300"
                            : "bg-gray-100 text-black border-gray-300 cursor-not-allowed"
                          }`}
                        disabled={!isEditing}
                        placeholder="Enter your address"
                        rows="4"
                      />
                    </div>
                  </div>

                  {/* Edit/Save Buttons */}
                  <div className="mt-4 sm:mt-6 flex flex-wrap gap-3 sm:gap-4 justify-center sm:justify-start">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          className={`w-full sm:w-32 min-w-[120px] py-2 px-4 sm:px-6 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 animation ${lightTheme ? "bg-green-600 text-white hover:bg-green-700" : "bg-green-500 text-white hover:bg-green-600"
                            } cursor-pointer`}
                          aria-label="Save profile changes"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className={`w-full sm:w-32 min-w-[120px] py-2 px-4 sm:px-6 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 animation ${lightTheme ? "bg-gray-600 text-white hover:bg-gray-700" : "bg-gray-500 text-white hover:bg-gray-600"
                            } cursor-pointer`}
                          aria-label="Cancel profile changes"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className={`w-full sm:w-32 min-w-[120px] py-2 px-4 sm:px-6 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 animation ${lightTheme ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-600 text-white hover:bg-blue-700"
                          } cursor-pointer`}
                        aria-label="Edit profile"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={handleLogOut}
                      className={`w-full sm:w-32 min-w-[120px] py-2 px-4 sm:px-6 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 animation ${lightTheme ? "bg-red-600 text-white hover:bg-red-700" : "bg-red-500 text-white hover:bg-red-600"
                        } cursor-pointer`}
                      aria-label="Log out"
                    >
                      Log Out
                    </button>
                    <ExportButtons
                      data={csvBook}
                      csvName="Books"
                      fileName="books.csv"
                      className={`w-full sm:w-32 min-w-[120px] py-2 px-4 sm:px-6 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 animation ${lightTheme ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-purple-500 text-white hover:bg-purple-600"
                        } cursor-pointer`}
                      aria-label="Export books as CSV"
                    />
                    <ExportButtons
                      data={csvMember}
                      csvName="Members"
                      fileName="members.csv"
                      className={`w-full sm:w-32 min-w-[120px] py-2 px-4 sm:px-6 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 animation ${lightTheme ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-purple-500 text-white hover:bg-purple-600"
                        } cursor-pointer`}
                      aria-label="Export members as CSV"
                    />
                  </div>
                </div>
              </div>
              {/* Footer Section */}
              <Footer />
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default AccountPage;