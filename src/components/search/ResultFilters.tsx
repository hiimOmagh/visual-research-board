"use client";

import type React from "react";
import type { LicenseDetected, ProviderName, ResultType, RiskLevel } from "@/types/research";
import { LICENSE_TYPES, PROVIDERS, RESULT_TYPES, RISK_LEVELS } from "@/types/research";
import { licenseLabel, riskLabel } from "@/lib/risk";

export interface ResultFilterState {
  type: "all" | ResultType;
  provider: "all" | ProviderName;
  risk: "all" | RiskLevel;
  license: "all" | LicenseDetected;
  source: string;
  savedOnly: boolean;
  minOverall: number;
}

interface ResultFiltersProps {
  filters: ResultFilterState;
  onChange: (filters: ResultFilterState) => void;
  totalCount: number;
  visibleCount: number;
}

export const defaultResultFilters: ResultFilterState = {
  type: "all",
  provider: "all",
  risk: "all",
  license: "all",
  source: "",
  savedOnly: false,
  minOverall: 0
};

export function ResultFilters({ filters, onChange, totalCount, visibleCount }: ResultFiltersProps) {
  const update = <K extends keyof ResultFilterState>(key: K, value: ResultFilterState[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Result controls</p>
          <h2 className="mt-1 text-xl font-bold text-white">{visibleCount} visible / {totalCount} total</h2>
        </div>
        <button
          type="button"
          onClick={() => onChange(defaultResultFilters)}
          className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-200 hover:border-lime-300/50"
        >
          Reset filters
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <FilterSelect label="Type" value={filters.type} onChange={(value) => update("type", value as ResultFilterState["type"])}>
          <option value="all">All types</option>
          {RESULT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
        </FilterSelect>

        <FilterSelect label="Provider" value={filters.provider} onChange={(value) => update("provider", value as ResultFilterState["provider"])}>
          <option value="all">All providers</option>
          {PROVIDERS.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
        </FilterSelect>

        <FilterSelect label="Risk" value={filters.risk} onChange={(value) => update("risk", value as ResultFilterState["risk"])}>
          <option value="all">All risk levels</option>
          {RISK_LEVELS.map((risk) => <option key={risk} value={risk}>{riskLabel(risk)}</option>)}
        </FilterSelect>

        <FilterSelect label="License" value={filters.license} onChange={(value) => update("license", value as ResultFilterState["license"])}>
          <option value="all">All licenses</option>
          {LICENSE_TYPES.map((license) => <option key={license} value={license}>{licenseLabel(license)}</option>)}
        </FilterSelect>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-slate-300">Source contains</span>
          <input
            value={filters.source}
            onChange={(event) => update("source", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-lime-300/40 focus:ring-4"
            placeholder="commons, gov, archive..."
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-slate-300">Min score</span>
          <select
            value={filters.minOverall}
            onChange={(event) => update("minOverall", Number(event.target.value))}
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-lime-300/40 focus:ring-4"
          >
            <option value={0}>Any score</option>
            <option value={0.6}>60%+</option>
            <option value={0.7}>70%+</option>
            <option value={0.8}>80%+</option>
          </select>
        </label>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={filters.savedOnly}
          onChange={(event) => update("savedOnly", event.target.checked)}
          className="h-4 w-4 accent-lime-300"
        />
        Show saved items only
      </label>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-slate-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-lime-300/40 focus:ring-4"
      >
        {children}
      </select>
    </label>
  );
}
