import type { Property } from "@/types";

// API-based property storage
// All operations require authentication

export async function getProperties(): Promise<Property[]> {
  try {
    const response = await fetch("/api/properties");
    if (!response.ok) {
      if (response.status === 401) {
        // Not authenticated - let the caller handle redirect
        throw new Error("Unauthorized");
      }
      throw new Error(`Failed to fetch properties: ${response.statusText}`);
    }
    const data = await response.json();
    return data.properties || [];
  } catch (error) {
    console.error("Failed to load properties:", error);
    throw error;
  }
}

export async function getPropertyById(id: string): Promise<Property | null> {
  try {
    const response = await fetch(`/api/properties/${id}`);
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch property: ${response.statusText}`);
    }
    const data = await response.json();
    return data.property || null;
  } catch (error) {
    console.error("Failed to load property:", error);
    throw error;
  }
}

export async function saveProperty(property: Property): Promise<Property> {
  try {
    const response = await fetch(`/api/properties/${property.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: property.name,
        address: property.address,
        blocks: property.blocks,
        projectSettings: property.projectSettings,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error(`Failed to save property: ${response.statusText}`);
    }

    const data = await response.json();
    return data.property;
  } catch (error) {
    console.error("Failed to save property:", error);
    throw error;
  }
}

export async function deleteProperty(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/properties/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error(`Failed to delete property: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Failed to delete property:", error);
    throw error;
  }
}

export async function createNewProperty(
  name: string,
  address: string,
): Promise<Property> {
  const response = await fetch("/api/properties", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, address }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error(`Failed to create property: ${response.statusText}`);
  }

  const data = await response.json();
  return data.property;
}
