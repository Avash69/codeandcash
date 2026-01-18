/**
 * Main layout component with header and footer
 */

import { Outlet } from "react-router-dom";
import { Footer, Header } from "../components/common";

export const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary transition-colors duration-300">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
