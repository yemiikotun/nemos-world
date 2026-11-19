import { describe, expect, it, vi } from 'vitest';
import type Anthropic from '@anthropic-ai/sdk';
import { handleRecap, type CreateMessage } from './recap';

const week = { entries: [{ date: '2026-11-18', text: 'Zoomies at the park.', walkMinutes: 35, mood: 'playful' }] };

const request = (body: unknown, ip = `test-${Math.random()}`) =>
  new Request('http://localhost/api/recap', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const reply = (overrides: Partial<Anthropic.Beta.BetaMessage>) =>
  ({
    id: 'msg_test',
    type: 'message',
    role: 'assistant',
    model: 'claude-opus-5-5',
    stop_reason: 'end_turn',
    content: [
      { type: 'thinking', thinking: '', signature: 'sig' },
      { type: 'text', text: 'What a week! — Nemo 🐾', citations: null },
    ],
    ...overrides,
  }) as unknown as Anthropic.Beta.BetaMessage;

describe('handleRecap', () => {
  it('returns the text from Claude and sends the expected request', async () => {
    const createMessage = vi.fn<CreateMessage>().mockResolvedValue(reply({}));
    const response = await handleRecap(request(week), createMessage);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ recap: 'What a week! — Nemo 🐾' });

    const params = createMessage.mock.calls[0][0];
    expect(params.model).toBe('claude-opus-5-5');
    expect(params.fallbacks).toBe('default');
    expect(params.betas).toContain('server-side-fallback-2026-07-01');
    expect(JSON.stringify(params.messages)).toContain('Zoomies at the park.');
  });

  it('rejects bad input without calling Claude', async () => {
    const createMessage = vi.fn<CreateMessage>();
    expect((await handleRecap(request({ entries: [] }), createMessage)).status).toBe(400);
    expect((await handleRecap(request('not json'), createMessage)).status).toBe(400);
    expect(createMessage).not.toHaveBeenCalled();
  });

  it('handles a refusal and an empty reply', async () => {
    const refused = vi.fn<CreateMessage>().mockResolvedValue(reply({ stop_reason: 'refusal', content: [] }));
    expect((await handleRecap(request(week), refused)).status).toBe(422);
    const empty = vi.fn<CreateMessage>().mockResolvedValue(reply({ content: [] }));
    expect((await handleRecap(request(week), empty)).status).toBe(502);
  });

  it('limits how often one visitor can ask', async () => {
    const createMessage = vi.fn<CreateMessage>().mockResolvedValue(reply({}));
    const statuses = [];
    for (let i = 0; i < 6; i++) statuses.push((await handleRecap(request(week, 'same-visitor'), createMessage, 1000)).status);
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
  });

  it('turns API errors into friendly messages', async () => {
    const failing = vi.fn<CreateMessage>().mockRejectedValue(new Error('network down'));
    const response = await handleRecap(request(week), failing);
    expect(response.status).toBe(500);
    expect((await response.json()).error).toMatch(/try again/i);
  });
});
