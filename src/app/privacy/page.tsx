// src/app/privacy/page.tsx
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-black transition-colors cursor-pointer inline-flex items-center gap-1 mb-4"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl font-semibold text-black mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-600">Last updated: October 1, 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              1. Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              TechVault (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you visit our
              e-commerce platform. This policy complies with the EU General Data
              Protection Regulation (GDPR) and applicable German data protection
              laws.
            </p>
          </section>

          {/* Data Controller */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              2. Data Controller
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              The data controller responsible for your personal data is:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
              <p className="text-gray-700">
                <strong>TechVault GmbH</strong>
              </p>
              <p className="text-gray-700">Musterstraße 123</p>
              <p className="text-gray-700">69115 Heidelberg, Germany</p>
              <p className="text-gray-700 mt-2">Email: techvault.onlinestore@gmail.com</p>
              <p className="text-gray-700">Phone: +49 (0) 6221 123456</p>
            </div>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              3. Information We Collect
            </h2>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              3.1 Personal Information
            </h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              We collect information that you provide directly to us:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Name, email address, and phone number</li>
              <li>Shipping and billing addresses</li>
              <li>Payment information (processed securely via Stripe)</li>
              <li>Account credentials (encrypted passwords)</li>
              <li>Order history and purchase information</li>
              <li>Product reviews and ratings</li>
              <li>Customer support communications</li>
            </ul>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              3.2 Automatically Collected Information
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>IP address and browser type</li>
              <li>Device information and operating system</li>
              <li>Pages visited and time spent on our site</li>
              <li>Referring website addresses</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              3.3 Third-Party Authentication
            </h3>
            <p className="text-gray-700 leading-relaxed">
              If you choose to sign in using Google OAuth, we receive your name,
              email address, and profile picture from Google. We do not receive
              your Google password.
            </p>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              4. How We Use Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              We use your information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>
                <strong>Order Processing:</strong> To process and fulfill your
                orders, send order confirmations, and provide customer support
              </li>
              <li>
                <strong>Account Management:</strong> To create and manage your
                user account
              </li>
              <li>
                <strong>Communication:</strong> To send transactional emails
                (order updates, shipping notifications)
              </li>
              <li>
                <strong>Payment Processing:</strong> To process payments
                securely through Stripe
              </li>
              <li>
                <strong>Customer Support:</strong> To respond to your inquiries
                and provide AI-powered chatbot assistance
              </li>
              <li>
                <strong>Legal Compliance:</strong> To comply with applicable
                laws and regulations
              </li>
              <li>
                <strong>Fraud Prevention:</strong> To detect and prevent
                fraudulent transactions
              </li>
              <li>
                <strong>Service Improvement:</strong> To analyze usage patterns
                and improve our services
              </li>
            </ul>
          </section>

          {/* Legal Basis for Processing */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              5. Legal Basis for Processing (GDPR)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              We process your personal data based on:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>
                <strong>Contract Performance:</strong> Processing necessary to
                fulfill our contract with you (Art. 6(1)(b) GDPR)
              </li>
              <li>
                <strong>Consent:</strong> Where you have given explicit consent
                (Art. 6(1)(a) GDPR)
              </li>
              <li>
                <strong>Legal Obligation:</strong> Compliance with legal
                requirements (Art. 6(1)(c) GDPR)
              </li>
              <li>
                <strong>Legitimate Interest:</strong> For fraud prevention and
                service improvement (Art. 6(1)(f) GDPR)
              </li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              6. How We Share Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              We share your information only with:
            </p>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              6.1 Service Providers
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>
                <strong>Stripe:</strong> Payment processing (PCI-DSS compliant)
              </li>
              <li>
                <strong>Supabase:</strong> Database hosting and management
              </li>
              <li>
                <strong>Vercel:</strong> Website hosting and delivery
              </li>
              <li>
                <strong>Email Service Provider:</strong> Transactional email
                delivery
              </li>
            </ul>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              6.2 Legal Requirements
            </h3>
            <p className="text-gray-700 leading-relaxed">
              We may disclose your information if required by law, court order,
              or government request, or to protect our rights and safety.
            </p>

            <p className="text-gray-700 leading-relaxed mt-3">
              <strong>
                We never sell your personal information to third parties.
              </strong>
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              7. Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              We implement appropriate security measures including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>SSL/TLS encryption for data transmission</li>
              <li>
                Encrypted password storage using industry-standard hashing
              </li>
              <li>Secure database access controls</li>
              <li>Regular security audits and updates</li>
              <li>PCI-DSS compliant payment processing via Stripe</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              While we strive to protect your data, no method of transmission
              over the internet is 100% secure. We cannot guarantee absolute
              security.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              8. Data Retention
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal data only as long as necessary for the
              purposes outlined in this policy:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mt-2">
              <li>
                <strong>Account Data:</strong> Until account deletion or 3 years
                of inactivity
              </li>
              <li>
                <strong>Order Data:</strong> 10 years for tax and legal
                compliance (German HGB)
              </li>
              <li>
                <strong>Marketing Consent:</strong> Until consent is withdrawn
              </li>
              <li>
                <strong>Support Communications:</strong> 3 years after
                resolution
              </li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              9. Your Rights (GDPR)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              Under GDPR, you have the following rights:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>
                <strong>Right of Access:</strong> Request a copy of your
                personal data
              </li>
              <li>
                <strong>Right to Rectification:</strong> Correct inaccurate or
                incomplete data
              </li>
              <li>
                <strong>Right to Erasure:</strong> Request deletion of your data
                (&quot;right to be forgotten&quot;)
              </li>
              <li>
                <strong>Right to Restriction:</strong> Limit how we use your
                data
              </li>
              <li>
                <strong>Right to Data Portability:</strong> Receive your data in
                a structured format
              </li>
              <li>
                <strong>Right to Object:</strong> Object to processing based on
                legitimate interest
              </li>
              <li>
                <strong>Right to Withdraw Consent:</strong> Withdraw consent at
                any time
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              To exercise these rights, please contact us at{" "}
              <strong>techvault.onlinestore@gmail.com</strong>. We will respond within 30
              days.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              10. Cookies and Tracking
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              We use cookies and similar technologies for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>
                <strong>Essential Cookies:</strong> Required for authentication
                and shopping cart functionality
              </li>
              <li>
                <strong>Performance Cookies:</strong> To analyze site usage and
                improve performance
              </li>
              <li>
                <strong>Functional Cookies:</strong> To remember your
                preferences
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              You can control cookie settings through your browser. Disabling
              essential cookies may affect site functionality.
            </p>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              11. International Data Transfers
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Some of our service providers (Stripe, Vercel) may process
              data outside the EU. We ensure appropriate safeguards are in
              place, including Standard Contractual Clauses (SCCs) and adequacy
              decisions where applicable.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              12. Children&apos;s Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our services are not directed to individuals under 16 years of
              age. We do not knowingly collect personal information from
              children. If you believe we have collected information from a
              child, please contact us immediately.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              13. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy periodically. Changes will be
              posted on this page with an updated &quot;Last updated&quot; date. Material
              changes will be communicated via email to registered users.
            </p>
          </section>

          {/* Contact & Complaints */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              14. Contact Us & Complaints
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              For privacy-related inquiries or to exercise your rights:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
              <p className="text-gray-700">
                <strong>Data Protection Officer</strong>
              </p>
              <p className="text-gray-700">Email: techvault.onlinestore@gmail.com</p>
              <p className="text-gray-700">Phone: +49 (0) 6221 123456</p>
            </div>
            <p className="text-gray-700 leading-relaxed mt-3">
              You also have the right to lodge a complaint with the German data
              protection authority:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm mt-2">
              <p className="text-gray-700">
                <strong>
                  Der Landesbeauftragte für den Datenschutz Baden-Württemberg
                </strong>
              </p>
              <p className="text-gray-700">Lautenschlagerstraße 20</p>
              <p className="text-gray-700">70173 Stuttgart, Germany</p>
              <p className="text-gray-700 mt-2">
                Website: www.baden-wuerttemberg.datenschutz.de
              </p>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            This privacy policy is compliant with GDPR (EU) 2016/679 and German
            BDSG (Federal Data Protection Act)
          </p>
        </div>
      </div>
    </div>
  );
}
