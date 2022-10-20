import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const poemRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.poem.findMany({ orderBy: { createdAt: "desc" } });
  }),
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.poem.findFirst({ where: { slug: input.slug } });
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
