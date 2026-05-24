# Angular Signals Academy: Test-Driven Learning 🚀

¡Bienvenido al repositorio de aprendizaje sobre reactividad moderna de **Angular Signals.** 

Este proyecto utiliza la metodología **Test-Driven Learning (TDL)** combinada con la extensión **CodeTour** de VS Code.

---

## 🧠 ¿Qué es Test-Driven Learning (TDL)?

**Test-Driven Learning (TDL)** es un enfoque educativo adaptado del desarrollo guiado por pruebas (TDD). 
- El proyecto se entrega con una suite de pruebas automatizadas que **fallan inicialmente (RED)** con mensajes educativos muy descriptivos.
- Tu objetivo es modificar el código de la aplicación guiado por el tour hasta que todas las pruebas **pasen a verde (GREEN)**.
- Esto crea un **bucle de retroalimentación instantáneo y sumamente satisfactorio** que te permite validar tus conocimientos en tiempo real a medida que escribes código.

---

## 🗺️ ¿Qué es CodeTour?

**CodeTour** es una extensión de VS Code que te permite crear y realizar recorridos guiados e interactivos directamente dentro de tu editor de código.
- Te llevará a las líneas de código exactas donde debes intervenir.
- Te proporcionará explicaciones teóricas concisas del "porqué" de las cosas.
- Te dará instrucciones detalladas y pistas para resolver cada reto sin necesidad de alternar pestañas ni leer largas documentaciones.

---

## 🛠️ Instrucciones de Inicio Rápido

Sigue estos sencillos pasos para iniciar tu camino hacia la maestría en Angular Signals:

### 1. Requisitos Previos
Asegúrate de tener instalado **Node.js** (v18+) y **pnpm** (nuestro gestor de paquetes de alto rendimiento).

### 2. Abrir en VS Code e Instalar Recomendaciones
1. Abre esta carpeta en VS Code.
2. En la esquina inferior derecha, VS Code te sugerirá automáticamente instalar la extensión recomendada del proyecto: **CodeTour** (`vsls-contrib.codetour`). Haz clic en **Instalar** (o búscala manualmente en el panel de extensiones).

### 3. Instalar Dependencias
Abre la terminal en VS Code y ejecuta el siguiente comando para instalar todos los paquetes y dependencias:
```bash
pnpm install
```

---

## 🚀 Cómo Correr el Proyecto

Te recomendamos tener **dos terminales abiertas al mismo tiempo**:

### Terminal 1: El Servidor de Desarrollo (El Cliente Web)
Para ver la hermosa interfaz glassmorphism oscura de la aplicación en vivo y probar la interacción del usuario:
```bash
pnpm run dev
```
*Abre tu navegador en **`http://localhost:5173/`**. Verás el **Dashboard de la Academy** con una barra lateral de navegación por niveles. Inicialmente, la aplicación funciona usando la reactividad tradicional de Angular.*

### Terminal 2: El Test Runner de Retroalimentación en Vivo (Vitest)
Para ver tus pruebas fallando y validándose en tiempo real:
```bash
pnpm run test
```
*Vitest arrancará en **Watch Mode**. Verás la suite de pruebas unitarias fallar limpiamente al principio. **Deja esta terminal abierta**; cada vez que guardes un cambio en tus retos, Vitest volverá a compilar en menos de 50ms y actualizará tu progreso.*

---

## 🏁 ¡Iniciar el CodeTour!

Una vez que tengas tu servidor levantado y tus tests corriendo:

1. Presiona `F1` en VS Code, escribe `CodeTour: Start Tour` y presiona **Enter** (o abre el explorador de VS Code, busca la pestaña **CodeTour** abajo a la izquierda y presiona el botón de **Play**).
2. El tour te llevará al archivo `README.md` como primer paso explicativo y luego te guiará directamente a `counter.component.ts`.
3. Sigue las instrucciones paso a paso, actualiza las variables tradicionales a Signals, ¡y disfruta viendo cómo los tests se ponen verdes en tiempo real!

---

## 🗺️ Mapa de Aprendizaje — Nivel 1: Writable Signals

A lo largo del tour realizarás la siguiente transición tecnológica:

| Paso | Tipo | Concepto Educativo | Acción Requerida | Estado de Pruebas |
| :--- | :--- | :--- | :--- | :--- |
| **Paso 1** | Exploración | **Estructura del Proyecto** | Lee las instrucciones de este README. | Explorando |
| **Paso 2** | Exploración | **Estado Tradicional** | Entiende el código clásico e interpolaciones `{{ value }}` en el HTML. | 0/7 Pasando |
| **Paso 3** | Exploración | **Reactividad Manual** | Analiza la molestia de recalcular el estado derivado en cada manejador. | 0/7 Pasando |
| **Paso 4** | Reto 1 | **Writable Signals** | Transforma `counter` en un `signal(0)` y actualiza el HTML a `counter()`. | **1/7 Pasando 🟢** |
| **Paso 5** | Reto 2 | **Signal Inputs** | Convierte `@Input()` en `input(1)` y adáptalo en el HTML y la clase. | **3/7 Pasando 🟢** |
| **Paso 6** | Reto 3 | **Computed Signals** | Crea `doubleCounter` con `computed()` y borra el recalculo manual. | **5/7 Pasando 🟢** |
| **Paso 7** | Reto Final | **update() Idiomático** | Moderniza la mutación de señales usando `.update(...)`. | **7/7 Pasando 🟢🏆** |

---

## 🧬 Roadmap de la Academy (Niveles 2 → 7)

Este repositorio está diseñado como una **academia progresiva**. Cada nivel se implementa como un componente independiente accesible desde la barra lateral:

| Nivel | Tema | Conceptos Clave |
| :--- | :--- | :--- |
| **Nivel 1** ⚡ | Writable Signals | `signal()`, `input()`, `computed()`, `.update()` |
| **Nivel 2** 🧠 | Reactive Thinking | Computed chains, estado derivado declarativo |
| **Nivel 3** 💾 | Effect Architecture | `effect()`, `onCleanup`, localStorage sync |
| **Nivel 4** 🏗️ | Reactive Architecture | Services, `output()`, `BehaviorSubject` → `signal()`, `.asReadonly()` |
| **Nivel 5** 🔄 | RxJS Boundaries | `toSignal()`, `toObservable()`, `rxResource()`, HttpClient |
| **Nivel 6** 🗄️ | Signal Stores | DIY Signal Store → `@ngrx/signals` |
| **Nivel 7** 🚀 | Zone-less Angular | `OnPush`, `provideZonelessChangeDetection()`, `afterRender` |

---

## 🔧 Herramientas Automáticas de Migración

Angular proporciona schematics del CLI para migrar código existente automáticamente. Después de completar esta academia, puedes usarlos en tus proyectos profesionales:

```bash
# Migrar @Input() → input()
ng generate @angular/core:signal-input-migration

# Migrar @Output() → output()
ng generate @angular/core:output-migration

# Migrar @ViewChild/@ContentChild → viewChild()/contentChild()
ng generate @angular/core:signal-queries-migration
```

---

Sigue las instrucciones, confía en los tests, y aprende.
