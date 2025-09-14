import Link from "next/link";

export interface Category {
  id: string | number;
  name: string;
  description?: string;
  href: string;
  image?: string;
  icon?: string;
  productCount?: number;
  isNew?: boolean;
  gradient?: string;
}

interface CategoryCardProps {
  category: Category;
  variant?: "default" | "large" | "small" | "icon-only";
  className?: string;
}

export default function CategoryCard({
  category,
  variant = "default",
  className = "",
}: CategoryCardProps) {
  const cardVariants = {
    default: {
      container:
        "group relative overflow-hidden rounded-xl bg-gray-900 text-white hover:scale-[1.02] transition-all duration-500 ease-out min-h-[300px]",
      content: "relative h-full p-6 flex flex-col justify-end",
      title: "text-xl lg:text-2xl font-bold mb-2",
      description:
        "text-gray-200 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100",
    },
    large: {
      container:
        "group relative overflow-hidden rounded-2xl bg-gray-900 text-white hover:scale-[1.02] transition-all duration-500 ease-out min-h-[400px]",
      content: "relative h-full p-8 flex flex-col justify-end",
      title: "text-2xl lg:text-3xl font-bold mb-3",
      description:
        "text-gray-200 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 text-lg",
    },
    small: {
      container:
        "group relative overflow-hidden rounded-lg bg-gray-900 text-white hover:scale-[1.02] transition-all duration-300 ease-out min-h-[200px]",
      content: "relative h-full p-4 flex flex-col justify-end",
      title: "text-lg font-bold mb-2",
      description:
        "text-gray-200 text-sm mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100",
    },
    "icon-only": {
      container:
        "group bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200 min-h-[120px]",
      content: "flex flex-col items-center justify-center h-full",
      title:
        "text-sm font-semibold text-gray-900 group-hover:text-gray-600 transition-colors",
      description: "text-xs text-gray-500 mt-1",
    },
  };

  const currentVariant = cardVariants[variant];

  if (variant === "icon-only") {
    return (
      <Link
        href={category.href}
        className={`${currentVariant.container} ${className}`}
      >
        <div className={currentVariant.content}>
          {category.icon && (
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
              {category.icon}
            </div>
          )}
          <h3 className={currentVariant.title}>{category.name}</h3>
          {category.productCount && (
            <p className={currentVariant.description}>
              {category.productCount} products
            </p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={category.href}
      className={`${currentVariant.container} ${className}`}
    >
      {/* Background with gradient or image placeholder */}
      <div
        className={`absolute inset-0 ${
          category.gradient || "bg-gradient-to-br from-gray-700 to-gray-900"
        }`}
      >
        {category.image ? (
          <div className="absolute inset-0 bg-gray-600 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="w-32 h-32 bg-gray-500 rounded-lg mx-auto mb-4 opacity-50"></div>
              <p className="text-sm opacity-50">{category.name} Image</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div
                className={`${
                  variant === "large"
                    ? "w-40 h-40"
                    : variant === "small"
                      ? "w-24 h-24"
                      : "w-32 h-32"
                } bg-gray-600 rounded-lg mx-auto mb-4 opacity-50`}
              ></div>
              <p className="text-sm opacity-50">{category.name}</p>
            </div>
          </div>
        )}
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-500"></div>

      {/* New Badge */}
      {category.isNew && (
        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
          NEW
        </div>
      )}

      {/* Product Count Badge */}
      {category.productCount &&
        (variant === "default" ||
          variant === "large" ||
          variant === "small") && (
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
            {category.productCount} items
          </div>
        )}

      {/* Content */}
      <div className={currentVariant.content}>
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3
            className={`${currentVariant.title} group-hover:scale-105 transition-transform duration-300`}
          >
            {category.name}
          </h3>

          {category.description && (
            <p className={currentVariant.description}>{category.description}</p>
          )}

          <div className="inline-flex items-center text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
            Shop Now
            <svg
              className="ml-2 h-5 w-5 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Hover Shimmer Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      </div>
    </Link>
  );
}
