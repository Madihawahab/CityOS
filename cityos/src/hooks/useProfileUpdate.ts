"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional()
});

export function useProfileUpdate() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateProfile = async (formData: { fullName: string; email: string; phone?: string }) => {
    setError(null);
    setSuccess(false);

    const validation = profileSchema.safeParse(formData);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Validation failed");
      return false;
    }

    if (!user) {
      setError("No authenticated user found");
      return false;
    }

    // Sync updated details to useAuthStore
    const updatedUser = {
      ...user,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone
    };

    setUser(updatedUser);
    setSuccess(true);
    setIsEditing(false);
    return true;
  };

  return {
    isEditing,
    setIsEditing,
    error,
    success,
    updateProfile,
    user
  };
}
