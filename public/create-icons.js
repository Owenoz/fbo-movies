// Simple PWA icon generator using SVG to PNG with canvas
const fs = require('fs');

// SVG icon with FBO branding
const svg = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#9333ea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#bg)"/>
  <g transform="translate(256,256)">
    <!-- Lightning bolt icon -->
    <path d="M-40,-100 L20,-100 L-20,0 L40,0 L-60,100 L-20,20 L-80,20 Z" 
          fill="white" stroke="white" stroke-width="4" stroke-linejoin="round"/>
  </g>
  <!-- FBO text -->
  <text x="256" y="420" font-family="Arial, sans-serif" font-size="80" font-weight="bold" 
        fill="white" text-anchor="middle">FBO</text>
</svg>`;

fs.writeFileSync('icon.svg', svg);
console.log('Created icon.svg');
