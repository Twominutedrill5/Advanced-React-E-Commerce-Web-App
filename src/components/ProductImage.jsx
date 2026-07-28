import { useState, useEffect } from 'react';

// A number of FakeStoreAPI image URLs now return 404 — the files were removed
// on their end. Rather than showing a broken-image icon, swap in a placeholder
// drawn inline as an SVG data URI. Inline means it can't 404 the way a
// third-party placeholder service can, so the grid never breaks.
const PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="#f7f6f2"/>
  <rect x="8" y="8" width="284" height="284" fill="none" stroke="#14110f" stroke-width="2"/>
  <text x="150" y="142" text-anchor="middle"
        font-family="Georgia, serif" font-size="19" fill="#14110f">Image</text>
  <text x="150" y="170" text-anchor="middle"
        font-family="Georgia, serif" font-size="19" fill="#c8102e">unavailable</text>
</svg>`)}`;

export default function ProductImage({ src, alt, className = '' }) {
  const [source, setSource] = useState(src || PLACEHOLDER);

  // If the product changes (category switch reuses the same card slot),
  // reset back to the new product's image before deciding it's broken.
  useEffect(() => {
    setSource(src || PLACEHOLDER);
  }, [src]);

  return (
    <img
      src={source}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setSource(PLACEHOLDER)}
    />
  );
}
