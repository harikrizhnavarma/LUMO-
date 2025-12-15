// convex/auth.config.ts

export default {
  providers: [
    {
      // Convex HTTP Actions URL
      // e.g. https://qualified-giraffe-605.convex.site
      domain: process.env.CONVEX_SITE_URL,
      // Fixed application ID used by Convex Auth
      applicationID: "convex",
    },
  ],
};
