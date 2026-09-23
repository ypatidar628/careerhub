import { FiMapPin, FiCompass, FiGlobe } from "react-icons/fi";

export default function ContactInformation({
  form,
  isEditing,
  onChange,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Contact Information
          </h3>
          <p className="text-xs text-slate-400">
            Residential and mailing address coordinates.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
        {/* Address */}
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="block font-bold text-slate-700 dark:text-slate-300">
            Street Address
          </label>
          <div className="relative mt-1.5">
            <FiMapPin className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
            <input
              name="address"
              type="text"
              value={form.address}
              onChange={onChange}
              disabled={!isEditing}
              placeholder="e.g. Bld Mihail Kogalniceanu, nr. 8 Bl 1, Sc 1, Ap 09"
              className={`w-full rounded-2xl border p-3 pl-10 text-xs font-semibold outline-none transition ${
                !isEditing
                  ? "border-slate-200 bg-slate-100/70 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 cursor-not-allowed"
                  : "border-slate-300 bg-white text-slate-800 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand"
              }`}
            />
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300">
            City
          </label>
          <div className="relative mt-1.5">
            <FiCompass className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
            <input
              name="city"
              type="text"
              value={form.city}
              onChange={onChange}
              disabled={!isEditing}
              placeholder="e.g. Indore"
              className={`w-full rounded-2xl border p-3 pl-10 text-xs font-semibold outline-none transition ${
                !isEditing
                  ? "border-slate-200 bg-slate-100/70 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 cursor-not-allowed"
                  : "border-slate-300 bg-white text-slate-800 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand"
              }`}
            />
          </div>
        </div>

        {/* State */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300">
            State / Region
          </label>
          <div className="relative mt-1.5">
            <input
              name="state"
              type="text"
              value={form.state}
              onChange={onChange}
              disabled={!isEditing}
              placeholder="e.g. Madhya Pradesh"
              className={`w-full rounded-2xl border p-3 text-xs font-semibold outline-none transition ${
                !isEditing
                  ? "border-slate-200 bg-slate-100/70 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 cursor-not-allowed"
                  : "border-slate-300 bg-white text-slate-800 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand"
              }`}
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300">
            Country
          </label>
          <div className="relative mt-1.5">
            <FiGlobe className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
            <input
              name="country"
              type="text"
              value={form.country}
              onChange={onChange}
              disabled={!isEditing}
              placeholder="e.g. India"
              className={`w-full rounded-2xl border p-3 pl-10 text-xs font-semibold outline-none transition ${
                !isEditing
                  ? "border-slate-200 bg-slate-100/70 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 cursor-not-allowed"
                  : "border-slate-300 bg-white text-slate-800 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand"
              }`}
            />
          </div>
        </div>

        {/* Postal Code */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300">
            Postal / ZIP Code
          </label>
          <div className="relative mt-1.5">
            <input
              name="postalCode"
              type="text"
              value={form.postalCode}
              onChange={onChange}
              disabled={!isEditing}
              placeholder="e.g. 452001"
              className={`w-full rounded-2xl border p-3 text-xs font-semibold outline-none transition ${
                !isEditing
                  ? "border-slate-200 bg-slate-100/70 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 cursor-not-allowed"
                  : "border-slate-300 bg-white text-slate-800 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
