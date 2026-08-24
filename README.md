# My Habits

App personale per l'organizzazione giornaliera: agenda oraria, abitudini e andamento nel tempo.
**100% offline** — nessun backend, nessun login, nessuna chiamata di rete. Tutti i dati restano sul dispositivo, in un database SQLite locale.

> Progetto per uso personale, non pubblicato su alcuno store. Vedi [Versioni](#versioni) per lo stato attuale.

## Funzionalità

- **Oggi** — agenda della giornata: impegni disposti per fascia oraria (00:00–23:00, con scroll automatico all'ora corrente), più una sezione "senza orario" per quelli senza un orario preciso. Ogni impegno può essere legato a un giorno specifico oppure **ricorrente** su giorni della settimana scelti (es. "ogni lunedì e sabato"). In fondo, un selettore rapido per umore e voto generale della giornata.
- **Abitudini** — checklist da spuntare per il giorno selezionato (con navigazione ‹ giorno ›), un'unica lista senza duplicazioni. Aggiunta rapida con il pulsante flottante; tieni premuta un'abitudine per modificarla, riordinarla o eliminarla. Ogni abitudine ha nome, descrizione, emoji, colore e frequenza (ogni giorno oppure giorni specifici della settimana).
- **Andamento** — grafico mensile delle abitudini completate per giorno, streak corrente e migliore, percentuale di completamento del mese. Heatmap mensili per l'**umore** (scala di colore dal rosso al verde) e per il **completamento delle abitudini** (intensità proporzionale alla percentuale, con uno stato speciale quando completi tutto in un giorno). I **momenti memorabili** del mese sono elencati qui; toccando un giorno in una heatmap si apre il dettaglio per rivedere o correggere umore, voto e momenti di quella data.

## Stack tecnico

- [Expo](https://expo.dev) (managed workflow) + TypeScript
- [expo-router](https://docs.expo.dev/router/introduction/) per la navigazione a tab
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) per la persistenza locale, con migrazioni idempotenti
- [zustand](https://github.com/pmndrs/zustand) per lo stato globale
- [react-native-gifted-charts](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts) per il grafico di Andamento
- [react-native-svg](https://github.com/software-mansion/react-native-svg) per le sfumature reali dell'interfaccia (bottoni, barre di progresso)
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
├── _layout.tsx              # root layout, init DB/store
└── (tabs)/
    ├── _layout.tsx          # tab bar
    ├── index.tsx            # tab "Oggi" (agenda oraria)
    ├── habits.tsx           # tab "Abitudini" (checklist)
    └── andamento.tsx        # tab "Andamento" (grafici, heatmap, momenti)
src/
├── theme.ts                    # palette chiara, spacing, radius, ombre
├── components/
│   ├── ui.tsx                   # Card, Button, IconButton, SectionTitle, EmptyState
│   ├── Gradient.tsx              # sfumature reali via SVG, riusate da bottoni/barre
│   ├── HabitRow.tsx               # riga abitudine con checkbox colorata
│   ├── HabitFormModal.tsx          # crea/modifica abitudine
│   ├── TaskRow.tsx                  # riga impegno (agenda e liste)
│   ├── TaskFormModal.tsx             # crea/modifica impegno, orario e ricorrenza
│   ├── DayTimeline.tsx                # griglia oraria della tab "Oggi"
│   ├── DayRatingWidget.tsx             # selettore compatto umore/voto
│   ├── HeatmapGrid.tsx                  # griglia mensile riusabile per le heatmap
│   ├── DayDetailSheet.tsx                # dettaglio di un giorno (umore, voto, momenti)
│   └── MomentRow.tsx                      # bullet modificabile/eliminabile
├── db/
│   ├── client.ts              # apertura DB + migrazioni idempotenti
│   ├── types.ts                # tipi del dominio
│   ├── habits.ts                # CRUD + riordino abitudini
│   ├── logs.ts                   # toggle, conteggi giornalieri abitudini
│   ├── tasks.ts                   # CRUD impegni, occorrenze per giorno/ricorrenza
│   ├── moments.ts                  # CRUD momenti
│   └── dayRatings.ts                # umore e voto per data
├── lib/
│   ├── date.ts               # helper date-fns (chiavi YYYY-MM-DD)
│   └── stats.ts               # streak corrente / migliore
└── store/
    └── useAppStore.ts          # stato globale zustand (abitudini, impegni del giorno, umore/voto di oggi)
```

## Modello dati

- `habits`: id, name, description, emoji, color, frequency_type (`daily` | `weekly`), frequency_days (es. `"1,3,5"`), sort_order, is_active, created_at
- `habit_logs`: id, habit_id, date (`YYYY-MM-DD`), completed — vincolo `UNIQUE(habit_id, date)`
- `tasks`: id, text, time (`HH:mm` opzionale), date (giorno specifico; null se ricorrente), recurrence_days (es. `"1,6"`; vuoto se non ricorrente), completed, sort_order, created_at, completed_at
- `task_logs`: id, task_id, date, completed — completamento per singola occorrenza di un impegno ricorrente, vincolo `UNIQUE(task_id, date)`
- `moments`: id, date (`YYYY-MM-DD`), text, created_at
- `day_ratings`: date (chiave primaria), mood (1-5), score (voto generale 1-10), updated_at

Tutte le query stanno in `src/db/`: i componenti non contengono SQL.

## Versioni

Numerazione libera, pre-1.0: la versione 1.0 sarà il traguardo per valutare un'eventuale pubblicazione (privata) sul Play Store. Fino ad allora l'app resta solo per uso personale.

### 0.2.0 — agenda oraria e andamento
- **Abitudini**: unica checklist (prima duplicata anche in "Oggi"), con navigazione tra i giorni, aggiunta rapida e gestione con tocco prolungato
- **Oggi**: reinventata come agenda oraria; gli impegni ora appartengono a un giorno preciso oppure sono ricorrenti su giorni della settimana scelti, con completamento tracciato per singola occorrenza
- **Andamento** (ex Statistiche): nuove heatmap mensili per umore (colorata) e completamento abitudini (intensità + stato speciale a completamento del 100%), momenti memorabili integrati con dettaglio per giorno
- Selettore compatto per umore e voto generale della giornata
- Nuovo tema chiaro e colorato con sfumature reali, raggi più morbidi sui pulsanti
- Icona e nome app personalizzati ("My Habits")

### 0.1.0 — prima versione funzionante
- Tab Oggi / Abitudini / Statistiche
- Abitudini con frequenza giornaliera o settimanale
- Impegni persistenti, momenti memorabili
- Statistiche con grafico mensile e streak
- Persistenza 100% locale su SQLite, migrazioni idempotenti
