import axios from 'axios';
import type { Node, Edge } from '@xyflow/react';
import { CompileError } from '../errors';

const API_BASE = '/api';

interface CompilePayload {
  logic?: string
  nodes?: Node[]
  edges?: Edge[]
}

interface SimulationPayload {
  logic?: string
  inputs?: Record<string, number>
  t_span?: number[]
  dt?: number
  params?: Record<string, number>
}

interface ExportPayload {
  parts?: { id: string; role: string; info: string }[]
  logic?: string
  name: string
}

export interface Part {
  id: string
  role: string
  info: string
}

export interface GraphNode {
  id?: string
  type: string
}

export interface CompileResult {
  success: boolean
  error?: string
  logic?: string
  parts?: Part[]
  nodes?: GraphNode[]
  edges?: unknown[]
  output_protein?: string
  complexity_score?: number
  semantic_messages?: string[]
}

export interface SimResult {
  success?: boolean
  error?: string
  times?: number[]
  trajectories?: Record<string, number[]>
  species?: string[]
  num_points?: number
}

export const compileCircuit = async (logicString: string, signal?: AbortSignal): Promise<CompileResult> => {
  const payload: CompilePayload = { logic: logicString }
  const response = await axios.post(`${API_BASE}/compile`, payload, { timeout: 30000, signal });
  return response.data as CompileResult;
};

export const compileFromGraph = async (nodes: Node[], edges: Edge[], signal?: AbortSignal): Promise<CompileResult> => {
  const payload: CompilePayload = { nodes, edges }
  const response = await axios.post(`${API_BASE}/compile`, payload, { timeout: 30000, signal });
  return response.data as CompileResult;
};

export const simulateCircuit = async (
  logic: string,
  inputs: Record<string, number> = {},
  tSpan: number[] = [0, 100],
  dt: number = 1.0,
  params: Record<string, number> = {},
  signal?: AbortSignal
): Promise<SimResult> => {
  const payload: SimulationPayload = { logic, inputs, t_span: tSpan, dt, params }
  const response = await axios.post(`${API_BASE}/simulate`, payload, { timeout: 60000, signal });
  return response.data as SimResult;
};

async function downloadBlob(url: string, postPayload: ExportPayload, filename: string, mimeType: string, signal?: AbortSignal): Promise<void> {
  const response = await axios.post(url, postPayload, {
    responseType: 'blob',
    timeout: 30000,
    signal
  });

  const contentType = String(response.headers['content-type'] || '');
  if (contentType.includes('application/json')) {
    const text = await new Response(response.data).text();
    const apiError = JSON.parse(text);
    throw new CompileError(apiError.error || 'Export failed', 'EXPORT_ERROR');
  }

  const blob = new Blob([response.data as BlobPart], { type: mimeType });
  const blobUrl = window.URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = blobUrl;
  downloadLink.setAttribute('download', filename);
  document.body.appendChild(downloadLink);
  downloadLink.click();

  setTimeout(() => {
    downloadLink.remove();
    window.URL.revokeObjectURL(blobUrl);
  }, 100);
};

export const exportSBOL = async (parts: Part[], circuitName: string, signal?: AbortSignal): Promise<void> => {
  const payload: ExportPayload = { parts, name: circuitName }
  await downloadBlob(`${API_BASE}/export/sbol`, payload, `${circuitName || 'my_circuit'}.xml`, 'application/xml', signal);
};

export const exportDNA = async (logic: string, circuitName: string, signal?: AbortSignal): Promise<void> => {
  const payload: ExportPayload = { logic, name: circuitName }
  await downloadBlob(`${API_BASE}/export/dna`, payload, `${circuitName || 'circuit'}.fa`, 'text/plain', signal);
};

export const exportSVG = async (logic: string, circuitName: string, signal?: AbortSignal): Promise<void> => {
  const payload: ExportPayload = { logic, name: circuitName }
  await downloadBlob(`${API_BASE}/export/svg`, payload, `${circuitName || 'circuit'}.svg`, 'image/svg+xml', signal);
};
