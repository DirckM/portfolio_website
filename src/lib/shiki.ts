import { createHighlighter, type Highlighter } from 'shiki';

const globalForShiki = globalThis as typeof globalThis & {
  __shikiHighlighter?: Promise<Highlighter>;
};

export async function getHighlighter(): Promise<Highlighter> {
  if (!globalForShiki.__shikiHighlighter) {
    globalForShiki.__shikiHighlighter = createHighlighter({
      themes: ['one-dark-pro'],
      langs: ['tsx', 'typescript', 'bash', 'css', 'json', 'html'],
    });
  }
  return globalForShiki.__shikiHighlighter;
}

export async function highlightCode(
  code: string,
  lang: string = 'tsx'
): Promise<string> {
  const hl = await getHighlighter();
  const supportedLangs = hl.getLoadedLanguages();
  const language = supportedLangs.includes(lang as any) ? lang : 'tsx';
  return hl.codeToHtml(code, {
    lang: language,
    theme: 'one-dark-pro',
  });
}
