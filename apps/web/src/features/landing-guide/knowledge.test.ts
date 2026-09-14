import { describe, expect, it } from 'vitest';

import { answerQuestion } from './knowledge';

describe('answerQuestion', () => {
  it('matches a relevant topic by keyword', () => {
    const reply = answerQuestion('How does the team builder recommend people?');
    expect(reply.answer).toContain('Project Fit Score');
    expect(reply.offersDemo).toBe(true);
  });

  it('answers "what is TACT AI" with the overview', () => {
    const reply = answerQuestion('What is TACT AI about?');
    expect(reply.answer).toContain('Team Assembly');
  });

  it('falls back to a demo nudge when nothing matches', () => {
    const reply = answerQuestion('zzz qqq unrelated gibberish');
    expect(reply.answer).toContain('general questions about TACT AI');
    expect(reply.offersDemo).toBe(true);
  });

  it('falls back for empty input', () => {
    const reply = answerQuestion('   ');
    expect(reply.offersDemo).toBe(true);
  });
});
