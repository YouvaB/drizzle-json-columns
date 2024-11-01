import { asc, sql, desc } from "drizzle-orm";
import { format } from "sql-formatter";

import { drizzle } from "drizzle-orm/postgres-js";
import express from "express";
import bodyParser from "body-parser";
import { usersTable } from "./schema";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db = drizzle("postgresql://drizzle:drizzle@localhost:5533/drizzle_cols", {
  logger: {
    logQuery(query, params) {
      // On utilise sql-formatter pour formater et afficher la requête
      // SQL en mode debug
      console.log(
        "||||||||||||||||||||||||||\n",
        format(query, {
          params: [
            "",
            ...params.map((s) =>
              typeof s === "string" ? `'${s.replaceAll("'", "''")}'` : String(s)
            ),
          ],
          language: "postgresql",
        }),
        "\n||||||||||||||||||||||||||\n"
      );
    },
  },
});

app.listen(3000, () => {
  console.log("Server listening on port 3000.\n");
});

app.post("/user", async (req, res) => {
  const insertedvalue = await db.insert(usersTable).values({
    ...req.body,
  });
  res.send(insertedvalue);
});

app.get("/user", async (req, res) => {
  try {
    const preparedRequest = db
      .select()
      .from(usersTable)
      .where(
        sql`"users"."name"->>'firstName' like ${sql.placeholder("firstName")}`
      )
      .orderBy(
        (req.query.orderBy === "asc" ? asc : desc)(
          sql`"users"."name"->>'firstName'`
        )
      )
      .prepare("p1");
    const users = await preparedRequest.execute({
      firstName: `%${req.query.firstName}%`,
      orderBy: req.query.orderBy,
    });

    res.send(users);
  } catch (error) {
    console.error(error);
    res.send(error);
  }
});
