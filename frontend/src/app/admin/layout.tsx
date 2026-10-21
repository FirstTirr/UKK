// app/(admin)/layout.tsx
import Sidebar from '@/components/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Sidebar role="admin">
      {children}
    </Sidebar>
  );
}