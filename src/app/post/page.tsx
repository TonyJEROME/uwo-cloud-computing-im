"use client";

import { useState, useEffect, useRef } from "react";
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
  images?: { imageId: string; imageUrl: string }[];
};

export default function PostPage() {
    const [newPost, setNewPost] = useState("");
    const router = useRouter();
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [likeStates, setLikeStates] = useState<Record<string, boolean>>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedImages, setUploadedImages] = useState<Array<{imageId: string, imageUrl: string}>>([]);

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

    // Fetch like status for all posts
    const fetchLikeStatus = async (postId: string) => {
        if (!isLoggedIn) return;
        
        try {
            const response = await fetch(`/api/posts/${postId}/like`);
            if (response.ok) {
                const data = await response.json();
                setLikeStates(prev => ({
                    ...prev,
                    [postId]: data.liked
                }));
            }
        } catch (error) {
            console.error("Error fetching like status:", error);
        }
    };

    // Fetch all like statuses when posts load or login status changes
    useEffect(() => {
        if (isLoggedIn && allPosts.length > 0) {
            allPosts.forEach(post => {
                fetchLikeStatus(post.postId);
            });
        }
    }, [isLoggedIn, allPosts]);

    // Enhance file change handler with better error handling
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setSelectedFile(file);
            
            // Start upload immediately
            setUploadingImage(true);
            
            try {
                // Create a temporary post to hold the image
                console.log("Creating temporary post...");
                const tempPostResponse = await fetch("/api/posts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ 
                        content: "Temporary post for image upload", 
                        isTemporary: true 
                    }),
                });

                // Add additional debugging for the response
                console.log("Temporary post response status:", tempPostResponse.status);
                const responseText = await tempPostResponse.text();
                console.log("Raw response:", responseText);

                // Parse the response
                let tempPost;
                try {
                    tempPost = JSON.parse(responseText);
                    console.log("Parsed temporary post data:", tempPost);
                } catch (e) {
                    console.error("Error parsing JSON response:", e);
                    throw new Error("Failed to parse server response");
                }

                if (!tempPost || !tempPost.postId) {
                    console.error("No valid postId received from server:", tempPost);
                    throw new Error("Failed to get valid post ID for image upload");
                }

                const tempPostId = tempPost.postId;
                console.log("Using post ID for image upload:", tempPostId);
                
                // Upload image to the temporary post
                const formData = new FormData();
                formData.append('image', file);
                
                console.log("Uploading image to post:", tempPostId);
                const uploadResponse = await fetch(`/api/posts/${tempPostId}/image`, {
                    method: 'POST',
                    body: formData,
                });
                
                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json();
                    console.error("Image upload API error:", errorData);
                    throw new Error(`Failed to upload image: ${errorData.error || "Unknown error"}`);
                }
                
                const uploadedImage = await uploadResponse.json();
                console.log("Image uploaded successfully:", uploadedImage);
                
                // Store the uploaded image info
                setUploadedImages(prev => [...prev, {
                    imageId: uploadedImage.imageId,
                    imageUrl: uploadedImage.imageUrl
                }]);
                
                // Show success notification
                alert("Image uploaded successfully! It will be attached when you submit your post.");
                
                // Reset file input
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } catch (error) {
                console.error('Error during image upload process:', error);
                alert(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
            } finally {
                setUploadingImage(false);
            }
        }
    };

    // Modify handleSubmit to use already uploaded images
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
                body: JSON.stringify({ 
                    content: newPost,
                    imageIds: uploadedImages.map(img => img.imageId) // Pass the uploaded image IDs
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create post");
            }
            
            // Reset form
            setNewPost("");
            setUploadedImages([]);
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

    // Handle like button click
    const handleLikeToggle = async (postId: string) => {
        if (!isLoggedIn) {
            alert("Please log in to like posts");
            router.push('/login');
            return;
        }
        
        try {
            const response = await fetch(`/api/posts/${postId}/like`, {
                method: "POST",
            });
            
            if (response.ok) {
                const data = await response.json();
                // Update like state
                setLikeStates(prev => ({
                    ...prev,
                    [postId]: data.liked
                }));
                
                // Update post like count in the UI
                setAllPosts(prev => prev.map(post => {
                    if (post.postId === postId) {
                        return {
                            ...post,
                            likeCount: (post.likeCount || 0) + (data.liked ? 1 : -1)
                        };
                    }
                    return post;
                }));
            }
        } catch (error) {
            console.error("Error toggling like:", error);
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
                    
                    <div className="flex items-center mt-2 space-x-4">
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                className="text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 dark:file:bg-gray-700 dark:file:text-white hover:file:bg-gray-300 dark:hover:file:bg-gray-600"
                            />
                            {selectedFile && (
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                    {selectedFile.name}
                                </span>
                            )}
                        </div>
                        
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            disabled={uploadingImage}
                        >
                            {uploadingImage ? "Uploading..." : "Post"}
                        </button>
                    </div>
                </form>

                {uploadedImages.length > 0 && (
                    <div className="mt-4 mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Uploaded images (will be attached to your post):</p>
                        <div className="flex flex-wrap gap-2">
                            {uploadedImages.map(image => (
                                <div key={image.imageId} className="relative">
                                    <img 
                                        src={image.imageUrl} 
                                        alt="Uploaded image" 
                                        className="w-24 h-24 object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={() => {
                                            setUploadedImages(prev => prev.filter(img => img.imageId !== image.imageId));
                                        }}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                            {post.images && post.images.length > 0 && (
                                <div className="mt-4 mb-4">
                                    {post.images.map(image => (
                                        <div key={image.imageId} className="mt-2 rounded-lg overflow-hidden">
                                            <img 
                                                src={image.imageUrl} 
                                                alt="Post image" 
                                                className="max-w-full h-auto rounded-lg"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-4 flex items-center space-x-4">
                                <button 
                                    onClick={() => handleLikeToggle(post.postId)}
                                    className={`flex items-center space-x-2 ${
                                        likeStates[post.postId] 
                                            ? "text-blue-600" 
                                            : "text-gray-500 hover:text-blue-600"
                                    }`}
                                >
                                    <span>{likeStates[post.postId] ? "❤️" : "👍"}</span>
                                    <span>{post.likeCount || 0}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
