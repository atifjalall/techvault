/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  PlusIcon,
  XMarkIcon,
  ListBulletIcon,
  StarIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/buttonSidebar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ProductFormData,
  ProductSpecification,
} from "@/app/vendor/products/add/page";

interface SpecificationsStepProps {
  formData: ProductFormData;
  updateFormData: (field: keyof ProductFormData, value: any) => void;
  errors: Record<string, string>;
}

// Common specification categories for electronics
const SPEC_CATEGORIES = [
  { name: "Display", icon: "📱", order: 0 },
  { name: "Performance", icon: "⚡", order: 1 },
  { name: "Camera", icon: "📷", order: 2 },
  { name: "Battery", icon: "🔋", order: 3 },
  { name: "Connectivity", icon: "📡", order: 4 },
  { name: "Physical", icon: "📐", order: 5 },
  { name: "Audio", icon: "🎵", order: 6 },
  { name: "Storage", icon: "💾", order: 7 },
  { name: "Security", icon: "🔒", order: 8 },
  { name: "Software", icon: "💻", order: 9 },
  { name: "General", icon: "📋", order: 10 },
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
  const [selectedCategory, setSelectedCategory] = useState<string>("");

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
    setSelectedCategory("");
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

  const getSpecificationCount = () => {
    return formData.specifications.filter(
      (spec) => spec.name.trim() && spec.value.trim()
    ).length;
  };

  const getCategoryCount = () => {
    return Object.keys(groupedSpecs).length;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg"
        >
          <DocumentTextIcon className="w-6 h-6 text-white" />
        </motion.div>

        <div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-amber-900 to-orange-900 bg-clip-text text-transparent">
            Product Specifications
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Add detailed technical specifications organized by category
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-blue-50/50 border border-blue-200">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-blue-600 font-medium">Categories</p>
            <p className="text-lg font-bold text-blue-800">
              {getCategoryCount()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border border-green-200">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-green-600 font-medium">Specifications</p>
            <p className="text-lg font-bold text-green-800">
              {getSpecificationCount()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Category Section */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <PlusIcon className="w-4 h-4 mr-2 text-blue-600" />
            Add Specification Category
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SPEC_CATEGORIES.filter((cat) => !groupedSpecs[cat.name]).map(
              (category) => (
                <Button
                  key={category.name}
                  variant="outline"
                  size="sm"
                  onClick={() => addSpecCategory(category.name)}
                  className="justify-start text-xs h-8 cursor-pointer bg-white/70 hover:bg-blue-50 border-blue-200"
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.name}
                </Button>
              )
            )}
          </div>
          {Object.keys(groupedSpecs).length === SPEC_CATEGORIES.length && (
            <p className="text-xs text-gray-500 text-center py-2">
              All common categories have been added. You can still add custom
              specifications below.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Specifications by Category */}
      <div className="space-y-4">
        {Object.entries(groupedSpecs)
          .sort(([, specsA], [, specsB]) => {
            const orderA = specsA[0]?.categoryOrder || 99;
            const orderB = specsB[0]?.categoryOrder || 99;
            return orderA - orderB;
          })
          .map(([categoryName, specs]) => (
            <motion.div
              key={categoryName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border border-white/60 shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {SPEC_CATEGORIES.find((c) => c.name === categoryName)
                          ?.icon || "📋"}
                      </span>
                      <CardTitle className="text-sm">{categoryName}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {specs.length} specs
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addSpecToCategory(categoryName)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer h-7 text-xs"
                    >
                      <PlusIcon className="w-3 h-3 mr-1" />
                      Add Spec
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Quick Add Templates */}
                  {SPEC_TEMPLATES[
                    categoryName as keyof typeof SPEC_TEMPLATES
                  ] && (
                    <div className="bg-gray-50/50 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-medium text-gray-700">
                        Quick Add:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {SPEC_TEMPLATES[
                          categoryName as keyof typeof SPEC_TEMPLATES
                        ]
                          .filter(
                            (template) =>
                              !specs.some((spec) => spec.name === template.name)
                          )
                          .map((template) => (
                            <Button
                              key={template.name}
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                addSpecFromTemplate(categoryName, template)
                              }
                              className="text-xs h-6 px-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"
                            >
                              + {template.name}
                            </Button>
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
                          className="grid grid-cols-12 gap-2 items-start bg-white rounded-lg p-3 border border-gray-200"
                        >
                          {/* Spec Name */}
                          <div className="col-span-4">
                            <Label className="text-xs text-gray-500 mb-1 block">
                              Specification
                            </Label>
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
                              className="h-8 text-sm"
                            />
                            {errors[`spec_${spec.originalIndex}_name`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors[`spec_${spec.originalIndex}_name`]}
                              </p>
                            )}
                          </div>

                          {/* Spec Value */}
                          <div className="col-span-4">
                            <Label className="text-xs text-gray-500 mb-1 block">
                              Value
                            </Label>
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
                              className="h-8 text-sm"
                            />
                            {errors[`spec_${spec.originalIndex}_value`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors[`spec_${spec.originalIndex}_value`]}
                              </p>
                            )}
                          </div>

                          {/* Unit */}
                          <div className="col-span-2">
                            <Label className="text-xs text-gray-500 mb-1 block">
                              Unit
                            </Label>
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
                              className="h-8 text-sm"
                            />
                          </div>

                          {/* Controls */}
                          <div className="col-span-2 flex items-center space-x-1 pt-5">
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
                                className={`w-3 h-3 ${spec.isHighlight ? "text-yellow-500" : "text-gray-300"}`}
                              />
                            </div>

                            {/* Move Up/Down */}
                            <div className="flex flex-col">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  moveSpec(spec.originalIndex, "up")
                                }
                                disabled={spec.specOrder === 0}
                                className="h-4 w-6 p-0 text-gray-400 hover:text-gray-600 cursor-pointer"
                              >
                                <ChevronUpIcon className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  moveSpec(spec.originalIndex, "down")
                                }
                                className="h-4 w-6 p-0 text-gray-400 hover:text-gray-600 cursor-pointer"
                              >
                                <ChevronDownIcon className="w-3 h-3" />
                              </Button>
                            </div>

                            {/* Remove */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSpec(spec.originalIndex)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}

                    {specs.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No specifications added to this category yet.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
      </div>

      {/* Empty State */}
      {formData.specifications.length === 0 && (
        <Card className="bg-gray-50/50 border border-gray-200 border-dashed">
          <CardContent className="p-8 text-center">
            <ListBulletIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              No Specifications Added
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Add specification categories above to create detailed product
              information
            </p>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <Card className="bg-blue-50/30 border border-blue-200">
        <CardContent className="p-3">
          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-white text-xs font-bold">?</span>
            </div>
            <div className="text-xs text-blue-800 space-y-1">
              <p>
                <strong>Tips for great specifications:</strong>
              </p>
              <ul className="space-y-0.5 ml-2">
                <li>• Use the star toggle to highlight important specs</li>
                <li>• Add units (inches, GB, MP) for better clarity</li>
                <li>• Group related specs in appropriate categories</li>
                <li>
                  • Specifications are optional but help customers compare
                  products
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
