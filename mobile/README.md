# Diario Giornaliero (Expo + TypeScript)

App Android personale per l'organizzazione giornaliera: bullet journal, abitudini e statistiche.
**100% offline**: nessun backend, nessun login, nessuna chiamata di rete. Tutti i dati stanno in
SQLite sul dispositivo.

## Stack

- Expo (managed) + TypeScript
- expo-router (navigazione a tab)
- expo-sqlite (persistenza locale)
- zustand (stato globale)
- react-native-gifted-charts + react-native-svg (grafici)
- expo-notifications (promemoria locali)
- date-fns (date, chiave interna sempre `YYYY-MM-DD` in orario locale)

## Setup

```bash
cd mobile
npm install
npx expo start
```

Apri con Expo Go oppure con un development build (`a` per Android).
Nota: i promemoria con `expo-notifications` richiedono un build reale (dev build o APK),
in Expo Go su Android le notifiche schedulate sono limitate.

## Generare l'APK con EAS

```bash
npm install -g eas-cli
eas login
eas build:configure      # solo la prima volta (crea/aggiorna il projectId)
eas build -p android --profile preview
```

Il profilo `preview` in `eas.json` ha `android.buildType: "apk"`, quindi al termine ottieni
un link per scaricare l'APK e installarlo direttamente sul Samsung
(abilita "Installa app sconosciute" per il browser/file manager).

## Struttura

```
mobile/
├── app.json
├── eas.json
├── package.json
├── tsconfig.json
├── babel.config.js
├── app/
│   ├── _layout.tsx              # root layout, init DB/store, tema di sistema
│   └── (tabs)/
│       ├── _layout.tsx          # tab bar
│       ├── index.tsx            # Tab "Oggi"
│       ├── habits.tsx           # Tab "Abitudini"
│       └── stats.tsx            # Tab "Statistiche"
└── src/
    ├── theme.ts                 # colori, spacing, radius, chiaro/scuro
    ├── components/
    │   ├── ui.tsx               # Card, Button, IconButton, SectionTitle, EmptyState
    │   ├── HabitRow.tsx         # riga abitudine con checkbox
    │   ├── MomentRow.tsx        # bullet modificabile/eliminabile
    │   └── HabitFormModal.tsx   # crea/modifica abitudine
    ├── db/
    │   ├── client.ts            # apertura DB + migrazioni idempotenti
    │   ├── types.ts             # tipi del dominio
    │   ├── habits.ts            # CRUD + riordino
    │   ├── logs.ts              # toggle, conteggi giornalieri
    │   └── moments.ts           # CRUD momenti
    ├── lib/
    │   ├── date.ts              # helper date-fns (chiavi YYYY-MM-DD)
    │   ├── stats.ts             # streak corrente / migliore
    │   └── notifications.ts     # permessi + ripianificazione ricorrenti
    └── store/
        └── useAppStore.ts       # stato globale zustand
```

## Modello dati

- `habits`: id, name, emoji, color, frequency_type (`daily` | `weekly`), frequency_days ("1,3,5"),
  reminder_time (nullable, `HH:mm`), sort_order, is_active, created_at
- `habit_logs`: id, habit_id, date (`YYYY-MM-DD`), completed — `UNIQUE(habit_id, date)`
- `moments`: id, date (`YYYY-MM-DD`), text, created_at

Tutte le query stanno in `src/db/`: i componenti non contengono SQL.

## Note

- Le notifiche ricorrenti (DAILY / WEEKLY) vengono cancellate e ripianificate all'avvio
  dell'app e a ogni modifica delle abitudini, così restano valide dopo un riavvio del telefono.
- Il tema segue l'impostazione di sistema (chiaro/scuro).
