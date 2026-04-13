// @/lib/changelog-data.ts

export interface ChangelogEntry {
  id: string
  version: string
  date: string
  title: string
  description?: string
  changes: {
    type: "added" | "fixed" | "improved" | "deprecated"
    items: string[]
  }[]
  image?: string
}

export const changelogData: ChangelogEntry[] = [
  {
    id: "1",
    version: "2.4.0",
    date: "February 28, 2026",
    title: "Introducing Analytics Dashboard & Bulk Exports",
    description:
      "Our biggest update yet! We've added a comprehensive analytics suite to help you track your business growth.",
    changes: [
      {
        type: "added",
        items: [
          "New Analytics Dashboard with real-time sales tracking.",
          "Bulk export functionality for orders and customers (CSV/PDF).",
          "Advanced filtering options for enquiry management.",
        ],
      },
      {
        type: "improved",
        items: [
          "Optimized database queries for faster loading on large product lists.",
          "Updated UI for the enquiry detail view for better readability.",
        ],
      },
      {
        type: "fixed",
        items: [
          "Resolved an issue where some images were not loading on mobile devices.",
          "Fixed a bug in the newsletter subscription form validation.",
        ],
      },
    ],
    image: "https://picsum.photos/seed/changelog1/1200/600",
  },
  {
    id: "2",
    version: "2.3.2",
    date: "February 15, 2026",
    title: "Performance Improvements & UI Polish",
    description:
      "This version focuses on performance and some much-needed UI refinements across the admin panel.",
    changes: [
      {
        type: "improved",
        items: [
          "Reduced bundle size by 15% through better code splitting.",
          "Smoother transitions between dashboard tabs.",
        ],
      },
      {
        type: "fixed",
        items: [
          "Fixed sidebar toggle behavior on iPad devices.",
          "Corrected translation strings in the settings menu.",
        ],
      },
    ],
  },
  {
    id: "3",
    version: "2.3.0",
    date: "January 20, 2026",
    title: "New Inventory Management System",
    description:
      "We've completely rebuilt the inventory system to support multi-warehouse tracking and stock alerts.",
    changes: [
      {
        type: "added",
        items: [
          "Multi-warehouse stock tracking support.",
          "Automated low-stock alerts via email and SMS.",
          "Support for batch editing product prices.",
        ],
      },
    ],
    image: "https://picsum.photos/seed/changelog3/1200/600",
  },
]
