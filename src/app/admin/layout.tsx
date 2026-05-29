import AdminSidebar from "../components/admin/AdminSidebar";
import GlobalTopbar from "../components/admin/GlobalTopbar";
import { SecurityVerification } from "../components/admin/SecurityVerification";
import { SessionTimeout } from "../components/admin/SessionTimeout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans transition-colors duration-300 admin-scrollbar-hide">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen relative min-w-0">
        <GlobalTopbar />
        <main className="flex-1 overflow-y-auto bg-background/50">
          <SecurityVerification>
            <SessionTimeout />
            {children}
          </SecurityVerification>
        </main>
      </div>
    </div>
  );
}
