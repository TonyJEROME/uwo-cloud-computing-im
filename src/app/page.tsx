"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to login page
    router.push("/login");
  }, [router]);
  
  // Return a minimal loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl text-gray-700 dark:text-gray-300">Redirecting to login...</h1>
        <div className="mt-4 w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full mx-auto animate-spin"></div>
      </div>
    </div>
  );
}
