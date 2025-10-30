import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { db } from '@/db';
import { posts, postCategories, categories } from '@/db/schema';
import { desc, eq, and, inArray } from 'drizzle-orm';

export const postsRouter = router({
  list: publicProcedure.query(async () => {
    const allPosts = await db.query.posts.findMany({
      where: (p, { eq }) => eq(p.published, true),
      orderBy: [desc(posts.publishedAt)],
      limit: 20,
      with: {
        author: {
          columns: { id: true, name: true, avatar: true },
        },
      },
    });

    const postsWithCategories = await Promise.all(
      allPosts.map(async (post) => {
        const postCats = await db.query.postCategories.findMany({
          where: (pc, { eq }) => eq(pc.postId, post.id),
          with: { category: true },
        });

        return {
          ...post,
          authorName: post.author.name,
          categories: postCats.map((pc) => pc.category),
        };
      })
    );

    return postsWithCategories;
  }),

  search: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      return await db.query.posts.findMany({
        where: (p, { and, or, like, eq }) =>
          and(
            eq(p.published, true),
            or(
              like(p.title, `%${input.query}%`),
              like(p.content, `%${input.query}%`)
            )
          ),
        orderBy: [desc(posts.publishedAt)],
        limit: 20,
      });
    }),

  listByCategory: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const category = await db.query.categories.findFirst({
        where: (c, { eq }) => eq(c.slug, input.slug),
      });
      if (!category) return [];

      const postCats = await db.query.postCategories.findMany({
        where: (pc, { eq }) => eq(pc.categoryId, category.id),
      });
      const postIds = postCats.map((pc) => pc.postId);
      if (postIds.length === 0) return [];

      const categoryPosts = await db.query.posts.findMany({
        where: (p, { eq, and, inArray }) =>
          and(eq(p.published, true), inArray(p.id, postIds)),
        orderBy: [desc(posts.publishedAt)],
        limit: 20,
        with: {
          author: {
            columns: { id: true, name: true, avatar: true },
          },
        },
      });

      const postsWithCategories = await Promise.all(
        categoryPosts.map(async (post) => {
          const postCats = await db.query.postCategories.findMany({
            where: (pc, { eq }) => eq(pc.postId, post.id),
            with: { category: true },
          });

          return {
            ...post,
            authorName: post.author.name,
            categories: postCats.map((pc) => pc.category),
          };
        })
      );

      return postsWithCategories;
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const post = await db.query.posts.findFirst({
        where: (p, { eq }) => eq(p.slug, input.slug),
        with: {
          author: {
            columns: { id: true, name: true, avatar: true, bio: true },
          },
        },
      });
      if (!post) throw new Error(`Post not found. Slug: ${input.slug}`);

      const postCats = await db.query.postCategories.findMany({
        where: (pc, { eq }) => eq(pc.postId, post.id),
        with: { category: true },
      });

      return {
        ...post,
        authorName: post.author.name,
        categories: postCats.map((pc) => pc.category),
      };
    }),

  myPosts: protectedProcedure.query(async ({ ctx }) => {
    const userPosts = await db.query.posts.findMany({
      where: (p, { eq }) => eq(p.authorId, ctx.userId),
      orderBy: [desc(posts.createdAt)],
    });
    return userPosts;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const post = await db.query.posts.findFirst({
        where: (p, { eq }) => eq(p.id, input.id),
      });
      if (!post) throw new Error(`Post with ID ${input.id} not found`);
      if (post.authorId !== ctx.userId)
        throw new Error('Unauthorized: You can only edit your own posts');

      const postCats = await db.query.postCategories.findMany({
        where: (pc, { eq }) => eq(pc.postId, post.id),
        with: { category: true },
      });

      return {
        ...post,
        categories: postCats.map((pc) => pc.category),
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, 'Title is required'),
        slug: z.string().min(1, 'Slug is required'),
        content: z.string().min(1, 'Content is required'),
        excerpt: z.string().optional(),
        // coverImage field removed
        published: z.boolean().default(false),
        categoryIds: z.array(z.number()).default([]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [p] = await db
        .insert(posts)
        .values({
          title: input.title,
          slug: input.slug,
          content: input.content,
          excerpt: input.excerpt || null,
          // coverImage omitted here
          published: input.published,
          authorId: ctx.userId,
          publishedAt: input.published ? new Date() : null,
        })
        .returning();

      if (input.categoryIds.length) {
        await db.insert(postCategories).values(
          input.categoryIds.map((id) => ({
            postId: p.id,
            categoryId: id,
          }))
        );
      }
      return p;
    }),

  togglePublish: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const post = await db.query.posts.findFirst({
        where: (p, { eq }) => eq(p.id, input.id),
      });
      if (!post) throw new Error('Post not found');
      if (post.authorId !== ctx.userId)
        throw new Error('Unauthorized: You can only update your own posts');

      const newPublishedStatus = !post.published;
      const [updatedPost] = await db
        .update(posts)
        .set({
          published: newPublishedStatus,
          publishedAt: newPublishedStatus ? new Date() : null,
        })
        .where(eq(posts.id, input.id))
        .returning();

      return updatedPost;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        excerpt: z.string().optional(),
        // coverImage removed here
        published: z.boolean().optional(),
        categoryIds: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, categoryIds, ...updateData } = input;
      const existingPost = await db.query.posts.findFirst({
        where: (p, { eq }) => eq(p.id, id),
      });
      if (!existingPost) throw new Error('Post not found');
      if (existingPost.authorId !== ctx.userId)
        throw new Error('Unauthorized: You can only edit your own posts');

      const dataToUpdate: any = { ...updateData };
      if (updateData.published === true && !existingPost.publishedAt) {
        dataToUpdate.publishedAt = new Date();
      }

      const [updatedPost] = await db
        .update(posts)
        .set(dataToUpdate)
        .where(eq(posts.id, id))
        .returning();

      if (categoryIds !== undefined) {
        await db.delete(postCategories).where(eq(postCategories.postId, id));
        if (categoryIds.length > 0) {
          await db.insert(postCategories).values(
            categoryIds.map((categoryId) => ({
              postId: id,
              categoryId,
            }))
          );
        }
      }

      return updatedPost;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const post = await db.query.posts.findFirst({
        where: (p, { eq }) => eq(p.id, input.id),
      });
      if (!post) throw new Error('Post not found');
      if (post.authorId !== ctx.userId)
        throw new Error('Unauthorized: You can only delete your own posts');

      await db.delete(postCategories).where(eq(postCategories.postId, input.id));
      await db.delete(posts).where(eq(posts.id, input.id));

      return { success: true, message: 'Post deleted successfully' };
    }),
});
