"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/register/Footer";
import { useLanguage } from "@/lib/i18n";

export default function NotFound() {
  const { lang } = useLanguage();
  const french = lang === "fr";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main
        id="main-content"
        className="state-view flex-1 w-full"
        tabIndex={-1}
      >
        <p className="eyebrow">404</p>
        <h1>{french ? "Page introuvable." : "Page not found."}</h1>
        <p>
          {french
            ? "Cette adresse ne correspond à aucune page. Retournez au registre pour explorer les systèmes d’IA déclarés."
            : "There is no page at this address. Return to the register to explore reported AI systems."}
        </p>
        <Link className="button button-primary" href={`/?lang=${lang}`}>
          {french ? "Retour au registre" : "Back to the register"}
        </Link>
      </main>
      <Footer />
    </div>
  );
}
