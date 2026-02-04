# GID por provincia (mapa Planes de Respuesta)

Estos son los **GID** que usa el GeoJSON del mapa (`argentina.js`). Cada **Provincia** en el admin debe tener el campo **gid** con el valor indicado para que el mapa muestre correctamente la información y el color según el Plan.

| GID | Provincia |
|-----|------------|
| 1 | Ciudad Autónoma de Buenos Aires |
| 2 | Neuquén |
| 3 | San Luis |
| 4 | Santa Fe |
| 5 | La Rioja |
| 6 | Catamarca |
| 7 | Tucumán |
| 8 | Chaco |
| 9 | Formosa |
| 10 | Santa Cruz |
| 11 | Chubut |
| 12 | Mendoza |
| 13 | Entre Ríos |
| 14 | San Juan |
| 15 | Jujuy |
| 16 | Santiago del Estero |
| 17 | Río Negro |
| 18 | Corrientes |
| 19 | Misiones |
| 20 | Salta |
| 21 | Córdoba |
| 22 | Buenos Aires |
| 23 | La Pampa |
| 24 | Tierra del Fuego, Antártida e Islas del Atlántico Sur |

## Uso en el admin

1. Ir a **Provincias** en el panel de administración.
2. Para cada provincia, completar el campo **gid** con el número de la tabla (1 a 24).
3. Al crear o editar un **Plan**, asociarlo a la provincia correspondiente.
4. El mapa tomará el estado (color) y los textos del Plan según el **gid** de la provincia.

**Nota:** CABA en el mapa usa gid **1**. Si en tu base la provincia “Ciudad Autónoma de Buenos Aires” tiene otro gid (por ejemplo 6), la vista duplica sus datos bajo la clave 1 para que el mapa funcione igual que el resto.
