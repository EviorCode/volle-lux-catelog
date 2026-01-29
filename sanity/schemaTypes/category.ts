import { defineType, defineField } from "sanity";

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Category Name",
      type: "string",
      validation: (Rule) => Rule.required().min(1).max(100),
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
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "image",
      title: "Category Image",
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
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: true,
      description: "Whether this category is visible on the website",
    }),
    defineField({
      name: "sortOrder",
      title: "Sort Order",
      type: "number",
      initialValue: 0,
      description: "Lower numbers appear first",
    }),
    // SEO Fields
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      description:
        "Custom title for search engines (50-60 chars). Include PRIMARY keyword. E.g., 'Bubble Wrap UK | Buy Online | Bubble Wrap Shop'",
      validation: (Rule) => Rule.max(70),
      group: "seo",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 3,
      description:
        "Custom description for search engines (150-160 chars). Include PRIMARY + SECONDARY keywords naturally.",
      validation: (Rule) => Rule.max(170),
      group: "seo",
    }),
    defineField({
      name: "seoKeywords",
      title: "SEO Keywords",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
      description:
        "Add 5-10 keywords. First 1-2 should be PRIMARY keywords (e.g., 'bubble wrap UK'), rest are SECONDARY.",
      group: "seo",
    }),

    // === 2026 AI & EEAT FIELDS ===
    defineField({
      name: "llmSummary",
      title: "AI Summary (LLM Optimized)",
      type: "text",
      rows: 3,
      group: "seo",
      description:
        "2-3 sentence summary for AI Overviews. Include: what products are in this category, who they're for, key benefit. Example: 'Quality bubble wrap rolls for protecting fragile items during shipping and storage. Ideal for ecommerce sellers, removals companies, and businesses. Available in small and large bubble sizes with next-day delivery from Blackburn.'",
    }),
    defineField({
      name: "expertTip",
      title: "Expert Tip (EEAT)",
      type: "text",
      rows: 2,
      group: "seo",
      description:
        "Pro tip from packaging experts for this category. Builds trust/authority. Example: 'Our packaging specialists recommend using large bubble wrap (25mm) for heavy items and small bubble (10mm) for delicate electronics.'",
    }),
    defineField({
      name: "faqs",
      title: "Category FAQs",
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
              rows: 3,
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
      description:
        "Category-specific FAQs generate rich snippets. Add 3-5 relevant questions. Example: 'What bubble wrap size should I use?' or 'How much bubble wrap do I need?'",
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
        "3-5 specific use cases for entity saliency. Example: 'Moving house', 'eBay packaging', 'Warehouse storage', 'Fragile item protection'",
    }),
  ],
  groups: [
    {
      name: "seo",
      title: "SEO & AI Optimization",
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "slug.current",
      media: "image",
    },
  },
  orderings: [
    {
      title: "Sort Order",
      name: "sortOrderAsc",
      by: [{ field: "sortOrder", direction: "asc" }],
    },
    {
      title: "Name A-Z",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
  ],
});

