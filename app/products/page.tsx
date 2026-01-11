import type { Metadata } from "next";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductSort } from "@/components/products/product-sort";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ProductGridWrapper } from "@/components/products/product-grid-wrapper";
import { getAllCategories, getCategoryBySlug } from "@/sanity/lib";

// Revalidation strategy: On-demand revalidation via Sanity webhooks
// Pages will only revalidate when content changes in Sanity CMS
// For development, use `npm run dev` which has hot reloading
export const revalidate = false;

const siteUrl = "https://bubblewrapshop.co.uk";

// Default metadata for /products page (no category filter)
const defaultMetadata = {
  title: "All Packaging Supplies UK | Buy Online | Bubble Wrap Shop",
  description:
    "Browse our complete range of packaging supplies in the UK. Buy bubble wrap, cardboard boxes, packing tape, shipping boxes, and protective packaging materials online. Wholesale pricing. Next day delivery.",
  keywords: [
    "packaging supplies UK",
    "bubble wrap UK",
    "cardboard boxes UK",
    "packing tape UK",
    "shipping boxes UK",
    "protective packaging UK",
    "wholesale packaging UK",
    "buy packaging online",
  ],
};

/**
 * Dynamic Metadata for Products Page
 * Generates unique SEO meta tags based on category filter
 * This helps each category URL (/products?category=bubble-wrap) rank separately
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const categorySlug = sp.category;

  // If no category, return default metadata
  if (!categorySlug) {
    return {
      title: defaultMetadata.title,
      description: defaultMetadata.description,
      keywords: defaultMetadata.keywords,
      openGraph: {
        type: "website",
        title: defaultMetadata.title,
        description: defaultMetadata.description,
        url: `${siteUrl}/products`,
        siteName: "Bubble Wrap Shop",
        images: [`${siteUrl}/og-image.jpg`],
      },
      twitter: {
        card: "summary_large_image",
        title: defaultMetadata.title,
        description: defaultMetadata.description,
        images: [`${siteUrl}/og-image.jpg`],
      },
      alternates: {
        canonical: `${siteUrl}/products`,
      },
    };
  }

  // Fetch category data with SEO fields
  const category = await getCategoryBySlug(categorySlug);

  // Generate display name for fallback
  const categoryDisplayName = categorySlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // Use custom SEO fields from Sanity, or generate defaults
  const seoTitle =
    category?.seoTitle ||
    `${categoryDisplayName} UK | Buy Online | Bubble Wrap Shop`;

  const seoDescription =
    category?.seoDescription ||
    `Buy ${categoryDisplayName.toLowerCase()} online UK. Premium packaging supplies with wholesale pricing. Fast delivery across the UK. Order today!`;

  const seoKeywords = category?.seoKeywords?.length
    ? category.seoKeywords
    : [
        `${categoryDisplayName.toLowerCase()} UK`,
        `buy ${categoryDisplayName.toLowerCase()} online`,
        categoryDisplayName.toLowerCase(),
        "packaging supplies UK",
        "wholesale packaging",
      ];

  const pageUrl = `${siteUrl}/products?category=${categorySlug}`;

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    openGraph: {
      type: "website",
      title: seoTitle,
      description: seoDescription,
      url: pageUrl,
      siteName: "Bubble Wrap Shop",
      images: category?.image
        ? [{ url: category.image, alt: category.imageAlt }]
        : [`${siteUrl}/og-image.jpg`],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: category?.image ? [category.image] : [`${siteUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    size?: string;
    material?: string;
    ecoFriendly?: string;
    priceMin?: string;
    priceMax?: string;
    sort?: string;
  }>;
}) {
  // Fetch categories in parallel with searchParams
  const [sp, categoriesList] = await Promise.all([
    searchParams,
    getAllCategories(),
  ]);

  // Build category options for client filters to ensure exact matching to slugs
  const categoryOptions = (categoriesList || []).map(
    (c: { slug: string; name: string }) => ({
      value: c.slug,
      label: c.name,
    })
  );

  const category = sp.category;
  const categoryDisplayName = category
    ? category
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : null;

  const searchQuery = sp.search?.trim();
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bubblewrapshop.co.uk";

  // CollectionPage structured data for better category indexing
  const collectionStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: categoryDisplayName || "All Packaging Supplies",
    description: category
      ? `Browse our range of ${categoryDisplayName} packaging supplies. Wholesale pricing available. Next day delivery across the UK.`
      : "Browse our complete catalog of packaging supplies including bubble wrap, cardboard boxes, packing tape, and protective packaging.",
    url: category ? `${siteUrl}/products?category=${category}` : `${siteUrl}/products`,
    isPartOf: {
      "@type": "WebSite",
      name: "Bubble Wrap Shop",
      url: siteUrl,
    },
    provider: {
      "@type": "Organization",
      name: "Bubble Wrap Shop",
      url: siteUrl,
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-emerald-50 via-white to-teal-50">
      {/* CollectionPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionStructuredData) }}
      />
      
      <div className="relative z-10">
        {/* Breadcrumbs */}
        <div className="border-b border-emerald-200 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px] py-6">
            <Breadcrumbs
              items={[
                { label: "Products", href: "/products" },
                ...(categoryDisplayName
                  ? [
                      {
                        label: categoryDisplayName,
                        href: `/products?category=${category}`,
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px] py-8 md:py-12">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="mb-2 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 flex items-center gap-3">
                <div className="h-1 w-8 bg-linear-to-r from-emerald-600 to-teal-600 rounded-full"></div>
                {searchQuery
                  ? `Search Results: "${searchQuery}"`
                  : categoryDisplayName || "All Products"}
              </h1>
              <p className="mt-2 text-sm text-gray-600 sm:text-base">
                {searchQuery
                  ? `Found products matching your search`
                  : "Browse our complete catalog of eco-friendly packaging solutions"}
              </p>
            </div>
            <ProductSort currentSort={sp.sort || "newest"} />
          </div>

          {/* Filters and Grid */}
          <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <ProductFilters categories={categoryOptions} />
            </div>
            <div className="lg:col-span-3">
              <ProductGridWrapper searchParams={sp} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
