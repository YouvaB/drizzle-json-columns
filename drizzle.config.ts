import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: 'schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: "postgresql://drizzle:drizzle@localhost:5533/drizzle_cols",
  },
});