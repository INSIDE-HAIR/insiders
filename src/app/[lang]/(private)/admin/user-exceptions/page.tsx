"use client";

import React, { useState, useEffect } from 'react';
import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Switch } from '@/src/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Trash2, Plus, Edit, Eye, UserX } from 'lucide-react';
import { UserException, ExceptionAccessLevel } from '@prisma/client';

export default function UserExceptionsPage() {
  const [exceptions, setExceptions] = useState<UserException[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingException, setEditingException] = useState<UserException | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    accessLevel: ExceptionAccessLevel.CUSTOM as ExceptionAccessLevel,
    allowedRoutes: [] as string[],
    reason: '',
    description: '',
    isTemporary: false,
    endDate: '',
    temporaryTeams: [] as string[],
  });

  // Load exceptions
  useEffect(() => {
    loadExceptions();
  }, []);

  const loadExceptions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/user-exceptions');
      if (response.ok) {
        const data = await response.json();
        setExceptions(data.exceptions);
      }
    } catch (error) {
      console.error('Error loading exceptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateException = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/user-exceptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          allowedRoutes: formData.allowedRoutes.filter(route => route.trim()),
          temporaryTeams: formData.temporaryTeams.filter(team => team.trim()),
        }),
      });

      if (response.ok) {
        await loadExceptions();
        resetForm();
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating exception:', error);
    }
  };

  const handleDeleteException = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta excepción?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/user-exceptions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadExceptions();
      }
    } catch (error) {
      console.error('Error deleting exception:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      accessLevel: ExceptionAccessLevel.CUSTOM as ExceptionAccessLevel,
      allowedRoutes: [],
      reason: '',
      description: '',
      isTemporary: false,
      endDate: '',
      temporaryTeams: [],
    });
    setEditingException(null);
  };

  const getAccessLevelBadge = (level: ExceptionAccessLevel) => {
    const colors = {
      [ExceptionAccessLevel.READONLY]: 'bg-blue-100 text-blue-800',
      [ExceptionAccessLevel.EDITOR]: 'bg-green-100 text-green-800',
      [ExceptionAccessLevel.ADMIN]: 'bg-orange-100 text-orange-800',
      [ExceptionAccessLevel.SUPER_ADMIN]: 'bg-red-100 text-red-800',
      [ExceptionAccessLevel.CUSTOM]: 'bg-purple-100 text-purple-800',
    };

    return (
      <Badge className={colors[level]}>
        {level.replace('_', ' ')}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Cargando excepciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DocHeader
        title='Excepciones de Usuario'
        description='Gestiona excepciones individuales de acceso por email'
        icon={UserX}
      />

      <DocContent>
        <div className="flex justify-end items-center mb-8">
          <Button 
            onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Excepción
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {editingException ? 'Editar Excepción' : 'Crear Nueva Excepción'}
            </CardTitle>
            <CardDescription>
              Define permisos especiales para un usuario específico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateException} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email del Usuario</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="usuario@ejemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="accessLevel">Nivel de Acceso</Label>
                  <Select
                    value={formData.accessLevel}
                    onValueChange={(value) => setFormData({ ...formData, accessLevel: value as ExceptionAccessLevel })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ExceptionAccessLevel.READONLY}>Solo Lectura</SelectItem>
                      <SelectItem value={ExceptionAccessLevel.EDITOR}>Editor</SelectItem>
                      <SelectItem value={ExceptionAccessLevel.ADMIN}>Admin</SelectItem>
                      <SelectItem value={ExceptionAccessLevel.SUPER_ADMIN}>Super Admin</SelectItem>
                      <SelectItem value={ExceptionAccessLevel.CUSTOM}>Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.accessLevel === ExceptionAccessLevel.CUSTOM && (
                <div>
                  <Label htmlFor="allowedRoutes">Rutas Permitidas (una por línea)</Label>
                  <Textarea
                    id="allowedRoutes"
                    value={formData.allowedRoutes.join('\n')}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      allowedRoutes: e.target.value.split('\n').filter(r => r.trim()) 
                    })}
                    placeholder="/[lang]/admin/drive&#10;/[lang]/admin/users&#10;*"
                    rows={4}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Usa * para acceso completo, /[lang]/admin/* para todo admin, rutas específicas para acceso limitado
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reason">Razón</Label>
                  <Input
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Acceso temporal para proyecto X"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isTemporary"
                    checked={formData.isTemporary}
                    onCheckedChange={(checked) => setFormData({ ...formData, isTemporary: checked })}
                  />
                  <Label htmlFor="isTemporary">Es temporal</Label>
                </div>
              </div>

              {formData.isTemporary && (
                <div>
                  <Label htmlFor="endDate">Fecha de Expiración</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción detallada de la excepción..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingException ? 'Actualizar' : 'Crear'} Excepción
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

      {/* Exceptions List */}
      <div className="grid gap-4">
        {exceptions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No hay excepciones configuradas</p>
            </CardContent>
          </Card>
        ) : (
          exceptions.map((exception) => (
            <Card key={exception.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{exception.email}</span>
                      {getAccessLevelBadge(exception.accessLevel)}
                      {!exception.isActive && (
                        <Badge variant="destructive">Inactiva</Badge>
                      )}
                      {exception.isTemporary && (
                        <Badge variant="outline">Temporal</Badge>
                      )}
                    </div>
                    
                    {exception.reason && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Razón:</strong> {exception.reason}
                      </p>
                    )}
                    
                    {exception.allowedRoutes.length > 0 && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Rutas:</strong> {exception.allowedRoutes.slice(0, 3).join(', ')}
                        {exception.allowedRoutes.length > 3 && ' ...'}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Creada: {new Date(exception.createdAt).toLocaleDateString()}</span>
                      <span>Usos: {exception.useCount}</span>
                      {exception.lastUsed && (
                        <span>Último uso: {new Date(exception.lastUsed).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteException(exception.id)}
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
      </DocContent>
    </div>
  );
}