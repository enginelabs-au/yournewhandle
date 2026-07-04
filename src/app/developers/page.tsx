import type { Metadata } from "next";
import { ApiDocsPage } from "@/components/developers/ApiDocsPage";

export const metadata: Metadata = {
  title: "API Documentation — yournewhandle",
  description:
    "Paid API for programmatic handle generation and username availability checks across hundreds of platforms.",
};

export default function DevelopersPage() {
  return <ApiDocsPage />;
}
