import { createHighlighter, type Highlighter } from 'shiki';

let highlighter: Highlighter | null = null;

export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['one-dark-pro'],
      langs: ['tsx', 'typescript', 'bash', 'css', 'json', 'html'],
    });
  }
  return highlighter;
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
