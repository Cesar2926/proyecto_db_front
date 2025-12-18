# Hook: useLocalStorage

Hook personalizado reutilizable para manejar el guardado y carga de datos en `localStorage` con soporte para expiración automática.

## 📦 Importación

```typescript
import { useLocalStorage } from '../hooks/useLocalStorage';
```

## 🚀 Uso Básico

```typescript
const [data, setData, clearData] = useLocalStorage(
  'miClave',
  { valorInicial: '' },
  {
    expirationTimeMs: 7 * 24 * 60 * 60 * 1000, // 7 días
    autoSave: true, // Guardado automático
  }
);
```

## 📝 Parámetros

### `key` (string, requerido)
Clave única para identificar los datos en localStorage.

### `initialValue` (T, requerido)
Valor inicial si no hay datos guardados o si expiraron.

### `options` (opcional)
- `expirationTimeMs` (number): Tiempo de expiración en milisegundos. Por defecto: `7 días`
- `autoSave` (boolean): Si se guarda automáticamente al cambiar los datos. Por defecto: `true`

## 🔄 Retorno

Retorna un array con tres elementos:
1. **`storedValue`**: El valor actual guardado (o `initialValue` si no hay datos)
2. **`setValue`**: Función para actualizar el valor (similar a `setState` de React)
3. **`clearValue`**: Función para limpiar los datos guardados

## 💡 Ejemplos

### Ejemplo 1: Formulario Simple

```typescript
interface FormData {
  nombre: string;
  email: string;
}

function MiFormulario() {
  const [formData, setFormData, clearFormData] = useLocalStorage<FormData>(
    'miFormulario',
    { nombre: '', email: '' },
    {
      expirationTimeMs: 1 * 24 * 60 * 60 * 1000, // 1 día
      autoSave: true,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Enviar datos a la API...
    clearFormData(); // Limpiar después de enviar
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.nombre}
        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
      />
      {/* ... */}
    </form>
  );
}
```

### Ejemplo 2: Sin Auto-guardado

```typescript
const [data, setData, clearData] = useLocalStorage(
  'miDato',
  '',
  {
    autoSave: false, // Guardado manual
  }
);

// Guardar manualmente cuando sea necesario
const handleSave = () => {
  setData(nuevoValor);
};
```

### Ejemplo 3: Sin Expiración (No recomendado)

```typescript
const [data, setData] = useLocalStorage(
  'miDato',
  '',
  {
    expirationTimeMs: Infinity, // Nunca expira
  }
);
```

## ⏰ Valores Comunes de Expiración

```typescript
// 1 hora
1 * 60 * 60 * 1000

// 1 día
1 * 24 * 60 * 60 * 1000

// 3 días
3 * 24 * 60 * 60 * 1000

// 1 semana (7 días)
7 * 24 * 60 * 60 * 1000

// 1 mes (30 días)
30 * 24 * 60 * 60 * 1000
```

## ✨ Características

- ✅ **Guardado automático**: Los datos se guardan automáticamente al cambiar
- ✅ **Carga automática**: Los datos se cargan automáticamente al montar el componente
- ✅ **Expiración automática**: Los datos antiguos se eliminan automáticamente
- ✅ **TypeScript**: Totalmente tipado con TypeScript
- ✅ **Manejo de errores**: Maneja errores de localStorage de forma segura
- ✅ **Detección de datos vacíos**: No guarda formularios completamente vacíos

## 🔧 Uso en el Proyecto

Este hook se usa actualmente en:
- `src/pages/Registro.tsx` - Formulario de registro de beneficiarios
- `src/pages/RegistroCaso.tsx` - Formulario de registro de casos

Puedes usarlo en cualquier otra página que necesite persistencia de datos.



