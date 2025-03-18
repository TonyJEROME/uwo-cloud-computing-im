import Image from "next/image";
import { db } from "@/db";
import { posts } from "@/db/schema";

export default async function PostPage() {
    const allPosts = await db.select().from(posts);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">帖子列表</h1>
                    <a
                        href="/post/new"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        发布新帖子
                    </a>
                </div>

                <div className="space-y-6">
                    {allPosts.map((post) => (
                        <div 
                            key={post.postId} 
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(post.createdAt!).toLocaleDateString()}
                                    </div>
                                </div>
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
