import { readFileSync, writeFileSync } from 'fs';

import { IEnvironment } from '../environments/env-type';

export function injectEnvIntoIndexHtml(env: IEnvironment, indexPath: string) {
  // ATTENTION!!!!
  // This function injects environment variables into the index.html file for the frontend.
  // Be careful with the variables you expose here, as they will be accessible in the browser.
  const { appId, redirectUri } = env;

  const rawHtml = readFileSync(indexPath, 'utf8');

  const envScript = `<script id="env-script">
    window.__ENV__ = ${JSON.stringify({ appId, redirectUri })};
  </script>`;

  const startMarker = '<!-- ENV_INJECT_START -->';
  const endMarker = '<!-- ENV_INJECT_END -->';

  const start = rawHtml.indexOf(startMarker);
  const end = rawHtml.indexOf(endMarker);

  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      'ENV markers not found or incorrect in index.html. Rebuild the frontend.',
    );
  }

  const before = rawHtml.slice(0, start + startMarker.length);
  const after = rawHtml.slice(end);

  const newHtml = `${before}\n${envScript}\n${after}`;
  writeFileSync(indexPath, newHtml, 'utf8');
}
