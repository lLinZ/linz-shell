# Design System - Linz Shell

Este sistema de diseño está construido para ser **moldeable**, **escalable** y **consistente**. En lugar de usar elementos HTML puros con clases de Tailwind repetitivas, utilizamos componentes atómicos que centralizan los estilos.

## Principios Base

1.  **Variables de Tema**: Todos los colores y estilos base están definidos en `resources/css/app.css` mediante variables CSS (`--color-bg-primary`, `--color-text-primary`, etc.).
2.  **No usar HTML puro para UI**: Evita usar `div` con clases de bordes, sombras o fondos. Usa el componente `<Surface />`.
3.  **Tipografía Controlada**: Usa el componente `<Typography />` para todos los textos.

---

## Componentes Disponibles

### 1. Surface
El contenedor base del sistema. Reemplaza a los `div` que se usan como paneles, tarjetas o fondos.

**Uso:**
```tsx
import { Surface } from '@/Components/ui/Surface';

<Surface variant="primary" shadow="md" border={true}>
  Contenido aquí...
</Surface>
```

**Props:**
*   `variant`: `primary` (blanco/gris oscuro), `secondary` (gris claro/azul oscuro), `tertiary`, `flat`.
*   `size`: `none`, `sm`, `md`, `lg` (controla el padding).
*   `shadow`: `none`, `sm`, `md`, `lg`.
*   `border`: `boolean`.

### 2. Typography
Centraliza el estilo de los textos para asegurar jerarquía visual.

**Uso:**
```tsx
import { Typography } from '@/Components/ui/Typography';

<Typography variant="h1">Título Grande</Typography>
<Typography variant="muted">Texto secundario o informativo</Typography>
```

**Variants:** `h1`, `h2`, `h3`, `h4`, `p`, `small`, `muted`.

### 3. Button (UI)
Botón estandarizado con variantes de diseño.

**Uso:**
```tsx
import { Button } from '@/Components/ui/button';

<Button variant="outline" size="sm">Hacer algo</Button>
```

---

## Cómo extender el sistema

Si necesitas un nuevo patrón visual:
1.  **Define el patrón**: ¿Es un contenedor? (Surface), ¿Es un texto? (Typography), ¿Es una acción? (Button).
2.  **Abstrae en `Components/ui/`**: Crea el archivo si no existe o añade la variante al componente existente.
3.  **Usa variables CSS**: Nunca uses colores fijos como `bg-blue-500` si ese color representa algo global (como el color primario). Usa `bg-[var(--color-primary)]`.

---

## Refactorización de Componentes Legacy
Cuando encuentres componentes con mucho HTML (como el antiguo Dropdown), refactóralos usando estos bloques básicos. Esto permitirá que si mañana queremos que todos los paneles de la app tengan bordes redondeados `2xl` en lugar de `lg`, solo tengamos que cambiar una línea en `Surface.tsx`.
