import { beforeEach, describe, expect, it } from 'vitest';

import { useTutorialStore } from './tutorialStore';

function reset() {
  useTutorialStore.setState({
    isActive: false,
    stepIndex: 0,
    totalSteps: 0,
  });
  localStorage.clear();
}

describe('tutorialStore', () => {
  beforeEach(reset);

  it('starts at the first step', () => {
    useTutorialStore.getState().start(3);
    const state = useTutorialStore.getState();
    expect(state.isActive).toBe(true);
    expect(state.stepIndex).toBe(0);
    expect(state.totalSteps).toBe(3);
  });

  it('advances and goes back without leaving bounds', () => {
    const store = useTutorialStore.getState();
    store.start(3);
    store.next();
    expect(useTutorialStore.getState().stepIndex).toBe(1);
    store.prev();
    expect(useTutorialStore.getState().stepIndex).toBe(0);
    store.prev();
    expect(useTutorialStore.getState().stepIndex).toBe(0);
  });

  it('finishing the last step deactivates and marks completion', () => {
    const store = useTutorialStore.getState();
    store.start(2);
    store.next(); // -> index 1 (last)
    store.next(); // finish
    expect(useTutorialStore.getState().isActive).toBe(false);
    expect(localStorage.getItem('tact-ai.tutorial-done')).toBe('true');
  });

  it('skip stops without marking completion', () => {
    const store = useTutorialStore.getState();
    store.start(3);
    store.stop();
    expect(useTutorialStore.getState().isActive).toBe(false);
    expect(localStorage.getItem('tact-ai.tutorial-done')).toBeNull();
  });
});
