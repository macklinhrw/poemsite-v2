import { createProxySSGHelpers } from "@trpc/react/ssg";
import { createContextInner } from "../../server/trpc/context";
import { appRouter } from "../../server/trpc/router/_app";
import superjson from "superjson";
import {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import { trpc } from "../../utils/trpc";
import { Breadcrumbs } from "react-daisyui";
import Image from "next/image";
import { prisma } from "../../server/db/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Navbar from "../../components/navbar";
import { useSession } from "next-auth/react";
import { isAdmin } from "../../utils/admin";

const PoemPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { slug } = props;
  const query = trpc.poem.getBySlug.useQuery({ slug });
  const poem = query.data;
  const router = useRouter();
  const { data: session } = useSession();
  const nextMut = trpc.poem.getNext.useMutation();
  const prevMut = trpc.poem.getPrev.useMutation();
  const deleteMut = trpc.poem.delete.useMutation();

  const [next, setNext] = useState<string | null>(null);
  const [prev, setPrev] = useState<string | null>(null);
  const [navigationLoaded, setNavigationLoaded] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const userIsAdmin = isAdmin(session);

  // If this is a draft poem and user is not admin, redirect to home
  useEffect(() => {
    if (poem && poem.isDraft && !userIsAdmin) {
      router.push("/");
    }
  }, [poem, userIsAdmin, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (poem) {
        // Only show loading state if we haven't loaded navigation data before
        if (!hasLoadedOnce) {
          setNavigationLoaded(false);
        }

        const [nextPoem, prevPoem] = await Promise.all([
          nextMut.mutateAsync({ id: poem.id }),
          prevMut.mutateAsync({ id: poem.id }),
        ]);

        setNext(nextPoem?.slug ?? slug);
        setPrev(prevPoem?.slug ?? slug);
        setNavigationLoaded(true);
        setHasLoadedOnce(true);
      }
    };
    fetchData();
  }, [poem, slug, hasLoadedOnce]);

  const handleDeletePoem = async () => {
    if (!poem || !userIsAdmin) return;

    try {
      await deleteMut.mutateAsync({ id: poem.id });
      // Redirect to home page after successful deletion
      router.push("/");
    } catch (error) {
      console.error("Error deleting poem:", error);
      // You could add error state handling here if needed
    }
  };

  // Don't render draft poems for non-admin users
  if (poem && poem.isDraft && !userIsAdmin) {
    return null;
  }

  return (
    <div className="bg-gray-800">
      <Head>
        <title>Hunter Reeve - {poem?.title}</title>
        <meta name="description" content="Hunter Reeve's Poetry" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <main className="mx-auto min-h-screen p-4 text-gray-200">
        <div className="flex">
          <Breadcrumbs className="mx-auto">
            <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
            <Breadcrumbs.Item>{poem?.title}</Breadcrumbs.Item>
          </Breadcrumbs>
        </div>
        <div className="mx-auto max-w-xl overflow-hidden">
          {/* Poem Here */}
          {poem ? (
            <div>
              {/* Draft Banner for Admin Users */}
              {poem.isDraft && userIsAdmin && (
                <div className="mb-6 rounded-lg border-2 border-yellow-600 bg-yellow-900/30 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-yellow-100">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <h3 className="text-lg font-bold">Draft Poem</h3>
                      <p className="text-sm opacity-90">
                        This poem is not published and only visible to
                        administrators
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="relative mt-4 h-72 flex-shrink-0 overflow-hidden rounded-lg bg-gray-600">
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
              <div className="mx-2 mb-4 mt-6 overflow-auto">
                {poem.hasTitle && (
                  <div>
                    <p className="text-xl font-semibold">{poem.title}</p>
                    <hr className="my-2 h-px border-0 bg-gray-200/40" />
                  </div>
                )}
                <div className="leading-loose lg:text-lg">
                  {poem.content.split("\n").map((line, id) => {
                    return (
                      <div key={`${id}-line`}>
                        <p className="font-serif">{line}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-16 space-y-6">
                {/* Navigation Buttons */}
                <div className="flex w-full flex-col gap-3 sm:flex-row">
                  <button
                    className="flex-1 rounded-md border border-gray-600 bg-gray-800/30 px-6 py-3 text-lg text-gray-300 transition-colors hover:bg-gray-700/40 hover:text-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => {
                      if (navigationLoaded && prev && prev !== slug) {
                        router.push(`${prev}`);
                      }
                    }}
                    disabled={!navigationLoaded || prev === slug}
                    title="Go to previous poem"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>←</span>
                      <span>
                        {!navigationLoaded
                          ? "Loading..."
                          : prev === slug
                          ? "First Poem"
                          : "Previous"}
                      </span>
                    </div>
                  </button>

                  <button
                    className="flex-1 rounded-md border border-gray-600 bg-gray-800/30 px-6 py-3 text-lg text-gray-300 transition-colors hover:bg-gray-700/40 hover:text-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => {
                      if (navigationLoaded && next && next !== slug) {
                        router.push(`${next}`);
                      }
                    }}
                    disabled={!navigationLoaded || next === slug}
                    title="Go to next poem"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>
                        {!navigationLoaded
                          ? "Loading..."
                          : next === slug
                          ? "Last Poem"
                          : "Next"}
                      </span>
                      <span>→</span>
                    </div>
                  </button>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  {/* Back to Home Button */}
                  <button
                    className="rounded-md border border-gray-600 bg-gray-800/30 px-6 py-3 text-base text-gray-300 transition-colors hover:bg-gray-700/40 hover:text-gray-200"
                    onClick={() => router.push("/")}
                    title="Return to all poems"
                  >
                    ← Back to All Poems
                  </button>

                  {/* Edit and Delete Buttons (only shown to admin users) */}
                  {userIsAdmin && (
                    <div className="flex gap-3">
                      <button
                        className="rounded-md border border-blue-800/50 bg-blue-900/20 px-5 py-3 text-base text-blue-300 transition-colors hover:bg-blue-800/30 hover:text-blue-200"
                        onClick={() => router.push(`/poem/${slug}/edit`)}
                        title="Edit this poem"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="rounded-md border border-red-800/50 bg-red-900/20 px-5 py-3 text-base text-red-300 transition-colors hover:bg-red-800/30 hover:text-red-200"
                        onClick={() => setShowDeleteConfirm(true)}
                        title="Delete this poem"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p>Loading...</p>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-3">
          <div className="mx-auto w-full max-w-sm rounded-lg border border-gray-700 bg-gray-800 p-5 text-gray-200 shadow-xl">
            <div className="mb-5 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-900/50">
                <span className="text-xl">⚠️</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-100">
                Delete Poem?
              </h3>
              <div className="text-sm leading-relaxed text-gray-300">
                <div className="mb-2">Delete this poem permanently?</div>
                <div className="mb-2 break-all font-medium text-gray-100">
                  "{poem?.title}"
                </div>
                <div className="font-medium text-red-300">
                  Cannot be undone.
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-md border border-gray-600 bg-gray-700 px-4 py-3 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePoem}
                className="flex-1 rounded-md bg-red-700 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600"
                disabled={deleteMut.isLoading}
              >
                {deleteMut.isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export async function getStaticProps(
  context: GetStaticPropsContext<{ slug: string }>
) {
  const ssgHelper = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContextInner({ session: null }),
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug as string;

  const post = await ssgHelper.poem.getBySlug.fetch({ slug });

  if (!post) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      trpcState: ssgHelper.dehydrate(),
      slug,
    },
    revalidate: 1600,
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const poems = await prisma.poem.findMany({ select: { slug: true } });

  return {
    paths: poems.map((poem) => ({
      params: {
        slug: poem.slug,
      },
    })),
    fallback: "blocking",
  };
};

export default PoemPage;
