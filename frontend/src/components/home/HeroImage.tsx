import { useState, useEffect } from 'react';

interface HeroImageProps {
  imageUrl: string | null;
}

/**
 * A component that displays a hero image with cache busting
 */
export const HeroImage = ({ imageUrl }: HeroImageProps) => {
  const [displayImage, setDisplayImage] = useState<string | null>(null);
  const [key, setKey] = useState<string>(new Date().getTime().toString());

  useEffect(() => {
    // If there's an image URL, use it with cache busting
    if (imageUrl) {
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(7);
      const cacheBustedUrl = `${imageUrl.split('?')[0]}?_t=${timestamp}&r=${randomString}`;

      console.log('HeroImage - Using image URL with cache busting:', cacheBustedUrl);
      setDisplayImage(cacheBustedUrl);
    } else {
      // No image URL, set to null
      console.log('HeroImage - No image URL provided');
      setDisplayImage(null);
    }

    // Generate a new key to force React to re-render the image
    setKey(new Date().getTime().toString());
  }, [imageUrl]);

  // If there's no image to display, return a gradient background
  if (!displayImage) {
    return (
      <div className="w-full h-full bg-gradient-to-r from-navy to-blue-900"></div>
    );
  }

  return (
    <img
      key={key}
      src={displayImage}
      alt="Hero Background"
      className="w-full h-full object-contain"
      style={{
        objectPosition: 'center center'
      }}
      onLoad={(e) => {
        console.log("HeroImage - Image loaded successfully:", (e.target as HTMLImageElement).src);
      }}
      onError={(e) => {
        console.error("HeroImage - Error loading image:", (e.target as HTMLImageElement).src);

        // Hide the image on error and show a gradient background
        (e.target as HTMLImageElement).style.display = 'none';

        // Create a gradient background div and append it to the parent
        const parent = (e.target as HTMLImageElement).parentElement;
        if (parent) {
          const gradientDiv = document.createElement('div');
          gradientDiv.className = "w-full h-full bg-gradient-to-r from-navy to-blue-900";
          parent.appendChild(gradientDiv);
        }
      }}
    />
  );
};
