# Spring Framework Tutorial — Junior bis Mid-Level Developer

> **Ziel:** Du verstehst die Kernkonzepte des Spring Frameworks und kannst eine Spring-Anwendung lokal entwickeln und produktiv auf AWS deployen.

---

## Inhaltsverzeichnis

1. [Anforderungen](#1-anforderungen)
2. [Was ist Spring? — Konzepte verstehen](#2-was-ist-spring--konzepte-verstehen)
3. [Projekt einrichten](#3-projekt-einrichten)
4. [Teil 1 — Erste Spring-App mit XML-Konfiguration](#4-teil-1--erste-spring-app-mit-xml-konfiguration)
5. [Teil 2 — Dependency Injection mit Java-Annotationen](#5-teil-2--dependency-injection-mit-java-annotationen)
6. [Teil 3 — Spring Events (Observer-Pattern)](#6-teil-3--spring-events-observer-pattern)
7. [Teil 4 — Spring AOP (Aspektorientierte Programmierung)](#7-teil-4--spring-aop-aspektorientierte-programmierung)
8. [Teil 5 — Spring Integration (Messaging)](#8-teil-5--spring-integration-messaging)
9. [Teil 6 — Spring Boot für Produktion](#9-teil-6--spring-boot-für-produktion)
10. [AWS-Deployment — Produktiver Einsatz](#10-aws-deployment--produktiver-einsatz)
11. [Best Practices & Checkliste](#11-best-practices--checkliste)

---

## 1. Anforderungen

### Technische Voraussetzungen

| Kategorie | Anforderung | Version / Hinweis |
|-----------|-------------|-------------------|
| **Java JDK** | OpenJDK oder Oracle JDK | **Java 8** (Pflicht für dieses Projekt), Java 17+ für neue Projekte empfohlen |
| **Build-Tool** | Gradle | **6.x** (im Projekt konfiguriert), alternativ Maven |
| **IDE** | IntelliJ IDEA (empfohlen) oder Eclipse mit Spring-Plugin | Community Edition reicht |
| **Git** | Versionskontrolle | 2.x |
| **Docker** | Containerisierung (ab Teil 6 + AWS) | Desktop / Engine 20+ |
| **AWS CLI** | AWS-Zugriff vom Terminal | v2 (`aws --version`) |
| **AWS-Konto** | Für Deployment-Abschnitte | Free Tier reicht zum Lernen |

### Wissensvoraussetzungen

- **Java-Grundlagen:** Klassen, Interfaces, Vererbung, Annotations
- **OOP:** Du kennst das Konzept von Objekten und Abhängigkeiten zwischen Klassen
- **Grundkenntnisse XML** (für die ersten Beispiele)
- **Terminal / Bash:** Einfache Befehle (`cd`, `ls`, `./gradlew build`)

### Dieses Projekt klonen und bauen

```bash
# Repository klonen
git clone https://github.com/planesweep/springtutorial.git
cd springtutorial

# Projekt bauen (Gradle Wrapper)
./gradlew build

# Ausgabe prüfen
./gradlew dependencies  # zeigt alle Abhängigkeiten
```

> **Tipp:** IntelliJ IDEA erkennt das Gradle-Projekt automatisch, wenn du `File > Open` auf den Projektordner anwendest. Stelle sicher, dass du das JDK 8 unter `Project Structure > SDK` eingestellt hast.

---

## 2. Was ist Spring? — Konzepte verstehen

### Das Problem ohne Spring

Stell dir vor, du hast eine Klasse `OrderService`, die einen `PaymentService` benötigt:

```java
// OHNE Spring: harte Kopplung
public class OrderService {
    private PaymentService paymentService = new PaymentService(); // direkte Instanz!

    public void placeOrder() {
        paymentService.charge(100);
    }
}
```

**Probleme:**
- `OrderService` und `PaymentService` sind fest miteinander verdrahtet
- Unit-Tests sind schwierig (du kannst `PaymentService` nicht durch einen Mock ersetzen)
- Austauschen der Implementierung erfordert Code-Änderungen

### Die Lösung: Inversion of Control (IoC) und Dependency Injection (DI)

Spring kehrt die Kontrolle um: **Nicht der Code erstellt seine Abhängigkeiten — Spring tut es.**

```
Ohne Spring: OrderService → new PaymentService()
Mit Spring:  Spring-Container → erstellt beide → gibt OrderService einen PaymentService
```

**Spring IoC Container** ist der Kern: Er verwaltet sogenannte **Beans** (Spring-verwaltete Java-Objekte) und deren Abhängigkeiten.

### Die drei Konfigurationswege

```
XML-Konfiguration        → spring-bean.xml  (Teil 1 — klassisch, gut zum Lernen)
Java-Annotation-Config   → @Configuration   (Teil 2 — modern, typsicher)
Spring Boot Auto-Config  → @SpringBootApplication (Teil 6 — produktiv)
```

---

## 3. Projekt einrichten

### Projektstruktur verstehen

```
springtutorial/
├── build.gradle                        ← Build-Konfiguration (Abhängigkeiten, Java-Version)
├── src/
│   ├── main/java/
│   │   └── net/gregorkofler/spring/tutorial/
│   │       ├── first/      ← Teil 1: XML-Konfiguration
│   │       ├── second/     ← Teil 2: Java-Annotation-DI
│   │       ├── third/      ← Teil 3: Spring Events
│   │       ├── fourth/     ← Teil 4: Spring AOP
│   │       └── fith/       ← Teil 5: Spring Integration
│   └── main/resources/
│       └── spring/fith/    ← XML für Integration
└── web/
    └── WEB-INF/            ← Spring MVC Konfiguration
```

### `build.gradle` — Was bedeutet was?

```groovy
apply plugin: 'java'                         // Standard-Java-Build
apply plugin: 'org.springframework.boot'     // Spring Boot Plugin (Packaging, Run)

sourceCompatibility = 1.8                    // Kompilierung mit Java 8
targetCompatibility = 1.8

dependencies {
    compile 'org.springframework:spring-context:4.+'   // IoC-Container, Events
    compile 'org.springframework:spring-core:4.+'      // Basis-Utilities
    compile("org.springframework.boot:spring-boot-starter:1.5.7.RELEASE")  // Boot-Autoconfiguration

    // Spring Integration (Teil 5)
    compile("org.springframework.integration:spring-integration-java-dsl")
    compile("org.springframework.integration:spring-integration-feed")
    compile("org.springframework.integration:spring-integration-file")

    testCompile 'org.testng:testng:6.8.7'              // Test-Framework
    testCompile 'org.mockito:mockito-all:1.9.5'        // Mocking
}
```

> **Hinweis für neue Projekte:** In modernen Spring-Boot-Projekten (3.x) nutzt man `implementation` statt `compile` und `testImplementation` statt `testCompile`. Das Prinzip bleibt gleich.

---

## 4. Teil 1 — Erste Spring-App mit XML-Konfiguration

**Lernziel:** Du verstehst, wie Spring Beans über XML definiert und vom Container instanziiert werden.

### Schritt 1: Die Bean-Klasse

`src/net/gregorkofler/spring/tutorial/first/MyBean.java`

```java
package net.gregorkofler.spring.tutorial.first;

public class MyBean {

    private String name;
    private String description;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String toString() {
        return getName() + " — " + getDescription();
    }
}
```

> Das Original-Projekt hat andere Feldnamen — das Prinzip ist identisch. Eine Bean ist **jede einfache Java-Klasse** mit Getter/Setter-Methoden (POJO = Plain Old Java Object).

### Schritt 2: Die XML-Konfiguration

`src/net/gregorkofler/spring/tutorial/first/spring-bean.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
                           http://www.springframework.org/schema/beans/spring-beans.xsd">

    <!-- Bean definieren: id = eindeutiger Name, class = vollqualifizierter Klassenname -->
    <bean id="myBean" class="net.gregorkofler.spring.tutorial.first.MyBean">
        <!-- Werte per Setter-Injection setzen -->
        <property name="name" value="Meine erste Bean"/>
        <property name="description" value="Erstellt vom Spring-Container"/>
    </bean>

    <!-- Alias: myBean ist auch unter myBean2 erreichbar -->
    <alias name="myBean" alias="myBean2"/>

</beans>
```

**Was passiert hier?**
- `<bean id="myBean" class="...">` — Spring wird `new MyBean()` aufrufen
- `<property name="name" value="...">` — Spring ruft `setName("...")` auf (Setter-Injection)

### Schritt 3: Die Hauptklasse

`src/net/gregorkofler/spring/tutorial/first/MyFirstSpringApp.java`

```java
package net.gregorkofler.spring.tutorial.first;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class MyFirstSpringApp {

    public static void main(String[] args) {
        // Spring-Container starten — liest die XML-Datei ein
        ApplicationContext context =
            new ClassPathXmlApplicationContext(
                "net/gregorkofler/spring/tutorial/first/spring-bean.xml"
            );

        // Bean aus dem Container holen
        MyBean myBean = context.getBean("myBean", MyBean.class);

        // Ausgabe
        System.out.println(myBean);  // → "Meine erste Bean — Erstellt vom Spring-Container"
    }
}
```

### Was passiert intern?

```
1. ClassPathXmlApplicationContext("spring-bean.xml")
        ↓
2. Spring liest XML → findet <bean id="myBean" class="MyBean">
        ↓
3. Spring ruft new MyBean() auf
        ↓
4. Spring ruft myBean.setName(...) und myBean.setDescription(...) auf
        ↓
5. Bean wird im Container gespeichert (Singleton-Scope per default!)
        ↓
6. context.getBean("myBean") → gibt die bereits erstellte Instanz zurück
```

### Aufgabe zum Nachbau

1. Erstelle eine neue Klasse `Person` mit Feldern `vorname`, `nachname`, `alter`
2. Definiere sie als Bean in einer neuen `person-bean.xml`
3. Hol sie aus dem Context und gib alle Felder aus

---

## 5. Teil 2 — Dependency Injection mit Java-Annotationen

**Lernziel:** Du ersetzt XML durch typsichere Java-Konfiguration mit `@Configuration` und `@Bean`.

### Das Szenario: Auto braucht einen Fahrer

#### Interface definieren

`ICar.java`
```java
public interface ICar {
    String getId();
    IDriver getDriver();
    void setDriver(IDriver driver);
}
```

`IDriver.java` (vereinfacht)
```java
public class IDriver {
    private String name;
    private String license;

    public IDriver(String name, String license) {
        this.name = name;
        this.license = license;
    }

    public String getName() { return name; }
}
```

#### Implementierung

`Golf.java`
```java
import org.springframework.beans.factory.annotation.Required;

public class Golf implements ICar {

    private String id;
    private IDriver driver;

    public Golf(String id, IDriver driver) {
        this.id = id;
        this.driver = driver;
    }

    @Override
    public String getId() { return id; }

    @Required  // Spring prüft: Diese Property MUSS gesetzt sein
    @Override
    public void setDriver(IDriver driver) { this.driver = driver; }

    @Override
    public IDriver getDriver() { return driver; }

    public String toString() {
        return "Golf[id=" + id + ", driver=" + driver.getName() + "]";
    }
}
```

#### Java-Konfigurationsklasse

`MyCarAppConfig.java`
```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration          // Kennzeichnet diese Klasse als Spring-Konfiguration
public class MyCarAppConfig {

    @Bean               // Spring verwaltet das zurückgegebene Objekt als Bean
    public Golf createGolf(IDriver driver) {
        return new Golf("12345", createDriver());
    }

    @Bean
    public IDriver createDriver() {
        return new IDriver("Gregor", "B123456");
    }
}
```

**Vorteil gegenüber XML:**
- Typsicher: Compiler fängt Fehler ab
- Refactoring-freundlich: IDE kann Beans umbenennen
- Keine XML-Syntax-Fehler

#### Anwendung starten

`MyCarApp.java`
```java
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class MyCarApp {
    public static void main(String[] args) {
        // Java-Config statt XML
        ApplicationContext context =
            new AnnotationConfigApplicationContext(MyCarAppConfig.class);

        ICar car = context.getBean("createGolf", ICar.class);
        System.out.println(car);  // → Golf[id=12345, driver=Gregor]
    }
}
```

### Bean-Scopes — Singleton vs. Prototype

```java
import org.springframework.context.annotation.Scope;

@Configuration
public class ScopeDemo {

    @Bean
    @Scope("singleton")  // Standard: Immer dieselbe Instanz
    public Golf singletonGolf() {
        return new Golf("SINGLETON", createDriver());
    }

    @Bean
    @Scope("prototype")  // Neue Instanz bei jedem getBean()-Aufruf
    public Golf prototypeGolf() {
        return new Golf("PROTOTYPE", createDriver());
    }

    @Bean
    public IDriver createDriver() {
        return new IDriver("Gregor", "B123456");
    }
}
```

```java
// Test:
ApplicationContext ctx = new AnnotationConfigApplicationContext(ScopeDemo.class);

Golf s1 = ctx.getBean("singletonGolf", Golf.class);
Golf s2 = ctx.getBean("singletonGolf", Golf.class);
System.out.println(s1 == s2);  // → true  (selbe Instanz)

Golf p1 = ctx.getBean("prototypeGolf", Golf.class);
Golf p2 = ctx.getBean("prototypeGolf", Golf.class);
System.out.println(p1 == p2);  // → false (neue Instanzen)
```

### Moderne Alternative: Komponenten-Scan + `@Autowired`

In realen Projekten nutzt man oft `@Component` + `@Autowired` statt expliziter `@Bean`-Methoden:

```java
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

@Service                    // = @Component für Business-Logik
public class OrderService {

    private final PaymentService paymentService;

    @Autowired              // Spring injiziert automatisch
    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    public void placeOrder(double amount) {
        paymentService.charge(amount);
    }
}

@Service
public class PaymentService {
    public void charge(double amount) {
        System.out.println("Charging: " + amount);
    }
}
```

> **Best Practice:** Konstruktor-Injection (wie oben) bevorzugen — macht Abhängigkeiten explizit und vereinfacht Tests.

### Aufgabe zum Nachbau

1. Erstelle eine `BookstoreConfig` mit `@Configuration`
2. Definiere Beans: `Book` (Titel, Autor) und `BookService` (enthält eine Liste von Books)
3. `BookService` soll per Konstruktor-Injection eine `List<Book>` erhalten
4. Gib alle Bücher über den Context aus

---

## 6. Teil 3 — Spring Events (Observer-Pattern)

**Lernziel:** Du verstehst, wie Komponenten lose gekoppelt über Events kommunizieren.

### Das Observer-Pattern

```
Publisher → veröffentlicht Event
    ↓
Spring-Event-Bus (ApplicationContext)
    ↓
Handler A ← reagiert auf Event
Handler B ← reagiert auf Event
```

Publisher und Handler kennen sich **nicht** — sie kommunizieren nur über den Event-Typ.

### Eigenes Event erstellen

`CustomEvent.java`
```java
import org.springframework.context.ApplicationEvent;

public class CustomEvent extends ApplicationEvent {

    public CustomEvent(Object source) {
        super(source);
    }

    public String toString() {
        return "CustomEvent wurde ausgelöst von: " + getSource().getClass().getSimpleName();
    }
}
```

### Event veröffentlichen

`CustomEventPublisher.java`
```java
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.ApplicationEventPublisherAware;

public class CustomEventPublisher implements ApplicationEventPublisherAware {

    private ApplicationEventPublisher publisher;

    @Override
    public void setApplicationEventPublisher(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    public void publish() {
        CustomEvent event = new CustomEvent(this);
        publisher.publishEvent(event);   // Event in den Bus einspeisen
    }
}
```

> `ApplicationEventPublisherAware` ist ein Spring-Interface — Spring erkennt es und injiziert automatisch den `ApplicationEventPublisher`.

### Event empfangen

`CustomEventHandler.java`
```java
import org.springframework.context.ApplicationListener;

public class CustomEventHandler implements ApplicationListener<CustomEvent> {

    @Override
    public void onApplicationEvent(CustomEvent event) {
        System.out.println("Event empfangen: " + event);
    }
}
```

### XML-Konfiguration

`spring-bean.xml`
```xml
<beans ...>
    <bean id="customEventHandler"
          class="net.gregorkofler.spring.tutorial.third.CustomEventHandler"/>

    <bean id="customEventPublisher"
          class="net.gregorkofler.spring.tutorial.third.CustomEventPublisher"/>
</beans>
```

### Hauptklasse

`MyEventApp.java`
```java
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class MyEventApp {
    public static void main(String[] args) {
        ClassPathXmlApplicationContext ctx =
            new ClassPathXmlApplicationContext("spring-bean.xml");

        CustomEventPublisher publisher =
            ctx.getBean("customEventPublisher", CustomEventPublisher.class);

        publisher.publish();  // → "Event empfangen: CustomEvent wurde ausgelöst von: CustomEventPublisher"

        ctx.close();
    }
}
```

### Built-in Spring-Events

Spring löst selbst Events aus, auf die du reagieren kannst:

```java
import org.springframework.context.event.ContextStartedEvent;
import org.springframework.context.ApplicationListener;

public class ContextStartHandler implements ApplicationListener<ContextStartedEvent> {
    @Override
    public void onApplicationEvent(ContextStartedEvent event) {
        System.out.println("Spring-Context gestartet!");
    }
}
```

| Event | Zeitpunkt |
|-------|-----------|
| `ContextStartedEvent` | Nach `ctx.start()` |
| `ContextStoppedEvent` | Nach `ctx.stop()` |
| `ContextRefreshedEvent` | Nach `ctx.refresh()` (auch beim Start) |
| `ContextClosedEvent` | Beim `ctx.close()` |

### Aufgabe zum Nachbau

1. Erstelle ein `OrderPlacedEvent` mit einer Bestell-ID
2. Einen `OrderService`, der das Event veröffentlicht
3. Einen `EmailNotificationHandler` und einen `InventoryHandler`, die beide auf das Event reagieren
4. Führe es aus und beobachte, dass beide Handler ausgelöst werden

---

## 7. Teil 4 — Spring AOP (Aspektorientierte Programmierung)

**Lernziel:** Du kannst Querschnittsbelange (Logging, Security, Transaktionen) von der Business-Logik trennen.

### Das Problem: Code-Verschmutzung

```java
// OHNE AOP: Logging-Code überall verstreut
public class EmployeeService {
    private Logger log = LoggerFactory.getLogger(this.getClass());

    public Employee getEmployee() {
        log.info("getEmployee() aufgerufen");       // ← querschnittlicher Code
        // ... eigentliche Business-Logik
        return employee;
    }

    public void setEmployee(Employee e) {
        log.info("setEmployee() aufgerufen");       // ← wiederholt sich überall
        this.employee = e;
    }
}
```

### Die Lösung: Aspekte

AOP erlaubt es, solchen Code **einmal** zu definieren und automatisch **überall** anzuwenden.

```
Business-Methode:  getEmployee()
        ↑
Aspect (Advice):  "Vor jeder get*()-Methode: logge etwas"
```

### Kern-Begriffe

| Begriff | Bedeutung | Beispiel |
|---------|-----------|---------|
| **Aspect** | Die Klasse mit dem Querschnittscode | `EmployeeAspect` |
| **Advice** | Wann wird der Code ausgeführt? | `@Before`, `@After`, `@Around` |
| **Pointcut** | Welche Methoden sind betroffen? | `execution(* getName())` |
| **Join Point** | Konkreter Ausführungspunkt | Aufruf von `getEmployee()` |
| **Weaving** | Einfügen des Aspekt-Codes | Durch Spring-Proxy-Mechanismus |

### Einfacher Aspekt

`EmployeeAspect.java`
```java
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;

@Aspect
public class EmployeeAspect {

    // Vor jeder public getName()-Methode ausführen
    @Before("execution(public String getName())")
    public void getNameAdvice() {
        System.out.println("[Aspect] getName() wird aufgerufen");
    }

    // Vor allen get*()-Methoden im Paket
    @Before("execution(* net.gregorkofler.spring.tutorial.fourth.*.get*())")
    public void getAllAdvice() {
        System.out.println("[Aspect] Getter wird aufgerufen");
    }
}
```

### Aspekt mit wiederverwendbarem Pointcut

`EmployeeAspectPointcut.java`
```java
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;

@Aspect
public class EmployeeAspectPointcut {

    // Pointcut einmal definieren — mehrfach verwenden
    @Pointcut("execution(public String getName())")
    public void getNamePointcut() {}

    @Pointcut("within(net.gregorkofler.spring.tutorial.fourth.*)")
    public void allMethodsPointcut() {}

    @Before("getNamePointcut()")
    public void loggingAdvice() {
        System.out.println("[Pointcut] loggingAdvice vor getName()");
    }

    @Before("getNamePointcut()")
    public void secondAdvice() {
        System.out.println("[Pointcut] secondAdvice vor getName()");
    }

    @Before("allMethodsPointcut()")
    public void allServiceMethodsAdvice() {
        System.out.println("[Pointcut] Vor Methode im Paket");
    }
}
```

### Aspekt mit eigener Annotation

`Loggable.java` — eigene Annotation
```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)         // Nur auf Methoden anwendbar
@Retention(RetentionPolicy.RUNTIME) // Zur Laufzeit auswertbar
public @interface Loggable {}
```

`EmployeeAnnotationAspect.java`
```java
@Aspect
public class EmployeeAnnotationAspect {

    @Before("@annotation(net.gregorkofler.spring.tutorial.fourth.aspects.Loggable)")
    public void myAdvice() {
        System.out.println("[AnnotationAspect] @Loggable-Methode ausgeführt!");
    }
}
```

Verwendung:
```java
public class EmployeeService {
    @Loggable           // ← Aspect wird automatisch ausgelöst
    public Employee getEmployee() {
        return employee;
    }
}
```

### Around-Advice — Mächtigster Advice-Typ

```java
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;

@Aspect
public class PerformanceAspect {

    @Around("execution(* net.gregorkofler.spring.tutorial.fourth.*.*(..))")
    public Object measureTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();

        Object result = joinPoint.proceed();  // Original-Methode ausführen!

        long duration = System.currentTimeMillis() - start;
        System.out.println(joinPoint.getSignature() + " dauerte " + duration + "ms");

        return result;
    }
}
```

### XML-Konfiguration für AOP

`spring-bean.xml`
```xml
<beans xmlns:aop="http://www.springframework.org/schema/aop" ...>

    <!-- Aktiviert @AspectJ-Unterstützung -->
    <aop:aspectj-autoproxy/>

    <bean name="employee" class="...Employee">
        <property name="name" value="Max Mustermann"/>
    </bean>

    <bean name="employeeService" class="...EmployeeService">
        <property name="employee" ref="employee"/>
    </bean>

    <!-- Aspekte müssen auch als Beans registriert sein! -->
    <bean name="employeeAspect" class="...EmployeeAspect"/>
    <bean name="employeeAspectPointcut" class="...EmployeeAspectPointcut"/>
    <bean name="employeeAnnotationAspect" class="...EmployeeAnnotationAspect"/>

</beans>
```

### Aufgabe zum Nachbau

1. Schreibe einen `SecurityAspect`, der vor jeder `delete*()`-Methode prüft, ob ein Benutzer die Rolle "ADMIN" hat (simuliere mit einer statischen Variable)
2. Schreibe einen `TransactionAspect` mit `@Around`, der eine Methode in `try/catch` wrapped und im Fehlerfall "Rollback simuliert" ausgibt

---

## 8. Teil 5 — Spring Integration (Messaging)

**Lernziel:** Du verstehst Enterprise Integration Patterns (EIP) und wie Spring Integration Datenpipelines baut.

### Das Konzept: Message Channels

```
Message Producer
     ↓
  [Channel]  ←→  Spring Integration Backbone
     ↓
Message Consumer / Transformer / Filter
     ↓
  [Output Channel]
```

### Temperature-Converter via Messaging Gateway

`ApplicationTempConverter.java`
```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.annotation.Gateway;
import org.springframework.integration.annotation.IntegrationComponentScan;
import org.springframework.integration.annotation.MessagingGateway;

@Configuration
@SpringBootApplication
@IntegrationComponentScan
public class ApplicationTempConverter {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx =
            SpringApplication.run(ApplicationTempConverter.class, args);

        TempConverter converter = ctx.getBean(TempConverter.class);

        // Aufrufen wie eine normale Methode — intern läuft es über Message Channels
        System.out.println(converter.fahrenheitToCelcius(68.0f));  // → 20.0

        ctx.close();
    }

    @MessagingGateway
    public interface TempConverter {

        @Gateway(requestChannel = "convert.input")
        float fahrenheitToCelcius(float fahrenheit);
    }
}
```

### Einfacher File-Poller (reales Beispiel)

```java
import org.springframework.integration.dsl.IntegrationFlow;
import org.springframework.integration.dsl.IntegrationFlows;
import org.springframework.integration.file.dsl.Files;
import java.io.File;

@Configuration
public class FileIntegrationConfig {

    @Bean
    public IntegrationFlow fileReadingFlow() {
        return IntegrationFlows
            .from(Files.inboundAdapter(new File("/tmp/input"))
                .autoCreateDirectory(true),
                e -> e.poller(p -> p.fixedDelay(5000)))  // alle 5 Sekunden
            .handle(message -> {
                System.out.println("Neue Datei: " + message.getPayload());
            })
            .get();
    }
}
```

---

## 9. Teil 6 — Spring Boot für Produktion

**Lernziel:** Du baust eine produktionsreife Spring Boot REST-API.

### Warum Spring Boot?

```
Spring Core:  Sehr flexibel, viel Konfiguration nötig
Spring Boot:  "Convention over Configuration" — läuft sofort
```

### Minimale Spring Boot REST-API

`pom.xml` (Maven — für neue Projekte empfohlen)
```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>  <!-- Health-Checks! -->
    </dependency>
</dependencies>
```

#### Haupt-Application

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

#### REST-Controller

```java
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Product getProduct(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return service.save(product);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        service.delete(id);
    }
}
```

#### Health-Check konfigurieren (für AWS/Load Balancer wichtig!)

`src/main/resources/application.properties`
```properties
# Server-Port
server.port=8080

# Actuator Endpoints für Monitoring
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=always

# Application Info
spring.application.name=my-spring-app
info.app.version=1.0.0
```

Dann ist `/actuator/health` verfügbar:
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "diskSpace": { "status": "UP" }
  }
}
```

> **AWS-Wichtig:** Load Balancer und ECS nutzen diesen Endpoint, um zu prüfen, ob die App läuft!

---

## 10. AWS-Deployment — Produktiver Einsatz

### Architektur-Überblick

```
                    ┌─────────────────────────────────────────────┐
                    │                  AWS Cloud                   │
                    │                                              │
Internet → Route 53 → ALB (Load Balancer)                         │
                    │    ↓                                         │
                    │ ECS Fargate (Container)                      │
                    │    ├── Task 1: Spring Boot App               │
                    │    ├── Task 2: Spring Boot App               │
                    │    └── Task 3: Spring Boot App               │
                    │         ↓                                    │
                    │       RDS (PostgreSQL)                       │
                    │         ↓                                    │
                    │    Secrets Manager (Credentials)             │
                    │         ↓                                    │
                    │    CloudWatch (Logs + Monitoring)            │
                    └─────────────────────────────────────────────┘
```

### Schritt 1: Docker-Container erstellen

`Dockerfile`
```dockerfile
# Multi-Stage Build: erst bauen, dann schlankes Image
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY . .
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Dedizierter Non-Root-User aus Sicherheitsgründen
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /app/build/libs/*.jar app.jar

# Health-Check direkt im Container
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```bash
# Lokal testen
docker build -t my-spring-app:latest .
docker run -p 8080:8080 my-spring-app:latest
curl http://localhost:8080/actuator/health
```

### Schritt 2: Image in AWS ECR (Elastic Container Registry) pushen

```bash
# AWS CLI konfigurieren
aws configure
# → Access Key, Secret Key, Region eingeben

# ECR-Repository erstellen
aws ecr create-repository \
  --repository-name my-spring-app \
  --region eu-central-1

# Ausgabe: "repositoryUri": "123456789.dkr.ecr.eu-central-1.amazonaws.com/my-spring-app"

# Docker bei ECR anmelden
aws ecr get-login-password --region eu-central-1 \
  | docker login --username AWS --password-stdin \
    123456789.dkr.ecr.eu-central-1.amazonaws.com

# Image taggen und pushen
docker tag my-spring-app:latest \
  123456789.dkr.ecr.eu-central-1.amazonaws.com/my-spring-app:latest

docker push \
  123456789.dkr.ecr.eu-central-1.amazonaws.com/my-spring-app:latest
```

### Schritt 3: RDS (Relationale Datenbank) erstellen

```bash
# PostgreSQL-Instanz erstellen (Free Tier: db.t3.micro)
aws rds create-db-instance \
  --db-instance-identifier my-spring-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password "SicheresPasswort123!" \
  --allocated-storage 20 \
  --no-publicly-accessible \     # Nur intern erreichbar!
  --region eu-central-1
```

> **Sicherheit:** RDS immer `--no-publicly-accessible` — nur die App-Container dürfen verbinden, nicht das Internet.

### Schritt 4: Secrets Manager — Credentials sicher speichern

**Niemals** Passwörter in `application.properties` hardcoden!

```bash
# Credentials als Secret speichern
aws secretsmanager create-secret \
  --name "my-spring-app/db-credentials" \
  --secret-string '{
    "username": "admin",
    "password": "SicheresPasswort123!",
    "host": "my-spring-db.xyz.eu-central-1.rds.amazonaws.com",
    "port": "5432",
    "dbname": "appdb"
  }' \
  --region eu-central-1
```

In der Spring-App mit Secrets Manager lesen:
```java
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest;

@Configuration
public class DatabaseConfig {

    @Bean
    public DataSource dataSource() {
        // Secret aus AWS lesen
        SecretsManagerClient client = SecretsManagerClient.create();
        String secretJson = client.getSecretValue(
            GetSecretValueRequest.builder()
                .secretId("my-spring-app/db-credentials")
                .build()
        ).secretString();

        // JSON parsen und DataSource konfigurieren
        ObjectMapper mapper = new ObjectMapper();
        JsonNode secret = mapper.readTree(secretJson);

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:postgresql://" + secret.get("host").asText()
            + ":" + secret.get("port").asText()
            + "/" + secret.get("dbname").asText());
        config.setUsername(secret.get("username").asText());
        config.setPassword(secret.get("password").asText());

        return new HikariDataSource(config);
    }
}
```

Alternativ (empfohlen): AWS Spring Integration per `spring-cloud-aws`:

`application.properties`
```properties
spring.datasource.url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

Environment-Variablen kommen dann direkt aus dem Secrets Manager über die ECS Task Definition.

### Schritt 5: ECS Fargate — App deployen

ECS (Elastic Container Service) mit Fargate bedeutet: **Kein Server verwalten** — AWS kümmert sich darum.

#### Task Definition (JSON)

```json
{
  "family": "my-spring-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::123456789:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "my-spring-app",
      "image": "123456789.dkr.ecr.eu-central-1.amazonaws.com/my-spring-app:latest",
      "portMappings": [
        { "containerPort": 8080, "protocol": "tcp" }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8080/actuator/health || exit 1"],
        "interval": 30,
        "timeout": 10,
        "retries": 3
      },
      "secrets": [
        { "name": "DB_USERNAME", "valueFrom": "arn:aws:secretsmanager:...my-spring-app/db-credentials:username::" },
        { "name": "DB_PASSWORD", "valueFrom": "arn:aws:secretsmanager:...my-spring-app/db-credentials:password::" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/my-spring-app",
          "awslogs-region": "eu-central-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

```bash
# Task Definition registrieren
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json

# ECS Cluster erstellen
aws ecs create-cluster --cluster-name my-spring-cluster

# Service erstellen (3 laufende Instanzen)
aws ecs create-service \
  --cluster my-spring-cluster \
  --service-name my-spring-service \
  --task-definition my-spring-app:1 \
  --desired-count 3 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-abc123,subnet-def456],
    securityGroups=[sg-xyz789],
    assignPublicIp=DISABLED
  }" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,
                    containerName=my-spring-app,
                    containerPort=8080"
```

### Schritt 6: Application Load Balancer (ALB)

```bash
# ALB erstellen
aws elbv2 create-load-balancer \
  --name my-spring-alb \
  --subnets subnet-public-a subnet-public-b \
  --security-groups sg-alb \
  --type application

# Target Group (für ECS-Container)
aws elbv2 create-target-group \
  --name my-spring-targets \
  --protocol HTTP \
  --port 8080 \
  --target-type ip \
  --vpc-id vpc-abc123 \
  --health-check-path /actuator/health \     # Spring Actuator!
  --health-check-interval-seconds 30 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3

# HTTPS-Listener (Zertifikat aus ACM)
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:... \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

### Schritt 7: Auto Scaling

```bash
# Auto Scaling Target registrieren
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/my-spring-cluster/my-spring-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Skalierungs-Policy: bei hoher CPU skalieren
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/my-spring-cluster/my-spring-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name scale-on-cpu \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleOutCooldown": 60,
    "ScaleInCooldown": 300
  }'
```

### Schritt 8: CloudWatch — Logs und Monitoring

#### Logs in CloudWatch ansehen

```bash
# Log-Gruppe erstellen (passiert auch automatisch über Task Definition)
aws logs create-log-group --log-group-name /ecs/my-spring-app

# Log-Streams anzeigen
aws logs describe-log-streams \
  --log-group-name /ecs/my-spring-app \
  --order-by LastEventTime \
  --descending

# Logs live verfolgen
aws logs tail /ecs/my-spring-app --follow
```

#### Alarm bei Fehlern

```bash
# Alarm wenn mehr als 10 Fehler in 5 Minuten
aws cloudwatch put-metric-alarm \
  --alarm-name "spring-app-errors" \
  --alarm-description "Zu viele Fehler in der Spring-App" \
  --metric-name "ErrorCount" \
  --namespace "AWS/ApplicationELB" \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:eu-central-1:123456789:alerts-topic
```

#### Strukturiertes Logging in Spring (für CloudWatch essentiell)

```xml
<!-- logback-spring.xml -->
<configuration>
    <appender name="JSON_CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
    </appender>

    <root level="INFO">
        <appender-ref ref="JSON_CONSOLE"/>
    </root>
</configuration>
```

```java
// In deinem Service
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class OrderService {
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    public Order createOrder(OrderRequest request) {
        log.info("Creating order for customer={} amount={}", 
                 request.getCustomerId(), request.getAmount());
        // ...
    }
}
```

CloudWatch Logs Insights Query:
```sql
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 50
```

### Schritt 9: CI/CD-Pipeline (GitHub Actions)

`.github/workflows/deploy.yml`
```yaml
name: Build and Deploy to AWS ECS

on:
  push:
    branches: [main]

env:
  AWS_REGION: eu-central-1
  ECR_REPOSITORY: my-spring-app
  ECS_SERVICE: my-spring-service
  ECS_CLUSTER: my-spring-cluster

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Run Tests
        run: ./gradlew test

      - name: Build JAR
        run: ./gradlew bootJar

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push image
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: task-definition.json
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
```

---

## 11. Best Practices & Checkliste

### Entwicklung

- [ ] **Konstruktor-Injection** statt Field-Injection (`@Autowired` direkt auf Felder)
- [ ] **Interfaces** für alle Services definieren (ermöglicht Mocking in Tests)
- [ ] **`@Transactional`** für Datenbankoperationen nutzen
- [ ] **Tests schreiben:** Unit-Tests mit Mockito, Integrationstests mit `@SpringBootTest`
- [ ] **Keine Secrets im Code** — immer Environment-Variablen oder Secrets Manager
- [ ] **Strukturiertes Logging** (JSON-Format) für alle produktiven Logs

### Spring Boot Produktions-Config

```properties
# application-prod.properties
server.port=8080

# Graceful Shutdown (wichtig bei Rolling Deploys!)
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=30s

# Connection Pool
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.connection-timeout=30000

# Actuator (nur health und info — nicht alle Endpoints öffnen!)
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=when-authorized
```

### AWS-Sicherheits-Checkliste

- [ ] RDS **nicht** öffentlich zugänglich (`--no-publicly-accessible`)
- [ ] Security Groups: Container darf nur RDS-Port erreichen, ALB darf nur Port 8080 des Containers
- [ ] Secrets in **AWS Secrets Manager** — nie in Umgebungsvariablen hardcoden
- [ ] ECS Task Role mit **Least Privilege** (nur benötigte Permissions)
- [ ] ALB mit **HTTPS** (Zertifikat aus AWS ACM)
- [ ] **VPC**: App-Container in privaten Subnets, ALB in öffentlichen Subnets
- [ ] **Auto Scaling** konfiguriert (min. 2 Instanzen für Hochverfügbarkeit)
- [ ] **CloudWatch Alarms** für Fehlerrate, Latenz, CPU

### Rolling Deploy — Zero Downtime

ECS unterstützt Rolling Deploys out-of-the-box:
1. Neues Container-Image wird gestartet
2. Health-Check wartet, bis `/actuator/health` → UP
3. ALB leitet Traffic auf neue Instanz um
4. Alte Instanz wird gestoppt

```bash
# Neues Image deployen (ECS updated automatisch)
aws ecs update-service \
  --cluster my-spring-cluster \
  --service my-spring-service \
  --force-new-deployment
```

---

## Zusammenfassung

Du hast in diesem Tutorial gelernt:

| Thema | Was du kannst |
|-------|--------------|
| **Spring IoC / DI** | Beans über XML und Java-Config definieren und injizieren |
| **Spring Events** | Lose Kopplung über Publisher/Handler-Pattern |
| **Spring AOP** | Logging, Monitoring, Security als Querschnittsbelange |
| **Spring Integration** | Messaging-Pipelines und Gateway-Pattern |
| **Spring Boot** | Produktionsreife REST-API mit Health-Checks |
| **Docker** | Multi-Stage-Build, Health-Check im Container |
| **AWS ECR** | Container-Images sicher speichern |
| **AWS ECS Fargate** | Serverlos deployen ohne EC2-Verwaltung |
| **AWS RDS** | Verwaltete relationale Datenbank |
| **AWS Secrets Manager** | Sichere Credential-Verwaltung |
| **CloudWatch** | Logs, Metriken und Alarms |
| **CI/CD** | Automatisches Build und Deploy via GitHub Actions |

### Weiterführende Ressourcen

- [Spring Framework Docs](https://docs.spring.io/spring-framework/docs/current/reference/html/)
- [Spring Boot Reference](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [AWS ECS Best Practices Guide](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/intro.html)
- [Spring Cloud AWS](https://spring.io/projects/spring-cloud-aws) — native AWS-Integration für Spring
