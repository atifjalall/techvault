/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  MapPinIcon,
  PhoneIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  ArrowLongRightIcon,
  ShoppingBagIcon,
  HeartIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

// UI Components
import Button from "@/components/ui/userButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Footer from "@/components/layout/Footer";
import { getUserInitials } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  joinedAt: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// Validation functions
const validateName = (name: string): string | null => {
  if (!name.trim()) return "This field is required";
  if (name.length < 2) return "Must be at least 2 characters";
  if (name.length > 50) return "Must be less than 50 characters";
  if (!/^[a-zA-ZÀ-ÿĀ-žА-я\s'-]+$/.test(name))
    return "Only letters, spaces, hyphens and apostrophes allowed";
  return null;
};

const validatePhone = (phone: string): string | null => {
  if (!phone.trim()) return null; // Phone is optional
  // Remove all non-digits for validation
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length < 10) return "Phone number too short";
  if (digitsOnly.length > 15) return "Phone number too long";
  if (!/^[+]?[\d\s\-()]+$/.test(phone)) return "Invalid phone number format";
  return null;
};

const validateBio = (bio: string): string | null => {
  if (bio.length > 500) return "Bio must be less than 500 characters";
  // Check for potentially malicious content
  if (/<script|javascript:|data:|vbscript:/i.test(bio))
    return "Invalid content detected";
  return null;
};

const validateAddress = (
  field: string,
  value: string,
  fieldName: string
): string | null => {
  if (field === "street" && value.trim()) {
    if (value.length < 5) return "Street address too short";
    if (value.length > 100) return "Street address too long";
  }

  if (field === "city" && value.trim()) {
    if (value.length < 2) return "City name too short";
    if (value.length > 50) return "City name too long";
    if (!/^[a-zA-ZÀ-ÿĀ-žА-я\s'-]+$/.test(value))
      return "Invalid city name format";
  }

  if (field === "state" && value.trim()) {
    if (value.length > 50) return "State name too long";
    if (!/^[a-zA-ZÀ-ÿĀ-žА-я\s'-]+$/.test(value))
      return "Invalid state name format";
  }

  if (field === "zipCode" && value.trim()) {
    if (!/^[0-9A-Za-z\s-]{3,10}$/.test(value))
      return "Invalid postal code format";
  }

  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Must be at least 8 characters";
  if (password.length > 128) return "Password too long";
  if (!/[A-Z]/.test(password)) return "Must contain uppercase letter";
  if (!/[a-z]/.test(password)) return "Must contain lowercase letter";
  if (!/\d/.test(password)) return "Must contain a number";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    return "Must contain special character";
  return null;
};

// Input sanitization
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

// Secure input component that prevents copy/paste of sensitive data
const SecureInput = ({
  type,
  value,
  onChange,
  placeholder,
  className,
  id,
  maxLength,
  ...props
}: any) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent Ctrl+A, Ctrl+C, Ctrl+V for password fields
    if (type === "password" && (e.ctrlKey || e.metaKey)) {
      if (["a", "c", "v", "x"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    // Disable right-click context menu on password fields
    if (type === "password") {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Apply maxLength if specified
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
    }

    // Sanitize input for non-password fields
    if (type !== "password") {
      newValue = sanitizeInput(newValue);
    }

    onChange({ target: { value: newValue } });
  };

  return (
    <Input
      {...props}
      id={id}
      type={type}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
      placeholder={placeholder}
      className={className}
      autoComplete={type === "password" ? "new-password" : "off"}
      spellCheck={false}
      maxLength={maxLength}
    />
  );
};

// Loading Skeleton with full animations
function ProfileSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Breadcrumb Skeleton */}
      <div className="w-full pt-5 pb-4">
        <div className="flex items-center space-x-2 ml-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Profile Overview Skeleton */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-40 mx-auto" />
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Skeleton */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Skeleton className="w-4 h-4 mr-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-3 w-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-3 space-y-6"
        >
          {/* Personal Information Skeleton */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-48" /> {/* Personal Information */}
                  <Skeleton className="h-8 w-16" /> {/* Edit button */}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Skeleton className="h-4 w-20 mb-2" /> {/* First Name */}
                      <Skeleton className="h-5 w-full" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-20 mb-2" /> {/* Last Name */}
                      <Skeleton className="h-5 w-full" />
                    </div>
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" /> {/* Email Address */}
                    <Skeleton className="h-5 w-64" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-28 mb-2" /> {/* Phone Number */}
                    <Skeleton className="h-5 w-40" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-12 mb-2" /> {/* Bio */}
                    <Skeleton className="h-16 w-full" /> {/* Multi-line bio */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Shipping Address Skeleton */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="w-5 h-5 mr-2" /> {/* Map icon */}
                    <Skeleton className="h-6 w-36" /> {/* Shipping Address */}
                  </div>
                  <Skeleton className="h-8 w-16" /> {/* Edit button */}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" /> {/* Street address */}
                  <Skeleton className="h-4 w-36" /> {/* City, State ZIP */}
                  <Skeleton className="h-4 w-24" /> {/* Country */}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Password & Security Skeleton */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="w-5 h-5 mr-2" /> {/* Key icon */}
                    <Skeleton className="h-6 w-44" />{" "}
                    {/* Password & Security */}
                  </div>
                  <Skeleton className="h-8 w-32" />{" "}
                  {/* Change Password button */}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Skeleton className="h-4 w-16 mb-2" /> {/* Password */}
                    <Skeleton className="h-4 w-24" /> {/* ••••••••••••• */}
                  </div>
                  <div>
                    <Skeleton className="h-4 w-28" /> {/* Last updated */}
                  </div>
                  <div>
                    <Skeleton className="h-4 w-56" />{" "}
                    {/* Forgot password link */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "VENDOR") {
      router.replace("/vendor/dashboard");
    }
  }, [status, session, router]);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user) return;

      try {
        setLoading(true);
        const response = await fetch("/api/profile");

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const result = await response.json();
        if (result.success) {
          setProfileData(result.profile);
        } else {
          throw new Error("Failed to load profile data");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      loadProfile();
    }
  }, [session]);

  // Don't render content for vendors
  if (session?.user?.role === "VENDOR") {
    return null;
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const validatePasswordStrength = (password: string): boolean => {
    return validatePassword(password) === null;
  };

  const validatePersonalForm = (): boolean => {
    if (!profileData) return false;

    const errors: ValidationErrors = {};

    const firstNameError = validateName(profileData.firstName);
    if (firstNameError) errors.firstName = firstNameError;

    const lastNameError = validateName(profileData.lastName);
    if (lastNameError) errors.lastName = lastNameError;

    const phoneError = validatePhone(profileData.phone);
    if (phoneError) errors.phone = phoneError;

    const bioError = validateBio(profileData.bio);
    if (bioError) errors.bio = bioError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAddressForm = (): boolean => {
    if (!profileData) return false;

    const errors: ValidationErrors = {};

    const streetError = validateAddress(
      "street",
      profileData.address.street,
      "Street"
    );
    if (streetError) errors.street = streetError;

    const cityError = validateAddress("city", profileData.address.city, "City");
    if (cityError) errors.city = cityError;

    const stateError = validateAddress(
      "state",
      profileData.address.state,
      "State"
    );
    if (stateError) errors.state = stateError;

    const zipError = validateAddress(
      "zipCode",
      profileData.address.zipCode,
      "ZIP Code"
    );
    if (zipError) errors.zipCode = zipError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!passwordData.currentPassword.trim()) {
      errors.currentPassword = "Current password is required";
    }

    const newPasswordError = validatePassword(passwordData.newPassword);
    if (newPasswordError) errors.newPassword = newPasswordError;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword =
        "New password must be different from current password";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePersonalUpdate = async () => {
    if (!profileData) return;

    if (!validatePersonalForm()) {
      showError("Please fix the validation errors");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "personal",
          data: {
            firstName: sanitizeInput(profileData.firstName),
            lastName: sanitizeInput(profileData.lastName),
            phone: sanitizeInput(profileData.phone),
            bio: sanitizeInput(profileData.bio),
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      setIsEditingPersonal(false);
      setValidationErrors({});
      showSuccess("Personal information updated successfully!");
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddressUpdate = async () => {
    if (!profileData) return;

    if (!validateAddressForm()) {
      showError("Please fix the validation errors");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "address",
          data: {
            street: sanitizeInput(profileData.address.street),
            city: sanitizeInput(profileData.address.city),
            state: sanitizeInput(profileData.address.state),
            zipCode: sanitizeInput(profileData.address.zipCode),
            country: profileData.address.country,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update address");
      }

      setIsEditingAddress(false);
      setValidationErrors({});
      showSuccess("Address updated successfully!");
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to update address"
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!validatePasswordForm()) {
      showError("Please fix the validation errors");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "password",
          data: {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update password");
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsEditingPassword(false);
      setValidationErrors({});
      showSuccess("Password updated successfully!");
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to update password"
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = (section: string) => {
    switch (section) {
      case "personal":
        setIsEditingPersonal(false);
        break;
      case "address":
        setIsEditingAddress(false);
        break;
      case "password":
        setIsEditingPassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        break;
    }
    setError(null);
    setValidationErrors({});
  };

  // Clear validation errors when user starts typing
  const handleInputChange = (field: string, value: string) => {
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-6"
        >
          <ProfileSkeleton />
        </motion.div>
        <Footer />
      </div>
    );
  }

  if (!session || !profileData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumb */}
      <div className="pt-8 px-4 pb-4">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="cursor-pointer">
                      Home
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Profile</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-2 lg:px-6 py-2 lg:py-6 space-y-2 lg:space-y-6"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 lg:p-6">
              <div className="flex items-center justify-between">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-sm lg:text-xl font-bold text-gray-900"
                  >
                    My Profile
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-xs lg:text-lg text-gray-600 mt-0.5 lg:mt-1"
                  >
                    Manage your account information and preferences
                  </motion.p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-2 lg:p-4">
                  <div className="flex items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.1,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      <CheckIcon className="w-3 lg:w-4 h-3 lg:h-4 text-green-600 mr-1 lg:mr-2" />
                    </motion.div>
                    <p className="text-xs lg:text-sm text-green-700 font-medium">
                      {successMessage}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-2 lg:p-4">
                  <div className="flex items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.1,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      <ExclamationTriangleIcon className="w-3 lg:w-4 h-3 lg:h-4 text-red-600 mr-1 lg:mr-2" />
                    </motion.div>
                    <p className="text-xs lg:text-sm text-red-700 font-medium">
                      {error}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-2 lg:space-y-6"
          >
            {/* Profile Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3 lg:p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    className="w-12 h-12 lg:w-20 lg:h-20 mx-auto mb-2 lg:mb-4"
                  >
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        width={80}
                        height={80}
                        className="w-full h-full rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gray-900 text-white flex items-center justify-center text-lg lg:text-xl font-bold">
                        {getUserInitials(
                          profileData.firstName + " " + profileData.lastName
                        )}
                      </div>
                    )}
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="text-sm lg:text-lg font-semibold text-gray-900 mb-0.5 lg:mb-1"
                  >
                    {profileData.firstName} {profileData.lastName}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-xs lg:text-base text-gray-600 mb-2 lg:mb-3"
                  >
                    {profileData.email}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="flex items-center justify-center space-x-1 lg:space-x-2 text-[10px] lg:text-xs text-gray-500"
                  >
                    <UserIcon className="w-2 lg:w-3 h-2 lg:h-3" />
                    <span>
                      Member since{" "}
                      {new Date(profileData.joinedAt).getFullYear()}
                    </span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="flex items-center justify-center space-x-1 lg:space-x-2 mt-1 lg:mt-2"
                  >
                    {profileData.emailVerified && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.9,
                          type: "spring",
                          stiffness: 200,
                        }}
                      >
                        <Badge
                          variant="secondary"
                          className="text-[8px] lg:text-xs h-4 lg:h-5 px-1 lg:px-2"
                        >
                          Email Verified
                        </Badge>
                      </motion.div>
                    )}
                    {profileData.phoneVerified && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 1.0,
                          type: "spring",
                          stiffness: 200,
                        }}
                      >
                        <Badge
                          variant="secondary"
                          className="text-[8px] lg:text-xs h-4 lg:h-5 px-1 lg:px-2"
                        >
                          Phone Verified
                        </Badge>
                      </motion.div>
                    )}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2 lg:pb-6 px-3 lg:px-6 pt-3 lg:pt-6">
                  <CardTitle className="text-sm lg:text-lg">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 lg:p-4 pt-0">
                  <div className="space-y-1 lg:space-y-2">
                    {[
                      {
                        href: "/orders",
                        icon: ShoppingBagIcon,
                        label: "Order History",
                      },
                      { href: "/wishlist", icon: HeartIcon, label: "Wishlist" },
                    ].map((link, index) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                      >
                        <Link
                          href={link.href}
                          className="flex items-center justify-between p-1.5 lg:p-2 text-xs lg:text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <motion.div
                            whileHover={{ x: 2 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="flex items-center"
                          >
                            <link.icon className="w-3 lg:w-4 h-3 lg:h-4 mr-1 lg:mr-2" />
                            <span>{link.label}</span>
                          </motion.div>
                          <motion.span
                            whileHover={{ x: 2 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="text-[10px] lg:text-xs text-gray-400"
                          >
                            <ArrowLongRightIcon className="w-3 lg:w-5 h-3 lg:h-5 text-gray-600 mr-1 lg:mr-2" />
                          </motion.span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3 space-y-3 lg:space-y-6"
          >
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2 lg:pb-6 px-3 lg:px-6 pt-3 lg:pt-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm lg:text-lg">
                      Personal Information
                    </CardTitle>
                    {!isEditingPersonal && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={() => setIsEditingPersonal(true)}
                          variant="default"
                          size="sm"
                          className="cursor-pointer h-6 lg:h-8 text-xs lg:text-sm px-2 lg:px-4"
                        >
                          <PencilIcon className="w-3 lg:w-4 h-3 lg:h-4 mr-0.5 lg:mr-1" />
                          Edit
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-3 lg:px-6 pb-3 lg:pb-6">
                  <AnimatePresence mode="wait">
                    {isEditingPersonal ? (
                      <motion.div
                        key="editing"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4"
                        >
                          <div>
                            <Label
                              htmlFor="firstName"
                              className="text-xs lg:text-sm"
                            >
                              First Name
                            </Label>
                            <motion.div whileFocus={{ scale: 1.01 }}>
                              <SecureInput
                                id="firstName"
                                value={profileData.firstName}
                                onChange={(e: any) => {
                                  setProfileData((prev) =>
                                    prev
                                      ? { ...prev, firstName: e.target.value }
                                      : null
                                  );
                                  handleInputChange(
                                    "firstName",
                                    e.target.value
                                  );
                                }}
                                className={`mt-0.5 lg:mt-1 h-7 lg:h-10 text-xs lg:text-sm ${validationErrors.firstName ? "border-red-500" : ""}`}
                                maxLength={50}
                                placeholder="Enter first name"
                              />
                            </motion.div>
                            <AnimatePresence>
                              {validationErrors.firstName && (
                                <motion.p
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="mt-0.5 lg:mt-1 text-[10px] lg:text-xs text-red-600"
                                >
                                  {validationErrors.firstName}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                          <div>
                            <Label
                              htmlFor="lastName"
                              className="text-xs lg:text-sm"
                            >
                              Last Name
                            </Label>
                            <motion.div whileFocus={{ scale: 1.01 }}>
                              <SecureInput
                                id="lastName"
                                value={profileData.lastName}
                                onChange={(e: any) => {
                                  setProfileData((prev) =>
                                    prev
                                      ? { ...prev, lastName: e.target.value }
                                      : null
                                  );
                                  handleInputChange("lastName", e.target.value);
                                }}
                                className={`mt-0.5 lg:mt-1 h-7 lg:h-10 text-xs lg:text-sm ${validationErrors.lastName ? "border-red-500" : ""}`}
                                maxLength={50}
                                placeholder="Enter last name"
                              />
                            </motion.div>
                            <AnimatePresence>
                              {validationErrors.lastName && (
                                <motion.p
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="mt-0.5 lg:mt-1 text-[10px] lg:text-xs text-red-600"
                                >
                                  {validationErrors.lastName}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          <Label htmlFor="email" className="text-xs lg:text-sm">
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            readOnly
                            className="mt-0.5 lg:mt-1 h-7 lg:h-10 text-xs lg:text-sm bg-gray-50 text-gray-500"
                          />
                          <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5 lg:mt-1">
                            Email address cannot be changed
                          </p>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 }}
                        >
                          <Label htmlFor="phone" className="text-xs lg:text-sm">
                            Phone Number
                          </Label>
                          <motion.div whileFocus={{ scale: 1.01 }}>
                            <SecureInput
                              id="phone"
                              type="tel"
                              value={profileData.phone}
                              onChange={(e: any) => {
                                setProfileData((prev) =>
                                  prev
                                    ? { ...prev, phone: e.target.value }
                                    : null
                                );
                                handleInputChange("phone", e.target.value);
                              }}
                              placeholder="+49 123 456 7890"
                              className={`mt-0.5 lg:mt-1 h-7 lg:h-10 text-xs lg:text-sm ${validationErrors.phone ? "border-red-500" : ""}`}
                              maxLength={20}
                            />
                          </motion.div>
                          <AnimatePresence>
                            {validationErrors.phone && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-0.5 lg:mt-1 text-[10px] lg:text-xs text-red-600"
                              >
                                {validationErrors.phone}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.4 }}
                        >
                          <Label htmlFor="bio" className="text-xs lg:text-sm">
                            Bio
                          </Label>
                          <motion.textarea
                            whileFocus={{ scale: 1.01 }}
                            id="bio"
                            value={profileData.bio}
                            onChange={(e) => {
                              const sanitized = sanitizeInput(e.target.value);
                              if (sanitized.length <= 500) {
                                setProfileData((prev) =>
                                  prev ? { ...prev, bio: sanitized } : null
                                );
                                handleInputChange("bio", sanitized);
                              }
                            }}
                            placeholder="Tell us about yourself..."
                            className={`mt-0.5 lg:mt-1 w-full px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none ${validationErrors.bio ? "border-red-500" : "border-gray-300"}`}
                            rows={3}
                            maxLength={500}
                          />
                          <div className="flex justify-between items-center mt-1">
                            <AnimatePresence>
                              {validationErrors.bio && (
                                <motion.p
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="text-[10px] lg:text-xs text-red-600"
                                >
                                  {validationErrors.bio}
                                </motion.p>
                              )}
                            </AnimatePresence>
                            <span className="text-[10px] lg:text-xs text-gray-500">
                              {profileData.bio.length}/500
                            </span>
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.5 }}
                          className="flex flex-col sm:flex-row gap-3 lg:gap-4"
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              onClick={handlePersonalUpdate}
                              disabled={saving}
                              className="cursor-pointer w-full sm:w-auto"
                              variant="default"
                            >
                              {saving ? (
                                <div className="w-3 lg:w-4 h-3 lg:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1 lg:mr-2" />
                              ) : (
                                <CheckIcon className="w-3 lg:w-4 h-3 lg:h-4 mr-0.5 lg:mr-1" />
                              )}
                              Save Changes
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              onClick={() => cancelEdit("personal")}
                              variant="outline"
                              className="cursor-pointer w-full sm:w-auto"
                            >
                              <XMarkIcon className="w-3 lg:w-4 h-3 lg:h-4 mr-0.5 lg:mr-1" />
                              Cancel
                            </Button>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="viewing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4"
                        >
                          <div>
                            <Label className="text-xs lg:text-sm text-gray-600">
                              First Name
                            </Label>
                            <p className="text-xs lg:text-sm text-gray-900 mt-0.5 lg:mt-1">
                              {profileData.firstName || "Not set"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs lg:text-sm text-gray-600">
                              Last Name
                            </Label>
                            <p className="text-xs lg:text-sm text-gray-900 mt-0.5 lg:mt-1">
                              {profileData.lastName || "Not set"}
                            </p>
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                        >
                          <Label className="text-xs lg:text-sm text-gray-600">
                            Email Address
                          </Label>
                          <p className="text-xs lg:text-sm text-gray-900 mt-0.5 lg:mt-1">
                            {profileData.email}
                          </p>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          <Label className="text-xs lg:text-sm text-gray-600">
                            Phone Number
                          </Label>
                          <div className="flex items-center mt-0.5 lg:mt-1">
                            {profileData.phone ? (
                              <>
                                <Image
                                  src={`https://flagcdn.com/16x12/de.png`}
                                  alt="Country flag"
                                  width={12}
                                  height={9}
                                  className="mr-1 lg:mr-2"
                                />
                                <p className="text-xs lg:text-sm text-gray-900">
                                  {profileData.phone}
                                </p>
                              </>
                            ) : (
                              <p className="text-xs lg:text-sm text-gray-500">
                                Not set
                              </p>
                            )}
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 }}
                        >
                          <Label className="text-xs lg:text-sm text-gray-600">
                            Bio
                          </Label>
                          <p className="text-xs lg:text-sm text-gray-900 mt-0.5 lg:mt-1">
                            {profileData.bio || "No bio added"}
                          </p>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.6,
                          type: "spring",
                          stiffness: 200,
                        }}
                      >
                        <MapPinIcon className="w-3 lg:w-5 h-3 lg:h-5 text-gray-600 mr-1 lg:mr-2" />
                      </motion.div>
                      <CardTitle className="text-sm lg:text-lg">
                        Shipping Address
                      </CardTitle>
                    </div>
                    {!isEditingAddress && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={() => setIsEditingAddress(true)}
                          variant="default"
                          size="sm"
                          className="cursor-pointer h-6 lg:h-8 text-xs lg:text-sm px-2 lg:px-4"
                        >
                          <PencilIcon className="w-3 lg:w-4 h-3 lg:h-4 mr-0.5 lg:mr-1" />
                          Edit
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-3 lg:px-6 pb-3 lg:pb-6">
                  <AnimatePresence mode="wait">
                    {isEditingAddress ? (
                      <motion.div
                        key="editing-address"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                        >
                          <Label htmlFor="street">Street Address</Label>
                          <motion.div whileFocus={{ scale: 1.01 }}>
                            <SecureInput
                              id="street"
                              value={profileData.address.street}
                              onChange={(e: any) => {
                                setProfileData((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        address: {
                                          ...prev.address,
                                          street: e.target.value,
                                        },
                                      }
                                    : null
                                );
                                handleInputChange("street", e.target.value);
                              }}
                              placeholder="123 Main Street"
                              className={`mt-1 ${validationErrors.street ? "border-red-500" : ""}`}
                              maxLength={100}
                            />
                          </motion.div>
                          <AnimatePresence>
                            {validationErrors.street && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-1 text-xs text-red-600"
                              >
                                {validationErrors.street}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4"
                        >
                          <div>
                            <Label htmlFor="city">City</Label>
                            <motion.div whileFocus={{ scale: 1.01 }}>
                              <SecureInput
                                id="city"
                                value={profileData.address.city}
                                onChange={(e: any) => {
                                  setProfileData((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          address: {
                                            ...prev.address,
                                            city: e.target.value,
                                          },
                                        }
                                      : null
                                  );
                                  handleInputChange("city", e.target.value);
                                }}
                                placeholder="Berlin"
                                className={`mt-1 ${validationErrors.city ? "border-red-500" : ""}`}
                                maxLength={50}
                              />
                            </motion.div>
                            <AnimatePresence>
                              {validationErrors.city && (
                                <motion.p
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="mt-1 text-xs text-red-600"
                                >
                                  {validationErrors.city}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                          <div>
                            <Label htmlFor="state">State/Region</Label>
                            <motion.div whileFocus={{ scale: 1.01 }}>
                              <SecureInput
                                id="state"
                                value={profileData.address.state}
                                onChange={(e: any) => {
                                  setProfileData((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          address: {
                                            ...prev.address,
                                            state: e.target.value,
                                          },
                                        }
                                      : null
                                  );
                                  handleInputChange("state", e.target.value);
                                }}
                                placeholder="Berlin"
                                className={`mt-1 ${validationErrors.state ? "border-red-500" : ""}`}
                                maxLength={50}
                              />
                            </motion.div>
                            <AnimatePresence>
                              {validationErrors.state && (
                                <motion.p
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="mt-1 text-xs text-red-600"
                                >
                                  {validationErrors.state}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 }}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4"
                        >
                          <div>
                            <Label htmlFor="zipCode">ZIP Code</Label>
                            <motion.div whileFocus={{ scale: 1.01 }}>
                              <SecureInput
                                id="zipCode"
                                value={profileData.address.zipCode}
                                onChange={(e: any) => {
                                  setProfileData((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          address: {
                                            ...prev.address,
                                            zipCode: e.target.value,
                                          },
                                        }
                                      : null
                                  );
                                  handleInputChange("zipCode", e.target.value);
                                }}
                                placeholder="10115"
                                className={`mt-1 ${validationErrors.zipCode ? "border-red-500" : ""}`}
                                maxLength={10}
                              />
                            </motion.div>
                            <AnimatePresence>
                              {validationErrors.zipCode && (
                                <motion.p
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="mt-1 text-xs text-red-600"
                                >
                                  {validationErrors.zipCode}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                          <div>
                            <Label htmlFor="country">Country</Label>
                            <Select
                              value={profileData.address.country}
                              onValueChange={(value) =>
                                setProfileData((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        address: {
                                          ...prev.address,
                                          country: value,
                                        },
                                      }
                                    : null
                                )
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Germany">Germany</SelectItem>
                                <SelectItem value="Austria">Austria</SelectItem>
                                <SelectItem value="Switzerland">
                                  Switzerland
                                </SelectItem>
                                <SelectItem value="Netherlands">
                                  Netherlands
                                </SelectItem>
                                <SelectItem value="France">France</SelectItem>
                                <SelectItem value="Belgium">Belgium</SelectItem>
                                <SelectItem value="Denmark">Denmark</SelectItem>
                                <SelectItem value="Sweden">Sweden</SelectItem>
                                <SelectItem value="Norway">Norway</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.4 }}
                          className="flex flex-col sm:flex-row gap-3 lg:gap-4"
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              onClick={handleAddressUpdate}
                              disabled={saving}
                              className="cursor-pointer w-full sm:w-auto"
                              variant="default"
                            >
                              {saving ? (
                                <div className="w-3 lg:w-4 h-3 lg:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1 lg:mr-2" />
                              ) : (
                                <CheckIcon className="w-3 lg:w-4 h-3 lg:h-4 mr-0.5 lg:mr-1" />
                              )}
                              Save Changes
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              onClick={() => cancelEdit("address")}
                              variant="outline"
                              className="cursor-pointer w-full sm:w-auto"
                            >
                              <XMarkIcon className="w-3 lg:w-4 h-3 lg:h-4 mr-0.5 lg:mr-1" />
                              Cancel
                            </Button>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="viewing-address"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {profileData.address.street ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-1 text-sm"
                          >
                            <p className="text-gray-900">
                              {profileData.address.street}
                            </p>
                            <p className="text-gray-900">
                              {profileData.address.city},{" "}
                              {profileData.address.state}{" "}
                              {profileData.address.zipCode}
                            </p>
                            <p className="text-gray-900">
                              {profileData.address.country}
                            </p>
                          </motion.div>
                        ) : (
                          <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="text-gray-500 text-sm"
                          >
                            No address set
                          </motion.p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Password & Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2 lg:pb-6 px-3 lg:px-6 pt-3 lg:pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.7,
                          type: "spring",
                          stiffness: 200,
                        }}
                      >
                        <KeyIcon className="w-3 lg:w-5 h-3 lg:h-5 text-gray-600 mr-1 lg:mr-2" />
                      </motion.div>
                      <CardTitle className="text-sm lg:text-lg">
                        Password & Security
                      </CardTitle>
                    </div>
                    {!isEditingPassword && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={() => setIsEditingPassword(true)}
                          variant="default"
                          size="sm"
                          className="cursor-pointer h-6 lg:h-8 text-xs lg:text-sm px-2 lg:px-4"
                        >
                          <PencilIcon className="w-3 lg:w-4 h-3 lg:h-4 mr-0.5 lg:mr-1" />
                          Change Password
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-3 lg:px-6 pb-3 lg:pb-6">
                  <AnimatePresence mode="wait">
                    {isEditingPassword ? (
                      <motion.div
                        key="editing-password"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                        >
                          <Label htmlFor="currentPassword">
                            Current Password
                          </Label>
                          <div className="relative mt-1">
                            <motion.div whileFocus={{ scale: 1.01 }}>
                              <SecureInput
                                id="currentPassword"
                                type={
                                  showPasswords.current ? "text" : "password"
                                }
                                value={passwordData.currentPassword}
                                onChange={(e: any) => {
                                  setPasswordData((prev) => ({
                                    ...prev,
                                    currentPassword: e.target.value,
                                  }));
                                  handleInputChange(
                                    "currentPassword",
                                    e.target.value
                                  );
                                }}
                                placeholder="Enter current password"
                                className={
                                  validationErrors.currentPassword
                                    ? "border-red-500"
                                    : ""
                                }
                                maxLength={128}
                              />
                            </motion.div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() =>
                                setShowPasswords((prev) => ({
                                  ...prev,
                                  current: !prev.current,
                                }))
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                              {showPasswords.current ? (
                                <EyeSlashIcon className="w-3 lg:w-4 h-3 lg:h-4" />
                              ) : (
                                <EyeIcon className="w-3 lg:w-4 h-3 lg:h-4" />
                              )}
                            </motion.button>
                          </div>
                          <AnimatePresence>
                            {validationErrors.currentPassword && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-1 text-xs text-red-600"
                              >
                                {validationErrors.currentPassword}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          <Label htmlFor="newPassword">New Password</Label>
                          <div className="relative mt-1">
                            <motion.div whileFocus={{ scale: 1.01 }}>
                              <SecureInput
                                id="newPassword"
                                type={showPasswords.new ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={(e: any) => {
                                  setPasswordData((prev) => ({
                                    ...prev,
                                    newPassword: e.target.value,
                                  }));
                                  handleInputChange(
                                    "newPassword",
                                    e.target.value
                                  );
                                }}
                                placeholder="Enter new password"
                                className={
                                  validationErrors.newPassword
                                    ? "border-red-500"
                                    : ""
                                }
                                maxLength={128}
                              />
                            </motion.div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() =>
                                setShowPasswords((prev) => ({
                                  ...prev,
                                  new: !prev.new,
                                }))
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                              {showPasswords.new ? (
                                <EyeSlashIcon className="w-3 lg:w-4 h-3 lg:h-4" />
                              ) : (
                                <EyeIcon className="w-3 lg:w-4 h-3 lg:h-4" />
                              )}
                            </motion.button>
                          </div>
                          <AnimatePresence>
                            {validationErrors.newPassword && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-1 text-xs text-red-600"
                              >
                                {validationErrors.newPassword}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 }}
                        >
                          <Label htmlFor="confirmPassword">
                            Confirm New Password
                          </Label>
                          <div className="relative mt-1">
                            <motion.div whileFocus={{ scale: 1.01 }}>
                              <SecureInput
                                id="confirmPassword"
                                type={
                                  showPasswords.confirm ? "text" : "password"
                                }
                                value={passwordData.confirmPassword}
                                onChange={(e: any) => {
                                  setPasswordData((prev) => ({
                                    ...prev,
                                    confirmPassword: e.target.value,
                                  }));
                                  handleInputChange(
                                    "confirmPassword",
                                    e.target.value
                                  );
                                }}
                                placeholder="Confirm new password"
                                className={
                                  validationErrors.confirmPassword
                                    ? "border-red-500"
                                    : ""
                                }
                                maxLength={128}
                              />
                            </motion.div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() =>
                                setShowPasswords((prev) => ({
                                  ...prev,
                                  confirm: !prev.confirm,
                                }))
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                              {showPasswords.confirm ? (
                                <EyeSlashIcon className="w-3 lg:w-4 h-3 lg:h-4" />
                              ) : (
                                <EyeIcon className="w-3 lg:w-4 h-3 lg:h-4" />
                              )}
                            </motion.button>
                          </div>
                          <AnimatePresence>
                            {validationErrors.confirmPassword && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-1 text-xs text-red-600"
                              >
                                {validationErrors.confirmPassword}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        {/* Password Strength Indicator */}
                        <AnimatePresence>
                          {passwordData.newPassword && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="p-3 bg-gray-50 rounded-lg"
                            >
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Password Requirements:
                              </p>
                              <motion.div className="space-y-1 text-xs">
                                {[
                                  {
                                    check: passwordData.newPassword.length >= 8,
                                    text: "At least 8 characters",
                                  },
                                  {
                                    check: /[A-Z]/.test(
                                      passwordData.newPassword
                                    ),
                                    text: "One uppercase letter",
                                  },
                                  {
                                    check: /[a-z]/.test(
                                      passwordData.newPassword
                                    ),
                                    text: "One lowercase letter",
                                  },
                                  {
                                    check: /\d/.test(passwordData.newPassword),
                                    text: "One number",
                                  },
                                  {
                                    check:
                                      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                                        passwordData.newPassword
                                      ),
                                    text: "One special character",
                                  },
                                ].map((requirement, index) => (
                                  <motion.div
                                    key={requirement.text}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex items-center ${requirement.check ? "text-green-600" : "text-gray-500"}`}
                                  >
                                    {requirement.check ? (
                                      <CheckIcon className="w-3 h-3 mr-1" />
                                    ) : (
                                      <XMarkIcon className="w-3 h-3 mr-1" />
                                    )}
                                    {requirement.text}
                                  </motion.div>
                                ))}
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.4 }}
                          className="flex space-x-3"
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              onClick={handlePasswordUpdate}
                              disabled={
                                saving ||
                                !validatePasswordStrength(
                                  passwordData.newPassword
                                )
                              }
                              className="cursor-pointer"
                              variant="default"
                            >
                              {saving ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              ) : (
                                <CheckIcon className="w-4 h-4 mr-1" />
                              )}
                              Update Password
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              onClick={() => cancelEdit("password")}
                              variant="outline"
                              className="cursor-pointer w-full sm:w-auto"
                            >
                              <XMarkIcon className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </motion.div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.5 }}
                          className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                          <p className="text-sm text-blue-700">
                            <strong>Forgot your current password?</strong>{" "}
                            <Link
                              href="/forgot-password"
                              className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
                            >
                              Reset it here
                            </Link>
                          </p>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="viewing-password"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          <Label className="text-gray-600">Password</Label>
                          <p className="text-gray-500 mt-1">••••••••••••</p>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                          className="text-sm text-gray-600"
                        >
                          <p>Last updated: Never</p>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          <Link
                            href="/forgot-password"
                            className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer"
                          >
                            Forgot your password? Reset it here
                          </Link>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Account Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2 lg:pb-6 px-3 lg:px-6 pt-3 lg:pt-6">
                  <CardTitle className="text-sm lg:text-lg">
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 lg:px-6 pb-3 lg:pb-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                    className="p-3 lg:p-4 border border-red-200 rounded-lg bg-red-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900 text-xs lg:text-sm">
                          Delete Account
                        </p>
                        <p className="text-xs lg:text-sm text-red-700">
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="destructive"
                          size="sm"
                          className="text-red-700 border-red-300 hover:bg-red-100 cursor-pointer h-6 lg:h-8 text-xs lg:text-sm px-2 lg:px-4"
                        >
                          <ExclamationTriangleIcon className="w-3 lg:w-4 h-3 lg:h-4 mr-0.5 lg:mr-1" />
                          Delete
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
}
