'use client'
import { useEffect, useRef } from 'react'
import type { Lang } from '@/lib/language'
import { dept, field, sourceField, year, type SourceRecord } from '@/lib/register/model'
import type { Translate } from '@/lib/register/copy'
import {
  date,
  External,
  flagName,
  Icon,
  licenceUrl,
  number,
  SourceText,
  sourceUrl,
  StatusTag,
} from './shared'

export default function Dossier({
  record,
  sequence,
  lang,
  t,
  snapshotAt,
  lastModified,
  onClose,
  onStep,
}: {
  record: SourceRecord
  sequence: SourceRecord[]
  lang: Lang
  t: Translate
  snapshotAt: string | null
  lastModified: string | null
  onClose: () => void
  onStep: (id: string) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    title = useRef<HTMLHeadingElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  const position = sequence.findIndex((item) => item.ai_register_id === record.ai_register_id)
  useEffect(() => {
    const element = dialog.current!,
      returnTo = document.activeElement as HTMLElement | null
    element.showModal()
    document.body.classList.add('dialog-open')
    return () => {
      element.close()
      document.body.classList.remove('dialog-open')
      if (returnTo?.isConnected) returnTo.focus({ preventScroll: true })
      else document.getElementById('register-search')?.focus({ preventScroll: true })
    }
  }, [])
  useEffect(() => {
    dialog.current?.scrollTo(0, 0)
    title.current?.focus({ preventScroll: true })
  }, [record.ai_register_id, lang])
  const section = (key: string, base: string, note?: string) => (
    <section
      className={`dossier-section ${key === 'results' ? 'dossier-results' : ''}`}
      id={`dossier-${key}`}
    >
      <h3>{t(key)}</h3>
      <p className="source-text">
        <SourceText record={record} base={base} lang={lang} />
      </p>
      {note && <p className="source-annotation">{t(note)}</p>}
    </section>
  )
  const fact = (key: string, content: React.ReactNode) => (
    <div>
      <dt>{t(key)}</dt>
      <dd>{content}</dd>
    </div>
  )
  const jump = (key: string) =>
    document
      .getElementById(`dossier-${key}`)
      ?.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      })
  return (
    <dialog
      id="record-dialog"
      ref={dialog}
      aria-labelledby="dossier-title"
      data-record-id={record.ai_register_id}
      onCancel={(event) => {
        event.preventDefault()
        closeRef.current()
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const box = event.currentTarget.getBoundingClientRect()
        if (
          event.clientX < box.left ||
          event.clientX > box.right ||
          event.clientY < box.top ||
          event.clientY > box.bottom
        )
          onClose()
      }}
    >
      <div id="dossier">
        <div className="dossier-toolbar">
          <button className="button-quiet" onClick={onClose}>
            <Icon name="left" />
            {t('backToResults')}
          </button>
          <div className="dossier-pagination">
            <span className="dossier-position">
              {t('recordPosition', {
                count: number(position + 1, lang),
                total: number(sequence.length, lang),
              })}
            </span>
            <button
              className="icon-button"
              aria-label={t('previousRecord')}
              disabled={position <= 0}
              onClick={() => onStep(sequence[position - 1].ai_register_id)}
            >
              <Icon name="left" />
            </button>
            <button
              className="icon-button"
              aria-label={t('nextRecord')}
              disabled={position >= sequence.length - 1}
              onClick={() => onStep(sequence[position + 1].ai_register_id)}
            >
              <Icon name="right" />
            </button>
            <button className="icon-button" onClick={onClose} aria-label={t('close')}>
              <Icon name="close" />
            </button>
          </div>
        </div>
        <div className="dossier-layout">
          <aside className="dossier-spine">
            <p className="eyebrow">{t('sourceRecord')}</p>
            <strong className="source-id">{record.ai_register_id}</strong>
            <span className="spine-rule" aria-hidden="true" />
            <p className="spine-org">{dept(record.government_organization, lang)}</p>
            <StatusTag record={record} t={t} />
            <nav className="spine-links" aria-label={t('howToRead')}>
              {['description', 'capability', 'dataSources', 'results', 'sourceLedger'].map(
                (key) => (
                  <button key={key} onClick={() => jump(key)}>
                    {t(key)}
                  </button>
                )
              )}
              <button onClick={() => window.print()}>{t('printRecord')}</button>
            </nav>
          </aside>
          <article className="dossier-paper">
            <header className="dossier-header">
              <p className="eyebrow">
                {t('reportedInformation')} / {record.ai_register_id}
              </p>
              <h2
                id="dossier-title"
                tabIndex={-1}
                ref={title}
                lang={sourceField(record, 'name_ai_system', lang).language}
              >
                {field(record, 'name_ai_system', lang) || t('notSpecified')}
              </h2>
              <p className="dossier-organisation">{dept(record.government_organization, lang)}</p>
              <div className="dossier-provenance">
                <External href={sourceUrl(lang)}>{t('officialSource')} ↗</External>
                <span>{t('snapshot', { date: date(snapshotAt, lang) })}</span>
              </div>
              <p className="dossier-framing">{t('reportedNotAssessed')}</p>
            </header>
            {section('description', 'description_ai_system')}
            <dl className="dossier-facts">
              {fact('status', <StatusTag record={record} t={t} />)}
              {fact(
                'statusYear',
                <>
                  <span data-source-field="status_date">{year(record) || t('notSpecified')}</span>
                  <p className="source-annotation">{t('yearHelp')}</p>
                </>
              )}
              {fact(
                'users',
                <SourceText record={record} base="ai_system_primary_users" lang={lang} />
              )}
              {fact('developedBy', <SourceText record={record} base="developed_by" lang={lang} />)}
              {fact(
                'vendor',
                <span data-source-field="vendor_information">
                  {record.vendor_information || t('notSpecified')}
                </span>
              )}
              {fact(
                'personalInfo',
                <span data-source-field="involves_personal_information">
                  {flagName(record.involves_personal_information, t)}
                </span>
              )}
              {fact(
                'notification',
                <>
                  <span data-source-field="notification_ai">
                    {flagName(record.notification_ai, t)}
                  </span>
                  <p className="source-annotation">{t('notificationHelp')}</p>
                </>
              )}
              {fact(
                'privacyBank',
                <SourceText record={record} base="personal_information_banks" lang={lang} />
              )}
            </dl>
            {section('capability', 'ai_system_capabilities')}
            {section('dataSources', 'data_sources')}
            {section('results', 'ai_system_results', 'reportedResultsNote')}
            <section className="dossier-section source-ledger" id="dossier-sourceLedger">
              <h3>{t('sourceLedger')}</h3>
              <dl className="ledger-fields">
                <div>
                  <dt>{t('sourceRecord')}</dt>
                  <dd>{record.ai_register_id}</dd>
                </div>
                <div>
                  <dt>{t('modifiedDate')}</dt>
                  <dd>
                    {date(lastModified, lang)}
                    <small>{t('datasetDateHelp')}</small>
                  </dd>
                </div>
                <div>
                  <dt>{t('snapshotDate')}</dt>
                  <dd>
                    {date(snapshotAt, lang)}
                    <small>{t('snapshotHelp')}</small>
                  </dd>
                </div>
                <div>
                  <dt>{t('sourceLicence')}</dt>
                  <dd>
                    <External href={licenceUrl(lang)}>{t('licence')}</External>
                  </dd>
                </div>
              </dl>
              <External href={sourceUrl(lang)} className="button button-primary">
                {t('officialSource')} ↗
              </External>
              <p className="dossier-disclaimer">
                {t('reportedNotAssessed')} {t('footerLine')}
              </p>
            </section>
          </article>
        </div>
      </div>
    </dialog>
  )
}
