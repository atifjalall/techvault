import Link from "next/link";

const featuredCategories = [
  {
    id: 1,
    name: "Gaming",
    description: "Level up your gameplay with premium gaming gear",
    href: "/gaming",
    image: "/api/placeholder/600/400",
    className: "lg:col-span-1 lg:row-span-2",
  },
  {
    id: 2,
    name: "Audio",
    description: "Premium sound systems and headphones",
    href: "/audio",
    image: "/api/placeholder/600/300",
    className: "lg:col-span-1",
  },
  {
    id: 3,
    name: "Computing",
    description: "Professional laptops and workstation setups",
    href: "/computing",
    image: "/api/placeholder/600/300",
    className: "lg:col-span-1",
  },
];

interface CategoryCardProps {
  category: (typeof featuredCategories)[0];
}

function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={category.href}
      className={`
        group relative overflow-hidden rounded-2xl bg-gray-900 text-white 
        hover:scale-[1.02] transition-all duration-500 ease-out
        ${category.className}
      `}
    >
      {/* Background Image Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="w-32 h-32 bg-gray-600 rounded-lg mx-auto mb-4 opacity-50"></div>
            <p className="text-sm opacity-50">{category.name} Image</p>
          </div>
        </div>
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-500"></div>

      {/* Content */}
      <div className="relative h-full p-8 flex flex-col justify-end min-h-[300px]">
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-2xl lg:text-3xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300">
            {category.name}
          </h3>
          <p className="text-gray-200 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            {category.description}
          </p>
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

export default function FeaturedCategories() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Featured Categories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our curated collections of premium electronics and tech
            essentials
          </p>
        </div>

        {/* 2x2 Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-5xl mx-auto">
          {featuredCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* Additional Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Smartphones", href: "/smartphones", icon: "📱" },
            { name: "Tablets", href: "/tablets", icon: "💻" },
            { name: "Wearables", href: "/wearables", icon: "⌚" },
            { name: "Accessories", href: "/accessories", icon: "🔌" },
          ].map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <Link
            href="/categories"
            className="inline-flex items-center justify-center px-8 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors group"
          >
            View All Categories
            <svg
              className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
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
          </Link>
        </div>
      </div>
    </section>
  );
}
