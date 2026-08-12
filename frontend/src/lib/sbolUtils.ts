export interface PartRecord {
  id: string;
  role: string;
  info: string;
}

const ROLE_COLORS: Record<string, string> = {
  promoter: "#00d4aa",
  rbs: "#4a8fe7",
  cds: "#f39c12",
  terminator: "#e74c5e",
  reporter: "#a78bfa",
};

const ROLE_ORDER = [
  "promoter",
  "rbs",
  "cds",
  "terminator",
  "reporter",
  "inducer",
  "regulatory_protein",
];

export function sortPartsByRole(parts: PartRecord[]): PartRecord[] {
  return [...parts].sort(
    (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role),
  );
}

export function getRoleColor(role?: string): string {
  if (!role) return "var(--color-text-tertiary)";
  const lowered = role.toLowerCase();
  for (const [key, color] of Object.entries(ROLE_COLORS)) {
    if (lowered.includes(key)) return color;
  }
  return "var(--color-text-tertiary)";
}

export function formatPartsList(parts: PartRecord[]): string {
  return parts.map((p) => `${p.id} [${p.role}]`).join(" → ");
}
