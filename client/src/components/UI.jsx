import { motion, useReducedMotion } from "framer-motion";
/* `ref` is forwarded to the underlying element so callers can scroll/highlight a card. */
export const Card = ({ children, className = "", ref, ...rest }) => (
  <div ref={ref} className={`glass rounded-3xl ${className}`} {...rest}>
    {children}
  </div>
);
export const Reveal = ({ children, delay = 0, immediate = false }) => {
  const prefersReducedMotion = useReducedMotion();
  const animateOnScroll = !immediate && prefersReducedMotion === false;

  return (
    <motion.div
      initial={animateOnScroll ? { opacity: 0.94, y: 8 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={
        animateOnScroll
          ? { duration: 0.42, delay, ease: "easeOut" }
          : { duration: 0 }
      }
    >
      {children}
    </motion.div>
  );
};
export const Heading = ({ label, title, desc }) => (
  <div>
    <div className="label">{label}</div>
    <h2 className="title">{title}</h2>
    {desc && <p className="muted max-w-2xl text-lg leading-8">{desc}</p>}
  </div>
);
