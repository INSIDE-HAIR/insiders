/**
 * RESPONSIVEMODALDEMO - Demo completo del ResponsiveModal con navegación SOLID
 * Muestra la integración completa del sistema foundation
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useState, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { 
  Cog6ToothIcon,
  UsersIcon,
  TagIcon,
  ChartBarIcon,
  InformationCircleIcon,
  PlayIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import { SectionNavigationModal } from "./SectionNavigationModal";

// Componentes lazy-loaded para las secciones (simulando secciones reales)
const GeneralSectionDemo = lazy(() => Promise.resolve({
  default: ({ navigation }: any) => (
    <div className="space-y-4">
      
      {/* Información General - Sin accordion */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <InformationCircleIcon className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-base">Información General</h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">ID de la Sala</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                spaces/demo-room-abc123xyz
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText('spaces/demo-room-abc123xyz')}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </Button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Código de Reunión</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                abc-def-ghi
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText('abc-def-ghi')}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Enlace de Reunión</label>
            <div className="flex items-center gap-2 mt-1">
              <input 
                className="bg-muted px-2 py-1 rounded text-sm flex-1" 
                value="https://meet.google.com/abc-def-ghi"
                readOnly
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText('https://meet.google.com/abc-def-ghi')}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open('https://meet.google.com/abc-def-ghi', '_blank')}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tipo de Acceso</label>
            <div className="mt-1">
              <Badge variant="secondary" className="bg-green-900 text-green-100 hover:bg-green-800">
                <svg className="h-4 w-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                Abierto
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Estado de la Sala</label>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-green-900 text-green-100 hover:bg-green-800">
                <div className="animate-pulse mr-1 h-2 w-2 bg-green-500 rounded-full"></div>
                Conferencia Activa
              </Badge>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:bg-destructive hover:text-background border-destructive bg-destructive/10"
                onClick={() => alert('Cerrando sesión...')}
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Alert informativo */}
      <Alert>
        <InformationCircleIcon className="h-4 w-4" />
        <AlertDescription>
          Los cambios en la configuración pueden tardar unos minutos en aplicarse
        </AlertDescription>
      </Alert>
      
    </div>
  )
}));

const ReferencesSectionDemo = lazy(() => Promise.resolve({
  default: ({ navigation }: any) => (
    <div className="space-y-4">
      {/* Accordion para Tags y Grupos */}
      <div className="space-y-2">
        
        {/* Tags Accordion */}
        <details className="group border border-border rounded-lg">
          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <TagIcon className="h-5 w-5 text-primary" />
              <span className="font-semibold">Tags</span>
              <Badge variant="outline">3 asignados</Badge>
            </div>
            <ChevronRightIcon className="h-4 w-4 transition-transform group-open:rotate-90" />
          </summary>
          
          <div className="px-4 pb-4 space-y-4">
            {/* Tags Asignados */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags Asignados</label>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-900 text-blue-100 hover:bg-blue-800 rounded text-sm">
                  <span>Marketing</span>
                  <Button size="sm" variant="ghost" className="h-4 w-4 p-0 hover:bg-blue-700 hover:text-blue-100 cursor-pointer">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </Button>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-900 text-green-100 hover:bg-green-800 rounded text-sm">
                  <span>Ventas</span>
                  <Button size="sm" variant="ghost" className="h-4 w-4 p-0 hover:bg-green-700 hover:text-green-100 cursor-pointer">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </Button>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-900 text-purple-100 hover:bg-purple-800 rounded text-sm">
                  <span>Producto</span>
                  <Button size="sm" variant="ghost" className="h-4 w-4 p-0 hover:bg-purple-700 hover:text-purple-100 cursor-pointer">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </Button>
                </div>
              </div>
            </div>

            {/* Tags Disponibles */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags Disponibles</label>
              <div className="max-h-32 overflow-y-auto space-y-1 border rounded-md p-2">
                {[
                  { name: "Estrategia", color: "bg-red-900 text-red-100 hover:bg-red-800", slug: "strategy" },
                  { name: "Desarrollo", color: "bg-yellow-900 text-yellow-100 hover:bg-yellow-800", slug: "dev" },
                  { name: "Diseño", color: "bg-pink-900 text-pink-100 hover:bg-pink-800", slug: "design" },
                  { name: "Cliente", color: "bg-indigo-900 text-indigo-100 hover:bg-indigo-800", slug: "client" },
                ].map((tag, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer hover:cursor-pointer ${tag.color}`}
                    onClick={() => alert(`Asignar tag: ${tag.name}`)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{tag.name}</span>
                      <Badge variant="outline" className="text-xs bg-white/10 border-white/20 text-current">{tag.slug}</Badge>
                    </div>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </details>

        {/* Grupos Accordion */}
        <details className="group border border-border rounded-lg">
          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-primary" />
              <span className="font-semibold">Grupos</span>
              <Badge variant="outline">2 asignados</Badge>
            </div>
            <ChevronRightIcon className="h-4 w-4 transition-transform group-open:rotate-90" />
          </summary>
          
          <div className="px-4 pb-4 space-y-4">
            {/* Grupos Asignados */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Grupos Asignados</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-900 text-blue-100 hover:bg-blue-800">
                  <div>
                    <p className="font-medium">Equipo Marketing</p>
                    <p className="text-xs text-blue-200">/empresas/acme/equipos/marketing</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-blue-700 hover:text-blue-100 cursor-pointer"
                    onClick={() => alert('Desasignar Equipo Marketing')}
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-900 text-green-100 hover:bg-green-800">
                  <div>
                    <p className="font-medium">Liderazgo</p>
                    <p className="text-xs text-green-200">/empresas/acme/liderazgo</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-green-700 hover:text-green-100 cursor-pointer"
                    onClick={() => alert('Desasignar Liderazgo')}
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </Button>
                </div>
              </div>
            </div>

            {/* Grupos Disponibles */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Grupos Disponibles</label>
              <div className="max-h-32 overflow-y-auto space-y-1 border rounded-md p-2">
                {[
                  { name: "Ventas", path: "/empresas/acme/equipos/ventas", color: "bg-red-900 text-red-100 hover:bg-red-800" },
                  { name: "Desarrollo", path: "/empresas/acme/equipos/desarrollo", color: "bg-yellow-900 text-yellow-100 hover:bg-yellow-800" },
                  { name: "Soporte", path: "/empresas/acme/equipos/soporte", color: "bg-purple-900 text-purple-100 hover:bg-purple-800" },
                ].map((group, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer hover:cursor-pointer ${group.color}`}
                    onClick={() => alert(`Asignar grupo: ${group.name}`)}
                  >
                    <div>
                      <span className="text-sm font-medium">{group.name}</span>
                      <p className="text-xs opacity-75">{group.path}</p>
                    </div>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </details>
        
      </div>
    </div>
  )
}));

const MembersSectionDemo = lazy(() => Promise.resolve({
  default: ({ navigation }: any) => (
    <div className="space-y-6">
      
      {/* Sección 1: Agregar Miembro - Sin accordion */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          <h3 className="font-medium text-base">Agregar Miembro</h3>
        </div>
        
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
            placeholder="email@ejemplo.com"
            onKeyPress={(e) => e.key === "Enter" && alert('Agregando miembro...')}
          />
          <select className="w-40 px-3 py-2 border border-input rounded-md text-sm">
            <option value="ROLE_UNSPECIFIED">Participante</option>
            <option value="COHOST">Co-anfitrión</option>
          </select>
          <Button
            onClick={() => alert('Agregando miembro...')}
            className="gap-1"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Agregar
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => alert('Refrescando...')}
          className="gap-2"
        >
          <ArrowPathIcon className="h-4 w-4 text-primary" />
          Refrescar lista
        </Button>
      </div>

      {/* Sección 2: Lista de Miembros - Sin accordion */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <UsersIcon className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-base">Miembros Actuales</h3>
          <Badge variant="outline">15 de 27</Badge>
        </div>
        
        {/* Filtros de búsqueda */}
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              placeholder="Buscar por nombre o email..."
              className="w-full px-3 py-2 border border-input rounded-md text-sm"
            />
          </div>
          <select className="w-40 px-3 py-2 border border-input rounded-md text-sm">
            <option value="ALL">Todos</option>
            <option value="COHOST">Co-anfitrión</option>
            <option value="ROLE_UNSPECIFIED">Participante</option>
          </select>
        </div>

        {/* Lista scrollable de miembros */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {[
            { name: "Juan Pérez", email: "juan.perez@empresa.com", role: "Co-anfitrión" },
            { name: "María García", email: "maria.garcia@empresa.com", role: "Participante" },
            { name: "Carlos López", email: "carlos.lopez@empresa.com", role: "Participante" },
            { name: "Ana Rodríguez", email: "ana.rodriguez@empresa.com", role: "Co-anfitrión" },
            { name: "Pedro Martínez", email: "pedro.martinez@empresa.com", role: "Participante" },
            { name: "Laura Sánchez", email: "laura.sanchez@empresa.com", role: "Participante" },
            { name: "Diego Torres", email: "diego.torres@empresa.com", role: "Participante" },
            { name: "Sofia Mendez", email: "sofia.mendez@empresa.com", role: "Participante" },
          ].map((member, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-sm">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                  <Badge className={`text-xs mt-1 ${member.role === 'Co-anfitrión' ? 'bg-blue-900 text-blue-100 hover:bg-blue-800' : 'bg-gray-900 text-gray-100 hover:bg-gray-800'}`}>
                    {member.role}
                  </Badge>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => alert(`Eliminar ${member.email}`)}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </Button>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  )
}));

const SettingsSectionDemo = lazy(() => Promise.resolve({
  default: ({ navigation }: any) => (
    <div className="space-y-6">
      
      {/* Sección 1: Moderación y Permisos - Sin accordions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheckIcon className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-base">Moderación y Permisos</h3>
        </div>
        
        {/* Restringir Puntos de Entrada */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="restrict-entry">Restringir Puntos de Entrada</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-sm">
                      <strong>Control de Aplicaciones:</strong>
                      <br />• <strong>Desactivado:</strong> Se puede acceder desde cualquier aplicación (Google Meet, Calendar, etc.)
                      <br />• <strong>Activado:</strong> Solo la aplicación que creó la sala puede acceder (más restrictivo)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground">
              Limita el acceso solo a la aplicación que creó la sala
            </p>
          </div>
          <Switch id="restrict-entry" defaultChecked={false} />
        </div>

        {/* Activar Moderación */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="moderation">Activar Moderación</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-sm">
                      <strong>Control del Anfitrión:</strong>
                      <br />
                      Permite al anfitrión y co-anfitriones controlar quién puede chatear, presentar, reaccionar y si los nuevos participantes entran como espectadores.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground">
              El organizador controla permisos de los participantes
            </p>
          </div>
          <Switch id="moderation" defaultChecked={true} />
        </div>

        {/* Configuraciones de moderación */}
        <div className="ml-6 space-y-4 border-l-2 border-primary/20 pl-4">
          
          {/* Restricción de Chat */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Restricción de Chat</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-sm">
                      <strong>Control de Chat:</strong>
                      <br />
                      Determina quién puede enviar mensajes en el chat durante la reunión.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select defaultValue="NO_RESTRICTION">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NO_RESTRICTION">Sin restricción</SelectItem>
                <SelectItem value="MODERATOR_ONLY">Solo moderadores</SelectItem>
                <SelectItem value="DISABLED">Chat deshabilitado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Restricción de Reacciones */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Restricción de Reacciones</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-sm">
                      <strong>Control de Reacciones:</strong>
                      <br />
                      Determina quién puede enviar reacciones (emojis, "me gusta", etc.) durante la reunión.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select defaultValue="NO_RESTRICTION">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NO_RESTRICTION">Sin restricción</SelectItem>
                <SelectItem value="MODERATOR_ONLY">Solo moderadores</SelectItem>
                <SelectItem value="DISABLED">Reacciones deshabilitadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Restricción de Presentación */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Restricción de Presentación</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-sm">
                      <strong>Control de Pantalla:</strong>
                      <br />
                      Determina quién puede compartir pantalla, presentar documentos o mostrar contenido durante la reunión.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select defaultValue="NO_RESTRICTION">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NO_RESTRICTION">Sin restricción</SelectItem>
                <SelectItem value="MODERATOR_ONLY">Solo moderadores</SelectItem>
                <SelectItem value="DISABLED">Presentación deshabilitada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Unirse como Espectador */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="default-viewer">Unirse como Espectador</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p className="text-sm">
                        <strong>Modo Espectador:</strong>
                        <br />
                        Los nuevos participantes entrarán solo con permisos de visualización. El anfitrión puede promocionarlos a participantes activos después.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-muted-foreground">
                Nuevos participantes se unen como espectadores
              </p>
            </div>
            <Switch id="default-viewer" defaultChecked={false} />
          </div>
        </div>
      </div>

      {/* Sección 2: Funciones de IA - Directamente visible */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-base">Funciones de IA</h3>
        </div>
        
        {/* Grabación Automática */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-recording">Grabación Automática</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-sm">
                      <strong>Grabación Automática:</strong>
                      <br />
                      La reunión se grabará automáticamente cuando comience. Los archivos se guardan en Google Drive del organizador. Los participantes serán notificados.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground">
              Las reuniones se grabarán automáticamente al iniciar
            </p>
          </div>
          <Switch id="auto-recording" defaultChecked={true} />
        </div>

        {/* Transcripción Automática */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-transcription">Transcripción Automática</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-sm">
                      <strong>Transcripción Automática:</strong>
                      <br />
                      Convierte automáticamente el audio de la reunión en texto. El documento se guarda en Google Drive con marcas de tiempo y identificación de participantes.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground">
              Genera transcripciones de las conversaciones
            </p>
          </div>
          <Switch id="auto-transcription" defaultChecked={false} />
        </div>

        {/* Notas Inteligentes */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="smart-notes">Notas Inteligentes</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-sm">
                      <strong>Notas Inteligentes:</strong>
                      <br />
                      Genera automáticamente resúmenes, puntos clave, acciones y decisiones de la reunión usando IA. Se guarda como documento de Google Docs.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground">
              Genera resúmenes y puntos clave automáticamente
            </p>
          </div>
          <Switch id="smart-notes" defaultChecked={true} />
        </div>
      </div>

      {/* Alert informativo */}
      <Alert>
        <InformationCircleIcon className="h-4 w-4" />
        <AlertDescription>
          Los cambios en la configuración pueden tardar unos minutos en aplicarse
        </AlertDescription>
      </Alert>
      
    </div>
  )
}));

// Componente SessionsSectionDemo - Solo la funcionalidad "Por Sesión"
const SessionsSectionDemo = lazy(() => Promise.resolve({
  default: ({ navigation }: any) => (
    <div className="space-y-4">
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {[
          {
            id: "session-1",
            date: "15 Enero 2025",
            duration: "90 min",
            participants: 8,
            isActive: false,
            recordings: [
              { state: "Disponible", time: "14:30", hasLink: true },
            ],
            transcripts: [
              { state: "Disponible", preview: "Hola equipo, comenzamos con la revisión de objetivos...", hasLink: true },
            ],
            smartNotes: [
              { title: "Resumen ejecutivo", preview: "• Objetivos Q1 definidos\n• Asignación de responsables\n• Fechas de entrega confirmadas", hasLink: true },
            ],
            participants_list: [
              { name: "Juan Pérez", joinTime: "14:30", leaveTime: "16:00" },
              { name: "María García", joinTime: "14:32", leaveTime: "16:00" },
              { name: "Carlos López", joinTime: "14:35", leaveTime: "15:45" },
            ]
          },
          {
            id: "session-2", 
            date: "14 Enero 2025",
            duration: "75 min",
            participants: 12,
            isActive: false,
            recordings: [
              { state: "Procesando", time: "10:15", hasLink: false },
            ],
            transcripts: [
              { state: "Procesando", preview: null, hasLink: false },
            ],
            smartNotes: [],
            participants_list: [
              { name: "Ana Rodríguez", joinTime: "10:15", leaveTime: "11:30" },
              { name: "Pedro Martínez", joinTime: "10:18", leaveTime: "11:30" },
              { name: "Laura Sánchez", joinTime: "10:20", leaveTime: "11:25" },
            ]
          },
          {
            id: "session-3",
            date: "13 Enero 2025", 
            duration: "120 min",
            participants: 6,
            isActive: false,
            recordings: [
              { state: "Disponible", time: "09:00", hasLink: true },
            ],
            transcripts: [
              { state: "Disponible", preview: "Buenos días, hoy vamos a revisar el roadmap del producto...", hasLink: true },
            ],
            smartNotes: [
              { title: "Action Items", preview: "• Revisar mockups UI\n• Definir specs técnicas\n• Planning sprint próximo", hasLink: true },
            ],
            participants_list: [
              { name: "Diego Torres", joinTime: "09:00", leaveTime: "11:00" },
              { name: "Sofia Mendez", joinTime: "09:05", leaveTime: "11:00" },
            ]
          },
        ].map((session, sessionIndex) => (
          <details key={session.id} className="group border border-border rounded-lg">
            <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <InformationCircleIcon className="h-5 w-5 text-primary" />
                <div>
                  <span className="font-medium">Sesión {session.date}</span>
                  <div className="text-sm text-muted-foreground">
                    {session.duration} • {session.participants} participantes • ID: {session.id}
                  </div>
                </div>
                {session.isActive && (
                  <Badge className="animate-pulse ml-2">
                    <span className="mr-1">●</span>
                    Activa
                  </Badge>
                )}
              </div>
              <ChevronRightIcon className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            
            {/* Contenido de la sesión con sub-accordions COMPLETOS */}
            <div className="px-4 pb-4 space-y-3">

                {/* Sub-accordion: Resumen de Sesión - NUEVO */}
                <details className="group border border-border rounded-lg" open>
                  <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <ChartBarIcon className="h-4 w-4 text-primary" />
                      <span className="font-medium">Resumen de Sesión</span>
                      <Badge className="bg-blue-900 text-blue-100 hover:bg-blue-800">{session.id}</Badge>
                    </div>
                    <ChevronRightIcon className="h-3 w-3 transition-transform group-open:rotate-90" />
                  </summary>
                  
                  <div className="px-3 pb-3 space-y-3">
                    {/* Métricas principales */}
                    <div className="bg-muted/50 rounded p-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium mb-1">Información General</div>
                          <div className="space-y-1 text-xs">
                            <div>Duración: <span className="font-medium">{session.duration}</span></div>
                            <div>Participantes: <span className="font-medium">{session.participants}</span></div>
                            <div>Estado: <span className="font-medium flex items-center gap-1">{session.isActive ? (<><div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>Activa</>) : (<><div className="h-2 w-2 bg-gray-400 rounded-full"></div>Finalizada</>)}</span></div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-1">Analytics</div>
                          <div className="space-y-1 text-xs">
                            <div>Asistencia promedio: <span className="font-medium">87%</span></div>
                            <div>Tiempo medio: <span className="font-medium">78 min</span></div>
                            <div>Top participante: <span className="font-medium">{session.participants_list[0]?.name || "N/A"}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </details>

                {/* Sub-accordion: Participantes COMPLETO */}
                <details className="group border border-border rounded-lg" open>
                  <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 text-primary" />
                      <span className="font-medium">Participantes Detallados</span>
                      <Badge variant="outline">{session.participants}</Badge>
                    </div>
                    <ChevronRightIcon className="h-3 w-3 transition-transform group-open:rotate-90" />
                  </summary>
                  
                  <div className="px-3 pb-3 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {/* Lista completa de participantes con datos enriquecidos */}
                      {[
                        { 
                          name: "Juan Pérez", 
                          type: "signed_in",
                          joinTime: session.participants_list.find(p => p.name === "Juan Pérez")?.joinTime || "14:30",
                          leaveTime: session.participants_list.find(p => p.name === "Juan Pérez")?.leaveTime || "16:00",
                          duration: 90,
                          participation: 100,
                          totalSessions: 15,
                          isTopParticipant: true
                        },
                        { 
                          name: "María García", 
                          type: "signed_in",
                          joinTime: session.participants_list.find(p => p.name === "María García")?.joinTime || "14:32",
                          leaveTime: session.participants_list.find(p => p.name === "María García")?.leaveTime || "16:00",
                          duration: 88,
                          participation: 98,
                          totalSessions: 12,
                          isTopParticipant: false
                        },
                        { 
                          name: "Carlos López", 
                          type: "signed_in",
                          joinTime: session.participants_list.find(p => p.name === "Carlos López")?.joinTime || "14:35",
                          leaveTime: session.participants_list.find(p => p.name === "Carlos López")?.leaveTime || "15:45",
                          duration: 70,
                          participation: 78,
                          totalSessions: 10,
                          isTopParticipant: false
                        },
                        { 
                          name: "Usuario Anónimo", 
                          type: "anonymous",
                          joinTime: "14:50",
                          leaveTime: "15:20",
                          duration: 30,
                          participation: 33,
                          totalSessions: 1,
                          isTopParticipant: false
                        },
                        { 
                          name: "Teléfono (+1234567)", 
                          type: "phone",
                          joinTime: "14:45",
                          leaveTime: "15:15",
                          duration: 30,
                          participation: 33,
                          totalSessions: 1,
                          isTopParticipant: false
                        }
                      ].slice(0, session.participants).map((participant, partIndex) => (
                        <div key={partIndex} className={`p-3 border rounded-lg ${participant.isTopParticipant ? 'bg-primary/5 border-primary/20' : 'bg-background'}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {/* Avatar con inicial */}
                              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-primary">
                                  {participant.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-sm flex items-center gap-1">
                                  {participant.name}
                                  {participant.isTopParticipant && (
                                    <Badge className="text-xs bg-yellow-900 text-yellow-100 hover:bg-yellow-800">
                                      Top
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <span className="flex items-center gap-1">
                                    {participant.type === "signed_in" ? (
                                      <><ShieldCheckIcon className="h-3 w-3 text-primary" />Autenticado</>
                                    ) : participant.type === "anonymous" ? (
                                      <><svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>Anónimo</>
                                    ) : (
                                      <><svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>Teléfono</>
                                    )}
                                  </span>
                                  <span>• {participant.totalSessions} sesiones total</span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {participant.duration} min
                            </Badge>
                          </div>
                          
                          {/* Métricas de participación */}
                          <div className="grid grid-cols-3 gap-2 mb-2 text-center">
                            <div className="bg-muted/50 rounded p-1">
                              <div className="text-xs font-medium">{participant.participation}%</div>
                              <div className="text-xs text-muted-foreground">Participación</div>
                            </div>
                            <div className="bg-muted/50 rounded p-1">
                              <div className="text-xs font-medium">{participant.joinTime}</div>
                              <div className="text-xs text-muted-foreground">Entrada</div>
                            </div>
                            <div className="bg-muted/50 rounded p-1">
                              <div className="text-xs font-medium">{participant.leaveTime}</div>
                              <div className="text-xs text-muted-foreground">Salida</div>
                            </div>
                          </div>
                          
                          {/* Timeline visual */}
                          <div className="text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <span>Timeline:</span>
                              <div className="flex-1 bg-muted rounded h-1 overflow-hidden">
                                <div 
                                  className={`h-full ${participant.participation > 80 ? 'bg-green-500' : participant.participation > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${participant.participation}%` }}
                                ></div>
                              </div>
                              <span>{participant.participation}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>

                {/* Sub-accordion: Grabaciones (Mejorado) */}
                <details className="group border border-border rounded-lg">
                  <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <VideoCameraIcon className="h-4 w-4 text-primary" />
                      <span className="font-medium">Grabaciones</span>
                      <Badge variant="outline">{session.recordings.length}</Badge>
                    </div>
                    <ChevronRightIcon className="h-3 w-3 transition-transform group-open:rotate-90" />
                  </summary>
                  
                  <div className="px-3 pb-3">
                    {session.recordings.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hay grabaciones disponibles</p>
                    ) : (
                      <div className="space-y-2">
                        {session.recordings.map((recording, recIndex) => (
                          <div key={recIndex} className="p-3 bg-muted/50 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="text-sm font-medium">
                                  Estado: <span className="flex items-center gap-1">{recording.state === "Disponible" ? (<><div className="h-2 w-2 bg-green-500 rounded-full"></div>Disponible</>) : (<><ArrowPathIcon className="h-3 w-3 animate-spin text-primary" />Procesando</>)}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Iniciada: {recording.time} • Duración: {session.duration}
                                </div>
                              </div>
                              {recording.hasLink && (
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => alert('Reproduciendo grabación...')}
                                  >
                                    <PlayIcon className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => alert('Descargando...')}
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                  </Button>
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Calidad: HD • Tamaño: ~{Math.round(parseInt(session.duration) * 2.5)}MB
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </details>

                {/* Sub-accordion: Transcripciones (Mejorado) */}
                <details className="group border border-border rounded-lg">
                  <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="h-4 w-4 text-primary" />
                      <span className="font-medium">Transcripciones</span>
                      <Badge variant="outline">{session.transcripts.length}</Badge>
                    </div>
                    <ChevronRightIcon className="h-3 w-3 transition-transform group-open:rotate-90" />
                  </summary>
                  
                  <div className="px-3 pb-3">
                    {session.transcripts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hay transcripciones disponibles</p>
                    ) : (
                      <div className="space-y-2">
                        {session.transcripts.map((transcript, transIndex) => (
                          <div key={transIndex} className="p-3 bg-muted/50 border rounded-lg">
                            <div className="text-sm font-medium mb-2 flex items-center justify-between">
                              <span className="flex items-center gap-1">Estado: {transcript.state === "Disponible" ? (<><div className="h-2 w-2 bg-green-500 rounded-full"></div>Disponible</>) : (<><ArrowPathIcon className="h-3 w-3 animate-spin text-primary" />Procesando</>)}</span>
                              {transcript.hasLink && (
                                <Badge variant="outline" className="text-xs">
                                  ~{Math.round(parseInt(session.duration) * 150)} palabras
                                </Badge>
                              )}
                            </div>
                            {transcript.preview && (
                              <div className="text-xs text-muted-foreground mb-2 italic border-l-2 border-muted pl-2">
                                "{transcript.preview}"
                              </div>
                            )}
                            {transcript.hasLink && (
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => alert('Abriendo transcripción...')}
                                >
                                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                                  Ver completa
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => alert('Descargando PDF...')}
                                >
                                  PDF
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </details>

                {/* Sub-accordion: Notas Inteligentes (Mejorado) */}
                {session.smartNotes.length > 0 && (
                  <details className="group border border-border rounded-lg">
                    <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <SparklesIcon className="h-4 w-4 text-primary" />
                        <span className="font-medium">Notas Inteligentes</span>
                        <Badge variant="outline">{session.smartNotes.length}</Badge>
                      </div>
                      <ChevronRightIcon className="h-3 w-3 transition-transform group-open:rotate-90" />
                    </summary>
                    
                    <div className="px-3 pb-3">
                      <div className="space-y-2">
                        {session.smartNotes.map((note, noteIndex) => (
                          <div key={noteIndex} className="p-3 bg-muted/50 border rounded-lg">
                            <div className="text-sm font-medium mb-2 flex items-center justify-between">
                              <span>{note.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {note.preview.split('\n').length} puntos
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mb-2 whitespace-pre-line border-l-2 border-primary/20 pl-2">
                              {note.preview}
                            </div>
                            {note.hasLink && (
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => alert('Abriendo notas completas...')}
                                >
                                  <SparklesIcon className="h-4 w-4 mr-1" />
                                  Ver completas
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => alert('Exportando...')}
                                >
                                  Exportar
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                )}

            </div>
          </details>
        ))}
      </div>
    </div>
  )
}));

// Componente StatisticsSectionDemo - Solo estadísticas y ranking
const StatisticsSectionDemo = lazy(() => Promise.resolve({
  default: ({ navigation }: any) => (
    <div className="space-y-4">
      
      {/* Estadísticas generales */}
      <div className="bg-muted/50 rounded p-4">
        <h4 className="font-medium text-base mb-3 flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-primary" />
          Estadísticas Generales
        </h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-background rounded p-3">
            <div className="text-xl font-bold text-primary">15</div>
            <div className="text-sm text-muted-foreground">Participantes únicos</div>
          </div>
          <div className="bg-background rounded p-3">
            <div className="text-xl font-bold text-primary">47</div>
            <div className="text-sm text-muted-foreground">Total registros</div>
          </div>
          <div className="bg-background rounded p-3">
            <div className="text-xl font-bold text-primary">12</div>
            <div className="text-sm text-muted-foreground">Reuniones analizadas</div>
          </div>
        </div>
      </div>
      
      {/* Ranking de Participantes */}
      <details className="group border border-border rounded-lg" open>
        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-primary" />
            <span className="font-medium">Ranking de Participantes</span>
            <Badge variant="outline">9 participantes</Badge>
          </div>
          <ChevronRightIcon className="h-4 w-4 transition-transform group-open:rotate-90" />
        </summary>
        
        <div className="px-4 pb-4">
          <div className="space-y-2">
            {[
              { 
                name: "Juan Pérez", 
                minutes: 750, 
                meetings: 12, 
                participation: "85%",
                avgPerSession: "63min",
                recentSessions: ["15/01 - 90min", "14/01 - 75min", "13/01 - 45min", "12/01 - 60min"],
                type: "Autenticado"
              },
              { 
                name: "María García", 
                minutes: 555, 
                meetings: 10, 
                participation: "78%",
                avgPerSession: "56min",
                recentSessions: ["15/01 - 88min", "14/01 - 70min", "13/01 - 42min", "10/01 - 55min"],
                type: "Autenticado"
              },
              { 
                name: "Carlos López", 
                minutes: 465, 
                meetings: 8, 
                participation: "72%",
                avgPerSession: "58min",
                recentSessions: ["15/01 - 70min", "13/01 - 60min", "11/01 - 65min"],
                type: "Autenticado"
              },
              { 
                name: "Ana Rodríguez", 
                minutes: 380, 
                meetings: 7, 
                participation: "65%",
                avgPerSession: "54min",
                recentSessions: ["15/01 - 90min", "12/01 - 45min", "09/01 - 50min"],
                type: "Autenticado"
              },
              { 
                name: "Pedro Martínez", 
                minutes: 320, 
                meetings: 6, 
                participation: "60%",
                avgPerSession: "53min",
                recentSessions: ["14/01 - 72min", "11/01 - 48min", "08/01 - 40min"],
                type: "Autenticado"
              },
              { 
                name: "Laura Sánchez", 
                minutes: 285, 
                meetings: 5, 
                participation: "57%",
                avgPerSession: "57min",
                recentSessions: ["14/01 - 65min", "10/01 - 55min", "07/01 - 45min"],
                type: "Autenticado"
              },
              { 
                name: "Diego Torres", 
                minutes: 180, 
                meetings: 4, 
                participation: "45%",
                avgPerSession: "45min",
                recentSessions: ["13/01 - 60min", "09/01 - 30min", "05/01 - 40min"],
                type: "Autenticado"
              },
              { 
                name: "Usuario Anónimo", 
                minutes: 105, 
                meetings: 3, 
                participation: "35%",
                avgPerSession: "35min",
                recentSessions: ["14/01 - 30min", "10/01 - 45min", "06/01 - 30min"],
                type: "Anónimo"
              },
              { 
                name: "Teléfono (+1234567)", 
                minutes: 75, 
                meetings: 2, 
                participation: "25%",
                avgPerSession: "38min",
                recentSessions: ["12/01 - 45min", "08/01 - 30min"],
                type: "Teléfono"
              }
            ].map((participant, index) => (
              <details key={index} className="group border border-border rounded-lg">
                <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs min-w-[24px] h-5">
                      #{index + 1}
                    </Badge>
                    <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {participant.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-sm">{participant.name}</span>
                      <div className="text-xs text-muted-foreground">
                        {participant.type} • {participant.minutes} min total
                      </div>
                    </div>
                  </div>
                  <ChevronRightIcon className="h-3 w-3 transition-transform group-open:rotate-90" />
                </summary>
                
                <div className="px-3 pb-3 space-y-3">
                  
                  {/* Métricas principales */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-background rounded p-2">
                      <div className="text-sm font-medium">{participant.meetings}</div>
                      <div className="text-xs text-muted-foreground">Total reuniones</div>
                    </div>
                    <div className="bg-background rounded p-2">
                      <div className="text-sm font-medium">{participant.avgPerSession}</div>
                      <div className="text-xs text-muted-foreground">Promedio sesión</div>
                    </div>
                    <div className="bg-background rounded p-2">
                      <div className="text-sm font-medium">{participant.participation}</div>
                      <div className="text-xs text-muted-foreground">% Participación</div>
                    </div>
                  </div>
                  
                  {/* Sesiones recientes */}
                  <details className="group border border-border rounded-lg">
                    <summary className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Sesiones Recientes</span>
                        <Badge variant="outline" className="text-xs">
                          {participant.recentSessions.length}
                        </Badge>
                      </div>
                      <ChevronRightIcon className="h-3 w-3 transition-transform group-open:rotate-90" />
                    </summary>
                    
                    <div className="px-2 pb-2">
                      <div className="space-y-1">
                        {participant.recentSessions.map((session, sIndex) => (
                          <div key={sIndex} className="text-xs text-muted-foreground p-1 bg-background rounded">
                            • {session}
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                  
                </div>
              </details>
            ))}
          </div>
        </div>
      </details>
      
    </div>
  )
}));

// Definición de secciones
const demoSections = [
  {
    id: "general",
    title: "General",
    icon: InformationCircleIcon,
    description: "Información básica y configuración de la sala",
    keywords: ["información", "nombre", "código", "básico"],
    component: GeneralSectionDemo,
  },
  {
    id: "references",
    title: "Referencias", 
    icon: TagIcon,
    description: "Tags y grupos para organizar la sala",
    keywords: ["tags", "grupos", "referencias", "organización", "categorías"],
    component: ReferencesSectionDemo,
  },
  {
    id: "members",
    title: "Miembros", 
    icon: UsersIcon,
    description: "Gestión de participantes y roles",
    keywords: ["miembros", "participantes", "usuarios", "roles", "cohosts"],
    component: MembersSectionDemo,
  },
  {
    id: "settings",
    title: "Configuración",
    icon: Cog6ToothIcon,
    description: "Configuraciones avanzadas de la sala",
    keywords: ["configuración", "avanzado", "moderación", "grabación", "restricciones"],
    component: SettingsSectionDemo,
  },
  {
    id: "sessions", 
    title: "Sesiones",
    icon: CalendarDaysIcon,
    description: "Detalle completo por sesión de reunión",
    keywords: ["sesiones", "reuniones", "detalle", "participantes", "grabaciones"],
    component: SessionsSectionDemo,
  },
  {
    id: "statistics", 
    title: "Estadísticas",
    icon: ChartBarIcon,
    description: "Analytics y ranking de participantes",
    keywords: ["estadísticas", "analytics", "ranking", "participantes", "métricas"],
    component: StatisticsSectionDemo,
  },
];

export const ResponsiveModalDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<"top" | "bottom" | "left" | "right">("bottom");
  const [currentSection, setCurrentSection] = useState<string>(demoSections[0]?.id || "general");

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚀 ResponsiveModal + Sistema SOLID
            <Badge className="bg-green-900 text-green-100 hover:bg-green-800">Foundation Complete</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Demo Controls */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Variantes de Modal:</h3>
              <div className="flex flex-wrap gap-2">
                {(["bottom", "top", "left", "right"] as const).map((variant) => (
                  <Button
                    key={variant}
                    variant={modalVariant === variant ? "default" : "outline"}
                    size="sm"
                    onClick={() => setModalVariant(variant)}
                  >
                    {variant}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Sección Inicial:</h3>
              <div className="flex flex-wrap gap-2">
                {demoSections.map((section) => (
                  <Button
                    key={section.id}
                    variant={currentSection === section.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentSection(section.id)}
                  >
                    <section.icon className="h-4 w-4 mr-1" />
                    {section.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Launch Button */}
          <div className="text-center">
            <Button 
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="gap-2"
            >
              <PlayIcon className="h-5 w-5" />
              Abrir Modal Responsivo ({modalVariant})
            </Button>
          </div>

          {/* Features List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">🎯 Funcionalidades Demo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  ResponsiveModal integrado
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Navegación SOLID con búsqueda
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Keyboard shortcuts (Alt+←/→)
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Lazy loading de secciones
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Mobile: bottom sheet
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Desktop: modal centrado
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Estado persistente
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Historial de navegación
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  🎹 <strong>Prueba:</strong> Alt+←/→ para navegar, números 1-4 para acceso directo, 
                  búsqueda por "miembros", "configuración", etc.
                </p>
              </div>
            </CardContent>
          </Card>

        </CardContent>
      </Card>

      {/* Modal Demo */}
      <SectionNavigationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sections={demoSections}
        title="Detalles de la Sala"
        description="Sistema de navegación SOLID integrado con ResponsiveModal"
        initialSectionId={currentSection}
        variant={modalVariant}
        maxWidth="4xl"
        onSectionChange={(sectionId) => {
          console.log("🧭 Section changed to:", sectionId);
        }}
        globalProps={{
          // Props que se pasan a todas las secciones
          roomId: "demo-room-123",
          userId: "demo-user-456",
        }}
      />
    </div>
  );
};