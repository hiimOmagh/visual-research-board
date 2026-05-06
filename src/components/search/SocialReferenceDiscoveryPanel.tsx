
import type { SocialReferenceCandidate } from "@/types/social-reference";
import {
  createSocialReferenceDiscoveryNotes,
  inferSocialReferencePlatform,
  normalizeSocialReferenceCandidate
} from "@/lib/social-reference-discovery";
import { SourceClassBadge } from "@/components/search/SourceClassBadge";

type SocialReferenceDiscoveryPanelProps = {
  candidate: SocialReferenceCandidate;
};

export function SocialReferenceDiscoveryPanel({ candidate }: SocialReferenceDiscoveryPanelProps) {
  const normalized = normalizeSocialReferenceCandidate(candidate);
  const platform = normalized.platform;
  const notes = createSocialReferenceDiscoveryNotes(platform);

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-slate-100 shadow-sm">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Social reference discovery
            </p>
            <h2 className="mt-1 text-lg font-semibold">{candidate.title ?? "Public social reference"}</h2>
            <p className="mt-2 text-sm text-slate-300">
              Public social references are discovery objects for trend, creator, platform, and visual context.
              This layer does not enable private scraping, login bypass, hidden API abuse, or media rehosting.
            </p>
          </div>
          <SourceClassBadge sourceClass="social_media" />
        </div>

        <div className="grid gap-2 text-sm md:grid-cols-3">
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Platform</p>
            <p className="mt-1 font-medium">{platform}</p>
          </div>
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Content type</p>
            <p className="mt-1 font-medium">{normalized.content_type}</p>
          </div>
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Access state</p>
            <p className="mt-1 font-medium">{normalized.access_state}</p>
          </div>
        </div>

        <ul className="space-y-1 text-xs text-slate-400">
          {notes.map((note) => (
            <li key={note}>• {note}</li>
          ))}
        </ul>

        <p className="sr-only">{inferSocialReferencePlatform(candidate.source_url)}</p>
      </div>
    </section>
  );
}
