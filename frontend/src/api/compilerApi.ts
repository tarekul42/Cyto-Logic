import axios from 'axios';

const API_BASE = '/api';

interface Node {
  id: string
  type: string
  [key: string]: unknown
}

interface Edge {
  id: string
  source: string
  target: string
  [key: string]: unknown
}

interface CompilePayload {
  logic?: string
  nodes?: Node[]
  edges?: Edge[]
}

interface SimulationPayload {
  logic?: string
  inputs?: Record<string, unknown>
  t_span?: number[]
  dt?: number
}

interface ExportPayload {
  parts?: { id: string; role: string; info: string }[]
  logic?: string
  name: string
}

export const compileCircuit = async (logicString: string): Promise<Record<string, unknown>> => {
  const response = await axios.post(`${API_BASE}/compile`, {
    logic: logicString
  } as CompilePayload, { timeout: 30000 });
  return response.data;
};

export const compileFromGraph = async (nodes: Node[], edges: Edge[]): Promise<Record<string, unknown>> => {
  const response = await axios.post(`${API_BASE}/compile`, {
    nodes,
    edges
  } as CompilePayload, { timeout: 30000 });
  return response.data;
};

export const simulateCircuit = async (
  logic: string,
  inputs: Record<string, unknown> = {},
  t_span: number[] = [0, 100],
  dt: number = 1.0
): Promise<Record<string, unknown>> => {
  const response = await axios.post(`${API_BASE}/simulate`, {
    logic,
    inputs,
    t_span,
    dt
  } as SimulationPayload, { timeout: 60000 });
  return response.data;
};

const _downloadBlob = async (url: string, data: Record<string, unknown>, filename: string, mimeType: string): Promise<void> => {
  const response = await axios.post(url, data, {
    responseType: 'blob',
    timeout: 30000
  });

  const contentType = response.headers['content-type'] || '';
  if (contentType.includes('application/json')) {
    const text = await new Response(response.data).text();
    const err = JSON.parse(text);
    throw new Error(err.error || 'Export failed');
  }

  const blob = new Blob([response.data as BlobPart], { type: mimeType });
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  }, 100);
};

export const exportSBOL = async (parts: { id: string; role: string; info: string }[], circuitName: string): Promise<void> => {
  await _downloadBlob(
    `${API_BASE}/export/sbol`,
    { parts, name: circuitName } as ExportPayload,
    `${circuitName || 'my_circuit'}.xml`,
    'application/xml'
  );
};

export const exportDNA = async (logic: string, circuitName: string): Promise<void> => {
  await _downloadBlob(
    `${API_BASE}/export/dna`,
    { logic, name: circuitName } as ExportPayload,
    `${circuitName || 'circuit'}.fa`,
    'text/plain'
  );
};

export const exportSVG = async (logic: string, circuitName: string): Promise<void> => {
  await _downloadBlob(
    `${API_BASE}/export/svg`,
    { logic, name: circuitName } as ExportPayload,
    `${circuitName || 'circuit'}.svg`,
    'image/svg+xml'
  );
};
