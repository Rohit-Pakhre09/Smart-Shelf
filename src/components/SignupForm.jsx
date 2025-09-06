import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function SignUpForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        // Store token and email in localStorage
        const token = btoa(email);
        localStorage.setItem('token', token);
        localStorage.setItem('email', email);

        setSuccess('Sign-up successful! Redirecting to dashboard...');
        setTimeout(() => {
            navigate('/dashboard', { replace: true });
        }, 1000);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-500 text-center">{error}</p>}
            {success && <p className="text-green-500 text-center">{success}</p>}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                />
            </div>
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                </label>
                <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm your password"
                />
            </div>
            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
                Sign Up
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account? <Link to="/" className="text-blue-600 hover:underline">Login</Link>
            </p>
        </form>
    );
}

export default SignUpForm;