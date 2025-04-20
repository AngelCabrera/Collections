import withPWA from "next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development
});

const nextConfig = {
  /* config options here */
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
  },
};

export default pwaConfig(nextConfig);
