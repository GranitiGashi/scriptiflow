export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Terms and Conditions
        </h1>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using our marketing automation services, you
              accept and agree to be bound by the terms and provision of this
              agreement. If you do not agree to abide by the above, please do
              not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              2. Service Description
            </h2>
            <p>
              Our company provides marketing automation solutions specifically
              designed for car dealerships. Our services include but are not
              limited to: automated email campaigns, lead management, customer
              relationship management, and analytics reporting.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              3. User Responsibilities
            </h2>
            <p className="mb-4">Users of our service agree to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                Provide accurate and complete information when setting up
                accounts
              </li>
              <li>Maintain the security of login credentials</li>
              <li>
                Use the service in compliance with all applicable laws and
                regulations
              </li>
              <li>
                Not use the service for spam or unsolicited communications
              </li>
              <li>Respect intellectual property rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              4. Payment Terms
            </h2>
            <p>
              Payment for services is due according to the billing cycle
              selected during signup. All fees are non-refundable unless
              otherwise specified. We reserve the right to suspend or terminate
              service for non-payment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              5. Data Usage and Privacy
            </h2>
            <p>
              We collect and process data in accordance with our Privacy Policy.
              By using our service, you consent to the collection and use of
              information as outlined in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              6. Service Availability
            </h2>
            <p>
              While we strive to maintain 99.9% uptime, we do not guarantee
              uninterrupted service. Scheduled maintenance will be communicated
              in advance when possible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              7. Limitation of Liability
            </h2>
            <p>
              Our liability is limited to the amount paid for services in the
              preceding 12 months. We are not liable for indirect, incidental,
              or consequential damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              8. Intellectual Property
            </h2>
            <p>
              All content, features, and functionality of our service are owned
              by us and are protected by copyright, trademark, and other
              intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              9. Termination
            </h2>
            <p>
              Either party may terminate the service agreement with 30 days
              written notice. We reserve the right to terminate immediately for
              breach of terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              10. Modifications
            </h2>
            <p>
              We reserve the right to modify these terms at any time. Users will
              be notified of significant changes via email or service
              notifications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              11. Governing Law
            </h2>
            <p>
              These terms are governed by the laws of [Your State/Country]. Any
              disputes will be resolved in the courts of [Your Jurisdiction].
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              12. Contact Information
            </h2>
            <p>
              For questions about these Terms and Conditions, please contact us
              at:
              <br />
              Email: legal@yourcompany.com
              <br />
              Phone: [Your Phone Number]
              <br />
              Address: [Your Business Address]
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
