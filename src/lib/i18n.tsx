'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { AISystem } from './types'

export type Lang = 'en' | 'fr'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
  field: (system: AISystem, base: string) => string
  deptName: (org: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

// ── Bilingual field helper ──────────────────────────────────────────────────

function getField(system: AISystem, base: string, lang: Lang): string {
  const key = `${base}_${lang}` as keyof AISystem
  const fallback = `${base}_${lang === 'en' ? 'fr' : 'en'}` as keyof AISystem
  return (system[key] as string) || (system[fallback] as string) || ''
}

// ── Department name helper ──────────────────────────────────────────────────
// government_organization is typically "English Name / French Name"

function getDeptName(org: string, lang: Lang): string {
  if (!org) return ''
  const parts = org.split(' / ')
  if (parts.length < 2) return org
  return lang === 'fr' ? parts[1].trim() : parts[0].trim()
}

// ── Translations ────────────────────────────────────────────────────────────

const translations: Record<string, { en: string; fr: string }> = {
  // Layout & navigation
  'skip_nav': { en: 'Skip to main content', fr: 'Passer au contenu principal' },
  'source_data': { en: 'Source Data', fr: 'Donn\u00e9es source' },
  'source_data_aria': { en: 'View source data on open.canada.ca (opens in new tab)', fr: 'Voir les donn\u00e9es source sur ouvert.canada.ca (ouvre dans un nouvel onglet)' },
  'retro_enable': { en: '90s Mode', fr: 'Mode ann\u00e9es 90' },
  'retro_disable': { en: 'Exit 90s', fr: 'Quitter 90s' },
  'retro_enable_aria': { en: 'Enable 90s retro mode', fr: 'Activer le mode r\u00e9tro ann\u00e9es 90' },
  'retro_disable_aria': { en: 'Disable 90s retro mode', fr: 'D\u00e9sactiver le mode r\u00e9tro ann\u00e9es 90' },
  'theme_switch_dark': { en: 'Switch to dark mode', fr: 'Passer au mode sombre' },
  'theme_switch_light': { en: 'Switch to light mode', fr: 'Passer au mode clair' },

  // Hero
  'hero_title_1': { en: 'AI Register', fr: 'Registre d\u2019IA' },
  'hero_title_2': { en: 'Explorer', fr: 'Explorateur' },
  'hero_subtitle': {
    en: 'An open directory of artificial intelligence systems developed, procured, or implemented by departments across the Government of Canada.',
    fr: 'Un r\u00e9pertoire ouvert des syst\u00e8mes d\u2019intelligence artificielle d\u00e9velopp\u00e9s, acquis ou mis en \u0153uvre par les minist\u00e8res du gouvernement du Canada.',
  },
  'search_placeholder': { en: 'Search systems, departments, vendors\u2026', fr: 'Rechercher des syst\u00e8mes, minist\u00e8res, fournisseurs\u2026' },

  // Stats bar
  'stat_total': { en: 'Total Systems', fr: 'Syst\u00e8mes au total' },
  'stat_production': { en: 'In Production', fr: 'En production' },
  'stat_pii': { en: 'Handle PII', fr: 'Traitent des RP' },
  'stat_departments': { en: 'Departments', fr: 'Minist\u00e8res' },
  'last_updated': { en: 'Last Updated', fr: 'Derni\u00e8re mise \u00e0 jour' },
  'last_updated_text': {
    en: 'This date is automatically pulled from the "Date Modified" metadata of the Government of Canada\u2019s official open data registry for AI systems.',
    fr: 'Cette date est automatiquement extraite des m\u00e9tadonn\u00e9es \u00ab\u00a0Date de modification\u00a0\u00bb du registre officiel de donn\u00e9es ouvertes du gouvernement du Canada pour les syst\u00e8mes d\u2019IA.',
  },

  // Filters
  'filters': { en: 'Filters', fr: 'Filtres' },
  'department': { en: 'Department', fr: 'Minist\u00e8re' },
  'status': { en: 'Status', fr: '\u00c9tat' },
  'personal_data': { en: 'Personal Data', fr: 'Donn\u00e9es personnelles' },
  'developed_by': { en: 'Developed By', fr: 'D\u00e9velopp\u00e9 par' },
  'vendor': { en: 'Vendor', fr: 'Fournisseur' },
  'notification': { en: 'Notification', fr: 'Notification' },
  'clear_all': { en: 'Clear all', fr: 'Tout effacer' },
  'has_personal_data': { en: 'Has personal data', fr: 'Donn\u00e9es personnelles' },
  'no_personal_data': { en: 'No personal data', fr: 'Aucune donn\u00e9e personnelle' },
  'users_notified': { en: 'Users notified', fr: 'Utilisateurs avis\u00e9s' },
  'no_notification': { en: 'No notification', fr: 'Aucune notification' },
  'remove_filter': { en: 'Remove filter', fr: 'Retirer le filtre' },

  // Charts
  'chart_status': { en: 'Systems by Status', fr: 'Syst\u00e8mes par \u00e9tat' },
  'chart_year': { en: 'Systems by Year', fr: 'Syst\u00e8mes par ann\u00e9e' },
  'chart_departments': { en: 'Top Departments', fr: 'Principaux minist\u00e8res' },
  'systems': { en: 'systems', fr: 'syst\u00e8mes' },
  'systems_added': { en: 'systems added', fr: 'syst\u00e8mes ajout\u00e9s' },
  'sr_status_caption': { en: 'Systems by status', fr: 'Syst\u00e8mes par \u00e9tat' },
  'sr_year_caption': { en: 'Systems by year', fr: 'Syst\u00e8mes par ann\u00e9e' },
  'sr_dept_caption': { en: 'Top 10 departments by system count', fr: 'Les 10 principaux minist\u00e8res par nombre de syst\u00e8mes' },
  'filter_by': { en: 'Filter by', fr: 'Filtrer par' },

  // Table
  'col_system': { en: 'System', fr: 'Syst\u00e8me' },
  'col_department': { en: 'Department', fr: 'Minist\u00e8re' },
  'col_status': { en: 'Status', fr: '\u00c9tat' },
  'col_year': { en: 'Year', fr: 'Ann\u00e9e' },
  'col_vendor': { en: 'Vendor', fr: 'Fournisseur' },
  'col_pii': { en: 'PII', fr: 'RP' },
  'no_match': { en: 'No systems match your filters', fr: 'Aucun syst\u00e8me ne correspond \u00e0 vos filtres' },
  'try_adjusting': { en: 'Try adjusting your search or filter criteria', fr: 'Essayez de modifier vos crit\u00e8res de recherche ou de filtre' },
  'previous': { en: 'Previous', fr: 'Pr\u00e9c\u00e9dent' },
  'next': { en: 'Next', fr: 'Suivant' },
  'expand_all': { en: 'Expand all', fr: 'Tout d\u00e9plier' },
  'collapse_all': { en: 'Collapse all', fr: 'Tout replier' },
  'production': { en: 'production', fr: 'production' },
  'pii_label': { en: 'PII', fr: 'RP' },
  'dept_singular': { en: 'dept', fr: 'min.' },
  'dept_plural': { en: 'depts', fr: 'min.' },
  'all_systems_caption': { en: 'All {count} AI systems', fr: 'Les {count} syst\u00e8mes d\u2019IA' },
  'showing_systems_caption': { en: 'Showing {filtered} of {total} AI systems', fr: 'Affichage de {filtered} sur {total} syst\u00e8mes d\u2019IA' },
  'grouped_suffix': { en: 'grouped', fr: 'regroup\u00e9s' },
  'view_details': { en: 'View details for', fr: 'Voir les d\u00e9tails de' },
  'handles_personal_info': { en: 'Handles personal information', fr: 'Traite des renseignements personnels' },
  'no_personal_info': { en: 'No personal information', fr: 'Aucun renseignement personnel' },

  // System detail panel
  'overview': { en: 'Overview', fr: 'Aper\u00e7u' },
  'description': { en: 'Description', fr: 'Description' },
  'primary_users': { en: 'Primary Users', fr: 'Utilisateurs principaux' },
  'technical_details': { en: 'Technical Details', fr: 'D\u00e9tails techniques' },
  'capabilities': { en: 'Capabilities', fr: 'Capacit\u00e9s' },
  'data_sources': { en: 'Data Sources', fr: 'Sources de donn\u00e9es' },
  'privacy': { en: 'Privacy', fr: 'Vie priv\u00e9e' },
  'personal_info_banks': { en: 'Personal Information Banks', fr: 'Fichiers de renseignements personnels' },
  'results_benefits': { en: 'Results & Benefits', fr: 'R\u00e9sultats et avantages' },
  'handles_personal_data': { en: 'Handles personal data', fr: 'Traite des donn\u00e9es personnelles' },
  'no_personal_data_badge': { en: 'No personal data', fr: 'Aucune donn\u00e9e personnelle' },
  'close_panel': { en: 'Close system detail panel', fr: 'Fermer le panneau de d\u00e9tails du syst\u00e8me' },

  // Toolbar
  'export': { en: 'Export', fr: 'Exporter' },
  'export_csv_title': { en: 'Download filtered data as CSV', fr: 'T\u00e9l\u00e9charger les donn\u00e9es filtr\u00e9es en CSV' },
  'group_department': { en: 'Department', fr: 'Minist\u00e8re' },
  'group_vendor': { en: 'Vendor', fr: 'Fournisseur' },
  'group_all': { en: 'All', fr: 'Tout' },
  'table_grouping': { en: 'Table grouping', fr: 'Regroupement du tableau' },

  // Loading & error
  'loading': { en: 'Loading systems\u2026', fr: 'Chargement des syst\u00e8mes\u2026' },
  'error_title': { en: 'Failed to load data', fr: '\u00c9chec du chargement des donn\u00e9es' },

  // About section (footer)
  'about_title': { en: 'About This Project', fr: '\u00c0 propos de ce projet' },
  'about_text': {
    en: 'The <strong>AI Register Explorer</strong> is an independent data visualization tool designed to make the Government of Canada\u2019s Artificial Intelligence Registry more accessible, searchable, and insightful.',
    fr: 'L\u2019<strong>Explorateur du registre d\u2019IA</strong> est un outil ind\u00e9pendant de visualisation de donn\u00e9es con\u00e7u pour rendre le registre d\u2019intelligence artificielle du gouvernement du Canada plus accessible, consultable et informatif.',
  },
  'about_built_by': {
    en: 'Built and maintained by',
    fr: 'Con\u00e7u et maintenu par',
  },
  'about_bio': {
    en: ', someone exploring what\u2019s possible with AI-assisted coding tools, based in Manitoba, Canada.',
    fr: ', une personne explorant les possibilit\u00e9s des outils de codage assist\u00e9s par l\u2019IA, bas\u00e9e au Manitoba, Canada.',
  },
  'disclaimer_title': { en: 'Important Disclaimers', fr: 'Avis importants' },
  'disclaimer_text': {
    en: 'This project is <strong>not affiliated with, endorsed by, or sponsored by the Government of Canada</strong>. It is an independent tool that reproduces publicly available open data. The interface was built with AI-assisted development tools. Data is provided for informational purposes only and may not reflect the most current entries in the official registry.',
    fr: 'Ce projet n\u2019est <strong>ni affili\u00e9 au, ni approuv\u00e9 par, ni parrain\u00e9 par le gouvernement du Canada</strong>. Il s\u2019agit d\u2019un outil ind\u00e9pendant qui reproduit des donn\u00e9es ouvertes accessibles au public. L\u2019interface a \u00e9t\u00e9 cr\u00e9\u00e9e \u00e0 l\u2019aide d\u2019outils de d\u00e9veloppement assist\u00e9s par l\u2019IA. Les donn\u00e9es sont fournies \u00e0 titre informatif seulement et peuvent ne pas refl\u00e9ter les entr\u00e9es les plus r\u00e9centes du registre officiel.',
  },
  'methodology': { en: 'Methodology', fr: 'M\u00e9thodologie' },
  'data_source_label': { en: 'Data Source:', fr: 'Source des donn\u00e9es\u00a0:' },
  'data_source_text': {
    en: 'Pulled directly from the official',
    fr: 'Tir\u00e9es directement de l\u2019API officielle',
  },
  'data_source_suffix': {
    en: 'AI registry API. No curation or modification applied.',
    fr: 'du registre d\u2019IA. Aucune curation ni modification appliqu\u00e9e.',
  },
  'updates_label': { en: 'Updates:', fr: 'Mises \u00e0 jour\u00a0:' },
  'updates_text': {
    en: 'Cached for 1 hour. Reflects the latest published records from the source on each refresh cycle.',
    fr: 'Mise en cache pendant 1 heure. Refl\u00e8te les derniers enregistrements publi\u00e9s de la source \u00e0 chaque cycle de rafra\u00eechissement.',
  },
  'licence_label': { en: 'Licence:', fr: 'Licence\u00a0:' },
  'licence_link': { en: 'Open Government Licence \u2013 Canada', fr: 'Licence du gouvernement ouvert \u2013 Canada' },
  'glossary': { en: 'Glossary', fr: 'Glossaire' },
  'glossary_pii': { en: 'PII', fr: 'RP' },
  'glossary_pii_desc': {
    en: 'Personally Identifiable Information. Indicates if the AI system processes sensitive citizen data, as reported by the department.',
    fr: 'Renseignements personnels. Indique si le syst\u00e8me d\u2019IA traite des donn\u00e9es sensibles des citoyens, selon le minist\u00e8re.',
  },
  'glossary_production': { en: 'In Production', fr: 'En production' },
  'glossary_production_desc': {
    en: 'The AI system is actively deployed and in use by the respective federal department.',
    fr: 'Le syst\u00e8me d\u2019IA est activement d\u00e9ploy\u00e9 et utilis\u00e9 par le minist\u00e8re f\u00e9d\u00e9ral concern\u00e9.',
  },
  'glossary_aia': { en: 'Algorithmic Impact Assessment', fr: '\u00c9valuation de l\u2019incidence algorithmique' },
  'glossary_aia_desc': {
    en: 'A mandatory risk-assessment tool used by the Government of Canada to evaluate AI system pipelines.',
    fr: 'Un outil obligatoire d\u2019\u00e9valuation des risques utilis\u00e9 par le gouvernement du Canada pour \u00e9valuer les pipelines de syst\u00e8mes d\u2019IA.',
  },
  'footer_independent': { en: 'Independent Project', fr: 'Projet ind\u00e9pendant' },
  'footer_about': { en: 'About', fr: '\u00c0 propos' },
  'footer_privacy': { en: 'Privacy', fr: 'Confidentialit\u00e9' },
  'footer_terms': { en: 'Terms', fr: 'Conditions' },
  'footer_contact': { en: 'Contact', fr: 'Contact' },
  'footer_home': { en: 'Home', fr: 'Accueil' },
  'footer_privacy_policy': { en: 'Privacy Policy', fr: 'Politique de confidentialit\u00e9' },
  'footer_terms_of_use': { en: 'Terms of Use', fr: 'Conditions d\u2019utilisation' },

  // Retro overlay
  'retro_tech': {
    en: 'TECHNOLOGY \u2014 Government of Canada launches AI Register with {total} systems catalogued',
    fr: 'TECHNOLOGIE \u2014 Le gouvernement du Canada lance le registre d\u2019IA avec {total} syst\u00e8mes catalogu\u00e9s',
  },
  'retro_updates': {
    en: 'UPDATES \u2014 Registry last modified {date} \u2014 {depts} departments reporting',
    fr: 'MISES \u00c0 JOUR \u2014 Registre modifi\u00e9 pour la derni\u00e8re fois en {date} \u2014 {depts} minist\u00e8res d\u00e9clarants',
  },
  'retro_data': {
    en: 'DATA \u2014 {prod} systems in production, {pii} handle personal information',
    fr: 'DONN\u00c9ES \u2014 {prod} syst\u00e8mes en production, {pii} traitent des renseignements personnels',
  },
  'retro_best_viewed': {
    en: 'TECH \u2014 Best viewed at 800\u00d7600 resolution with Netscape Navigator 4.0',
    fr: 'TECH \u2014 Meilleur affichage \u00e0 800\u00d7600 avec Netscape Navigator 4.0',
  },

  // About page
  'back_to_explorer': { en: 'Back to Explorer', fr: 'Retour \u00e0 l\u2019explorateur' },
  'about_page_title': { en: 'About This Project', fr: '\u00c0 propos de ce projet' },
  'about_page_updated': { en: 'Last updated: March 2026', fr: 'Derni\u00e8re mise \u00e0 jour\u00a0: mars 2026' },
  'about_what_title': { en: 'What is the AI Register Explorer?', fr: 'Qu\u2019est-ce que l\u2019Explorateur du registre d\u2019IA\u00a0?' },
  'about_what_p1': {
    en: 'The <strong>AI Register Explorer</strong> is an independent, open-source data visualization tool that makes the Government of Canada\u2019s Artificial Intelligence Registry more accessible and searchable. It presents the same data published on',
    fr: 'L\u2019<strong>Explorateur du registre d\u2019IA</strong> est un outil ind\u00e9pendant et \u00e0 code source ouvert de visualisation de donn\u00e9es qui rend le registre d\u2019intelligence artificielle du gouvernement du Canada plus accessible et consultable. Il pr\u00e9sente les m\u00eames donn\u00e9es publi\u00e9es sur',
  },
  'about_what_p1_suffix': {
    en: 'in an interactive interface with search, filters, charts, and CSV export.',
    fr: 'dans une interface interactive avec recherche, filtres, graphiques et exportation CSV.',
  },
  'about_what_p2': {
    en: 'This site is <strong>not an official Government of Canada website</strong> and is not affiliated with, endorsed by, or sponsored by the Government of Canada or any federal department. It is a personal project built to improve public access to information that is already openly licensed and publicly available.',
    fr: 'Ce site n\u2019est <strong>pas un site officiel du gouvernement du Canada</strong> et n\u2019est ni affili\u00e9 au, ni approuv\u00e9 par, ni parrain\u00e9 par le gouvernement du Canada ou tout minist\u00e8re f\u00e9d\u00e9ral. Il s\u2019agit d\u2019un projet personnel visant \u00e0 am\u00e9liorer l\u2019acc\u00e8s du public \u00e0 des informations d\u00e9j\u00e0 sous licence ouverte et accessibles au public.',
  },
  'about_operator_title': { en: 'Who operates this site?', fr: 'Qui exploite ce site\u00a0?' },
  'about_operator_p1': {
    en: 'This site is operated by <strong>Scott Hazlitt</strong>, a private individual based in Manitoba, Canada, exploring what\u2019s possible with AI-assisted coding tools. Scott is not acting on behalf of any company, government body, or organization.',
    fr: 'Ce site est exploit\u00e9 par <strong>Scott Hazlitt</strong>, un particulier bas\u00e9 au Manitoba, Canada, explorant les possibilit\u00e9s des outils de codage assist\u00e9s par l\u2019IA. Scott n\u2019agit au nom d\u2019aucune entreprise, organisme gouvernemental ou organisation.',
  },
  'about_data_title': { en: 'Data source & methodology', fr: 'Source des donn\u00e9es et m\u00e9thodologie' },
  'about_data_source': {
    en: 'All data is fetched directly from the official Government of Canada open data API at',
    fr: 'Toutes les donn\u00e9es sont tir\u00e9es directement de l\u2019API officielle de donn\u00e9es ouvertes du gouvernement du Canada \u00e0',
  },
  'about_data_licence': {
    en: 'and is published under the',
    fr: 'et sont publi\u00e9es sous la',
  },
  'about_no_curation_label': { en: 'No curation or filtering:', fr: 'Aucune curation ni filtrage\u00a0:' },
  'about_no_curation': {
    en: 'The site displays all records returned by the source API without manual review, modification, ranking, or removal. The PII flag and all other fields are reproduced as-is from the government dataset.',
    fr: 'Le site affiche tous les enregistrements retourn\u00e9s par l\u2019API source sans examen manuel, modification, classement ou suppression. L\u2019indicateur de RP et tous les autres champs sont reproduits tels quels \u00e0 partir du jeu de donn\u00e9es du gouvernement.',
  },
  'about_updates_label': { en: 'Updates:', fr: 'Mises \u00e0 jour\u00a0:' },
  'about_updates': {
    en: 'Data is cached for one hour. Refreshing the page after that window will pull the latest published records from the source.',
    fr: 'Les donn\u00e9es sont mises en cache pendant une heure. Actualiser la page apr\u00e8s cette p\u00e9riode r\u00e9cup\u00e9rera les derniers enregistrements publi\u00e9s de la source.',
  },
  'about_no_ai_label': { en: 'No AI classification:', fr: 'Aucune classification par IA\u00a0:' },
  'about_no_ai': {
    en: 'No artificial intelligence is used to summarize, classify, or categorize entries. The interface itself was built with AI-assisted development tools, but no AI processing is applied to the government data.',
    fr: 'Aucune intelligence artificielle n\u2019est utilis\u00e9e pour r\u00e9sumer, classifier ou cat\u00e9goriser les entr\u00e9es. L\u2019interface elle-m\u00eame a \u00e9t\u00e9 construite avec des outils de d\u00e9veloppement assist\u00e9s par l\u2019IA, mais aucun traitement par IA n\u2019est appliqu\u00e9 aux donn\u00e9es gouvernementales.',
  },
  'about_accuracy_label': { en: 'Accuracy:', fr: 'Exactitude\u00a0:' },
  'about_accuracy': {
    en: 'This tool reflects the data as published by the Government of Canada. If records are incomplete, outdated, or contain errors, those issues originate from the source dataset. For official corrections, contact the relevant federal department.',
    fr: 'Cet outil refl\u00e8te les donn\u00e9es telles que publi\u00e9es par le gouvernement du Canada. Si les enregistrements sont incomplets, obsol\u00e8tes ou contiennent des erreurs, ces probl\u00e8mes proviennent du jeu de donn\u00e9es source. Pour les corrections officielles, contactez le minist\u00e8re f\u00e9d\u00e9ral concern\u00e9.',
  },
  'about_corrections_title': { en: 'Corrections, takedowns & privacy requests', fr: 'Corrections, retraits et demandes de confidentialit\u00e9' },
  'about_corrections_p1': {
    en: 'Because this site reproduces publicly available government data without modification, requests to correct or remove specific entries should be directed to the Government of Canada dataset maintainers via',
    fr: 'Puisque ce site reproduit des donn\u00e9es gouvernementales accessibles au public sans modification, les demandes de correction ou de suppression d\u2019entr\u00e9es sp\u00e9cifiques doivent \u00eatre adress\u00e9es aux responsables du jeu de donn\u00e9es du gouvernement du Canada via',
  },
  'about_corrections_p2': {
    en: 'If you have a privacy concern, believe the site has unintentionally published personal information, or wish to make an inquiry under PIPEDA, please contact Scott directly at',
    fr: 'Si vous avez une pr\u00e9occupation en mati\u00e8re de vie priv\u00e9e, croyez que le site a involontairement publi\u00e9 des renseignements personnels, ou souhaitez faire une demande en vertu de la LPRPD\u00c9, veuillez contacter Scott directement \u00e0',
  },
  'about_corrections_suffix': {
    en: 'Requests will be reviewed within 30 days.',
    fr: 'Les demandes seront examin\u00e9es dans un d\u00e9lai de 30 jours.',
  },
  'about_accessibility_title': { en: 'Accessibility', fr: 'Accessibilit\u00e9' },
  'about_accessibility_p1': {
    en: 'This site is built with accessibility in mind. It includes skip navigation, semantic headings, ARIA roles and labels, keyboard navigation support, and focus management in modal dialogs. The interface aims for WCAG 2.1 Level AA conformance.',
    fr: 'Ce site est con\u00e7u en tenant compte de l\u2019accessibilit\u00e9. Il comprend une navigation par saut, des en-t\u00eates s\u00e9mantiques, des r\u00f4les et \u00e9tiquettes ARIA, la prise en charge de la navigation au clavier et la gestion du focus dans les bo\u00eetes de dialogue modales. L\u2019interface vise la conformit\u00e9 WCAG 2.1 niveau AA.',
  },
  'about_accessibility_p2_prefix': {
    en: 'If you encounter an accessibility barrier, please email',
    fr: 'Si vous rencontrez un obstacle d\u2019accessibilit\u00e9, veuillez envoyer un courriel \u00e0',
  },
  'about_accessibility_p2_suffix': {
    en: 'describing the issue and your assistive technology. Feedback is welcome and will be addressed as promptly as possible.',
    fr: 'en d\u00e9crivant le probl\u00e8me et votre technologie d\u2019assistance. Les commentaires sont les bienvenus et seront trait\u00e9s dans les meilleurs d\u00e9lais.',
  },
  'about_opensource_title': { en: 'Open source', fr: 'Code source ouvert' },
  'about_opensource_p1_prefix': {
    en: 'The source code for this project is publicly available on',
    fr: 'Le code source de ce projet est disponible publiquement sur',
  },
  'about_opensource_p1_suffix': {
    en: 'Contributions, issues, and suggestions are welcome.',
    fr: 'Les contributions, les signalements de probl\u00e8mes et les suggestions sont les bienvenus.',
  },
  'source_label': { en: 'Source:', fr: 'Source\u00a0:' },
}

// ── Provider ────────────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null
    if (saved === 'en' || saved === 'fr') {
      setLangState(saved)
    }
  }, [])

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang)
    localStorage.setItem('lang', newLang)
    document.documentElement.setAttribute('lang', newLang)
  }, [])

  const t = useCallback((key: string): string => {
    const entry = translations[key]
    if (!entry) return key
    return entry[lang]
  }, [lang])

  const fieldFn = useCallback((system: AISystem, base: string): string => {
    return getField(system, base, lang)
  }, [lang])

  const deptNameFn = useCallback((org: string): string => {
    return getDeptName(org, lang)
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, field: fieldFn, deptName: deptNameFn }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
