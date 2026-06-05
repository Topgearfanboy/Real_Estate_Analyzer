import type { Property, ProjectSettings } from "@/types";

const STORAGE_KEY = "real_estate_properties";

export function getProperties(): Property[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load properties:", error);
    return [];
  }
}

export function getPropertyById(id: string): Property | null {
  const properties = getProperties();
  return properties.find((p) => p.id === id) || null;
}

export function saveProperty(property: Property): void {
  if (typeof window === "undefined") return;
  try {
    const properties = getProperties();
    const existingIndex = properties.findIndex((p) => p.id === property.id);

    if (existingIndex >= 0) {
      properties[existingIndex] = {
        ...property,
        updatedAt: new Date().toISOString(),
      };
    } else {
      properties.push({
        ...property,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
  } catch (error) {
    console.error("Failed to save property:", error);
  }
}

export function deleteProperty(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const properties = getProperties();
    const filtered = properties.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete property:", error);
  }
}

export function createNewProperty(name: string, address: string): Property {
  const defaultSettings: ProjectSettings = {
    years: 30,
    cashStrategy: "profit",
    idealCashHoldingBalance: 10000,
    estimatedHomeAppreciationRate: 3,
    purchaseDate: new Date().toISOString().split("T")[0],
  };

  return {
    id: `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    address,
    blocks: [],
    projectSettings: defaultSettings,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
