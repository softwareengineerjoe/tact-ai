import { Fragment, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface RichTextProps {
  content: string;
  /** Rendered on the primary (green) bubble — flips text/border tones for contrast. */
  onPrimary?: boolean;
  className?: string;
}

/**
 * Lightweight, dependency-free renderer for a constrained Markdown subset so
 * assistant replies read as premium, well-structured content instead of a wall
 * of text. Supports headings, bold/italic/code inline marks, links, ordered and
 * unordered lists, blockquotes, GFM pipe tables, fenced code blocks, and a
 * `chart` fenced block that draws a compact horizontal bar diagram.
 *
 * Streaming-safe: partial/unclosed structures degrade gracefully as tokens
 * arrive. Presentational only — no I/O, no state.
 */
export function RichText({
  content,
  onPrimary = false,
  className,
}: RichTextProps) {
  const blocks = parseBlocks(content);

  return (
    <div className={cn('space-y-2.5 leading-relaxed', className)}>
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} onPrimary={onPrimary} />
      ))}
    </div>
  );
}

/* ----------------------------- block model ------------------------------ */

type Block =
  | { kind: 'heading'; level: 2 | 3 | 4; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'table'; head: string[]; rows: string[][] }
  | { kind: 'chart'; items: { label: string; value: number }[] };

function parseBlocks(input: string): Block[] {
  const lines = input.replace(/\r\n/g, '\n').split('\n');
  const at = (index: number): string => lines[index] ?? '';
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = at(i);

    // Skip blank lines between blocks.
    if (line.trim() === '') {
      i += 1;
      continue;
    }

    // Fenced block: ``` or ```chart (unclosed fences run to the end).
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      const lang = (fence[1] ?? '').toLowerCase();
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(at(i))) {
        body.push(at(i));
        i += 1;
      }
      i += 1; // consume closing fence if present
      if (lang === 'chart') {
        blocks.push({ kind: 'chart', items: parseChart(body) });
      } else {
        blocks.push({ kind: 'code', text: body.join('\n') });
      }
      continue;
    }

    // Heading: ## / ### / ####
    const heading = line.match(/^(#{2,4})\s+(.*)$/);
    if (heading) {
      blocks.push({
        kind: 'heading',
        level: (heading[1]?.length ?? 2) as 2 | 3 | 4,
        text: (heading[2] ?? '').trim(),
      });
      i += 1;
      continue;
    }

    // Table: a header row followed by a |---|---| separator.
    if (line.trim().startsWith('|') && isTableSeparator(at(i + 1))) {
      const head = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && at(i).trim().startsWith('|')) {
        rows.push(splitRow(at(i)));
        i += 1;
      }
      blocks.push({ kind: 'table', head, rows });
      continue;
    }

    // Blockquote.
    if (line.trim().startsWith('>')) {
      const quote: string[] = [];
      while (i < lines.length && at(i).trim().startsWith('>')) {
        quote.push(at(i).replace(/^\s*>\s?/, ''));
        i += 1;
      }
      blocks.push({ kind: 'quote', text: quote.join(' ') });
      continue;
    }

    // Lists (ordered or unordered).
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(at(i))) {
        items.push(at(i).replace(/^\s*([-*]|\d+\.)\s+/, ''));
        i += 1;
      }
      blocks.push({ kind: 'list', ordered, items });
      continue;
    }

    // Paragraph: gather until a blank line or the start of another block.
    const para: string[] = [];
    while (
      i < lines.length &&
      at(i).trim() !== '' &&
      !startsBlock(at(i), at(i + 1))
    ) {
      para.push(at(i).trim());
      i += 1;
    }
    blocks.push({ kind: 'paragraph', text: para.join(' ') });
  }

  return blocks;
}

function startsBlock(line: string, next: string): boolean {
  return (
    /^```/.test(line) ||
    /^#{2,4}\s+/.test(line) ||
    /^\s*([-*]|\d+\.)\s+/.test(line) ||
    line.trim().startsWith('>') ||
    (line.trim().startsWith('|') && isTableSeparator(next))
  );
}

function isTableSeparator(line: string): boolean {
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(line);
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim());
}

function parseChart(body: string[]): { label: string; value: number }[] {
  return body
    .map((row) => row.match(/^(.*?):\s*([\d.]+)/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => ({ label: (m[1] ?? '').trim(), value: Number(m[2] ?? 0) }));
}

/* ----------------------------- block views ------------------------------ */

function BlockView({ block, onPrimary }: { block: Block; onPrimary: boolean }) {
  const muted = onPrimary ? 'text-primary-fg/70' : 'text-fg-muted';
  const strong = onPrimary ? 'text-primary-fg' : 'text-fg';

  switch (block.kind) {
    case 'heading': {
      const size =
        block.level === 2
          ? 'text-sm'
          : block.level === 3
            ? 'text-[13px]'
            : 'text-xs';
      return (
        <p className={cn('font-semibold tracking-tight', size, strong)}>
          <Inline text={block.text} onPrimary={onPrimary} />
        </p>
      );
    }
    case 'paragraph':
      return (
        <p>
          <Inline text={block.text} onPrimary={onPrimary} />
        </p>
      );
    case 'list':
      return block.ordered ? (
        <ol className='ml-4 list-decimal space-y-1 marker:text-fg-muted'>
          {block.items.map((item, index) => (
            <li key={index}>
              <Inline text={item} onPrimary={onPrimary} />
            </li>
          ))}
        </ol>
      ) : (
        <ul className='ml-1 space-y-1'>
          {block.items.map((item, index) => (
            <li key={index} className='flex gap-2'>
              <span
                aria-hidden
                className={cn(
                  'mt-[0.45rem] h-1 w-1 shrink-0 rounded-full',
                  onPrimary ? 'bg-primary-fg/50' : 'bg-primary/50',
                )}
              />
              <span>
                <Inline text={item} onPrimary={onPrimary} />
              </span>
            </li>
          ))}
        </ul>
      );
    case 'quote':
      return (
        <blockquote
          className={cn(
            'border-l-2 pl-3 italic',
            onPrimary ? 'border-primary-fg/30' : 'border-primary/40',
            muted,
          )}
        >
          <Inline text={block.text} onPrimary={onPrimary} />
        </blockquote>
      );
    case 'code':
      return (
        <pre
          className={cn(
            'overflow-x-auto rounded-md border p-3 text-xs',
            onPrimary
              ? 'border-primary-fg/20 bg-primary-active/40'
              : 'border-border bg-surface-muted',
          )}
        >
          <code className='font-mono'>{block.text}</code>
        </pre>
      );
    case 'table':
      return (
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-xs'>
            <thead>
              <tr>
                {block.head.map((cell, index) => (
                  <th
                    key={index}
                    className={cn(
                      'border-b px-2.5 py-1.5 text-left font-semibold',
                      onPrimary ? 'border-primary-fg/25' : 'border-border',
                      strong,
                    )}
                  >
                    <Inline text={cell} onPrimary={onPrimary} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={cn(
                        'border-b px-2.5 py-1.5 align-top tabular-nums',
                        onPrimary ? 'border-primary-fg/15' : 'border-border/70',
                      )}
                    >
                      <Inline text={cell} onPrimary={onPrimary} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'chart':
      return <BarChart items={block.items} onPrimary={onPrimary} />;
    default:
      return null;
  }
}

/** Compact horizontal bar diagram so quantitative answers aren't a wall of text. */
function BarChart({
  items,
  onPrimary,
}: {
  items: { label: string; value: number }[];
  onPrimary: boolean;
}) {
  if (items.length === 0) return null;
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div
      className={cn(
        'space-y-2 rounded-md border p-3',
        onPrimary
          ? 'border-primary-fg/20 bg-primary-active/30'
          : 'border-border bg-surface-muted/60',
      )}
      role='img'
      aria-label={`Bar chart: ${items.map((i) => `${i.label} ${i.value}`).join(', ')}`}
    >
      {items.map((item) => (
        <div key={item.label} className='flex items-center gap-2 text-xs'>
          <span className='w-24 shrink-0 truncate' title={item.label}>
            {item.label}
          </span>
          <span className='relative h-2 flex-1 overflow-hidden rounded-full bg-black/5'>
            <span
              className={cn(
                'absolute inset-y-0 left-0 rounded-full',
                onPrimary ? 'bg-primary-fg/80' : 'bg-primary',
              )}
              style={{ width: `${Math.round((item.value / max) * 100)}%` }}
            />
          </span>
          <span className='w-8 shrink-0 text-right font-medium tabular-nums'>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- inline marks ----------------------------- */

/** Renders inline `**bold**`, `*italic*`/`_italic_`, `` `code` `` and `[text](url)` links. */
function Inline({
  text,
  onPrimary,
}: {
  text: string;
  onPrimary: boolean;
}): ReactNode {
  const tokens: ReactNode[] = [];
  const pattern =
    /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))|((?:\*|_)([^*_]+)(?:\*|_))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) tokens.push(text.slice(last, match.index));

    if (match[2] !== undefined) {
      tokens.push(
        <strong key={key} className='font-semibold'>
          {match[2]}
        </strong>,
      );
    } else if (match[4] !== undefined) {
      tokens.push(
        <code
          key={key}
          className={cn(
            'rounded px-1 py-0.5 font-mono text-[0.85em]',
            onPrimary ? 'bg-primary-active/50' : 'bg-surface-muted',
          )}
        >
          {match[4]}
        </code>,
      );
    } else if (match[6] !== undefined && match[7] !== undefined) {
      tokens.push(
        <a
          key={key}
          href={match[7]}
          target='_blank'
          rel='noopener noreferrer'
          className={cn(
            'underline underline-offset-2',
            onPrimary ? 'text-primary-fg' : 'text-primary',
          )}
        >
          {match[6]}
        </a>,
      );
    } else if (match[9] !== undefined) {
      tokens.push(
        <em key={key} className='italic'>
          {match[9]}
        </em>,
      );
    }

    last = pattern.lastIndex;
    key += 1;
  }

  if (last < text.length) tokens.push(text.slice(last));

  return (
    <>
      {tokens.map((token, index) => (
        <Fragment key={index}>{token}</Fragment>
      ))}
    </>
  );
}
