import LoginForm from "../components/LoginForm";

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side - Decorative with Full-Cover Image */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br p-8 flex items-center justify-center relative">
          <img
            src="/login.jpg"
            alt="Library Management System"
            className="w-full h-full object-cover rounded-lg animate-fade-in absolute inset-0"
            onError={(e) => {
              console.error("Image failed to load:", e.target.src);
              e.target.src = "https://via.placeholder.com/500?text=LMS+Image"; // Fallback image
            }}
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-10 flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-md">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center animate-fade-in">
              Sign In
            </h1>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;