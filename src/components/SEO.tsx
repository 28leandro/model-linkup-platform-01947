import { Helmet } from "react-helmet-async";

const SITE_URL = "https://nemu.com.py";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png?v=12`;

export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  noIndex?: boolean;
  structuredData?: Record<string, any> | Record<string, any>[];
}

const buildCanonical = (canonical?: string) => {
  if (!canonical) return undefined;
  if (canonical.startsWith("http")) return canonical;
  return `${SITE_URL}${canonical.startsWith("/") ? "" : "/"}${canonical}`;
};

export default function SEO({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noIndex = false,
  structuredData,
}: SEOProps) {
  const finalCanonical = buildCanonical(canonical);
  const finalOgTitle = ogTitle ?? title;
  const finalOgDesc = ogDescription ?? description;
  const ldArray = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="robots"
        content={noIndex ? "noindex, nofollow" : "index, follow"}
      />
      {finalCanonical && <link rel="canonical" href={finalCanonical} />}

      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="NEMU.py" />
      <meta property="og:locale" content="es_PY" />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDesc} />
      {finalCanonical && <meta property="og:url" content={finalCanonical} />}
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalOgTitle} />
      <meta name="twitter:description" content={finalOgDesc} />
      <meta name="twitter:image" content={ogImage} />

      {ldArray.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}
