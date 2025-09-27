/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  XMarkIcon,
  ListBulletIcon,
  StarIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  ComputerDesktopIcon,
  BoltIcon,
  CameraIcon,
  Battery50Icon,
  WifiIcon,
  CubeIcon,
  SpeakerWaveIcon,
  CircleStackIcon,
  LockClosedIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button1";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ProductFormData,
  ProductSpecification,
} from "@/app/vendor/products/add/page";

interface SpecificationsStepProps {
  formData: ProductFormData;
  updateFormData: (field: keyof ProductFormData, value: any) => void;
  errors: Record<string, string>;
}

// Specification categories with proper icons
const SPEC_CATEGORIES = [
  { name: "Display", icon: ComputerDesktopIcon, order: 0 },
  { name: "Performance", icon: BoltIcon, order: 1 },
  { name: "Camera", icon: CameraIcon, order: 2 },
  { name: "Battery", icon: Battery50Icon, order: 3 },
  { name: "Connectivity", icon: WifiIcon, order: 4 },
  { name: "Physical", icon: CubeIcon, order: 5 },
  { name: "Audio", icon: SpeakerWaveIcon, order: 6 },
  { name: "Storage", icon: CircleStackIcon, order: 7 },
  { name: "Security", icon: LockClosedIcon, order: 8 },
  { name: "Software", icon: CommandLineIcon, order: 9 },
  { name: "General", icon: ListBulletIcon, order: 10 },
];

// Common specification templates by category
const SPEC_TEMPLATES = {
  Display: [
    { name: "Screen Size", unit: "inches" },
    { name: "Resolution", unit: "pixels" },
    { name: "Display Type", unit: "" },
    { name: "Refresh Rate", unit: "Hz" },
    { name: "Brightness", unit: "nits" },
  ],
  Performance: [
    { name: "Processor", unit: "" },
    { name: "RAM", unit: "GB" },
    { name: "Graphics", unit: "" },
    { name: "Benchmark Score", unit: "points" },
  ],
  Camera: [
    { name: "Main Camera", unit: "MP" },
    { name: "Front Camera", unit: "MP" },
    { name: "Video Recording", unit: "" },
    { name: "Camera Features", unit: "" },
  ],
  Battery: [
    { name: "Battery Capacity", unit: "mAh" },
    { name: "Charging Speed", unit: "W" },
    { name: "Battery Life", unit: "hours" },
    { name: "Wireless Charging", unit: "" },
  ],
  Connectivity: [
    { name: "WiFi", unit: "" },
    { name: "Bluetooth", unit: "" },
    { name: "5G Support", unit: "" },
    { name: "NFC", unit: "" },
  ],
  Physical: [
    { name: "Dimensions", unit: "mm" },
    { name: "Weight", unit: "g" },
    { name: "Material", unit: "" },
    { name: "Water Resistance", unit: "" },
  ],
};

export default function SpecificationsStep({
  formData,
  updateFormData,
  errors,
}: SpecificationsStepProps) {
  // Group specifications by category
  const groupedSpecs = formData.specifications.reduce(
    (acc, spec, index) => {
      const category = spec.category || "General";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({ ...spec, originalIndex: index });
      return acc;
    },
    {} as Record<
      string,
      Array<ProductSpecification & { originalIndex: number }>
    >
  );

  const addSpecCategory = (categoryName: string) => {
    const categoryOrder =
      SPEC_CATEGORIES.find((c) => c.name === categoryName)?.order || 99;
    const newSpec: ProductSpecification = {
      category: categoryName,
      categoryOrder,
      name: "",
      value: "",
      unit: "",
      specOrder: 0,
      isHighlight: false,
    };

    updateFormData("specifications", [...formData.specifications, newSpec]);
  };

  const addSpecToCategory = (categoryName: string) => {
    const existingCategorySpecs = groupedSpecs[categoryName] || [];
    const categoryOrder =
      SPEC_CATEGORIES.find((c) => c.name === categoryName)?.order || 99;
    const nextSpecOrder =
      Math.max(0, ...existingCategorySpecs.map((s) => s.specOrder)) + 1;

    const newSpec: ProductSpecification = {
      category: categoryName,
      categoryOrder,
      name: "",
      value: "",
      unit: "",
      specOrder: nextSpecOrder,
      isHighlight: false,
    };

    updateFormData("specifications", [...formData.specifications, newSpec]);
  };

  const updateSpec = (
    index: number,
    field: keyof ProductSpecification,
    value: any
  ) => {
    const updatedSpecs = formData.specifications.map((spec, i) =>
      i === index ? { ...spec, [field]: value } : spec
    );
    updateFormData("specifications", updatedSpecs);
  };

  const removeSpec = (index: number) => {
    const updatedSpecs = formData.specifications.filter((_, i) => i !== index);
    updateFormData("specifications", updatedSpecs);
  };

  const moveSpec = (index: number, direction: "up" | "down") => {
    const specs = [...formData.specifications];
    const currentSpec = specs[index];
    const categorySpecs = specs.filter(
      (s) => s.category === currentSpec.category
    );

    if (direction === "up" && currentSpec.specOrder > 0) {
      const targetSpec = categorySpecs.find(
        (s) => s.specOrder === currentSpec.specOrder - 1
      );
      if (targetSpec) {
        const targetIndex = specs.findIndex((s) => s === targetSpec);
        specs[index] = { ...currentSpec, specOrder: currentSpec.specOrder - 1 };
        specs[targetIndex] = {
          ...targetSpec,
          specOrder: targetSpec.specOrder + 1,
        };
      }
    } else if (direction === "down") {
      const targetSpec = categorySpecs.find(
        (s) => s.specOrder === currentSpec.specOrder + 1
      );
      if (targetSpec) {
        const targetIndex = specs.findIndex((s) => s === targetSpec);
        specs[index] = { ...currentSpec, specOrder: currentSpec.specOrder + 1 };
        specs[targetIndex] = {
          ...targetSpec,
          specOrder: targetSpec.specOrder - 1,
        };
      }
    }

    updateFormData("specifications", specs);
  };

  const addSpecFromTemplate = (
    categoryName: string,
    templateSpec: { name: string; unit: string }
  ) => {
    const existingCategorySpecs = groupedSpecs[categoryName] || [];
    const categoryOrder =
      SPEC_CATEGORIES.find((c) => c.name === categoryName)?.order || 99;
    const nextSpecOrder =
      Math.max(0, ...existingCategorySpecs.map((s) => s.specOrder)) + 1;

    const newSpec: ProductSpecification = {
      category: categoryName,
      categoryOrder,
      name: templateSpec.name,
      value: "",
      unit: templateSpec.unit,
      specOrder: nextSpecOrder,
      isHighlight: false,
    };

    updateFormData("specifications", [...formData.specifications, newSpec]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-sm bg-white">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
              <DocumentTextIcon className="w-4 h-4 mr-2 text-blue-600" />
              Product Specifications
            </CardTitle>
            <p className="text-xs text-gray-600">
              Add detailed technical specifications organized by category
            </p>
          </CardHeader>
        </motion.div>

        <CardContent className="space-y-4 pt-2">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-md p-2 text-center">
              <p className="text-xs text-blue-600 font-medium">Categories</p>
              <p className="text-sm font-bold text-blue-800">
                {Object.keys(groupedSpecs).length}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-md p-2 text-center">
              <p className="text-xs text-green-600 font-medium">
                Specifications
              </p>
              <p className="text-sm font-bold text-green-800">
                {
                  formData.specifications.filter(
                    (spec) => spec.name.trim() && spec.value.trim()
                  ).length
                }
              </p>
            </div>
          </motion.div>

          {/* Add Category Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-gray-50/50 border border-gray-200 rounded-md p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-900 flex items-center">
                <PlusIcon className="w-4 h-4 mr-1 text-blue-600" />
                Add Category
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SPEC_CATEGORIES.filter((cat) => !groupedSpecs[cat.name]).map(
                (category) => (
                  <motion.button
                    key={category.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addSpecCategory(category.name)}
                    className="flex items-center justify-start text-xs h-8 px-2 bg-white border border-gray-200 rounded-md cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <category.icon className="w-3 h-3 mr-1.5 text-blue-600" />
                    {category.name}
                  </motion.button>
                )
              )}
            </div>
            {Object.keys(groupedSpecs).length === SPEC_CATEGORIES.length && (
              <p className="text-xs text-gray-500 text-center py-2">
                All common categories added
              </p>
            )}
          </motion.div>

          {/* Specifications by Category */}
          <div className="space-y-3">
            <AnimatePresence>
              {Object.entries(groupedSpecs)
                .sort(([, specsA], [, specsB]) => {
                  const orderA = specsA[0]?.categoryOrder || 99;
                  const orderB = specsB[0]?.categoryOrder || 99;
                  return orderA - orderB;
                })
                .map(([categoryName, specs]) => {
                  const categoryData = SPEC_CATEGORIES.find(
                    (c) => c.name === categoryName
                  );
                  const IconComponent = categoryData?.icon || ListBulletIcon;

                  return (
                    <motion.div
                      key={categoryName}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-gray-50/30 border border-gray-200">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <IconComponent className="w-4 h-4 text-blue-600" />
                              <p className="text-sm font-semibold text-gray-900">
                                {categoryName}
                              </p>
                              <Badge variant="secondary" size="sm" icon={false}>
                                {specs.length}
                              </Badge>
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addSpecToCategory(categoryName)}
                                className="cursor-pointer"
                              >
                                <PlusIcon className="w-3 h-3 mr-1" />
                                Add Spec
                              </Button>
                            </motion.div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3 pt-0">
                          {/* Quick Add Templates */}
                          {SPEC_TEMPLATES[
                            categoryName as keyof typeof SPEC_TEMPLATES
                          ] && (
                            <div className="bg-white/50 rounded-md p-2 space-y-2">
                              <p className="text-xs font-medium text-gray-700">
                                Quick Add:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {SPEC_TEMPLATES[
                                  categoryName as keyof typeof SPEC_TEMPLATES
                                ]
                                  .filter(
                                    (template) =>
                                      !specs.some(
                                        (spec) => spec.name === template.name
                                      )
                                  )
                                  .map((template) => (
                                    <button
                                      key={template.name}
                                      onClick={() =>
                                        addSpecFromTemplate(
                                          categoryName,
                                          template
                                        )
                                      }
                                      className="text-xs h-6 px-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                                    >
                                      + {template.name}
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Specifications List */}
                          <div className="space-y-2">
                            {specs
                              .sort((a, b) => a.specOrder - b.specOrder)
                              .map((spec) => (
                                <div
                                  key={spec.originalIndex}
                                  className="grid grid-cols-12 gap-2 items-start bg-white rounded-md p-2 border border-gray-200"
                                >
                                  {/* Spec Name */}
                                  <div className="col-span-4">
                                    <Label className="text-xs text-gray-500 mb-1 block">
                                      Name
                                    </Label>
                                    <motion.div whileFocus={{ scale: 1.01 }}>
                                      <Input
                                        value={spec.name}
                                        onChange={(e) =>
                                          updateSpec(
                                            spec.originalIndex,
                                            "name",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Screen Size"
                                        className="h-7 text-sm"
                                      />
                                    </motion.div>
                                    <AnimatePresence>
                                      {errors[
                                        `spec_${spec.originalIndex}_name`
                                      ] && (
                                        <motion.p
                                          initial={{ opacity: 0, y: -10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: -10 }}
                                          className="text-red-500 text-xs mt-1"
                                        >
                                          {
                                            errors[
                                              `spec_${spec.originalIndex}_name`
                                            ]
                                          }
                                        </motion.p>
                                      )}
                                    </AnimatePresence>
                                  </div>

                                  {/* Spec Value */}
                                  <div className="col-span-4">
                                    <Label className="text-xs text-gray-500 mb-1 block">
                                      Value
                                    </Label>
                                    <motion.div whileFocus={{ scale: 1.01 }}>
                                      <Input
                                        value={spec.value}
                                        onChange={(e) =>
                                          updateSpec(
                                            spec.originalIndex,
                                            "value",
                                            e.target.value
                                          )
                                        }
                                        placeholder="6.7"
                                        className="h-7 text-sm"
                                      />
                                    </motion.div>
                                    <AnimatePresence>
                                      {errors[
                                        `spec_${spec.originalIndex}_value`
                                      ] && (
                                        <motion.p
                                          initial={{ opacity: 0, y: -10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: -10 }}
                                          className="text-red-500 text-xs mt-1"
                                        >
                                          {
                                            errors[
                                              `spec_${spec.originalIndex}_value`
                                            ]
                                          }
                                        </motion.p>
                                      )}
                                    </AnimatePresence>
                                  </div>

                                  {/* Unit */}
                                  <div className="col-span-2">
                                    <Label className="text-xs text-gray-500 mb-1 block">
                                      Unit
                                    </Label>
                                    <motion.div whileFocus={{ scale: 1.01 }}>
                                      <Input
                                        value={spec.unit || ""}
                                        onChange={(e) =>
                                          updateSpec(
                                            spec.originalIndex,
                                            "unit",
                                            e.target.value
                                          )
                                        }
                                        placeholder="inches"
                                        className="h-7 text-sm"
                                      />
                                    </motion.div>
                                  </div>

                                  {/* Controls */}
                                  <div className="col-span-2 flex items-center space-x-1 pt-4">
                                    {/* Highlight Toggle */}
                                    <div className="flex items-center space-x-1">
                                      <Switch
                                        checked={spec.isHighlight}
                                        onCheckedChange={(checked) =>
                                          updateSpec(
                                            spec.originalIndex,
                                            "isHighlight",
                                            checked
                                          )
                                        }
                                        className="scale-75"
                                      />
                                      <StarIcon
                                        className={`w-3 h-3 ${
                                          spec.isHighlight
                                            ? "text-yellow-500"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    </div>

                                    {/* Move Up/Down */}
                                    <div className="flex flex-col">
                                      <button
                                        onClick={() =>
                                          moveSpec(spec.originalIndex, "up")
                                        }
                                        disabled={spec.specOrder === 0}
                                        className="h-3 w-5 p-0 text-gray-400 hover:text-gray-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        <ChevronUpIcon className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          moveSpec(spec.originalIndex, "down")
                                        }
                                        className="h-3 w-5 p-0 text-gray-400 hover:text-gray-600 cursor-pointer"
                                      >
                                        <ChevronDownIcon className="w-3 h-3" />
                                      </button>
                                    </div>

                                    {/* Remove */}
                                    <button
                                      onClick={() =>
                                        removeSpec(spec.originalIndex)
                                      }
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer flex items-center justify-center"
                                    >
                                      <XMarkIcon className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}

                            {specs.length === 0 && (
                              <div className="text-center py-3 text-gray-500 text-sm">
                                No specifications added yet
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {formData.specifications.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="bg-gray-50/50 border border-gray-200 border-dashed rounded-md p-6 text-center"
            >
              <ListBulletIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium text-gray-600 mb-1">
                No Specifications Added
              </p>
              <p className="text-xs text-gray-500">
                Add specification categories above to create detailed product
                info
              </p>
            </motion.div>
          )}

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="bg-blue-50 border border-blue-200 rounded-md p-2"
          >
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">?</span>
              </div>
              <div className="text-xs text-blue-800 space-y-1">
                <p className="font-medium">Tips:</p>
                <ul className="space-y-0.5 ml-2">
                  <li>• Use star toggle to highlight important specs</li>
                  <li>• Add units (inches, GB, MP) for clarity</li>
                  <li>• Specifications help customers compare products</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
