/**
 * Footer component for the landing page
 * Displays copyright information and navigation links
 */
const Footer = () => {
  return (
    <footer className="border-muted/20 border-t py-6">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} Mistral AI Chat. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/MatthieuMordrel/mistra_ai_chattt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Next.js
          </a>
          <a
            href="https://mistral.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Mistral AI
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
