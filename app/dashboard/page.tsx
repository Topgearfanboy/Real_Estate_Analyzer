"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/uiComponents/Navbar";
import { getProperties } from "@/utils/propertyStorage";
import type { Property } from "@/types";

interface User {
  id: string;
  email: string;
  name: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user
        const userResponse = await fetch("/api/auth/me");
        if (!userResponse.ok) {
          router.push("/login");
          return;
        }
        const userData = await userResponse.json();
        setUser(userData.user);

        // Fetch properties
        const props = await getProperties();
        setProperties(props);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized") {
          router.push("/login");
        } else {
          setError("Failed to load data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

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
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Properties</h2>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + New Property
          </Link>
        </div>

        {properties.length === 0 ? (
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
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold mb-2">{property.name}</h3>
                <p className="text-gray-600">
                  {property.address || "No address"}
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
