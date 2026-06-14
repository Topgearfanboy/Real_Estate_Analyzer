"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Property } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { getProperties, createNewProperty } from "@/utils/propertyStorage";

export default function Home() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [showNewPropertyForm, setShowNewPropertyForm] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState("");
  const [newPropertyAddress, setNewPropertyAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadProperties = async () => {
      try {
        const loaded = await getProperties();
        setProperties(loaded);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized") {
          router.push("/login");
        } else {
          setError("Failed to load properties");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, [authLoading, isAuthenticated, router]);

  const handleAddProperty = async () => {
    if (!newPropertyName.trim() || !newPropertyAddress.trim()) {
      alert("Please enter both property name and address");
      return;
    }

    try {
      const newProperty = await createNewProperty(
        newPropertyName,
        newPropertyAddress,
      );
      setProperties([...properties, newProperty]);
      setNewPropertyName("");
      setNewPropertyAddress("");
      setShowNewPropertyForm(false);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized") {
        router.push("/login");
      } else {
        setError("Failed to create property");
      }
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-text mb-8">Dashboard</h1>
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Dashboard</h1>
          <p className="text-text-muted">Manage your property investments</p>
        </div>
        <button
          onClick={() => setShowNewPropertyForm(!showNewPropertyForm)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors flex items-center gap-2 shadow-md"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Property
        </button>
      </div>

      {showNewPropertyForm && (
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-xl font-semibold text-text mb-4">New Property</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Property Name
              </label>
              <input
                type="text"
                value={newPropertyName}
                onChange={(e) => setNewPropertyName(e.target.value)}
                placeholder="e.g., Downtown Apartment"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Address
              </label>
              <input
                type="text"
                value={newPropertyAddress}
                onChange={(e) => setNewPropertyAddress(e.target.value)}
                placeholder="e.g., 123 Main St, City, State"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddProperty}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors"
              >
                Create Property
              </button>
              <button
                onClick={() => {
                  setShowNewPropertyForm(false);
                  setNewPropertyName("");
                  setNewPropertyAddress("");
                }}
                className="px-4 py-2 bg-gray-100 text-text rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {properties.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-border/60 p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-text-muted/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 5h4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-text mb-2">
            No properties yet
          </h3>
          <p className="text-text-muted max-w-md mx-auto mb-6">
            Create your first property to start analyzing your real estate
            investments.
          </p>
          <button
            onClick={() => setShowNewPropertyForm(true)}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors inline-flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create First Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/build/${property.id}`}
              className="bg-white rounded-xl shadow-sm border border-border p-6 hover:shadow-lg hover:border-primary/50 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 5h4"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-text mb-1 group-hover:text-primary transition-colors">
                {property.name}
              </h2>
              <p className="text-sm text-text-muted mb-3">{property.address}</p>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-text-muted">
                  {property.blocks.length} block
                  {property.blocks.length !== 1 ? "s" : ""}
                </span>
                <span className="text-xs font-medium text-primary">View →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
