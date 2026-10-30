# serie.log

Aplicación web en español para administrar series, plataformas y valoraciones con almacenamiento persistente en Neon PostgreSQL. Está construida con Next.js y preparada para desplegarse en Vercel.

## Desarrollo local

1. Instala Node.js 18.18 o superior (se recomienda Node.js 22).
2. Instala dependencias con `npm install`.
3. Crea una base de datos PostgreSQL en [Neon](https://neon.tech/) y copia su cadena de conexión.
4. Copia `.env.example` a `.env.local` y asigna la URL real a `DATABASE_URL`.
5. Ejecuta el contenido de `db/schema.sql` en el SQL Editor de Neon para crear las tablas.
6. Inicia el proyecto con `npm run dev`.

La aplicación estará disponible en `http://localhost:3000`.

## Despliegue en Vercel

1. Importa este repositorio en Vercel.
2. Agrega `DATABASE_URL` en **Settings → Environment Variables** usando la cadena de conexión de Neon.
3. Ejecuta una vez `db/schema.sql` en el SQL Editor de Neon.
4. Despliega el proyecto. Vercel detectará Next.js automáticamente.

La tabla de valoraciones exige que la serie elegida pertenezca a la plataforma seleccionada. El puntaje permitido va de 1 a 10. Una plataforma con series asociadas no se puede eliminar; al eliminar una serie, sus valoraciones también se eliminan.
