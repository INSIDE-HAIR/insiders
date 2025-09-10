"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { UserSession } from "@/src/types/routes";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Trash2,
  Plus,
  Edit,
  Eye,
  Shield,
  Search,
  Filter,
  GitBranch,
  Layers,
  TestTube,
  Copy,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  ResourceType,
  EvaluationStrategy,
  LogicOperator,
} from "@prisma/client";
import { ComplexAccessModal } from "./components/ComplexAccessModal";
import { useToast } from "@/src/hooks/use-toast";

interface RuleCondition {
  id: string;
  fieldPath: string;
  operator: string;
  value: any;
  isNegated: boolean;
}

interface ComplexRule {
  id: string;
  name: string;
  description?: string;
  logicOperator: LogicOperator;
  accessLevel: string;
  conditions: RuleCondition[];
}

interface RuleGroup {
  id: string;
  name: string;
  description?: string;
  logicOperator: LogicOperator;
  rules: ComplexRule[];
}

interface ComplexAccessControl {
  id: string;
  resourceType: ResourceType;
  resourceId: string;
  isEnabled: boolean;
  evaluationStrategy: EvaluationStrategy;
  mainLogicOperator: LogicOperator;
  ruleGroups: RuleGroup[];
  createdAt: string;
  updatedAt: string;
}

interface ComplexAccessControlClientProps {
  user: UserSession;
}

export function ComplexAccessControlClient({
  user,
}: ComplexAccessControlClientProps) {
  const [complexControls, setComplexControls] = useState<
    ComplexAccessControl[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingControl, setEditingControl] =
    useState<ComplexAccessControl | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterResourceType, setFilterResourceType] = useState<string>("all");
  const [filterEnabled, setFilterEnabled] = useState<string>("all");
  const { toast } = useToast();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const loadComplexControls = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (searchTerm) params.append("search", searchTerm);
      if (filterResourceType && filterResourceType !== "all")
        params.append("resourceType", filterResourceType);

      const response = await fetch(
        `/api/admin/complex-access-control?${params}`
      );
      if (response.ok) {
        const data = await response.json();
        setComplexControls(data.complexControls);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error loading complex controls:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los controles de acceso complejos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, filterResourceType]);

  useEffect(() => {
    loadComplexControls();
  }, [loadComplexControls]);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este control de acceso complejo?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/admin/complex-access-control", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Control de acceso eliminado correctamente",
        });
        await loadComplexControls();
      }
    } catch (error) {
      console.error("Error deleting complex control:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el control de acceso",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (control: ComplexAccessControl) => {
    const duplicatedControl = {
      ...control,
      id: undefined,
      resourceId: `${control.resourceId}_copy`,
      createdAt: undefined,
      updatedAt: undefined,
    };

    setEditingControl(duplicatedControl as any);
    setShowModal(true);
  };

  const handleEdit = (control: ComplexAccessControl) => {
    setEditingControl(control);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingControl(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingControl(null);
    loadComplexControls();
  };

  const getResourceTypeBadge = (type: ResourceType) => {
    const styles = {
      [ResourceType.PAGE]:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      [ResourceType.API]:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      [ResourceType.FILE]:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      [ResourceType.FOLDER]:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      [ResourceType.SERVICE]:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      [ResourceType.MEDIA]:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      [ResourceType.OTHER]:
        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    };

    return <Badge className={styles[type]}>{type}</Badge>;
  };

  const getOperatorBadge = (operator: LogicOperator) => {
    const isOr = operator === LogicOperator.OR;
    return (
      <Badge
        variant='outline'
        className={
          isOr
            ? "border-green-500 text-green-700"
            : "border-blue-500 text-blue-700"
        }
      >
        {operator}
      </Badge>
    );
  };

  const getComplexityInfo = (control: ComplexAccessControl) => {
    const groupsCount = control.ruleGroups.length;
    const rulesCount = control.ruleGroups.reduce(
      (acc, group) => acc + group.rules.length,
      0
    );
    const conditionsCount = control.ruleGroups.reduce(
      (acc, group) =>
        acc +
        group.rules.reduce(
          (ruleAcc, rule) => ruleAcc + rule.conditions.length,
          0
        ),
      0
    );

    return { groupsCount, rulesCount, conditionsCount };
  };

  // Filter controls based on enabled status
  const filteredControls = complexControls.filter((control) => {
    if (filterEnabled === "enabled") return control.isEnabled;
    if (filterEnabled === "disabled") return !control.isEnabled;
    return true;
  });

  if (isLoading && complexControls.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto'></div>
          <p className='mt-2'>Cargando controles de acceso complejos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DocHeader
        title='Control de Acceso Complejo'
        description='Gestiona reglas complejas con lógica OR/AND para control granular de acceso'
        icon={GitBranch}
      />

      <DocContent>
        <Button onClick={handleCreate} className='flex items-center gap-2'>
          <Plus className='h-4 w-4' />
          Nueva Regla Compleja
        </Button>

        {/* Filters */}
        <Card className='mb-6'>
          <CardContent className='pt-6'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <Input
                  placeholder='Buscar por nombre o ID...'
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className='pl-9'
                />
              </div>

              <Select
                value={filterResourceType}
                onValueChange={(value) => {
                  setFilterResourceType(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Tipo de recurso' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Todos los tipos</SelectItem>
                  <SelectItem value={ResourceType.PAGE}>Página</SelectItem>
                  <SelectItem value={ResourceType.FOLDER}>Carpeta</SelectItem>
                  <SelectItem value={ResourceType.MEDIA}>Media</SelectItem>
                  <SelectItem value={ResourceType.OTHER}>Otro</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterEnabled}
                onValueChange={(value) => setFilterEnabled(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Estado' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Todos</SelectItem>
                  <SelectItem value='enabled'>Habilitados</SelectItem>
                  <SelectItem value='disabled'>Deshabilitados</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant='outline'
                onClick={() => {
                  setSearchTerm("");
                  setFilterResourceType("all");
                  setFilterEnabled("all");
                  setCurrentPage(1);
                }}
                className='flex items-center gap-2'
              >
                <Filter className='h-4 w-4' />
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Controls Table */}
        <div className='grid gap-4'>
          {filteredControls.length === 0 ? (
            <Card>
              <CardContent className='py-16 text-center'>
                <GitBranch className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500 mb-4'>
                  No hay controles de acceso complejos configurados
                </p>
                <Button onClick={handleCreate}>Crear el primero</Button>
              </CardContent>
            </Card>
          ) : (
            filteredControls.map((control) => {
              const { groupsCount, rulesCount, conditionsCount } =
                getComplexityInfo(control);

              return (
                <Card
                  key={control.id}
                  className='hover:shadow-lg transition-shadow'
                >
                  <CardContent className='py-6'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-3'>
                          <h3 className='text-lg font-semibold'>
                            {control.resourceId}
                          </h3>
                          {getResourceTypeBadge(control.resourceType)}
                          {getOperatorBadge(control.mainLogicOperator)}
                          {control.isEnabled ? (
                            <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                              <CheckCircle className='h-3 w-3 mr-1' />
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant='destructive'>
                              <XCircle className='h-3 w-3 mr-1' />
                              Inactivo
                            </Badge>
                          )}
                        </div>

                        <div className='flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-3'>
                          <div className='flex items-center gap-1'>
                            <Layers className='h-4 w-4' />
                            <span>{groupsCount} grupos</span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <Shield className='h-4 w-4' />
                            <span>{rulesCount} reglas</span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <GitBranch className='h-4 w-4' />
                            <span>{conditionsCount} condiciones</span>
                          </div>
                        </div>

                        <div className='flex flex-wrap gap-2'>
                          {control.ruleGroups.slice(0, 2).map((group) => (
                            <Badge
                              key={group.id}
                              variant='outline'
                              className='text-xs'
                            >
                              {group.name}
                            </Badge>
                          ))}
                          {control.ruleGroups.length > 2 && (
                            <Badge variant='outline' className='text-xs'>
                              +{control.ruleGroups.length - 2} más
                            </Badge>
                          )}
                        </div>

                        <div className='flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500 mt-3'>
                          <span>
                            Creado:{" "}
                            {new Date(control.createdAt).toLocaleDateString()}
                          </span>
                          <span>
                            Actualizado:{" "}
                            {new Date(control.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleEdit(control)}
                          title='Ver detalles'
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleEdit(control)}
                          title='Editar'
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleDuplicate(control)}
                          title='Duplicar'
                        >
                          <Copy className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          className='text-blue-600 hover:text-blue-700'
                          title='Probar reglas'
                        >
                          <TestTube className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() => handleDelete(control.id)}
                          title='Eliminar'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex justify-center items-center gap-4 mt-6'>
            <Button
              variant='outline'
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className='text-sm'>
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant='outline'
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <ComplexAccessModal
            control={editingControl}
            onClose={handleModalClose}
            onSuccess={handleModalClose}
          />
        )}
      </DocContent>
    </div>
  );
}
