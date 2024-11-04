const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@dirac-grid/diracx-web-components"],
  webpack: (config) => {
    config.resolve.alias["@dirac-grid/diracx-web-components"] = path.resolve(
      __dirname,
      "../diracx-web-components/src",
    );
    return config;
  },
};

module.exports = nextConfig;
