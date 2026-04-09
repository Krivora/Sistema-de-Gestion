import { useState } from "react";
import { Outlet }   from "react-router-dom";
import Sidebar       from "./Sidebar";
import Navbar        from "./Navbar";

export default function Layout() {
  const [open,      setOpen]      = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const sidebarW = collapsed ? "md:ml-[68px]" : "md:ml-60";

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--color-bg)", color: "var(--color-text-primary)" }}
    >
      <Sidebar
        open={open}
        setOpen={setOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarW} min-w-0`}>
        <Navbar setOpen={setOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}