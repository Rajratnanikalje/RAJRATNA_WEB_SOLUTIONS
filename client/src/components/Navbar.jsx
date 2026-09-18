import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  ["/", "Home"],
  ["/about", "About"],
  ["/services", "Services"],
  ["/portfolio", "Portfolio"],
  ["/technologies", "Technologies"],
  ["/contact", "Contact"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="container border-b border-white/5">
        <div className="h-[76px] flex items-center justify-between">
          <Link to="/" onClick={() => setOpen(false)} className="leading-none">
            <span className="text-xl font-bold text-white">
              RAJRATNA <span className="text-[#78a9ff]">.</span>
            </span>
            <span className="block text-[9px] tracking-[.26em] text-slate-500 mt-0.5">
              WEB SOLUTIONS
            </span>
          </Link>

          <nav className="hidden lg:flex gap-8 text-[13px] font-medium text-slate-300">
            {links.map(([u, n]) => (
              <NavLink
                key={u}
                to={u}
                end={u === "/"}
                className={({ isActive }) =>
                  isActive
                    ? "text-[#78a9ff] after:block after:h-px after:bg-[#78a9ff] after:mt-1 after:w-full"
                    : "hover:text-white transition-colors after:block after:h-px after:bg-transparent after:mt-1 after:w-full hover:after:bg-[#78a9ff]/40"
                }
              >
                {n}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/contact"
            className="primary hidden sm:inline-flex text-xs py-3"
          >
            Get a Quote <ArrowUpRight size={14} />
          </Link>

          <button
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="lg:hidden absolute top-full left-0 right-0 glass border-t border-white/10"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <nav className="container py-4 flex flex-col gap-1">
              {links.map(([u, n]) => (
                <Link
                  key={u}
                  to={u}
                  onClick={() => setOpen(false)}
                  className="py-3 px-2 text-slate-300 hover:text-white transition-colors"
                >
                  {n}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="primary text-sm justify-center mt-2"
              >
                Get a Quote <ArrowUpRight size={14} />
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-[-1]"
          onClick={() => setOpen(false)}
        />
      )}
    </header>
  );
}
