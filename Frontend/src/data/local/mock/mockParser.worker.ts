import { parseFileContents, type ParserWorkerSource } from './mockParserCore';

interface ParseMessage { fileName: string; source: ParserWorkerSource; }
type ParseResult = { ok: true; table: Awaited<ReturnType<typeof parseFileContents>> } | { ok: false; error: string };

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<ParseMessage>) => void) | null;
  postMessage: (message: ParseResult) => void;
};

workerScope.onmessage = async (event) => {
  try {
    workerScope.postMessage({ ok: true, table: await parseFileContents(event.data.fileName, event.data.source) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'invalid_file';
    workerScope.postMessage({ ok: false, error: message });
  }
};
