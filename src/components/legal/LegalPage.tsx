import { getSiteSettings } from "@/lib/settings";

export default async function LegalPage({
  title,
  contentKey,
}: {
  title: string;
  contentKey: "privacy" | "distanceSales" | "kvkk";
}) {
  const settings = await getSiteSettings();
  const content = settings.legalPages[contentKey];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="mt-6 prose prose-slate max-w-none">
        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
