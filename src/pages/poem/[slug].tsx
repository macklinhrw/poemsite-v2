import { createProxySSGHelpers } from "@trpc/react/ssg";
import { createContextInner } from "../../server/trpc/context";
import { appRouter } from "../../server/trpc/router/_app";
import superjson from "superjson";
import {
  GetStaticPaths,
  GetStaticProps,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import { trpc } from "../../utils/trpc";
import { Breadcrumbs } from "react-daisyui";
import Image from "next/image";

const poemPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { slug } = props;
  const query = trpc.poem.getBySlug.useQuery({ slug });
  const poem = query.data;

  return (
    <div className="bg-gray-800">
      <main className="mx-auto min-h-screen p-4 text-gray-200">
        <div className="flex">
          <Breadcrumbs className="mx-auto">
            <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
            <Breadcrumbs.Item>{poem?.title}</Breadcrumbs.Item>
          </Breadcrumbs>
        </div>
        <div className="mx-auto max-w-xl">
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
              <div className="mx-2 mt-6 mb-4">
                {poem.hasTitle && (
                  <div>
                    <p className="text-xl font-semibold">{poem.title}</p>
                    <hr className="my-2 h-px border-0 bg-gray-200/40" />
                  </div>
                )}
                <div className="text-lg leading-loose">
                  {poem.content.split("\n").map((line, id) => {
                    return (
                      <div key={`${id}-line`}>
                        <p className="font-serif">{line}</p>
                      </div>
                    );
                  })}
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
    </div>
  );
};

export const getStaticProps: GetStaticProps<{ slug: string }> = async (
  context: GetStaticPropsContext
) => {
  const slug: string = context.params?.slug as string;
  if (!slug) return { notFound: true };

  const ssgHelper = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContextInner({ session: null }),
    transformer: superjson, // optional - adds superjson serialization
  });

  const post = await ssgHelper.poem.getBySlug.prefetch({ slug });

  // if (!post) {
  //   return {
  //     notFound: true,
  //   };
  // }
  return {
    props: {
      trpcState: ssgHelper.dehydrate(),
      slug,
    },
    revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const poems = await prisma?.poem.findMany();
  if (!poems) return { paths: [{ params: {} }], fallback: false };
  const paths = poems.map((poem) => {
    return {
      params: {
        slug: poem.slug,
      },
    };
  });
  return {
    paths,
    fallback: false,
  };
};

export default poemPage;
