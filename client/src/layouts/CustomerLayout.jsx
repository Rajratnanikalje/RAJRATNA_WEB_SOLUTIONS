import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingContactActions from "../components/FloatingContactActions";
export default () => (
  <>
    <Navbar />
    <main>
      <Outlet />
    </main>
    <Footer />
    <FloatingContactActions />
  </>
);
