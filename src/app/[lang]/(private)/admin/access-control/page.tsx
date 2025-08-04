"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Switch } from '@/src/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Trash2, Plus, Edit, Eye, Shield, Clock, Globe, Smartphone, Users } from 'lucide-react';
import { ResourceType, AccessLevel, SubjectType } from '@prisma/client';

interface AccessRule {
  id?: string;
  subjectType: SubjectType;
  subjectValue: string;
  accessLevel: AccessLevel;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  daysOfWeek: string[];
}

interface AccessControl {
  id: string;
  resourceType: ResourceType;
  resourceId: string;
  isEnabled: boolean;
  maxConcurrentUsers?: number;
  maxAccessCount?: number;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  daysOfWeek: string[];
  requiredAuthMethods: string[];
  rules: AccessRule[];
  ipRestrictions: Array<{ id?: string; startIP: string; endIP?: string }>;
  geoRestrictions: Array<{ id?: string; country?: string; region?: string; city?: string }>;
  deviceRestrictions: Array<{ id?: string; deviceType: string; operatingSystems: string[] }>;
  createdAt: string;
  updatedAt: string;
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const COMMON_ROUTES = [
  { value: '/[lang]/admin/drive', label: 'Admin - Drive' },
  { value: '/[lang]/admin/users', label: 'Admin - Users' },
  { value: '/[lang]/admin/calendar', label: 'Admin - Calendar' },
  { value: '/[lang]/admin/holded', label: 'Admin - Holded' },
  { value: '/[lang]/admin/access-control', label: 'Admin - Access Control' },
  { value: '/[lang]/admin/user-exceptions', label: 'Admin - User Exceptions' },
  { value: '/[lang]/profile', label: 'Profile' },
  { value: '/[lang]/marketing-salon', label: 'Marketing Salon' },
  { value: '/[lang]/training', label: 'Training' },
];

export default function AccessControlPage() {
  const [accessControls, setAccessControls] = useState<AccessControl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingControl, setEditingControl] = useState<AccessControl | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    resourceType: ResourceType.PAGE as ResourceType,
    resourceId: '',
    isEnabled: true,
    maxConcurrentUsers: 0,
    maxAccessCount: 0,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    daysOfWeek: [] as string[],
    requiredAuthMethods: [] as string[],
    rules: [] as AccessRule[],
    ipRestrictions: [] as Array<{ startIP: string; endIP?: string }>,
    geoRestrictions: [] as Array<{ country?: string; region?: string; city?: string }>,
    deviceRestrictions: [] as Array<{ deviceType: string; operatingSystems: string[] }>,
  });

  // Load access controls
  useEffect(() => {
    loadAccessControls();
  }, []);

  const loadAccessControls = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/access-control');
      if (response.ok) {
        const data = await response.json();
        setAccessControls(data.accessControls);
      }
    } catch (error) {
      console.error('Error loading access controls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateControl = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/access-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadAccessControls();
        resetForm();
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating access control:', error);
    }
  };

  const handleUpdateControl = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingControl) return;

    try {
      const response = await fetch(`/api/admin/access-control/${editingControl.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadAccessControls();
        resetForm();
        setShowCreateForm(false);
        setEditingControl(null);
      }
    } catch (error) {
      console.error('Error updating access control:', error);
    }
  };

  const handleDeleteControl = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este control de acceso?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/access-control/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadAccessControls();
      }
    } catch (error) {
      console.error('Error deleting access control:', error);
    }
  };

  const handleEditControl = (control: AccessControl) => {
    setEditingControl(control);
    setFormData({
      resourceType: control.resourceType,
      resourceId: control.resourceId,
      isEnabled: control.isEnabled,
      maxConcurrentUsers: control.maxConcurrentUsers || 0,
      maxAccessCount: control.maxAccessCount || 0,
      startDate: control.startDate ? new Date(control.startDate).toISOString().split('T')[0] || '' : '',
      endDate: control.endDate ? new Date(control.endDate).toISOString().split('T')[0] || '' : '',
      startTime: control.startTime || '',
      endTime: control.endTime || '',
      daysOfWeek: control.daysOfWeek,
      requiredAuthMethods: control.requiredAuthMethods,
      rules: control.rules,
      ipRestrictions: control.ipRestrictions.map(r => ({ startIP: r.startIP, endIP: r.endIP })),
      geoRestrictions: control.geoRestrictions.map(r => ({ country: r.country, region: r.region, city: r.city })),
      deviceRestrictions: control.deviceRestrictions.map(r => ({ deviceType: r.deviceType, operatingSystems: r.operatingSystems })),
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      resourceType: ResourceType.PAGE,
      resourceId: '',
      isEnabled: true,
      maxConcurrentUsers: 0,
      maxAccessCount: 0,
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      daysOfWeek: [],
      requiredAuthMethods: [],
      rules: [],
      ipRestrictions: [],
      geoRestrictions: [],
      deviceRestrictions: [],
    });
    setEditingControl(null);
  };

  const addRule = () => {
    setFormData({
      ...formData,
      rules: [...formData.rules, {
        subjectType: SubjectType.ROLE,
        subjectValue: '',
        accessLevel: AccessLevel.READ,
        daysOfWeek: [],
      }],
    });
  };

  const updateRule = (index: number, field: keyof AccessRule, value: any) => {
    const newRules = [...formData.rules];
    newRules[index] = { ...newRules[index], [field]: value } as AccessRule;
    setFormData({ ...formData, rules: newRules });
  };

  const removeRule = (index: number) => {
    setFormData({
      ...formData,
      rules: formData.rules.filter((_, i) => i !== index),
    });
  };

  const getResourceTypeBadge = (type: ResourceType) => {
    const colors = {
      [ResourceType.PAGE]: 'bg-blue-100 text-blue-800',
      [ResourceType.API]: 'bg-yellow-100 text-yellow-800',
      [ResourceType.FILE]: 'bg-orange-100 text-orange-800',
      [ResourceType.FOLDER]: 'bg-green-100 text-green-800',
      [ResourceType.SERVICE]: 'bg-indigo-100 text-indigo-800',
      [ResourceType.MEDIA]: 'bg-purple-100 text-purple-800',
      [ResourceType.OTHER]: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge className={colors[type]}>
        {type}
      </Badge>
    );
  };

  const getAccessLevelBadge = (level: AccessLevel) => {
    const colors = {
      [AccessLevel.READ]: 'bg-blue-100 text-blue-800',
      [AccessLevel.WRITE]: 'bg-cyan-100 text-cyan-800',
      [AccessLevel.CREATE]: 'bg-green-100 text-green-800',
      [AccessLevel.DELETE]: 'bg-red-100 text-red-800',
      [AccessLevel.MANAGE]: 'bg-indigo-100 text-indigo-800',
      [AccessLevel.CONFIGURE]: 'bg-pink-100 text-pink-800',
      [AccessLevel.UPDATE]: 'bg-yellow-100 text-yellow-800',
      [AccessLevel.FULL]: 'bg-purple-100 text-purple-800',
    };

    return (
      <Badge className={colors[level]}>
        {level}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Cargando controles de acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Control de Acceso</h1>
          <p className="text-gray-600 mt-2">
            Gestiona permisos específicos para páginas y recursos
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Control
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {editingControl ? 'Editar Control de Acceso' : 'Crear Nuevo Control de Acceso'}
            </CardTitle>
            <CardDescription>
              Define permisos específicos para una página o recurso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingControl ? handleUpdateControl : handleCreateControl} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList>
                  <TabsTrigger value="basic">
                    <Shield className="h-4 w-4 mr-2" />
                    Básico
                  </TabsTrigger>
                  <TabsTrigger value="rules">
                    <Users className="h-4 w-4 mr-2" />
                    Reglas
                  </TabsTrigger>
                  <TabsTrigger value="time">
                    <Clock className="h-4 w-4 mr-2" />
                    Tiempo
                  </TabsTrigger>
                  <TabsTrigger value="restrictions">
                    <Globe className="h-4 w-4 mr-2" />
                    Restricciones
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="resourceType">Tipo de Recurso</Label>
                      <Select
                        value={formData.resourceType}
                        onValueChange={(value) => setFormData({ ...formData, resourceType: value as ResourceType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ResourceType.PAGE}>Página</SelectItem>
                          <SelectItem value={ResourceType.FOLDER}>Carpeta</SelectItem>
                          <SelectItem value={ResourceType.MEDIA}>Media</SelectItem>
                          <SelectItem value={ResourceType.OTHER}>Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="resourceId">Ruta/ID del Recurso</Label>
                      <Select
                        value={formData.resourceId}
                        onValueChange={(value) => setFormData({ ...formData, resourceId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una ruta" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMON_ROUTES.map((route) => (
                            <SelectItem key={route.value} value={route.value}>
                              {route.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isEnabled"
                        checked={formData.isEnabled}
                        onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
                      />
                      <Label htmlFor="isEnabled">Habilitado</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxConcurrentUsers">Usuarios Concurrentes Máx. (0 = ilimitado)</Label>
                      <Input
                        id="maxConcurrentUsers"
                        type="number"
                        min="0"
                        value={formData.maxConcurrentUsers}
                        onChange={(e) => setFormData({ ...formData, maxConcurrentUsers: parseInt(e.target.value) })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="maxAccessCount">Accesos Máximos (0 = ilimitado)</Label>
                      <Input
                        id="maxAccessCount"
                        type="number"
                        min="0"
                        value={formData.maxAccessCount}
                        onChange={(e) => setFormData({ ...formData, maxAccessCount: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="rules" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Reglas de Acceso</Label>
                    <Button type="button" onClick={addRule} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Regla
                    </Button>
                  </div>

                  {formData.rules.map((rule, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Tipo de Sujeto</Label>
                          <Select
                            value={rule.subjectType}
                            onValueChange={(value) => updateRule(index, 'subjectType', value as SubjectType)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={SubjectType.USER}>Usuario</SelectItem>
                              <SelectItem value={SubjectType.ROLE}>Rol</SelectItem>
                              <SelectItem value={SubjectType.GROUP}>Grupo</SelectItem>
                              <SelectItem value={SubjectType.TAG}>Tag</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Valor</Label>
                          <Input
                            value={rule.subjectValue}
                            onChange={(e) => updateRule(index, 'subjectValue', e.target.value)}
                            placeholder={
                              rule.subjectType === SubjectType.USER ? 'email@ejemplo.com' :
                              rule.subjectType === SubjectType.ROLE ? 'ADMIN' :
                              rule.subjectType === SubjectType.GROUP ? 'admin' : 'premium'
                            }
                          />
                        </div>

                        <div>
                          <Label>Nivel de Acceso</Label>
                          <Select
                            value={rule.accessLevel}
                            onValueChange={(value) => updateRule(index, 'accessLevel', value as AccessLevel)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={AccessLevel.READ}>Lectura</SelectItem>
                              <SelectItem value={AccessLevel.CREATE}>Crear</SelectItem>
                              <SelectItem value={AccessLevel.UPDATE}>Actualizar</SelectItem>
                              <SelectItem value={AccessLevel.DELETE}>Eliminar</SelectItem>
                              <SelectItem value={AccessLevel.FULL}>Completo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeRule(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="time" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Fecha de Inicio</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="endDate">Fecha de Fin</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="startTime">Hora de Inicio</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="endTime">Hora de Fin</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Días de la Semana</Label>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mt-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={day}
                            checked={formData.daysOfWeek.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, daysOfWeek: [...formData.daysOfWeek, day] });
                              } else {
                                setFormData({ ...formData, daysOfWeek: formData.daysOfWeek.filter(d => d !== day) });
                              }
                            }}
                          />
                          <Label htmlFor={day} className="text-sm">{day.slice(0, 3)}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="restrictions" className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Las restricciones avanzadas se pueden configurar aquí (IP, geográficas, dispositivos).
                  </p>
                  <div className="text-center text-gray-500 py-8">
                    Configuración de restricciones avanzadas disponible próximamente
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingControl ? 'Actualizar' : 'Crear'} Control
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Access Controls List */}
      <div className="grid gap-4">
        {accessControls.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No hay controles de acceso configurados</p>
            </CardContent>
          </Card>
        ) : (
          accessControls.map((control) => (
            <Card key={control.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{control.resourceId}</span>
                      {getResourceTypeBadge(control.resourceType)}
                      {!control.isEnabled && (
                        <Badge variant="destructive">Deshabilitado</Badge>
                      )}
                    </div>
                    
                    {control.rules.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {control.rules.slice(0, 3).map((rule, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {rule.subjectType}: {rule.subjectValue}
                            </Badge>
                            {getAccessLevelBadge(rule.accessLevel)}
                          </div>
                        ))}
                        {control.rules.length > 3 && (
                          <Badge variant="outline">+{control.rules.length - 3} más</Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Creado: {new Date(control.createdAt).toLocaleDateString()}</span>
                      {control.maxConcurrentUsers && control.maxConcurrentUsers > 0 && (
                        <span>Max usuarios: {control.maxConcurrentUsers}</span>
                      )}
                      {control.daysOfWeek.length > 0 && (
                        <span>Días: {control.daysOfWeek.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditControl(control)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteControl(control.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}