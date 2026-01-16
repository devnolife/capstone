import { Sidebar } from '@/components/ui/sidebar';
import { Header } from '@/components/ui/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-default-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
