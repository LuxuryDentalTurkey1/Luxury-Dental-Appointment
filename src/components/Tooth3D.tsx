"use client";

import dynamic from "next/dynamic";

const ToothScene = dynamic(() => import("./ToothScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0084FF]/30 border-t-[#0084FF]" />
    </div>
  ),
});

export default function Tooth3D() {
  return <ToothScene />;
}
