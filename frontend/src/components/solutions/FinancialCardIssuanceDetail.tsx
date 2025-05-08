import React from 'react';

interface FinancialCardIssuanceDetailProps {
  description: string;
}

export const FinancialCardIssuanceDetail: React.FC<FinancialCardIssuanceDetailProps> = ({ description }) => {
  // Check if the description is the short version (one sentence)
  const isShortDescription = !description.includes('DESKTOP ID CARD ISSUANCE SOLUTIONS') &&
                             !description.includes('CENTRAL ISSUANCE SOLUTIONS');

  // If it's the short description, use the default detailed content
  if (isShortDescription) {
    return (
      <div className="text-gray-700">
        <h3 className="text-2xl font-bold text-mkdss-blue mt-6 mb-4">DESKTOP ID CARD ISSUANCE SOLUTIONS</h3>
        <p>
          Secure ID card issuance solution from MK Group can help you increase security in any organization around the world.
          This is comprehensive solution, which meets customer's need and fits their budget.
        </p>

        <h4 className="text-xl font-semibold text-mkdss-blue mt-6 mb-2">Applied for:</h4>
        <ul className="list-disc pl-6 mb-4">
          <li>ATM / Debit / Credit / Prepaid card</li>
        </ul>

        <h4 className="text-xl font-semibold text-mkdss-blue mt-6 mb-2">Desktop ID card issuance solution includes:</h4>
        <ul className="list-disc pl-6 mb-4">
          <li>User-friendly identification software</li>
          <li>Easy image and biometric capture</li>
          <li>Powerful, versatile card printers</li>
          <li>Technical Support services</li>
        </ul>

        <h4 className="text-xl font-semibold text-mkdss-blue mt-6 mb-2">Card Issuance System:</h4>
        <p>Update</p>

        <h4 className="text-xl font-semibold text-mkdss-blue mt-6 mb-2">End-user solution options:</h4>
        <p>Update</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Access control solutions & E-gate</li>
          <li>Secure authentication solutions</li>
        </ul>

        <h3 className="text-2xl font-bold text-mkdss-blue mt-8 mb-4">CENTRAL ISSUANCE SOLUTIONS</h3>
        <p>
          Central issuance solutions energize card programs in a variety market such as financial,
          Government IDs, Membership, loyalty, retail and gift cards, transit or telecom
        </p>

        <p className="mt-4">
          With partner – Datacard Group, MK Group provides the systems that made inline card issuance possible,
          with tremendous advances in smart cards, magnetic stripes, embossing, throughput and security.
        </p>

        <p className="mt-4">
          Our modular design philosophy provides solid protection for our customers' capital investments.
          You can start with the capabilities you need, then expand your systems as we enhance existing
          modules or create entirely new capabilities. Our systems form the heart of most major card
          programs worldwide because they set clear benchmarks for production speed, card quality,
          uptime and cost-per-card.
        </p>

        <p className="mt-4">
          Our integrated solutions energize card programs in a variety market such as financial,
          Government IDs, Membership, loyalty, retail and gift cards, transit or telecom.
        </p>

        <h4 className="text-xl font-semibold text-mkdss-blue mt-6 mb-2">Solution includes:</h4>
        <ul className="list-disc pl-6 mb-4">
          <li>High-volume card issuance Datacard® MX6100 and Datacard® MX2100</li>
          <li>Medium-volume card issuance Datacard® MX1100</li>
          <li>Card personalization software</li>
          <li>Consumable supplies & spare parts</li>
          <li>Technical Support services</li>
        </ul>
      </div>
    );
  }

  // If it's the detailed description, format it nicely
  // First, try to parse the content into sections
  const sections = description.split('\n\n');

  // Check if the content has proper formatting with section headers
  const hasDesktopSection = sections.some(s => s.includes('DESKTOP ID CARD ISSUANCE SOLUTIONS'));
  const hasCentralSection = sections.some(s => s.includes('CENTRAL ISSUANCE SOLUTIONS'));

  // If the content has proper section headers, format it with HTML
  if (hasDesktopSection || hasCentralSection) {
    // Process the content to add proper HTML formatting
    const formattedContent = sections.map(section => {
      // Handle section headers
      if (section.includes('DESKTOP ID CARD ISSUANCE SOLUTIONS')) {
        return (
          <div key="desktop">
            <h3 className="text-2xl font-bold text-mkdss-blue mt-6 mb-4">DESKTOP ID CARD ISSUANCE SOLUTIONS</h3>
            {section.replace('DESKTOP ID CARD ISSUANCE SOLUTIONS', '').split('\n').map((line, i) => {
              if (line.trim()) {
                return <p key={i} className="mb-4">{line.trim()}</p>;
              }
              return null;
            }).filter(Boolean)}
          </div>
        );
      }

      if (section.includes('Applied for:')) {
        return (
          <div key="applied-for">
            <h4 className="text-xl font-semibold text-mkdss-blue mt-6 mb-2">Applied for:</h4>
            <ul className="list-disc pl-6 mb-4">
              {section.replace('Applied for:', '').split('\n').map((line, i) => {
                if (line.trim().startsWith('-')) {
                  return <li key={i}>{line.trim().substring(1).trim()}</li>;
                }
                return null;
              }).filter(Boolean)}
            </ul>
          </div>
        );
      }

      if (section.includes('Destkop ID card issuance solution includes:')) {
        return (
          <div key="includes">
            <h4 className="text-xl font-semibold text-mkdss-blue mt-6 mb-2">Desktop ID card issuance solution includes:</h4>
            <ul className="list-disc pl-6 mb-4">
              {section.replace('Destkop ID card issuance solution includes:', '').split('\n').map((line, i) => {
                if (line.trim().startsWith('-')) {
                  return <li key={i}>{line.trim().substring(1).trim()}</li>;
                }
                return null;
              }).filter(Boolean)}
            </ul>
          </div>
        );
      }

      if (section.includes('Card Issuance System:')) {
        return (
          <div key="card-system">
            <h4 className="text-xl font-semibold text-mkdss-blue mt-6 mb-2">Card Issuance System:</h4>
            {section.replace('Card Issuance System:', '').split('\n').map((line, i) => {
              if (line.trim().startsWith('-')) {
                return <p key={i}>{line.trim().substring(1).trim()}</p>;
              }
              return null;
            }).filter(Boolean)}
          </div>
        );
      }

      if (section.includes('End-user solution options:')) {
        return (
          <div key="end-user">
            <h4 className="text-xl font-semibold text-mkdss-blue mt-6 mb-2">End-user solution options:</h4>
            <p>Update</p>
            <ul className="list-disc pl-6 mb-4">
              {section.replace('End-user solution options: Update', '').split('\n').map((line, i) => {
                if (line.trim().startsWith('-')) {
                  return <li key={i}>{line.trim().substring(1).trim()}</li>;
                }
                return null;
              }).filter(Boolean)}
            </ul>
          </div>
        );
      }

      if (section.includes('CENTRAL ISSUANCE SOLUTIONS')) {
        return (
          <div key="central">
            <h3 className="text-2xl font-bold text-mkdss-blue mt-8 mb-4">CENTRAL ISSUANCE SOLUTIONS</h3>
            {section.replace('CENTRAL ISSUANCE SOLUTIONS', '').split('\n').map((line, i) => {
              if (line.trim()) {
                return <p key={i} className="mb-4">{line.trim()}</p>;
              }
              return null;
            }).filter(Boolean)}
          </div>
        );
      }

      if (section.includes('With partner')) {
        return (
          <p key="partner" className="mt-4">
            {section.trim()}
          </p>
        );
      }

      if (section.includes('Our modular design')) {
        return (
          <p key="modular" className="mt-4">
            {section.trim()}
          </p>
        );
      }

      if (section.includes('Our integrated solutions')) {
        return (
          <p key="integrated" className="mt-4">
            {section.trim()}
          </p>
        );
      }

      if (section.includes('Solution includes:')) {
        return (
          <div key="solution-includes">
            <h4 className="text-xl font-semibold text-mkdss-blue mt-6 mb-2">Solution includes:</h4>
            <ul className="list-disc pl-6 mb-4">
              {section.replace('Solution includes:', '').split('\n').map((line, i) => {
                if (line.trim().startsWith('-')) {
                  return <li key={i}>{line.trim().substring(1).trim()}</li>;
                }
                return null;
              }).filter(Boolean)}
            </ul>
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
