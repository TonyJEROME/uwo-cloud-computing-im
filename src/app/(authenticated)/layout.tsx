"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* 导航栏 */}
            <nav className="bg-white dark:bg-gray-800 shadow-lg">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between h-16">
                        <div className="flex space-x-4">
                            <Link
                                href="/posts"
                                className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                                    pathname === "/posts"
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-500"
                                }`}
                            >
                                动态
                            </Link>
                            <Link
                                href="/profile"
                                className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                                    pathname === "/profile"
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-500"
                                }`}
                            >
                                个人中心
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 主要内容区域 */}
            <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        </div>
    );
} 