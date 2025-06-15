import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-40 border-b border-pink-200/20 bg-pink-50/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo/Brand */}
        <Link href="/">
          <a className="group flex items-center space-x-3">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-pink-900 transition-colors group-hover:text-pink-600">
                Hunter Reeve
              </h1>
              <p className="text-xs leading-none text-pink-600">
                Poetry Collection
              </p>
            </div>
          </a>
        </Link>

        {/* Navigation Links & Auth */}
        <div className="flex items-center space-x-6">
          {/* Navigation Links */}
          <div className="hidden items-center space-x-4 sm:flex">
            <Link href="/">
              <a className="rounded-md px-3 py-2 text-pink-700 transition-colors duration-200 hover:bg-pink-100/50 hover:text-pink-600">
                All Poems
              </a>
            </Link>
          </div>

          {/* Auth Section */}
          <AuthShowcase />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex items-center">
      {sessionData && (
        <div className="mr-4 hidden items-center text-sm text-pink-600 sm:flex">
          <div className="mr-2 h-2 w-2 rounded-full bg-pink-500"></div>
          <span>Signed in</span>
        </div>
      )}

      <button
        className="rounded-md border border-pink-300 bg-pink-100 px-4 py-2 text-sm font-medium text-pink-800 transition-colors duration-200 hover:border-pink-400 hover:bg-pink-200"
        onClick={sessionData ? () => signOut() : () => signIn()}
      >
        {sessionData ? "Sign Out" : "Sign In"}
      </button>
    </div>
  );
};
