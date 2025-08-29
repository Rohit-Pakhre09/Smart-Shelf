import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginForm() {
    const [checked, setChecked] = useState(false);
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPass] = useState("");

    const navigate = useNavigate();

    async function handleLogIn(e) {
        e.preventDefault();

        if (!checked) {
            alert("Please check the box to accept the Terms of Use and Privacy Statement.");
            return;
        }

        let userData = { email, password };
        console.log(userData);

        try {
            const res = await axios.post("https://reqres.in/api/login", userData, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": "reqres-free-v1",
                },
            });

            localStorage.setItem("token", res.data.token);
            setUser(null); // Clear any previous error
            navigate("/dashboard", { replace: true }); // Navigate to dashboard
        } catch (error) {
            console.log(error);
            setUser(error?.response?.data?.error || "Something Went Wrong");
        }
    }

    function handleLogOut() {
        localStorage.removeItem("token");
        navigate("/", { replace: true });
    }

    return (
        <form className="space-y-6">
            {/* Email */}
            <div>
                <label className="block text-gray-700 font-medium mb-2">
                    Email Address
                </label>
                <input
                    type="email"
                    value={email}
                    placeholder="eve.holt@reqres.in"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            {/* Password */}
            <div>
                <label className="block text-gray-700 font-medium mb-2">Password</label>
                <input
                    type="password"
                    value={password}
                    placeholder="Password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    onChange={(e) => setPass(e.target.value)}
                    required
                />
            </div>

            {/* Remember Me */}
            <div className="flex items-start">
                <input
                    type="checkbox"
                    id="rememberMe"
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    onChange={(e) => setChecked(e.target.checked)}
                    required
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
                    I certify that I have read and accept the{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                        Terms of Use
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                        Privacy Statement
                    </a>
                    , and I have read and understand the Rate Description and Rate Rules
                    for my reservation.
                </label>
            </div>

            {/* Error message */}
            {user && (
                <p className="text-red-600 font-medium text-sm animate-fade-in">
                    {user}
                </p>
            )}

            {/* Button */}
            {localStorage.getItem("token") ? (
                <button
                    type="button"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition duration-300 transform hover:scale-105"
                    onClick={handleLogOut}
                >
                    Log Out
                </button>
            ) : (
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 transform hover:scale-105"
                    onClick={handleLogIn}
                >
                    Sign In
                </button>
            )}
        </form>
    );
}

export default LoginForm;