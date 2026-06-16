import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminTopNav from "@/components/admin/AdminTopNav";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <AdminTopNav email={user.email ?? ""} />
      <main className="mx-auto max-w-[1200px] px-5 py-8">{children}</main>
    </div>
  );
}
