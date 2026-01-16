export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-default-100 dark:to-default-50 p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
