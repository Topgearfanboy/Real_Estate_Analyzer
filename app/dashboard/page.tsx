"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  name: string | null;
  properties: Array<{
    id: string;
    name: string;
    purchasePrice: number;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.push("/login");
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      // Handle error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Real Estate Analyzer</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Welcome, {user.name || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Properties</h2>
          <Link
            href="/build"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + New Analysis
          </Link>
        </div>

        {user.properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No properties yet</p>
            <Link
              href="/build"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create your first analysis
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user.properties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold mb-2">{property.name}</h3>
                <p className="text-gray-600">
                  Purchase Price: ${property.purchasePrice.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Created: {new Date(property.createdAt).toLocaleDateString()}
                </p>
                <Link
                  href={`/build/${property.id}`}
                  className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                >
                  View Analysis →
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
