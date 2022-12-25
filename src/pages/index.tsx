import type { GetStaticPaths, GetStaticPropsContext, NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { appRouter } from "../server/trpc/router/_app";
import { createProxySSGHelpers } from "@trpc/react/ssg";
import { createContextInner } from "../server/trpc/context";
import { prisma } from "../server/db/client";
import superjson from "superjson";

const Home: NextPage = () => {
  const poems = trpc.poem.getAll.useQuery();
  const router = useRouter();

  return (
    <div className="bg-gray-800">
      <Head>
        <title>Hunter Reeve</title>
        <meta name="description" content="Hunter Reeve's Poetry" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto min-h-screen flex-col p-4 text-gray-200">
        <AuthShowcase />
        <div className="mx-auto grid max-w-lg gap-5 lg:max-w-7xl lg:grid-cols-3">
          {poems.data &&
            poems.data.map((poem) => {
              return (
                <div
                  key={poem.slug}
                  className="group mt-2 flex flex-col overflow-hidden rounded-lg bg-gray-700 shadow-lg hover:cursor-pointer"
                  onClick={() => router.push(`poem/${poem.slug}`)}
                >
                  <div className="relative h-72 flex-shrink-0">
                    <Image
                      layout="fill"
                      objectFit="cover"
                      src={poem.imageLink}
                      alt=""
                    />
                  </div>
                  <div className="mx-2 mt-6 mb-4">
                    {poem.hasTitle && (
                      <>
                        <p className="font-semibold">{poem.title}</p>
                        <hr className="my-2 h-px border-0 bg-gray-200/40" />
                      </>
                    )}
                    <div className="leading-relaxed line-clamp-3">
                      {poem.content.split("\n").map((line, id) => {
                        return (
                          <div key={`${id}-line`}>
                            <p className="font-serif">{line}</p>
                          </div>
                        );
                      })}
                    </div>
                    <button className="mt-2 group-hover:underline">
                      <Link href={`poem/${poem.slug}`}>Read More...</Link>
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </main>
    </div>
  );
};

export default Home;

export async function getStaticProps() {
  const ssg = await createProxySSGHelpers({
    router: appRouter,
    ctx: await createContextInner({ session: null }),
    transformer: superjson,
  });
  // prefetch `post.byId`
  await ssg.poem.getAll.prefetch();
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 1,
  };
}

// export const getStaticPaths: GetStaticPaths = async () => {
//   const posts = await prisma.poem.findMany({
//     select: {
//       slug: true,
//     },
//   });
//   return {
//     paths: posts.map((post) => ({
//       params: {
//         slug: post.slug,
//       },
//     })),
//     // https://nextjs.org/docs/basic-features/data-fetching#fallback-blocking
//     fallback: "blocking",
//   };
// };

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {sessionData && (
        <p className="text-2xl text-blue-500">
          Logged in as {sessionData?.user?.name}
        </p>
      )}
      <button
        className="rounded-md border border-black bg-violet-900 px-4 py-2 text-xl shadow-lg hover:bg-violet-800"
        onClick={sessionData ? () => signOut() : () => signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
