import Header from "../components/containers/Header";
import { SidebarInset } from "../components/ui/sidebar";

export default function PageLayout(props: {
  children: React.ReactNode;
  title: string;
}) {
  const { children, title } = props;
  return (
    <SidebarInset>
      <Header title={title} />
      {children}
    </SidebarInset>
  );
}
