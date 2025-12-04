# Lernperiode-12

07.11.2025 bis 19.12.2025

---

## Grob-Planung

### Technologien
Ich habe meine Firma nach den Technologien gefragt, die ich in meinem Praktikumsjahr benutzen werde, und dabei haben sie mir diese Liste gegeben:

**Webentwicklung**
- TypeScript
- Next.js
- Tailwind CSS

**Backend-Entwicklung**
- Go
- TypeScript

**Datenbanken**
- PocketBase
- SQLite

**Desktop-Anwendungen**
- Go
- Wails

Für mein Projekt plane ich, TypeScript, Next.js und Tailwind CSS für das Frontend zu erlernen. Im Backend möchte ich ebenfalls TypeScript einsetzen, um bei einer Sprache zu bleiben. Als Datenbank werde ich PocketBase verwenden, da modern ist und auf SQLite aufbaut, das wir schon mal in der Schule angeschaut hatten, zudem ist es angeblich gut geeignet für kleine bis mittelgrosse Projekte. Zudem bietet PocketBase ein integriertes API und Admin-Interface, wodurch ich mich besser auf das Zusammenspiel von Frontend und Backend konzentrieren kann, anstatt auf komplexe Serverkonfigurationen. (89 Wörter)

---

### Grobe Beschreibung des Projektes
Ich möchte eine Mini-Blog-Plattform entwickeln, auf der Benutzer Beiträge erstellen, lesen, bearbeiten und löschen können. Jeder Beitrag soll einen Titel, Text und ein Erstellungsdatum enthalten. Das Frontend werde ich mit Next.js, TypeScript und Tailwind CSS umsetzen, und für die Speicherung von Daten werde ich PocketBase verwenden. Mein Ziel ist es, eine moderne Web-App zu entwickeln und dabei den Umgang mit diesen Technologien zu üben. (64 Wörter)

---

### User Stories
1. Als Benutzer möchte ich Beiträge erstellen können, damit ich meine Ideen auf der Plattform teilen kann.
2. Als Benutzer möchte ich alle veröffentliche Beitäge auf einer "Home-Page" sehen, damit ich einen schnellen Überblick über alle Einträge habe.
3. Als Benutzer möchte ich einzelne Beiträge im Detail anschauen können, damit ich Fehler korrigieren oder Inhalte anpassen kann.
4. Als Benutzer möchte ich eigene Beiträge bearbeiten und aktualisieren können, damit ich Fehler korrigieren oder Inhalte anpassen kann.
5. Als Benutzer möchte ich Beiträge löschen können, damit ich nicht mehr relevante Inhalte entfernen kann.
6. Als Benutzer möchte ich mich anmelden und authentifizieren können, damit nur registrierte Nutzer eigene Beiträge erstellen oder bearbeiten können.
7. Als Besucher möchte ich ein modernes, responsives Design haben, damit die Plattform auf allen Geräte gut funktioniert.

## 07.11.2025
- [ ] Titelseite für Titel und Text mit Tailwind CSS gestaltetn
- [ ] Erste Eignabelogik in TypeScript umsetzten
- [ ] Verbindung zu einer PocketBase Datenbank herstellen
- [ ] Fehler- und Erfolgmeldungen nach Erstellen eines Beitrags anzeigen lassen


Heute habe ich mich zuerst ein wenig mit TypeScript beschäftigt. Dazu habe ich die Dokumentation gelesen: https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html. Sie hat mir geholfen, die ersten Schritte zu machen, und ich habe anschließend in einem Testprojekt etwas herumgespielt. Danach habe ich versucht, meine Datenbank zu starten, um anschließend das Projekt zu starten. Dabei habe ich jedoch Probleme: Auf der Webseite steht, dass ich eine URL öffnen können soll, aber das funktioniert bei mir nicht. Ich muss noch herausfinden, wie ich das reparieren kann.


## 14.11.2025
- [X] Titelseite für Titel und Text mit Tailwind CSS gestaltetn
- [ ] Erste Eignabelogik in TypeScript umsetzten
- [ ] Verbindung zu einer PocketBase Datenbank herstellen
- [ ] Fehler- und Erfolgmeldungen nach Erstellen eines Beitrags anzeigen lassen

Heute habe ich mein Projekt erstellt, bedeutet die ersten Dateien erstellt, ich habe die Titelseite erstellt. Doch davor hatte ich zuerst eine Datenbank mithilfe Pocetbase erstellt. Dies war auch ziemlich Zeitaufwendig, da ich ein Problem mit der API Rule hatte, und zwar mit der Create Rule, schnlussendlich hat nichts funktioniert und ich habe es auf der Standart Einstellunge gelassen. (59 Wörter)

## 21.11.2025
 - [X] Als Benutzer möchte ich auf der Blogging-Platform registieren können, damit ich einen Account habe mit dem ich meine Sachen posten kann.
 - [X] Als Bentutzer möchte ich immer Informiert werden wenn ich einen Fehler bei etwas gemacht habe, damit ich das Rückgägnig machen kann, sodass es am schluss funktioniert.
 - [X] Als Benutzer möchte ich mich auf der Platform anmelden können, damit ich eine Übersicht habe was ich gelikt, gepostet oder angesehen habe.
 - [X] Als Benjtzer möchte ich eine Datenban im Hintergrund haben, der meinen Account nach dem registrieren speichert, damit ich mich später wieder anmelden kann.

Heute habe ich vor dem Unterricht die Login bzw Regristrierung vorgenommen, was soweit funktioniert, es hat noch ein paar macken, denn es zeigt keine Fehlermeldung an, dass muss ich noch ändern, doch das sollte hoffentlich schnell gehen. Nach dem Call hatte ich ein paar Probleme, doch ich habe herausgefunden, dass ich ausvershen meine Datenbank Instanz gestoppt hatte, ich habe sie also neu angemacht und danach ging es wieder. Die versschiedenen Accounts werden ebenfalls in dieser Datenbank gespeichert. Als nächstes möchte ich Beiträge erstellen können. (84 Wörter)

## 28.11.2025
- [X] Als Benutzer möchte ich Beiträge erstellen können, damit ich meine Ideen mit anderen Leuten austauschen kann.
- [X] Als Benutzer möchte ich Beiträge von anderen Benutzern sehen können, damit ich deren Ideen sehen kann und mich mit ihnen darüber Unterhalten kann.
- [X] Als Benutzer möchte ich Beiträge als "Gefällt mir" makieren, damit die Leute wissen, dass mir die Idee gefällt.
- [X] Als Benutzer möchte ich einen Einstellungs-Tab haben, wo ich meine "Gelikten" Beiträge sehen kann, oder meinen Namen ändern kann.
