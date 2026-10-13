"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/language";
import {
  canonicalStatus,
  dept,
  field,
  sourceField,
  summary,
  type SourceRecord,
} from "@/lib/register/model";
import type { Translate } from "@/lib/register/copy";
import { number, statusName } from "./shared";

const features = [
  ["2526-NRC-CNRC-022", "seaIce"],
  ["2526-NRC-CNRC-016", "translation"],
  ["2526-NRCan-RNCan-006", "flooding"],
  ["2526-AAFC-AAC-003", "cropMaps"],
];
export default function Hero({
  records,
  lang,
  t,
  onOpen,
  onExplore,
  onSearch,
}: {
  records: SourceRecord[];
  lang: Lang;
  t: Translate;
  onOpen: (id: string) => void;
  onExplore: () => void;
  onSearch: (query: string) => void;
}) {
  const [selected, setSelected] = useState(features[0][0]);
  const [query, setQuery] = useState("");
  const exhibit = useRef<HTMLDivElement>(null),
    preview = useRef<HTMLElement>(null),
    controls = useRef<HTMLDivElement>(null);
  const available = features.filter(([id]) =>
    records.some((record) => record.ai_register_id === id),
  );
  const record =
    records.find((row) => row.ai_register_id === selected) ??
    records.find((row) => row.ai_register_id === available[0]?.[0]) ??
    records[0];
  const stats = summary(records);
  useEffect(() => {
    if (!preview.current) return;
    const artwork = Array.from(exhibit.current?.querySelectorAll<HTMLElement>(".archive-art") ?? []);
    const size = () => {
      exhibit.current?.style.setProperty(
        "--record-height",
        `${Math.ceil(preview.current?.offsetHeight ?? 0)}px`,
      );
      const artBottom = Math.max(0, ...artwork
        .filter((image) => image.offsetWidth > 0)
        .map((image) => image.offsetTop + image.offsetHeight));
      exhibit.current?.style.setProperty("--art-bottom", `${Math.ceil(artBottom)}px`);
      exhibit.current?.style.setProperty(
        "--controls-height",
        `${Math.ceil(controls.current?.offsetHeight ?? 0)}px`,
      );
    };
    const observer = new ResizeObserver(size);
    observer.observe(preview.current);
    artwork.forEach((image) => observer.observe(image));
    if (controls.current) observer.observe(controls.current);
    size();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    preview.current?.animate(
      [
        { opacity: 0.4, transform: "translateY(5px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 220, easing: "ease-out" },
    );
  }, [selected]);
  if (!record) return null;
  const description = sourceField(record, "description_ai_system", lang);
  const excerpt = description.text.split(/(?<=[.!?])\s+/)[0];
  const count = records.filter(
    (item) => item.government_organization === record.government_organization,
  ).length;
  return (
    <section className="hero shell" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="eyebrow-dot" aria-hidden="true" />
          {t("eyebrow")}
        </p>
        <h1 id="hero-title">
          <span>{t("heroLine1")}</span>
          <br />
          <span>{t("heroLine2").replace(/[.]$/, "")}</span>
        </h1>
        <p className="hero-intro">{t("heroIntro")}</p>
        {/* Phones only: the full search panel sits several screens below the artwork. */}
        <form
          className="hero-search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            onSearch(query.trim().slice(0, 500));
            // The main search box now holds the query; clearing here avoids a stale copy.
            setQuery("");
          }}
        >
          <label className="sr-only" htmlFor="hero-search">
            {t("searchLabel")}
          </label>
          <input
            type="search"
            id="hero-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("heroSearchPlaceholder")}
            autoComplete="off"
            maxLength={500}
            enterKeyHint="search"
          />
          <button type="submit" className="button">
            {t("searchButton")}
          </button>
        </form>
        <div className="hero-actions">
          <a
            className="button button-primary"
            href="#register"
            onClick={onExplore}
          >
            {t("explore")}
            <span className="arrow" aria-hidden="true">
              ↗
            </span>
          </a>
          <button
            className="button-quiet"
            onClick={() => onOpen(record.ai_register_id)}
          >
            {t("openRecord")}
            <span className="arrow" aria-hidden="true">
              +
            </span>
          </button>
        </div>
        <div className="hero-facts">
          <p>
            <strong>{number(stats.total, lang)}</strong>
            <span>{t("systems")}</span>
          </p>
          <p>
            <strong>{number(stats.organisations, lang)}</strong>
            <span>{t("organisations")}</span>
          </p>
        </div>
        <p className="hero-note">{t("footerLine")}</p>
        <Link className="walkthrough-link" href="/walkthrough">
          ▷ {t("watchWalkthrough")}
        </Link>
      </div>
      <div
        className="exhibit"
        ref={exhibit}
        role="group"
        aria-label={t("selectedRecord")}
      >
        <div className="exhibit-label">
          <span>
            {dept(record.government_organization, lang)}
            <span className="scope-count">
              <strong>{number(count, lang)}</strong>
              {t("scopeCount", { total: number(records.length, lang) })}
            </span>
          </span>
          <span className="edition">
            {t("exampleOf", {
              n: Math.max(
                0,
                available.findIndex(([id]) => id === record.ai_register_id),
              ) + 1,
              total: available.length || 1,
            })}
          </span>
        </div>
        {/* Artwork is illustrative; the overlaid record is live source text. */}
        <img
          className="archive-art archive-light"
          src="/register/archive-light-v2.webp"
          width="1536"
          height="1024"
          fetchPriority="high"
          alt=""
          aria-hidden="true"
        />
        <img
          className="archive-art archive-dark"
          src="/register/archive-dark-v2.webp"
          width="1536"
          height="1024"
          alt=""
          aria-hidden="true"
        />
        <article
          className="record-preview"
          ref={preview}
          aria-live="polite"
          data-record-id={record.ai_register_id}
        >
          <div className="preview-top">
            <span>{t("status")}</span>
            <span className="preview-status">
              {statusName(canonicalStatus(record), t)}
            </span>
          </div>
          <h2 lang={sourceField(record, "name_ai_system", lang).language}>
            {field(record, "name_ai_system", lang)}
          </h2>
          <p className="preview-organisation">
            {dept(record.government_organization, lang)}
          </p>
          <blockquote lang={description.language}>
            {description.missing ? t("notSpecified") : `“${excerpt}”`}
          </blockquote>
          {description.fallback && (
            <span className="fallback-label">
              {t(
                description.language === "en"
                  ? "englishFallback"
                  : "frenchFallback",
              )}
            </span>
          )}
          <div className="preview-footer">
            <span className="source-id">
              <small>{t("sourceRecord")}</small>
              {record.ai_register_id}
            </span>
            <button onClick={() => onOpen(record.ai_register_id)}>
              {t("readRecord")}
              <span className="arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          </div>
        </article>
        <div className="exhibit-controls" ref={controls}>
          <p>{t("heroExamples")}</p>
          <div
            className="feature-nav"
            role="group"
            aria-label={t("heroExamples")}
          >
            {available.map(([id, name]) => (
              <button
                type="button"
                key={id}
                onClick={() => setSelected(id)}
                aria-pressed={record.ai_register_id === id}
              >
                {t(name)}
              </button>
            ))}
          </div>
          <p className="art-note">{t("generatedArt")}</p>
        </div>
      </div>
    </section>
  );
}
