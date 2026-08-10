import { useEffect, useRef, useState, type ReactNode } from "react";

function Group({
  title,
  tokens,
  children,
}: {
  title: string;
  tokens: string;
  children: ReactNode;
}) {
  return (
    /* Lowest surface, so components demoing their own container tones stay
       visible against it. */
    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
      <div className="mb-5">
        <h3 className="font-semibold text-on-surface">{title}</h3>
        <p className="mt-1 font-mono text-xs text-on-surface-variant">{tokens}</p>
      </div>
      {children}
    </div>
  );
}

function Buttons() {
  return (
    <Group
      title="Buttons"
      tokens="primary · on-primary · secondary-container · surface-container-low · outline"
    >
      <div className="flex flex-wrap items-center gap-3">
        <button className="interactive-primary h-10 rounded-full px-6 text-sm font-medium">
          Filled
        </button>

        <button className="interactive-secondary-container h-10 rounded-full px-6 text-sm font-medium">
          Tonal
        </button>

        <button className="interactive-surface-container-low h-10 rounded-full px-6 text-sm font-medium shadow-md">
          Elevated
        </button>

        {/* Outlined and text buttons stay transparent, so the state layer is
            the on-color at Material's 8% rather than an interactive-* surface. */}
        <button className="h-10 rounded-full border border-outline px-6 text-sm font-medium text-primary transition-colors hover:bg-primary/8 focus-visible:bg-primary/12 active:bg-primary/12">
          Outlined
        </button>

        <button className="h-10 rounded-full px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/8 focus-visible:bg-primary/12 active:bg-primary/12">
          Text
        </button>

        {/* Material's disabled recipe: 38% content, 12% container. */}
        <button
          disabled
          className="h-10 cursor-not-allowed rounded-full bg-on-surface/12 px-6 text-sm font-medium text-on-surface/38"
        >
          Disabled
        </button>

        {/* FAB is the one baseline component with an official tertiary variant
            (surface | primary | secondary | tertiary), so both are shown. */}
        <button
          aria-label="Compose"
          className="interactive-primary-container grid size-14 place-items-center rounded-2xl shadow-lg"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <button
          aria-label="Add note"
          className="interactive-tertiary-container grid size-14 place-items-center rounded-2xl shadow-lg"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </Group>
  );
}

function Cards() {
  const variants = [
    {
      name: "Elevated",
      className: "bg-surface-container-low shadow-md",
      body: "Lifted off the background with a shadow.",
    },
    {
      name: "Filled",
      className: "bg-surface-container-highest",
      body: "Separated by a higher surface tone instead.",
    },
    {
      name: "Outlined",
      className: "bg-surface border border-outline-variant",
      body: "Bounded by an outline, flat against the page.",
    },
  ];

  return (
    <Group
      title="Cards"
      tokens="surface-container-low · surface-container-highest · surface · outline-variant"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {variants.map((v) => (
          <article key={v.name} className={`overflow-hidden rounded-xl ${v.className}`}>
            <div className="h-20 bg-primary-container" />
            <div className="p-4">
              <h4 className="font-medium text-on-surface">{v.name}</h4>
              <p className="mt-1 text-sm text-on-surface-variant">{v.body}</p>
              <button className="mt-3 h-9 rounded-full px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/8">
                Action
              </button>
            </div>
          </article>
        ))}
      </div>
    </Group>
  );
}

function Chips() {
  const [selected, setSelected] = useState<string[]>(["Tonal spot"]);
  const options = ["Tonal spot", "Vibrant", "Expressive", "Monochrome"];

  const toggle = (name: string) =>
    setSelected((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]));

  return (
    <Group title="Chips" tokens="secondary-container · on-secondary-container · outline">
      <div className="flex flex-wrap gap-2">
        {options.map((name) => {
          const on = selected.includes(name);
          return (
            <button
              key={name}
              role="checkbox"
              aria-checked={on}
              onClick={() => toggle(name)}
              className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm transition-colors ${
                on
                  ? "bg-secondary-container text-on-secondary-container"
                  : "border border-outline text-on-surface-variant hover:bg-on-surface/8"
              }`}
            >
              {on ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
              {name}
            </button>
          );
        })}
      </div>
    </Group>
  );
}

function TextFields() {
  return (
    <Group
      title="Text fields"
      tokens="surface-container-highest · primary · on-surface-variant · error"
    >
      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs text-on-surface-variant">Filled</span>
          <input
            defaultValue="#506546"
            spellCheck={false}
            className="w-full rounded-t-md border-b-2 border-on-surface-variant bg-surface-container-highest px-3 py-2.5 font-mono text-sm text-on-surface outline-none transition-colors focus:border-primary"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs text-on-surface-variant">Outlined</span>
          <input
            placeholder="Source color"
            className="w-full rounded-md border border-outline bg-transparent px-3 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs text-error">Error</span>
          <input
            defaultValue="not-a-color"
            aria-invalid
            className="w-full rounded-md border border-error bg-transparent px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-error"
          />
          <span className="mt-1 block text-xs text-error">Must be a hex color.</span>
        </label>
      </div>
    </Group>
  );
}

function Switch({ label }: { label: string }) {
  const [on, setOn] = useState(true);
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => setOn((v) => !v)}
      className={`relative h-8 w-13 rounded-full border-2 transition-colors ${
        on ? "border-primary bg-primary" : "border-outline bg-surface-container-highest"
      }`}
    >
      <span
        className={`absolute top-1/2 block -translate-y-1/2 rounded-full transition-all duration-200 motion-reduce:transition-none ${
          on ? "left-[calc(100%-1.625rem)] size-6 bg-on-primary" : "left-1 size-4 bg-outline"
        }`}
      />
    </button>
  );
}

function Selection() {
  const [checked, setChecked] = useState(true);
  const [choice, setChoice] = useState("vibrant");
  const [value, setValue] = useState(60);

  return (
    <Group title="Selection controls" tokens="primary · on-primary · outline · surface-container-highest">
      <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
        <div className="flex items-center gap-3">
          <Switch label="Dynamic color" />
          <span className="text-sm text-on-surface">Dynamic color</span>
        </div>

        <label className="flex cursor-pointer items-center gap-3">
          <span
            className={`grid size-5 place-items-center rounded-[0.25rem] border-2 transition-colors ${
              checked ? "border-primary bg-primary" : "border-on-surface-variant"
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="sr-only"
            />
            {checked ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M5 13l4 4L19 7"
                  stroke="var(--mw-on-primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </span>
          <span className="text-sm text-on-surface">Harmonize</span>
        </label>

        <div className="flex items-center gap-4">
          {["vibrant", "neutral"].map((name) => (
            <label key={name} className="flex cursor-pointer items-center gap-2">
              <span
                className={`grid size-5 place-items-center rounded-full border-2 transition-colors ${
                  choice === name ? "border-primary" : "border-on-surface-variant"
                }`}
              >
                <input
                  type="radio"
                  name="scheme-demo"
                  checked={choice === name}
                  onChange={() => setChoice(name)}
                  className="sr-only"
                />
                {choice === name ? <span className="size-2.5 rounded-full bg-primary" /> : null}
              </span>
              <span className="text-sm capitalize text-on-surface">{name}</span>
            </label>
          ))}
        </div>

        <label className="flex min-w-52 flex-1 items-center gap-3">
          <span className="text-sm text-on-surface-variant">Contrast</span>
          <input
            type="range"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="h-1 flex-1 accent-primary"
          />
        </label>
      </div>
    </Group>
  );
}

function Tabs() {
  const tabs = ["Light", "Dark", "Contrast"];
  const [active, setActive] = useState(0);

  return (
    <Group title="Tabs" tokens="primary · on-surface-variant · outline-variant">
      <div className="border-b border-outline-variant">
        <div className="flex gap-1">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActive(i)}
              aria-selected={active === i}
              role="tab"
              className={`relative px-5 py-3 text-sm font-medium transition-colors ${
                active === i
                  ? "text-primary"
                  : "text-on-surface-variant hover:bg-on-surface/8"
              }`}
            >
              {tab}
              {active === i ? (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-t-full bg-primary" />
              ) : null}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm text-on-surface-variant">
        Showing the <span className="text-on-surface">{tabs[active]}</span> palette.
      </p>
    </Group>
  );
}

function Overlays() {
  const [dialog, setDialog] = useState(false);
  const [snack, setSnack] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!snack) return;
    timer.current = window.setTimeout(() => setSnack(false), 3200);
    return () => window.clearTimeout(timer.current);
  }, [snack]);

  useEffect(() => {
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDialog(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dialog]);

  return (
    <Group
      title="Dialog and snackbar"
      tokens="surface-container-high · inverse-surface · inverse-on-surface · inverse-primary"
    >
      <p className="mb-4 text-sm text-on-surface-variant">
        The snackbar is where the inverse roles earn their place. It deliberately contrasts
        against the page so it reads as temporary.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setDialog(true)}
          className="interactive-secondary-container h-10 rounded-full px-6 text-sm font-medium"
        >
          Open dialog
        </button>
        <button
          onClick={() => setSnack(true)}
          className="h-10 rounded-full border border-outline px-6 text-sm font-medium text-primary transition-colors hover:bg-primary/8"
        >
          Show snackbar
        </button>
      </div>

      {dialog ? (
        <div className="fixed inset-0 z-40 grid place-items-center p-6">
          <div className="absolute inset-0 bg-scrim/50" onClick={() => setDialog(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Reset theme"
            className="relative w-full max-w-sm rounded-[1.75rem] bg-surface-container-high p-6 shadow-2xl"
          >
            <h4 className="text-lg font-medium text-on-surface">Reset theme?</h4>
            <p className="mt-2 text-sm text-on-surface-variant">
              This restores the source color, scheme and contrast to their defaults.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDialog(false)}
                className="h-10 rounded-full px-5 text-sm font-medium text-primary transition-colors hover:bg-primary/8"
              >
                Cancel
              </button>
              <button
                onClick={() => setDialog(false)}
                className="interactive-primary h-10 rounded-full px-5 text-sm font-medium"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {snack ? (
        <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-6">
          <div className="flex w-full max-w-md items-center gap-4 rounded-lg bg-inverse-surface px-4 py-3 shadow-xl">
            <span className="flex-1 text-sm text-inverse-on-surface">Theme updated.</span>
            <button
              onClick={() => setSnack(false)}
              className="text-sm font-medium text-inverse-primary"
            >
              Undo
            </button>
          </div>
        </div>
      ) : null}
    </Group>
  );
}

function ListAndProgress() {
  return (
    <Group
      title="List, badge and progress"
      tokens="surface-container · error · on-error · primary · surface-container-highest"
    >
      <ul className="divide-y divide-outline-variant overflow-hidden rounded-xl bg-surface-container">
        {[
          ["Primary", "The main accent", "3", "bg-primary-container text-on-primary-container"],
          [
            "Secondary",
            "Less prominent components",
            null,
            "bg-secondary-container text-on-secondary-container",
          ],
          [
            "Tertiary",
            "Contrasting accents",
            "12",
            "bg-tertiary-container text-on-tertiary-container",
          ],
        ].map(([name, desc, badge, avatar]) => (
          <li
            key={name}
            className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-on-surface/8"
          >
            <span
              className={`grid size-10 place-items-center rounded-full text-sm font-medium ${avatar}`}
            >
              {name!.charAt(0)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-on-surface">{name}</span>
              <span className="block truncate text-xs text-on-surface-variant">{desc}</span>
            </span>
            {badge ? (
              <span className="grid min-w-5 place-items-center rounded-full bg-error px-1.5 text-xs font-medium text-on-error">
                {badge}
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="mt-5 space-y-3">
        <div className="h-1 overflow-hidden rounded-full bg-surface-container-highest">
          <div className="h-full w-2/3 rounded-full bg-primary" />
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-surface-container-highest">
          <div className="h-full w-1/3 rounded-full bg-tertiary" />
        </div>
      </div>
    </Group>
  );
}

/** Tertiary has no baseline component of its own, so it gets a group showing
 *  the uses the spec names. */
function Tertiary() {
  const people = [
    { initials: "AL", name: "Alex", tone: "primary" },
    { initials: "BR", name: "Brooke", tone: "tertiary" },
    { initials: "CA", name: "Casey", tone: "secondary" },
    { initials: "DR", name: "Drew", tone: "tertiary" },
  ];

  const tone = (t: string) =>
    t === "primary"
      ? "bg-primary-container text-on-primary-container"
      : t === "secondary"
        ? "bg-secondary-container text-on-secondary-container"
        : "bg-tertiary-container text-on-tertiary-container";

  return (
    <Group
      title="Tertiary accents"
      tokens="tertiary · on-tertiary · tertiary-container · on-tertiary-container"
    >
      <p className="mb-5 text-sm text-on-surface-variant">
        No baseline component uses tertiary by default. It is the slot Material leaves for your
        product. Its palette is the source hue rotated 60°, so it contrasts with primary while
        staying in the same theme.
      </p>

      <div className="space-y-6">
        <div>
          <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-on-surface-variant">
            Avatars
          </h4>
          <div className="flex flex-wrap items-center gap-3">
            {people.map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <span
                  className={`grid size-10 place-items-center rounded-full text-sm font-medium ${tone(p.tone)}`}
                >
                  {p.initials}
                </span>
                <span className="text-sm text-on-surface-variant">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-on-surface-variant">
            Complementary card
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-primary-container p-4 text-on-primary-container">
              <p className="text-sm font-medium">Primary container</p>
              <p className="mt-1 text-sm opacity-80">Carries the main emphasis.</p>
            </div>
            <div className="rounded-xl bg-tertiary-container p-4 text-on-tertiary-container">
              <p className="text-sm font-medium">Tertiary container</p>
              <p className="mt-1 text-sm opacity-80">
                Stands apart without competing for the same job.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-on-surface-variant">
            Status and highlights
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-tertiary px-3 py-1 text-xs font-medium text-on-tertiary">
              New
            </span>
            <span className="rounded-full bg-tertiary-container px-3 py-1 text-xs font-medium text-on-tertiary-container">
              Beta
            </span>
            <span className="rounded-full bg-error px-3 py-1 text-xs font-medium text-on-error">
              Deprecated
            </span>
            <span className="text-xs text-on-surface-variant">
              Tertiary draws attention; error means something is wrong.
            </span>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-on-surface-variant">
            The three accents together
          </h4>
          <div className="flex overflow-hidden rounded-full">
            <div className="h-3 w-1/2 bg-primary" />
            <div className="h-3 w-1/4 bg-secondary" />
            <div className="h-3 w-1/4 bg-tertiary" />
          </div>
          {/* Class names are written out in full: Tailwind scans source text,
              so a constructed `bg-${name}` would not be generated. */}
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-on-surface-variant">
            {[
              ["primary", "bg-primary"],
              ["secondary", "bg-secondary"],
              ["tertiary", "bg-tertiary"],
            ].map(([name, dot]) => (
              <span key={name} className="flex items-center gap-1.5">
                <span className={`size-2.5 rounded-full ${dot}`} />
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Group>
  );
}

export function Gallery() {
  return (
    <div className="space-y-4">
      <Buttons />
      <Cards />
      <Tertiary />
      <Chips />
      <TextFields />
      <Selection />
      <Tabs />
      <Overlays />
      <ListAndProgress />
    </div>
  );
}
