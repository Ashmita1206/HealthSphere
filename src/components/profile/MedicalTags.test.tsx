import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MedicalTags } from './MedicalTags';

describe('MedicalTags', () => {
  it.each([undefined, null, 'legacy-value', {}])(
    'renders safely when tags are %p',
    (tags) => {
      render(
        <MedicalTags
          label="Allergies"
          tags={tags}
          placeholder="Add allergy"
          color="rose"
          onAdd={vi.fn()}
          onRemove={vi.fn()}
        />,
      );

      expect(screen.getByRole('list', { name: 'Allergies list' })).toBeEmptyDOMElement();
    },
  );
});
