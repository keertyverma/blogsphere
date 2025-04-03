const GooglePrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-center text-3xl font-bold">Privacy Policy</h1>
        <p className="text-center">Last updated: April 3, 2025</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold">1. Information We Collect</h2>
        <p className="ml-6">We collect personal information, including:</p>
        <ul className="list-disc pl-12">
          <li>Email address (for authentication)</li>
          <li>Display name and profile picture (for user account creation)</li>
          <li>
            Any additional information you choose to provide in your user
            profile
          </li>
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold">
          2. How We Use Your Information
        </h2>
        <p className="ml-6">We use the collected data to:</p>
        <ul className="list-disc pl-12">
          <li>Authenticate users and manage user accounts</li>
          <li>Display user information within the app</li>
          <li>Enhance user experience and improve our services</li>
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold">3. Data Sharing</h2>
        <p className="ml-6">
          We do not sell or share your personal data with third parties, except
          as required by law or to facilitate authentication (e.g., Firebase
          Authentication).
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold">4. Data Security</h2>
        <p className="ml-6">
          We take appropriate security measures to protect your information
          against unauthorized access, alteration, or destruction.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold ">5. Your Choices and Rights</h2>
        <p className="ml-6">You have the right to:</p>
        <ul className="list-disc pl-12">
          <li>Update or delete your profile information</li>
          <li>Request account deletion</li>
          <li>Contact us for any privacy concerns</li>
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold ">6. Contact Us</h2>
        <p className="ml-6">
          If you have any questions about this Privacy Policy, please contact us
          at:
          <a href="mailto:0k@360verse.co" className="text-blue-600">
            {" "}
            0k@360verse.co
          </a>
        </p>
      </div>
    </div>
  );
};

export default GooglePrivacyPolicy;
