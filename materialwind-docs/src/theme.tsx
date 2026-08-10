import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { updateTheme, type SchemeName } from "materialwind-css/runtime";

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
  primary: "#506546",
  scheme: "tonalSpot" as SchemeName,
  contrast: 0,
  brand: "#ff0000",
};

interface ThemeState {
  primary: string;
  /** Empty string means "derive it from primary". */
  secondary: string;
  tertiary: string;
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
  const [primary, setPrimary] = useState(BUILD_DEFAULTS.primary);
  const [secondary, setSecondary] = useState("");
  const [tertiary, setTertiary] = useState("");
  const [scheme, setScheme] = useState<SchemeName>(BUILD_DEFAULTS.scheme);
  const [contrast, setContrast] = useState(BUILD_DEFAULTS.contrast);
  const [brand, setBrand] = useState(BUILD_DEFAULTS.brand);
  const [dark, setDark] = useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false,
  );

  // Omitted core roles are left out entirely so they stay derived from primary.
  useEffect(() => {
    updateTheme({
      primary,
      ...(secondary ? { secondary } : {}),
      ...(tertiary ? { tertiary } : {}),
      scheme,
      contrast,
      colors: { brand },
      darkMode: "class",
    });
  }, [primary, secondary, tertiary, scheme, contrast, brand]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const set = useCallback<ThemeState["set"]>((patch) => {
    if (patch.primary !== undefined) setPrimary(patch.primary);
    if (patch.secondary !== undefined) setSecondary(patch.secondary);
    if (patch.tertiary !== undefined) setTertiary(patch.tertiary);
    if (patch.scheme !== undefined) setScheme(patch.scheme);
    if (patch.contrast !== undefined) setContrast(patch.contrast);
    if (patch.brand !== undefined) setBrand(patch.brand);
    if (patch.dark !== undefined) setDark(patch.dark);
  }, []);

  const reset = useCallback(() => {
    setPrimary(BUILD_DEFAULTS.primary);
    setSecondary("");
    setTertiary("");
    setScheme(BUILD_DEFAULTS.scheme);
    setContrast(BUILD_DEFAULTS.contrast);
    setBrand(BUILD_DEFAULTS.brand);
  }, []);

  const value = useMemo<ThemeState>(
    () => ({ primary, secondary, tertiary, scheme, contrast, brand, dark, set, reset }),
    [primary, secondary, tertiary, scheme, contrast, brand, dark, set, reset],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
