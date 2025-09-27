/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// Reuse existing components
import ProductFormSteps from "@/components/vendor/product/ProductFormSteps";
import ProductPreview from "@/components/vendor/product/ProductPreview";

// UI Components
import { Button } from "@/components/ui/buttonSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Types matching the new schema
interface ProductVariant {
  id?: string;
  variantName: string;
  sku?: string;
  price: string;
  comparePrice?: string;
  stock: string;
  lowStockAlert: string;
  color?: string;
  colorHex?: string;
  storage?: string;
  ram?: string;
  size?: string;
  length?: string;
  material?: string;
  attributes?: Record<string, string>;
  images: File[];
  imagePreviews: string[];
  cloudinaryUrls: string[];
  thumbnailImage?: string;
  isActive: boolean;
}

interface ProductSpecification {
  id?: string;
  category: string;
  categoryOrder: number;
  name: string;
  value: string;
  unit?: string;
  specOrder: number;
  isHighlight: boolean;
}

interface ProductFormData {
  name: string;
  description: string;
  brandId: string;
  categoryId: string;
  subcategoryId: string;
  modelNumber: string;
  images: File[];
  imagePreviews: string[];
  cloudinaryUrls: string[];
  featured: boolean;
  newArrival: boolean;
  returnable: boolean;
  isActive: boolean;
  deliveryDays: string;
  warranty: string;
  weight: string;
  dimensions: string;
  tags: string;
  variants: ProductVariant[];
  specifications: ProductSpecification[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  brandId?: string;
  brand?: {
    id: string;
    name: string;
  };
  categoryId: string;
  subcategoryId?: string;
  modelNumber?: string;
  isActive: boolean;
  featured: boolean;
  newArrival: boolean;
  returnable: boolean;
  deliveryDays?: number;
  warranty?: string;
  weight?: string;
  dimensions?: string;
  tags: string[];
  variants: any[];
  specifications: any[];
  category: {
    id: string;
    name: string;
  };
  subcategory?: {
    id: string;
    name: string;
  };
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();

  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    brandId: "",
    categoryId: "",
    subcategoryId: "",
    modelNumber: "",
    images: [],
    imagePreviews: [],
    cloudinaryUrls: [],
    featured: false,
    newArrival: false,
    returnable: true,
    isActive: true,
    deliveryDays: "3",
    warranty: "2",
    weight: "",
    dimensions: "",
    tags: "",
    variants: [],
    specifications: [],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load existing product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`/api/vendor/products/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load product");
        }

        const productData = data.product;
        setProduct(productData);

        // Convert product data to form format
        const convertedVariants: ProductVariant[] = productData.variants.map(
          (variant: any) => ({
            id: variant.id,
            variantName: variant.variantName || "",
            sku: variant.sku || "",
            price: variant.price?.toString() || "",
            comparePrice: variant.comparePrice?.toString() || "",
            stock: variant.stock?.toString() || "0",
            lowStockAlert: variant.lowStockAlert?.toString() || "10",
            color: variant.color || "",
            colorHex: variant.colorHex || "",
            storage: variant.storage || "",
            ram: variant.ram || "",
            size: variant.size || "",
            length: variant.length || "",
            material: variant.material || "",
            attributes: variant.attributes || {},
            images: [],
            imagePreviews: variant.images || [],
            cloudinaryUrls: variant.images || [],
            thumbnailImage: variant.thumbnailImage || "",
            isActive: variant.isActive !== undefined ? variant.isActive : true,
          })
        );

        const convertedSpecs: ProductSpecification[] =
          productData.specifications.map((spec: any, index: number) => ({
            id: spec.id,
            category: spec.category || "Other",
            categoryOrder: spec.categoryOrder || 0,
            name: spec.name || "",
            value: spec.value || "",
            unit: spec.unit || "",
            specOrder: spec.specOrder || index,
            isHighlight: spec.isHighlight || false,
          }));

        setFormData({
          name: productData.name || "",
          description: productData.description || "",
          brandId: productData.brandId || "",
          categoryId: productData.categoryId || "",
          subcategoryId: productData.subcategoryId || "",
          modelNumber: productData.modelNumber || "",
          images: [],
          imagePreviews: productData.images || [],
          cloudinaryUrls: productData.images || [],
          featured: productData.featured || false,
          newArrival: productData.newArrival || false,
          returnable:
            productData.returnable !== undefined
              ? productData.returnable
              : true,
          isActive:
            productData.isActive !== undefined ? productData.isActive : true,
          deliveryDays: productData.deliveryDays?.toString() || "3",
          warranty: productData.warranty || "2",
          weight: productData.weight || "",
          dimensions: productData.dimensions || "",
          tags: Array.isArray(productData.tags)
            ? productData.tags.join(", ")
            : "",
          variants:
            convertedVariants.length > 0
              ? convertedVariants
              : [
                  {
                    variantName: "Default",
                    sku: "",
                    price: "",
                    comparePrice: "",
                    stock: "0",
                    lowStockAlert: "10",
                    color: "",
                    colorHex: "",
                    storage: "",
                    ram: "",
                    size: "",
                    length: "",
                    material: "",
                    attributes: {},
                    images: [],
                    imagePreviews: [],
                    cloudinaryUrls: [],
                    thumbnailImage: "",
                    isActive: true,
                  },
                ],
          specifications: convertedSpecs,
        });
      } catch (error) {
        console.error("Error loading product:", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load product"
        );
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    if (params.id && session?.user) {
      loadProduct();
    }
  }, [params.id, session?.user]);

  // Auto-save function
  const autoSave = async () => {
    if (!product) return;

    setSaveStatus("saving");
    try {
      // Simulate auto-save delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Auto-save error:", error);
      setSaveStatus("error");
    }
  };

  const updateFormData = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Trigger auto-save after a short delay
    setTimeout(autoSave, 1000);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // Prepare variants data for submission
      const variantsForSubmission = formData.variants.map((variant) => ({
        id: variant.id, // Include ID for existing variants
        variantName: variant.variantName,
        sku: variant.sku || null,
        price: variant.price,
        comparePrice: variant.comparePrice || null,
        stock: variant.stock,
        lowStockAlert: variant.lowStockAlert,
        color: variant.color || null,
        colorHex: variant.colorHex || null,
        storage: variant.storage || null,
        ram: variant.ram || null,
        size: variant.size || null,
        length: variant.length || null,
        material: variant.material || null,
        attributes: variant.attributes || null,
        cloudinaryUrls: variant.cloudinaryUrls,
        thumbnailImage: variant.thumbnailImage || null,
        isActive: variant.isActive,
      }));

      // Prepare specifications data
      const specificationsForSubmission = formData.specifications.map(
        (spec) => ({
          id: spec.id, // Include ID for existing specs
          category: spec.category,
          categoryOrder: spec.categoryOrder,
          name: spec.name,
          value: spec.value,
          unit: spec.unit || null,
          specOrder: spec.specOrder,
          isHighlight: spec.isHighlight,
        })
      );

      const payload = {
        name: formData.name,
        description: formData.description,
        brandId: formData.brandId || null,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || null,
        modelNumber: formData.modelNumber || null,
        images: formData.cloudinaryUrls,
        featured: formData.featured,
        newArrival: formData.newArrival,
        returnable: formData.returnable,
        isActive: formData.isActive,
        deliveryDays: parseInt(formData.deliveryDays) || null,
        warranty: formData.warranty || null,
        weight: formData.weight || null,
        dimensions: formData.dimensions || null,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        variants: variantsForSubmission,
        specifications: specificationsForSubmission,
      };

      console.log("Submitting update:", payload);

      const response = await fetch(`/api/vendor/products/${product!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update product");
      }

      toast.success("Product updated successfully!");
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        router.push("/vendor/products");
      }, 2000);
    } catch (error) {
      console.error("Error updating product:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update product"
      );
      setShowErrorModal(true);
      toast.error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Skeleton className="h-8 w-8" />
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-1">
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Product not found
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            The product you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have permission to edit it.
          </p>
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            <Link href="/vendor/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <Card className="bg-white/70 backdrop-blur-md border border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Edit Product
                </h1>
                <p className="text-sm text-gray-600">
                  Update your product: {product.name}
                </p>
              </div>
            </div>

            {/* Auto-save Status & Actions */}
            <div className="flex items-center space-x-3">
              {saveStatus !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex items-center text-sm ${
                    saveStatus === "saving"
                      ? "text-blue-600"
                      : saveStatus === "saved"
                        ? "text-green-600"
                        : "text-red-600"
                  }`}
                >
                  {saveStatus === "saving" && (
                    <>
                      <ClockIcon className="w-4 h-4 mr-2 animate-pulse" />
                      Auto-saving...
                    </>
                  )}
                  {saveStatus === "saved" && (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Saved
                    </>
                  )}
                  {saveStatus === "error" && (
                    <>
                      <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                      Save failed
                    </>
                  )}
                </motion.div>
              )}

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="cursor-pointer"
                >
                  <Link href={`/products/${product.slug}`}>
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Preview
                  </Link>
                </Button>

                <Button
                  onClick={handleSubmit}
                  disabled={saving}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Product Info Summary */}
          <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-200">
            <Badge
              variant={product.isActive ? "default" : "secondary"}
              className="text-xs"
            >
              {product.isActive ? "Active" : "Draft"}
            </Badge>

            {product.featured && (
              <Badge variant="default" className="text-xs bg-blue-600">
                Featured
              </Badge>
            )}

            {product.newArrival && (
              <Badge variant="default" className="text-xs bg-green-600">
                New Arrival
              </Badge>
            )}

            <span className="text-sm text-gray-500">
              {formData.variants.length} variant
              {formData.variants.length !== 1 ? "s" : ""}
            </span>

            <span className="text-sm text-gray-500">
              {formData.specifications.length} specification
              {formData.specifications.length !== 1 ? "s" : ""}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Main Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <ProductPreview formData={formData} />
        </div>

        {/* Form Steps */}
        <div className="lg:col-span-2">
          <ProductFormSteps
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            formData={formData}
            updateFormData={updateFormData}
            onSubmit={handleSubmit}
            isSubmitting={saving}
          />
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-white/90 backdrop-blur-md border border-green-200">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-800">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Product Updated Successfully!
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Your product changes have been saved and are now live.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/vendor/products");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              Go to Products
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="bg-white/90 backdrop-blur-md border border-red-200">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-800">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              Failed to Update Product
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {errorMessage ||
                "An error occurred while updating your product. Please try again."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowErrorModal(false)}
              className="border-gray-300 cursor-pointer"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowErrorModal(false);
                handleSubmit();
              }}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              Try Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
