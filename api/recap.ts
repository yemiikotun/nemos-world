/**
 * POST /api/recap: a Vercel serverless function that asks Claude to write
 * "Nemo's Week" from the last 7 diary entries.
 *
 * The Anthropic API key lives only here on the server, in the ANTHROPIC_API_KEY
 * environment variable (set in Vercel's project settings). It is never sent to
 * the browser.
 */
import Anthropic from '@anthropic-ai/sdk';
import { RECAP_SYSTEM_PROMPT, buildRecapPrompt, createRateLimiter, validateRecapRequest } from './_lib/recap.js';

const MODEL = 'claude-opus-5-5';
const allow = createRateLimiter(5, 10 * 60 * 1000); // 5 recaps per visitor per 10 minutes

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/** The one call the handler needs, so tests can swap in a fake. */
export type CreateMessage = (
  params: Anthropic.Beta.MessageCreateParamsNonStreaming,
) => Promise<Anthropic.Beta.BetaMessage>;

export async function handleRecap(request: Request, createMessage: CreateMessage, now = Date.now()): Promise<Response> {
  const visitor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (!allow(visitor, now)) {
    return json(429, { error: 'Nemo needs a nap. Try again in a few minutes.' });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'Expected a JSON body.' });
  }
  const checked = validateRecapRequest(body);
  if (!checked.ok) return json(400, { error: checked.error });

  try {
    const message = await createMessage({
      model: MODEL,
      max_tokens: 8000,
      // Thinking is always on for this model; low effort keeps a short creative
      // task quick and inexpensive.
      output_config: { effort: 'low' },
      // If a safety check declines the request, the API retries it on a
      // suitable fallback model inside the same call.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: RECAP_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildRecapPrompt(checked.entries) }],
    });

    if (message.stop_reason === 'refusal') {
      return json(422, { error: "Nemo couldn't write a recap for this week. Try editing the entries." });
    }
    const recap = message.content
      .flatMap((block) => (block.type === 'text' ? [block.text] : []))
      .join('')
      .trim();
    if (!recap) return json(502, { error: 'Nemo got distracted. Please try again.' });
    return json(200, { recap });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error('Recap: the Anthropic API key was rejected.');
      return json(503, { error: "The recap feature isn't set up correctly yet." });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return json(429, { error: 'Lots of recaps right now. Please try again in a minute.' });
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Recap: Anthropic API error ${error.status}`, error.message);
      return json(502, { error: 'Nemo got distracted. Please try again.' });
    }
    console.error('Recap: unexpected error', error);
    return json(500, { error: 'Something went wrong. Please try again.' });
  }
}

let client: Anthropic | null = null;

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return json(503, { error: "The recap feature isn't set up yet." });
  }
  client ??= new Anthropic();
  return handleRecap(request, (params) => client!.beta.messages.create(params));
}
