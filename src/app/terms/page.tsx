// src/app/terms/page.tsx
import Link from "next/link";

export default function TermsAndConditions() {
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
            Terms and Conditions
          </h1>
          <p className="text-sm text-gray-600">Last updated: October 1, 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              1. Agreement to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms and Conditions (&quot;Terms&quot;) constitute a legally binding
              agreement between you and TechVault GmbH (&quot;TechVault,&quot; &quot;we,&quot; &quot;us,&quot;
              or &quot;our&quot;) regarding your use of our e-commerce platform and
              services. By accessing or using our website, you agree to be bound
              by these Terms. If you do not agree to these Terms, please do not
              use our services.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              These Terms apply to all visitors, users, and customers of our
              platform.
            </p>
          </section>

          {/* Company Information */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              2. Company Information
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
              <p className="text-gray-700">
                <strong>TechVault GmbH</strong>
              </p>
              <p className="text-gray-700">Musterstraße 123</p>
              <p className="text-gray-700">69115 Heidelberg, Germany</p>
              <p className="text-gray-700 mt-2">
                Registration: HRB 123456, Amtsgericht Heidelberg
              </p>
              <p className="text-gray-700">VAT ID: DE123456789</p>
              <p className="text-gray-700 mt-2">Email: techvault.onlinestore@gmail.com</p>
              <p className="text-gray-700">Phone: +49 (0) 6221 123456</p>
            </div>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              3. Eligibility
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              To use our services, you must:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>
                Be at least 18 years of age or the age of legal majority in your
                jurisdiction
              </li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>
                Not be prohibited from using our services under applicable laws
              </li>
              <li>Provide accurate and complete registration information</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              By creating an account, you represent and warrant that you meet
              these eligibility requirements.
            </p>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              4. Account Registration and Security
            </h2>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              4.1 Account Creation
            </h3>
            <p className="text-gray-700 leading-relaxed">
              You may create an account using email/password or third-party
              authentication (Google OAuth). You are responsible for maintaining
              the confidentiality of your account credentials and all activities
              under your account.
            </p>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              4.2 Account Security
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>
                You must notify us immediately of any unauthorized access or
                security breach
              </li>
              <li>
                You are solely responsible for all activities conducted through
                your account
              </li>
              <li>
                We reserve the right to suspend or terminate accounts that
                violate these Terms
              </li>
              <li>You must not share your account credentials with others</li>
            </ul>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              4.3 Account Information
            </h3>
            <p className="text-gray-700 leading-relaxed">
              You agree to provide accurate, current, and complete information
              during registration and to update such information as necessary.
              False or misleading information may result in account termination.
            </p>
          </section>

          {/* Products and Services */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              5. Products and Services
            </h2>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              5.1 Product Information
            </h3>
            <p className="text-gray-700 leading-relaxed">
              We strive to display product information accurately, including
              descriptions, specifications, pricing, and availability. However,
              we do not warrant that product descriptions or other content is
              error-free, complete, or current. Product images are for
              illustration purposes and may not reflect the exact appearance of
              the product.
            </p>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              5.2 Pricing
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>
                All prices are displayed in Euros (EUR) and include German VAT
                (19%)
              </li>
              <li>Prices are subject to change without notice</li>
              <li>We reserve the right to correct pricing errors</li>
              <li>
                Shipping costs are calculated separately and displayed at
                checkout
              </li>
            </ul>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              5.3 Product Availability
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Product availability is subject to change. We reserve the right to
              discontinue products or limit quantities. If a product becomes
              unavailable after you place an order, we will notify you and
              provide a full refund.
            </p>
          </section>

          {/* Orders and Payment */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              6. Orders and Payment
            </h2>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              6.1 Order Process
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>
                Placing an order constitutes an offer to purchase products
              </li>
              <li>We reserve the right to accept or decline any order</li>
              <li>
                Order confirmation does not guarantee product availability
              </li>
              <li>
                A binding contract is formed when we ship the product or confirm
                availability
              </li>
            </ul>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              6.2 Payment Methods
            </h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              We accept the following payment methods through Stripe:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>
                Credit and debit cards (Visa, Mastercard, American Express)
              </li>
              <li>SEPA Direct Debit (for EU customers)</li>
              <li>Other local payment methods as available</li>
            </ul>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              6.3 Payment Security
            </h3>
            <p className="text-gray-700 leading-relaxed">
              All payments are processed securely through Stripe, a PCI-DSS
              compliant payment processor. We do not store your complete payment
              card information on our servers.
            </p>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              6.4 Payment Authorization
            </h3>
            <p className="text-gray-700 leading-relaxed">
              By providing payment information, you authorize us to charge the
              total amount displayed at checkout. If payment is declined, we
              reserve the right to cancel your order.
            </p>
          </section>

          {/* Shipping and Delivery */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              7. Shipping and Delivery
            </h2>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              7.1 Shipping Areas
            </h3>
            <p className="text-gray-700 leading-relaxed">
              We currently ship to addresses within Germany and the European
              Union. Shipping restrictions may apply to certain products or
              destinations.
            </p>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              7.2 Delivery Times
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Estimated delivery times are provided at checkout and begin from
              the date of order confirmation. Delivery times are estimates only
              and may vary due to factors beyond our control. We are not liable
              for delays caused by courier services or customs procedures.
            </p>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              7.3 Risk of Loss
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Title and risk of loss pass to you upon delivery to the shipping
              address. You are responsible for inspecting products upon delivery
              and reporting any damage within 48 hours.
            </p>
          </section>

          {/* Right of Withdrawal (Widerrufsrecht) */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              8. Right of Withdrawal (EU Consumer Rights)
            </h2>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              8.1 Withdrawal Period
            </h3>
            <p className="text-gray-700 leading-relaxed">
              As a consumer in the EU, you have the right to withdraw from a
              purchase within 14 days without giving any reason, in accordance
              with EU Consumer Rights Directive 2011/83/EU and German BGB § 355.
            </p>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              8.2 How to Exercise Withdrawal Right
            </h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              To exercise your right of withdrawal, you must inform us of your
              decision by:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Email: techvault.onlinestore@gmail.com</li>
              <li>Using the withdrawal form available on our website</li>
              <li>
                Any other unambiguous statement expressing your wish to withdraw
              </li>
            </ul>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              8.3 Return Conditions
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>
                Products must be returned in original condition with all
                packaging and accessories
              </li>
              <li>
                You must return the goods within 14 days of notifying us of
                withdrawal
              </li>
              <li>
                You bear the direct cost of returning the goods unless otherwise
                agreed
              </li>
              <li>
                We will refund all payments within 14 days of receiving the
                returned goods
              </li>
            </ul>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              8.4 Exceptions to Withdrawal Right
            </h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              The right of withdrawal does not apply to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>
                Products sealed for hygiene reasons that have been unsealed
              </li>
              <li>Digital products that have been downloaded or streamed</li>
              <li>Customized or personalized products</li>
              <li>Products that deteriorate rapidly or expire quickly</li>
            </ul>
          </section>

          {/* Warranty and Returns */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              9. Warranty and Defects
            </h2>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              9.1 Statutory Warranty (Gewährleistung)
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Products are covered by a statutory warranty period of 24 months
              from delivery (German BGB § 437). We warrant that products are
              free from defects in materials and workmanship under normal use.
            </p>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              9.2 Manufacturer Warranty
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Many products include a manufacturer&apos;s warranty. Terms and
              conditions of manufacturer warranties are provided with the
              product and are subject to the manufacturer&apos;s policies.
            </p>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              9.3 Reporting Defects
            </h3>
            <p className="text-gray-700 leading-relaxed">
              To report a defect, contact our customer service at
              techvault.onlinestore@gmail.com within a reasonable time after discovery. We
              will assess the claim and provide repair, replacement, or refund
              as appropriate under applicable law.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              10. Intellectual Property Rights
            </h2>
            <p className="text-gray-700 leading-relaxed">
              All content on our platform, including text, graphics, logos,
              images, software, and design, is the property of TechVault or its
              licensors and is protected by German and international copyright,
              trademark, and other intellectual property laws.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3 mb-2">
              You may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>
                Copy, reproduce, or distribute our content without written
                permission
              </li>
              <li>Use our trademarks or branding without authorization</li>
              <li>Create derivative works based on our content</li>
              <li>Reverse engineer or decompile our software or systems</li>
            </ul>
          </section>

          {/* User Content and Reviews */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              11. User Content and Product Reviews
            </h2>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              11.1 Your Content
            </h3>
            <p className="text-gray-700 leading-relaxed">
              You may submit product reviews, ratings, and other content (&quot;User
              Content&quot;). By submitting User Content, you grant us a
              non-exclusive, worldwide, royalty-free license to use, reproduce,
              modify, and display such content in connection with our services.
            </p>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              11.2 Content Standards
            </h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              User Content must not:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Contain false, misleading, or defamatory information</li>
              <li>Violate intellectual property rights or privacy rights</li>
              <li>Contain offensive, obscene, or inappropriate material</li>
              <li>Include spam, advertising, or promotional content</li>
              <li>Violate applicable laws or regulations</li>
            </ul>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              11.3 Content Moderation
            </h3>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to remove, edit, or refuse to publish any
              User Content that violates these Terms or is otherwise
              objectionable. We are not responsible for User Content and do not
              endorse any opinions expressed by users.
            </p>
          </section>

          {/* Prohibited Uses */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              12. Prohibited Uses
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>
                Use our services for any unlawful purpose or in violation of
                these Terms
              </li>
              <li>
                Interfere with or disrupt the security or operation of our
                platform
              </li>
              <li>
                Attempt to gain unauthorized access to our systems or data
              </li>
              <li>
                Use automated systems (bots, scrapers) without our written
                consent
              </li>
              <li>
                Impersonate any person or entity or misrepresent your
                affiliation
              </li>
              <li>Transmit viruses, malware, or other harmful code</li>
              <li>
                Engage in fraudulent activities or payment disputes in bad faith
              </li>
              <li>
                Resell products for commercial purposes without authorization
              </li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              13. Limitation of Liability
            </h2>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              13.1 General Limitations
            </h3>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by German law, we are not liable
              for indirect, incidental, special, consequential, or punitive
              damages, including loss of profits, data, or business
              opportunities.
            </p>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              13.2 Statutory Liability
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Nothing in these Terms excludes or limits our liability for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mt-2">
              <li>Death or personal injury caused by our negligence</li>
              <li>Fraud or fraudulent misrepresentation</li>
              <li>Defects we fraudulently concealed</li>
              <li>
                Other matters where liability cannot be excluded under German
                law
              </li>
            </ul>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              13.3 Service Availability
            </h3>
            <p className="text-gray-700 leading-relaxed">
              We do not guarantee uninterrupted or error-free service. We may
              suspend or modify our services for maintenance or other reasons
              without liability.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              14. Third-Party Services and Links
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our platform may contain links to third-party websites or
              integrate third-party services (payment processors, shipping
              providers). We are not responsible for the content, privacy
              practices, or terms of third-party services. Your use of
              third-party services is subject to their terms and conditions.
            </p>
          </section>

          {/* Data Protection */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              15. Data Protection and Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our collection and use of personal data is governed by our{" "}
              <Link
                href="/privacy"
                className="text-black underline hover:text-gray-700 transition-colors cursor-pointer"
              >
                Privacy Policy
              </Link>
              , which complies with GDPR and German data protection laws. By
              using our services, you consent to our data practices as described
              in the Privacy Policy.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              16. Dispute Resolution
            </h2>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              16.1 Governing Law
            </h3>
            <p className="text-gray-700 leading-relaxed">
              These Terms are governed by the laws of the Federal Republic of
              Germany, excluding the UN Convention on Contracts for the
              International Sale of Goods (CISG). For consumers, mandatory
              consumer protection laws of their country of residence remain
              applicable.
            </p>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              16.2 Jurisdiction
            </h3>
            <p className="text-gray-700 leading-relaxed">
              For merchants and business customers, the exclusive place of
              jurisdiction is Heidelberg, Germany. For consumers, statutory
              provisions regarding jurisdiction apply.
            </p>

            <h3 className="text-base font-medium text-black mb-2 mt-4">
              16.3 Online Dispute Resolution (ODR)
            </h3>
            <p className="text-gray-700 leading-relaxed">
              The European Commission provides an Online Dispute Resolution
              platform at{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black underline hover:text-gray-700 transition-colors cursor-pointer"
              >
                ec.europa.eu/consumers/odr
              </a>
              . We are not obligated to participate in dispute resolution
              proceedings before consumer arbitration boards, but we are willing
              to do so.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              17. Termination
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may terminate or suspend your account and access to our
              services immediately, without prior notice, for any breach of
              these Terms. You may terminate your account at any time by
              contacting customer service. Upon termination, your right to use
              our services ceases immediately.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Provisions that by their nature should survive termination
              (including warranty disclaimers, limitation of liability, and
              dispute resolution) will remain in effect.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              18. Changes to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. Changes
              will be posted on this page with an updated &quot;Last updated&quot; date.
              Material changes will be communicated to registered users via
              email. Your continued use of our services after changes
              constitutes acceptance of the modified Terms.
            </p>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              19. Severability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If any provision of these Terms is found to be invalid or
              unenforceable under applicable law, such provision will be
              modified to reflect the parties intention or eliminated to the
              minimum extent necessary, and the remaining provisions will
              continue in full force and effect.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">
              20. Contact Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              For questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
              <p className="text-gray-700">
                <strong>TechVault GmbH</strong>
              </p>
              <p className="text-gray-700">Customer Service</p>
              <p className="text-gray-700 mt-2">Email: techvault.onlinestore@gmail.com</p>
              <p className="text-gray-700">Phone: +49 (0) 6221 123456</p>
              <p className="text-gray-700">Mon-Fri: 9:00-18:00 CET</p>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            These terms comply with German BGB (Civil Code), EU Consumer Rights
            Directive 2011/83/EU, and applicable German commercial law
          </p>
        </div>
      </div>
    </div>
  );
}
