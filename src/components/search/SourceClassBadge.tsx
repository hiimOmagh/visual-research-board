import type { BroadReferenceSourceClass } from "@/types/broad-reference-result";
import { describeBroadReferenceSourceClass } from "@/lib/broad-reference-result";

type SourceClassBadgeProps = {
  sourceClass: BroadReferenceSourceClass;
};

export function SourceClassBadge({ sourceClass }: SourceClassBadgeProps) {
  return (
    <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-slate-200">
      {describeBroadReferenceSourceClass(sourceClass)}
    </span>
  );
}
