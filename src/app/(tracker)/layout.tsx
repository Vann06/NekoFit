import type { ReactNode } from "react";

type TrackerLayoutProps = {
  children: ReactNode;
};

export default function TrackerLayout({ children }: TrackerLayoutProps) {
  return <div className="tracker-layout">{children}</div>;
}
