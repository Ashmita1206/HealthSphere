import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TimelineDrawer } from './TimelineDrawer';
import { createPlaceholderTimelineEvents } from './timelineData';

const event = createPlaceholderTimelineEvents(
  new Date(2026, 6, 25, 12),
)[0];

describe('TimelineDrawer accessibility', () => {
  afterEach(() => {
    document.querySelectorAll('[data-test-outside]').forEach((element) => {
      element.remove();
    });
  });

  it('exposes complete details and closes with Escape', async () => {
    const onOpenChange = vi.fn();

    render(
      <TimelineDrawer
        event={event}
        open
        onOpenChange={onOpenChange}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Complete Details')).toBeInTheDocument();
    expect(screen.getByText('Related Information')).toBeInTheDocument();
    expect(screen.getByText('Linked Module')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() =>
      expect(onOpenChange).toHaveBeenCalledWith(false),
    );
  });

  it('moves focus into the drawer and traps focus there', async () => {
    const outsideButton = document.createElement('button');
    outsideButton.dataset.testOutside = 'true';
    document.body.appendChild(outsideButton);

    render(
      <TimelineDrawer
        event={event}
        open
        onOpenChange={vi.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog');
    await waitFor(() =>
      expect(dialog).toContainElement(document.activeElement as HTMLElement),
    );

    act(() => outsideButton.focus());
    await waitFor(() =>
      expect(dialog).toContainElement(document.activeElement as HTMLElement),
    );
  });
});
