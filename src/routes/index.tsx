import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Diario Giornaliero — app Expo offline" },
      {
        name: "description",
        content:
          "Progetto Expo + TypeScript per un diario giornaliero offline: momenti, abitudini e statistiche, con build APK via EAS.",
      },
      { property: "og:title", content: "Diario Giornaliero — app Expo offline" },
      {
        property: "og:description",
        content:
          "Codice sorgente dell'app Android personale: bullet journal, abitudini e statistiche, 100% offline.",
      },
    ],
  }),
  component: Index,
});

const steps = [
  { cmd: "cd mobile && npm install", label: "Installa le dipendenze" },
  { cmd: "npx expo start", label: "Avvia in sviluppo" },
  { cmd: "npm i -g eas-cli && eas login", label: "Prepara EAS" },
  { cmd: "eas build -p android --profile preview", label: "Genera l'APK" },
];

function Index() {
  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Progetto mobile
        </p>
        <h1 className="mt-3 text-3xl font-bold text-foreground">Diario Giornaliero</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          App Android personale in Expo + TypeScript, 100% offline (SQLite locale, nessun
          backend). Il codice si trova nella cartella <code>mobile/</code> di questo
          repository: tab Oggi, Abitudini e Statistiche.
        </p>

        <ol className="mt-8 space-y-3">
          {steps.map((step, i) => (
            <li
              key={step.cmd}
              className="rounded-xl border border-border bg-card p-4 text-card-foreground"
            >
              <span className="text-xs font-medium text-muted-foreground">
                {i + 1}. {step.label}
              </span>
              <pre className="mt-2 overflow-x-auto text-sm">
                <code>{step.cmd}</code>
              </pre>
            </li>
          ))}
        </ol>

        <p className="mt-8 text-xs text-muted-foreground">
          Il profilo EAS <code>preview</code> è configurato con{" "}
          <code>android.buildType: "apk"</code>, così l'output è installabile direttamente sul
          telefono.
        </p>
      </div>
    </main>
  );
}
