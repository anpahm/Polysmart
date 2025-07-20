export default function HeroLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'SF Pro', 'Segoe UI', 'Roboto', Arial, sans-serif" }}>
      {children}
    </div>
  );
} 