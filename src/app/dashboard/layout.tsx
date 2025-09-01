import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "./layout-client";

// This Server Component now acts as the security guard for all dashboard pages.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user is logged in, this will reliably redirect to the login page.
  if (!user) {
    redirect("/login");
  }

  // If the user is logged in, it will render the UI.
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}

