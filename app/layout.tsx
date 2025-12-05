import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NutriDash - Panel de Nutrición",
  description: "Dashboard profesional para nutricionistas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} antialiased`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 ml-64 transition-all duration-300">
            <Header />
            <main className="p-8 bg-background min-h-[calc(100vh-5rem)]">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
