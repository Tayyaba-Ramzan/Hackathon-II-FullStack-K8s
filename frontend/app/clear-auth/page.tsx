"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClearAuthPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear all authentication data
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    // Redirect to signin after a brief delay
    setTimeout(() => {
      router.push("/signin");
    }, 1000);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Clearing authentication...
        </h2>
        <p className="text-gray-600">
          Redirecting to sign in page...
        </p>
      </div>
    </div>
  );
}
