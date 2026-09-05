// Browser-only live price stream over Yahoo Finance's WebSocket endpoint.
// Messages are base64-encoded protobuf (`PricingData`); we decode only the
// handful of fields we render, so no protobuf runtime is needed.

export interface StreamQuote {
  id: string;
  price?: number;
  change?: number;
  changePercent?: number;
  time?: number;
}

const WS_URL = 'wss://streamer.finance.yahoo.com/?version=2';

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Minimal protobuf decoder for Yahoo's PricingData message. */
function decodePricingData(buf: Uint8Array): StreamQuote | null {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const dec = new TextDecoder();
  let i = 0;
  const q: StreamQuote = { id: '' };

  const varint = () => {
    let result = 0;
    let shift = 0;
    while (i < buf.length) {
      const b = buf[i++];
      result += (b & 0x7f) * Math.pow(2, shift);
      if ((b & 0x80) === 0) break;
      shift += 7;
    }
    return result;
  };

  while (i < buf.length) {
    const key = varint();
    const field = key >>> 3;
    const wire = key & 0x07;

    if (wire === 0) {
      const v = varint();
      if (field === 3) q.time = Math.floor(v / 2) * (v & 1 ? -1 : 1); // zigzag
    } else if (wire === 5) {
      const v = view.getFloat32(i, true);
      i += 4;
      if (field === 2) q.price = v;
      else if (field === 8) q.changePercent = v;
      else if (field === 12) q.change = v;
    } else if (wire === 1) {
      i += 8;
    } else if (wire === 2) {
      const len = varint();
      const slice = buf.subarray(i, i + len);
      i += len;
      if (field === 1) q.id = dec.decode(slice);
    } else {
      return null; // unknown wire type — bail out
    }
  }

  return q.id ? q : null;
}

export interface StreamHandle {
  close: () => void;
}

/**
 * Opens a live websocket stream for the given symbols.
 * Auto-reconnects with backoff; reports connection state changes.
 */
export function subscribeQuotes(
  symbols: string[],
  onQuote: (q: StreamQuote) => void,
  onStatus?: (connected: boolean) => void,
): StreamHandle {
  if (typeof WebSocket === 'undefined') return { close: () => {} };

  let ws: WebSocket | null = null;
  let closed = false;
  let attempt = 0;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let ping: ReturnType<typeof setInterval> | undefined;

  const connect = () => {
    if (closed) return;
    try {
      ws = new WebSocket(WS_URL);
    } catch {
      schedule();
      return;
    }

    ws.onopen = () => {
      attempt = 0;
      onStatus?.(true);
      ws?.send(JSON.stringify({ subscribe: symbols }));
      ping = setInterval(() => {
        if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ subscribe: symbols }));
      }, 30000);
    };

    ws.onmessage = (event) => {
      try {
        const raw = typeof event.data === 'string' ? event.data : '';
        if (!raw) return;
        let payload = raw;
        if (raw.startsWith('{')) {
          const parsed = JSON.parse(raw);
          if (typeof parsed?.message !== 'string') return;
          payload = parsed.message;
        }
        const quote = decodePricingData(b64ToBytes(payload));
        if (quote && typeof quote.price === 'number' && Number.isFinite(quote.price)) {
          onQuote(quote);
        }
      } catch {
        /* ignore malformed frames */
      }
    };

    ws.onerror = () => ws?.close();

    ws.onclose = () => {
      clearInterval(ping);
      onStatus?.(false);
      schedule();
    };
  };

  const schedule = () => {
    if (closed) return;
    attempt += 1;
    const delay = Math.min(30000, 1000 * Math.pow(2, Math.min(attempt, 5)));
    retry = setTimeout(connect, delay);
  };

  connect();

  return {
    close: () => {
      closed = true;
      clearTimeout(retry);
      clearInterval(ping);
      try {
        ws?.close();
      } catch {
        /* noop */
      }
      ws = null;
    },
  };
}
