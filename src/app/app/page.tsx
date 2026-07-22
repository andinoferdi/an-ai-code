import { redirect } from "next/navigation";

/** The shell used to live at /app; it now lives at /new alongside the other routes. */
export default function AppRedirect() {
  redirect("/new");
}
