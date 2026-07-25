import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MedicineForm } from './MedicineForm';

describe('MedicineForm accessibility', () => {
  afterEach(() => {
    document.querySelectorAll('[data-test-outside]').forEach((element) => {
      element.remove();
    });
  });

  it('moves focus into the dialog and keeps focus trapped', async () => {
    const outsideButton = document.createElement('button');
    outsideButton.dataset.testOutside = 'true';
    document.body.appendChild(outsideButton);

    render(
      <MedicineForm
        open
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
        loading={false}
      />,
    );

    const dialog = screen.getByRole('dialog');
    const nameInput = screen.getByLabelText('Medication Name *');

    await waitFor(() => expect(nameInput).toHaveFocus());
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    expect(
      screen.getByRole('button', { name: 'Save to Cabinet' }),
    ).toBeDisabled();

    act(() => outsideButton.focus());
    await waitFor(() =>
      expect(dialog).toContainElement(document.activeElement as HTMLElement),
    );
  });

  it('closes with Escape', async () => {
    const onOpenChange = vi.fn();

    render(
      <MedicineForm
        open
        onOpenChange={onOpenChange}
        onSubmit={vi.fn()}
        loading={false}
      />,
    );

    await waitFor(() =>
      expect(screen.getByLabelText('Medication Name *')).toHaveFocus(),
    );
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() =>
      expect(onOpenChange).toHaveBeenCalledWith(false),
    );
  });

  it('enables Save only when the form is valid', async () => {
    render(
      <MedicineForm
        open
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
        loading={false}
        editData={{
          name: 'Paracetamol',
          dosage: '500 mg',
          frequency: 'once-daily',
          startDate: '2026-07-25',
          remainingPills: 0,
          totalPills: 30,
        }}
      />,
    );

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Save to Cabinet' }),
      ).toBeEnabled(),
    );
  });
});
