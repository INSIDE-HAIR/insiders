"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { 
  TestTube, Play, Users, Calendar, MapPin, Monitor, 
  CheckCircle, XCircle, Clock, Info, AlertTriangle, 
  Download, Upload, RefreshCw 
} from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";

interface TestingPanelProps {
  resourceId: string;
  control: any;
}

interface TestUser {
  id: string;
  email: string;
  role: string;
  groups: string[];
  tags: string[];
  services: string[];
  status: 'active' | 'inactive' | 'suspended';
  deactivation_date?: string;
  subscription_end_date?: string;
  last_login?: string;
}

interface TestContext {
  simulatedDate: string;
  simulatedTime: string;
  request: {
    ip: string;
    user_agent: string;
    geo: {
      country?: string;
      region?: string;
      city?: string;
    };
  };
}

interface EvaluationResult {
  allowed: boolean;
  accessLevel: string;
  reason: string;
  evaluationStrategy: string;
  mainOperator: string;
  executionTimeMs: number;
  groupResults: Array<{
    groupId: string;
    groupName: string;
    result: boolean;
    operator: string;
    reason: string;
    ruleResults: Array<{
      ruleId: string;
      ruleName: string;
      result: boolean;
      operator: string;
      accessLevel: string;
      reason: string;
      conditionResults: Array<{
        conditionId: string;
        fieldPath: string;
        operator: string;
        expectedValue: any;
        actualValue: any;
        result: boolean;
        reason: string;
      }>;
    }>;
  }>;
  evaluationTrace: string[];
}

const PRESET_USERS = [
  {
    id: "user1",
    email: "juan.perez@empresa.com",
    role: "CLIENT",
    groups: ["marketing_digital_enero_2025"],
    tags: [],
    services: [],
    status: "active" as const,
  },
  {
    id: "user2",
    email: "maria.lopez@startup.com",
    role: "CLIENT",
    groups: [],
    tags: ["premium"],
    services: ["marketing_digital_premium"],
    status: "active" as const,
  },
  {
    id: "user3",
    email: "carlos.ruiz@empresa.com",
    role: "CLIENT",
    groups: [],
    tags: [],
    services: ["marketing_digital_premium"],
    status: "inactive" as const,
    deactivation_date: "2024-08-01T00:00:00Z",
  },
  {
    id: "admin1",
    email: "admin@insidesalons.com",
    role: "ADMIN",
    groups: ["admin"],
    tags: ["admin"],
    services: [],
    status: "active" as const,
  },
  {
    id: "user4",
    email: "random@email.com",
    role: "CLIENT",
    groups: [],
    tags: [],
    services: [],
    status: "active" as const,
  },
];

export function TestingPanel({ resourceId, control }: TestingPanelProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [predefinedTestCases, setPredefinedTestCases] = useState<any[]>([]);
  
  const [testUser, setTestUser] = useState<TestUser>({
    id: "test-user",
    email: "test@example.com",
    role: "CLIENT",
    groups: [],
    tags: [],
    services: [],
    status: "active",
  });

  const [testContext, setTestContext] = useState<TestContext>({
    simulatedDate: new Date().toISOString().split('T')[0] + 'T10:00:00Z',
    simulatedTime: "10:00",
    request: {
      ip: "192.168.1.100",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      geo: {
        country: "Spain",
        region: "Madrid",
        city: "Madrid",
      },
    },
  });

  // Cargar casos de prueba predefinidos
  useEffect(() => {
    loadPredefinedTestCases();
  }, []);

  const loadPredefinedTestCases = async () => {
    try {
      const response = await fetch('/api/admin/complex-access-control/test');
      if (response.ok) {
        const data = await response.json();
        setPredefinedTestCases(data.testCases || []);
      }
    } catch (error) {
      console.error('Error loading test cases:', error);
    }
  };

  const handleEvaluate = async () => {
    if (!resourceId) {
      toast({
        title: "Error",
        description: "Debes especificar un Resource ID para probar",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setEvaluationResult(null);

      const testData = {
        resourceId,
        user: testUser,
        simulatedDate: testContext.simulatedDate,
        simulatedTime: testContext.simulatedTime,
        request: testContext.request,
      };

      const response = await fetch('/api/admin/complex-access-control/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error en la evaluación');
      }

      const result = await response.json();
      setEvaluationResult(result.result);

      toast({
        id: "evaluation-success",
        title: "Evaluación completada",
        description: `Resultado: ${result.result?.allowed ? 'PERMITIDO' : 'DENEGADO'}`,
      });
    } catch (error) {
      console.error('Error evaluating:', error);
      toast({
        id: "evaluation-error",
        title: "Error",
        description: error instanceof Error ? error.message : "Error en la evaluación",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPresetUser = (preset: typeof PRESET_USERS[0]) => {
    setTestUser({ ...preset });
  };

  const handleLoadTestCase = (testCase: any) => {
    setTestUser(testCase.user);
    setTestContext({
      simulatedDate: testCase.simulatedDate,
      simulatedTime: testCase.simulatedTime,
      request: testCase.request,
    });
  };

  const renderGroupResult = (groupResult: any) => (
    <Card key={groupResult.groupId} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            {groupResult.result ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            {groupResult.groupName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{groupResult.operator}</Badge>
            <Badge className={groupResult.result ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {groupResult.result ? "VERDADERO" : "FALSO"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-600 mb-3">{groupResult.reason}</p>
        
        {groupResult.ruleResults.map((ruleResult: any) => (
          <div key={ruleResult.ruleId} className="ml-4 mb-3 border-l-2 border-gray-200 pl-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                {ruleResult.result ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-600" />
                )}
                {ruleResult.ruleName}
              </span>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">{ruleResult.operator}</Badge>
                <Badge className="text-xs">{ruleResult.accessLevel}</Badge>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-2">{ruleResult.reason}</p>
            
            {ruleResult.conditionResults.map((conditionResult: any, idx: number) => (
              <div key={idx} className="ml-4 mb-1 text-xs">
                <div className="flex items-center gap-2">
                  {conditionResult.result ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-600" />
                  )}
                  <span className="font-mono text-xs">
                    {conditionResult.fieldPath} {conditionResult.operator} 
                    {" "}<span className="text-blue-600">{JSON.stringify(conditionResult.expectedValue)}</span>
                  </span>
                </div>
                <div className="ml-5 text-gray-500">
                  Valor actual: <span className="text-gray-700">{JSON.stringify(conditionResult.actualValue)}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Configuración de Test */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Simulador de Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Select onValueChange={(value) => {
                  const preset = PRESET_USERS.find(u => u.id === value);
                  if (preset) handleLoadPresetUser(preset);
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Cargar usuario predefinido" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_USERS.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.email} ({preset.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    value={testUser.email}
                    onChange={(e) => setTestUser({ ...testUser, email: e.target.value })}
                    placeholder="test@example.com"
                  />
                </div>
                <div>
                  <Label>Rol</Label>
                  <Select value={testUser.role} onValueChange={(value) => setTestUser({ ...testUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLIENT">CLIENT</SelectItem>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                      <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Grupos (separados por coma)</Label>
                <Input
                  value={testUser.groups.join(', ')}
                  onChange={(e) => setTestUser({ 
                    ...testUser, 
                    groups: e.target.value.split(',').map(g => g.trim()).filter(g => g) 
                  })}
                  placeholder="marketing_digital_enero_2025, admin"
                />
              </div>

              <div>
                <Label>Tags (separados por coma)</Label>
                <Input
                  value={testUser.tags.join(', ')}
                  onChange={(e) => setTestUser({ 
                    ...testUser, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                  })}
                  placeholder="premium, vip"
                />
              </div>

              <div>
                <Label>Servicios (separados por coma)</Label>
                <Input
                  value={testUser.services.join(', ')}
                  onChange={(e) => setTestUser({ 
                    ...testUser, 
                    services: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  })}
                  placeholder="marketing_digital_premium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Estado</Label>
                  <Select value={testUser.status} onValueChange={(value: any) => setTestUser({ ...testUser, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="suspended">Suspendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fecha de Desactivación (opcional)</Label>
                  <Input
                    type="date"
                    value={testUser.deactivation_date ? new Date(testUser.deactivation_date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setTestUser({ 
                      ...testUser, 
                      deactivation_date: e.target.value ? e.target.value + 'T00:00:00Z' : undefined 
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Contexto de Evaluación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Fecha Simulada</Label>
                  <Input
                    type="date"
                    value={testContext.simulatedDate.split('T')[0]}
                    onChange={(e) => setTestContext({ 
                      ...testContext, 
                      simulatedDate: e.target.value + 'T' + testContext.simulatedTime + ':00Z' 
                    })}
                  />
                </div>
                <div>
                  <Label>Hora Simulada</Label>
                  <Input
                    type="time"
                    value={testContext.simulatedTime}
                    onChange={(e) => setTestContext({ 
                      ...testContext, 
                      simulatedTime: e.target.value,
                      simulatedDate: testContext.simulatedDate.split('T')[0] + 'T' + e.target.value + ':00Z'
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>IP Address</Label>
                  <Input
                    value={testContext.request.ip}
                    onChange={(e) => setTestContext({ 
                      ...testContext, 
                      request: { ...testContext.request, ip: e.target.value } 
                    })}
                    placeholder="192.168.1.100"
                  />
                </div>
                <div>
                  <Label>País</Label>
                  <Input
                    value={testContext.request.geo.country || ''}
                    onChange={(e) => setTestContext({ 
                      ...testContext, 
                      request: { 
                        ...testContext.request, 
                        geo: { ...testContext.request.geo, country: e.target.value } 
                      } 
                    })}
                    placeholder="Spain"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleEvaluate} disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Evaluar Reglas
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Casos de Prueba Predefinidos */}
          {predefinedTestCases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  Casos de Prueba Predefinidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {predefinedTestCases.map((testCase, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadTestCase(testCase)}
                      className="w-full justify-start text-left"
                    >
                      <div>
                        <div className="font-medium">{testCase.name}</div>
                        <div className="text-xs text-gray-500">{testCase.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel de Resultados */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Resultado de Evaluación
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!evaluationResult ? (
                <div className="text-center py-8 text-gray-500">
                  <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Ejecuta una evaluación para ver los resultados</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {/* Resultado Principal */}
                    <Card className={evaluationResult.allowed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {evaluationResult.allowed ? (
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : (
                              <XCircle className="h-6 w-6 text-red-600" />
                            )}
                            <span className="text-lg font-semibold">
                              {evaluationResult.allowed ? 'ACCESO PERMITIDO' : 'ACCESO DENEGADO'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">{evaluationResult.executionTimeMs}ms</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <p><strong>Nivel de Acceso:</strong> {evaluationResult.accessLevel}</p>
                          <p><strong>Estrategia:</strong> {evaluationResult.evaluationStrategy}</p>
                          <p><strong>Operador Principal:</strong> {evaluationResult.mainOperator}</p>
                          <p><strong>Razón:</strong> {evaluationResult.reason}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Resultados Detallados por Grupo */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">Evaluación Detallada por Grupo:</h4>
                      {evaluationResult.groupResults.map(renderGroupResult)}
                    </div>

                    {/* Trace de Evaluación */}
                    {evaluationResult.evaluationTrace && evaluationResult.evaluationTrace.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Trace de Evaluación</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1 text-xs font-mono">
                            {evaluationResult.evaluationTrace.map((trace, index) => (
                              <div key={index} className="text-gray-600">
                                {index + 1}. {trace}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}