/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button1";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

  const SubmissionSkeleton = () => (
    <Card className="border-0 shadow-sm bg-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-20" />
          <div className="flex space-x-1">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-2 h-2 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <BasicInfoStep
              formData={formData}
              updateFormData={handleFieldUpdate}
              errors={errors}
            />
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <VariantsStep
              formData={formData}
              updateFormData={handleFieldUpdate}
              errors={errors}
            />
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <SpecificationsStep
              formData={formData}
              updateFormData={handleFieldUpdate}
              errors={errors}
            />
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <MediaSettingsStep
              formData={formData}
              updateFormData={handleFieldUpdate}
              errors={errors}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isSubmitting ? (
          <SubmissionSkeleton />
        ) : (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                {/* Previous Button */}
                <motion.div
                  whileHover={{ scale: currentStep === 1 ? 1 : 1.02 }}
                  whileTap={{ scale: currentStep === 1 ? 1 : 0.98 }}
                >
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    size="sm"
                    className={`cursor-pointer transition-colors ${
                      currentStep === 1
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <ChevronLeftIcon className="w-3 h-3 mr-1" />
                    Previous
                  </Button>
                </motion.div>

                {/* Clean Progress Dots */}
                <div className="flex space-x-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <motion.button
                      key={step}
                      onClick={() => setCurrentStep(step)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        currentStep >= step
                          ? "bg-blue-600"
                          : currentStep === step - 1
                            ? "bg-blue-300"
                            : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {/* Next/Submit Button */}
                {currentStep < 4 ? (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={nextStep}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 !text-white"
                    >
                      Next
                      <ChevronRightIcon className="w-3 h-3 ml-1 !text-white" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  >
                    <Button
                      onClick={onSubmit}
                      disabled={isSubmitting}
                      size="sm"
                      className={`cursor-pointer ${
                        isSubmitting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Create Product
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Compact Error Summary */}
              <AnimatePresence>
                {Object.keys(errors).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 pt-2 border-t border-gray-100"
                  >
                    <div className="bg-red-50 rounded-md p-2">
                      <p className="text-xs font-medium text-red-800 mb-1">
                        Please fix {Object.keys(errors).length} issue
                        {Object.keys(errors).length > 1 ? "s" : ""}:
                      </p>
                      <div className="space-y-0.5">
                        {Object.entries(errors)
                          .slice(0, 2)
                          .map(([key, message]) => (
                            <p key={key} className="text-xs text-red-600">
                              • {message}
                            </p>
                          ))}
                        {Object.keys(errors).length > 2 && (
                          <p className="text-xs text-red-500">
                            + {Object.keys(errors).length - 2} more
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
