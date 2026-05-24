import { Link } from "wouter";
import { TopNav } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Activity, Clock, CheckCircle2, ChevronRight, Terminal, Network, Code, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
      <TopNav />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 px-4 border-b overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10"></div>
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl space-y-8"
            >
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold bg-muted/50 backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                Aero QA Engine v2.0 is live
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-balance leading-[1.1]">
                Aerospace-grade test coverage. <br /><span className="text-primary">In seconds.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                A precision instrument for elite QA teams. Automatically generate exhaustive test cases from PRDs, OpenAPI specs, and user flows using advanced AI models tailored for engineering rigor.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link href="/dashboard">
                  <Button size="lg" className="h-12 px-8 text-base">Start Generating <ChevronRight className="ml-2 h-4 w-4" /></Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm">View Platform Specs</Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 mt-12 border-t border-border/50">
                <div className="flex flex-col gap-2">
                  <div className="text-4xl font-bold font-mono tracking-tight text-foreground">80<span className="text-primary">%</span></div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Reduction in authoring time</div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-4xl font-bold font-mono tracking-tight text-foreground">95<span className="text-primary">%</span></div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">API test coverage</div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-4xl font-bold font-mono tracking-tight text-foreground">&lt;30<span className="text-primary">m</span></div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Time to first test suite</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Engineered for absolute confidence</h2>
              <p className="text-muted-foreground text-lg">Stop writing boilerplate. Let the AI handle the mechanical translation of requirements into code, so you can focus on strategy.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Requirement Ingestion", desc: "Upload PRDs, JIRA tickets, or raw text. The engine parses and structures requirements instantly.", icon: Layers },
                { title: "API Test Generator", desc: "Feed an OpenAPI yaml and receive fully mocked Jest or PyTest suites covering all endpoints.", icon: Code },
                { title: "Frontend Flow Analyzer", desc: "Describe a user journey and get robust Playwright or Cypress E2E tests ready to run.", icon: Activity },
                { title: "Edge Case Engine", desc: "Our models are tuned to aggressively seek out security boundaries, state mutations, and concurrency limits.", icon: ShieldCheck },
                { title: "Traceability Matrix", desc: "Automatically map generated tests back to the originating requirement. Prove coverage instantly.", icon: Network },
                { title: "Conversational Refinement", desc: "Not quite right? Chat with the agent to mutate the test suite, add missing cases, or switch frameworks.", icon: Terminal }
              ].map((feature, i) => (
                <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <feature.icon className="h-8 w-8 text-primary mb-4" />
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section id="comparison" className="py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">The superiority is measurable.</h2>
              <p className="text-muted-foreground text-lg">How Aero QA stacks up against legacy methods and generic AI tools.</p>
            </div>

            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-4 font-medium text-muted-foreground">Capability</th>
                    <th className="p-4 font-bold text-foreground border-l border-primary/20 bg-primary/5">Aero QA</th>
                    <th className="p-4 font-medium text-muted-foreground border-l">GitHub Copilot</th>
                    <th className="p-4 font-medium text-muted-foreground border-l">Legacy SaaS (Mabl, etc)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    ["Requirement-to-test mapping", true, false, true],
                    ["Zero-config OpenAPI digestion", true, false, false],
                    ["Deep edge-case extrapolation", true, false, false],
                    ["Conversational test refinement", true, true, false],
                    ["Outputs standard code (Jest, Cypress)", true, true, false],
                    ["Traceability matrix generation", true, false, false],
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{row[0]}</td>
                      <td className="p-4 border-l border-primary/20 bg-primary/5">
                        {row[1] ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="p-4 border-l">
                        {row[2] ? <CheckCircle2 className="h-5 w-5 text-muted-foreground" /> : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="p-4 border-l">
                        {row[3] ? <CheckCircle2 className="h-5 w-5 text-muted-foreground" /> : <span className="text-muted-foreground">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 px-4 bg-muted/30 border-t">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12 text-center">Trusted by high-velocity teams</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-8">
                  <p className="text-lg italic text-muted-foreground mb-6">"It fundamentally changed how we ship. We dump the PRD into Aero, and by the time the devs have the feature branch up, I have 40 exhaustive tests ready to run against it."</p>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">A</div>
                    <div>
                      <div className="font-bold">Alex</div>
                      <div className="text-sm text-muted-foreground">Senior QA Engineer</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-8">
                  <p className="text-lg italic text-muted-foreground mb-6">"The traceability matrix alone justifies the tool. I can definitively prove to stakeholders that every acceptance criteria is covered by a test in our CI pipeline."</p>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">J</div>
                    <div>
                      <div className="font-bold">Jamie</div>
                      <div className="text-sm text-muted-foreground">Product Manager</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-8">
                  <p className="text-lg italic text-muted-foreground mb-6">"I don't dread writing tests anymore because I don't write them. I generate them, review the logic, and merge. It catches edge cases I wouldn't have thought of."</p>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">S</div>
                    <div>
                      <div className="font-bold">Sam</div>
                      <div className="text-sm text-muted-foreground">Frontend Developer</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-8">
                  <p className="text-lg italic text-muted-foreground mb-6">"Deploy confidence is at an all-time high. The edge case engine found a concurrency bug in our payments API before it ever hit staging."</p>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">M</div>
                    <div>
                      <div className="font-bold">Morgan</div>
                      <div className="text-sm text-muted-foreground">Engineering Manager</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4 text-center">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-4xl font-bold tracking-tight mb-6">Ready to upgrade your QA workflow?</h2>
            <p className="text-xl text-muted-foreground mb-8">Deploy aerospace-grade testing in minutes, not months.</p>
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-10 text-lg">Start Generating Now <Zap className="ml-2 h-5 w-5" /></Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t bg-muted/20 text-center text-muted-foreground text-sm">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Aero QA Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}