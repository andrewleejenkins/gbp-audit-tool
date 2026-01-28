import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  CheckCircle,
  BarChart3,
  FileText,
  Zap,
} from "lucide-react";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl">GBP Audit Tool</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/login">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Optimize Your Google Business Profile
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Get a comprehensive audit of your Google Business Profile with actionable
            recommendations to improve your local search visibility and customer engagement.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Free Audit
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mt-32">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Optimize Your GBP
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<CheckCircle className="h-8 w-8 text-green-600" />}
              title="Comprehensive Checklist"
              description="10 categories covering all aspects of your Google Business Profile optimization."
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8 text-blue-600" />}
              title="Scoring System"
              description="Get a clear score for each category and an overall optimization score."
            />
            <FeatureCard
              icon={<FileText className="h-8 w-8 text-purple-600" />}
              title="Actionable Insights"
              description="Specific recommendations on what to fix and how to improve your profile."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8 text-yellow-600" />}
              title="Quick Analysis"
              description="Get results in seconds with our automated audit engine."
            />
          </div>
        </div>

        {/* Checklist Categories Preview */}
        <div className="mt-32">
          <h2 className="text-3xl font-bold text-center mb-12">
            What We Check
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {[
              "Categories",
              "Description",
              "Service Areas",
              "Business Hours",
              "Contact Info",
              "Services",
              "Products",
              "Photos",
              "Posts",
              "Reviews",
            ].map((item) => (
              <div
                key={item}
                className="bg-white rounded-lg border p-4 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="font-medium text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-32 text-center bg-blue-600 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Optimize Your Profile?
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Join thousands of businesses who have improved their local search
            visibility with our GBP audit tool.
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Start Your Free Audit
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <span className="font-semibold">GBP Audit Tool</span>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} GBP Audit Tool. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
