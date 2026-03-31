import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

// Amazon - Siyah text + turuncu smile arrow
export const Amazon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    className={className}
    {...props}
  >
    {/* amazon text */}
    <path
      d="M2 7.5C2 7.2 2.2 7 2.5 7C2.8 7 3 7.2 3 7.5C3 8.3 3.3 8.7 3.8 8.7C4.3 8.7 4.5 8.3 4.5 7.5V6.5C4.5 6.2 4.7 6 5 6C5.3 6 5.5 6.2 5.5 6.5V7.5C5.5 8.8 4.9 9.7 3.8 9.7C2.7 9.7 2 8.8 2 7.5Z"
      fill="currentColor"
    />
    <path
      d="M6.5 6C6.8 6 7 6.2 7 6.5V7C7.3 6.3 7.8 6 8.5 6C9.3 6 9.8 6.5 9.8 7.3V9.2C9.8 9.5 9.6 9.7 9.3 9.7C9 9.7 8.8 9.5 8.8 9.2V7.5C8.8 7.1 8.6 6.9 8.2 6.9C7.7 6.9 7.3 7.3 7.3 7.8V9.2C7.3 9.5 7.1 9.7 6.8 9.7C6.5 9.7 6.3 9.5 6.3 9.2V6.5C6.3 6.2 6.5 6 6.8 6H6.5Z"
      fill="currentColor"
    />
    <path
      d="M11 7.5C11 6.4 11.6 6 12.3 6C13 6 13.6 6.4 13.6 7.5C13.6 8.6 13 9 12.3 9C11.6 9 11 8.6 11 7.5ZM12.6 7.5C12.6 7.1 12.5 6.9 12.3 6.9C12.1 6.9 12 7.1 12 7.5C12 7.9 12.1 8.1 12.3 8.1C12.5 8.1 12.6 7.9 12.6 7.5Z"
      fill="currentColor"
    />
    <path
      d="M14.5 9.2V6.5C14.5 6.2 14.7 6 15 6C15.3 6 15.5 6.2 15.5 6.5V9C15.8 9.3 16 9.4 16.3 9.4C16.6 9.4 16.8 9.2 16.8 8.9V6.5C16.8 6.2 17 6 17.3 6C17.6 6 17.8 6.2 17.8 6.5V9C17.8 9.8 17.3 10.2 16.5 10.2C15.9 10.2 15.5 9.9 15.5 9.5V9.2H14.5Z"
      fill="currentColor"
    />
    
    {/* Smile arrow - turuncu */}
    <path
      d="M3 13 Q10 15 17 13"
      stroke="#FF9900"
      strokeWidth="1.2"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M16.5 12.5 L17 13 L16.5 13.5"
      stroke="#FF9900"
      strokeWidth="1.2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Trendyol - Siyah text + turuncu kare kenar
export const Trendyol: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    className={className}
    {...props}
  >
    {/* Turuncu kare çerçeve */}
    <rect
      x="1"
      y="1"
      width="18"
      height="18"
      rx="2"
      stroke="#FF6D00"
      strokeWidth="2"
      fill="none"
    />
    
    {/* trendyol text */}
    <text
      x="10"
      y="13"
      fontSize="6"
      fontWeight="500"
      fill="currentColor"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
    >
      trendyol
    </text>
  </svg>
);

// Hepsiburada - Beyaz yuvarlatılmış arkaplan + turuncu text + altta renkli çubuklar
export const Hepsiburada: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    className={className}
    {...props}
  >
    {/* Beyaz yuvarlatılmış arkaplan */}
    <rect x="0" y="0" width="20" height="20" rx="4" fill="white" />
    
    {/* hepsiburada text - turuncu, iki satır */}
    <text
      x="10"
      y="7.5"
      fontSize="4"
      fontWeight="700"
      fill="#FF6000"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
    >
      hepsi
    </text>
    <text
      x="10"
      y="12"
      fontSize="4"
      fontWeight="700"
      fill="#FF6000"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
    >
      burada
    </text>
    
    {/* Altta renkli çubuklar - alt köşeler yuvarlatılmış */}
    {/* Turuncu - sol alt köşe yuvarlatılmış */}
    <path
      d="M 0 16 L 0 16 Q 0 20 4 20 L 4 16 Z"
      fill="#FF6000"
    />
    
    {/* Turkuaz */}
    <rect x="4" y="16" width="4" height="4" fill="#00D9E1" />
    
    {/* Mor */}
    <rect x="8" y="16" width="4" height="4" fill="#B314FF" />
    
    {/* Yeşil */}
    <rect x="12" y="16" width="4" height="4" fill="#7ED321" />
    
    {/* Koyu mor - sağ alt köşe yuvarlatılmış */}
    <path
      d="M 16 16 L 20 16 Q 20 20 16 20 Z"
      fill="#5B1F8C"
    />
  </svg>
);

// Shopier - Mor/mavi gradient + turkuaz S
export const Shopier: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    className={className}
    {...props}
  >
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#5E17EB" />
    <text
      x="10"
      y="14"
      fontSize="12"
      fontWeight="700"
      fill="#00E5CC"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
    >
      S
    </text>
  </svg>
);

// N11 - Pembe daire + siyah desenler + beyaz n11
export const N11: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    className={className}
    {...props}
  >
    <circle cx="10" cy="10" r="9" fill="#FF1FFF" />
    
    {/* Siyah organik desenler */}
    <path
      d="M2 4 Q2 2 4 2 L8 2 Q10 2 10 4 L10 8 Q10 10 8 10 L4 10 Q2 10 2 8 Z"
      fill="#1A1A1A"
    />
    <path
      d="M12 12 Q12 10 14 10 L18 10 Q20 10 20 12 L20 16 Q20 18 18 18 L14 18 Q12 18 12 16 Z"
      fill="#1A1A1A"
    />
    
    {/* n11 text */}
    <text
      x="10"
      y="14"
      fontSize="7"
      fontWeight="700"
      fill="white"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
    >
      n11
    </text>
  </svg>
);

// Etsy - Turuncu daire + beyaz E
export const Etsy: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    className={className}
    {...props}
  >
    <circle cx="10" cy="10" r="9" fill="#F56400" />
    <text
      x="10"
      y="14.5"
      fontSize="11"
      fontWeight="600"
      fill="white"
      textAnchor="middle"
      fontFamily="Georgia, serif"
    >
      E
    </text>
  </svg>
);

// eBay - Renkli harfler (kırmızı, mavi, sarı, yeşil)
export const Ebay: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    className={className}
    {...props}
  >
    <text
      x="3"
      y="13"
      fontSize="7"
      fontWeight="600"
      fontFamily="Arial, sans-serif"
    >
      <tspan fill="#E53238">e</tspan>
      <tspan fill="#0064D2">B</tspan>
      <tspan fill="#F5AF02">a</tspan>
      <tspan fill="#86B817">y</tspan>
    </text>
  </svg>
);

// AliExpress - Kırmızı/pembe arkaplan + beyaz AliExpress + sarı yıldız
export const AliExpress: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    className={className}
    {...props}
  >
    <rect x="0" y="0" width="20" height="20" rx="2" fill="#FF3B5C" />
    
    {/* Sarı yıldız ikonları (A harfinin üstü) */}
    <path
      d="M3 6 L3.5 7.5 L5 7.5 L4 8.2 L4.5 9.5 L3 8.5 L1.5 9.5 L2 8.2 L1 7.5 L2.5 7.5 Z"
      fill="#FFD700"
    />
    
    {/* AliExpress text */}
    <text
      x="10"
      y="14"
      fontSize="5"
      fontWeight="500"
      fill="white"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
    >
      AliExpress
    </text>
  </svg>
);

// Shopify - Yeşil arkaplan + beyaz alışveriş çantası
export const Shopify: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    className={className}
    {...props}
  >
    <rect x="0" y="0" width="20" height="20" rx="2" fill="#95BF47" />
    
    {/* Alışveriş çantası + S harfi */}
    <path
      d="M7 6 L6 8 L6 16 C6 16.5 6.5 17 7 17 L13 17 C13.5 17 14 16.5 14 16 L14 8 L13 6 Z"
      fill="white"
    />
    <path
      d="M8 8 C8 6.5 9 5.5 10 5.5 C11 5.5 12 6.5 12 8"
      stroke="white"
      strokeWidth="1"
      fill="none"
    />
    <text
      x="10"
      y="13.5"
      fontSize="6"
      fontWeight="700"
      fill="#95BF47"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
    >
      S
    </text>
  </svg>
);

// Sahibinden - Sarı arkaplan + siyah text + mavi kuş
export const Sahibinden: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    className={className}
    {...props}
  >
    <rect x="1" y="3" width="18" height="14" rx="1.5" fill="#FFE800" />
    
    {/* Mavi kuş simgesi */}
    <circle cx="5" cy="8" r="1.5" fill="#0047BB" />
    <path
      d="M5 9 Q6 10 7 10 L8 10"
      stroke="#0047BB"
      strokeWidth="1"
      fill="none"
      strokeLinecap="round"
    />
    
    {/* sahibinden text */}
    <text
      x="11"
      y="12.5"
      fontSize="4"
      fontWeight="600"
      fill="#000000"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
    >
      sahibinden
    </text>
  </svg>
);

// Letgo - Pembe/kırmızı yuvarlatılmış kare + beyaz el yazısı letgo
export const Letgo: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    className={className}
    {...props}
  >
    <rect x="1" y="1" width="18" height="18" rx="5" fill="#FF4458" />
    <text
      x="10"
      y="13.5"
      fontSize="7"
      fontWeight="400"
      fill="white"
      textAnchor="middle"
      fontFamily="'Comic Sans MS', cursive"
      style={{ fontStyle: 'italic' }}
    >
      letgo
    </text>
  </svg>
);

// Tüm iconları export et
export const MarketplaceLogos = {
  Amazon,
  Trendyol,
  Hepsiburada,
  Shopier,
  N11,
  Etsy,
  Ebay,
  AliExpress,
  Shopify,
  Sahibinden,
  Letgo,
};

export default MarketplaceLogos;