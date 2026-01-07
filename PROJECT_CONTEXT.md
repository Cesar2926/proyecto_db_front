# Contexto del Proyecto: Sistema de Gestión Clínica Jurídica

Este documento sirve como la fuente central de verdad para el contexto del proyecto, decisiones de arquitectura, estado actual y flujo de trabajo. Debe ser consultado y actualizado continuamente para mantener la coherencia en el desarrollo.

## 1. Visión General
El proyecto es un sistema de gestión para una Clínica Jurídica universitaria. Permite gestionar:
- **Usuarios**: Estudiantes, Profesores, Coordinadores.
- **Solicitantes**: Personas que requieren asistencia legal.
- **Casos**: Expedientes legales asignados a estudiantes y supervisados por profesores.
- **Encuestas**: Información socioeconómica de los solicitantes.

## 2. Stack Tecnológico

### Backend (`proyecto_db_backend`)
- **Framework**: Spring Boot (Java).
- **Persistencia**: Spring Data R2DBC (Programación Reactiva).
- **Base de Datos**: PostgreSQL.
- **Autenticación**: JWT / Spring Security.
- **Arquitectura**: Controladores REST, Servicios, Repositorios Reactivos.
- **DTOs**: `Request` y `Response` DTOs separados para desacoplar la API del modelo de datos.

### Frontend (`proyecto_db_front`)
- **Framework**: React + Vite + TypeScript.
- **Estilos**: Tailwind CSS (Sin frameworks de componentes pesados, diseño personalizado).
- **Estado Global**: `AuthContext` para manejo de sesión.
- **Iconos**: FontAwesome.

## 3. Estado Actual de Funcionalidades

### Gestión de Usuarios & Autenticación
- Login funcional con JWT.
- Roles diferenciados (Estudiante, Profesor, Coordinador).

### Gestión de Solicitantes (`/solicitantes`)
- **Listado**: Vista Dual (Grid de Tarjetas / Tabla Lista).
- **Búsqueda**: Por nombre o cédula.
- **Ordenamiento**: Por Nombre (A-Z, Z-A) y Cédula.
- **CRUD**:
    - Creación de nuevos solicitantes (Modal).
    - Edición de información personal.
    - Encuesta Socioeconómica (Modal independiente).
- **UI**: Estandarizada con componentes `Pagination`, `SearchBar`, `ViewToggle`, `Button`.

### Gestión de Casos (`/casos`)
- **Listado**: Vista Dual (Grid de Tarjetas / Tabla Lista).
- **Filtros**:
    - "Mis Casos" (Toggle para ver asignados vs. todos).
    - Por Estatus (Abierto, En Trámite, etc.).
    - Por Semestre.
    - Búsqueda de texto (filtra localmente en los resultados cargados).
- **Detalle de Caso (`/casos/:id`)**:
    - Header con información del Solicitante.
    - Historial de Acciones/Encuentros.
    - Lista de Beneficiarios (Hijos/Familiares).
    - Botones de acción estandarizados.

## 4. Sistema de Diseño y Componentes UI
Se ha establecido un set de componentes reutilizables en `src/components/common` para asegurar consistencia visual y reducir deuda técnica.

| Componente | Descripción | Ubicación |
|------------|-------------|-----------|
| **Button** | Botón estándar con variantes (Primary, Secondary, Outline, Ghost, Danger) y soporte de iconos. Altura fija `h-10`. | `Button.tsx` |
| **SearchBar** | Input de búsqueda con icono lupa y estilos focus. Altura fija `h-10`. | `SearchBar.tsx` |
| **ViewToggle** | Switch para cambiar entre vista Grid (Icono Th) y List (Icono List). Altura fija `h-10`. | `ViewToggle.tsx` |
| **Pagination** | Controles de paginación (Anterior, Números, Siguiente). | `Pagination.tsx` |
| **CustomSelect** | Dropdown personalizado para filtros y ordenamiento. Altura fija `h-10`. | `CustomSelect.tsx` |
| **CustomInput** | Input de texto estandarizado para formularios. | `CustomInput.tsx` |

**Reglas de Diseño:**
- **Altura de Controles**: Todos los inputs, selectores y botones de barra de herramientas tienen una altura de **40px (`h-10`)**.
- **Colores**:
    - Primario: Rojo Institucional (`bg-red-900`, `text-red-900`).
    - Fondos: Grises suaves (`bg-gray-50`, `bg-gray-100`).
    - Bordes Redondeados: `rounded-lg` o `rounded-md`.

## 5. Próximos Pasos (Hoja de Ruta Inmediata)
1.  **Refinamiento de CasoDetalle**: Asegurar que la vista de detalle use los componentes estandarizados si aplica.
2.  **Módulo de Reportes**: Desarrollo pendiente.
3.  **Seguridad**: Validación de permisos finos en botones (ej. solo Coordinadores pueden cerrar casos).

## 6. Convenciones de Flujo de Trabajo
- **Estandarización**: Ante cualquier nueva UI, verificar si existe un componente común antes de crear uno "ad-hoc".
- **Refactorización**: Si se detecta código repetido en vistas (como los botones o lógica de paginación), extraer a componente.
- **Linting**: Mantener el código libre de variables no usadas y warnings de TypeScript.

## 7. Estructura de Archivos y Entidades

### Estructura Frontend (`src/`)
```text
src/
├── assets/         # Imágenes y recursos estáticos
├── components/     
│   ├── common/     # Componentes base (Button, Pagination, SearchBar, etc.)
│   ├── forms/      # Formularios completos (SolicitanteForm, EncuestaForm)
│   ├── layout/     # Layouts principales (MainLayout, Sidebar)
│   └── ...         # Otros componentes (CaseCard, Header, etc.)
├── context/        # Contextos de React (AuthContext)
├── hooks/          # Hooks personalizados
├── pages/          # Vistas principales (Login, Solicitantes, Casos, CasoDetalle)
├── routes/         # Definición de rutas (AppRoutes, ProtectedRoute)
├── services/       # Comunicación con API (Axios, Servicios por entidad)
├── types/          # Definiciones de tipos TypeScript
└── utils/          # Utilidades generales
```

### Estructura Backend (`src/main/java/clinica_juridica/backend/`)
```text
backend/
├── config/         # Configuraciones de Seguridad, CORS, R2DBC
├── controller/     # Endpoints REST (AuthController, CasoController, etc.)
├── dto/            # Data Transfer Objects (Requests/Responses)
├── exception/      # Manejo de excepciones global
├── listener/       # Listeners de eventos de BD
├── models/         # Entidades persistentes (Tablas)
├── repository/     # Interfaces de Repositorios Reactivos (R2DBC)
├── security/       # Lógica JWT y Filtros de Seguridad
├── service/        # Lógica de Negocio
└── utils/          # Utilidades
```

### Entidades de Backend (`models`)
Lista de las principales entidades mapeadas a la base de datos:

**Núcleo del Caso:**
- `Caso`
- `Solicitante`
- `BeneficiarioCaso`
- `Accion`, `Encuentro`
- `AccionEjecutada`, `EncuentroAtendido`

**Usuarios y Roles:**
- `Usuario`
- `Estudiante`
- `Profesor`
- `Coordinador`
- `CasoAsignado` (Relación Estudiante-Caso)
- `CasoSupervisado` (Relación Profesor-Caso)

**Catálogos y Auxiliares:**
- `AmbitoLegal`, `CategoriaAmbitoLegal`, `SubcategoriaAmbitoLegal`
- `MateriaAmbitoLegal`
- `Estado`, `Municipio`, `Parroquia`
- `EstadoCivil`, `NivelEducativo`
- `Tribunal`, `Centro`
- `Semestre`
- `EstatusPorCaso`

**Socioeconómico:**
- `Familia`
- `Vivienda`, `CaracteristicaVivienda`, `CategoriaVivienda`
- `CondicionLaboral`, `CondicionActividad`
