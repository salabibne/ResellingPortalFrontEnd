import BuilderShell from "@/components/homepage-admin/BuilderShell";

export default function AdminCustomPageBuilderPage({ params }: { params: { id: string } }) {
  return <BuilderShell pageId={params.id} />;
}
