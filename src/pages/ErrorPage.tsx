import { GlobeLockIcon, RefreshCw, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const JOURNAWAY_URL = 'https://www.journaway.com/de';

function ErrorPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-app">
      <div className="flex flex-col items-center gap-6 max-w-2xl text-center p-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-light">
          <GlobeLockIcon size={36} className="text-primary" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold text-text-main">{t('error.no_connection')}</h1>
          <p className="text-sm text-text-muted leading-relaxed">{t('error.server_unreachable')}</p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition"
        >
          <RefreshCw size={14} />
          {t('error.retry')}
        </button>

        <div className="w-full mt-2">
          <h2 className="text-base font-semibold text-text-main mb-3">{t('error.plan_trip')}</h2>
          <a
            href={JOURNAWAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col rounded-xl border border-primary-border bg-bg-message-in overflow-hidden hover:border-primary transition group"
          >
            <div className="w-full h-48 lg:h-80 bg-bg-sidebar flex items-center justify-center">
              <img
                src="/journaway-preview.jpg"
                alt="Journaway Preview"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-text-main group-hover:text-primary transition truncate">
                {JOURNAWAY_URL}
              </span>
              <ExternalLink size={14} className="text-text-muted shrink-0 ml-2" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
