"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Define the User type based on your schema
type User = {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
};

// Define the Post type based on your schema
type Post = {
  createdAt: Date | null;
  updatedAt: Date | null;
  postId: string;
  userId: number;
  content: string;
  likeCount: number | null;
  user?: User;  // Add user information
};

export default function PostPage() {
    const [newPost, setNewPost] = useState("");
    const router = useRouter();
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Use API to get posts instead of directly accessing the database
    const fetchPosts = async () => {
        try {
            const response = await fetch('/api/posts');
            if (response.ok) {
                const data = await response.json();
                setAllPosts(data);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };

    // Check login status in useEffect
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await fetch('/api/auth/check-session');
                setIsLoggedIn(response.ok);
            } catch (error) {
                console.error("Error checking login status:", error);
                setIsLoggedIn(false);
            }
        };
        
        checkLoginStatus();
        fetchPosts();
    }, []);

    // Check login status before form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isLoggedIn) {
            alert("Please log in before posting");
            router.push('/login');
            return;
        }
        
        try {
            const response = await fetch("/api/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: newPost }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create post");
            }

            setNewPost("");
            fetchPosts(); // Refresh posts
        } catch (error) {
            console.error("Error creating post:", error);
            alert(error instanceof Error ? error.message : "Failed to publish post");
        }
    };
    
    // Add post deletion function
    const handleDeletePost = async (postId: string) => {
        if (confirm("Are you sure you want to delete this post?")) {
            setIsDeleting(postId);
            try {
                const response = await fetch(`/api/posts/${postId}`, {
                    method: "DELETE",
                });
                
                if (!response.ok) {
                    throw new Error("Failed to delete post");
                }
                
                // Refresh post list after successful deletion
                fetchPosts();
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post");
            } finally {
                setIsDeleting(null);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Posts</h1>
                    <div className="flex space-x-4">
                        <Link
                            href="/user-center"
                            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Profile
                        </Link>
                        <a
                            href="/post/new"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            New Post
                        </a>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mb-8">
                    <textarea
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Share your thoughts..."
                        rows={4}
                    />
                    <button
                        type="submit"
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Post
                    </button>
                </form>

                <div className="space-y-6">
                    {allPosts.map((post) => (
                        <div 
                            key={post.postId} 
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="flex flex-col">
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {post.user ? `${post.user.firstName} ${post.user.lastName}` : "Unknown User"}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(post.createdAt!).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeletePost(post.postId)}
                                    disabled={isDeleting === post.postId}
                                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                >
                                    {isDeleting === post.postId ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                            <div className="text-gray-900 dark:text-white">
                                {post.content}
                            </div>
                            <div className="mt-4 flex items-center space-x-4">
                                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600">
                                    <span>👍</span>
                                    <span>{post.likeCount}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
