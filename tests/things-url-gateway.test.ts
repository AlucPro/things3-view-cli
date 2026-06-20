import { describe, expect, it, vi } from 'vitest';
import { ThingsUrlGateway } from '../src/infrastructure/things-url-gateway.js';

describe('ThingsUrlGateway', () => {
  it('builds an encoded completion URL and redacts the token', () => {
    const gateway = new ThingsUrlGateway({ open: vi.fn(), authToken: 'secret-token' });
    const url = gateway.buildCompleteUrl('ABC 123');
    expect(url).toContain('id=ABC+123');
    expect(url).toContain('auth-token=secret-token');
    expect(gateway.redact(url)).not.toContain('secret-token');
  });
});
