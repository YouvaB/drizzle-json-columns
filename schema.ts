import { pgTable, integer, varchar, jsonb } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: jsonb("name")
    .$type<{ firstName: string; lastName: string }>()
    .notNull(),
});
