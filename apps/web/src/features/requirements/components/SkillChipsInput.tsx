import { useState } from 'react';

import { cn } from '@/utils/cn';

interface SkillChipsInputProps {
  id: string;
  label: string;
  skills: string[];
  onChange: (skills: string[]) => void;
}

/** Presentational chip input for a list of skills. Enter/comma adds a chip. */
export function SkillChipsInput({
  id,
  label,
  skills,
  onChange,
}: SkillChipsInputProps) {
  const [draft, setDraft] = useState('');

  const addSkill = () => {
    const value = draft.trim();
    if (!value) return;
    if (!skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      onChange([...skills, value]);
    }
    setDraft('');
  };

  const removeSkill = (skill: string) => {
    onChange(skills.filter((s) => s !== skill));
  };

  return (
    <div>
      <label htmlFor={id} className='block text-sm font-medium text-fg'>
        {label}
      </label>
      {skills.length > 0 ? (
        <ul className='mt-2 flex flex-wrap gap-2'>
          {skills.map((skill) => (
            <li key={skill}>
              <span className='inline-flex items-center gap-1 rounded-full bg-primary-subtle px-2.5 py-1 text-xs font-medium text-primary-active'>
                {skill}
                <button
                  type='button'
                  onClick={() => removeSkill(skill)}
                  aria-label={`Remove ${skill}`}
                  className='text-primary-active/70 hover:text-primary-active'
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <div className='mt-2 flex gap-2'>
        <input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              addSkill();
            }
          }}
          placeholder='Type a skill and press Enter'
          className={cn(
            'h-10 flex-1 rounded-md border border-border bg-surface px-3 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary-hover focus:ring-offset-1',
          )}
        />
        <button
          type='button'
          onClick={addSkill}
          className='h-10 rounded-md border border-border px-3 text-sm font-medium text-fg hover:bg-surface-muted'
        >
          Add
        </button>
      </div>
    </div>
  );
}
