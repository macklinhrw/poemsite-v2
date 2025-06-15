import Head from "next/head";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession, signIn } from "next-auth/react";
import Navbar from "../../../components/navbar";
import Tiptap from "../../../components/TipTap/Editor";
import { trpc } from "../../../utils/trpc";
import { isAdmin } from "../../../utils/admin";

interface PoemFormData {
  title: string;
  hasTitle: boolean;
  isDraft: boolean;
  imageLink?: string;
}

const EditPoem = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { data: session, status } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PoemFormData>();

  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const userIsAdmin = isAdmin(session);

  // Fetch existing poem data
  const poemQuery = trpc.poem.getBySlug.useQuery(
    { slug: slug as string },
    { enabled: !!slug }
  );

  const updatePoemMutation = trpc.poem.update.useMutation({
    onSuccess: (data) => {
      // Redirect to the updated poem
      router.push(`/poem/${data.slug}`);
    },
    onError: (error) => {
      console.error("Error updating poem:", error);
      setError("Error updating poem. Please try again.");
      setIsSubmitting(false);
    },
  });

  // Pre-populate form when poem data is loaded
  useEffect(() => {
    if (poemQuery.data && !isLoaded) {
      const poem = poemQuery.data;
      setValue("title", poem.title);
      setValue("hasTitle", poem.hasTitle);
      setValue("isDraft", poem.isDraft || false);
      setValue("imageLink", poem.imageLink || "");

      // Convert plain text newlines to HTML paragraphs for TipTap
      const htmlContent = poem.content
        .split("\n")
        .filter((line) => line.trim() !== "") // Remove empty lines
        .map((line) => `<p>${line}</p>`)
        .join("");

      setContent(htmlContent || "<p></p>"); // Ensure there's at least one empty paragraph
      setIsLoaded(true);
    }
  }, [poemQuery.data, setValue, isLoaded]);

  const submitForm = async (data: PoemFormData) => {
    setError(null);

    if (!userIsAdmin) {
      setError("You must be an administrator to edit poems.");
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

    if (!poemQuery.data) {
      setError("Could not find the poem to edit.");
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

      await updatePoemMutation.mutateAsync({
        id: poemQuery.data.id,
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

  // Show loading state while checking authentication or loading poem
  if (status === "loading" || poemQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-800">
        <Head>
          <title>Hunter Reeve - Edit Poem</title>
        </Head>
        <Navbar />
        <div className="mx-auto mt-12 max-w-4xl px-4 text-center text-white">
          <h1 className="mb-8 text-4xl font-bold">Loading...</h1>
          <p className="text-2xl text-gray-300">
            Please wait while we load your poem
          </p>
        </div>
      </div>
    );
  }

  // Handle authentication errors
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-800">
        <Head>
          <title>Hunter Reeve - Edit Poem</title>
        </Head>
        <Navbar />
        <div className="mx-auto mt-12 max-w-4xl px-4 text-center text-white">
          <h1 className="mb-8 text-5xl font-bold">Please Sign In</h1>
          <p className="mb-8 text-2xl text-gray-300">
            You need to be signed in to edit poems
          </p>
          <button
            onClick={() => signIn()}
            className="rounded-lg bg-blue-600 px-12 py-6 text-2xl font-bold text-white shadow-lg transition-colors hover:bg-blue-700 hover:shadow-xl"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  // Handle admin access
  if (!userIsAdmin) {
    return (
      <div className="min-h-screen bg-gray-800">
        <Head>
          <title>Hunter Reeve - Edit Poem</title>
        </Head>
        <Navbar />
        <div className="mx-auto mt-12 max-w-4xl px-4 text-center text-white">
          <h1 className="mb-8 text-5xl font-bold">Access Denied</h1>
          <p className="mb-8 text-2xl text-gray-300">
            You must be an administrator to edit poems
          </p>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg bg-blue-600 px-12 py-6 text-2xl font-bold text-white shadow-lg transition-colors hover:bg-blue-700 hover:shadow-xl"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // Handle error states
  if (poemQuery.error || !poemQuery.data) {
    return (
      <div className="min-h-screen bg-gray-800">
        <Head>
          <title>Hunter Reeve - Edit Poem</title>
        </Head>
        <Navbar />
        <div className="mx-auto mt-12 max-w-4xl px-4 text-center text-white">
          <h1 className="mb-8 text-4xl font-bold">Poem Not Found</h1>
          <p className="mb-8 text-2xl text-gray-300">
            The poem you&apos;re trying to edit could not be found.
          </p>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg bg-blue-600 px-8 py-4 text-xl font-bold text-white shadow-lg transition-colors hover:bg-blue-700"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800">
      <Head>
        <title>Hunter Reeve - Edit Poem</title>
      </Head>
      <Navbar />
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="mx-auto mt-8 flex max-w-5xl flex-col px-4 text-white">
          <div className="mb-8">
            <h1 className="mb-4 text-center text-5xl font-bold">Edit Poem</h1>
            <p className="text-center text-xl text-gray-300">
              Editing: {poemQuery.data?.title}
            </p>

            {error && (
              <div className="mt-6 rounded-lg border-2 border-red-600 bg-red-900/70 p-4 text-xl font-medium text-red-100">
                {error}
              </div>
            )}

            <div className="mb-8 mt-8">
              <label htmlFor="title" className="mb-3 block text-2xl font-bold">
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
                Edit Your Poem
              </label>
              {isLoaded && content !== undefined ? (
                <Tiptap
                  className="w-full text-xl text-black"
                  commitState={setContent}
                  initialValue={content}
                />
              ) : (
                <div className="flex min-h-[500px] w-full items-center justify-center rounded-lg border-2 border-gray-300 bg-gray-100">
                  <p className="text-xl text-gray-600">
                    Loading poem content...
                  </p>
                </div>
              )}
              {isLoaded && !content.trim() && (
                <p className="mt-3 text-lg font-medium text-gray-300">
                  Click in the box above to edit your poem
                </p>
              )}
            </div>

            <div className="mb-8">
              <label
                htmlFor="imageLink"
                className="mb-3 block text-2xl font-bold"
              >
                Picture URL (Optional)
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
                  {...register("hasTitle")}
                />
                <span className="text-lg font-medium">
                  Show the title on the poem page
                </span>
              </label>

              <label className="flex cursor-pointer items-center rounded-lg bg-gray-800 p-4 text-xl transition-colors hover:bg-gray-700">
                <input
                  type="checkbox"
                  className="mr-4 h-6 w-6 rounded text-blue-600 focus:ring-blue-500"
                  {...register("isDraft")}
                />
                <span className="text-lg font-medium">
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
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => router.push(`/poem/${slug}`)}
              className="flex-1 rounded-lg bg-gray-600 px-8 py-6 text-2xl font-bold text-white shadow-lg transition-colors hover:bg-gray-700 hover:shadow-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditPoem;
