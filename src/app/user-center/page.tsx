"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { db } from "@/db";
import { users } from "@/db/schema";

export default function UserCenter() {
    const router = useRouter();
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [user, setUser] = useState<{
        userId: number;
        firstName: string;
        lastName: string;
        email: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('/api/auth/check-session');
                
                if (!response.ok) {
                    // Not logged in, redirect to login
                    router.push('/login');
                    return;
                }
                
                const data = await response.json();
                setUser(data.user);
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserData();
    }, [router]);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitPasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validate new password match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError("New passwords don't match");
            return;
        }

        try {
            const response = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to change password");
            }

            setSuccess("Password changed successfully");
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setIsChangingPassword(false);
        } catch (err: any) {
            setError(err.message || "An error occurred while changing password");
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
            });
            
            if (!response.ok) {
                throw new Error("Failed to logout");
            }
            
            // Redirect to login page after successful logout
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
            setError("Failed to logout. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                    <div className="mb-8">
                        {loading ? (
                            <p className="text-gray-500">Loading profile information...</p>
                        ) : (
                            <>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {user ? `${user.firstName} ${user.lastName}` : "User Profile"}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {user?.email || "example@email.com"}
                                </p>
                            </>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm mb-4">
                            {success}
                        </div>
                    )}

                    <div className="space-y-8">
                        <div className="pb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Security</h2>
                                
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                            
                            {!isChangingPassword ? (
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Change Password
                                </button>
                            ) : (
                                <form onSubmit={handleSubmitPasswordChange} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            type="submit"
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsChangingPassword(false)}
                                            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                        
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">My Posts</h2>
                            <a
                                href="/post"
                                className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                View all posts
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
