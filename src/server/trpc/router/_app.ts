// src/server/trpc/router/_app.ts
import { router } from "../trpc";
import { authRouter } from "./auth";
import { poemRouter } from "./poem";

export const appRouter = router({
  poem: poemRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
