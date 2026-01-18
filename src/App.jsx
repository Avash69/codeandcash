import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Footer from "./components/common/Footer.jsx";
import Header from "./components/common/Header.jsx";
import TaskProvider from "./context/TaskProvider.jsx";
import AppRoutes from "./routes/index.jsx";
import "./index.css";


// Component to handle conditional header/footer rendering
const AppContent = () => {
  const location = useLocation();

  // Hide header and footer on admin routes and auth pages
  const hideHeaderFooter =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/login" ||
    location.pathname === "/signup";

  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeaderFooter && <Header />}
      <main className={hideHeaderFooter ? "min-h-screen" : "flex-grow"}>
        <AppRoutes />
      </main>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <TaskProvider>
      <Router>
        <AppContent />
      </Router>
    </TaskProvider>
  );
}

export default App;
