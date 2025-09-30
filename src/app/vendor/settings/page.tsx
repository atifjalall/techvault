"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  ShieldCheckIcon,
  MapPinIcon,
  BellIcon,
  BuildingStorefrontIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

// UI Components
import { Button } from "@/components/ui/buttonSidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserSettings {
  profile: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
    bio?: string;
  };
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  businessInfo: {
    businessName: string;
    businessType: string;
    taxId?: string;
    website?: string;
  };
  security: {
    emailVerified: boolean;
    phoneVerified: boolean;
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
  };
  notifications: {
    orderAlerts: boolean;
    marketingEmails: boolean;
    productUpdates: boolean;
    payoutNotifications: boolean;
  };
}

// Compact Settings Section Component
function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-50 rounded-lg">
            <Icon className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">
              {title}
            </CardTitle>
            <p className="text-xs text-slate-600">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

// Loading Skeletons
function SettingsSkeletons() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-8 w-full" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function VendorSettingsPage() {
  const { data: session, update } = useSession();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
  });

  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [businessForm, setBusinessForm] = useState({
    businessName: "",
    businessType: "",
    taxId: "",
    website: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [deleteForm, setDeleteForm] = useState({
    confirmText: "",
    password: "",
  });

  // Load settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/vendor/settings");

        if (!response.ok) {
          throw new Error("Failed to fetch settings");
        }

        const result = await response.json();

        if (result.success) {
          setSettings(result.settings);
          // Update form states
          setProfileForm({
            name: result.settings.profile.name || "",
            email: result.settings.profile.email || "",
            phone: result.settings.profile.phone || "",
            bio: result.settings.profile.bio || "",
          });
          setAddressForm(
            result.settings.address || {
              street: "",
              city: "",
              postalCode: "",
              country: "Germany",
            }
          );
          setBusinessForm(
            result.settings.businessInfo || {
              businessName: "",
              businessType: "Electronics Retail",
              taxId: "",
              website: "",
            }
          );
        } else {
          throw new Error(result.error || "Failed to load settings");
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load settings"
        );
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      loadSettings();
    }
  }, [session]);

  // Show temporary messages
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Update profile
  const updateProfile = async () => {
    setSaving("profile");
    setError(null);

    try {
      const response = await fetch("/api/vendor/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "profile",
          data: profileForm,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                profile: { ...prev.profile, ...profileForm },
              }
            : null
        );
        setSuccess("Profile updated successfully");

        // Update session if name changed
        if (profileForm.name !== settings?.profile.name) {
          await update({ name: profileForm.name });
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update profile");
      }
    } catch (error) {
      setError("Failed to update profile");
    } finally {
      setSaving(null);
    }
  };

  // Update address
  const updateAddress = async () => {
    setSaving("address");
    setError(null);

    try {
      const response = await fetch("/api/vendor/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "address",
          data: addressForm,
        }),
      });

      if (response.ok) {
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                address: { ...addressForm },
              }
            : null
        );
        setSuccess("Address updated successfully");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update address");
      }
    } catch (error) {
      setError("Failed to update address");
    } finally {
      setSaving(null);
    }
  };

  // Update business info
  const updateBusinessInfo = async () => {
    setSaving("business");
    setError(null);

    try {
      const response = await fetch("/api/vendor/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "business",
          data: businessForm,
        }),
      });

      if (response.ok) {
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                businessInfo: { ...businessForm },
              }
            : null
        );
        setSuccess("Business information updated successfully");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update business information");
      }
    } catch (error) {
      setError("Failed to update business information");
    } finally {
      setSaving(null);
    }
  };

  // Change password
  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setSaving("password");
    setError(null);

    try {
      const response = await fetch("/api/vendor/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "password",
          data: {
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          },
        }),
      });

      if (response.ok) {
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setSuccess("Password changed successfully");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to change password");
      }
    } catch (error) {
      setError("Failed to change password");
    } finally {
      setSaving(null);
    }
  };

  // Toggle notification
  const toggleNotification = async (
    key: keyof UserSettings["notifications"]
  ) => {
    if (!settings) return;

    const newValue = !settings.notifications[key];

    try {
      const response = await fetch("/api/vendor/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "notifications",
          data: { [key]: newValue },
        }),
      });

      if (response.ok) {
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                notifications: {
                  ...prev.notifications,
                  [key]: newValue,
                },
              }
            : null
        );
      }
    } catch (error) {
      console.error("Failed to update notification:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
        <div className="p-6 space-y-6">
          {/* Header Skeleton */}
          <div>
            <Skeleton className="h-6 w-24 mb-1" />
            <Skeleton className="h-4 w-48" />
          </div>
          <SettingsSkeletons />
        </div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-6">
        <div className="text-center py-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ExclamationTriangleIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Unable to load settings
            </h3>
            <p className="text-xs text-slate-500 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
            >
              Try Again
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-2 lg:p-6 space-y-3 lg:space-y-6">
        {/* Mobile Header */}
        <div className="flex items-center justify-between lg:hidden">
          <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 w-full">
            <h1 className="text-[14px] font-bold text-gray-900">Settings</h1>
            <p className="text-[10px] text-gray-600 mt-0.5">
              Manage account & business preferences
            </p>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-600">
              Manage your account and business preferences
            </p>
          </div>
        </div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {(success || error) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert
                className={
                  success
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-rose-200 bg-rose-50"
                }
              >
                <div className="flex items-center">
                  {success ? (
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600 mr-2" />
                  ) : (
                    <ExclamationTriangleIcon className="w-4 h-4 text-rose-600 mr-2" />
                  )}
                  <AlertDescription
                    className={`text-xs ${success ? "text-emerald-800" : "text-rose-800"}`}
                  >
                    {success || error}
                  </AlertDescription>
                </div>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2 lg:space-y-4">
          {/* Profile Settings */}
          <SettingsSection
            title="Profile Information"
            description="Update your personal details"
            icon={UserIcon}
          >
            <div className="space-y-2 lg:space-y-4">
              {/* Profile Image - Mobile */}
              <div className="flex items-center space-x-2 lg:hidden">
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100">
                    {settings.profile.image ? (
                      <Image
                        src={settings.profile.image}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserIcon className="w-3 h-3 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-slate-900 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors">
                    <CameraIcon className="w-1.5 h-1.5" />
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
                <div>
                  <h4 className="text-[10px] font-medium text-slate-900">
                    Profile Photo
                  </h4>
                  <p className="text-[8px] text-slate-500">JPG, PNG. Max 2MB</p>
                </div>
              </div>

              {/* Profile Image - Desktop */}
              <div className="hidden lg:flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100">
                    {settings.profile.image ? (
                      <Image
                        src={settings.profile.image}
                        alt="Profile"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors">
                    <CameraIcon className="w-2.5 h-2.5" />
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-slate-900">
                    Profile Photo
                  </h4>
                  <p className="text-xs text-slate-500">JPG, PNG. Max 2MB</p>
                </div>
              </div>

              {/* Profile Form - Mobile */}
              <div className="grid grid-cols-1 gap-2 lg:hidden">
                <div className="space-y-0.5">
                  <Label htmlFor="store-name" className="text-[10px]">
                    Store Name
                  </Label>
                  <Input
                    id="store-name"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Your store name"
                    className="h-6 text-[10px]"
                  />
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="email" className="text-[10px]">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="your@email.com"
                      className="h-6 text-[10px]"
                    />
                    {settings.security.emailVerified && (
                      <CheckCircleIcon className="absolute right-1 top-1.5 w-3 h-3 text-emerald-500" />
                    )}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="phone" className="text-[10px]">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="+49 123 456789"
                      className="h-6 text-[10px]"
                    />
                    {settings.security.phoneVerified && (
                      <CheckCircleIcon className="absolute right-1 top-1.5 w-3 h-3 text-emerald-500" />
                    )}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="bio" className="text-[10px]">
                    Store Description
                  </Label>
                  <Textarea
                    id="bio"
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                    placeholder="Tell customers about your store..."
                    rows={2}
                    className="text-[10px] resize-none h-12"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    onClick={updateProfile}
                    disabled={saving === "profile"}
                    className="bg-slate-900 hover:bg-slate-800 text-white h-6 px-3 text-[10px] cursor-pointer"
                  >
                    {saving === "profile" ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </div>

              {/* Profile Form - Desktop */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="store-name-desktop" className="text-xs">
                      Store Name
                    </Label>
                    <Input
                      id="store-name-desktop"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Your store name"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="email-desktop" className="text-xs">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Input
                        id="email-desktop"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="your@email.com"
                        className="h-8 text-sm"
                      />
                      {settings.security.emailVerified && (
                        <CheckCircleIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-emerald-500" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="phone-desktop" className="text-xs">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Input
                        id="phone-desktop"
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="+49 123 456789"
                        className="h-8 text-sm"
                      />
                      {settings.security.phoneVerified && (
                        <CheckCircleIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-emerald-500" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 mt-3">
                  <Label htmlFor="bio-desktop" className="text-xs">
                    Store Description
                  </Label>
                  <Textarea
                    id="bio-desktop"
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                    placeholder="Tell customers about your store..."
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>

                <div className="flex justify-end mt-3">
                  <Button
                    onClick={updateProfile}
                    disabled={saving === "profile"}
                    className="bg-slate-900 hover:bg-slate-800 text-white h-8 px-4 text-xs cursor-pointer"
                  >
                    {saving === "profile" ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Business Address */}
          <SettingsSection
            title="Business Address"
            description="Your business location"
            icon={MapPinIcon}
          >
            {/* Mobile Address Form */}
            <div className="space-y-2 lg:hidden">
              <div className="space-y-0.5">
                <Label htmlFor="street" className="text-[10px]">
                  Street Address
                </Label>
                <Input
                  id="street"
                  value={addressForm.street}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      street: e.target.value,
                    }))
                  }
                  placeholder="123 Main Street"
                  className="h-6 text-[10px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <Label htmlFor="city" className="text-[10px]">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    placeholder="Hamburg"
                    className="h-6 text-[10px]"
                  />
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="postal-code" className="text-[10px]">
                    Postal Code
                  </Label>
                  <Input
                    id="postal-code"
                    value={addressForm.postalCode}
                    onChange={(e) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        postalCode: e.target.value,
                      }))
                    }
                    placeholder="20095"
                    className="h-6 text-[10px]"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="country" className="text-[10px]">
                  Country
                </Label>
                <Select
                  value={addressForm.country}
                  onValueChange={(value) =>
                    setAddressForm((prev) => ({ ...prev, country: value }))
                  }
                >
                  <SelectTrigger className="h-6 text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="Austria">Austria</SelectItem>
                    <SelectItem value="Switzerland">Switzerland</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  onClick={updateAddress}
                  disabled={saving === "address"}
                  className="bg-slate-900 hover:bg-slate-800 text-white h-6 px-3 text-[10px] cursor-pointer"
                >
                  {saving === "address" ? "Saving..." : "Save Address"}
                </Button>
              </div>
            </div>

            {/* Desktop Address Form */}
            <div className="hidden lg:block space-y-3">
              <div className="space-y-1">
                <Label htmlFor="street-desktop" className="text-xs">
                  Street Address
                </Label>
                <Input
                  id="street-desktop"
                  value={addressForm.street}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      street: e.target.value,
                    }))
                  }
                  placeholder="123 Main Street"
                  className="h-8 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="city-desktop" className="text-xs">
                    City
                  </Label>
                  <Input
                    id="city-desktop"
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    placeholder="Hamburg"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="postal-code-desktop" className="text-xs">
                    Postal Code
                  </Label>
                  <Input
                    id="postal-code-desktop"
                    value={addressForm.postalCode}
                    onChange={(e) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        postalCode: e.target.value,
                      }))
                    }
                    placeholder="20095"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="country-desktop" className="text-xs">
                    Country
                  </Label>
                  <Select
                    value={addressForm.country}
                    onValueChange={(value) =>
                      setAddressForm((prev) => ({ ...prev, country: value }))
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="Austria">Austria</SelectItem>
                      <SelectItem value="Switzerland">Switzerland</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={updateAddress}
                  disabled={saving === "address"}
                  className="bg-slate-900 hover:bg-slate-800 text-white h-8 px-4 text-xs cursor-pointer"
                >
                  {saving === "address" ? "Saving..." : "Save Address"}
                </Button>
              </div>
            </div>
          </SettingsSection>

          {/* Business Information */}
          <SettingsSection
            title="Business Information"
            description="Legal business details"
            icon={BuildingStorefrontIcon}
          >
            {/* Mobile Business Form */}
            <div className="space-y-2 lg:hidden">
              <div className="space-y-0.5">
                <Label htmlFor="business-name" className="text-[10px]">
                  Legal Business Name
                </Label>
                <Input
                  id="business-name"
                  value={businessForm.businessName}
                  onChange={(e) =>
                    setBusinessForm((prev) => ({
                      ...prev,
                      businessName: e.target.value,
                    }))
                  }
                  placeholder="Your Business GmbH"
                  className="h-6 text-[10px]"
                />
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="business-type" className="text-[10px]">
                  Business Type
                </Label>
                <Select
                  value={businessForm.businessType}
                  onValueChange={(value) =>
                    setBusinessForm((prev) => ({
                      ...prev,
                      businessType: value,
                    }))
                  }
                >
                  <SelectTrigger className="h-6 text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics Retail">
                      Electronics Retail
                    </SelectItem>
                    <SelectItem value="Online Store">Online Store</SelectItem>
                    <SelectItem value="Wholesale">Wholesale</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="tax-id" className="text-[10px]">
                  Tax ID / VAT Number
                </Label>
                <Input
                  id="tax-id"
                  value={businessForm.taxId}
                  onChange={(e) =>
                    setBusinessForm((prev) => ({
                      ...prev,
                      taxId: e.target.value,
                    }))
                  }
                  placeholder="DE123456789"
                  className="h-6 text-[10px]"
                />
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="website" className="text-[10px]">
                  Website URL
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={businessForm.website}
                  onChange={(e) =>
                    setBusinessForm((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  placeholder="https://yourstore.com"
                  className="h-6 text-[10px]"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  onClick={updateBusinessInfo}
                  disabled={saving === "business"}
                  className="bg-slate-900 hover:bg-slate-800 text-white h-6 px-3 text-[10px] cursor-pointer"
                >
                  {saving === "business" ? "Saving..." : "Save Business Info"}
                </Button>
              </div>
            </div>

            {/* Desktop Business Form */}
            <div className="hidden lg:block space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="business-name" className="text-xs">
                    Legal Business Name
                  </Label>
                  <Input
                    id="business-name"
                    value={businessForm.businessName}
                    onChange={(e) =>
                      setBusinessForm((prev) => ({
                        ...prev,
                        businessName: e.target.value,
                      }))
                    }
                    placeholder="Your Business GmbH"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="business-type" className="text-xs">
                    Business Type
                  </Label>
                  <Select
                    value={businessForm.businessType}
                    onValueChange={(value) =>
                      setBusinessForm((prev) => ({
                        ...prev,
                        businessType: value,
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Electronics Retail">
                        Electronics Retail
                      </SelectItem>
                      <SelectItem value="Online Store">Online Store</SelectItem>
                      <SelectItem value="Wholesale">Wholesale</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="tax-id" className="text-xs">
                    Tax ID / VAT Number
                  </Label>
                  <Input
                    id="tax-id"
                    value={businessForm.taxId}
                    onChange={(e) =>
                      setBusinessForm((prev) => ({
                        ...prev,
                        taxId: e.target.value,
                      }))
                    }
                    placeholder="DE123456789"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="website" className="text-xs">
                    Website URL
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={businessForm.website}
                    onChange={(e) =>
                      setBusinessForm((prev) => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                    placeholder="https://yourstore.com"
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={updateBusinessInfo}
                  disabled={saving === "business"}
                  className="bg-slate-900 hover:bg-slate-800 text-white h-8 px-4 text-xs cursor-pointer"
                >
                  {saving === "business" ? "Saving..." : "Save Business Info"}
                </Button>
              </div>
            </div>
          </SettingsSection>

          {/* Security Settings */}
          <SettingsSection
            title="Security & Privacy"
            description="Manage account security"
            icon={ShieldCheckIcon}
          >
            {/* Mobile Security Form */}
            <div className="space-y-2 lg:hidden">
              {/* Change Password */}
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <h4 className="text-[10px] font-medium text-slate-900 mb-2">
                  Change Password
                </h4>
                <div className="space-y-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="current-password" className="text-[8px]">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        placeholder="Current password"
                        className="h-6 text-[10px] pr-6"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-1 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-2.5 h-2.5 text-slate-400" />
                        ) : (
                          <EyeIcon className="w-2.5 h-2.5 text-slate-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-password" className="text-[8px]">
                        New Password
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        placeholder="New password"
                        className="h-6 text-[10px]"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <Label htmlFor="confirm-password" className="text-[8px]">
                        Confirm Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        placeholder="Confirm password"
                        className="h-6 text-[10px]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <p className="text-[8px] text-slate-500">
                      Last:{" "}
                      {new Date(
                        settings.security.lastPasswordChange
                      ).toLocaleDateString()}
                    </p>
                    <Button
                      onClick={changePassword}
                      disabled={saving === "password"}
                      className="bg-slate-900 hover:bg-slate-800 text-white h-5 px-2 text-[8px] cursor-pointer"
                    >
                      {saving === "password" ? "Changing..." : "Change"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="text-[10px] font-medium text-slate-900">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-[8px] text-slate-600">
                    Add extra security to your account
                  </p>
                </div>
                <Switch
                  checked={settings.security.twoFactorEnabled}
                  onCheckedChange={() => {
                    // Handle 2FA toggle
                  }}
                />
              </div>
            </div>

            {/* Desktop Security Form */}
            <div className="hidden lg:block space-y-4">
              {/* Change Password */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label
                      htmlFor="current-password-desktop"
                      className="text-xs"
                    >
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="current-password-desktop"
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        placeholder="Current password"
                        className="h-8 text-sm pr-8"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-3 h-3 text-slate-400" />
                        ) : (
                          <EyeIcon className="w-3 h-3 text-slate-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="new-password-desktop" className="text-xs">
                      New Password
                    </Label>
                    <Input
                      id="new-password-desktop"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      placeholder="New password"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="confirm-password-desktop"
                      className="text-xs"
                    >
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-password-desktop"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="Confirm password"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <p className="text-xs text-slate-500">
                    Last changed:{" "}
                    {new Date(
                      settings.security.lastPasswordChange
                    ).toLocaleDateString()}
                  </p>
                  <Button
                    onClick={changePassword}
                    disabled={saving === "password"}
                    className="bg-slate-900 hover:bg-slate-800 text-white h-8 px-4 text-xs cursor-pointer"
                  >
                    {saving === "password" ? "Changing..." : "Change Password"}
                  </Button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="text-xs font-medium text-slate-900">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-xs text-slate-600">
                    Add extra security to your account
                  </p>
                </div>
                <Switch
                  checked={settings.security.twoFactorEnabled}
                  onCheckedChange={() => {
                    // Handle 2FA toggle
                  }}
                />
              </div>
            </div>
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection
            title="Notification Preferences"
            description="Choose what notifications you want to receive"
            icon={BellIcon}
          >
            {/* Mobile Notifications */}
            <div className="space-y-1 lg:hidden">
              {[
                {
                  key: "orderAlerts",
                  label: "Order Alerts",
                  description: "New orders and updates",
                },
                {
                  key: "productUpdates",
                  label: "Product Updates",
                  description: "Feature announcements",
                },
                {
                  key: "payoutNotifications",
                  label: "Payout Notifications",
                  description: "Payment confirmations",
                },
                {
                  key: "marketingEmails",
                  label: "Marketing Emails",
                  description: "Promotional emails",
                },
              ].map(({ key, label, description }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                >
                  <div>
                    <h4 className="text-[10px] font-medium text-slate-900">
                      {label}
                    </h4>
                    <p className="text-[8px] text-slate-600">{description}</p>
                  </div>
                  <Switch
                    checked={
                      settings.notifications[
                        key as keyof UserSettings["notifications"]
                      ]
                    }
                    onCheckedChange={() =>
                      toggleNotification(
                        key as keyof UserSettings["notifications"]
                      )
                    }
                  />
                </div>
              ))}
            </div>

            {/* Desktop Notifications */}
            <div className="hidden lg:block space-y-3">
              {[
                {
                  key: "orderAlerts",
                  label: "Order Alerts",
                  description: "Notifications about new orders and updates",
                },
                {
                  key: "productUpdates",
                  label: "Product Updates",
                  description: "Feature announcements and product news",
                },
                {
                  key: "payoutNotifications",
                  label: "Payout Notifications",
                  description: "Payment and payout confirmations",
                },
                {
                  key: "marketingEmails",
                  label: "Marketing Emails",
                  description: "Promotional emails and offers",
                },
              ].map(({ key, label, description }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <h4 className="text-xs font-medium text-slate-900">
                      {label}
                    </h4>
                    <p className="text-xs text-slate-600">{description}</p>
                  </div>
                  <Switch
                    checked={
                      settings.notifications[
                        key as keyof UserSettings["notifications"]
                      ]
                    }
                    onCheckedChange={() =>
                      toggleNotification(
                        key as keyof UserSettings["notifications"]
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </SettingsSection>

          {/* Danger Zone */}
          <SettingsSection
            title="Danger Zone"
            description="Irreversible account actions"
            icon={ExclamationTriangleIcon}
          >
            {/* Mobile Danger Zone */}
            <div className="p-2 border border-rose-200 rounded-lg bg-rose-50 lg:hidden">
              <div className="space-y-2">
                <div>
                  <h4 className="text-[10px] font-medium text-rose-900 mb-0.5">
                    Delete Account
                  </h4>
                  <p className="text-[8px] text-rose-600 mb-1">
                    Permanently delete your vendor account and all data. This
                    cannot be undone.
                  </p>
                  <div className="space-y-0.5 text-[8px] text-rose-600">
                    <p>• All products removed from marketplace</p>
                    <p>• Order history and customer data deleted</p>
                    <p>• Pending payouts processed before deletion</p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full h-6 px-2 text-[10px] cursor-pointer"
                >
                  Delete Account
                </Button>
              </div>
            </div>

            {/* Desktop Danger Zone */}
            <div className="hidden lg:block p-3 border border-rose-200 rounded-lg bg-rose-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-xs font-medium text-rose-900 mb-1">
                    Delete Account
                  </h4>
                  <p className="text-xs text-rose-600 mb-2">
                    Permanently delete your vendor account and all data. This
                    cannot be undone.
                  </p>
                  <div className="space-y-0.5 text-xs text-rose-600">
                    <p>• All products removed from marketplace</p>
                    <p>• Order history and customer data deleted</p>
                    <p>• Pending payouts processed before deletion</p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteModal(true)}
                  className="flex-shrink-0 ml-3 h-8 px-3 text-xs cursor-pointer"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </SettingsSection>
        </div>

        {/* Delete Account Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="sm:max-w-md max-w-[90%] mx-auto">
            <DialogHeader>
              <DialogTitle className="text-sm lg:text-sm text-rose-900">
                Delete Account
              </DialogTitle>
              <DialogDescription className="text-xs lg:text-xs">
                This action cannot be undone. All your data will be permanently
                deleted.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 lg:space-y-3">
              <div className="flex items-center p-2 lg:p-3 bg-rose-50 rounded-lg border border-rose-200">
                <ExclamationTriangleIcon className="w-4 h-4 lg:w-5 lg:h-5 text-rose-600 mr-1.5 lg:mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-rose-900 text-[10px] lg:text-xs">
                    This action cannot be undone
                  </p>
                  <p className="text-[8px] lg:text-xs text-rose-600">
                    All data will be permanently deleted
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="delete-confirm" className="text-xs">
                    Type <strong>DELETE</strong> to confirm
                  </Label>
                  <Input
                    id="delete-confirm"
                    value={deleteForm.confirmText}
                    onChange={(e) =>
                      setDeleteForm((prev) => ({
                        ...prev,
                        confirmText: e.target.value,
                      }))
                    }
                    placeholder="DELETE"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="delete-password" className="text-xs">
                    Enter your password
                  </Label>
                  <Input
                    id="delete-password"
                    type="password"
                    value={deleteForm.password}
                    onChange={(e) =>
                      setDeleteForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Your password"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="h-8 px-3 text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (deleteForm.confirmText !== "DELETE") {
                    setError("Please type 'DELETE' to confirm");
                    return;
                  }
                  // Handle account deletion
                  setSaving("delete");
                  try {
                    const response = await fetch("/api/vendor/settings", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ password: deleteForm.password }),
                    });
                    if (response.ok) {
                      window.location.href = "/account-deleted";
                    } else {
                      const errorData = await response.json();
                      setError(errorData.error || "Failed to delete account");
                    }
                  } catch (error) {
                    setError("Failed to delete account");
                  } finally {
                    setSaving(null);
                  }
                }}
                disabled={
                  saving === "delete" ||
                  deleteForm.confirmText !== "DELETE" ||
                  !deleteForm.password
                }
                className="h-8 px-3 text-xs cursor-pointer"
              >
                {saving === "delete" ? "Deleting..." : "Delete Account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
