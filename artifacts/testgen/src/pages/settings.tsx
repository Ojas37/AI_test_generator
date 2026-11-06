import { useListProjects, useCreateProject } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, Github, Gitlab, ShieldAlert } from "lucide-react";

export default function Settings() {
  const { data: projects, isLoading } = useListProjects();

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings & Integrations</h1>
          <p className="text-muted-foreground mt-1">Configure your workspace and CI/CD pipelines.</p>
        </div>

        <Tabs defaultValue="cicd">
          <TabsList className="mb-6">
            <TabsTrigger value="cicd">CI/CD Integrations</TabsTrigger>
            <TabsTrigger value="projects">Projects & Thresholds</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cicd" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Github className="h-5 w-5" /> GitHub Actions</CardTitle>
                <CardDescription>Integrate test generation directly into your PR workflows.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto text-muted-foreground">
                  <pre><code>{`name: Aero QA Generation
on: [pull_request]

jobs:
  generate-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Generate Tests
        uses: aero-qa/action@v1
        with:
          api-key: \${{ secrets.AERO_QA_KEY }}
          project-id: 'prod-api'
          openapi-path: './docs/api.yaml'`}</code></pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Gitlab className="h-5 w-5" /> GitLab CI</CardTitle>
                <CardDescription>Add the Aero CLI to your pipeline.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto text-muted-foreground">
                  <pre><code>{`aero_generate:
  stage: test
  image: aero-qa/cli:latest
  script:
    - aero generate --project-id prod-api --source ./docs/api.yaml
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"`}</code></pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5" /> Default Coverage Thresholds</CardTitle>
                <CardDescription>Set the minimum acceptable coverage for your projects.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 max-w-sm">
                  <Label htmlFor="threshold">Global Minimum Coverage (%)</Label>
                  <Input id="threshold" type="number" defaultValue="85" />
                  <p className="text-xs text-muted-foreground">Builds will fail if coverage drops below this.</p>
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-muted-foreground">Loading projects...</div>
                ) : (
                  <div className="space-y-4">
                    {projects?.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-4 border rounded-md">
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-sm text-muted-foreground">{p.description}</div>
                        </div>
                        <div className="text-sm">
                          Threshold: <span className="font-mono">{p.coverageThreshold || 80}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}