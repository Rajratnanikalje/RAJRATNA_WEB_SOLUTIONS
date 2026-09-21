import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Card, Reveal, Heading } from "../components/UI";

export default function NotFound() {
  return (
    <section className="section pt-40">
      <div className="container">
        <Reveal>
          <Heading
            label="404"
            title="Page not found."
            desc="The page you are looking for does not exist, may have been moved, or the link is broken."
          />
        </Reveal>

        <Reveal delay={0.15}>
          <Card className="p-7 mt-10 max-w-xl">
            <p className="muted text-sm leading-7">
              Check the address in your browser, or jump back into the site.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link to="/" className="primary">
                <ArrowLeft size={15} /> Back to home
              </Link>
              <Link to="/contact" className="secondary">
                Contact us <ArrowUpRight size={15} />
              </Link>
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
