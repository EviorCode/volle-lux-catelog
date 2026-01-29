import { defineType, defineField } from "sanity";

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
      validation: (Rule) => Rule.required().min(1).max(200),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "productCode",
      title: "Product Code",
      type: "string",
      description: "Internal product code/SKU",
      validation: (Rule) => Rule.required().min(1).max(50),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      description: "Main product description",
    }),
    defineField({
      name: "shortDescription",
      title: "Short Description",
      type: "text",
      rows: 2,
      description: "Brief description for product cards",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "mainImage",
      title: "Main Image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          description: "Important for SEO and accessibility.",
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "galleryImages",
      title: "Gallery Images",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alternative Text",
            },
          ],
        },
      ],
      description: "Additional images for product gallery",
    }),
    defineField({
      name: "basePrice",
      title: "Base Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
      description: "Base price per unit",
    }),
    defineField({
      name: "discount",
      title: "Discount Percentage",
      type: "number",
      validation: (Rule) => Rule.min(0).max(100),
      description: "Overall discount percentage (0-100)",
    }),
    defineField({
      name: "variants",
      title: "Product Variants",
      type: "array",
      of: [{ type: "productVariant" }],
      description: "Different sizes, colors, or options for this product",
    }),
    defineField({
      name: "pricingTiers",
      title: "Pricing Tiers",
      type: "array",
      of: [{ type: "pricingTier" }],
      description: "Bulk pricing tiers for different quantities",
    }),
    defineField({
      name: "specifications",
      title: "Specifications",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "name",
              type: "string",
              title: "Specification Name",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "value",
              type: "string",
              title: "Specification Value",
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              name: "name",
              value: "value",
            },
            prepare({ name, value }) {
              return {
                title: `${name}: ${value}`,
              };
            },
          },
        },
      ],
      description: "Product specifications and details",
    }),
    defineField({
      name: "delivery",
      title: "Delivery Information",
      type: "text",
      rows: 3,
      description: "Delivery time, shipping info, etc.",
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: true,
      description: "Whether this product is visible on the website",
    }),
    defineField({
      name: "isFeatured",
      title: "Featured Product",
      type: "boolean",
      initialValue: false,
      description: "Whether this product appears in featured sections",
    }),
    defineField({
      name: "isNewArrival",
      title: "New Arrival",
      type: "boolean",
      initialValue: false,
      description: "Whether this product is marked as new",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
      description: "Tags for filtering and organization",
    }),
    // === SEO FIELDS GROUP ===
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      group: "seo",
      description:
        "Custom title for search engines (50-60 chars). Include PRIMARY keyword first.",
      validation: (Rule) => Rule.max(70),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 2,
      group: "seo",
      description:
        "Custom description for search engines (150-160 chars). Include PRIMARY + SECONDARY keywords naturally.",
      validation: (Rule) => Rule.max(170),
    }),
    defineField({
      name: "seoKeywords",
      title: "SEO Keywords",
      type: "array",
      of: [{ type: "string" }],
      group: "seo",
      options: {
        layout: "tags",
      },
      description:
        "Add 5-10 keywords. First 1-2 should be PRIMARY keywords, rest are SECONDARY.",
    }),

    // === 2026 AI & EEAT FIELDS ===
    defineField({
      name: "llmSummary",
      title: "AI Summary (LLM Optimized)",
      type: "text",
      rows: 3,
      group: "seo",
      description:
        "2-3 sentence summary for AI Overviews. Include: what it is, who it's for, key benefit. Example: 'Heavy-duty bubble wrap rolls ideal for ecommerce sellers shipping fragile items. 100m length with large bubbles provides superior cushioning. Dispatched same-day from Blackburn warehouse.'",
    }),
    defineField({
      name: "expertTip",
      title: "Expert Tip (EEAT)",
      type: "text",
      rows: 2,
      group: "seo",
      description:
        "Pro tip from packaging experts. Builds trust/authority. Example: 'Our packaging team recommends double-wrapping items over 5kg for maximum protection during transit.'",
    }),
    defineField({
      name: "materialFeel",
      title: "Material & Feel Description",
      type: "text",
      rows: 2,
      group: "seo",
      description:
        "Describe texture, thickness, feel (helps AI understand physical properties). Example: 'Soft, pliable bubble wrap with 10mm air-filled bubbles.'",
    }),
    defineField({
      name: "useCases",
      title: "Common Use Cases",
      type: "array",
      of: [{ type: "string" }],
      group: "seo",
      options: {
        layout: "tags",
      },
      description:
        "3-5 specific use cases for entity linking. Example: 'Moving house', 'eBay seller packaging', 'Fragile gift wrapping'",
    }),
    defineField({
      name: "faqs",
      title: "Product FAQs",
      type: "array",
      group: "seo",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "question",
              type: "string",
              title: "Question",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "answer",
              type: "text",
              title: "Answer",
              rows: 2,
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              title: "question",
            },
          },
        },
      ],
      description: "FAQs generate rich snippets in search results. Add 2-4 questions.",
    }),

    // === GOOGLE SHOPPING / MERCHANT FIELDS ===
    defineField({
      name: "gtin",
      title: "GTIN/Barcode",
      type: "string",
      group: "merchant",
      description: "Global Trade Item Number (EAN/UPC barcode). Required for Google Shopping.",
    }),
    defineField({
      name: "mpn",
      title: "MPN (Manufacturer Part Number)",
      type: "string",
      group: "merchant",
      description: "Manufacturer's part number if applicable.",
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "string",
      group: "merchant",
      initialValue: "Bubble Wrap Shop",
      description: "Product brand for Google Shopping. Defaults to 'Bubble Wrap Shop'.",
    }),
    defineField({
      name: "weight",
      title: "Weight (kg)",
      type: "number",
      group: "merchant",
      description: "Product weight in kilograms for shipping calculations and schema.",
    }),
    defineField({
      name: "dimensions",
      title: "Dimensions",
      type: "object",
      group: "merchant",
      fields: [
        { name: "length", type: "number", title: "Length (cm)" },
        { name: "width", type: "number", title: "Width (cm)" },
        { name: "height", type: "number", title: "Height (cm)" },
      ],
      description: "Product dimensions in centimeters for schema markup.",
    }),
  ],
  groups: [
    {
      name: "seo",
      title: "SEO & AI Optimization",
    },
    {
      name: "merchant",
      title: "Google Shopping / Merchant",
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "productCode",
      media: "mainImage",
      category: "category.name",
    },
    prepare({ title, subtitle, media, category }) {
      return {
        title,
        subtitle: `${subtitle}${category ? ` • ${category}` : ""}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Name A-Z",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
    {
      title: "Price Low-High",
      name: "priceAsc",
      by: [{ field: "basePrice", direction: "asc" }],
    },
    {
      title: "Price High-Low",
      name: "priceDesc",
      by: [{ field: "basePrice", direction: "desc" }],
    },
    {
      title: "Featured First",
      name: "featuredFirst",
      by: [
        { field: "isFeatured", direction: "desc" },
        { field: "name", direction: "asc" },
      ],
    },
  ],
});
