import LibraryHeader from '@/components/shell/LibraryHeader';
import LibraryFooter from '@/components/shell/LibraryFooter';

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="library-theme min-h-screen bg-white text-black font-[family-name:var(--font-inter)]">
      <LibraryHeader />
      <main>{children}</main>
      <LibraryFooter />
    </div>
  );
}
