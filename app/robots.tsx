export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://rymdle.vercel.app/sitemap.xml",
  };
}