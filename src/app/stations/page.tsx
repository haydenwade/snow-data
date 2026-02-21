"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function StationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = searchParams.toString();
    const nextUrl = params ? `/?${params}#stations` : "/#stations";
    router.replace(nextUrl);
  }, [router, searchParams]);

  return null;
}
