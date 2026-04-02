"use client";

import { Suspense } from "react";
import { CreateEventContent } from "./CreateEventContent";
import PageLoading from "@/components/PageLoading";

export default function CreateEventPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <CreateEventContent />
    </Suspense>
  );
}
