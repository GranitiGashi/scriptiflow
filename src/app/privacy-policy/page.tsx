import React from "react";

export default function PrivacyPolicy(): JSX.Element {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Privacy Policy
        </h1>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              1. Information We Collect
            </h2>
            <p className="mb-4">
              We collect information you provide directly to us, such as:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Account registration information (name, email, company details)</li>
              <li>Payment and billing information</li>
              <li>Customer data you upload to our platform</li>
              <li>Communications with our support team</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              2. How We Use Your Information
            </h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide and maintain our marketing automation services</li>
              <li>Process payments and send billing notifications</li>
              <li>Communicate with you about your account and our services</li>
              <li>Improve our services and develop new features</li>
              <li>Comply with legal obligations</li>
              <li>Protect against fraud and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              3. Information Sharing
            </h2>
            <p className="mb-4">
              We do not sell, trade, or rent your personal information. We may
              share information in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>With your explicit consent</li>
              <li>With service providers who assist in our operations</li>
              <li>To comply with legal requirements or court orders</li>
              <li>To protect our rights, property, or safety</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              4. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. This includes encryption,
              secure servers, and regular security audits.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              5. Data Retention
            </h2>
            <p>
              We retain your personal information for as long as necessary to
              provide our services and fulfill the purposes outlined in this
              policy. When you terminate your account, we will delete or
              anonymize your data within 90 days, unless required to retain it
              for legal purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              6. Your Rights
            </h2>
            <p className="mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate data</li>
              <li>Deletion of your personal information</li>
              <li>Restriction of processing</li>
              <li>Data portability</li>
              <li>Objection to processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              7. Cookies and Tracking
            </h2>
            <p>
              We use cookies and similar technologies to enhance your
              experience, analyze usage patterns, and improve our services. You
              can control cookie settings through your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              8. Third-Party Services
            </h2>
            <p>
              Our service may integrate with third-party applications and
              services. This privacy policy does not cover the privacy practices
              of these third parties. We encourage you to review their privacy
              policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              9. International Data Transfers
            </h2>
            <p>
              Your information may be transferred to and processed in countries
              other than your own. We ensure appropriate safeguards are in place
              to protect your data during such transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              10. Children's Privacy
            </h2>
            <p>
              Our services are not intended for children under 13 years of age.
              We do not knowingly collect personal information from children
              under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              11. California Privacy Rights
            </h2>
            <p>
              California residents have additional rights under the California
              Consumer Privacy Act (CCPA), including the right to know what
              personal information is collected and the right to delete personal
              information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              12. GDPR Compliance
            </h2>
            <p>
              For users in the European Union, we comply with the General Data
              Protection Regulation (GDPR). Our lawful basis for processing
              includes consent, contract performance, and legitimate interests.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              13. Changes to This Policy
            </h2>
            <p>
              We may update this privacy policy from time to time. We will
              notify you of any material changes by email or through our
              service. Your continued use of our services after such
              modifications constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              14. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy or our data
              practices, please contact us at:
              <br />
              Email: granit.g4shii@gmail.com
              <br />
              Phone: {"+38344885500"}
              <br />
              Address: {"Prishtine, Kosovo"}
              <br />
              {/* Data Protection Officer: dpo@yourcompany.com */}
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Last updated: {new Date().toLocaleDateString("en-US")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
