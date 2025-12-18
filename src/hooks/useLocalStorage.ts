import { useState, useEffect, useCallback } from 'react';

interface StoredData<T> {
  data: T;
  timestamp: number;
}

interface UseLocalStorageOptions {
  expirationTimeMs?: number; // Tiempo de expiración en milisegundos
  autoSave?: boolean; // Si se guarda automáticamente al cambiar los datos
}

/**
 * Hook personalizado para manejar el guardado y carga de datos en localStorage
 * con soporte para expiración automática.
 * 
 * @param key - Clave única para identificar los datos en localStorage
 * @param initialValue - Valor inicial si no hay datos guardados
 * @param options - Opciones de configuración (expiración, auto-guardado)
 * 
 * @returns [storedValue, setValue, clearValue] - Estado, setter y función de limpieza
 * 
 * @example
 * ```tsx
 * const [formData, setFormData, clearFormData] = useLocalStorage(
 *   'miFormulario',
 *   { nombre: '', email: '' },
 *   { expirationTimeMs: 7 * 24 * 60 * 60 * 1000 } // 7 días
 * );
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const {
    expirationTimeMs = 7 * 24 * 60 * 60 * 1000, // Por defecto: 7 días
    autoSave = true, // Por defecto: guardado automático
  } = options;

  // Función para cargar datos desde localStorage
  const loadStoredValue = useCallback((): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed: StoredData<T> = JSON.parse(item);
        
        // Verificar expiración
        if (expirationTimeMs !== Infinity && parsed.timestamp) {
          const isExpired = Date.now() - parsed.timestamp >= expirationTimeMs;
          if (isExpired) {
            // Si expiró, limpiar y retornar null
            localStorage.removeItem(key);
            return null;
          }
        }
        
        return parsed.data;
      }
    } catch (error) {
      console.error(`Error al cargar datos de localStorage (${key}):`, error);
    }
    return null;
  }, [key, expirationTimeMs]);

  // Inicializar estado con datos guardados o valor inicial
  const [storedValue, setStoredValue] = useState<T>(() => {
    const saved = loadStoredValue();
    return saved !== null ? saved : initialValue;
  });

  // Función para guardar datos en localStorage
  const saveToStorage = useCallback(
    (value: T) => {
      try {
        const toStore: StoredData<T> = {
          data: value,
          timestamp: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(toStore));
      } catch (error) {
        console.error(`Error al guardar datos en localStorage (${key}):`, error);
      }
    },
    [key]
  );

  // Función para limpiar datos de localStorage
  const clearValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error al limpiar datos de localStorage (${key}):`, error);
    }
  }, [key, initialValue]);

  // Función setter mejorada que también guarda en localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Permitir función como setState de React
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Actualizar estado
        setStoredValue(valueToStore);
        
        // Guardar en localStorage si autoSave está activado
        if (autoSave) {
          // Solo guardar si hay datos (no guardar objetos/arrays vacíos)
          const hasData = checkIfHasData(valueToStore);
          if (hasData) {
            saveToStorage(valueToStore);
          }
        }
      } catch (error) {
        console.error(`Error al actualizar valor (${key}):`, error);
      }
    },
    [key, storedValue, autoSave, saveToStorage]
  );

  // Guardar automáticamente cuando cambie storedValue (si autoSave está activado)
  useEffect(() => {
    if (autoSave) {
      const hasData = checkIfHasData(storedValue);
      if (hasData) {
        saveToStorage(storedValue);
      }
    }
  }, [storedValue, autoSave, saveToStorage]);

  return [storedValue, setValue, clearValue];
}

/**
 * Función auxiliar para verificar si un valor tiene datos significativos
 * (no está vacío, no es null, no es undefined, etc.)
 */
function checkIfHasData<T>(value: T): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  // Para objetos
  if (typeof value === 'object' && !Array.isArray(value)) {
    return Object.values(value).some(
      (val) => val !== '' && val !== false && val !== null && val !== undefined
    );
  }

  // Para arrays
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  // Para strings
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  // Para números, booleanos, etc.
  return true;
}



