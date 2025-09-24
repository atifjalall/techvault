/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/buttonSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Step Components
import BasicInfoStep from "@/components/vendor/product/BasicInfoStep";
import VariantsStep from "@/components/vendor/product/VariantsStep";
import SpecificationsStep from "@/components/vendor/product/SpecificationsStep";
import MediaSettingsStep from "@/components/vendor/product/MediaStep";

// Types
import { ProductFormData } from "@/app/vendor/products/add/page";

interface ProductFormStepsProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formData: ProductFormData;
  updateFormData: (field: keyof ProductFormData, value: any) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function ProductFormSteps({
  currentStep,
  setCurrentStep,
  formData,
  updateFormData,
  onSubmit,
  isSubmitting,
}: ProductFormStepsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number) => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      // Basic Info validation
      if (!formData.name.trim()) stepErrors.name = "Product name is required";
      if (!formData.categoryId) stepErrors.categoryId = "Category is required";
      if (!formData.brandId) stepErrors.brandId = "Brand is required";
      if (!formData.description.trim())
        stepErrors.description = "Description is required";
      if (formData.description.trim().length < 20) {
        stepErrors.description = "Description should be at least 20 characters";
      }
    } else if (step === 2) {
      // Variants validation
      if (formData.variants.length === 0) {
        stepErrors.variants = "At least one variant is required";
      } else {
        const hasValidVariant = formData.variants.some(
          (variant) =>
            variant.variantName.trim() &&
            variant.price &&
            parseFloat(variant.price) > 0 &&
            variant.stock &&
            parseInt(variant.stock) >= 0
        );

        if (!hasValidVariant) {
          stepErrors.variants = "At least one complete variant is required";
        }

        // Check individual variants
        formData.variants.forEach((variant, index) => {
          if (variant.variantName.trim() || variant.price || variant.stock) {
            // If any field is filled, validate all required fields
            if (!variant.variantName.trim()) {
              stepErrors[`variant_${index}_name`] =
                `Variant ${index + 1}: Name is required`;
            }
            if (!variant.price || parseFloat(variant.price) <= 0) {
              stepErrors[`variant_${index}_price`] =
                `Variant ${index + 1}: Valid price is required`;
            }
            if (!variant.stock || parseInt(variant.stock) < 0) {
              stepErrors[`variant_${index}_stock`] =
                `Variant ${index + 1}: Valid stock is required`;
            }
            if (
              variant.comparePrice &&
              parseFloat(variant.comparePrice) <=
                parseFloat(variant.price || "0")
            ) {
              stepErrors[`variant_${index}_comparePrice`] =
                `Variant ${index + 1}: Compare price must be higher than regular price`;
            }
          }
        });
      }
    } else if (step === 3) {
      // Specifications validation - optional step, but if specs are added, validate them
      formData.specifications.forEach((spec, index) => {
        if (spec.name || spec.value || spec.category) {
          if (!spec.category.trim()) {
            stepErrors[`spec_${index}_category`] =
              `Spec ${index + 1}: Category is required`;
          }
          if (!spec.name.trim()) {
            stepErrors[`spec_${index}_name`] =
              `Spec ${index + 1}: Name is required`;
          }
          if (!spec.value.trim()) {
            stepErrors[`spec_${index}_value`] =
              `Spec ${index + 1}: Value is required`;
          }
        }
      });
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFieldUpdate = (field: keyof ProductFormData, value: any) => {
    updateFormData(field, value);
    // Clear related errors
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return "completed";
    if (step === currentStep) return "current";
    return "upcoming";
  };

  return (
    <div className="space-y-4">
      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 30, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-indigo-500/3 to-purple-500/3 rounded-2xl blur-2xl" />
              <div className="relative bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl shadow-lg">
                <BasicInfoStep
                  formData={formData}
                  updateFormData={handleFieldUpdate}
                  errors={errors}
                />
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 30, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/3 via-teal-500/3 to-cyan-500/3 rounded-2xl blur-2xl" />
              <div className="relative bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl shadow-lg">
                <VariantsStep
                  formData={formData}
                  updateFormData={handleFieldUpdate}
                  errors={errors}
                />
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 30, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/3 via-orange-500/3 to-red-500/3 rounded-2xl blur-2xl" />
              <div className="relative bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl shadow-lg">
                <SpecificationsStep
                  formData={formData}
                  updateFormData={handleFieldUpdate}
                  errors={errors}
                />
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 30, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/3 via-purple-500/3 to-fuchsia-500/3 rounded-2xl blur-2xl" />
              <div className="relative bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl shadow-lg">
                <MediaSettingsStep
                  formData={formData}
                  updateFormData={handleFieldUpdate}
                  errors={errors}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-white/70 backdrop-blur-sm border border-white/40 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {/* Previous Button */}
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer
                  ${
                    currentStep === 1
                      ? "bg-gray-100/50 text-gray-400 border-gray-200/50"
                      : "bg-white/80 text-gray-700 border-gray-200/50 hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5"
                  }
                `}
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Previous
              </Button>

              {/* Step Indicator */}
              <div className="flex items-center space-x-3">
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 px-3 py-1 text-xs font-medium shadow-md">
                  Step {currentStep} of 4
                </Badge>

                {/* Progress Dots */}
                <div className="flex space-x-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`
                        w-2 h-2 rounded-full transition-all duration-300
                        ${
                          currentStep >= step
                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-sm"
                            : "bg-gray-200"
                        }
                      `}
                    />
                  ))}
                </div>
              </div>

              {/* Next/Submit Button */}
              {currentStep < 4 ? (
                <Button
                  onClick={nextStep}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                >
                  Next Step
                  <ChevronRightIcon className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className={`
                    px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer
                    ${
                      isSubmitting
                        ? "bg-gray-400 text-white"
                        : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    }
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Create Product
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 pt-3 border-t border-gray-200"
              >
                <div className="bg-red-50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-red-800 mb-1">
                    Please fix the following issues:
                  </h4>
                  <div className="space-y-1">
                    {Object.entries(errors)
                      .slice(0, 3)
                      .map(([key, message]) => (
                        <p key={key} className="text-xs text-red-600">
                          • {message}
                        </p>
                      ))}
                    {Object.keys(errors).length > 3 && (
                      <p className="text-xs text-red-500 font-medium">
                        + {Object.keys(errors).length - 3} more issues
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
