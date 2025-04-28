import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Banque Rupt",
  description: "Votre banque en ligne sécurisée",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning={true} className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-gray-100`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
