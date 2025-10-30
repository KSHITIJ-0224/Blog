// server/trpc/root.ts
import { router } from './trpc';
import { authRouter } from './routers/auth';
import { postsRouter } from './routers/posts';
import { categoriesRouter } from './routers/categories';
export const appRouter = router({ auth: authRouter, posts: postsRouter, categories: categoriesRouter });
export type AppRouter = typeof appRouter;
