import { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  className = "",
  label,
  disabled = false,
  size = "md", // "sm" | "md" | "lg"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options: can be array of strings or array of { label, value }
  const normalizedOptions = options.map((opt) =>
    typeof opt === "object" && opt !== null
      ? opt
      : { label: String(opt), value: String(opt) },
  );

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value),
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-3.5 py-2.5 text-sm",
    lg: "px-4 py-3 text-base",
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white text-left font-medium text-slate-800 shadow-sm transition hover:border-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-brand dark:focus:ring-brand/30 ${
          sizeClasses[size] || sizeClasses.md
        } ${isOpen ? "border-brand ring-2 ring-brand/20 dark:border-brand" : ""}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FiChevronDown
          className={`shrink-0 text-slate-400 transition-transform duration-200 dark:text-slate-400 ${
            isOpen ? "rotate-180 text-brand" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 max-h-60 w-full min-w-[140px] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl transition dark:border-slate-700 dark:bg-slate-800">
          <ul role="listbox" className="divide-y divide-transparent">
            {normalizedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex cursor-pointer items-center justify-between px-3.5 py-2 text-sm font-medium transition ${
                    isSelected
                      ? "bg-brand/10 text-brand font-semibold dark:bg-brand/20 dark:text-brand"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-700/80 dark:hover:text-white"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <FiCheck className="shrink-0 text-brand text-base" />}
                </li>
              );
            })}
            {!normalizedOptions.length && (
              <li className="px-3.5 py-2 text-center text-xs text-slate-400">
                No options available
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
