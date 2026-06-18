import { usePostgres } from '../db';

export const getConfiguracion = async () => {
  const sql = usePostgres();

  // Auto-migration: Create table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS "Configuracion" (
      id SERIAL PRIMARY KEY,
      nombre_pizzeria TEXT DEFAULT 'Pizzería OyJ',
      logo_url TEXT DEFAULT 'https://via.placeholder.com/96',
      theme_flavor TEXT DEFAULT 'mocha',
      custom_colors JSONB DEFAULT '{}',
      custom_colors_light JSONB DEFAULT '{}',
      custom_colors_dark JSONB DEFAULT '{}'
    )
  `;

  // Ensure new columns exist
  await sql`ALTER TABLE "Configuracion" ADD COLUMN IF NOT EXISTS custom_colors JSONB DEFAULT '{}'`;
  await sql`ALTER TABLE "Configuracion" ADD COLUMN IF NOT EXISTS custom_colors_light JSONB DEFAULT '{}'`;
  await sql`ALTER TABLE "Configuracion" ADD COLUMN IF NOT EXISTS custom_colors_dark JSONB DEFAULT '{}'`;

  // Get first record or insert default
  const config = await sql`SELECT * FROM "Configuracion" LIMIT 1`;

  if (config.length === 0) {
    const insertDefault = await sql`
      INSERT INTO "Configuracion" (nombre_pizzeria, logo_url, theme_flavor, custom_colors)
      VALUES ('Pizzería OyJ', 'https://via.placeholder.com/96', 'mocha', '{}')
      RETURNING *
    `;
    return insertDefault[0];
  }

  return config[0];
};

export const updateConfiguracion = async (config: {
  nombre_pizzeria: string;
  logo_url: string;
  theme_flavor: string;
  custom_colors: any;
}) => {
  const { nombre_pizzeria, logo_url, theme_flavor, custom_colors } = config;
  const sql = usePostgres();

  const result = await sql`
    UPDATE "Configuracion"
    SET 
      nombre_pizzeria = ${nombre_pizzeria},
      logo_url = ${logo_url},
      theme_flavor = ${theme_flavor},
      custom_colors = ${custom_colors || {}}
    WHERE id = (SELECT id FROM "Configuracion" LIMIT 1)
    RETURNING *
  `;

  return result[0];
};
