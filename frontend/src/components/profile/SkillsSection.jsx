import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";

export default function SkillsSection({
  skills = [],
  isEditing,
  onAddSkill,
  onRemoveSkill,
}) {
  const [newSkill, setNewSkill] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    onAddSkill(newSkill.trim());
    setNewSkill("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd(e);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Skills & Competencies
          </h3>
          <p className="text-xs text-slate-400">
            Showcase your technical and domain strengths.
          </p>
        </div>
      </div>

      {/* Skills Chips */}
      <div className="flex flex-wrap gap-2 pt-1">
        {skills.length > 0 ? (
          skills.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand dark:bg-brand/20 dark:text-cyan-300"
            >
              <span>{skill}</span>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => onRemoveSkill(idx)}
                  className="rounded-full p-0.5 hover:bg-brand/20 dark:hover:bg-brand/40"
                  aria-label={`Remove ${skill}`}
                >
                  <FiX className="text-xs" />
                </button>
              )}
            </span>
          ))
        ) : (
          <p className="text-xs italic text-slate-400">
            No skills added yet. Click 'Edit Profile' to add relevant skills.
          </p>
        )}
      </div>

      {/* Add Skill Input in Edit Mode */}
      {isEditing && (
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type skill name and press Enter (e.g. React, Node.js)"
            className="flex-1 rounded-2xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1 rounded-2xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-brand/90"
          >
            <FiPlus /> Add
          </button>
        </div>
      )}
    </div>
  );
}
