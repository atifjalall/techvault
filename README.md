# TechVault - Modern Electronics E-commerce Platform

A professional, full-stack e-commerce marketplace built with Next.js 14, designed for the German market. TechVault demonstrates enterprise-level development practices with a focus on performance, user experience, and modern web technologies.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## 🎯 Project Overview

TechVault is a production-ready e-commerce platform specializing in electronics (smartphones, laptops, audio equipment). Built as a portfolio project to showcase full-stack development capabilities for the German job market.

## ✨ Key Features

### 🛍️ Shopping Experience
- **Product Catalog** - Advanced filtering, search, and sorting capabilities
- **Product Variants** - Support for multiple variants (color, storage, RAM, size)
- **Smart Cart System** - Persistent shopping cart with real-time updates
- **Guest Checkout** - Shop without account registration
- **Wishlist** - Save products for later purchases
- **Product Reviews** - Customer ratings and detailed reviews

### 👤 User Management
- **Multi-Auth System** - Email/password and Google OAuth integration
- **Account Dashboard** - Order history, profile management, address book
- **Order Tracking** - Real-time order status with detailed timeline
- **Secure Authentication** - NextAuth.js with encrypted sessions

### 💳 Payment & Checkout
- **Stripe Integration** - Secure payment processing (test mode)
- **Multiple Payment Methods** - Credit/debit cards, SEPA Direct Debit
- **Address Management** - Save multiple shipping addresses
- **Order Management** - Cancel orders, view invoices, track shipments

### 🏪 Vendor Features
- **Vendor Dashboard** - Complete order and product management
- **Product Management** - CRUD operations with variant support
- **Order Processing** - Update order status, manage fulfillment
- **Analytics** - Sales overview and performance metrics

### 🇩🇪 German Market Compliance
- **GDPR Compliant** - Full privacy policy and data protection
- **EUR Pricing** - All prices in Euros with 19% VAT included
- **Legal Pages** - Professional Terms & Conditions, Privacy Policy
- **Widerrufsrecht** - 14-day withdrawal right for EU consumers

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Custom component library with Radix UI primitives
- **Icons:** Heroicons
- **Animations:** Framer Motion
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod validation

### Backend
- **Runtime:** Next.js API Routes
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Payment:** Stripe SDK
- **Email:** Resend (transactional emails)

### DevOps & Tools
- **Hosting:** Vercel
- **Database Hosting:** Supabase (Free Tier)
- **Version Control:** Git/GitHub
- **Package Manager:** npm/pnpm
- **Code Quality:** ESLint, Prettier

## 📁 Project Structure

```
techvault/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                     # Static assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes
│   │   ├── (auth)/           # Auth pages (sign in/up)
│   │   ├── account/          # User dashboard
│   │   ├── cart/             # Shopping cart
│   │   ├── checkout/         # Checkout flow
│   │   ├── orders/           # Order details
│   │   ├── products/         # Product pages
│   │   ├── vendor/           # Vendor dashboard
│   │   ├── privacy/          # Privacy policy
│   │   ├── terms/            # Terms & conditions
│   │   └── layout.tsx        # Root layout
│   ├── components/
│   │   ├── layout/           # Header, Footer, Navigation
│   │   ├── products/         # Product components
│   │   ├── cart/             # Cart components
│   │   ├── checkout/         # Checkout components
│   │   └── ui/               # Reusable UI components
│   ├── lib/
│   │   ├── prisma.ts         # Prisma client
│   │   ├── auth.ts           # Auth configuration
│   │   └── utils.ts          # Utility functions
│   ├── store/                # Zustand stores
│   └── types/                # TypeScript types
├── .env.local                # Environment variables
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database (or Supabase account)
- Stripe account (test mode)
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/techvault.git
cd techvault
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Optional)
RESEND_API_KEY="re_..."
```

4. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed database with sample data
npx prisma db seed
```

5. **Run the development server**
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

The application uses the following main models:

- **User** - Customer and vendor accounts
- **Product** - Product catalog with variants
- **ProductVariant** - Product variations (color, storage, etc.)
- **Cart** - Shopping cart items
- **Order** - Customer orders
- **OrderItem** - Individual order items
- **Review** - Product reviews and ratings
- **Wishlist** - Saved products
- **Address** - User shipping addresses

## 🔐 Authentication Flow

TechVault supports multiple authentication methods:

1. **Email/Password** - Traditional authentication with secure password hashing
2. **Google OAuth** - One-click sign-in with Google
3. **Guest Checkout** - Purchase without account creation

All sessions are managed securely with NextAuth.js and encrypted JWT tokens.

## 💳 Payment Integration

### Stripe Setup

1. Create a Stripe account and get your API keys
2. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Configure webhook events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Add webhook secret to environment variables

### Supported Payment Methods
- Credit/Debit Cards (Visa, Mastercard, Amex)
- SEPA Direct Debit (EU customers)
- Additional methods via Stripe Payment Element

## 🎨 Design System

TechVault uses a minimal, professional design inspired by Apple's aesthetic:

- **Colors:** Clean white backgrounds with black text, subtle gray borders
- **Typography:** System fonts with careful hierarchy
- **Components:** Reusable UI components in `/src/components/ui/`
- **Icons:** Heroicons for consistent iconography
- **Animations:** Subtle micro-interactions with Framer Motion

### Design Principles
- ✅ Small, readable text sizes
- ✅ Generous whitespace
- ✅ Skeleton loading (no circular loaders)
- ✅ Hover states with cursor pointer
- ✅ Mobile-first responsive design

## 📱 Responsive Design

Fully responsive across all devices:
- 📱 Mobile: 320px - 640px
- 📱 Tablet: 641px - 1024px
- 💻 Desktop: 1025px+

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linter
npm run lint

# Format code
npm run format
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Environment Variables for Production
Ensure all environment variables are set in your Vercel project settings.

## 🔒 Security Features

- ✅ CSRF protection with NextAuth
- ✅ SQL injection prevention with Prisma
- ✅ XSS protection with React
- ✅ Secure password hashing with bcrypt
- ✅ HTTPS only in production
- ✅ Environment variable validation
- ✅ Rate limiting on API routes
- ✅ Input validation with Zod

## 🌍 Internationalization

Currently supports:
- 🇩🇪 German market (EUR, German legal requirements)
- 🇪🇺 EU compliance (GDPR, Widerrufsrecht)

Future plans for multi-language support.

## 📈 Performance Optimizations

- ⚡ Next.js Image optimization
- ⚡ Static page generation where possible
- ⚡ Database query optimization with Prisma
- ⚡ Code splitting and lazy loading
- ⚡ CDN delivery via Vercel
- ⚡ Efficient bundle size (<500KB JS)

## 🐛 Known Issues & Limitations

- Payment processing is in test mode
- Email notifications require Resend API key
- Some features are MVP-level (to be enhanced)

## 🗺️ Roadmap

- [ ] Admin dashboard for platform management
- [ ] AI-powered customer support chatbot
- [ ] Advanced analytics and reporting
- [ ] Multi-language support (English, German)
- [ ] Mobile apps (iOS/Android)
- [ ] Advanced search with Algolia
- [ ] Product recommendations engine
- [ ] Inventory management system

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting platform
- Stripe for payment infrastructure
- Supabase for database hosting
- Tailwind CSS for styling utilities
- Heroicons for beautiful icons

## 📞 Support

For questions or support, please open an issue on GitHub or contact via email.

---

**Built with ❤️ in Heilbronn, Germany**

**Status:** ✅ Production Ready | 🚀 Actively Developed