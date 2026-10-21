import Sidebar from '@/components/sidebar';

export default function PetugasLayout({ children }: { children: React.ReactNode }) {
  return (
    <Sidebar role="petugas">
      {children}
    </Sidebar>
  );
}
