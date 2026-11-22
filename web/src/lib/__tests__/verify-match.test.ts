import { describe, it, expect } from 'vitest';
import { matchVerifyCondition } from '@/lib/verify-match';

describe('matchVerifyCondition', () => {
  describe('URL contains', () => {
    it('returns local completed=true when the url contains the target', () => {
      const r = matchVerifyCondition('URL contains /events-manager', {
        url: 'https://business.facebook.com/events-manager/list',
      });
      expect(r).toEqual({ local: true, completed: true });
    });

    it('returns local completed=false when the url does not contain the target', () => {
      const r = matchVerifyCondition('URL contains /events-manager', {
        url: 'https://business.facebook.com/settings',
      });
      expect(r).toEqual({ local: true, completed: false });
    });

    it('is case-insensitive on both the directive and the target/url', () => {
      const r = matchVerifyCondition('url CONTAINS /Events-Manager', {
        url: 'https://business.facebook.com/EVENTS-MANAGER/list',
      });
      expect(r).toEqual({ local: true, completed: true });
    });

    it('trims whitespace around the target', () => {
      const r = matchVerifyCondition('URL contains    /checkout   ', {
        url: 'https://shop.example.com/checkout',
      });
      expect(r).toEqual({ local: true, completed: true });
    });
  });

  describe('clipboard contains', () => {
    const clipboard = [
      { label: 'Pixel ID', value: '1234567890' },
      { label: 'Access Token', value: 'EAAabc-secret' },
    ];

    it('matches by clipboard item label', () => {
      const r = matchVerifyCondition('clipboard contains Pixel ID', { url: 'about:blank', clipboard });
      expect(r).toEqual({ local: true, completed: true });
    });

    it('matches by clipboard item value', () => {
      const r = matchVerifyCondition('clipboard contains 1234567890', { url: 'about:blank', clipboard });
      expect(r).toEqual({ local: true, completed: true });
    });

    it('is case-insensitive when matching clipboard contents', () => {
      const r = matchVerifyCondition('clipboard contains access token', { url: 'about:blank', clipboard });
      expect(r).toEqual({ local: true, completed: true });
    });

    it('trims the target before matching', () => {
      const r = matchVerifyCondition('clipboard contains   Pixel ID   ', { url: 'about:blank', clipboard });
      expect(r).toEqual({ local: true, completed: true });
    });

    it('returns local completed=false when nothing matches', () => {
      const r = matchVerifyCondition('clipboard contains nonexistent', { url: 'about:blank', clipboard });
      expect(r).toEqual({ local: true, completed: false });
    });

    it('treats a missing clipboard as empty (completed=false)', () => {
      const r = matchVerifyCondition('clipboard contains anything', { url: 'about:blank' });
      expect(r).toEqual({ local: true, completed: false });
    });
  });

  describe('non-local conditions', () => {
    it('returns {local:false} for conditions it cannot evaluate', () => {
      const r = matchVerifyCondition('The success toast is visible on screen', {
        url: 'https://example.com',
      });
      expect(r).toEqual({ local: false });
    });

    it('returns {local:false} for an empty condition', () => {
      const r = matchVerifyCondition('', { url: 'https://example.com' });
      expect(r).toEqual({ local: false });
    });
  });
});
