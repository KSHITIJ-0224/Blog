// db/seed.ts
import { config } from 'dotenv';
config({ path: '.env.local' }); // ensure DATABASE_URL is available early [no code import before this]

import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import { eq } from 'drizzle-orm';

// create client AFTER env is loaded
const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client, { schema });

async function main() {
  console.log('Seeding started...');

  const defaultCategories = [
    { name: 'JavaScript', slug: 'javascript', description: 'JS tips and tutorials' },
    { name: 'Web Dev', slug: 'web-dev', description: 'Frontend and backend guides' },
    { name: 'Databases', slug: 'databases', description: 'SQL and ORM topics' },
  ];

  for (const c of defaultCategories) {
    const exists = await db.query.categories.findFirst({ where: eq(schema.categories.slug, c.slug) });
    if (!exists) await db.insert(schema.categories).values(c);
  }

  const demoEmail = 'demo@blog.local';
  const userExists = await db.query.users.findFirst({ where: eq(schema.users.email, demoEmail) });
  if (!userExists) {
    const hash = await bcrypt.hash('password123', 10);
    await db.insert(schema.users).values({
      name: 'Demo Author',
      email: demoEmail,
      password: hash,
      bio: 'Writes sample posts for the platform.',
    });
  }

  console.log('✅ Seed complete');
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
