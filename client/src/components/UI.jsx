import{motion}from"framer-motion";
export const Card=({children,className=""})=><div className={`glass rounded-3xl ${className}`}>{children}</div>;
export const Reveal=({children,delay=0})=><motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.55,delay}}>{children}</motion.div>;
export const Heading=({label,title,desc})=><div><div className="label">{label}</div><h2 className="title">{title}</h2>{desc&&<p className="muted max-w-2xl text-lg leading-8">{desc}</p>}</div>;