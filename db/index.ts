// Make sure to install the 'postgres' package
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
// console.log("DATABASE_URL:", process.env.DATABASE_URL);
const queryClient = postgres(process.env.DATABASE_URL!);
const db = drizzle({
  client: queryClient,
  logger: true,
});

// const result = await db.execute("SELECT NOW()");
// console.log(result);
export { db };
