import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isAppWorker, shouldDisablePwa } from './pwaEnvironment';

const published = { production: true, iframe: false, hostname: 'nemu-com-py.lovable.app', search: '' };

describe('PWA environment safety', () => {
  it('permits the published installed app and custom domains', () => {
    assert.equal(shouldDisablePwa(published), false);
    assert.equal(shouldDisablePwa({ ...published, hostname: 'www.nemu.com.py' }), false);
    assert.equal(shouldDisablePwa({ ...published, hostname: 'preview-v2--shop.example.com' }), false);
  });
  it('blocks development and iframe contexts', () => {
    assert.equal(shouldDisablePwa({ ...published, production: false }), true);
    assert.equal(shouldDisablePwa({ ...published, iframe: true }), true);
  });
  it('blocks main, draft, commit, and workspace previews', () => {
    for (const hostname of [
      'id-preview--d4a8abe9-1913-48ae-a76f-96767755072e.lovable.app',
      'preview-2--nemu.gpt-eng.com', 'ID-PREVIEW-abc123--nemu.gptengineer.run',
      'project--d4a8abe9-1913-48ae-a76f-96767755072e-dev.lovable.app',
      'lovableproject.com', 'nemu.lovableproject-dev.com', 'nemu.beta.lovable.dev',
    ]) assert.equal(shouldDisablePwa({ ...published, hostname }), true, hostname);
  });
  it('honors the explicit worker kill switch', () => {
    assert.equal(shouldDisablePwa({ ...published, search: '?sw=off' }), true);
    assert.equal(shouldDisablePwa({ ...published, search: '?sw=on' }), false);
  });
  it('cleans only same-origin app workers, preserving messaging', () => {
    const origin = 'https://nemu-com-py.lovable.app';
    assert.equal(isAppWorker('/sw.js', origin), true);
    assert.equal(isAppWorker('/service-worker.js', origin), true);
    assert.equal(isAppWorker('/firebase-messaging-sw.js', origin), false);
    assert.equal(isAppWorker('/OneSignalSDKWorker.js', origin), false);
    assert.equal(isAppWorker('https://other.example/sw.js', origin), false);
  });
});