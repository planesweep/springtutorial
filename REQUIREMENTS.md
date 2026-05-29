# Voraussetzungen (REQUIREMENTS)

Dieses Dokument listet alle Werkzeuge, Kenntnisse und optionalen Komponenten auf, die du
brauchst, um das `TUTORIAL.md` durchzuarbeiten. Bitte richte deine Umgebung vollständig ein,
**bevor** du mit Kapitel 1 beginnst. Jede Stunde, die du jetzt in das Setup investierst, spart
dir später drei Stunden Frust.

---

## 1. Software-Voraussetzungen (Pflicht)

| Werkzeug              | Version            | Wozu?                                                        | Prüfbefehl              |
|-----------------------|--------------------|-------------------------------------------------------------|-------------------------|
| **Java JDK**          | 8 (1.8)            | Das Projekt ist auf `sourceCompatibility = 1.8` festgelegt. | `java -version`         |
| **Gradle**            | 4.x oder höher     | Build-Tool für Abhängigkeiten und Ausführung.               | `gradle -v`             |
| **Git**               | 2.x oder höher     | Versionierung, Branches, Klonen des Repos.                  | `git --version`         |
| **IDE**               | IntelliJ IDEA 2021+ | Empfohlen. Alternativ Eclipse (das Projekt hat ein Eclipse-Profil). | –               |

### Java 8 JDK

Spring 4.x und Spring Boot 1.5.7 laufen auf Java 8. Neuere JDKs (11, 17, 21) funktionieren mit
diesem **alten** Spring-Boot-1.5.x-Stack nicht zuverlässig. Verwende daher exakt ein JDK 8.

```bash
# Prüfen
java -version
# Erwartete Ausgabe (Beispiel):
# java version "1.8.0_xxx"
```

Empfohlene Distributionen: **Eclipse Temurin 8** (AdoptOpenJDK), **Amazon Corretto 8** oder
**Azul Zulu 8**. Setze die Umgebungsvariable `JAVA_HOME` auf das JDK-8-Verzeichnis.

```bash
# Linux/macOS Beispiel
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
echo $JAVA_HOME
```

> **Merke:** Mit dem Tool `sdkman` (https://sdkman.io) kannst du mehrere JDK- und Gradle-Versionen
> parallel installieren und pro Projekt umschalten. Sehr empfehlenswert, wenn du auch an
> moderneren Projekten arbeitest.

### Gradle

Das Repo nutzt das Spring-Boot-Gradle-Plugin `1.5.7.RELEASE`. Ein systemweites Gradle 4.x ist
ausreichend. Falls ein Gradle-Wrapper (`gradlew`) vorhanden ist, nutze diesen bevorzugt –
er garantiert eine reproduzierbare Build-Version.

```bash
gradle -v        # systemweites Gradle
./gradlew -v     # Wrapper (falls vorhanden)
```

### IDE

- **IntelliJ IDEA** (Community Edition genügt): Beste Spring-Unterstützung, automatischer
  Gradle-Import, eingebauter Decompiler. In der Ultimate Edition gibt es zusätzlich
  Spring-spezifische Inspektionen.
- **Eclipse**: Das Projekt enthält ein Eclipse-Profil (`apply plugin: 'eclipse'`) und die
  Spring-IDE-Nature. Funktioniert ebenfalls.

---

## 2. Wissens-Voraussetzungen (Pflicht)

Du solltest folgende Java-Grundlagen sicher beherrschen:

- **OOP-Grundlagen**: Klassen, Objekte, Konstruktoren, Vererbung, Kapselung.
- **Interfaces & Polymorphismus**: Was ein Interface ist, wie man es implementiert, warum man
  gegen Interfaces statt gegen konkrete Klassen programmiert.
- **Pakete & Imports**: Wie Java-Pakete und der Classpath funktionieren.
- **Exceptions**: try/catch, checked vs. unchecked Exceptions.
- **Collections**: `List`, `Map`, `Set` und ihre gängigen Implementierungen.
- **Build-Grundlagen**: Was eine Abhängigkeit (Dependency) ist und wofür ein Build-Tool dient.
- **Kommandozeile**: Navigieren, Befehle ausführen, Umgebungsvariablen setzen.

Wenn dir Lambdas und Streams noch fremd sind: kein Problem, **Kapitel 6** holt das nach. Du
brauchst sie erst dort.

---

## 3. Optionale Software (für Kapitel 8 – AWS / Produktion)

| Werkzeug              | Wozu?                                                            | Prüfbefehl              |
|-----------------------|-----------------------------------------------------------------|-------------------------|
| **Docker**            | Container-Images bauen und lokal testen.                        | `docker --version`      |
| **AWS CLI v2**        | Mit AWS-Diensten (EB, ECR, ECS, RDS, SSM) interagieren.         | `aws --version`         |
| **EB CLI**            | Komfortables Deployment auf Elastic Beanstalk.                  | `eb --version`          |
| **AWS-Konto**         | Tatsächliches Deployment. Free Tier reicht zum Üben.            | –                       |
| **GitHub-Konto**      | CI/CD-Pipeline mit GitHub Actions.                              | –                       |

> **Kostenwarnung:** AWS-Dienste wie RDS, ECS Fargate oder ein dauerhaft laufender
> Elastic-Beanstalk-Server kosten Geld. Nutze das **Free Tier**, **lösche Ressourcen nach dem
> Üben** und richte ein **Budget-Alarm** in der AWS-Konsole ein (Billing → Budgets).

```bash
# AWS CLI konfigurieren (einmalig)
aws configure
# AWS Access Key ID:     <dein Key>
# AWS Secret Access Key: <dein Secret>
# Default region name:   eu-central-1   (Frankfurt)
# Default output format: json
```

---

## 4. Wissens-Checkpoints pro Kapitel

Prüfe vor jedem Kapitel, ob du die genannten Konzepte verstehst. Wenn nicht, hole sie nach.

### Vor Kapitel 1 – IoC & DI mit XML
- [ ] Du kannst eine Java-Klasse mit Gettern/Settern schreiben (JavaBean-Konvention).
- [ ] Du verstehst, was `new MyClass()` macht und warum direkte `new`-Aufrufe Kopplung erzeugen.
- [ ] Du weißt, was der Classpath ist.

### Vor Kapitel 2 – Annotationsbasierte Konfiguration
- [ ] Du hast Kapitel 1 verstanden (IoC-Container, `ApplicationContext`, Beans).
- [ ] Du weißt, was ein Interface ist und wie man es implementiert.
- [ ] Du kennst Java-Annotationen vom Sehen (z.B. `@Override`).

### Vor Kapitel 3 – Spring Events
- [ ] Du kennst das Observer-Pattern (Beobachter) – oder bist bereit, es hier zu lernen.
- [ ] Du verstehst Generics (`ApplicationListener<MeinEvent>`).

### Vor Kapitel 4 – AOP
- [ ] Du verstehst, was ein Proxy-Objekt ist (wird im Kapitel erklärt).
- [ ] Du kennst eigene Annotationen (`@interface`) vom Hörensagen.
- [ ] Du verstehst Methodenaufrufe und Reflection-Grundideen.

### Vor Kapitel 5 – Spring Boot & Integration
- [ ] Du verstehst Beans und Konfiguration (Kapitel 1 & 2).
- [ ] Du kennst das Konzept von Nachrichten/Queues grob (Producer/Consumer).

### Vor Kapitel 6 – Java 8
- [ ] Du kennst Interfaces (für funktionale Interfaces).
- [ ] Du kennst die Java-Collections-API.

### Vor Kapitel 7 – Testing
- [ ] Du verstehst DI (für das Einspritzen von Mocks).
- [ ] Du weißt, was ein Unit-Test grundsätzlich ist.

### Vor Kapitel 8 – AWS / Produktion
- [ ] Du hast eine lauffähige Spring-Boot-App (Kapitel 5).
- [ ] Du hast Docker und die AWS CLI installiert (siehe oben).
- [ ] Du hast ein AWS-Konto mit konfigurierten Credentials.
- [ ] Du verstehst Umgebungsvariablen.

### Vor Kapitel 9 – Nächste Schritte
- [ ] Du hast alle vorherigen Kapitel abgeschlossen.

---

## 5. Repository einrichten

```bash
# Repo klonen (falls noch nicht geschehen)
git clone <repo-url> springtutorial
cd springtutorial

# Abhängigkeiten herunterladen und Projekt bauen
gradle build        # oder ./gradlew build

# In IntelliJ: "Open" -> build.gradle auswählen -> "Open as Project"
# Gradle importiert dann automatisch alle Abhängigkeiten.
```

> **Häufiger Fehler:** Wenn der Build mit „Unsupported class file major version" oder ähnlichen
> JDK-Fehlern abbricht, läuft Gradle wahrscheinlich auf dem falschen JDK. Setze `JAVA_HOME`
> explizit auf dein JDK 8 und starte die IDE neu.

Wenn alle Prüfbefehle sinnvolle Ausgaben liefern und der Build durchläuft, bist du startklar.
Weiter geht es in `TUTORIAL.md`.
