"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";

export function RoleRedirect({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If Clerk is not loaded or user is not logged in, we can't do anything
    if (!isLoaded || !user) return;

    // Bypass for auth routes to prevent loops/blocks
    if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up") || pathname.startsWith("/auth-callback")) {
      return;
    }

    const role = (user.publicMetadata?.role as string) || (user.unsafeMetadata?.role as string);
    const isAdminEmail = user.emailAddresses.some(e => e.emailAddress === "dio13abiyyu@gmail.com");
    const isAdmin = role?.toLowerCase() === "admin" || isAdminEmail;

    // If user is admin and hits the storefront root, redirect to dashboard
    if (isAdmin && pathname === "/") {
      router.push("/admin/dashboard");
    }
  }, [isLoaded, user, router, pathname]);

  // ALWAYS return children to ensure Clerk forms and app content are never blocked
  return <>{children}</>;
}
