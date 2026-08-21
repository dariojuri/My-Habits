# My Habits

App personale per l'organizzazione giornaliera: bullet journal, abitudini e statistiche.
**100% offline** — nessun backend, nessun login, nessuna chiamata di rete. Tutti i dati restano sul dispositivo, in un database SQLite locale.

## Funzionalità

- **Oggi** — momenti memorabili della giornata (bullet), impegni persistenti che restano visibili finché non vengono completati, e la checklist delle abitudini previste per il giorno selezionato.
- **Abitudini** — creazione e gestione con nome, descrizione, emoji, colore e frequenza (ogni giorno oppure giorni specifici della settimana); riordino manuale.
- **Statistiche** — andamento mensile delle abitudini completate per giorno, streak corrente e migliore, percentuale di completamento del mese, calendario per singola abitudine.

## Stack tecnico

- [Expo](https://expo.dev) (managed workflow) + TypeScript
- [expo-router](https://docs.expo.dev/router/introduction/) per la navigazione a tab
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) per la persistenza locale, con migrazioni idempotenti
- [zustand](https://github.com/pmndrs/zustand) per lo stato globale
- [react-native-gifted-charts](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts) per il grafico delle statistiche
- [date-fns](https://date-fns.org) per la gestione delle date (chiave interna sempre `YYYY-MM-DD`, locale `it`)

## Sviluppo

Serve Node.js. Per provare l'app sul telefono tramite [Expo Go](https://expo.dev/go), Mac e telefono devono trovarsi sulla stessa rete Wi-Fi (o usare il tunnel di Expo).

```bash
npm install
npx expo start
```

Scansiona il QR code con Expo Go, oppure premi `a` per aprire un emulatore Android connesso.

> **Nota sulla versione SDK**: Expo Go supporta solo l'ultima versione SDK pubblicata. Se la connessione fallisce con un errore di incompatibilità, verifica la SDK richiesta dalla tua Expo Go (schermata iniziale dell'app) e allinea il progetto con `npx expo install expo@<versione>` seguito da `npx expo install --fix`.

## Build dell'APK (uso quotidiano)

Per un uso continuativo senza dipendere dal server di sviluppo, si genera un APK installabile tramite [EAS Build](https://docs.expo.dev/build/introduction/) (build in cloud, nessun Android Studio richiesto in locale):

```bash
npx eas-cli login
npx eas-cli build -p android --profile preview
```

Al termine della build (10-20 minuti) viene fornito un link per scaricare l'APK direttamente sul telefono. La prima volta va abilitata l'opzione "Installa app da fonti sconosciute" per il browser o il gestore file.

Il profilo `preview` in [eas.json](eas.json) genera un `.apk` installabile direttamente; il profilo `production` genera un `.aab` per la pubblicazione su Play Store.

## Struttura del progetto

```
app/
├── _layout.tsx              # root layout, init DB/store, tema di sistema
└── (tabs)/
    ├── _layout.tsx          # tab bar
    ├── index.tsx            # tab "Oggi"
    ├── habits.tsx           # tab "Abitudini"
    └── stats.tsx            # tab "Statistiche"
src/
├── theme.ts                 # colori, spacing, radius, chiaro/scuro
├── components/
│   ├── ui.tsx                # Card, Button, IconButton, SectionTitle, EmptyState
│   ├── HabitRow.tsx           # riga abitudine con checkbox colorata
│   ├── MomentRow.tsx          # bullet modificabile/eliminabile
│   ├── TaskRow.tsx            # riga impegno persistente
│   └── HabitFormModal.tsx     # crea/modifica abitudine
├── db/
│   ├── client.ts              # apertura DB + migrazioni idempotenti
│   ├── types.ts                # tipi del dominio
│   ├── habits.ts                # CRUD + riordino abitudini
│   ├── logs.ts                   # toggle, conteggi giornalieri
│   ├── moments.ts                 # CRUD momenti
│   └── tasks.ts                    # CRUD impegni persistenti
├── lib/
│   ├── date.ts               # helper date-fns (chiavi YYYY-MM-DD)
│   └── stats.ts               # streak corrente / migliore
└── store/
    └── useAppStore.ts          # stato globale zustand
```

## Modello dati

- `habits`: id, name, description, emoji, color, frequency_type (`daily` | `weekly`), frequency_days (es. `"1,3,5"`), sort_order, is_active, created_at
- `habit_logs`: id, habit_id, date (`YYYY-MM-DD`), completed — vincolo `UNIQUE(habit_id, date)`
- `moments`: id, date (`YYYY-MM-DD`), text, created_at
- `tasks`: id, text, completed, sort_order, created_at, completed_at

Tutte le query stanno in `src/db/`: i componenti non contengono SQL.
