export type ProjectFrameTheme = "default" | "soft" | "solid";

export interface ProjectFrameRecord {
  title?: string;
  frameTitle?: string;
  frameIcon?: string;
  frameColor?: string;
  frameTheme?: string;
}

export interface ProjectFrameConfig {
  title: string;
  icon: string;
  color: string;
  theme: ProjectFrameTheme;
}

const DEFAULT_FRAME = {
  color: "#64748b",
  icon: "lucide:monitor",
} as const;

function getFrameTitleWithFallback(project?: ProjectFrameRecord | null): string {
  return (project?.frameTitle ?? "").trim() || (project?.title ?? "").trim() || "Sistema";
}

/**
 * Normalizes an input color to the canonical #rrggbb format.
 * Returns undefined for invalid values.
 */
function normalizeHexColor(input?: string): string | undefined {
  const value = (input ?? "").trim();
  const withHash = value.startsWith("#") ? value : `#${value}`;
  if (/^#[0-9a-fA-F]{6}$/.test(withHash)) {
    return withHash.toLowerCase();
  }
  return undefined;
}

function isTheme(value?: string): value is ProjectFrameTheme {
  return value === "default" || value === "soft" || value === "solid";
}

export function resolveProjectFrame(project?: ProjectFrameRecord | null): ProjectFrameConfig {
  return {
    title: getFrameTitleWithFallback(project),
    icon: (project?.frameIcon ?? "").trim() || DEFAULT_FRAME.icon,
    color: normalizeHexColor(project?.frameColor) ?? DEFAULT_FRAME.color,
    theme: isTheme(project?.frameTheme) ? project.frameTheme : "default",
  };
}

export function hasProjectFrameCustomization(project?: ProjectFrameRecord | null): boolean {
  return Boolean(
    (project?.frameTitle ?? "").trim() ||
      (project?.frameIcon ?? "").trim() ||
      normalizeHexColor(project?.frameColor) ||
      (project?.frameTheme && project.frameTheme !== "default"),
  );
}

export function normalizeProjectFrameForStorage(frame: {
  title?: string;
  icon?: string;
  color?: string;
  theme?: string;
}): {
  frameTitle?: string;
  frameIcon?: string;
  frameColor?: string;
  frameTheme?: ProjectFrameTheme;
} {
  const theme = isTheme(frame.theme) ? frame.theme : "default";
  return {
    frameTitle: (frame.title ?? "").trim() || undefined,
    frameIcon: (frame.icon ?? "").trim() || undefined,
    frameColor: normalizeHexColor(frame.color),
    frameTheme: theme === "default" ? undefined : theme,
  };
}
