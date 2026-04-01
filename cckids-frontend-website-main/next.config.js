// next.config.js
const toRemotePattern = (value) => {
  if (!value) return null;

  try {
    const url = new URL(value);
    return {
      protocol: url.protocol.replace(':', ''),
      hostname: url.hostname,
      pathname: '/**',
    };
  } catch {
    return null;
  }
};

const remotePatterns = [
  toRemotePattern('https://api.cckkids.com'),
  toRemotePattern(process.env.NEXT_PUBLIC_API_BASE_URL),
  toRemotePattern(process.env.NEXT_PUBLIC_MEDIA_BASE_URL),
].filter(Boolean);

const disableImageOptimization = process.env.NEXT_DISABLE_IMAGE_OPTIMIZATION === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns,
    unoptimized: disableImageOptimization,
  },
};

module.exports = nextConfig;
