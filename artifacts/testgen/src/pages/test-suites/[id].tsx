import { useState } from "react";
import { Link, useParams } from "wouter";
import { useGetTestSuite, getGetTestSuiteQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Copy, CheckCircle2, ChevronRight, Terminal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

export default function TestSuiteDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { toast } = useToast();
  
  const { data: suite, isLoading } = useGetTestSuite(id, {
    query: { enabled: !!id, queryKey: getGetTestSuiteQueryKey(id) }
  });

  const [activeTab, setActiveTab] = useState<string>("all");

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard",
      description: "Test code has been copied to your clipboard.",
    });
  };

  const types = ["all", ...Array.from(new Set(suite?.testCases.map(t => t.testType) || []))];

  const filteredTests = suite?.testCases.filter(
    t => activeTab === "all" || t.testType === activeTab
  );

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/test-suites">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{suite?.name || "Loading..."}</h1>
              {suite && <Badge>{suite.framework}</Badge>}
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Suite ID: {id} • Generated {suite ? new Date(suite.createdAt).toLocaleDateString() : ""}
            </p>
          </div>
          {suite && (
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{suite.coverageScore}%</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Coverage</div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">Loading test cases...</div>
        ) : suite ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              {types.map(type => (
                <TabsTrigger key={type} value={type} className="capitalize">
                  {type.replace("_", " ")}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="space-y-6">
              {filteredTests?.map((test) => (
                <Card key={test.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="capitalize">{test.testType.replace("_", " ")}</Badge>
                          <Badge variant="secondary" className="capitalize">{test.category}</Badge>
                        </div>
                        <CardTitle className="text-lg">{test.title}</CardTitle>
                        {test.description && (
                          <p className="text-sm text-muted-foreground mt-2">{test.description}</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative group">
                      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="h-8"
                          onClick={() => test.code && handleCopy(test.code)}
                        >
                          <Copy className="h-3.5 w-3.5 mr-2" /> Copy
                        </Button>
                      </div>
                      <ScrollArea className="h-auto max-h-[400px] w-full bg-[#0d1117] text-gray-300 p-4">
                        <pre className="text-sm font-mono leading-relaxed">
                          <code>{test.code || "// No code available"}</code>
                        </pre>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Tabs>
        ) : null}
      </div>
    </AppLayout>
  );
}