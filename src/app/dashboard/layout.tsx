import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "./layout-client"; // We will create this next

// This is now a Server Component. Its only job is to protect the routes.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user is logged in, redirect them to the login page.
  // This check now runs reliably on the server for every dashboard page.
  if (!user) {
    redirect("/login");
  }

  // If the user is logged in, render the client-side layout and the page content.
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}

