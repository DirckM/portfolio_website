/**
 * A heading set in the sans, with only its last word in the serif italic.
 *
 * Serif is a highlighter on this site: a whole headline in Instrument Serif
 * reads as too much. One accent word keeps the character without the weight.
 */
export default function AccentTitle({ text }: { text: string }) {
  const at = text.trimEnd().lastIndexOf(' ');
  if (at < 0) return <AccentWord word={text} />;
  return (
    <>
      {text.slice(0, at + 1)}
      <AccentWord word={text.slice(at + 1)} />
    </>
  );
}

function AccentWord({ word }: { word: string }) {
  return (
    <span className='font-[family-name:var(--font-instrument-serif)] font-normal italic tracking-[-0.01em]'>
      {word}
    </span>
  );
}
