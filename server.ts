import { sql } from "drizzle-orm";
import { integer, pgTable, varchar, jsonb } from "drizzle-orm/pg-core";
import { format } from "sql-formatter";


const { drizzle } = require('drizzle-orm/postgres-js');
const express = require('express');
const bodyParser = require('body-parser');

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: jsonb('name').$type<{firstName: string, lastName: string}>().notNull(),
  });

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

const db = drizzle('postgresql://drizzle:drizzle@localhost:5533/drizzle_cols', {
    logger: {
        logQuery(query, params) {
          // On utilise sql-formatter pour formater et afficher la requête
          // SQL en mode debug
            console.log(
              format(query, {
                params: [
                  '',
                  ...params.map((s) =>
                    typeof s === 'string'
                      ? `'${s.replaceAll("'", "''")}'`
                      : String(s),
                  ),
                ],
                language: 'postgresql',
              }),
            );
        },
      },
});

app.listen(3000, () => {
    console.log('Server listening on port 3000.\n');
});

app.post('/user', async (req, res)=> {
    const insertedvalue = await db.insert(usersTable).values({
        ...req.body
    })
    res.send(insertedvalue)
})

app.get('/user', async (req, res)=> {
    const query = req.query;
    console.log(query);
    const users = await db.select().from(usersTable).where(sql`name::jsonb->>'firstName' like '%${query.firstName}%'`)

    res.send(users);
})