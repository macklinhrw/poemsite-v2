import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav>
      <div className="my-auto flex h-12 items-center bg-pink-300 px-4 align-baseline text-pink-800">
        <Link className="" href="/">
          <p className="text-lg font-semibold hover:cursor-pointer">
            Hunter Reeve
          </p>
        </Link>
        <AuthShowcase />
      </div>{" "}
    </nav>
  );
};

export default Navbar;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="ml-auto flex items-center justify-center gap-2">
      {sessionData && (
        <p className="text-lg text-gray-700">
          Logged in as {sessionData?.user?.name}
        </p>
      )}
      <button
        className="rounded-md bg-pink-600 px-4 py-1 text-xl text-white shadow-lg hover:bg-pink-800"
        onClick={sessionData ? () => signOut() : () => signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
