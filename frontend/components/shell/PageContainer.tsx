import PageHeader from "@/components/ui/PageHeader";

export default function PageContainer({
  title,
  subtitle,
  actions,
  children
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="page-container">
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      {children}
    </section>
  );
}
