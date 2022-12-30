/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return {
      fallback: [
        {
          source: "/api/:path*",
          destination: "http://127.0.0.1:5000/api/:path*"
        }
      ]
    }
  }
}

module.exports = nextConfig
