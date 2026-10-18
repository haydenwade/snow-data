// All environment variables are read here and imported elsewhere.
// NEXT_PUBLIC_ values are inlined into the browser bundle at build time.
export const config = {
  /** CARTO Basemaps key; domain-restricted in the CARTO dashboard. */
  cartoApiKey: process.env.NEXT_PUBLIC_CARTO_API_KEY ?? "",
};
