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
      z
        .object({
          title: z.string().nullish(),
        })
        .nullish()
    )
    .mutation(({ ctx }) => {
      return {};
    }),
});
