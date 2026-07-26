import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TimelineCard } from './TimelineCard';
import { createPlaceholderTimelineEvents } from './timelineData';

describe('TimelineCard accessibility', () => {
  it('supports keyboard activation through its native details button', () => {
    const event = createPlaceholderTimelineEvents(
      new Date(2026, 6, 25, 12),
    )[0];
    const onOpen = vi.fn();

    render(
      <TimelineCard
        event={event}
        viewMode="vertical"
        onOpen={onOpen}
      />,
    );

    const cardButton = screen.getByRole('button', {
      name: `Open details for ${event.title}`,
    });
    cardButton.focus();
    fireEvent.keyDown(cardButton, { key: 'Enter' });
    fireEvent.click(cardButton);

    expect(cardButton).toHaveFocus();
    expect(onOpen).toHaveBeenCalledWith(event);
  });
});
