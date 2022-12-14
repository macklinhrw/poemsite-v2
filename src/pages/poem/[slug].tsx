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

const PoemPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { slug } = props;
  const query = trpc.poem.getBySlug.useQuery({ slug });
  const poem = query.data;
  const router = useRouter();
  const nextMut = trpc.poem.getNext.useMutation();
  const prevMut = trpc.poem.getPrev.useMutation();

  const [next, setNext] = useState<string>(slug);
  const [prev, setPrev] = useState<string>(slug);

  useEffect(() => {
    const fetchData = async () => {
      if (poem) {
        const next = await nextMut.mutateAsync({ id: poem.id });
        setNext(next?.slug ?? slug);

        const prev = await prevMut.mutateAsync({ id: poem.id });
        setPrev(prev?.slug ?? slug);
      }
    };
    fetchData();
  }, [poem]);

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
              <div className="relative mt-4 h-72 flex-shrink-0">
                <Image
                  className="rounded-lg"
                  layout="fill"
                  objectFit="cover"
                  src={poem.imageLink}
                  alt=""
                />
              </div>
              <div className="mx-2 mt-6 mb-4 overflow-auto">
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
              <div className="mt-16 flex">
                <button
                  className="mr-auto rounded-lg bg-pink-500 px-4 py-2 hover:bg-pink-400"
                  onClick={() => {
                    console.log(prev);
                    router.push(`${prev}`);
                  }}
                >
                  Prev
                </button>
                <button
                  className="ml-auto rounded-lg bg-pink-500 px-4 py-2 hover:bg-pink-400"
                  onClick={() => {
                    router.push(`${next}`);
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p>Loading...</p>
            </div>
          )}
        </div>
      </main>
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
