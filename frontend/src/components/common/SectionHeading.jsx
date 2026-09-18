export default function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="mb-8 max-w-2xl">
      <p className="mb-2 text-sm font-bold uppercase tracking-widest text-brand">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-bold text-ink dark:text-white sm:text-3xl">{title}</h2>
      {text && (
        <p className="mt-3 text-slate-600 dark:text-slate-300">{text}</p>
      )}
    </div>
  );
}
