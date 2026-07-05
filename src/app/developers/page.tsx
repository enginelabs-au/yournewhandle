import type { Metadata } from "next";
import { ApiDocsPageWithSuspense } from "@/components/developers/ApiDocsPage";

export const metadata: Metadata = {
  title: "API Documentation",
  description:
    "Paid API for programmatic handle generation and username availability checks across hundreds of platforms.",
};

export default function DevelopersPage() {
  return <ApiDocsPageWithSuspense />;
}
