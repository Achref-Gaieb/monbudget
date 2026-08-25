import { redirect } from "next/navigation";

/**
 * The homepage now onboards in a single question, so this second, longer
 * wizard was a duplicate path to the same outcome. Kept as a redirect so
 * existing links and bookmarks still land somewhere useful.
 */
export default function CreateBudgetPage() {
  redirect("/");
}
