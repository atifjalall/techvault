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
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getUserInitials } from "@/lib/utils";

// Country codes for phone numbers with online flag service
const countryCodes = [
  { code: "+49", country: "Germany", iso: "DE" },
  { code: "+1", country: "United States", iso: "US" },
  { code: "+44", country: "United Kingdom", iso: "GB" },
  { code: "+33", country: "France", iso: "FR" },
  { code: "+39", country: "Italy", iso: "IT" },
  { code: "+31", country: "Netherlands", iso: "NL" },
  { code: "+41", country: "Switzerland", iso: "CH" },
  { code: "+43", country: "Austria", iso: "AT" },
  { code: "+32", country: "Belgium", iso: "BE" },
  { code: "+45", country: "Denmark", iso: "DK" },
  { code: "+358", country: "Finland", iso: "FI" },
  { code: "+47", country: "Norway", iso: "NO" },
  { code: "+46", country: "Sweden", iso: "SE" },
  { code: "+34", country: "Spain", iso: "ES" },
  { code: "+351", country: "Portugal", iso: "PT" },
];

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+49",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Germany",
    },
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Initialize profile data from session
  useEffect(() => {
    if (session?.user) {
      const nameParts = session.user.name?.split(" ") || ["", ""];
      setProfileData((prev) => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: session.user.email || "",
      }));
    }
  }, [session]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showErrorMessage = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const validatePasswordStrength = (password: string): boolean => {
    if (password.length < 8) return false;

    let score = 0;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

    return score >= 3;
  };

  const handleNameUpdate = async () => {
    if (!profileData.firstName.trim()) {
      showErrorMessage("First name is required");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/profile/update-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update name");
      }

      setIsEditingName(false);
      showSuccessMessage("Name updated successfully!");
    } catch (error) {
      showErrorMessage("Failed to update name");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressUpdate = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/profile/update-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: profileData.address }),
      });

      if (!response.ok) {
        throw new Error("Failed to update address");
      }

      setIsEditingAddress(false);
      showSuccessMessage("Address updated successfully!");
    } catch (error) {
      showErrorMessage("Failed to update address");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneUpdate = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/profile/update-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: profileData.phone,
          countryCode: profileData.countryCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update phone number");
      }

      setIsEditingPhone(false);
      showSuccessMessage("Phone number updated successfully!");
    } catch (error) {
      showErrorMessage("Failed to update phone number");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwordData.currentPassword) {
      showErrorMessage("Current password is required");
      return;
    }

    if (!validatePasswordStrength(passwordData.newPassword)) {
      showErrorMessage(
        "New password must be at least 8 characters with uppercase, lowercase, number, and special character"
      );
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showErrorMessage("New passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/profile/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update password");
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsEditingPassword(false);
      showSuccessMessage("Password updated successfully!");
    } catch (error) {
      showErrorMessage(
        error instanceof Error ? error.message : "Failed to update password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = (section: string) => {
    switch (section) {
      case "name":
        setIsEditingName(false);
        // Reset to original values from session
        if (session?.user) {
          const nameParts = session.user.name?.split(" ") || ["", ""];
          setProfileData((prev) => ({
            ...prev,
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
          }));
        }
        break;
      case "address":
        setIsEditingAddress(false);
        break;
      case "phone":
        setIsEditingPhone(false);
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
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-400 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4"
            >
              <div className="flex items-center">
                <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                <p className="text-sm text-green-700 font-medium">
                  {successMessage}
                </p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
            >
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-3" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                {/* Profile Picture */}
                <div className="relative w-24 h-24 mx-auto mb-4">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="w-full h-full rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-bold border-4 border-gray-200">
                      {getUserInitials(session.user.name || "User")}
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {session.user.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {session.user.email}
                </p>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Member since 2024
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Personal Information
                </h3>
                {!isEditingName && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isEditingName ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email address cannot be changed
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleNameUpdate}
                      disabled={isLoading}
                      className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <CheckIcon className="w-4 h-4 mr-2" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={() => cancelEdit("name")}
                      className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <p className="text-gray-900">
                        {profileData.firstName || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <p className="text-gray-900">
                        {profileData.lastName || "Not set"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <p className="text-gray-900">{profileData.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <PhoneIcon className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Phone Number
                  </h3>
                </div>
                {!isEditingPhone && (
                  <button
                    onClick={() => setIsEditingPhone(true)}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isEditingPhone ? (
                <div className="space-y-4">
                  <div className="flex space-x-3">
                    <div className="w-40">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>

                      <select
                        value={profileData.countryCode}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            countryCode: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        {countryCodes.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.code} {country.country}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="123 456 7890"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handlePhoneUpdate}
                      disabled={isLoading}
                      className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <CheckIcon className="w-4 h-4 mr-2" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={() => cancelEdit("phone")}
                      className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  {profileData.phone && profileData.countryCode ? (
                    <div className="flex items-center">
                      <Image
                        src={`https://flagcdn.com/16x12/${
                          countryCodes
                            .find((c) => c.code === profileData.countryCode)
                            ?.iso.toLowerCase() || "de"
                        }.png`}
                        alt="Country flag"
                        width={16}
                        height={12}
                        className="mr-2"
                      />
                      <p className="text-gray-900">
                        {profileData.countryCode} {profileData.phone}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No phone number set</p>
                  )}
                </div>
              )}
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <MapPinIcon className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Shipping Address
                  </h3>
                </div>
                {!isEditingAddress && (
                  <button
                    onClick={() => setIsEditingAddress(true)}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isEditingAddress ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={profileData.address.street}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          address: { ...prev.address, street: e.target.value },
                        }))
                      }
                      placeholder="123 Main Street"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={profileData.address.city}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            address: { ...prev.address, city: e.target.value },
                          }))
                        }
                        placeholder="Berlin"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State/Region
                      </label>
                      <input
                        type="text"
                        value={profileData.address.state}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            address: { ...prev.address, state: e.target.value },
                          }))
                        }
                        placeholder="Berlin"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={profileData.address.zipCode}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              zipCode: e.target.value,
                            },
                          }))
                        }
                        placeholder="10115"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <select
                        value={profileData.address.country}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              country: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="Germany">Germany</option>
                        <option value="Austria">Austria</option>
                        <option value="Switzerland">Switzerland</option>
                        <option value="Netherlands">Netherlands</option>
                        <option value="France">France</option>
                        <option value="Belgium">Belgium</option>
                        <option value="Denmark">Denmark</option>
                        <option value="Sweden">Sweden</option>
                        <option value="Norway">Norway</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleAddressUpdate}
                      disabled={isLoading}
                      className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <CheckIcon className="w-4 h-4 mr-2" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={() => cancelEdit("address")}
                      className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {profileData.address.street ? (
                    <>
                      <p className="text-gray-900">
                        {profileData.address.street}
                      </p>
                      <p className="text-gray-900">
                        {profileData.address.city}, {profileData.address.state}{" "}
                        {profileData.address.zipCode}
                      </p>
                      <p className="text-gray-900">
                        {profileData.address.country}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500">No address set</p>
                  )}
                </div>
              )}
            </div>

            {/* Password Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <KeyIcon className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Password & Security
                  </h3>
                </div>
                {!isEditingPassword && (
                  <button
                    onClick={() => setIsEditingPassword(true)}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isEditingPassword ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? (
                          <EyeSlashIcon className="w-4 h-4" />
                        ) : (
                          <EyeIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? (
                          <EyeSlashIcon className="w-4 h-4" />
                        ) : (
                          <EyeIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="w-4 h-4" />
                        ) : (
                          <EyeIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {passwordData.newPassword && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Password Requirements:
                      </p>
                      <div className="space-y-1 text-sm">
                        <div
                          className={`flex items-center ${passwordData.newPassword.length >= 8 ? "text-green-600" : "text-gray-500"}`}
                        >
                          {passwordData.newPassword.length >= 8 ? (
                            <CheckIcon className="w-4 h-4 mr-2" />
                          ) : (
                            <XMarkIcon className="w-4 h-4 mr-2" />
                          )}
                          At least 8 characters
                        </div>
                        <div
                          className={`flex items-center ${/[A-Z]/.test(passwordData.newPassword) ? "text-green-600" : "text-gray-500"}`}
                        >
                          {/[A-Z]/.test(passwordData.newPassword) ? (
                            <CheckIcon className="w-4 h-4 mr-2" />
                          ) : (
                            <XMarkIcon className="w-4 h-4 mr-2" />
                          )}
                          One uppercase letter
                        </div>
                        <div
                          className={`flex items-center ${/[a-z]/.test(passwordData.newPassword) ? "text-green-600" : "text-gray-500"}`}
                        >
                          {/[a-z]/.test(passwordData.newPassword) ? (
                            <CheckIcon className="w-4 h-4 mr-2" />
                          ) : (
                            <XMarkIcon className="w-4 h-4 mr-2" />
                          )}
                          One lowercase letter
                        </div>
                        <div
                          className={`flex items-center ${/\d/.test(passwordData.newPassword) ? "text-green-600" : "text-gray-500"}`}
                        >
                          {/\d/.test(passwordData.newPassword) ? (
                            <CheckIcon className="w-4 h-4 mr-2" />
                          ) : (
                            <XMarkIcon className="w-4 h-4 mr-2" />
                          )}
                          One number
                        </div>
                        <div
                          className={`flex items-center ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordData.newPassword) ? "text-green-600" : "text-gray-500"}`}
                        >
                          {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                            passwordData.newPassword
                          ) ? (
                            <CheckIcon className="w-4 h-4 mr-2" />
                          ) : (
                            <XMarkIcon className="w-4 h-4 mr-2" />
                          )}
                          One special character
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={handlePasswordUpdate}
                      disabled={
                        isLoading ||
                        !validatePasswordStrength(passwordData.newPassword)
                      }
                      className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <CheckIcon className="w-4 h-4 mr-2" />
                      )}
                      Update Password
                    </button>
                    <button
                      onClick={() => cancelEdit("password")}
                      className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Forgot your current password?</strong>{" "}
                      <Link
                        href="/forgot-password"
                        className="text-blue-600 hover:text-blue-800 underline font-medium"
                      >
                        Reset it here
                      </Link>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <p className="text-gray-500">••••••••••••</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Last updated: Never</p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Forgot your password? Reset it here
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/orders"
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Order History</p>
                      <p className="text-sm text-gray-500">
                        View your past orders
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>

                <Link
                  href="/wishlist"
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Wishlist</p>
                      <p className="text-sm text-gray-500">
                        Saved items for later
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Account Settings
                      </p>
                      <p className="text-sm text-gray-500">
                        Privacy & preferences
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>

                {/* Delete Account Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Danger Zone
                  </h4>
                  <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900">
                          Delete Account
                        </p>
                        <p className="text-sm text-red-700">
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <button className="px-3 py-1 text-sm font-medium text-red-700 border border-red-300 rounded-md hover:bg-red-100 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
