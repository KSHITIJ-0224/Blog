import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createSession, deleteSession } from '@/lib/session';
import { TRPCError } from '@trpc/server';

export const authRouter = router({
  register: publicProcedure
    .input(z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) }))
    .mutation(async ({ input }) => {
      const existing = await db.query.users.findFirst({ where: eq(users.email, input.email) });
      if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Email in use' });
      const hash = await bcrypt.hash(input.password, 10);
      const [u] = await db.insert(users).values({ name: input.name, email: input.email, password: hash }).returning();
      await createSession({ userId: u.id, email: u.email });
      return { id: u.id, name: u.name, email: u.email };
    }),
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input }) => {
      const u = await db.query.users.findFirst({ where: eq(users.email, input.email) });
      if (!u) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
      const ok = await bcrypt.compare(input.password, u.password);
      if (!ok) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
      await createSession({ userId: u.id, email: u.email });
      return { id: u.id, name: u.name, email: u.email };
    }),
  me: protectedProcedure.query(async ({ ctx }) => {
    return await db.query.users.findFirst({ where: eq(users.id, ctx.userId), columns: { password: false } });
  }),
  logout: protectedProcedure.mutation(async () => {
    await deleteSession();
    return { success: true };
  }),
});
