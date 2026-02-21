"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function StationsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = searchParams.toString();
    const nextUrl = params ? `/?${params}#stations` : "/#stations";
    router.replace(nextUrl);
  }, [router, searchParams]);

  return null;
}

export default function StationsPage() {
  return (
    <Suspense fallback={null}>
      <StationsRedirect />
    </Suspense>
  );
}
