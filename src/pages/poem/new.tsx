import Head from "next/head";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/router";
import { useSession, signIn } from "next-auth/react";
import Navbar from "../../components/navbar";
import Tiptap from "../../components/TipTap/Editor";
import { trpc } from "../../utils/trpc";
import { isAdmin } from "../../utils/admin";

interface PoemFormData {
  title: string;
  hasTitle: boolean;
  isDraft: boolean;
  imageLink?: string;
}

const NewPoem = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PoemFormData>();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  const userIsAdmin = isAdmin(session);

  const createPoemMutation = trpc.poem.create.useMutation({
    onSuccess: (data) => {
      // Redirect to the created poem
      router.push(`/poem/${data.slug}`);
    },
    onError: (error) => {
      console.error("Error creating poem:", error);
      setError("Error creating poem. Please try again.");
      setIsSubmitting(false);
    },
  });

  const submitForm = async (data: PoemFormData) => {
    setError(null); // Clear previous errors

    if (!userIsAdmin) {
      setError("You must be an administrator to create a poem.");
      return;
    }

    if (!content.trim()) {
      setError("Please add some content to your poem.");
      return;
    }

    if (!data.title.trim()) {
      setError("Please add a title to your poem.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert HTML content back to plain text with newlines
      // First, let's create a temporary div to parse the HTML properly
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;

      // Get all paragraph elements and extract their text content
      const paragraphs = tempDiv.querySelectorAll("p");
      const lines = Array.from(paragraphs)
        .map((p) => p.textContent || "")
        .filter((line) => line.trim() !== "");

      // Join with newlines, fallback to regex if no paragraphs found
      const plainTextContent =
        lines.length > 0
          ? lines.join("\n")
          : content
              .replace(/<\/p><p>/g, "\n") // Replace </p><p> with newline
              .replace(/<p>/g, "") // Remove opening <p> tags
              .replace(/<\/p>/g, "") // Remove closing </p> tags
              .replace(/<br\s*\/?>/gi, "\n") // Replace <br> tags with newlines
              .replace(/<[^>]*>/g, "") // Remove any remaining HTML tags
              .trim();

      await createPoemMutation.mutateAsync({
        title: data.title,
        content: plainTextContent,
        hasTitle: data.hasTitle ?? true,
        isDraft: data.isDraft ?? false,
        imageLink: data.imageLink || "",
      });
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    }
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-800">
        <Head>
          <title>Hunter Reeve - Add Poem</title>
        </Head>
        <Navbar />
        <div className="mx-auto mt-12 max-w-4xl px-4 text-center text-white">
          <h1 className="mb-8 text-4xl font-bold">Loading...</h1>
          <p className="text-2xl text-gray-300">
            Please wait while we check your permissions
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div>
        <Head>
          <title>Hunter Reeve - Add Poem</title>
        </Head>
        <main>
          <Navbar />
          <div className="mx-auto mt-12 max-w-4xl px-4 text-center text-white">
            <h1 className="mb-8 text-5xl font-bold">Please Sign In</h1>
            <p className="mb-8 text-2xl text-gray-300">
              You need to be signed in to add a new poem
            </p>
            <button
              onClick={() => signIn()}
              className="rounded-lg bg-blue-600 px-12 py-6 text-2xl font-bold text-white shadow-lg transition-colors hover:bg-blue-700 hover:shadow-xl"
            >
              Sign In Now
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!userIsAdmin) {
    return (
      <div>
        <Head>
          <title>Hunter Reeve - Add Poem</title>
        </Head>
        <main>
          <Navbar />
          <div className="mx-auto mt-12 max-w-4xl px-4 text-center text-white">
            <h1 className="mb-8 text-5xl font-bold">Access Denied</h1>
            <p className="mb-8 text-2xl text-gray-300">
              You must be an administrator to add new poems
            </p>
            <button
              onClick={() => router.push("/")}
              className="rounded-lg bg-blue-600 px-12 py-6 text-2xl font-bold text-white shadow-lg transition-colors hover:bg-blue-700 hover:shadow-xl"
            >
              Go Back Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>Hunter Reeve - Add Poem</title>
      </Head>
      <main>
        <Navbar />
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="mx-auto mt-8 flex max-w-5xl flex-col px-4 text-white">
            <div className="mb-8">
              <h1 className="mb-8 text-center text-5xl font-bold">
                Add New Poem
              </h1>

              {error && (
                <div className="mb-6 rounded-lg border-2 border-red-600 bg-red-900/70 p-4 text-xl font-medium text-red-100">
                  {error}
                </div>
              )}

              <div className="mb-8">
                <label
                  htmlFor="title"
                  className="mb-3 block text-2xl font-bold"
                >
                  Poem Title
                </label>
                <input
                  id="title"
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-4 text-xl text-gray-800 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your poem title here..."
                  {...register("title", {
                    required: "Please enter a title for your poem",
                    minLength: { value: 1, message: "Title cannot be empty" },
                  })}
                />
                {errors.title && (
                  <p className="mt-2 text-lg font-medium text-red-300">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="mb-8">
                <label className="mb-3 block text-2xl font-bold">
                  Write Your Poem
                </label>
                <Tiptap
                  className="w-full text-xl text-black"
                  commitState={setContent}
                  initialValue=""
                />
                {!content.trim() && (
                  <p className="mt-3 text-lg font-medium text-gray-300">
                    Click in the box above to start writing your poem
                  </p>
                )}
              </div>

              <div className="mb-8">
                <label
                  htmlFor="imageLink"
                  className="mb-3 block text-2xl font-bold"
                >
                  Add a Picture (Optional)
                </label>
                <input
                  id="imageLink"
                  type="url"
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-4 text-xl text-gray-800 focus:border-blue-500 focus:outline-none"
                  placeholder="Paste picture web address here (optional)"
                  {...register("imageLink")}
                />
                <p className="text-lg text-gray-300">
                  You can skip this if you don&apos;t want to add a picture
                </p>
              </div>

              <div className="mb-8 space-y-4">
                <label className="flex cursor-pointer items-center rounded-lg bg-gray-800 p-4 text-xl transition-colors hover:bg-gray-700">
                  <input
                    type="checkbox"
                    className="mr-4 h-6 w-6 rounded text-blue-600 focus:ring-blue-500"
                    defaultChecked={true}
                    {...register("hasTitle")}
                  />
                  <span className="text-lg font-medium">
                    Show the title on the poem page
                  </span>
                </label>

                <label className="flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="mr-3 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    {...register("isDraft")}
                  />
                  <span className="text-lg font-medium text-white">
                    Save as draft (don&apos;t publish yet)
                  </span>
                </label>
              </div>
            </div>

            <div className="mb-8 flex flex-col gap-6 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-green-600 px-8 py-6 text-2xl font-bold text-white shadow-lg transition-colors hover:bg-green-700 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-gray-600"
              >
                {isSubmitting ? "Creating Poem..." : "Create Poem"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="flex-1 rounded-lg bg-gray-600 px-8 py-6 text-2xl font-bold text-white shadow-lg transition-colors hover:bg-gray-700 hover:shadow-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default NewPoem;
