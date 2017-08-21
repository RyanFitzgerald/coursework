import Raven from 'raven-js';

const sentry_key = 'e33ebd20073e41189245bb8d5fb99b48';
const sentry_app = '206155';
export const sentry_url = `https://${sentry_key}@app.getsentry.com/${sentry_app}`;

export function logException(ex, context) {
  Raven.captureException(ex, {
    extra: context
  });
  /*eslint no-console:0*/
  window && window.console && console.error && console.error(ex);
}
