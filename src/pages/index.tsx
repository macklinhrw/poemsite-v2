import type { NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import Image from "next/image";

const Home: NextPage = () => {
  const poems = trpc.poem.getAll.useQuery();

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
                  className="mt-2 flex flex-col overflow-hidden rounded-lg bg-gray-700 shadow-lg"
                >
                  <div className="relative h-72 flex-shrink-0">
                    <Image
                      layout="fill"
                      objectFit="cover"
                      src={poem.imageLink}
                      alt=""
                    />
                  </div>
                  <div className="my-6 mx-2">
                    <p>{poem.title}</p>
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
