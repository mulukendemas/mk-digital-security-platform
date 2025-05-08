import React from 'react';

interface IdentificationSolutionDetailProps {
  description: string;
}

export const IdentificationSolutionDetail: React.FC<IdentificationSolutionDetailProps> = ({ description }) => {
  // Check if the description is the short version (one sentence)
  const isShortDescription = !description.includes('Biometrics authentication') &&
                             !description.includes('e-KYC solution');

  // If it's the short description, use the default detailed content
  if (isShortDescription) {
    return (
      <div className="text-gray-700">
        <h3 className="text-2xl font-bold text-mkdss-blue mt-6 mb-4">Biometrics authentication - solutions</h3>
        <ul className="list-disc pl-6 mb-6">
          <li>MK ABIS solution is a set of procedures that enables organizations to check and verify customers' identification based on biometric factors such as fingerprint and/or facial recognition as well as their ID documents.</li>
          <li>This solution will not only safeguard personal identity, prevent frauds and data skimming but also help improve customer services effectively.</li>
          <li>Suitable for eID, ePassport, social insurance cards, etc., following the trend of e-citizens, e-government</li>
        </ul>

        <h3 className="text-2xl font-bold text-mkdss-blue mt-8 mb-4">e-KYC solution</h3>
        <p className="mb-2"><strong>Applicable for:</strong> Finance-Banking, Enterprises</p>
        <p className="mb-4">
          MK eKYC solution is a set of procedures that enables organizations to check and verify customer's identification
          based on biometric factors such as fingerprint and/or facial recogition as well as their ID documents.
        </p>
        <p className="mb-6">
          This solution will not only safeguard personal identity, prevent frauds and data skimming but also help
          improve customer services effetively.
        </p>

        <h3 className="text-2xl font-bold text-mkdss-blue mt-8 mb-4">OTP authentication solution</h3>
        <ul className="list-disc pl-6 mb-6">
          <li>KeyPass™ OTP solution enables organizations to protect the customers' identities for e-commerce, e-banking and other online transactions.</li>
          <li>This solution supports multiple token types and authentication modes to meet different security requirements of all the organizations.</li>
          <li>Including: OTP display card, OTP token, OTP software token, Challenge-Response token, USB OTP token, SMS token and SIM OTP sticker.</li>
        </ul>

        <h3 className="text-2xl font-bold text-mkdss-blue mt-8 mb-4">Match-on-Card (MoC) solution</h3>
        <p className="mb-4">
          MoC is the concept of both matching and storing fingerprints on a smart card. In addition to its match speed and reliability,
          Match-on-Card™ offers flexibility and efficiency as it available with most smart card on the market today.
        </p>
        <p className="mb-6">
          With partner, Precise Biometrics (Sweden), MK Gkroup provides secure authentication biometric solution on smart card
          MoC (Match-on-Card™) for almost fields, such identification, healthcare, tourist, transport and others.
        </p>

        <h4 className="text-xl font-semibold text-mkdss-blue mt-6 mb-2">Truly personal ID cards</h4>
        <p className="mb-4">
          Fingerprint recognition adds value to a wide range of applications and services for an ID card as it establishes
          the physical presences of the individual.
        </p>

        <h4 className="text-xl font-semibold text-mkdss-blue mt-6 mb-2">Financial Card</h4>
        <p className="mb-4">
          Fingerprint recognition ensures the physical presence of the cardholder while complying with security demands.
          Precise Match-on-Card™ eliminates the need for numerous PINs, that are easily forgotten, lost or stolen, as we
          carry more and more cards.
        </p>
        <p className="mb-4">
          As no storing or matching of fingerprint information takes place outside the card there is no need for any
          network-connected device or data base. This also means that the personal integrity of the bank card holder
          is always preserved.
        </p>

        <h4 className="text-xl font-semibold text-mkdss-blue mt-6 mb-2">Healthcare</h4>
        <p className="mb-4">
          Adding Precise Match-on-Card™ with fingerprint recognition to health cards does not only reduce these risks,
          it also protects the personal integrity of the card holder.
        </p>

        <h4 className="text-xl font-semibold text-mkdss-blue mt-6 mb-2">Travel & Transport</h4>
        <p className="mb-4">
          Our fingerprint recognition technology speeds up passenger flow while fulfilling security requirements when
          the burden of security is ever increasing in both domestic and international travel.
        </p>
        <p className="mb-6">
          MoC is the concept of both matching and storing fingerprints on a smart card. In addition to its match speed
          and reliability, Match-on-Card™ offers flexibility and cost-effeciency as it available with most smart card
          on the market today.
        </p>

        <h3 className="text-2xl font-bold text-mkdss-blue mt-8 mb-4">2-Factor Authentication Solution</h3>
        <p className="mb-4">
          MK Group's FIDO® KeyPass S1 device uses no batteries and has a minimum lifespan of 10 years with 4 billion
          button presses. This will help organizations reduce the pressure of long-term equipment storage and charging.
        </p>
        <p className="mb-4">
          FIDO® KeyPass S1 security authentication key device meets FIDO U2F standard & supports FIDO2 feature, allowing
          network users (Internet, LAN, ...) to securely access online services that support this feature FIDO U2F without
          using any other software.
        </p>
        <p className="mb-4">
          MK Group's FIDO® KeyPass S3 secure authentication device meets the FIDO Alliance's FIDO 2 standard. In addition
          to physical buttons like the FIDO® KeyPass S1 device, FIDO® KeyPass S3 is also equipped with a screen that displays
          the data to be authenticated to increase safety and accuracy in the process of performing transactions. online activities.
        </p>
        <p className="mb-4">
          In addition, users of the FIDO® KeyPass S3 security key are also supported with application login without entering
          the account name and password, and support for multi-factor authentication.
        </p>
        <p className="mb-4">
          Accordingly, the user enters the PIN code before the security key authenticates the information and creates a digital
          signature. Thus, along with no need to install software, users can simply select the "set up a security key" mode
          available in all FIDO 2 acceptance sites (details on support pages).
        </p>
        <p className="mb-4">
          FIDO standard is available at: <a href="https://www.dongleauth.info/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://www.dongleauth.info/</a> to register the security key.
        </p>
      </div>
    );
  }

  // If it's the detailed description, format it nicely
  // First, try to parse the content into sections
  const sections = description.split('\n\n');

  // Check if the content has proper formatting with section headers
  const hasBiometricsSection = sections.some(s => s.includes('Biometrics authentication'));
  const hasEkycSection = sections.some(s => s.includes('e-KYC solution'));
  const hasOtpSection = sections.some(s => s.includes('OTP authentication'));
  const hasMocSection = sections.some(s => s.includes('Match-on-Card'));
  const has2FactorSection = sections.some(s => s.includes('2-Factor Authentication'));

  // If the content has proper section headers, format it with HTML
  if (hasBiometricsSection || hasEkycSection || hasOtpSection || hasMocSection || has2FactorSection) {
    // Process the content to add proper HTML formatting
    const formattedContent = sections.map(section => {
      // Handle section headers
      if (section.includes('Biometrics authentication')) {
        return (
          <div key="biometrics">
            <h3 className="text-2xl font-bold text-mkdss-blue mt-6 mb-4">Biometrics authentication - solutions</h3>
            {section.split('\n').map((line, i) => {
              if (line.trim().startsWith('•')) {
                return <li key={i} className="ml-6 mb-2">{line.trim().substring(1).trim()}</li>;
              }
              return null;
            }).filter(Boolean)}
          </div>
        );
      }

      if (section.includes('e-KYC solution')) {
        return (
          <div key="ekyc">
            <h3 className="text-2xl font-bold text-mkdss-blue mt-8 mb-4">e-KYC solution</h3>
            {section.split('\n').map((line, i) => {
              if (line.includes('Applicable for:')) {
                return <p key={i} className="mb-2"><strong>Applicable for:</strong> Finance-Banking, Enterprises</p>;
              } else if (line.trim() && !line.includes('e-KYC solution')) {
                return <p key={i} className="mb-4">{line.trim()}</p>;
              }
              return null;
            }).filter(Boolean)}
          </div>
        );
      }

      if (section.includes('OTP authentication')) {
        return (
          <div key="otp">
            <h3 className="text-2xl font-bold text-mkdss-blue mt-8 mb-4">OTP authentication solution</h3>
            <ul className="list-disc pl-6 mb-6">
              {section.split('\n').map((line, i) => {
                if (line.trim().startsWith('•')) {
                  return <li key={i} className="mb-2">{line.trim().substring(1).trim()}</li>;
                }
                return null;
              }).filter(Boolean)}
            </ul>
          </div>
        );
      }

      if (section.includes('Match-on-Card')) {
        const mocLines = section.split('\n');
        return (
          <div key="moc">
            <h3 className="text-2xl font-bold text-mkdss-blue mt-8 mb-4">Match-on-Card (MoC) solution</h3>
            {mocLines.map((line, i) => {
              if (!line.trim() || line.includes('Match-on-Card (MoC)')) {
                return null;
              }
              return <p key={i} className="mb-4">{line.trim()}</p>;
            }).filter(Boolean)}
          </div>
        );
      }

      if (section.includes('Truly personal ID cards')) {
        return (
          <div key="id-cards">
            <h4 className="text-xl font-semibold text-mkdss-blue mt-6 mb-2">Truly personal ID cards</h4>
            <p className="mb-4">{section.replace('Truly personal ID cards', '').trim()}</p>
          </div>
        );
      }

      if (section.includes('Financial Card')) {
        return (
          <div key="financial-card">
            <h4 className="text-xl font-semibold text-mkdss-blue mt-6 mb-2">Financial Card</h4>
            {section.replace('Financial Card', '').split('\n').map((line, i) => {
              if (line.trim()) {
                return <p key={i} className="mb-4">{line.trim()}</p>;
              }
              return null;
            }).filter(Boolean)}
          </div>
        );
      }

      if (section.includes('Healthcare')) {
        return (
          <div key="healthcare">
            <h4 className="text-xl font-semibold text-mkdss-blue mt-6 mb-2">Healthcare</h4>
            <p className="mb-4">{section.replace('Healthcare', '').trim()}</p>
          </div>
        );
      }

      if (section.includes('Travel & Transport')) {
        return (
          <div key="travel">
            <h4 className="text-xl font-semibold text-mkdss-blue mt-6 mb-2">Travel & Transport</h4>
            {section.replace('Travel & Transport', '').split('\n').map((line, i) => {
              if (line.trim()) {
                return <p key={i} className="mb-4">{line.trim()}</p>;
              }
              return null;
            }).filter(Boolean)}
          </div>
        );
      }

      if (section.includes('2-Factor Authentication')) {
        return (
          <div key="2fa">
            <h3 className="text-2xl font-bold text-mkdss-blue mt-8 mb-4">2-Factor Authentication Solution</h3>
            {section.split('\n').map((line, i) => {
              if (line.trim() && !line.includes('2-Factor Authentication')) {
                // Special handling for the URL
                if (line.includes('https://www.dongleauth.info/')) {
                  return (
                    <p key={i} className="mb-4">
                      FIDO standard is available at: <a href="https://www.dongleauth.info/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://www.dongleauth.info/</a> to register the security key.
                    </p>
                  );
                }
                return <p key={i} className="mb-4">{line.trim()}</p>;
              }
              return null;
            }).filter(Boolean)}
          </div>
        );
      }

      // For any other sections, just return the text
      if (section.trim()) {
        return <p key={section.substring(0, 20)} className="mb-4">{section}</p>;
      }

      return null;
    }).filter(Boolean);

    return <div className="text-gray-700">{formattedContent}</div>;
  }

  // If the content doesn't have proper section headers, just display it with whitespace preserved
  return (
    <div className="text-gray-700 whitespace-pre-line">
      {description}
    </div>
  );
};
