export function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffSeconds) < 60) {
    return rtf.format(diffSeconds, "second");
  }
  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }
  return rtf.format(diffDays, "day");
}

export function formatShortDate(date?: Date | null) {
  if (!date) {
    return "—";
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function formatTimestampLabel(date: Date) {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });

  if (dayDiff === 0) {
    return `Today · ${time}`;
  }
  if (dayDiff === 1) {
    return `Yesterday · ${time}`;
  }
  if (dayDiff < 7) {
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    return `${weekday} · ${time}`;
  }

  const shortDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
  return `${shortDate} · ${time}`;
}

export function formatStatusLabel(status: string) {
  switch (status) {
    case "IN_REVIEW":
      return "In Review";
    case "DRAFT":
      return "Draft";
    case "FINAL":
      return "Final";
    case "SENT":
      return "Sent";
    default:
      return status;
  }
}

export function formatRoleLabel(role: string) {
  switch (role) {
    case "OWNER":
      return "Owner";
    case "ADMIN":
      return "Admin";
    case "MEMBER":
      return "Member";
    case "VIEWER":
      return "Viewer";
    case "CLIENT":
      return "Client";
    default:
      return role;
  }
}

export function formatActivityTypeLabel(eventType: string) {
  switch (eventType) {
    case "PROJECT_CREATED":
      return "Project created";
    case "MEMBER_ADDED":
      return "Member added";
    case "MEMBER_REMOVED":
      return "Member removed";
    case "DOC_UPLOADED":
      return "Document uploaded";
    case "DOC_VERSION_UPLOADED":
      return "New version uploaded";
    case "DOC_METADATA_CHANGED":
      return "Metadata updated";
    case "STALE_CHECK_RUN":
      return "Stale check run";
    case "STALE_MARKED":
      return "Document marked stale";
    case "NOTIFICATIONS_MARKED_READ":
      return "Notifications marked read";
    default:
      return eventType
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
  }
}
