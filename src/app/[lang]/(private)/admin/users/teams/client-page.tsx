"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { useToast } from "@/src/hooks/use-toast";
import {
  Plus,
  Search,
  Users,
  Edit2,
  Trash2,
  UserPlus,
  UserMinus,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import TailwindGrid from "@/src/components/shared/grid/TailwindGrid";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "CLIENT" | "EMPLOYEE" | "ADMIN";
  image?: string | null;
  groups?: { id: string; name: string }[];
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  users: User[];
}

interface GroupFormData {
  name: string;
  description: string;
}

export default function GroupsClient() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isManageUsersDialogOpen, setIsManageUsersDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [formData, setFormData] = useState<GroupFormData>({
    name: "",
    description: "",
  });
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("");

  const { toast } = useToast();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/groups?search=${encodeURIComponent(searchTerm)}`
      );
      const result = await response.json();

      if (result.success) {
        setGroups(result.data.groups);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch groups",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async (excludeGroupId?: string) => {
    try {
      const params = new URLSearchParams();
      if (excludeGroupId) params.append("excludeGroup", excludeGroupId);
      if (userSearchTerm) params.append("search", userSearchTerm);
      if (userRoleFilter) params.append("role", userRoleFilter);

      const response = await fetch(`/api/admin/users/available?${params}`);
      const result = await response.json();

      if (result.success) {
        setAvailableUsers(result.data);
      }
    } catch (error) {
      console.error("Error fetching available users:", error);
    }
  };

  const handleCreateGroup = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Group created successfully",
        });
        setIsCreateDialogOpen(false);
        setFormData({ name: "", description: "" });
        fetchGroups();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create group",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    }
  };

  const handleEditGroup = async () => {
    if (!selectedGroup || !formData.name.trim()) return;

    try {
      const response = await fetch(`/api/admin/groups/${selectedGroup.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Group updated successfully",
        });
        setIsEditDialogOpen(false);
        setSelectedGroup(null);
        setFormData({ name: "", description: "" });
        fetchGroups();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update group",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update group",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGroup = async (group: Group) => {
    if (group.users.length > 0) {
      toast({
        title: "Cannot Delete Group",
        description: "Remove all users from the group before deleting it",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete the group "${group.name}"?`))
      return;

    try {
      const response = await fetch(`/api/admin/groups/${group.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Group deleted successfully",
        });
        fetchGroups();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete group",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
    }
  };

  const handleAddUsersToGroup = async () => {
    if (!selectedGroup || selectedUsers.length === 0) return;

    try {
      const response = await fetch(
        `/api/admin/groups/${selectedGroup.id}/users`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds: selectedUsers }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setSelectedUsers([]);
        fetchGroups();
        fetchAvailableUsers(selectedGroup.id);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add users to group",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add users to group",
        variant: "destructive",
      });
    }
  };

  const handleRemoveUserFromGroup = async (userId: string) => {
    if (!selectedGroup) return;

    try {
      const response = await fetch(
        `/api/admin/groups/${selectedGroup.id}/users`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds: [userId] }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        // Update local state
        setSelectedGroup((prev) =>
          prev
            ? {
                ...prev,
                users: prev.users.filter((user) => user.id !== userId),
              }
            : null
        );
        fetchGroups();
        fetchAvailableUsers(selectedGroup.id);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to remove user from group",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove user from group",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (group: Group) => {
    setSelectedGroup(group);
    setFormData({ name: group.name, description: group.description || "" });
    setIsEditDialogOpen(true);
  };

  const openManageUsersDialog = (group: Group) => {
    setSelectedGroup(group);
    setUserSearchTerm("");
    setUserRoleFilter("");
    fetchAvailableUsers(group.id);
    setIsManageUsersDialogOpen(true);
  };

  const closeManageUsersDialog = () => {
    setIsManageUsersDialogOpen(false);
    setSelectedGroup(null);
    setSelectedUsers([]);
    setUserSearchTerm("");
    setUserRoleFilter("");
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.description &&
        group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredAvailableUsers = availableUsers.filter(
    (user) =>
      (user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase())) &&
      (userRoleFilter === "" || user.role === userRoleFilter)
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "default";
      case "EMPLOYEE":
        return "secondary";
      case "CLIENT":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrador";
      case "EMPLOYEE":
        return "Empleado";
      case "CLIENT":
        return "Cliente";
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2'></div>
          <p>Cargando grupos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DocHeader
        title='Gestión de Grupos'
        description='Administra los grupos de usuarios y sus asignaciones de manera centralizada'
        icon={Users}
      />

      <DocContent>
        <TailwindGrid fullSize>
          <main className='col-start-1 max-w-full w-full col-end-full md:col-start-1 lg:col-start-1 lg:col-end-13  order-2 md:order-1 z-30  col-span-full'>
            {/* Action Button */}
            <div className='flex justify-end'>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className='h-4 w-4 mr-2' />
                    Crear Grupo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Grupo</DialogTitle>
                    <DialogDescription>
                      Crea un nuevo grupo para organizar usuarios
                    </DialogDescription>
                  </DialogHeader>
                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='name'>Nombre del Grupo</Label>
                      <Input
                        id='name'
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder='Ej: Administradores, Soporte...'
                      />
                    </div>
                    <div>
                      <Label htmlFor='description'>
                        Descripción (Opcional)
                      </Label>
                      <Textarea
                        id='description'
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder='Descripción del grupo...'
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant='outline'
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateGroup}>Crear Grupo</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search */}
            <div className='flex items-center space-x-2'>
              <div className='relative flex-1 max-w-sm'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Buscar grupos...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-8'
                />
              </div>
              <Button variant='outline' onClick={fetchGroups}>
                Actualizar
              </Button>
            </div>

            {/* Groups Table */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Users className='h-5 w-5' />
                  Grupos ({filteredGroups.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredGroups.length === 0 ? (
                  <div className='text-center py-8'>
                    <Users className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-semibold mb-2'>
                      No hay grupos
                    </h3>
                    <p className='text-muted-foreground mb-4'>
                      {searchTerm
                        ? "No se encontraron grupos con ese criterio"
                        : "Crea tu primer grupo para organizar usuarios"}
                    </p>
                    {!searchTerm && (
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className='h-4 w-4 mr-2' />
                        Crear Primer Grupo
                      </Button>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Usuarios</TableHead>
                        <TableHead className='text-right'>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGroups.map((group) => (
                        <TableRow key={group.id}>
                          <TableCell className='font-medium'>
                            {group.name}
                          </TableCell>
                          <TableCell className='text-muted-foreground max-w-xs truncate'>
                            {group.description || "Sin descripción"}
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Badge variant='secondary'>
                                {group.users.length} usuario
                                {group.users.length !== 1 ? "s" : ""}
                              </Badge>
                              {group.users.length > 0 && (
                                <div className='flex -space-x-1'>
                                  {group.users.slice(0, 3).map((user) => (
                                    <div
                                      key={user.id}
                                      className='w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center border-2 border-background'
                                      title={user.name || user.email}
                                    >
                                      {(user.name || user.email)
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>
                                  ))}
                                  {group.users.length > 3 && (
                                    <div className='w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center border-2 border-background'>
                                      +{group.users.length - 3}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className='text-right'>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='sm'>
                                  <MoreHorizontal className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem
                                  onClick={() => openManageUsersDialog(group)}
                                >
                                  <UserPlus className='h-4 w-4 mr-2' />
                                  Gestionar Usuarios
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openEditDialog(group)}
                                >
                                  <Edit2 className='h-4 w-4 mr-2' />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteGroup(group)}
                                  className='text-destructive'
                                  disabled={group.users.length > 0}
                                >
                                  <Trash2 className='h-4 w-4 mr-2' />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Edit Group Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Grupo</DialogTitle>
                  <DialogDescription>
                    Modifica la información del grupo
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='edit-name'>Nombre del Grupo</Label>
                    <Input
                      id='edit-name'
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor='edit-description'>Descripción</Label>
                    <Textarea
                      id='edit-description'
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleEditGroup}>Guardar Cambios</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Manage Users Dialog */}
            <Dialog
              open={isManageUsersDialogOpen && !!selectedGroup}
              onOpenChange={(open) => {
                if (!open) closeManageUsersDialog();
              }}
            >
              <DialogContent className='max-w-4xl max-h-[80vh]'>
                <DialogHeader>
                  <DialogTitle>
                    {selectedGroup?.name
                      ? `Gestionar Usuarios - ${selectedGroup.name}`
                      : "Gestionar Usuarios"}
                  </DialogTitle>
                  <DialogDescription>
                    Añade o quita usuarios del grupo
                  </DialogDescription>
                </DialogHeader>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden'>
                  {/* Current Users */}
                  <div className='space-y-4'>
                    <h3 className='font-semibold'>
                      Usuarios en el Grupo ({selectedGroup?.users.length || 0})
                    </h3>
                    <div className='border rounded-lg max-h-60 overflow-y-auto'>
                      {selectedGroup?.users.length === 0 ? (
                        <div className='p-4 text-center text-muted-foreground'>
                          No hay usuarios en este grupo
                        </div>
                      ) : (
                        <div className='space-y-2 p-2'>
                          {selectedGroup?.users.map((user) => (
                            <div
                              key={user.id}
                              className='flex items-center justify-between p-2 rounded border'
                            >
                              <div className='flex items-center gap-2'>
                                <div className='w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center'>
                                  {(user.name || user.email)
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                                <div>
                                  <p className='font-medium text-sm'>
                                    {user.name || "Sin nombre"}
                                  </p>
                                  <p className='text-xs text-muted-foreground'>
                                    {user.email}
                                  </p>
                                </div>
                                <Badge
                                  variant={getRoleBadgeVariant(user.role)}
                                  className='text-xs'
                                >
                                  {getRoleLabel(user.role)}
                                </Badge>
                              </div>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() =>
                                  handleRemoveUserFromGroup(user.id)
                                }
                              >
                                <UserMinus className='h-4 w-4' />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Available Users */}
                  <div className='space-y-4'>
                    <div className='flex flex-col gap-2'>
                      <h3 className='font-semibold'>Usuarios Disponibles</h3>
                      <div className='flex gap-2'>
                        <Input
                          placeholder='Buscar usuarios...'
                          value={userSearchTerm}
                          onChange={(e) => {
                            setUserSearchTerm(e.target.value);
                            fetchAvailableUsers(selectedGroup?.id);
                          }}
                          className='flex-1'
                        />
                        <Select
                          value={userRoleFilter}
                          onValueChange={(value) => {
                            setUserRoleFilter(value);
                            fetchAvailableUsers(selectedGroup?.id);
                          }}
                        >
                          <SelectTrigger className='w-32'>
                            <SelectValue placeholder='Rol' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value=''>Todos</SelectItem>
                            <SelectItem value='CLIENT'>Cliente</SelectItem>
                            <SelectItem value='EMPLOYEE'>Empleado</SelectItem>
                            <SelectItem value='ADMIN'>Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className='border rounded-lg max-h-60 overflow-y-auto'>
                      {filteredAvailableUsers.length === 0 ? (
                        <div className='p-4 text-center text-muted-foreground'>
                          No hay usuarios disponibles
                        </div>
                      ) : (
                        <div className='space-y-2 p-2'>
                          {filteredAvailableUsers.map((user) => (
                            <div
                              key={user.id}
                              className='flex items-center gap-2 p-2 rounded border'
                            >
                              <Checkbox
                                checked={selectedUsers.includes(user.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedUsers((prev) => [
                                      ...prev,
                                      user.id,
                                    ]);
                                  } else {
                                    setSelectedUsers((prev) =>
                                      prev.filter((id) => id !== user.id)
                                    );
                                  }
                                }}
                              />
                              <div className='w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center'>
                                {(user.name || user.email)
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div className='flex-1'>
                                <p className='font-medium text-sm'>
                                  {user.name || "Sin nombre"}
                                </p>
                                <p className='text-xs text-muted-foreground'>
                                  {user.email}
                                </p>
                              </div>
                              <Badge
                                variant={getRoleBadgeVariant(user.role)}
                                className='text-xs'
                              >
                                {getRoleLabel(user.role)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedUsers.length > 0 && (
                      <Button
                        onClick={handleAddUsersToGroup}
                        className='w-full'
                      >
                        <UserPlus className='h-4 w-4 mr-2' />
                        Añadir {selectedUsers.length} Usuario
                        {selectedUsers.length !== 1 ? "s" : ""}
                      </Button>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant='outline' onClick={closeManageUsersDialog}>
                    Cerrar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </TailwindGrid>
      </DocContent>
    </>
  );
}
