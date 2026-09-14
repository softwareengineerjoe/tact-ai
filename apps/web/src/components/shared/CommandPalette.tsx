import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { NAV_ITEMS } from '@/app/navigation';
import { useHasPermission } from '@/hooks/usePermissions';
import { useCommandPaletteStore } from '@/stores/commandPaletteStore';
import { cn } from '@/utils/cn';

interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: ReactNode;
  run: () => void;
}

/**
 * ⌘K / Ctrl+K command palette — a fast, keyboard-first way to jump anywhere.
 * A premium, non-traditional navigation surface layered over the rail. Fully
 * accessible: focus-trapped, arrow-navigable, screen-reader labelled.
 */
export function CommandPalette() {
  const { isOpen, close, toggle } = useCommandPaletteStore();
  const navigate = useNavigate();
  const hasPermission = useHasPermission();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Global ⌘K / Ctrl+K toggle.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  const commands = useMemo<Command[]>(() => {
    return NAV_ITEMS.filter(
      (item) => !item.permission || hasPermission(item.permission),
    ).map((item) => {
      const Icon = item.icon;
      return {
        id: item.to,
        label: item.label,
        hint: item.hint,
        icon: <Icon className='h-4 w-4' aria-hidden />,
        run: () => navigate(item.to),
      };
    });
  }, [hasPermission, navigate]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === '') return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        (c.hint?.toLowerCase().includes(q) ?? false),
    );
  }, [commands, query]);

  // Focus management: capture focus on open, restore on close.
  useEffect(() => {
    if (isOpen) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      setQuery('');
      setActiveIndex(0);
      // Focus the input after paint.
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      restoreFocusRef.current?.focus?.();
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const runAt = (index: number) => {
    const command = results[index];
    if (!command) return;
    command.run();
    close();
  };

  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      runAt(activeIndex);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]'
      role='presentation'
    >
      <button
        type='button'
        aria-label='Close command palette'
        className='absolute inset-0 bg-fg/40 backdrop-blur-sm'
        onClick={close}
      />
      <div
        role='dialog'
        aria-modal='true'
        aria-label='Command palette'
        onKeyDown={onKeyDown}
        className='relative w-full max-w-lg overflow-hidden rounded-lg border border-border bg-surface shadow-lg'
      >
        <div className='flex items-center gap-2 border-b border-border px-4'>
          <svg
            viewBox='0 0 24 24'
            className='h-4 w-4 shrink-0 text-fg-muted'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
            aria-hidden
          >
            <circle cx='11' cy='11' r='7' />
            <path d='m20 20-3.5-3.5' strokeLinecap='round' />
          </svg>
          <input
            ref={inputRef}
            type='text'
            role='combobox'
            aria-expanded='true'
            aria-controls='command-list'
            aria-activedescendant={
              results[activeIndex]
                ? `cmd-${results[activeIndex].id}`
                : undefined
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Jump to…'
            className='h-12 w-full bg-transparent text-sm text-fg-body placeholder:text-fg-muted focus:outline-none'
          />
          <kbd className='hidden rounded border border-border bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-fg-muted sm:inline'>
            ESC
          </kbd>
        </div>
        <ul
          id='command-list'
          role='listbox'
          className='no-scrollbar max-h-72 overflow-y-auto p-2'
        >
          {results.length === 0 ? (
            <li className='px-3 py-6 text-center text-sm text-fg-muted'>
              No matches for “{query}”
            </li>
          ) : (
            results.map((command, index) => (
              <li
                key={command.id}
                id={`cmd-${command.id}`}
                role='option'
                aria-selected={index === activeIndex}
              >
                <button
                  type='button'
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => runAt(index)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors',
                    index === activeIndex
                      ? 'bg-primary-subtle text-primary'
                      : 'text-fg-body hover:bg-surface-muted',
                  )}
                >
                  <span
                    className={cn(
                      index === activeIndex ? 'text-primary' : 'text-fg-muted',
                    )}
                  >
                    {command.icon}
                  </span>
                  <span className='flex-1'>
                    <span className='block font-medium'>{command.label}</span>
                    {command.hint ? (
                      <span className='block text-xs text-fg-muted'>
                        {command.hint}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
        <div className='flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-fg-muted'>
          <span className='flex items-center gap-1.5'>
            <kbd className='rounded border border-border bg-surface-muted px-1 py-0.5'>
              ↑
            </kbd>
            <kbd className='rounded border border-border bg-surface-muted px-1 py-0.5'>
              ↓
            </kbd>
            to navigate
          </span>
          <span className='flex items-center gap-1.5'>
            <kbd className='rounded border border-border bg-surface-muted px-1 py-0.5'>
              ↵
            </kbd>
            to open
          </span>
        </div>
      </div>
    </div>
  );
}
