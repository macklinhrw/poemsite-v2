import Head from "next/head";
import { useForm } from "react-hook-form";
import Navbar from "../../components/navbar";

const NewPoem = () => {
  const { register, handleSubmit } = useForm();

  const submitForm = (data: string) => {
    return;
  };

  return (
    <div>
      <Head>
        <title>Hunter Reeve - Add Poem</title>
      </Head>
      <main>
        <Navbar />
        <form>
          <div className="mx-auto mt-8 flex max-w-lg flex-col text-white">
            <span>Title</span>
            <input className="w-full rounded bg-white py-1 px-2 text-gray-800" />
          </div>
        </form>
      </main>
    </div>
  );
};

export default NewPoem;
