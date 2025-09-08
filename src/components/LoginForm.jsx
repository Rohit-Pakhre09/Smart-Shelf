import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function LoginForm() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const matchedUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (matchedUser) {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("currentUser", JSON.stringify(matchedUser));
      // navigate("/dashboard" , { replace: true }); // redirect to dashboard
      // window.location.reload();
      setSuccess("Login successful! Redirecting to dashboard...");
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
        window.location.reload();
      }, 1000);
    } else {
      setError("Invalid email or password!");
    }
  };

  return (
    <div className="flex items-center justify-center">
      <form className="space-y-6 w-full max-w-md" onSubmit={handleLogin}>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}
        {/* Email */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Email Address
          </label>
          <input
            id="name"
            type="email"
            value={email}
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Remember Me */}
        <div className="flex items-start">
          <input
            type="checkbox"
            id="rememberMe"
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
            I accept the{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Use
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            .
          </label>
        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
        >
          Login
        </button>

        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-500 font-semibold">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginForm;
