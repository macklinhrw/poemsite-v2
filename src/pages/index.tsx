import type { NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { appRouter } from "../server/trpc/router/_app";
import { createProxySSGHelpers } from "@trpc/react/ssg";
import { createContextInner } from "../server/trpc/context";
import superjson from "superjson";
import Navbar from "../components/navbar";
import { isAdmin } from "../utils/admin";
import { useState } from "react";

const Home: NextPage = () => {
  const publishedPoems = trpc.poem.getPublished.useQuery();
  const draftPoems = trpc.poem.getDrafts.useQuery();
  const router = useRouter();
  const sessionData = useSession();
  const [activeTab, setActiveTab] = useState<"published" | "drafts">(
    "published"
  );

  const userIsAdmin = isAdmin(sessionData.data);

  // Determine which poems to show based on active tab
  const currentPoems = activeTab === "published" ? publishedPoems : draftPoems;

  const handlePoemClick = (poem: any) => {
    // If it's a draft and user is not admin, don't allow navigation
    if (poem.isDraft && !userIsAdmin) {
      return;
    }
    router.push(`poem/${poem.slug}`);
  };

  return (
    <div className="bg-gray-800">
      <Head>
        <title>Hunter Reeve</title>
        <meta name="description" content="Hunter Reeve's Poetry" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <main className="mx-auto min-h-screen flex-col p-4 text-gray-200">
        <div className="mx-auto max-w-lg lg:max-w-7xl ">
          {userIsAdmin && (
            <button
              className="group mb-8 flex w-full items-center justify-center gap-2 rounded-lg border border-pink-300 bg-pink-100 px-6 py-3 text-pink-800 shadow-sm transition-all duration-200 hover:border-pink-400 hover:bg-pink-200 hover:shadow-md"
              onClick={() => {
                router.push("poem/new");
              }}
            >
              <svg
                className="h-5 w-5 transition-transform group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="font-medium">Add New Poem</span>
            </button>
          )}

          {/* Tab Navigation for Admin Users */}
          {userIsAdmin && (
            <div className="mb-8">
              <div className="flex rounded-lg bg-gray-700 p-1">
                <button
                  className={`flex-1 rounded-md px-3 py-3 text-base font-medium transition-all duration-200 sm:px-6 sm:text-lg ${
                    activeTab === "published"
                      ? "bg-pink-600 text-white shadow-md"
                      : "text-gray-300 hover:bg-gray-600 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("published")}
                >
                  <span className="block sm:inline">Published</span>
                  {publishedPoems.data && (
                    <span className="ml-1 text-xs opacity-75 sm:ml-2 sm:text-sm">
                      ({publishedPoems.data.length})
                    </span>
                  )}
                </button>
                <button
                  className={`flex-1 rounded-md px-3 py-3 text-base font-medium transition-all duration-200 sm:px-6 sm:text-lg ${
                    activeTab === "drafts"
                      ? "bg-pink-600 text-white shadow-md"
                      : "text-gray-300 hover:bg-gray-600 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("drafts")}
                >
                  <span className="block sm:inline">Drafts</span>
                  {draftPoems.data && (
                    <span className="ml-1 text-xs opacity-75 sm:ml-2 sm:text-sm">
                      ({draftPoems.data.length})
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Current Tab Title */}
          <div className="mb-6">
            <h2 className="text-center text-2xl font-bold sm:text-3xl">
              {activeTab === "published"
                ? userIsAdmin
                  ? "" // Don't display for regular page
                  : "Hunter's Poems"
                : "Draft Poems"}
            </h2>
            {activeTab === "drafts" && (
              <p className="mt-2 text-center text-sm text-gray-400 sm:text-base">
                These are drafts that haven't been published yet
              </p>
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {currentPoems.data &&
              currentPoems.data.map((poem) => {
                return (
                  <div
                    key={poem.slug}
                    className={`group relative mt-2 flex flex-col overflow-hidden rounded-lg shadow-lg hover:cursor-pointer ${
                      poem.isDraft
                        ? "border-2 border-yellow-600/50 bg-yellow-900/30"
                        : "bg-gray-700"
                    }`}
                    onClick={() => handlePoemClick(poem)}
                  >
                    {/* Draft Badge */}
                    {poem.isDraft && (
                      <div className="absolute right-3 top-3 z-10 rounded-full bg-yellow-600 px-3 py-1 text-sm font-medium text-yellow-100">
                        Draft
                      </div>
                    )}

                    <div className="relative h-72 flex-shrink-0 bg-gray-600">
                      {poem.imageLink ? (
                        <Image
                          layout="fill"
                          objectFit="cover"
                          src={poem.imageLink}
                          alt={poem.hasTitle ? poem.title : "Poem image"}
                          quality={85}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-600">
                          <div className="text-center text-gray-400">
                            <svg
                              className="mx-auto mb-2 h-12 w-12"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                            </svg>
                            <p className="text-sm">No image</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mx-2 mb-4 mt-6">
                      {poem.hasTitle && (
                        <>
                          <p className="font-semibold">{poem.title}</p>
                          <hr className="my-2 h-px border-0 bg-gray-200/40" />
                        </>
                      )}
                      <div className="leading-relaxed">
                        {poem.content.split("\n").map((line, id) => {
                          if (id > 2) return;
                          if (id == 2 && poem.content.split("\n").length > 3) {
                            return (
                              <div key={`${id}-line`}>
                                <p className="font-serif">{line}...</p>
                              </div>
                            );
                          }
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

          {/* Empty State Messages */}
          {currentPoems.data && currentPoems.data.length === 0 && (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl">📝</div>
              <h3 className="mb-2 text-2xl font-bold text-gray-300">
                {activeTab === "published"
                  ? "No Published Poems Yet"
                  : "No Draft Poems"}
              </h3>
              <p className="text-lg text-gray-400">
                {activeTab === "published"
                  ? "All poems are currently in draft mode"
                  : "All poems have been published"}
              </p>
            </div>
          )}
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
  // prefetch published poems for public access
  await ssg.poem.getPublished.prefetch();
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 30,
  };
}
