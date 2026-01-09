# 🎨 Guía de uso de shadcn/ui en el Proyecto

## ✅ Configuración Completada

shadcn/ui ha sido integrado exitosamente con tu diseño vinotinto personalizado.

---

## 📁 Estructura de Archivos

```
src/
├── components/
│   └── ui/              # Componentes de shadcn/ui
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── table.tsx
│       └── badge.tsx
├── lib/
│   └── utils.ts         # Utilidad cn() para combinar clases
└── pages/
    └── ShadcnDemo.tsx   # Página de demostración
```

---

## 🚀 Cómo Usar los Componentes

### 1️⃣ **Botones**

```tsx
import { Button } from '@/components/ui/button';

// Variantes
<Button>Default (Vinotinto)</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Tamaños
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// Con ícono (usando FontAwesome)
<Button>
  <FontAwesomeIcon icon={faPlus} />
  Registrar
</Button>
```

---

### 2️⃣ **Cards (Tarjetas)**

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Título de la Tarjeta</CardTitle>
    <CardDescription>Descripción opcional</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Contenido de la tarjeta</p>
  </CardContent>
</Card>
```

---

### 3️⃣ **Modales (Dialog)**

```tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título del Modal</DialogTitle>
      <DialogDescription>
        Descripción del modal
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      {/* Tu contenido aquí */}
    </div>
  </DialogContent>
</Dialog>
```

---

### 4️⃣ **Inputs**

```tsx
import { Input } from '@/components/ui/input';

<Input 
  placeholder="Ingresa texto..." 
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

---

### 5️⃣ **Selects (Dropdowns)**

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Selecciona una opción" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Opción 1</SelectItem>
    <SelectItem value="option2">Opción 2</SelectItem>
    <SelectItem value="option3">Opción 3</SelectItem>
  </SelectContent>
</Select>
```

---

### 6️⃣ **Badges (Etiquetas)**

```tsx
import { Badge } from '@/components/ui/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

---

### 7️⃣ **Tablas**

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Columna 1</TableHead>
      <TableHead>Columna 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Dato 1</TableCell>
      <TableCell>Dato 2</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## 🎨 Colores Personalizados (Vinotinto)

Los colores están configurados en `src/index.css`:

```css
--primary: 0 95% 25%;  /* #7C0A02 - Tu color vinotinto */
```

Puedes usar estos colores en tu código:

```tsx
<div className="bg-primary text-primary-foreground">
  Texto en vinotinto
</div>
```

---

## 📦 Añadir Más Componentes

Para añadir componentes adicionales de shadcn/ui:

```bash
# Ver todos los componentes disponibles
npx shadcn@latest add

# Añadir un componente específico
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
npx shadcn@latest add alert
npx shadcn@latest add toast
npx shadcn@latest add calendar
npx shadcn@latest add date-picker
```

---

## 🛠️ Personalización

### Editar un Componente

Los componentes están en `src/components/ui/`. Puedes editarlos directamente:

```tsx
// src/components/ui/button.tsx
// Modifica las variantes, tamaños, estilos, etc.
```

### Utilidad `cn()`

Combina clases de Tailwind fácilmente:

```tsx
import { cn } from '@/lib/utils';

<Button className={cn("extra-class", isActive && "active-class")}>
  Click
</Button>
```

---

## 🎯 Página de Demostración

Visita `/shadcn-demo` en tu aplicación para ver todos los componentes en acción.

O directamente:
```
http://localhost:5173/shadcn-demo
```

---

## 📚 Migración de Componentes Existentes

### Ejemplo: Migrar tus Botones actuales

**Antes:**
```tsx
import Button from '../components/common/Button';

<Button variant="primary" onClick={handleClick}>
  Click
</Button>
```

**Después:**
```tsx
import { Button } from '@/components/ui/button';

<Button onClick={handleClick}>
  Click
</Button>
```

### Ejemplo: Migrar tus Modales

**Antes:**
```tsx
{isOpen && (
  <div className="modal-overlay">
    <div className="modal-content">
      {/* contenido */}
    </div>
  </div>
)}
```

**Después:**
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    {/* contenido */}
  </DialogContent>
</Dialog>
```

---

## 💡 Tips y Mejores Prácticas

1. **Usa los alias de import:** `@/components/ui/button` en lugar de rutas relativas
2. **Personaliza directamente:** No tengas miedo de editar los componentes en `src/components/ui/`
3. **Combina con tus estilos:** shadcn/ui funciona perfectamente con tus clases Tailwind existentes
4. **Mantén la consistencia:** Usa shadcn/ui para nuevos componentes y migra gradualmente los antiguos

---

## 🔗 Recursos Adicionales

- [Documentación oficial de shadcn/ui](https://ui.shadcn.com/)
- [Todos los componentes disponibles](https://ui.shadcn.com/docs/components)
- [Ejemplos de uso](https://ui.shadcn.com/examples)
- [Temas y personalización](https://ui.shadcn.com/themes)

---

## ✅ Next Steps

1. ✨ Visita `/shadcn-demo` para ver los componentes
2. 🔄 Identifica componentes que quieres migrar
3. 📝 Reemplaza gradualmente tus componentes personalizados
4. 🎨 Personaliza los estilos según tus necesidades
5. 🚀 ¡Disfruta del desarrollo acelerado!
