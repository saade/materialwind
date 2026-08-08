import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { updateTheme, type SchemeName } from "materialwind/runtime";

export const SCHEMES: SchemeName[] = [
  "content",
  "expressive",
  "fidelity",
  "fruitSalad",
  "monochrome",
  "neutral",
  "rainbow",
  "tonalSpot",
  "vibrant",
];

/** Mirrors the `@plugin` block in app.css. */
export const BUILD_DEFAULTS = {
  source: "#506546",
  scheme: "tonalSpot" as SchemeName,
  contrast: 0,
  brand: "#ff0000",
};

interface ThemeState {
  source: string;
  scheme: SchemeName;
  contrast: number;
  brand: string;
  dark: boolean;
  set: (patch: Partial<Omit<ThemeState, "set" | "reset">>) => void;
  reset: () => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

export function useTheme(): ThemeState {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside <ThemeProvider>");
  return value;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [source, setSource] = useState(BUILD_DEFAULTS.source);
  const [scheme, setScheme] = useState<SchemeName>(BUILD_DEFAULTS.scheme);
  const [contrast, setContrast] = useState(BUILD_DEFAULTS.contrast);
  const [brand, setBrand] = useState(BUILD_DEFAULTS.brand);
  const [dark, setDark] = useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false,
  );

  // Re-theme the page. This rewrites the same --mw-* custom properties the
  // plugin emitted at build time, so every utility on the page updates at once.
  useEffect(() => {
    updateTheme({
      source,
      scheme,
      contrast,
      colors: { brand },
      darkMode: "class",
    });
  }, [source, scheme, contrast, brand]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const set = useCallback<ThemeState["set"]>((patch) => {
    if (patch.source !== undefined) setSource(patch.source);
    if (patch.scheme !== undefined) setScheme(patch.scheme);
    if (patch.contrast !== undefined) setContrast(patch.contrast);
    if (patch.brand !== undefined) setBrand(patch.brand);
    if (patch.dark !== undefined) setDark(patch.dark);
  }, []);

  const reset = useCallback(() => {
    setSource(BUILD_DEFAULTS.source);
    setScheme(BUILD_DEFAULTS.scheme);
    setContrast(BUILD_DEFAULTS.contrast);
    setBrand(BUILD_DEFAULTS.brand);
  }, []);

  const value = useMemo<ThemeState>(
    () => ({ source, scheme, contrast, brand, dark, set, reset }),
    [source, scheme, contrast, brand, dark, set, reset],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
