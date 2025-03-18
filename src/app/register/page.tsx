"use client";

import Image from "next/image";
import Link from "next/link";

export default function Register() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="text-center">
                    <Image
                        className="mx-auto h-12 w-auto dark:invert"
                        src="/next.svg"
                        alt="Logo"
                        width={48}
                        height={48}
                        priority
                    />
                    <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
                        创建新账户
                    </h2>
                </div>
                <form className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                邮箱地址
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="邮箱地址"
                            />
                        </div>
                        <div>
                            <label htmlFor="firstName" className="sr-only">
                                名字
                            </label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="名字"
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="sr-only">
                                姓氏
                            </label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="姓氏"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                密码
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="密码"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">
                                确认密码
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="确认密码"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            注册
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        已有账户?{" "}
                        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            立即登录
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
