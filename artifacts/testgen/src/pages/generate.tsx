import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  useListProjects, 
  useCreateProject, 
  useCreateSource, 
  useTriggerGeneration, 
  useGetJob,
  getGetJobQueryKey
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Upload, CheckCircle2, ArrowRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Generate() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState(1);
  const [projectId, setProjectId] = useState<string>("");
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  
  const [sourceName, setSourceName] = useState("");
  const [sourceType, setSourceType] = useState("prd");
  const [sourceContent, setSourceContent] = useState("");
  const [sourceId, setSourceId] = useState<number | null>(null);
  
  const [framework, setFramework] = useState("jest");
  const [testTypes, setTestTypes] = useState<string[]>(["unit", "integration"]);
  const [includeEdgeCases, setIncludeEdgeCases] = useState(true);
  
  const [jobId, setJobId] = useState<number | null>(null);

  const { data: projects, isLoading: projectsLoading } = useListProjects();
  const createProject = useCreateProject();
  const createSource = useCreateSource();
  const triggerGeneration = useTriggerGeneration();
  
  const { data: job } = useGetJob(jobId || 0, {
    query: {
      enabled: !!jobId,
      refetchInterval: (data) => 
        (data?.state?.data?.status === "completed" || data?.state?.data?.status === "failed") ? false : 2000,
    }
  });

  useEffect(() => {
    if (job?.status === "completed") {
      toast({
        title: "Generation Complete",
        description: "Test cases have been successfully generated.",
      });
      // Allow user to click to view
    } else if (job?.status === "failed") {
      toast({
        title: "Generation Failed",
        description: job.errorMessage || "An error occurred during generation.",
        variant: "destructive",
      });
    }
  }, [job, toast]);

  const handleCreateProject = async () => {
    if (!newProjectName) return;
    try {
      const p = await createProject.mutateAsync({ data: { name: newProjectName, description: "Auto-created project" } });
      setProjectId(p.id.toString());
      setIsCreatingProject(false);
      setNewProjectName("");
      toast({ title: "Project Created", description: "Selected new project." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to create project", variant: "destructive" });
    }
  };

  const handleUploadSource = async () => {
    if (!projectId || !sourceName || !sourceContent) {
      toast({ title: "Incomplete", description: "Please fill in all source fields.", variant: "destructive" });
      return;
    }
    try {
      const src = await createSource.mutateAsync({
        data: {
          projectId: parseInt(projectId, 10),
          name: sourceName,
          sourceType,
          content: sourceContent
        }
      });
      setSourceId(src.id);
      setStep(3);
    } catch (e) {
      toast({ title: "Error", description: "Failed to save source", variant: "destructive" });
    }
  };

  const handleGenerate = async () => {
    if (!projectId || !framework || testTypes.length === 0) {
      toast({ title: "Incomplete", description: "Please configure generation options.", variant: "destructive" });
      return;
    }
    try {
      const j = await triggerGeneration.mutateAsync({
        data: {
          projectId: parseInt(projectId, 10),
          sourceIds: sourceId ? [sourceId] : undefined,
          framework,
          testTypes,
          includeEdgeCases
        }
      });
      setJobId(j.id);
      setStep(4);
    } catch (e) {
      toast({ title: "Error", description: "Failed to start generation job", variant: "destructive" });
    }
  };

  const toggleTestType = (type: string) => {
    setTestTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generate Tests</h1>
          <p className="text-muted-foreground mt-1">Provide source material to generate comprehensive test suites.</p>
        </div>
        
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-muted -z-10 -translate-y-1/2 rounded-full"></div>
          <div className="absolute left-0 top-1/2 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-300" style={{ width: `${(step - 1) * 33.33}%` }}></div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 ${step >= i ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-muted text-muted-foreground'}`}>
              {i}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle>Select Project</CardTitle>
              <CardDescription>Choose an existing project context or create a new one.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {projectsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading projects...</div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Project</Label>
                    {projects?.length === 0 || isCreatingProject ? (
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Project Name" 
                          value={newProjectName} 
                          onChange={(e) => setNewProjectName(e.target.value)} 
                        />
                        <Button onClick={handleCreateProject} disabled={createProject.isPending || !newProjectName}>
                          {createProject.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                          Create
                        </Button>
                        {projects && projects.length > 0 && (
                          <Button variant="ghost" onClick={() => setIsCreatingProject(false)}>Cancel</Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Select value={projectId} onValueChange={setProjectId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects?.map(p => (
                              <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => setIsCreatingProject(true)}><Plus className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!projectId}>Next Step <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle>Source Material</CardTitle>
              <CardDescription>Upload or paste your requirements, OpenAPI spec, or flow descriptions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Source Name</Label>
                  <Input placeholder="e.g. Auth API V2 Spec" value={sourceName} onChange={e => setSourceName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={sourceType} onValueChange={setSourceType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prd">Product Requirement Doc</SelectItem>
                      <SelectItem value="openapi">OpenAPI Spec</SelectItem>
                      <SelectItem value="frontend_flow">Frontend Flow</SelectItem>
                      <SelectItem value="unit_source">Source Code (Unit)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea 
                  placeholder="Paste your content here..." 
                  className="min-h-[200px] font-mono text-sm"
                  value={sourceContent}
                  onChange={e => setSourceContent(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleUploadSource} disabled={createSource.isPending || !sourceName || !sourceContent}>
                {createSource.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Upload & Continue
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 3 && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle>Configure Generation</CardTitle>
              <CardDescription>Tell the agent what kind of tests to generate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-3">
                <Label>Target Framework</Label>
                <Select value={framework} onValueChange={setFramework}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jest">Jest</SelectItem>
                    <SelectItem value="pytest">PyTest</SelectItem>
                    <SelectItem value="playwright">Playwright</SelectItem>
                    <SelectItem value="cypress">Cypress</SelectItem>
                    <SelectItem value="postman">Postman</SelectItem>
                    <SelectItem value="junit">JUnit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Test Types</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["unit", "integration", "e2e", "edge_cases"].map(type => (
                    <div key={type} className="flex items-center space-x-2 border p-3 rounded-md">
                      <Checkbox 
                        id={`type-${type}`} 
                        checked={testTypes.includes(type)}
                        onCheckedChange={() => toggleTestType(type)}
                      />
                      <label htmlFor={`type-${type}`} className="text-sm font-medium leading-none capitalize cursor-pointer">
                        {type.replace("_", " ")}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-muted p-4 rounded-md">
                <Checkbox id="edge-cases" checked={includeEdgeCases} onCheckedChange={(c) => setIncludeEdgeCases(c as boolean)} />
                <label htmlFor="edge-cases" className="text-sm font-medium leading-none cursor-pointer">
                  Activate Advanced Edge Case Engine
                  <p className="text-muted-foreground text-xs mt-1 font-normal">Instructs Claude to aggressively seek security boundaries, state mutations, and concurrency issues.</p>
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleGenerate} disabled={triggerGeneration.isPending || testTypes.length === 0}>
                {triggerGeneration.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Generate Tests
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 4 && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-primary/50">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Generating Tests</CardTitle>
              <CardDescription>The agent is analyzing sources and writing code.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="flex justify-center">
                {job?.status === "completed" ? (
                  <div className="h-24 w-24 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center animate-in zoom-in">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                ) : job?.status === "failed" ? (
                  <div className="h-24 w-24 rounded-full bg-destructive/20 text-destructive flex items-center justify-center animate-in zoom-in">
                    <span className="font-bold text-2xl">X</span>
                  </div>
                ) : (
                  <div className="relative h-24 w-24 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" style={{ animationDuration: '3s' }}></div>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-center max-w-md mx-auto">
                <div className="flex justify-between text-sm font-medium">
                  <span className="capitalize">{job?.status || "Starting..."}</span>
                  <span>{job?.progress || 0}%</span>
                </div>
                <Progress value={job?.progress || 0} className="h-2" />
                {job?.errorMessage && (
                  <p className="text-sm text-destructive mt-4">{job.errorMessage}</p>
                )}
              </div>
              
              <div className="bg-muted p-4 rounded-md font-mono text-xs text-muted-foreground max-w-lg mx-auto overflow-hidden">
                {job?.status === "completed" ? (
                  <div>
                    <span className="text-green-500">✓</span> Analysis complete<br/>
                    <span className="text-green-500">✓</span> AST constructed<br/>
                    <span className="text-green-500">✓</span> Edge cases identified<br/>
                    <span className="text-green-500">✓</span> Code generated
                  </div>
                ) : (
                  <div className="animate-pulse">
                    &gt; Initializing context analyzer...<br/>
                    &gt; Parsing source material...<br/>
                    <span className="opacity-50">&gt; Building AST...</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              {job?.status === "completed" ? (
                <Button size="lg" onClick={() => setLocation("/test-suites")}>View Test Suite</Button>
              ) : job?.status === "failed" ? (
                <Button variant="outline" onClick={() => setStep(3)}>Try Again</Button>
              ) : null}
            </CardFooter>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}