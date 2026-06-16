"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Tooth3D from "@/components/Tooth3D";

// Desktop gets the 3D tooth; mobile/tablet gets a flat brand logo instead, so
// the heavy ~17MB model is never downloaded on phones and there is no slow,
// empty placeholder area while it loads.
export default function HeroVisual() {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (desktop) return <Tooth3D />;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Image
        src="/logo-mark.png"
        alt="Luxury Dental Turkey"
        width={420}
        height={420}
        priority
        className="h-auto w-[70%] max-w-[300px]"
      />
    </div>
  );
}
