'use client';

import { ArrowRight, Calendar, Users, Clock, BarChart3, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="w-full">
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
              AQ
            </div>
            <span className="text-xl font-semibold text-foreground">AppointmentQ</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground/70 hover:text-foreground transition">
              Features
            </a>
            <a href="#pricing" className="text-foreground/70 hover:text-foreground transition">
              Pricing
            </a>
            <a href="#about" className="text-foreground/70 hover:text-foreground transition">
              About
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-accent/5" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block mb-6 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-sm font-medium text-primary">✨ Streamline Your Appointments</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
              Smart Appointment Management for Modern Businesses
            </h1>
            <p className="text-xl text-foreground/70 mb-8 leading-relaxed max-w-2xl mx-auto">
              Manage staff, services, and customer appointments with intelligent queue management. Handle conflicts, track availability, and keep everything organized in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-primary/20 text-foreground bg-transparent">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Everything You Need</h2>
            <p className="text-xl text-foreground/70">Powerful tools designed for service businesses</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background rounded-xl border border-border p-8 hover:border-primary/50 transition">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Appointment Management</h3>
              <p className="text-foreground/70">
                Create, edit, and manage appointments with an intuitive interface. Automatic conflict detection keeps your schedule clean.
              </p>
            </div>

            <div className="bg-background rounded-xl border border-border p-8 hover:border-primary/50 transition">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Staff & Service Setup</h3>
              <p className="text-foreground/70">
                Define staff members with their service types and daily capacity. Set availability status and manage services easily.
              </p>
            </div>

            <div className="bg-background rounded-xl border border-border p-8 hover:border-primary/50 transition">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Queue Management</h3>
              <p className="text-foreground/70">
                Automatically queue appointments when staff is booked. Assign from queue with one click when capacity opens up.
              </p>
            </div>

            <div className="bg-background rounded-xl border border-border p-8 hover:border-primary/50 transition">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Smart Dashboard</h3>
              <p className="text-foreground/70">
                Get real-time insights with total appointments, completion rates, staff load summaries, and waiting queue counts.
              </p>
            </div>

            <div className="bg-background rounded-xl border border-border p-8 hover:border-primary/50 transition">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Conflict Detection</h3>
              <p className="text-foreground/70">
                Intelligent system prevents double-booking. Get warnings when staff exceeds capacity or has scheduling conflicts.
              </p>
            </div>

            <div className="bg-background rounded-xl border border-border p-8 hover:border-primary/50 transition">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Activity Log</h3>
              <p className="text-foreground/70">
                Track important actions like queue assignments and appointment changes. Stay informed with detailed activity history.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-xl text-foreground/70">Get started in minutes, not hours</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Setup Staff</h3>
              <p className="text-foreground/70">Add staff members with their service types and daily capacity limits.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Define Services</h3>
              <p className="text-foreground/70">Create services with duration and required staff type requirements.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Book Appointments</h3>
              <p className="text-foreground/70">Customers book appointments, system automatically checks for conflicts.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Manage Queue</h3>
              <p className="text-foreground/70">Assign queued appointments when staff becomes available.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Simple Pricing</h2>
            <p className="text-xl text-foreground/70">Choose the perfect plan for your business</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background rounded-xl border border-border p-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">Starter</h3>
              <p className="text-foreground/70 mb-6">Perfect for small teams</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">$29</span>
                <span className="text-foreground/70">/month</span>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 mb-6">Get Started</Button>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-foreground/70">
                  <div className="w-4 h-4 bg-primary rounded-full" />
                  Up to 10 staff members
                </li>
                <li className="flex items-center gap-3 text-foreground/70">
                  <div className="w-4 h-4 bg-primary rounded-full" />
                  Unlimited appointments
                </li>
                <li className="flex items-center gap-3 text-foreground/70">
                  <div className="w-4 h-4 bg-primary rounded-full" />
                  Basic reporting
                </li>
              </ul>
            </div>

            <div className="bg-primary/5 rounded-xl border-2 border-primary p-8 relative">
              <div className="absolute -top-4 left-8 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Professional</h3>
              <p className="text-foreground/70 mb-6">For growing businesses</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">$79</span>
                <span className="text-foreground/70">/month</span>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 mb-6">Get Started</Button>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-foreground/70">
                  <div className="w-4 h-4 bg-primary rounded-full" />
                  Up to 50 staff members
                </li>
                <li className="flex items-center gap-3 text-foreground/70">
                  <div className="w-4 h-4 bg-primary rounded-full" />
                  Unlimited appointments
                </li>
                <li className="flex items-center gap-3 text-foreground/70">
                  <div className="w-4 h-4 bg-primary rounded-full" />
                  Advanced analytics
                </li>
                <li className="flex items-center gap-3 text-foreground/70">
                  <div className="w-4 h-4 bg-primary rounded-full" />
                  Activity logs
                </li>
              </ul>
            </div>

            <div className="bg-background rounded-xl border border-border p-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">Enterprise</h3>
              <p className="text-foreground/70 mb-6">For large organizations</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">Custom</span>
              </div>
              <Button variant="outline" className="w-full mb-6 border-primary/20 text-foreground bg-transparent">
                Contact Sales
              </Button>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-foreground/70">
                  <div className="w-4 h-4 bg-primary rounded-full" />
                  Unlimited staff members
                </li>
                <li className="flex items-center gap-3 text-foreground/70">
                  <div className="w-4 h-4 bg-primary rounded-full" />
                  Unlimited appointments
                </li>
                <li className="flex items-center gap-3 text-foreground/70">
                  <div className="w-4 h-4 bg-primary rounded-full" />
                  Custom integrations
                </li>
                <li className="flex items-center gap-3 text-foreground/70">
                  <div className="w-4 h-4 bg-primary rounded-full" />
                  Priority support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-primary/10 to-accent/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">Ready to Transform Your Appointments?</h2>
          <p className="text-xl text-foreground/70 mb-8">
            Join hundreds of businesses managing their appointments smarter with AppointmentQ.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                  AQ
                </div>
                <span className="font-semibold text-foreground">AppointmentQ</span>
              </div>
              <p className="text-foreground/70">Smart appointment management for modern businesses.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-foreground/70">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-foreground/70">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-foreground/70">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8">
            <p className="text-center text-foreground/70">
              © 2026 AppointmentQ. All rights reserved. Made with ❤️ for service businesses.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
