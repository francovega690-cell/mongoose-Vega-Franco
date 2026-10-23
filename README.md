# Práctica de MongoDB y Mongoose

API REST hecha con **Express**, **MongoDB + Mongoose** y **express-validator**. Implementa cuatro colecciones con una propiedad embebida y relaciones 1:1, 1:N y N:M, con CRUD completo, eliminación lógica y en cascada, y validación de todos los datos de entrada.

**Alumno:** Franco Vega

---

## Instalación y ejecución

1. Clonar el repositorio e instalar las dependencias:

   ```bash
   npm install
   ```

2. Crear un archivo `.env` en la raíz tomando como base `.env.example`:

   ```env
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/mongoose_vega_franco
   ```

3. Iniciar el servidor (con MongoDB encendido):

   ```bash
   npm run dev     # se reinicia solo al guardar cambios
   npm start       # modo normal
   ```

Si MongoDB no está disponible, la aplicación muestra el error y no arranca.

---

## Estructura del proyecto

```
app.js                         → servidor Express y montaje de rutas
src/
├── config/database.js         → conexión a MongoDB
├── models/                    → esquemas de Mongoose
├── controllers/               → lógica del CRUD (todos con try/catch)
├── routes/                    → definición de endpoints
└── middlewares/
    ├── validator.js           → middleware reutilizable con validationResult()
    └── validations/           → reglas de express-validator por colección
```

---

## Colecciones y relaciones

| Colección | Campos principales | Relación |
|---|---|---|
| **Usuario** | nombre, email, `direccion` { calle, ciudad, postal }, esActivo | `direccion` es una **propiedad embebida** |
| **Perfil** | `usuario`, biografia, telefono, fechaNacimiento, esActivo | **1:1** con Usuario |
| **Publicacion** | titulo, contenido, `autor`, `etiquetas`, esActivo | **1:N** con Usuario y **N:M** con Etiqueta |
| **Etiqueta** | nombre, descripcion, esActivo | **N:M** con Publicacion |

### Justificación: ¿embebido o referenciado?

**Dirección del usuario → embebido**

La dirección pertenece a un solo usuario, no tiene sentido por sí sola, siempre se consulta junto con él y no se comparte con otros documentos. Embeberla permite traer todos los datos del usuario en una sola consulta, sin crear una colección extra ni hacer `populate`. Se definió como un sub-schema con `{ _id: false }` porque no necesita un id propio.

```js
direccion: { type: direccionSchema, required: true }
```

**Perfil ↔ Usuario (1:1) → referenciado**

El perfil se gestiona por separado: se crea, edita y elimina con sus propios endpoints, y no siempre se necesita al consultar un usuario. Por eso es una colección aparte. La referencia se guarda en `Perfil.usuario` con `unique: true`, lo que garantiza que un usuario tenga un único perfil. Se guarda del lado del perfil porque el usuario existe primero y el perfil se crea después apuntando a él.

```js
usuario: { type: Schema.Types.ObjectId, ref: "Usuario", required: true, unique: true }
```

**Usuario → Publicaciones (1:N) → referenciado**

Un usuario puede tener una cantidad ilimitada de publicaciones. Embeberlas haría crecer el documento del usuario sin límite (MongoDB permite como máximo 16 MB por documento), y las publicaciones se consultan y modifican por su cuenta. La referencia se guarda en el lado de "muchos" (`Publicacion.autor`), así ningún documento tiene un arreglo que crezca indefinidamente.

```js
autor: { type: Schema.Types.ObjectId, ref: "Usuario", required: true }
```

**Publicaciones ↔ Etiquetas (N:M) → referenciado**

Una etiqueta se comparte entre muchas publicaciones. Si se embebiera, habría que duplicarla en cada publicación, y cambiar su nombre obligaría a actualizar todas las copias. Con referencias, la etiqueta existe una sola vez y las publicaciones guardan un arreglo con sus ids. El arreglo se guarda en un solo lado (en Publicacion), porque una publicación tiene pocas etiquetas y así hay que mantener un único lugar; desde Etiqueta se llega a las publicaciones con un populate virtual.

```js
etiquetas: {
  type: [{ type: Schema.Types.ObjectId, ref: "Etiqueta" }],
  default: undefined, // si no se envían etiquetas, el campo no se guarda como []
}
```

---

## Investigación

### 1. Populate desde las colecciones que no tienen referencias

`populate()` normalmente se usa desde el documento que **guarda** la referencia. Por ejemplo, una publicación tiene `autor`, entonces `Publicacion.find().populate("autor")` trae los datos del usuario.

El problema aparece en el sentido contrario: **Usuario no guarda** ni su perfil ni sus publicaciones, y **Etiqueta no guarda** sus publicaciones. Para resolverlo se usa un **populate virtual**: un campo que no se guarda en la base, sino que le indica a Mongoose cómo buscar los documentos relacionados.

```js
// usuario.model.js
usuarioSchema.virtual("perfil", {
  ref: "Perfil",          // colección donde buscar
  localField: "_id",      // campo de este documento...
  foreignField: "usuario", // ...que tiene que coincidir con este campo del otro
  justOne: true,          // 1:1 → devuelve un objeto y no un arreglo
});

usuarioSchema.virtual("publicaciones", {
  ref: "Publicacion",
  localField: "_id",
  foreignField: "autor",
});

// etiqueta.model.js: funciona también con arreglos (N:M)
etiquetaSchema.virtual("publicaciones", {
  ref: "Publicacion",
  localField: "_id",
  foreignField: "etiquetas",
});
```

Para que los virtuals aparezcan en la respuesta JSON, el schema necesita la opción `toJSON: { virtuals: true }`. Después se usan como cualquier populate:

```js
Usuario.findById(id)
  .populate({ path: "perfil", match: { esActivo: true } })
  .populate({ path: "publicaciones", match: { esActivo: true } });
```

El `match` filtra los documentos relacionados para no mostrar los que fueron eliminados lógicamente.

### 2. Eliminaciones lógicas y en cascada

**Eliminación lógica:** el documento no se borra; se marca como inactivo con el campo `esActivo: false`. Todas las consultas filtran por `esActivo: true`, así que para la API el documento deja de existir, pero los datos se conservan y se pueden recuperar.

```js
await Usuario.findOneAndUpdate({ _id: id, esActivo: true }, { esActivo: false });
```

**Eliminación en cascada:** al eliminar un documento también se eliminan, o se actualizan, los documentos que dependen de él, para que no queden referencias a algo que ya no existe. MongoDB no lo hace automáticamente como una base relacional, así que se programa en el controlador.

| Se elimina | Lógica (`DELETE /:id`) | Física (`DELETE /:id/definitivo`) |
|---|---|---|
| **Usuario** | Desactiva el usuario, su perfil y sus publicaciones | Borra el usuario, su perfil y sus publicaciones |
| **Etiqueta** | Desactiva la etiqueta (el `match` del populate la oculta en las publicaciones) | Borra la etiqueta y la quita del arreglo de todas las publicaciones con `$pull` |
| **Perfil / Publicacion** | Se desactiva (no tienen documentos que dependan de ellos) | Se borra |

```js
// Usuario: cascada física
await Usuario.findByIdAndDelete(id);
await Perfil.deleteOne({ usuario: id });
await Publicacion.deleteMany({ autor: id });

// Etiqueta: se quita la referencia de las publicaciones
await Etiqueta.findByIdAndDelete(id);
await Publicacion.updateMany({ etiquetas: id }, { $pull: { etiquetas: id } });
```

### 3. Endpoint para agregar un vínculo en una relación N:M

```
POST /api/publicaciones/:id/etiquetas/:etiquetaId
```

Recibe los dos ids por parámetro y agrega el id de la etiqueta al arreglo de la publicación con **`$addToSet`**, que solo agrega el valor si no está en el arreglo (y crea el arreglo si todavía no existe).

```js
await Publicacion.findByIdAndUpdate(
  id,
  { $addToSet: { etiquetas: etiquetaId } },
  { returnDocument: "after" },
).populate("etiquetas", "nombre");
```

Antes de llegar al controlador, express-validator comprueba:

- que los dos ids sean ObjectId válidos (`isMongoId()`);
- que la **publicación exista** (`custom()`);
- que la **etiqueta exista** (`custom()`);
- que el **vínculo no esté duplicado**, es decir, que la publicación no tenga ya esa etiqueta (`custom()`). Si lo tiene, responde 400 con el mensaje "La publicación ya tiene esa etiqueta".

---

## Validaciones

- Las reglas están en `src/middlewares/validations/` y se aplican en todas las rutas de creación y actualización.
- El middleware `validar` (`src/middlewares/validator.js`) usa `validationResult()` y, si hay errores, responde **400** con la lista.
- Los controladores usan `matchedData()`, así que solo trabajan con los campos validados. Cualquier campo extra (por ejemplo, `esActivo` o `autor` en una actualización) se ignora.
- Qué se valida:
  - **Campos obligatorios, tipos y longitudes** en cada colección.
  - **Propiedad embebida:** `direccion.calle`, `direccion.ciudad` y `direccion.postal`. Al actualizar, si se envía la dirección tiene que venir completa.
  - **IDs por parámetro:** `param("id").isMongoId()` en todas las rutas con `:id`.
  - **IDs en el body (referencias):** `usuario`, `autor` y `etiquetas.*` tienen que ser ObjectId válidos y existir (`custom()`).
  - **Duplicados (`custom()`):** email de usuario, nombre de etiqueta, un segundo perfil para el mismo usuario, etiquetas repetidas en el arreglo y vínculo N:M repetido.
  - **Arreglo de etiquetas:** es opcional, pero si se envía debe tener al menos un elemento (`isArray({ min: 1 })`).

---

## Endpoints

Cada colección tiene los mismos seis endpoints:

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/{coleccion}` | Crear |
| GET | `/api/{coleccion}` | Listar los activos (con populate) |
| GET | `/api/{coleccion}/:id` | Obtener uno (con populate) |
| PUT | `/api/{coleccion}/:id` | Actualizar |
| DELETE | `/api/{coleccion}/:id` | Eliminación lógica |
| DELETE | `/api/{coleccion}/:id/definitivo` | Eliminación física (en cascada donde corresponde) |

Colecciones: `usuarios`, `perfiles`, `publicaciones`, `etiquetas`.

Endpoint extra de la relación N:M:

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/publicaciones/:id/etiquetas/:etiquetaId` | Agrega una etiqueta a una publicación |

### Ejemplos de body

```jsonc
// POST /api/usuarios
{
  "nombre": "Franco Vega",
  "email": "franco@mail.com",
  "direccion": { "calle": "Av. 25 de Mayo 100", "ciudad": "Formosa", "postal": "3600" }
}

// POST /api/perfiles
{ "usuario": "<id del usuario>", "biografia": "Estudiante", "telefono": "+54 370 4123456", "fechaNacimiento": "2002-05-10" }

// POST /api/etiquetas
{ "nombre": "node", "descripcion": "Runtime de JavaScript" }

// POST /api/publicaciones
{ "titulo": "Mi primer post", "contenido": "Contenido del post", "autor": "<id del usuario>", "etiquetas": ["<id de etiqueta>"] }
```

### Códigos de respuesta

| Código | Cuándo |
|---|---|
| 201 Created | Creación exitosa |
| 200 OK | Consultas, actualizaciones y eliminaciones exitosas |
| 400 Bad Request | Errores de validación |
| 404 Not Found | El id es válido pero el documento no existe o está eliminado |
| 500 Internal Server Error | Errores inesperados (capturados en el `catch` de cada controlador) |
