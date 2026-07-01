"use client";

import type { TravelerBasicInput, TravelerGender } from "@/lib/travelers";

const GENDER_OPTIONS: { value: TravelerGender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "unspecified", label: "Unspecified" },
];

export function TravelerBasicForm({
  label,
  value,
  onChange,
  labelCls,
  fieldCls,
}: {
  label: string;
  value: TravelerBasicInput;
  onChange: (next: TravelerBasicInput) => void;
  labelCls: string;
  fieldCls: string;
}) {
  return (
    <div className="rounded-xl border border-ink/[0.08] bg-cream/30 p-4">
      <div className="mb-3 font-sans text-[13px] font-semibold text-ink">{label}</div>
      <div className="flex flex-col gap-3">
        <div>
          <label className={labelCls}>Full name</label>
          <input
            type="text"
            value={value.fullName}
            onChange={(e) => onChange({ ...value, fullName: e.target.value })}
            className={fieldCls}
            placeholder="As shown on government ID or passport"
            autoComplete="name"
            required
          />
          <p className="mt-1 mb-0 text-[11px] leading-[1.4] text-muted">
            Must exactly match official government ID or passport.
          </p>
        </div>
        <div>
          <label className={labelCls}>Date of birth</label>
          <input
            type="date"
            value={value.dateOfBirth}
            onChange={(e) => onChange({ ...value, dateOfBirth: e.target.value })}
            className={fieldCls}
            required
          />
        </div>
        <div>
          <label className={labelCls}>Gender</label>
          <select
            value={value.gender}
            onChange={(e) =>
              onChange({ ...value, gender: e.target.value as TravelerGender })
            }
            className={`${fieldCls} cursor-pointer bg-white`}
            required
          >
            {GENDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="mt-1 mb-0 text-[11px] leading-[1.4] text-muted">
            Required for secure flight screening (TSA).
          </p>
        </div>
      </div>
    </div>
  );
}

export const emptyTravelerBasic = (): TravelerBasicInput => ({
  fullName: "",
  dateOfBirth: "",
  gender: "unspecified",
});
