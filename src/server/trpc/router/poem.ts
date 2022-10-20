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
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.poem.findMany({ orderBy: {createdAt: 'desc'} });
  }),
  create: protectedProcedure
    .input(z.object({
      title: z.string().nullish(),
    }).nullish())
    .mutation(({ ctx }) => {
      return {}
    })
});
