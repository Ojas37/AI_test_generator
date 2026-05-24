import { useState } from "react";
import { Link } from "wouter";
import { useListTestSuites } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function TestSuites() {
  const [framework, setFramework] = useState<string>("all");
  const { data: suites, isLoading } = useListTestSuites(
    framework === "all" ? undefined : { framework }
  );

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Test Suites</h1>
            <p className="text-muted-foreground mt-1">Browse and manage your generated test suites.</p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search suites..." className="pl-9" />
            </div>
            <Select value={framework} onValueChange={setFramework}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frameworks</SelectItem>
                <SelectItem value="jest">Jest</SelectItem>
                <SelectItem value="pytest">PyTest</SelectItem>
                <SelectItem value="playwright">Playwright</SelectItem>
                <SelectItem value="cypress">Cypress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-4"><div className="h-6 bg-muted rounded w-1/2"></div></CardHeader>
                <CardContent><div className="h-20 bg-muted rounded"></div></CardContent>
              </Card>
            ))}
          </div>
        ) : suites?.length === 0 ? (
          <div className="text-center py-24 border rounded-xl bg-card">
            <h3 className="text-lg font-medium">No test suites found</h3>
            <p className="text-muted-foreground mt-2">Generate some tests to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suites?.map((suite) => (
              <Link key={suite.id} href={`/test-suites/${suite.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full flex flex-col group">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <CardTitle className="text-lg line-clamp-2">{suite.name}</CardTitle>
                      <Badge variant="outline" className="shrink-0">{suite.framework}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{suite.testCount}</span> tests
                      </div>
                      <div className="text-sm text-muted-foreground text-right">
                        <span className="font-medium text-foreground">{suite.coverageScore}%</span> coverage
                      </div>
                    </div>
                    <Progress value={suite.coverageScore} className="h-2" />
                    <div className="flex justify-end mt-4">
                      <div className="text-primary text-sm flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        View details <ChevronRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}