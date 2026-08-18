# Daily Compass

Voglio che tu crei un'app mobile Android per l'organizzazione giornaliera personale, con Expo (React Native) + TypeScript. L'app è solo per me, deve funzionare 100% offline (nessun backend, nessun login, nessun account). L'obiettivo finale è ottenere un APK installabile sul mio Samsung tramite EAS Build.
Stack obbligatorio (non aggiungere dipendenze native instabili)

* Expo managed workflow + TypeScript
* expo-router per la navigazione a tab
* expo-sqlite per la persistenza locale (tutti i dati sul dispositivo)
* zustand per lo stato globale
* react-native-gifted-charts (+ react-native-svg) per i grafici
* expo-notifications per i promemoria locali schedulati
* date-fns per la gestione delle date (formato interno sempre YYYY-MM-DD)
* Styling con StyleSheet e un piccolo file theme.ts (colori, spacing). Supporta tema chiaro/scuro seguendo il sistema.

Struttura: 3 tab in basso
1. Tab "Oggi" (schermata principale)
Ispirata a un bullet journal, divisa in due sezioni verticali:

* Header: data del giorno corrente, con frecce per navigare al giorno precedente/successivo.
* Momenti memorabili: lista di voci testuali (bullet) relative a quel giorno. Posso aggiungere una nuova voce, modificarla ed eliminarla. Persistite per data.
* Abitudini di oggi: lista delle abitudini attive previste per quel giorno, ciascuna con una checkbox. Il toggle salva immediatamente su DB.
* Contatore: "X / Y completate oggi", ben visibile.

2. Tab "Abitudini"
Gestione delle abitudini:

* Lista con nome, emoji e colore.
* Aggiungi / modifica / elimina, con possibilità di riordinare.
* Per ogni abitudine: nome, emoji, colore, frequenza (ogni giorno oppure giorni specifici della settimana), promemoria opzionale (orario → schedula una notifica locale con expo-notifications; chiedi il permesso a runtime).

3. Tab "Statistiche"

* Grafico a linee: numero di abitudini completate per ogni giorno del mese corrente (come nello screenshot di riferimento). Usa react-native-gifted-charts.
* Selettore del mese (avanti/indietro).
* Streak corrente e miglior streak.
* % di completamento del mese.
* (Opzionale se semplice) vista a calendario/heatmap per singola abitudine.

Modello dati (SQLite)
Crea le tabelle con migrazioni semplici e idempotenti:

* habits: id, name, emoji, color, frequency_type ('daily' | 'weekly'), frequency_days (es. "1,3,5" per i giorni della settimana), reminder_time (nullable), sort_order, is_active, created_at.
* habit_logs: id, habit_id, date (YYYY-MM-DD), completed. Vincolo UNIQUE su (habit_id, date).
* moments: id, date (YYYY-MM-DD), text, created_at.

Incapsula tutto l'accesso al DB in un layer dedicato (db/ con funzioni tipizzate), non spargere query SQL nei componenti.
Requisiti tecnici

* Deve funzionare completamente in modalità aereo (nessuna chiamata di rete).
* Gestione date robusta con date-fns, sempre in locale, chiave YYYY-MM-DD.
* Le notifiche schedulate devono sopravvivere al riavvio del giorno (ripianifica le ricorrenti).
* Codice pulito, tipizzato, componenti riutilizzabili, niente any non necessari.
* Includi un eas.json con un profilo preview configurato per generare un APK (android.buildType: "apk"), così posso installarlo direttamente.

Cosa NON fare

* Niente backend, cloud, autenticazione, analytics o tracciamento.
* Niente dipendenze fuori dall'ecosistema Expo che complicano il build EAS.
* Niente over-engineering: v1 focalizzata sulle 3 tab sopra.

Consegna

1. Genera l'intera struttura del progetto Expo funzionante.
2. Mostra l'albero dei file.
3. Fornisci le istruzioni passo-passo per:
   * avviare in sviluppo (npx expo start),
   * generare l'APK con EAS (eas build -p android --profile preview).
4. Un breve README.md con setup e note.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/81afd7f7-9906-4038-9c3e-288c81e0e35a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
