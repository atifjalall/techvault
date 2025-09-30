"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const footerSections = {
  shop: {
    title: "Shop",
    links: [
      { name: "All Products", href: "/products" },
      { name: "Wishlist", href: "/wishlist" },
      { name: "Cart", href: "/cart" },
    ],
  },
  account: {
    title: "Account",
    links: [
      { name: "Profile", href: "/profile" },
      { name: "Orders", href: "/orders" },
      { name: "Notifications", href: "/notifications" },
    ],
  },
  vendor: {
    title: "Sell With Us",
    links: [
      { name: "Become a Vendor", isButton: true, href: "" },
      { name: "Sign Up", href: "/signup" },
      { name: "Sign In", href: "/signin" },
    ],
  },
  support: {
    title: "Support",
    links: [{ name: "Track Order", href: "/orders" }],
  },
};

const socialLinks = [
  {
    name: "Facebook",
    href: "#",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
  },
  {
    name: "Twitter",
    href: "#",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "#",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [vendorForm, setVendorForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    businessName: "",
    message: "",
  });
  const [isSubmittingVendor, setIsSubmittingVendor] = useState(false);
  const [vendorSubmitted, setVendorSubmitted] = useState(false);

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !vendorForm.fullName ||
      !vendorForm.email ||
      !vendorForm.phone ||
      !vendorForm.businessName
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (!vendorForm.email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    setIsSubmittingVendor(true);

    // Simulate submission (you can add actual API call here)
    setTimeout(() => {
      setIsSubmittingVendor(false);
      setVendorSubmitted(true);

      // Reset form after showing success
      setTimeout(() => {
        setIsVendorModalOpen(false);
        setVendorSubmitted(false);
        setVendorForm({
          fullName: "",
          email: "",
          phone: "",
          businessName: "",
          message: "",
        });
      }, 2000);
    }, 1500);
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-3 py-6 lg:py-12">
        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8 mb-4 lg:mb-8">
          {Object.values(footerSections).map((section) => (
            <div key={section.title}>
              <h4 className="text-[10px] lg:text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 lg:mb-4">
                {section.title}
              </h4>
              <ul className="space-y-1 lg:space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {"isButton" in link && link.isButton ? (
                      <button
                        onClick={() => setIsVendorModalOpen(true)}
                        className="text-[9px] lg:text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-left"
                      >
                        {link.name}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        className="text-[9px] lg:text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div className="w-full border-t border-gray-200 py-6 lg:py-12">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            {/* Social Media */}
            <div className="flex justify-center space-x-4 lg:space-x-6 mb-4 lg:mb-8">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                  aria-label={social.name}
                >
                  <div className="h-4 w-4 lg:h-6 lg:w-6">{social.icon}</div>
                </a>
              ))}
            </div>

            {/* Bottom Section */}
            <div className="pt-4 lg:pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  <p className="text-[10px] lg:text-sm text-gray-500">
                    © 2025 TechVault. All rights reserved.
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-[10px] lg:text-sm text-gray-500">
                    Designed by:{" "}
                    <span className="text-[10px] lg:text-sm font-medium text-gray-900">
                      Atif Jalal
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Become a Vendor Modal */}
      <Dialog open={isVendorModalOpen} onOpenChange={setIsVendorModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-base lg:text-xl font-bold">
              Become a Vendor
            </DialogTitle>
            <DialogDescription className="text-xs lg:text-sm text-gray-600">
              Join TechVault as a vendor and start selling your products to
              thousands of customers.
            </DialogDescription>
          </DialogHeader>

          {vendorSubmitted ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Application Submitted!
              </h3>
              <p className="text-sm text-gray-600">
                Thank you for your interest. Our team will review your
                application and contact you soon.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleVendorSubmit}
              className="space-y-3 lg:space-y-4"
            >
              <div className="space-y-1 lg:space-y-2">
                <Label
                  htmlFor="fullName"
                  className="text-xs lg:text-sm font-medium"
                >
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={vendorForm.fullName}
                  onChange={(e) =>
                    setVendorForm({ ...vendorForm, fullName: e.target.value })
                  }
                  disabled={isSubmittingVendor}
                  className="h-8 lg:h-10 text-xs lg:text-sm"
                  required
                />
              </div>

              <div className="space-y-1 lg:space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs lg:text-sm font-medium"
                >
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={vendorForm.email}
                  onChange={(e) =>
                    setVendorForm({ ...vendorForm, email: e.target.value })
                  }
                  disabled={isSubmittingVendor}
                  className="h-8 lg:h-10 text-xs lg:text-sm"
                  required
                />
              </div>

              <div className="space-y-1 lg:space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-xs lg:text-sm font-medium"
                >
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+49 123 456 7890"
                  value={vendorForm.phone}
                  onChange={(e) =>
                    setVendorForm({ ...vendorForm, phone: e.target.value })
                  }
                  disabled={isSubmittingVendor}
                  className="h-8 lg:h-10 text-xs lg:text-sm"
                  required
                />
              </div>

              <div className="space-y-1 lg:space-y-2">
                <Label
                  htmlFor="businessName"
                  className="text-xs lg:text-sm font-medium"
                >
                  Business Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Your Business Name"
                  value={vendorForm.businessName}
                  onChange={(e) =>
                    setVendorForm({
                      ...vendorForm,
                      businessName: e.target.value,
                    })
                  }
                  disabled={isSubmittingVendor}
                  className="h-8 lg:h-10 text-xs lg:text-sm"
                  required
                />
              </div>

              <div className="space-y-1 lg:space-y-2">
                <Label
                  htmlFor="message"
                  className="text-xs lg:text-sm font-medium"
                >
                  Tell us about your business
                </Label>
                <Textarea
                  id="message"
                  placeholder="What products do you sell? Why do you want to join TechVault?"
                  value={vendorForm.message}
                  onChange={(e) =>
                    setVendorForm({ ...vendorForm, message: e.target.value })
                  }
                  disabled={isSubmittingVendor}
                  className="min-h-[80px] lg:min-h-[100px] resize-none text-xs lg:text-sm"
                />
              </div>

              <DialogFooter className="gap-2">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(false)}
                  disabled={isSubmittingVendor}
                  className="px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVendor}
                  className="px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 lg:gap-2"
                >
                  {isSubmittingVendor ? (
                    <>
                      <div className="w-3 h-3 lg:w-4 lg:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </footer>
  );
}
