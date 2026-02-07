export const ROLES = ["OWNER", "ADMIN", "MEMBER", "VIEWER", "CLIENT"] as const;
export type Role = (typeof ROLES)[number];

export const DOCUMENT_STATUSES = [
  "DRAFT",
  "IN_REVIEW",
  "FINAL",
  "SENT"
] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export function assertRole(role: string): Role {
  if (!ROLES.includes(role as Role)) {
    throw new Error(`Unknown role: ${role}`);
  }
  return role as Role;
}

export function isPrivilegedRole(role: string | null | undefined) {
  return role === "OWNER" || role === "ADMIN";
}

export function isDocumentStatus(status: string): status is DocumentStatus {
  return DOCUMENT_STATUSES.includes(status as DocumentStatus);
}
