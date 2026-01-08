import { LazyMotion, domAnimation, m } from "framer-motion";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Features", to: "/features" },
        { label: "How it Works", to: "/#how-it-works" },
        { label: "Pricing", to: "/pricing" },
        { label: "FAQ", to: "/faq" },
      ],
    },
    {
      title: "For Developers",
      links: [
        { label: "Browse Tasks", to: "/explore" },
        { label: "Success Stories", to: "/success-stories" },
        { label: "Documentation", to: "/docs" },
        { label: "API Reference", to: "/api" },
      ],
    },
    {
      title: "For Business",
      links: [
        { label: "Post a Task", to: "/post-task" },
        { label: "Find Developers", to: "/find-developers" },
        { label: "Enterprise", to: "/enterprise" },
        { label: "Case Studies", to: "/case-studies" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", to: "/about" },
        { label: "Blog", to: "/blog" },
        { label: "Careers", to: "/careers" },
        { label: "Contact", to: "/contact" },
      ],
    },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-t bg-navy border-border"
      >
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {footerSections.map((section, sectionIndex) => (
              <m.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
              >
                <h3 className="mb-4 text-sm font-semibold tracking-wider uppercase text-indigo">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <m.li
                      key={link.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: sectionIndex * 0.1 + linkIndex * 0.05,
                      }}
                    >
                      <Link
                        to={link.to}
                        className="transition-colors text-text-secondary hover:text-indigo"
                      >
                        {link.label}
                      </Link>
                    </m.li>
                  ))}
                </ul>
              </m.div>
            ))}
          </div>

          <m.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="pt-8 mt-12 border-t border-border"
          >
            <div className="flex flex-col items-center justify-between md:flex-row">
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-lg font-semibold text-indigo">
                  codexa
                </Link>
                <span className="text-border">|</span>
                <span className="text-text-secondary">
                  © 2025 All rights reserved
                </span>
              </div>
              <div className="flex items-center mt-4 space-x-6 md:mt-0">
                {[
                  {
                    name: "Twitter",
                    href: "https://twitter.com",
                    icon: "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84",
                  },
                  {
                    name: "GitHub",
                    href: "https://github.com",
                    icon: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z",
                  },
                  {
                    name: "LinkedIn",
                    href: "https://linkedin.com",
                    icon: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
                  },
                ].map((item) => (
                  <m.a
                    key={item.name}
                    whileHover={{ scale: 1.1 }}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo hover:text-indigo-hover"
                  >
                    <span className="sr-only">{item.name}</span>
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d={item.icon} />
                    </svg>
                  </m.a>
                ))}
              </div>
            </div>
          </m.div>
        </div>
      </m.footer>
    </LazyMotion>
  );
};

export default Footer;
