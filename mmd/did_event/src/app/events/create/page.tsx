"use client";

import { Suspense } from "react";
import { CreateEventContent } from "./CreateEventContent";

export default function CreateEventPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>}>
      <CreateEventContent />
    </Suspense>
  );
}
