export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-black font-[family-name:var(--font-inter)]">
      {children}
    </div>
  );
}
