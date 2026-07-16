# Prácticas Área 1 con Firebase

Sitio estático para que alumnos entren con Gmail, resuelvan prácticas y envíen respuestas a Firestore.

## Archivos

- `index.html`: estructura de la app.
- `styles.css`: diseño visual.
- `app.js`: autenticación con Google, borradores locales y envíos a Firestore.
- `firestore.rules`: reglas sugeridas para proteger entregas.
- `MAPA_CURSO.md`: criterio de organización por unidades a partir del programa y Classroom.

## Configuración necesaria en Firebase

1. En Authentication, habilitar proveedor Google.
2. En Firestore Database, crear la base de datos.
3. Publicar las reglas de `firestore.rules`.
4. Usar `practicas.simon1@gmail.com` como correo de profesor para ver entregas.

Colección usada:

- `submissions`

Cada documento se guarda con el id:

```text
{uidAlumno}_{idActividad}
```

## Organización actual

La app está organizada por unidades:

- Unidad 0: Propedéutico y herramientas base.
- Unidad 1: Programación y procesamiento de datos.
- Unidad 2: Simulación, videojuegos e interfaces gráficas.
- Unidad 3: Automatización, control y Arduino.
- Unidad 4: Aplicaciones, bitácoras y bases de datos.

Las prácticas se declararon en `app.js` dentro del arreglo `activities`.
