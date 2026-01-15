# Agentes del Sistema (System Agents)

Este documento define los actores y roles (agentes) que interactúan con el Sistema de Gestión Clínica Jurídica, detallando sus responsabilidades, permisos y flujo de trabajo.

## 1. Actores Internos (Usuarios del Sistema)

### 👨‍💼 Coordinador (Admin)
**Rol Principal:** Administrador general y supervisor de la operativa de la clínica.
**Alcance:** Global.

**Responsabilidades:**
- Supervisión de todos los casos y usuarios registrados.
- Gestión de permisos y asignación de roles.
- Validación final de cierre de casos.
- Generación y análisis de reportes estadísticos.

**Permisos Clave:**
- `CREAR`/`EDITAR` cualquier entidad (Usuario, Caso, Solicitante).
- `CERRAR` casos (Acción exclusiva).
- Acceso a todas las vistas del sistema.

---

### 👨‍🏫 Profesor (Supervisor)
**Rol Principal:** Supervisor académico y legal.
**Alcance:** Casos Supervisados.

**Responsabilidades:**
- Supervisar el desempeño de los estudiantes en los casos asignados.
- Aprobar estrategias legales propuestas por estudiantes.
- Revisar bitácoras de acciones y encuentros.

**Permisos Clave:**
- `VER` todos los casos (o solo asignados, según configuración).
- `EDITAR` detalles del caso bajo su supervisión.
- `EVALUAR` acciones de estudiantes (si aplica).
- *Restricción:* No puede cerrar casos sin validación del coordinador (por definir).

---

### 👨‍🎓 Estudiante (Operador)
**Rol Principal:** Gestor directo del caso y atención al cliente.
**Alcance:** Casos Asignados ("Mis Casos").

**Responsabilidades:**
- Atención directa a los solicitantes.
- Registro de nuevos solicitantes y casos.
- Llenado de encuestas socioeconómicas.
- Registro detallado de acciones (`Accion`) y encuentros (`Encuentro`).

**Permisos Clave:**
- `CREAR` Solicitantes y Casos.
- `VER` y `EDITAR` solo los casos asignados a él (`CasoAsignado`).
- `REGISTRAR` bitácora en sus casos.
- *Restricción:* No puede eliminar casos ni cerrarlos definitivamente.

## 2. Actores Externos (Beneficiarios)

### 👤 Solicitante
**Descripción:** Persona natural que acude a la clínica en busca de asistencia jurídica.
**Interacción:**
- Proveedor de información para el expediente y la encuesta socioeconómica.
- Receptor de la asistencia legal.
- No tiene acceso directo al sistema (interactúa a través del Estudiante/Coordinador).

### 👥 Beneficiario Relacionado
**Descripción:** Familiar o dependiente del solicitante (e.g., hijos en casos de manutención).
**Interacción:**
- Registrado como parte del expediente del caso (`BeneficiarioCaso`).

## 3. Matriz de Interacción

| Interacción | Coordinador | Profesor | Estudiante |
|-------------|:-----------:|:--------:|:----------:|
| **Acceso al Sistema** | ✅ Sí | ✅ Sí | ✅ Sí |
| **Ver Todos los Casos** | ✅ Sí | ⚠️ Supervisados | ❌ "Mis Casos" |
| **Crear Caso** | ✅ Sí | ✅ Sí | ✅ Sí |
| **Asignar Estudiante**| ✅ Sí | ✅ Sí | ❌ No |
| **Cerrar Caso** | ✅ Sí | ❌ No | ❌ No |
| **Ver Reportes** | ✅ Globales | ⚠️ Parciales | ❌ No |

## 4. Definiciones Técnicas de Agentes
En el backend (`PROYECTO_DB_BACKEND`), estos agentes se mapean a la entidad `Usuario` con un `Rol` específico:
- `ROLE_COORDINADOR`
- `ROLE_PROFESOR`
- `ROLE_ESTUDIANTE`

La autenticación se maneja vía JWT y las autorizaciones mediante anotaciones en el controlador (e.g., `@PreAuthorize("hasRole('COORDINADOR')")`).
