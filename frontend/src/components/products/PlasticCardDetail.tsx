import React from 'react';

interface PlasticCardDetailProps {
  description: string;
}

export const PlasticCardDetail: React.FC<PlasticCardDetailProps> = ({ description }) => {
  console.log("PlasticCardDetail received description:", description);

  // Check if the description is the short version (one sentence)
  const isShortDescription = !description.includes('Plastic Card') &&
                             !description.includes('Multi applications:');

  console.log("Is short description:", isShortDescription);

  // Always use the default detailed content for now
  if (true) {
    return (
      <div className="text-gray-700">
        {/* Introduction with styled header */}
        <div className="bg-gradient-to-r from-light-blue to-white p-6 rounded-lg mb-8 shadow-sm">
          <h2 className="text-2xl font-bold text-mkdss-blue mb-4">Plastic Cards</h2>
          <p className="mb-4">
            MK DSS Plastic card is the simplest way to recruit new customers and retain exist customers.
            Our products are designed for variety of purposes, they will help organizations increase the
            brand's customer loyalty as well as drive revenue.
          </p>
        </div>

        {/* Key features in cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-5 rounded-lg text-center shadow-sm border border-light-blue hover:shadow-md transition-shadow">
            <p className="font-semibold text-navy">NICE-LOOKING DESIGN</p>
          </div>
          <div className="bg-white p-5 rounded-lg text-center shadow-sm border border-light-blue hover:shadow-md transition-shadow">
            <p className="font-semibold text-navy">COST-EFFECTIVE</p>
          </div>
          <div className="bg-white p-5 rounded-lg text-center shadow-sm border border-light-blue hover:shadow-md transition-shadow">
            <p className="font-semibold text-navy">DURABLE</p>
          </div>
          <div className="bg-white p-5 rounded-lg text-center shadow-sm border border-light-blue hover:shadow-md transition-shadow">
            <p className="font-semibold text-navy">CONVENIENT</p>
          </div>
        </div>

        {/* Applications section with two columns on larger screens */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-10">
          <h3 className="text-xl font-bold text-mkdss-blue mb-4">Multi applications:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="list-disc pl-6 space-y-2">
              <li>ID card</li>
              <li>Member card</li>
              <li>VIP card</li>
              <li>Loyalty card</li>
            </ul>
            <ul className="list-disc pl-6 space-y-2">
              <li>Gift card</li>
              <li>Warranty card</li>
              <li>Cooperation card</li>
            </ul>
          </div>
        </div>

        {/* Specifications table with improved styling */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-mkdss-blue mb-4">Specifications</h3>
          <div className="overflow-x-auto rounded-lg shadow-sm">
            <table className="min-w-full bg-white border border-gray-200">
              <tbody>
                <tr className="border-b bg-gray-50">
                  <td className="py-3 px-4 font-semibold border-r w-1/4">Size</td>
                  <td className="py-3 px-4">
                    <ul className="list-disc pl-6 space-y-1">
                      <li>ISO/IEC7810 standard / 86(L) x 54(W) x 0.76 (D) mm</li>
                      <li>Non-standard</li>
                    </ul>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-semibold border-r w-1/4">Material</td>
                  <td className="py-3 px-4">
                    <ul className="list-disc pl-6 space-y-1">
                      <li>PET</li>
                      <li>PVC</li>
                    </ul>
                  </td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="py-3 px-4 font-semibold border-r w-1/4">Wide range of design</td>
                  <td className="py-3 px-4">
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Vertical</li>
                      <li>Horizontal</li>
                    </ul>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-semibold border-r w-1/4">Printing technology</td>
                  <td className="py-3 px-4">
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Offset – CMYK color</li>
                      <li>Laser printing</li>
                      <li>UV spot printing</li>
                      <li>Top-coat / Overlay</li>
                    </ul>
                  </td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="py-3 px-4 font-semibold border-r w-1/4">Optional effects</td>
                  <td className="py-3 px-4">
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Chip embedded: Proximity 125KHz / Mifare 13,56 MHz</li>
                      <li>Hico-loco magnetic stripe</li>
                      <li>Signature stripe</li>
                      <li>Scratch stripe</li>
                      <li>Hologram</li>
                      <li>Hot-stamping</li>
                      <li>Metal-sticker</li>
                    </ul>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-semibold border-r w-1/4">Value-added services</td>
                  <td className="py-3 px-4">
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Designing</li>
                      <li>Delivering</li>
                    </ul>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-3 px-4 font-semibold border-r w-1/4">Applications</td>
                  <td className="py-3 px-4">Retail, Education, Health-care, HOSPITALITY, etc.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Reasons section with styled cards */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-10">
          <h3 className="text-xl font-bold text-mkdss-blue mb-6">5 reasons for choosing MK DSS Plastic card</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-navy text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mr-4">1</div>
              <div>MK DSS owns card factory in Addis Ababa, Ethiopia</div>
            </div>
            <div className="flex items-start">
              <div className="bg-navy text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mr-4">2</div>
              <div>High quality with advanced printing technology</div>
            </div>
            <div className="flex items-start">
              <div className="bg-navy text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mr-4">3</div>
              <div>Cost effective</div>
            </div>
            <div className="flex items-start">
              <div className="bg-navy text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mr-4">4</div>
              <div>Quick response and Fast delivery time</div>
            </div>
            <div className="flex items-start">
              <div className="bg-navy text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mr-4">5</div>
              <div>Update...</div>
            </div>
          </div>
        </div>

        {/* Contact section with styled buttons */}
        <div className="bg-light-blue/20 p-6 rounded-lg shadow-sm border border-light-blue/30 mt-10">
          <h3 className="text-xl font-bold text-mkdss-blue mb-4">Contact Us</h3>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <button className="bg-navy text-white px-6 py-3 rounded-lg hover:bg-navy/90 transition-colors w-full md:w-auto flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
              </svg>
              Request Order
            </button>
            <div className="flex items-center bg-white px-4 py-3 rounded-lg border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-navy mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span className="font-semibold text-navy">Hotline:</span>
              <span className="ml-2">update</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If it's the detailed description, format it nicely
  // First, try to parse the content into sections
  const sections = description.split('\n');

  // Check if the content has proper formatting with section headers
  const hasPlasticCardSection = sections.some(s => s.includes('Plastic Card'));
  const hasMultiApplicationsSection = sections.some(s => s.includes('Multi applications:'));
  const has5ReasonsSection = sections.some(s => s.includes('5 reasons for choosing'));

  console.log("Content sections check:", {
    hasPlasticCardSection,
    hasMultiApplicationsSection,
    has5ReasonsSection,
    sections: sections.slice(0, 5) // Log first 5 sections for debugging
  });

  // If the content has proper section headers, format it with HTML
  if (hasPlasticCardSection && hasMultiApplicationsSection) {
    // Process the content to create a structured layout
    let introText = '';
    let features: string[] = [];
    let multiApplications: string[] = [];
    let specifications: Record<string, string[]> = {};
    let reasons: string[] = [];
    let currentSection = '';

    // Parse the content
    sections.forEach(line => {
      const trimmedLine = line.trim();

      if (trimmedLine === 'Plastic Card') {
        currentSection = 'intro';
      } else if (trimmedLine.startsWith('•') && ['NICE-LOOKING', 'COST-EFFECTIVE', 'DURABLE', 'CONVENIENT'].some(f => trimmedLine.includes(f))) {
        features.push(trimmedLine.substring(1).trim());
      } else if (trimmedLine === 'Multi applications:') {
        currentSection = 'applications';
      } else if (trimmedLine === 'Size' || trimmedLine === 'Material' ||
                trimmedLine === 'Wide range of design' || trimmedLine === 'Printing technology' ||
                trimmedLine === 'Optional effects' || trimmedLine === 'Value-added services' ||
                trimmedLine === 'Applications') {
        currentSection = trimmedLine;
        specifications[currentSection] = [];
      } else if (trimmedLine === '5 reasons for choosing MK DSS Plastic card') {
        currentSection = 'reasons';
      } else if (currentSection === 'intro' && trimmedLine && !trimmedLine.includes('Card Products photos')) {
        introText = trimmedLine;
      } else if (currentSection === 'applications' && trimmedLine.startsWith('•')) {
        multiApplications.push(trimmedLine.substring(1).trim());
      } else if (Object.keys(specifications).includes(currentSection) && trimmedLine.startsWith('•')) {
        specifications[currentSection].push(trimmedLine.substring(1).trim());
      } else if (currentSection === 'reasons' && trimmedLine.match(/^\d+\./)) {
        reasons.push(trimmedLine.substring(trimmedLine.indexOf('.') + 1).trim());
      }
    });

    return (
      <div className="text-gray-700">
        {introText && (
          <p className="mb-6">{introText}</p>
        )}

        {features.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-light-blue p-4 rounded-lg text-center">
                <p className="font-semibold">{feature}</p>
              </div>
            ))}
          </div>
        )}

        {multiApplications.length > 0 && (
          <>
            <h3 className="text-2xl font-bold text-mkdss-blue mt-8 mb-4">Multi applications:</h3>
            <ul className="list-disc pl-6 mb-8">
              {multiApplications.map((app, index) => (
                <li key={index}>{app}</li>
              ))}
            </ul>
          </>
        )}

        {Object.keys(specifications).length > 0 && (
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full bg-white border border-gray-200">
              <tbody>
                {Object.entries(specifications).map(([key, values]) => (
                  <tr key={key} className="border-b">
                    <td className="py-3 px-4 font-semibold border-r">{key}</td>
                    <td className="py-3 px-4">
                      {key === 'Applications' ? (
                        values.join(', ') || 'Retail, Education, Health-care, HOSPITALITY, etc.'
                      ) : (
                        <ul className="list-disc pl-6">
                          {values.map((value, index) => (
                            <li key={index}>{value}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reasons.length > 0 && (
          <>
            <h3 className="text-2xl font-bold text-mkdss-blue mt-8 mb-4">5 reasons for choosing MK DSS Plastic card</h3>
            <ol className="list-decimal pl-6 mb-8">
              {reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ol>
          </>
        )}

        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <button className="bg-mkdss-blue text-white px-6 py-3 rounded-lg hover:bg-mkdss-blue/80 transition-colors">
            Request order
          </button>
          <div className="flex items-center">
            <span className="font-semibold mr-2">Hotline:</span> update
          </div>
        </div>
      </div>
    );
  }

  // If the content doesn't have proper section headers, just display it with whitespace preserved
  return (
    <div className="text-gray-700 whitespace-pre-line">
      {description}
    </div>
  );
};
