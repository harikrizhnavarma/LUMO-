/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const CHARACTER_TEMPLATES = {
  masculine: (skin: string, hair: string, accent: string) => `
    <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#${skin};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#${skin};stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <!-- Background Halo -->
      <circle cx="200" cy="210" r="160" fill="${accent}" opacity="0.15" />
      
      <!-- Body/Clothing -->
      <path d="M100,360 Q200,330 300,360 L350,500 L50,500 Z" fill="#264653" stroke="#264653" stroke-width="2" />
      <path d="M170,360 L170,380 Q200,390 230,380 L230,360" fill="#1a1a1a" />
      
      <!-- Neck -->
      <path d="M170,300 L170,365 L230,365 L230,300" fill="url(#skinGrad)" />
      
      <!-- Head Structure -->
      <path d="M110,120 Q110,50 200,50 Q290,50 290,120 L290,280 Q200,340 110,280 Z" fill="url(#skinGrad)" stroke="#264653" stroke-width="4" />
      
      <!-- Features (Technical Nomad Style) -->
      <g stroke="#264653" stroke-width="3" fill="none">
        <path d="M175,225 Q200,235 225,225" opacity="0.6" /> <!-- Mouth -->
        <circle cx="165" cy="175" r="4" fill="#264653" /> <!-- Eye L -->
        <circle cx="235" cy="175" r="4" fill="#264653" /> <!-- Eye R -->
        <path d="M195,185 L205,185" stroke-width="1.5" /> <!-- Detail -->
      </g>
      
      <!-- Hair (Short Architect Crop) -->
      <path d="M110,120 Q110,40 200,40 Q290,40 290,120 L290,160 Q200,140 110,160 Z" fill="#${hair}" stroke="#264653" stroke-width="2" />
      
      <!-- Technical Registration Marks -->
      <g stroke="${accent}" stroke-width="1" opacity="0.4">
        <line x1="200" y1="20" x2="200" y2="40" />
        <line x1="20" y1="250" x2="40" y2="250" />
        <line x1="360" y1="250" x2="380" y2="250" />
        <circle cx="200" cy="250" r="190" fill="none" stroke-dasharray="4" />
      </g>
    </svg>
  `,
  feminine: (skin: string, hair: string, accent: string) => `
    <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGradF" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#${skin};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#${skin};stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <!-- Background Halo -->
      <circle cx="200" cy="210" r="160" fill="${accent}" opacity="0.15" />
      
      <!-- Body/Clothing -->
      <path d="M110,360 Q200,340 290,360 L340,500 L60,500 Z" fill="#264653" stroke="#264653" stroke-width="2" />
      <path d="M175,360 Q200,370 225,360" stroke="#fdfcf0" stroke-width="2" fill="none" />
      
      <!-- Neck -->
      <path d="M175,300 L175,360 L225,360 L225,300" fill="url(#skinGradF)" />
      
      <!-- Head Structure -->
      <path d="M120,130 Q120,60 200,60 Q280,60 280,130 L280,270 Q200,330 120,270 Z" fill="url(#skinGradF)" stroke="#264653" stroke-width="4" />
      
      <!-- Hair (Short Technical Bob) -->
      <path d="M110,130 Q110,50 200,50 Q290,50 290,130 L310,260 Q200,240 90,260 Z" fill="#${hair}" stroke="#264653" stroke-width="2" />
      
      <!-- Features -->
      <g stroke="#264653" stroke-width="3" fill="none">
        <path d="M180,215 Q200,225 220,215" opacity="0.6" /> <!-- Mouth -->
        <circle cx="170" cy="170" r="4" fill="#264653" /> <!-- Eye L -->
        <circle cx="230" cy="170" r="4" fill="#264653" /> <!-- Eye R -->
      </g>
      
      <!-- Technical Registration Marks -->
      <g stroke="${accent}" stroke-width="1" opacity="0.4">
        <path d="M20,20 L40,20 M30,10 L30,30" />
        <path d="M360,20 L380,20 M370,10 L370,30" />
        <circle cx="200" cy="250" r="185" fill="none" stroke-dasharray="2,6" />
      </g>
    </svg>
  `
};