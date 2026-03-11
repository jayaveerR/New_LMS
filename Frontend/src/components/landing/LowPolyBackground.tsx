import React from "react";

const LowPolyBackground = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 700"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="bg-grad-global" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1a4f7a" />
        <stop offset="35%" stopColor="#4a7fa5" />
        <stop offset="55%" stopColor="#f5e6c0" />
        <stop offset="75%" stopColor="#e8a04a" />
        <stop offset="100%" stopColor="#b85c1a" />
      </linearGradient>
    </defs>
    <rect width="1200" height="700" fill="url(#bg-grad-global)" />
    {/* Simplified but high-quality mosaic polygons for the global background */}
    <polygon points="0,0 120,80 0,160" fill="#1b507e" opacity="0.85" />
    <polygon points="0,0 200,0 120,80" fill="#2562a0" opacity="0.9" />
    <polygon points="200,0 320,90 120,80" fill="#1d5b8e" opacity="0.8" />
    <polygon points="200,0 400,0 320,90" fill="#2e6fa3" opacity="0.85" />
    <polygon points="400,0 480,75 320,90" fill="#3578ae" opacity="0.9" />
    <polygon points="400,0 600,0 480,75" fill="#205f95" opacity="0.8" />
    <polygon points="600,0 640,80 480,75" fill="#3070a8" opacity="0.75" />
    <polygon points="600,0 800,0 640,80" fill="#1e5a8a" opacity="0.85" />
    <polygon points="200,170 320,90 440,180" fill="#6a9bbf" opacity="0.8" />
    <polygon points="440,180 480,75 620,170" fill="#78a8c0" opacity="0.8" />
    <polygon points="620,170 640,80 800,160" fill="#80afc4" opacity="0.8" />
    <polygon points="1000,175 1200,150 1200,280" fill="#82afc6" opacity="0.75" />
    <polygon points="440,180 620,170 540,305" fill="#e8d0a0" opacity="0.8" />
    <polygon points="540,305 620,170 760,300" fill="#f5e2a8" opacity="0.8" />
    <polygon points="980,295 1000,175 1200,280" fill="#f5e0a0" opacity="0.8" />
    <polygon points="0,420 280,440 0,540" fill="#c88430" opacity="0.85" />
    <polygon points="420,435 540,305 680,430" fill="#e8a040" opacity="0.8" />
    <polygon points="900,425 980,295 1200,400" fill="#e89a38" opacity="0.8" />
    <polygon points="0,540 320,560 0,700" fill="#a05c18" opacity="0.85" />
    <polygon points="400,570 420,435 600,555" fill="#c87028" opacity="0.85" />
    <polygon points="840,550 900,425 1100,545" fill="#c07020" opacity="0.85" />
    <polygon points="1100,545 1200,530 1200,700" fill="#a85c18" opacity="0.85" />
    {/* More base triangles for fuller look as global bg */}
    <polygon points="800,0 1200,0 1000,100" fill="#1b507e" opacity="0.8" />
    <polygon points="0,700 1200,700 600,600" fill="#a05c18" opacity="0.8" />
  </svg>
);

export default LowPolyBackground;
