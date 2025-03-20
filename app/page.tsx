import Features from "@/components/landing page/Features";
import Footer from "@/components/landing page/Footer";
import Hero from "@/components/landing page/Hero";
import PoweredBy from "@/components/landing page/PoweredBy";
import NavBar from "@/components/navbar/NavBar";

export default function Home() {
  return (
    <div className="from-background dark:from-background flex min-h-screen flex-col bg-gradient-to-b to-slate-50 dark:to-slate-950">
      <NavBar showSignIn={true} />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 md:px-8">
        {/* Hero Section */}
        <Hero />

        {/* Features Section */}
        <Features />

        {/* Tech Stack Section */}
        <PoweredBy />
      </main>

      <Footer />
    </div>
  );
}
