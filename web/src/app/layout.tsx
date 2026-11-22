import type { Metadata } from "next";
import "./globals.css";
import CompassMark from "../components/CompassMark";

export const metadata: Metadata = {
  title: "Ouija — Cross-site onboarding guidance",
  description: "The light that follows users out. AI-powered cross-site onboarding guidance that sees the page, points the way, never acts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <nav className="ouija-nav" id="ouija-main-nav">
          <a href="/" className="nav-logo">
            <span style={{ color: 'var(--mark-color)', display: 'flex' }}><CompassMark size={18} /></span>
            <span className="nav-logo-name">Ouija</span>
          </a>
          <div className="nav-pill glint">
            <a href="/" className="nav-link">Home</a>
            <a href="/features" className="nav-link">Features</a>
            <a href="/admin" className="nav-link">Admin</a>
            <a href="/pricing" className="nav-link">Pricing</a>
          </div>
          <a href="/#setup" className="nav-cta glint">Demo it →</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
