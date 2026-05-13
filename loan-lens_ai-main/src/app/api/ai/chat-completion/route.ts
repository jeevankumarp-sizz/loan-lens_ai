/**
 * /api/ai/chat-completion/route.ts
 *
 * Hardened LLM proxy via @rocketnew/llm-sdk.
 * - Always returns valid JSON (never plain text)
 * - Safe error handling — never crashes the frontend parser
 * - Request validation with descriptive errors
 * - Detailed server logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { completion } from '@rocketnew/llm-sdk';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | unknown[];
}

interface RequestBody {
  provider: string;
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  parameters?: Record<string, unknown>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_KEYS: Record<string, string | undefined> = {
  OPEN_AI: process.env.OPENAI_API_KEY,
  ANTHROPIC: process.env.ANTHROPIC_API_KEY,
  GEMINI: process.env.GEMINI_API_KEY,
  PERPLEXITY: process.env.PERPLEXITY_API_KEY,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeJsonResponse(data: object, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Strip image parts from messages to convert multimodal → text-only.
 * Used as a fallback when image-based requests fail.
 */
function stripImagesFromMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((msg) => {
    if (!Array.isArray(msg.content)) return msg;
    const textOnly = (msg.content as unknown[]).filter(
      (part) =>
        typeof part === 'object' &&
        part !== null &&
        (part as Record<string, unknown>).type === 'text'
    );
    return {
      ...msg,
      content: textOnly.length === 1
        ? ((textOnly[0] as Record<string, unknown>).text as string)
        : textOnly,
    };
  });
}

function buildErrorResponse(error: unknown, provider?: string) {
  const rawStatus =
    (error as Record<string, unknown>)?.statusCode ??
    (error as Record<string, unknown>)?.status ??
    500;
  const statusCode = typeof rawStatus === 'number' ? rawStatus : 500;
  const providerName =
    typeof (error as Record<string, unknown>)?.llmProvider === 'string'
      ? (error as Record<string, unknown>).llmProvider
      : provider ?? 'Unknown';

  // Friendly error messages — never expose raw API errors to users
  let friendlyMessage = 'AI verification temporarily unavailable. Please retry.';
  const errMsg =
    error instanceof Error ? error.message : String(error);
  const lower = errMsg.toLowerCase();

  if (lower.includes('400') || statusCode === 400) {
    friendlyMessage = 'AI request format error. Image may be incompatible. Please retry with a different photo.';
  } else if (lower.includes('429') || statusCode === 429) {
    friendlyMessage = 'AI service is busy. Please wait a moment and retry.';
  } else if (statusCode >= 500) {
    friendlyMessage = 'AI server error. Please retry in a few seconds.';
  }

  return {
    error: friendlyMessage,
    provider: String(providerName).toUpperCase(),
    statusCode,
    details: errMsg.slice(0, 200),
  };
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: Partial<RequestBody> = {};

  // ── Parse body ────────────────────────────────────────────────────────────
  try {
    body = (await request.json()) as Partial<RequestBody>;
  } catch {
    return safeJsonResponse(
      { error: 'Invalid JSON in request body', details: 'Request parse failed' },
      400
    );
  }

  const { provider, model, messages, stream = false, parameters = {} } = body;

  console.log('[chat-completion] Request:', {
    provider,
    model,
    messageCount: messages?.length ?? 0,
    stream,
  });

  // ── Validate required fields ──────────────────────────────────────────────
  if (!provider || typeof provider !== 'string') {
    return safeJsonResponse(
      { error: 'Missing required field: provider', details: 'Request validation failed' },
      400
    );
  }
  if (!model || typeof model !== 'string') {
    return safeJsonResponse(
      { error: 'Missing required field: model', details: 'Request validation failed' },
      400
    );
  }
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return safeJsonResponse(
      { error: 'Missing required field: messages (must be non-empty array)', details: 'Request validation failed' },
      400
    );
  }

  // ── Validate API key ──────────────────────────────────────────────────────
  const apiKey = API_KEYS[provider.toUpperCase()];
  if (!apiKey) {
    return safeJsonResponse(
      {
        error: `${provider.toUpperCase()} API key is not configured`,
        details: 'Set the API key in environment variables',
      },
      400
    );
  }

  // ── Non-streaming completion ──────────────────────────────────────────────
  if (!stream) {
    try {
      const response = await completion({
        model,
        messages,
        stream: false,
        api_key: apiKey,
        ...parameters,
      });

      console.log('[chat-completion] Success:', { model, provider });
      return safeJsonResponse(response as object);
    } catch (error) {
      const formatted = buildErrorResponse(error, provider);
      console.error('[chat-completion] Error:', formatted);

      // On Gemini 400, the caller (fraudScoring) should use /api/ai/verify-asset instead
      // Return structured error so aiClient.ts can handle it
      return safeJsonResponse(
        { error: formatted.error, details: formatted.details, provider: formatted.provider },
        formatted.statusCode >= 400 && formatted.statusCode < 600 ? formatted.statusCode : 500
      );
    }
  }

  // ── Streaming completion ──────────────────────────────────────────────────
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        send({ type: 'start' });

        const response = await completion({
          model,
          messages,
          stream: true,
          api_key: apiKey,
          ...parameters,
        });

        for await (const chunk of response as AsyncIterable<unknown>) {
          send({ type: 'chunk', chunk });
        }

        send({ type: 'done' });
        controller.close();
      } catch (error) {
        const formatted = buildErrorResponse(error, provider);
        console.error('[chat-completion] Stream error:', formatted);
        send({ type: 'error', error: formatted.error, details: formatted.details });
        controller.close();
      }
    },
  });

  return new NextResponse(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
