import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/components/i18n-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarWrapper } from "@/components/sidebar-wrapper";
import { DateRangeProvider } from "@/contexts/date-range-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DeFender X - Advanced Security Operations Platform",
  description: "Real-time security monitoring dashboard for EDR/XDR platforms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <DateRangeProvider defaultValue="3d">
              <SidebarProvider defaultOpen={false}>
                <SidebarWrapper />
                <main className="w-full flex flex-col h-screen overflow-hidden">
                  <div className="flex-1 overflow-auto">
                    {children}
                  </div>
                </main>
                <Toaster />
              </SidebarProvider>
            </DateRangeProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
