import { Suspense } from "react";
import Header from "../components/Header";
import { CartProvider } from "../../lib/CartContext";
import FooterLanding from "../components/FooterLanding";
import { Toaster } from "../components/ui/sonner";
import TelemetryTracker from "../components/TelemetryTracker";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white flex flex-col w-full overflow-x-hidden">
        <Suspense fallback={null}>
          <TelemetryTracker />
        </Suspense>
        <Header />


        <main className="flex-grow pt-16">{children}</main>

        <FooterLanding />

        <Toaster position="top-right" />
      </div>
    </CartProvider>
  );
}
