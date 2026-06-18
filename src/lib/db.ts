import postgres from 'postgres';

let sql: postgres.Sql | null = null;

export function usePostgres() {
  const connectionString = process.env.NUXT_POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Missing NUXT_POSTGRES_URL or DATABASE_URL environment variable.');
  }

  if (!sql) {
    sql = postgres(connectionString, {
      ssl: 'require',
      max: 10, // Limit connections to avoid exhausting Supabase pool
      idle_timeout: 20, // Autoclose idle connections
      connect_timeout: 10,
    });
  }

  return sql;
}
