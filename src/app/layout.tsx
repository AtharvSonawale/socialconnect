import "./globals.css";
import { ReactNode } from "react";
import ThemeProviderWrapper from "../components/ThemeProviderWrapper";

export const metadata = {
  title: "SocialConnect",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        {/* ThemeProviderWrapper handles adding/removing `dark` on <html> */}
        <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
      </body>
    </html>
  );
}
