// Category FAQ for rich snippets
export interface CategoryFaq {
  question: string;
  answer: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageAlt?: string; // Alt text for category image (SEO)
  isActive?: boolean;
  sortOrder?: number;

  // Basic SEO fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];

  // 2026 AI & EEAT fields
  llmSummary?: string; // AI-optimized summary for SGE/AI Overviews
  expertTip?: string; // EEAT expert advice
  faqs?: CategoryFaq[]; // Category FAQs for rich snippets
  useCases?: string[]; // Common use cases for entity saliency
}
