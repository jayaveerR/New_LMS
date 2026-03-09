import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import WhyAOTMS from "@/components/landing/WhyAOTMS";
import HowItWorks from "@/components/landing/HowItWorks";
import KeyFeatures from "@/components/landing/KeyFeatures";
import Leaderboard from "@/components/landing/Leaderboard";
import Instructors from "@/components/landing/Instructors";
import Testimonials from "@/components/landing/Testimonials";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <div id="home-content" className="bg-background relative z-10">

        <Header />
        <main>
          <div id="main-content">
            <HeroSection />
          </div>
          <WhyAOTMS />
          <HowItWorks />
          <KeyFeatures />
          <Leaderboard />
          <Instructors />
          <Testimonials />
          <FAQSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Home;
