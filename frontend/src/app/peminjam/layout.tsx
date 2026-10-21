import Sidebar from '@/components/sidebar';

export default function PeminjamLayout({ children }: { children: React.ReactNode }) {
  return (
    <Sidebar role="peminjam">
      {children}
    </Sidebar>
  );
}
