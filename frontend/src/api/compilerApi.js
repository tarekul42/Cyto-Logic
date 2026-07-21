import axios from 'axios';

const API_BASE = '/api';

export const compileCircuit = async (logicString) => {
  const response = await axios.post(`${API_BASE}/compile`, {
    logic: logicString
  }, { timeout: 30000 });
  return response.data;
};

export const compileFromGraph = async (nodes, edges) => {
  const response = await axios.post(`${API_BASE}/compile`, {
    nodes,
    edges
  }, { timeout: 30000 });
  return response.data;
};

export const simulateCircuit = async (logic, inputs = {}, t_span = [0, 100], dt = 1.0) => {
  const response = await axios.post(`${API_BASE}/simulate`, {
    logic,
    inputs,
    t_span,
    dt
  }, { timeout: 60000 });
  return response.data;
};

const _downloadBlob = async (url, data, filename, mimeType) => {
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

  const blob = new Blob([response.data], { type: mimeType });
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

export const exportSBOL = async (parts, circuitName) => {
  await _downloadBlob(
    `${API_BASE}/export/sbol`,
    { parts, name: circuitName },
    `${circuitName || 'my_circuit'}.xml`,
    'application/xml'
  );
};

export const exportDNA = async (logic, circuitName) => {
  await _downloadBlob(
    `${API_BASE}/export/dna`,
    { logic, name: circuitName },
    `${circuitName || 'circuit'}.fa`,
    'text/plain'
  );
};

export const exportSVG = async (logic, circuitName) => {
  await _downloadBlob(
    `${API_BASE}/export/svg`,
    { logic, name: circuitName },
    `${circuitName || 'circuit'}.svg`,
    'image/svg+xml'
  );
};
