import type { ReactNode } from "react";
import type { SectionRenderProps, TeamMember } from "../types";
import SectionFrame from "../SectionFrame";
import SafeImage from "../SafeImage";
import { EmptySection, SectionHeading } from "../primitives";

const TEAM_GRID: Record<number, string> = {
  1: "grid-cols-1 max-w-sm mx-auto",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

function getMembers({ section, resources }: SectionRenderProps): TeamMember[] {
  const limit = Math.min(Math.max(Number(section.settings.limit ?? 12), 1), 24);
  return (resources.team || []).slice(0, limit);
}

function Avatar({ member, size }: { member: TeamMember; size: string }) {
  return (
    <div
      className={`${size} shrink-0 overflow-hidden rounded-full bg-base-200 ring-4 ring-primary/15 shadow-md`}
    >
      {member.imageUrl ? (
        <SafeImage src={member.imageUrl} alt={member.name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-2xl font-black text-primary">
          {member.name.slice(0, 1).toUpperCase()}
        </div>
      )}
    </div>
  );
}

function TeamShell({
  props,
  members,
  children,
}: {
  props: SectionRenderProps;
  members: TeamMember[];
  children: ReactNode;
}) {
  const { section, mode = "view" } = props;
  if (members.length === 0) {
    if (mode !== "edit") return null;
    return (
      <SectionFrame section={section}>
        <SectionHeading section={section} className="mb-6" />
        <EmptySection message="Add team members in CMS → Our Team to fill this section." />
      </SectionFrame>
    );
  }
  const columns = Math.min(Math.max(Number(section.settings.columns ?? 4), 1), 4);
  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} className="mb-8 sm:mb-10" />
      <div className={`grid gap-8 sm:gap-6 ${TEAM_GRID[columns]}`}>{children}</div>
    </SectionFrame>
  );
}

/**
 * Variant: circles — round photo, name, and the description in a soft rounded
 * "bubble" below the photo.
 */
export function TeamCircles(props: SectionRenderProps) {
  const members = getMembers(props);
  return (
    <TeamShell props={props} members={members}>
      {members.map((member) => (
        <div key={member.id} className="flex flex-col items-center text-center">
          <Avatar member={member} size="h-32 w-32 sm:h-36 sm:w-36" />
          <h3 className="mt-4 text-base sm:text-lg font-extrabold break-words">{member.name}</h3>
          {member.designation && (
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {member.designation}
            </p>
          )}
          {member.message && (
            <div className="mt-4 w-full rounded-[2rem] bg-primary/5 px-5 py-4 ring-1 ring-primary/10">
              <p className="text-sm leading-relaxed text-base-content/75 whitespace-pre-line break-words">
                {member.message}
              </p>
            </div>
          )}
        </div>
      ))}
    </TeamShell>
  );
}

/** Variant: cards — a rounded card per member. */
export function TeamCards(props: SectionRenderProps) {
  const members = getMembers(props);
  return (
    <TeamShell props={props} members={members}>
      {members.map((member) => (
        <div
          key={member.id}
          className="flex h-full flex-col items-center rounded-[2rem] border border-base-200 bg-base-100 p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <Avatar member={member} size="h-24 w-24 sm:h-28 sm:w-28" />
          <h3 className="mt-4 text-base font-extrabold break-words">{member.name}</h3>
          {member.designation && (
            <p className="text-xs font-semibold text-primary">{member.designation}</p>
          )}
          {member.message && (
            <p className="mt-3 text-sm leading-relaxed text-base-content/70 whitespace-pre-line break-words">
              {member.message}
            </p>
          )}
        </div>
      ))}
    </TeamShell>
  );
}
