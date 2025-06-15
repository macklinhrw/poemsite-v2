import type { Session } from "next-auth";

const ADMIN_EMAILS = ["macklin202@gmail.com", "huntyreeve@yahoo.com"];

export function isAdmin(session: Session | null): boolean {
  if (!session?.user?.email) {
    return false;
  }

  return ADMIN_EMAILS.includes(session.user.email);
}
