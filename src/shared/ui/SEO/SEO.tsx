import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
}

export const SEO = ({ title, description, image, url }: SEOProps) => {
  const metaDescription = description || "실시간 날씨 정보를 확인하세요.";
  const metaImage = image || "/og-image.svg"; // Default image path
  const metaUrl = url || window.location.href;

  return (
    <Helmet>
      <title>{title} | Weather App</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content="index, follow" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
  );
};
