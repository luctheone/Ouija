import { describe, it, expect } from 'vitest';
import { signSessionToken, verifySessionToken } from '@/lib/auth';

// NOTE: auth.ts reads SESSION_SECRET from env at module load, so we can't override
// the secret here. These assertions hold regardless of the secret value — they only
// require sign/verify to agree with whatever secret was loaded.
//
// NOTE on expiry: tokens carry an `exp` 7 days out and we have no time control here,
// so expiry is not exercised. The roundtrip + tamper cases below are secret-agnostic.

describe('session tokens', () => {
  const claims = { sid: 'sess_abc123', did: 'dev_xyz789' };

  it('sign → verify roundtrips to the same {sid, did}', () => {
    const token = signSessionToken(claims);
    expect(verifySessionToken(token)).toEqual(claims);
  });

  it('rejects a token whose signature has been tampered with', () => {
    const token = signSessionToken(claims);
    const parts = token.split('.');
    const sig = parts[2];
    // Flip one character in the signature segment.
    const flipped = (sig[0] === 'A' ? 'B' : 'A') + sig.slice(1);
    const tampered = `${parts[0]}.${parts[1]}.${flipped}`;
    expect(verifySessionToken(tampered)).toBeNull();
  });

  it('rejects a token that has been truncated', () => {
    const token = signSessionToken(claims);
    const truncated = token.slice(0, token.length - 4);
    expect(verifySessionToken(truncated)).toBeNull();
  });

  it('rejects a garbage string', () => {
    expect(verifySessionToken('not-a-real-token')).toBeNull();
  });

  it('rejects null / undefined / empty input', () => {
    expect(verifySessionToken(null)).toBeNull();
    expect(verifySessionToken(undefined)).toBeNull();
    expect(verifySessionToken('')).toBeNull();
  });
});
