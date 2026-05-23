import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "../styles/index.css";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import { CurrencyProvider } from "./components/providers/CurrencyProvider";

export const metadata = {
  title: "Toko Lumina",
  description: "Dibuat dengan Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#0f172a", // slate-900
          colorBackground: "#ffffff",
          colorText: "#0f172a",
          colorInputBackground: "#ffffff",
          colorInputText: "#0f172a",
          borderRadius: "0.375rem",
        },
        elements: {
          card: "shadow-none border border-zinc-200",
          formButtonPrimary:
            "bg-slate-900 hover:bg-slate-800 text-white shadow-none",
          footerActionLink: "text-slate-900 hover:text-slate-700",
        },
      }}
    >
      <html lang="id">
        <body className="font-sans antialiased">
          <ThemeProvider>
            <CurrencyProvider>
              {children}
            </CurrencyProvider>
          </ThemeProvider>
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
