import Image from "next/image";
import { db } from "@/db";
import { users } from "@/db/schema";

export default async function UserCenter() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-4xl text-gray-400">👤</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">用户中心</h1>
                            <p className="text-gray-500 dark:text-gray-400">example@email.com</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="border-b dark:border-gray-700 pb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">个人信息</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        姓名
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="您的姓名"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        电话
                                    </label>
                                    <input
                                        type="tel"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="联系电话"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-b dark:border-gray-700 pb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">账户安全</h2>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                修改密码
                            </button>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">我的帖子</h2>
                            <a
                                href="/post"
                                className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                查看全部帖子
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
