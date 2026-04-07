import LibraryHeader from '@/components/shell/LibraryHeader';
import Footer from '@/components/Footer';

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LibraryHeader />
      {children}
      <Footer />
    </>
  );
}
