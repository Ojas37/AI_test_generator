import { useListRequirements, useGetCoverage } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Network, CheckCircle2, AlertCircle, Circle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Traceability() {
  // Hardcode projectId 1 for demo purposes
  const projectId = 1;
  const { data: requirements, isLoading: reqsLoading } = useListRequirements({ projectId });
  const { data: coverage, isLoading: covLoading } = useGetCoverage({ projectId });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'covered': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'partial': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'uncovered': return <Circle className="h-4 w-4 text-destructive" />;
      default: return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'covered': return 'default'; // Or a custom success variant if you add one
      case 'partial': return 'secondary';
      case 'uncovered': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Traceability Matrix</h1>
            <p className="text-muted-foreground mt-1">Map requirements to test coverage.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Requirement Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{covLoading ? "-" : `${coverage?.requirementCoverage}%`}</div>
              <Progress value={coverage?.requirementCoverage || 0} className="h-2" />
              <div className="text-xs text-muted-foreground mt-2">
                {coverage?.coveredRequirements || 0} of {(coverage?.coveredRequirements || 0) + (coverage?.uncoveredRequirements || 0)} covered
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Endpoint Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{covLoading ? "-" : `${coverage?.endpointCoverage}%`}</div>
              <Progress value={coverage?.endpointCoverage || 0} className="h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Edge Case Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{covLoading ? "-" : `${coverage?.edgeCaseCoverage}%`}</div>
              <Progress value={coverage?.edgeCaseCoverage || 0} className="h-2" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            {reqsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading requirements...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Req ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Test Cases</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requirements?.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-xs">{req.reqId}</TableCell>
                      <TableCell className="font-medium">{req.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex w-fit items-center gap-1.5 capitalize">
                          {getStatusIcon(req.status)}
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{req.testCaseCount || 0}</TableCell>
                    </TableRow>
                  ))}
                  {requirements?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No requirements found. Upload a PRD to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}