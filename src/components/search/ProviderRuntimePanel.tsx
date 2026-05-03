"use client";

import type { ProviderRuntimeReport } from "@/types/research";

type RuntimeReadiness = ProviderRuntimeReport["providers"][number]["readiness"];

const readinessClass: Record<RuntimeReadiness, string> = {
  configured: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  available_no_key_needed: "border-blue-300/30 bg-blue-300/10 text-blue-100",
  missing_key: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  forced_mock_disabled: "border-slate-300/20 bg-slate-300/5 text-slate-300",
  static_demo_disabled: "border-slate-300/20 bg-slate-300/5 text-slate-300"
};

function readinessLabel(readiness: RuntimeReadiness): string {
  const labels: Record<RuntimeReadiness, string> = {
    configured: "Configured",
    available_no_key_needed: "No key needed",
    missing_key: "Missing key",
    forced_mock_disabled: "Mock-only disabled",
    static_demo_disabled: "Static demo disabled"
  };
  return labels[readiness];
}

export function ProviderRuntimePanel({ report }: { report: ProviderRuntimeReport }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft" aria-label="Provider runtime readiness">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Runtime validation</p>
          <h2 className="mt-1 text-xl font-bold text-white">Real provider readiness</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Shows whether this running surface can execute live provider calls. Static GitHub Pages is mock-only; Vercel or another Next.js runtime is required for Brave, Tavily, and Wikimedia validation.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-slate-300">
          <p><span className="text-slate-500">Host:</span> {report.runtime_host.replaceAll("_", " ")}</p>
          <p><span className="text-slate-500">Live-ready providers:</span> {report.live_provider_ready_count}</p>
          <p><span className="text-slate-500">Version:</span> {report.app_version}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {report.providers.map((provider) => (
          <article key={provider.provider} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold capitalize text-white">{provider.provider}</h3>
              <span className={`rounded-full border px-2 py-1 text-[11px] ${readinessClass[provider.readiness]}`}>
                {readinessLabel(provider.readiness)}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">{provider.message}</p>
            {provider.required_env && (
              <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-2 text-[11px] text-amber-100">
                Required env: <span className="font-semibold">{provider.required_env}</span>
              </p>
            )}
            <p className="mt-3 line-clamp-2 text-[11px] leading-5 text-slate-500">Endpoints: {provider.endpoint_sample.join(" · ")}</p>
          </article>
        ))}
      </div>

      {report.recommended_next_steps.length > 0 && (
        <div className="mt-4 rounded-2xl border border-lime-300/20 bg-lime-300/[0.06] p-3 text-xs leading-5 text-lime-100">
          <p className="font-semibold">Runtime test next steps:</p>
          <ul className="mt-1 list-disc pl-5">
            {report.recommended_next_steps.map((step) => <li key={step}>{step}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}
