import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'Teen Patti Royale - Real Stakes Gaming Platform',
  description: 'Professional-grade MVP real-money Teen Patti gaming engine with live wallet, super admin dashboard & AI opponents.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#06090d] text-slate-100 antialiased selection:bg-gold-500 selection:text-black">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
