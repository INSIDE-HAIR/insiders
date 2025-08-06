"use client";

import { useState, useEffect } from "react";
import ApiKeysClientPage from "./client-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { 
  Key, 
  Plus, 
  Search, 
  Filter,
  Trash2,
  RefreshCw,
  Eye,
  Settings,
  Activity,
  Shield,
  AlertCircle,
  TrendingUp,
  Clock
} from "lucide-react";
import { ApiKeyCard } from "@/src/features/settings/components/api-keys/ApiKeyCard";
import { CreateApiKeyDialog } from "@/src/features/settings/components/api-keys/CreateApiKeyDialog";
import { ApiKeySuccessDialog } from "@/src/features/settings/components/api-keys/ApiKeySuccessDialog";
import { EditApiKeyModal } from "@/src/features/settings/components/api-keys/EditApiKeyModal";
import { ViewApiKeyModal } from "@/src/features/settings/components/api-keys/ViewApiKeyModal";
import { ApiKeyService } from "@/src/features/settings/services/ApiKeyService";
import { 
  ApiKey, 
  CreateApiKeyRequestInput, 
  UpdateApiKeyRequest,
  ApiKeyStatus,
  CreateApiKeyResponse
} from "@/src/features/settings/types";
import { useToast } from "@/src/hooks/use-toast";
import { Skeleton } from "@/src/components/ui/skeleton";

function ApiKeysPageContent() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [newApiKeyData, setNewApiKeyData] = useState<{ apiKey: ApiKey; key: string } | null>(null);
  
  // Estados para modales de edición y visualización
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [updating, setUpdating] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalKeys, setTotalKeys] = useState(0);
  
  // Selected keys for bulk actions
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    revoked: 0,
    recentlyUsed: 0,
    totalRequests: 0,
    averageRequestsPerKey: 0
  });

  const { toast } = useToast();
  const apiKeyService = new ApiKeyService();

  // Load API Keys
  const loadApiKeys = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 12
      };

      if (statusFilter !== "all") params.status = statusFilter;

      const response = await apiKeyService.getApiKeys(params);
      setApiKeys(response.apiKeys);
      setTotalPages(response.pagination.pages);
      setTotalKeys(response.pagination.total);
      setCurrentPage(page);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al cargar las API Keys",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const statsData = await apiKeyService.getApiKeyStats();
      setStats(statsData);
    } catch (error: any) {
      toast({
        title: "Error al cargar estadísticas",
        description: error.message || "No se pudieron cargar las estadísticas de API Keys",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadApiKeys();
    loadStats();
  }, [statusFilter]);

  // Filter keys by search term
  const filteredKeys = searchTerm
    ? apiKeys.filter(key => 
        key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.keyPrefix.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : apiKeys;

  const handleCreateApiKey = async (data: CreateApiKeyRequestInput) => {
    setCreating(true);
    try {
      const result = await apiKeyService.createApiKey(data);
      setNewApiKeyData({ apiKey: result.apiKey, key: result.key });
      setShowCreateDialog(false);
      setShowSuccessDialog(true);
      await loadApiKeys();
      await loadStats();
      
      toast({
        title: "¡Éxito!",
        description: "API Key creada correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al crear la API Key",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEditApiKey = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey);
    setShowEditModal(true);
  };

  const handleViewApiKey = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey);
    setShowViewModal(true);
  };

  const handleUpdateApiKey = async (keyId: string, data: UpdateApiKeyRequest) => {
    setUpdating(true);
    try {
      await apiKeyService.updateApiKey(keyId, data);
      await loadApiKeys();
      await loadStats();
      
      toast({
        title: "API Key actualizada",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la API Key",
        variant: "destructive",
      });
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setUpdating(false);
    }
  };

  const handleRevokeApiKey = async (apiKey: ApiKey) => {
    try {
      await apiKeyService.revokeApiKey(apiKey.id);
      await loadApiKeys();
      await loadStats();
      
      toast({
        title: "API Key revocada",
        description: `La API Key "${apiKey.name}" ha sido revocada correctamente`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al revocar la API Key",
        variant: "destructive",
      });
    }
  };

  const handleDeleteApiKey = async (apiKey: ApiKey) => {
    try {
      await apiKeyService.deleteApiKey(apiKey.id);
      await loadApiKeys();
      await loadStats();
      
      toast({
        title: "API Key eliminada",
        description: `La API Key "${apiKey.name}" ha sido eliminada permanentemente`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la API Key",
        variant: "destructive",
      });
    }
  };

  const handleReactivateApiKey = async (apiKey: ApiKey) => {
    try {
      await apiKeyService.reactivateApiKey(apiKey.id);
      await loadApiKeys();
      await loadStats();
      
      toast({
        title: "API Key reactivada",
        description: `La API Key "${apiKey.name}" ha sido reactivada correctamente`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al reactivar la API Key",
        variant: "destructive",
      });
    }
  };

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total API Keys</CardTitle>
          <Key className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.active} activas de {stats.total}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Requests Totales</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Promedio: {stats.averageRequestsPerKey} por key
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estado</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="text-lg font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-muted-foreground">activas</div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-orange-600">{stats.inactive}</div>
            <div className="text-xs text-muted-foreground">inactivas</div>
            <div className="text-sm text-red-600">{stats.revoked}</div>
            <div className="text-xs text-muted-foreground">revocadas</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usadas Recientemente</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.recentlyUsed}</div>
          <p className="text-xs text-muted-foreground">
            Últimas 24 horas
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderFilters = () => (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar API Keys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="ACTIVE">Activas</SelectItem>
          <SelectItem value="INACTIVE">Inactivas</SelectItem>
          <SelectItem value="REVOKED">Revocadas</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={() => loadApiKeys(currentPage)} variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        Actualizar
      </Button>
    </div>
  );

  const renderApiKeys = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (filteredKeys.length === 0) {
      return (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Key className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No hay API Keys</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "No se encontraron API Keys con los filtros aplicados"
                    : "Crea tu primera API Key para comenzar"
                  }
                </p>
              </div>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear API Key
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredKeys.map((apiKey) => (
          <ApiKeyCard
            key={apiKey.id}
            apiKey={apiKey}
            onEdit={handleEditApiKey}
            onView={handleViewApiKey}
            onRevoke={handleRevokeApiKey}
            onReactivate={handleReactivateApiKey}
            onDelete={handleDeleteApiKey}
          />
        ))}
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {(currentPage - 1) * 12 + 1} a {Math.min(currentPage * 12, totalKeys)} de {totalKeys} API Keys
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadApiKeys(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadApiKeys(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Key className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
            <p className="text-muted-foreground">
              Gestiona las claves de acceso programático a tu API
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva API Key
        </Button>
      </div>

      {/* Stats */}
      {renderStatsCards()}

      {/* Filters */}
      {renderFilters()}

      {/* API Keys Grid */}
      {renderApiKeys()}

      {/* Pagination */}
      {renderPagination()}

      {/* Dialogs */}
      <CreateApiKeyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateApiKey}
        loading={creating}
      />

      {newApiKeyData && (
        <ApiKeySuccessDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
          apiKey={newApiKeyData.apiKey}
          secretKey={newApiKeyData.key}
        />
      )}

      {/* Edit Modal */}
      <EditApiKeyModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        apiKey={selectedApiKey}
        onSubmit={handleUpdateApiKey}
        loading={updating}
      />

      {/* View Modal */}
      <ViewApiKeyModal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        apiKey={selectedApiKey}
      />

      {/* Security Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-700">
            <AlertCircle className="h-5 w-5" />
            <span>Nota de Seguridad</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Las API Keys proporcionan acceso completo a tu cuenta</li>
            <li>• Guárdalas de forma segura y nunca las compartas públicamente</li>
            <li>• Revisa regularmente qué aplicaciones tienen acceso</li>
            <li>• Configura nombres descriptivos para identificar fácilmente cada key</li>
            <li>• Configura expiración automática para mayor seguridad</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ApiKeysPage() {
  return (
    <ApiKeysClientPage>
      <ApiKeysPageContent />
    </ApiKeysClientPage>
  );
}