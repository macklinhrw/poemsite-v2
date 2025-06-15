import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const poemRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.poem.findMany({ orderBy: { createdAt: "desc" } });
  }),
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.poem.findFirst({ where: { slug: input.slug } });
    }),
  getNext: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.poem.findFirst({ where: { id: { gt: input.id } } });
    }),
  getPrev: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.poem.findFirst({
        where: { id: { lt: input.id } },
        orderBy: { id: "desc" },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        hasTitle: z.boolean().optional().default(true),
        isDraft: z.boolean().optional().default(false),
        imageLink: z.string().optional().default(""),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate slug from title
      const slug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .trim() // Remove leading/trailing spaces
        .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

      // Ensure slug is unique by appending a number if needed
      let uniqueSlug = slug;
      let counter = 1;

      while (await ctx.prisma.poem.findFirst({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      return await ctx.prisma.poem.create({
        data: {
          title: input.title,
          slug: uniqueSlug,
          content: input.content,
          hasTitle: input.hasTitle,
          isDraft: input.isDraft,
          imageLink: input.imageLink,
        },
      });
    }),
});
