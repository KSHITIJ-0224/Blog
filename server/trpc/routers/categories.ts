// server/trpc/routers/categories.ts
import { router, publicProcedure } from '../trpc';
import { db } from '@/db';
export const categoriesRouter = router({
  list: publicProcedure.query(async () => db.query.categories.findMany()),
});
