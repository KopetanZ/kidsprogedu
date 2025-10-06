import { describe, it, expect } from 'vitest';
import { lessons } from '../content/lessons';
import { LessonSchema } from '../core/blocks/schemas';

describe('Lessons JSON validity', () => {
  it('all lessons conform to LessonSchema', () => {
    for (const l of lessons) {
      const p = LessonSchema.safeParse(l);
      if (!p.success) {
        // show first error
        const msg = p.error.issues[0]?.message ?? 'unknown error';
        throw new Error(`${l.id}: ${msg}`);
      }
      expect(p.success).toBe(true);
    }
  });
});

