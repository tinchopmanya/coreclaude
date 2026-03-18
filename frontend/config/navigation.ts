export type NavItem = {
  href: string;
  label: string;
  description: string;
};

export const appNavigation: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", description: "Overview and quick actions" },
  { href: "/projects/1", label: "Project Example", description: "Example module detail route" }
];
