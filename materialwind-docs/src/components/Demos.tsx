import { useState } from "react";

import { Code, InlineCode, Note } from "./ui.tsx";

const INTERACTIVE = [
  "interactive-primary",
  "interactive-secondary-container",
  "interactive-tertiary-container",
  "interactive-error",
  "interactive-brand",
  "interactive-surface-container-high",
];

export function StatesDemo() {
  const [dragging, setDragging] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-6">
        <p className="text-sm text-on-surface-variant">
          Hover, focus with the keyboard, or press and hold. The on-color is mixed into the
          container at 8% / 12% / 12%.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {INTERACTIVE.map((cls) => (
            <button key={cls} className={`${cls} rounded-full px-5 py-2.5 text-sm font-medium`}>
              {cls.replace("interactive-", "")}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-6">
        <h4 className="font-medium text-on-surface">Drag state</h4>
        <p className="mt-1 text-sm text-on-surface-variant">
          Swap in <InlineCode>dragged-*</InlineCode> while an element is being dragged. It pins
          the state layer at 16%.
        </p>
        <div className="mt-5">
          <button
            onPointerDown={() => setDragging("a")}
            onPointerUp={() => setDragging(null)}
            onPointerLeave={() => setDragging(null)}
            className={`${
              dragging === "a" ? "dragged-primary" : "interactive-primary"
            } rounded-xl px-5 py-3 text-sm font-medium select-none`}
          >
            {dragging === "a" ? "dragged-primary" : "Press and hold me"}
          </button>
        </div>
      </div>

      <Code lang="html">{`<button class="interactive-primary rounded-full px-5 py-2.5">
  Press me
</button>`}</Code>
    </div>
  );
}

export function SurfacesDemo() {
  const surfaces = [
    "surface-container-lowest",
    "surface-container-low",
    "surface-container",
    "surface-container-high",
    "surface-container-highest",
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {surfaces.map((cls) => (
          <div key={cls} className={`${cls} rounded-xl border border-outline-variant p-4`}>
            <div className="font-mono text-xs">{cls}</div>
            <p className="mt-2 text-xs opacity-80">Text uses the paired on-color automatically.</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {["surface-primary", "surface-primary-container", "surface-variant", "surface-inverse"].map(
          (cls) => (
            <div key={cls} className={`${cls} rounded-xl p-4`}>
              <div className="font-mono text-xs">{cls}</div>
            </div>
          ),
        )}
      </div>

      <Code lang="html">{`<div class="surface-container-high">Card</div>
<div class="surface-primary">Filled</div>

<!-- the literal token name works too -->
<div class="surface-surface-container-high">Card</div>`}</Code>
    </div>
  );
}

export function ArbitraryDemo() {
  return (
    <div className="space-y-6">
      <Note tone="good">
        A plugin that registers a second generator under a core namespace like{" "}
        <InlineCode>bg</InlineCode> makes every arbitrary <InlineCode>bg-[…]</InlineCode> value
        ambiguous, and Tailwind emits nothing at all. materialwind never touches a core utility
        namespace, so arbitrary values keep working.
      </Note>

      <div className="flex flex-wrap gap-3">
        <div className="flex h-24 w-32 items-end rounded-xl bg-[#000000] p-3">
          <span className="font-mono text-xs text-white">bg-[#000000]</span>
        </div>
        <div className="flex h-24 w-32 items-end rounded-xl bg-[#ff5722] p-3">
          <span className="font-mono text-xs text-white">bg-[#ff5722]</span>
        </div>
        <div className="flex h-24 w-32 items-end rounded-xl bg-[oklch(0.7_0.2_150)] p-3">
          {/* Split so Tailwind's scanner doesn't treat the label as a real class. */}
          <span className="font-mono text-xs text-black">{"bg-[oklch(...)"}]</span>
        </div>
        <div className="flex h-24 w-32 items-end rounded-xl bg-primary/50 p-3">
          <span className="font-mono text-xs text-on-surface">bg-primary/50</span>
        </div>
        <div className="flex h-24 w-32 items-end rounded-xl bg-blue-500 p-3">
          <span className="font-mono text-xs text-white">bg-blue-500</span>
        </div>
      </div>

      <p className="text-sm text-on-surface-variant">
        Tailwind’s own palette survives too. Tokens are added through{" "}
        <InlineCode>theme.extend</InlineCode>, so <InlineCode>bg-blue-500</InlineCode> still works
        alongside <InlineCode>bg-primary</InlineCode>.
      </p>
    </div>
  );
}
