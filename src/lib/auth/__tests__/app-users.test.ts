import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/app-users';

describe('app user password hashing', () => {
  it('verifies the matching password without storing raw password', () => {
    const hash = hashPassword('mat-khau-rieng-123');

    expect(hash).not.toContain('mat-khau-rieng-123');
    expect(verifyPassword('mat-khau-rieng-123', hash)).toBe(true);
    expect(verifyPassword('sai-mat-khau', hash)).toBe(false);
  });
});
