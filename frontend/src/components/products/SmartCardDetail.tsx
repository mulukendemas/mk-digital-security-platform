import React from 'react';

interface SmartCardDetailProps {
  description: string;
}

export const SmartCardDetail: React.FC<SmartCardDetailProps> = ({ description }) => {
  console.log("SmartCardDetail received description:", description);

  // Check if the description is the short version (one sentence)
  const isShortDescription = !description.includes('Smart Card') ||
                             !description.includes('Multi-applications:');

  console.log("Is short description:", isShortDescription);

  // Parse the description if it's detailed
  if (!isShortDescription) {
    try {
      // Split the description into sections
      const sections = description.split('\n\n');

      // Extract key sections
      const introSection = sections.find(s => s.includes('Smart Card'));
      const featuresSection = sections.find(s => s.includes('TOTAL SOLUTIONS') || s.includes('SECURITY') || s.includes('COST-EFFECTIVE'));
      const applicationsSection = sections.find(s => s.includes('Multi-applications:'));
      const reasonsSection = sections.find(s => s.includes('5 reasons for choosing'));

      console.log("Found sections:", {
        intro: !!introSection,
        features: !!featuresSection,
        applications: !!applicationsSection,
        reasons: !!reasonsSection
      });

      // If we have all the necessary sections, parse and format the content
      if (introSection) {
        // Extract introduction text
        const introText = introSection.replace('Smart Card', '').trim();

        // Extract features
        const features: string[] = [];
        if (featuresSection) {
          featuresSection.split('\n').forEach(line => {
            if (line.trim().startsWith('•')) {
              features.push(line.trim().substring(1).trim());
            }
          });
        }

        // Extract applications
        const applications: string[] = [];
        if (applicationsSection) {
          applicationsSection.split('\n').forEach(line => {
            if (line.trim().startsWith('•')) {
              applications.push(line.trim().substring(1).trim());
            }
          });
        }

        // Extract reasons
        const reasons: string[] = [];
        if (reasonsSection) {
          reasonsSection.split('\n').forEach(line => {
            if (line.trim().match(/^\d+\./)) {
              reasons.push(line.trim().substring(line.trim().indexOf('.') + 1).trim());
            }
          });
        }

        return (
          <div className="text-gray-700">
            {/* Introduction with styled header */}
            <div className="bg-gradient-to-r from-light-blue to-white p-6 rounded-lg mb-8 shadow-sm">
              <h2 className="text-2xl font-bold text-mkdss-blue mb-4">Smart Cards</h2>
              <p className="mb-4">{introText}</p>
            </div>

            {/* Key features in cards */}
            {features.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-10">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white p-5 rounded-lg text-center shadow-sm border border-light-blue hover:shadow-md transition-shadow">
                    <p className="font-semibold text-navy">{feature}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Applications section with two columns on larger screens */}
            {applications.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-10">
                <h3 className="text-xl font-bold text-mkdss-blue mb-4">Multi-applications:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="list-disc pl-6 space-y-2">
                    {applications.slice(0, Math.ceil(applications.length / 2)).map((app, index) => (
                      <li key={index}>{app}</li>
                    ))}
                  </ul>
                  <ul className="list-disc pl-6 space-y-2">
                    {applications.slice(Math.ceil(applications.length / 2)).map((app, index) => (
                      <li key={index}>{app}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Reasons section with styled cards */}
            {reasons.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-10">
                <h3 className="text-xl font-bold text-mkdss-blue mb-6">5 reasons for choosing MK DSS smart card</h3>
                <div className="space-y-4">
                  {reasons.map((reason, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-navy text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mr-4">{index + 1}</div>
                      <div>{reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
    } catch (error) {
      console.error("Error parsing description:", error);
    }
  }

  // Use the default detailed content as fallback
  return (
    <div className="text-gray-700">
      {/* Introduction with styled header */}
      <div className="bg-gradient-to-r from-light-blue to-white p-6 rounded-lg mb-8 shadow-sm">
        <h2 className="text-2xl font-bold text-mkdss-blue mb-4">Smart Cards</h2>
        <p className="mb-4">
          MK DSS Smart card is a combination of the ability to master the core technology of chip as well as R&D activities for smart cards applications.
          With the support of MK Group – a Vietnamese partner with 24 years of experience in the smart card industry and security authentication field,
          we believe that we will provide the effective smart card ecosystem, which suit to the budgets and goals of each organizations,
          from card issuance - personalization - card distribution to card applications.
        </p>
      </div>

      {/* Key features in cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-white p-5 rounded-lg text-center shadow-sm border border-light-blue hover:shadow-md transition-shadow">
          <p className="font-semibold text-navy">TOTAL SOLUTIONS</p>
        </div>
        <div className="bg-white p-5 rounded-lg text-center shadow-sm border border-light-blue hover:shadow-md transition-shadow">
          <p className="font-semibold text-navy">SECURITY</p>
        </div>
        <div className="bg-white p-5 rounded-lg text-center shadow-sm border border-light-blue hover:shadow-md transition-shadow">
          <p className="font-semibold text-navy">COST-EFFECTIVE</p>
        </div>
      </div>

      {/* Applications section with two columns on larger screens */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-10">
        <h3 className="text-xl font-bold text-mkdss-blue mb-4">Multi-applications:</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <ul className="list-disc pl-6 space-y-2">
            <li>National electronic ID card (e-ID)</li>
            <li>Driver license</li>
            <li>Banking/payment card</li>
            <li>SIM card</li>
          </ul>
          <ul className="list-disc pl-6 space-y-2">
            <li>Loyalty and promotions card</li>
            <li>Access control card</li>
            <li>E-Ticketing card</li>
            <li>Parking and toll collection card</li>
          </ul>
        </div>
      </div>

      {/* Reasons section with styled cards */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-10">
        <h3 className="text-xl font-bold text-mkdss-blue mb-6">5 reasons for choosing MK DSS smart card</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-navy text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mr-4">1</div>
            <div>MK DSS owns card factory in Addis Ababa, Ethiopia</div>
          </div>
          <div className="flex items-start">
            <div className="bg-navy text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mr-4">2</div>
            <div>Total solutions including: equipment, issuance and personalization solutions and applications.</div>
          </div>
          <div className="flex items-start">
            <div className="bg-navy text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mr-4">3</div>
            <div>Total secure solutions and applications for smartcard ecosystem: Identification, 2-factor authentication, One-Time-Password, PKI, payments, e-ticketing, etc.</div>
          </div>
          <div className="flex items-start">
            <div className="bg-navy text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mr-4">4</div>
            <div>Cost-effective</div>
          </div>
          <div className="flex items-start">
            <div className="bg-navy text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mr-4">5</div>
            <div>Quick response and Fast delivery time</div>
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
};
