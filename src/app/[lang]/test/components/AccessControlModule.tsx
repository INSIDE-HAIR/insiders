import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/src/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Button } from "@/src/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { UserRole } from "@prisma/client";
import { toast } from "sonner";
import { PlusCircle, Trash2 } from "lucide-react";

const authMethods = ["password", "two-factor", "sso"] as const;
type AuthMethod = (typeof authMethods)[number];

// Definiciones de tipos y esquemas
enum AccessLevel {
  READ = "read",
  WRITE = "write",
  ADMIN = "admin",
}

const TimeRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  daysOfWeek: z
    .array(
      z.enum([
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ])
    )
    .optional(),
});

const AccessControlSchema = z.object({
  general: z.object({
    isEnabled: z.boolean().default(true),
    timeRange: TimeRangeSchema.optional(),
    maxConcurrentUsers: z.number().optional(),
    maxAccessCount: z.number().optional(),
  }),
  roles: z.array(
    z.object({
      id: z.string(),
      role: z.nativeEnum(UserRole),
      accessLevel: z.nativeEnum(AccessLevel),
      timeRange: TimeRangeSchema.optional(),
    })
  ),
  users: z.array(
    z.object({
      id: z.string(),
      email: z.string().email(),
      accessLevel: z.nativeEnum(AccessLevel),
      timeRange: TimeRangeSchema.optional(),
    })
  ),
  groups: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      accessLevel: z.nativeEnum(AccessLevel),
      timeRange: TimeRangeSchema.optional(),
    })
  ),
  tags: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      accessLevel: z.nativeEnum(AccessLevel),
      timeRange: TimeRangeSchema.optional(),
    })
  ),
  resources: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(["product", "service"]),
      accessLevel: z.nativeEnum(AccessLevel),
      timeRange: TimeRangeSchema.optional(),
    })
  ),
  ipRestrictions: z
    .array(
      z.object({
        start: z.string().ip(),
        end: z.string().ip().optional(),
      })
    )
    .optional(),
  geoRestrictions: z
    .array(
      z.object({
        country: z.string().optional(),
        region: z.string().optional(),
        city: z.string().optional(),
      })
    )
    .optional(),
  deviceRestrictions: z
    .array(
      z.object({
        type: z.enum(["desktop", "mobile", "tablet"]),
        os: z.array(z.string()).optional(),
      })
    )
    .optional(),
  requiredAuthMethods: z
    .array(z.enum(["password", "two-factor", "sso"]))
    .optional(),
});

type AccessControlData = z.infer<typeof AccessControlSchema>;

interface AccessControlModuleProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
}

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function TimeRangeFields({
  prefix,
  control,
}: {
  prefix: string;
  control: any;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`${prefix}.startDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Inicio</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`${prefix}.endDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Fin</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`${prefix}.startTime`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hora de Inicio</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`${prefix}.endTime`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hora de Fin</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name={`${prefix}.daysOfWeek`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Días de la Semana</FormLabel>
            <div className="flex flex-wrap gap-4 mt-2">
              {daysOfWeek.map((day) => (
                <FormField
                  key={day}
                  control={control}
                  name={`${prefix}.daysOfWeek`}
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={day}
                        className="flex flex-row items-center justify-center space-x-2 space-y-0 "
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(day)}
                            onCheckedChange={(checked) => {
                              const updatedValue = checked
                                ? [...(field.value || []), day]
                                : (field.value || []).filter(
                                    (d: string) => d !== day
                                  );
                              field.onChange(updatedValue);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal pt-1">
                          {day}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}

function AccessLevelField({ control, name }: { control: any; name: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nivel de Acceso</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nivel" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Object.values(AccessLevel).map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
}

export function AccessControlModule({
  isOpen,
  onClose,
  pageId,
}: AccessControlModuleProps) {
  const form = useForm<AccessControlData>({
    resolver: zodResolver(AccessControlSchema),
    defaultValues: {
      general: {
        isEnabled: true,
        maxConcurrentUsers: 0,
        maxAccessCount: 0,
      },
      roles: [],
      users: [],
      groups: [],
      tags: [],
      resources: [],
      ipRestrictions: [],
      geoRestrictions: [],
      deviceRestrictions: [],
      requiredAuthMethods: [],
    },
  });

  const {
    fields: roleFields,
    append: appendRole,
    remove: removeRole,
  } = useFieldArray({
    control: form.control,
    name: "roles",
  });

  const {
    fields: userFields,
    append: appendUser,
    remove: removeUser,
  } = useFieldArray({
    control: form.control,
    name: "users",
  });

  const {
    fields: groupFields,
    append: appendGroup,
    remove: removeGroup,
  } = useFieldArray({
    control: form.control,
    name: "groups",
  });

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  const {
    fields: resourceFields,
    append: appendEntitlement,
    remove: removeEntitlement,
  } = useFieldArray({
    control: form.control,
    name: "resources",
  });

  const {
    fields: ipFields,
    append: appendIp,
    remove: removeIp,
  } = useFieldArray({
    control: form.control,
    name: "ipRestrictions",
  });

  const {
    fields: geoFields,
    append: appendGeo,
    remove: removeGeo,
  } = useFieldArray({
    control: form.control,
    name: "geoRestrictions",
  });

  const {
    fields: deviceFields,
    append: appendDevice,
    remove: removeDevice,
  } = useFieldArray({
    control: form.control,
    name: "deviceRestrictions",
  });

  const onSubmit = async (data: AccessControlData) => {
    // Implementar lógica de envío
    console.log(data);
    toast.success("Configuración de acceso actualizada");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Configuración de Control de Acceso</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[80vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs defaultValue="general">
                <TabsList>
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="roles">Roles</TabsTrigger>
                  <TabsTrigger value="users">Usuarios</TabsTrigger>
                  <TabsTrigger value="groups">Grupos</TabsTrigger>
                  <TabsTrigger value="tags">Etiquetas</TabsTrigger>
                  <TabsTrigger value="resources">Recursos</TabsTrigger>
                  <TabsTrigger value="restrictions">Restricciones</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                  <Card>
                    <CardContent className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="general.isEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Habilitar Control de Acceso
                              </FormLabel>
                              <FormDescription>
                                Activa o desactiva el control de acceso para
                                esta página.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="general.maxConcurrentUsers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Máximo de Usuarios Concurrentes
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(e.target.valueAsNumber)
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Establece el número máximo de usuarios que pueden
                              acceder simultáneamente. 0 para ilimitado.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="general.maxAccessCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Máximo de Accesos</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(e.target.valueAsNumber)
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Establece el número máximo de accesos permitidos.
                              0 para ilimitado.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      <Accordion type="single" collapsible>
                        <AccordionItem value="time-settings">
                          <AccordionTrigger>
                            Configuración de Tiempo
                          </AccordionTrigger>
                          <AccordionContent>
                            <TimeRangeFields
                              prefix="general.timeRange"
                              control={form.control}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="roles">
                  {roleFields.map((field, index) => (
                    <Card key={field.id} className="mb-4">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <FormField
                            control={form.control}
                            name={`roles.${index}.role`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rol</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar rol" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Object.values(UserRole).map((role) => (
                                      <SelectItem key={role} value={role}>
                                        {role}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <AccessLevelField
                            control={form.control}
                            name={`roles.${index}.accessLevel`}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeRole(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Accordion type="single" collapsible>
                          <AccordionItem value="time-settings">
                            <AccordionTrigger>
                              Configuración de Tiempo
                            </AccordionTrigger>
                            <AccordionContent>
                              <TimeRangeFields
                                prefix={`roles.${index}.timeRange`}
                                control={form.control}
                              />
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    onClick={() =>
                      appendRole({
                        id: "",
                        role: UserRole.EMPLOYEE,
                        accessLevel: AccessLevel.READ,
                      })
                    }
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Añadir Rol
                  </Button>
                </TabsContent>

                <TabsContent value="users">
                  {userFields.map((field, index) => (
                    <Card key={field.id} className="mb-4">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <FormField
                            control={form.control}
                            name={`users.${index}.email`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email del Usuario</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="email"
                                    placeholder="usuario@ejemplo.com"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <AccessLevelField
                            control={form.control}
                            name={`users.${index}.accessLevel`}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeUser(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Accordion type="single" collapsible>
                          <AccordionItem value="time-settings">
                            <AccordionTrigger>
                              Configuración de Tiempo
                            </AccordionTrigger>
                            <AccordionContent>
                              <TimeRangeFields
                                prefix={`users.${index}.timeRange`}
                                control={form.control}
                              />
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    onClick={() =>
                      appendUser({
                        id: "",
                        email: "",
                        accessLevel: AccessLevel.READ,
                      })
                    }
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Añadir Usuario
                  </Button>
                </TabsContent>

                <TabsContent value="groups">
                  {groupFields.map((field, index) => (
                    <Card key={field.id} className="mb-4">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <FormField
                            control={form.control}
                            name={`groups.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre del Grupo</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Nombre del grupo"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <AccessLevelField
                            control={form.control}
                            name={`groups.${index}.accessLevel`}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeGroup(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Accordion type="single" collapsible>
                          <AccordionItem value="time-settings">
                            <AccordionTrigger>
                              Configuración de Tiempo
                            </AccordionTrigger>
                            <AccordionContent>
                              <TimeRangeFields
                                prefix={`groups.${index}.timeRange`}
                                control={form.control}
                              />
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    onClick={() =>
                      appendGroup({
                        id: "",
                        name: "",
                        accessLevel: AccessLevel.READ,
                      })
                    }
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Añadir Grupo
                  </Button>
                </TabsContent>

                <TabsContent value="tags">
                  {tagFields.map((field, index) => (
                    <Card key={field.id} className="mb-4">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <FormField
                            control={form.control}
                            name={`tags.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre de la Etiqueta</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Nombre de la etiqueta"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <AccessLevelField
                            control={form.control}
                            name={`tags.${index}.accessLevel`}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeTag(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Accordion type="single" collapsible>
                          <AccordionItem value="time-settings">
                            <AccordionTrigger>
                              Configuración de Tiempo
                            </AccordionTrigger>
                            <AccordionContent>
                              <TimeRangeFields
                                prefix={`tags.${index}.timeRange`}
                                control={form.control}
                              />
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    onClick={() =>
                      appendTag({
                        id: "",
                        name: "",
                        accessLevel: AccessLevel.READ,
                      })
                    }
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Añadir Etiqueta
                  </Button>
                </TabsContent>

                <TabsContent value="resources">
                  {resourceFields.map((field, index) => (
                    <Card key={field.id} className="mb-4">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <FormField
                            control={form.control}
                            name={`resources.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre del Recurso</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Nombre del recurso"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`resources.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar tipo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="product">
                                      Producto
                                    </SelectItem>
                                    <SelectItem value="service">
                                      Servicio
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <AccessLevelField
                            control={form.control}
                            name={`resources.${index}.accessLevel`}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeEntitlement(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Accordion type="single" collapsible>
                          <AccordionItem value="time-settings">
                            <AccordionTrigger>
                              Configuración de Tiempo
                            </AccordionTrigger>
                            <AccordionContent>
                              <TimeRangeFields
                                prefix={`resources.${index}.timeRange`}
                                control={form.control}
                              />
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    onClick={() =>
                      appendEntitlement({
                        id: "",
                        name: "",
                        type: "product",
                        accessLevel: AccessLevel.READ,
                      })
                    }
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Añadir Recurso
                  </Button>
                </TabsContent>

                <TabsContent value="restrictions">
                  <Accordion type="multiple">
                    <AccordionItem value="ip-restrictions">
                      <AccordionTrigger>Restricciones de IP</AccordionTrigger>
                      <AccordionContent>
                        {ipFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="flex items-center space-x-2 mb-2"
                          >
                            <FormField
                              control={form.control}
                              name={`ipRestrictions.${index}.start`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="IP inicial"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`ipRestrictions.${index}.end`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="IP final (opcional)"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => removeIp(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          onClick={() => appendIp({ start: "", end: "" })}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" /> Añadir
                          Restricción IP
                        </Button>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="geo-restrictions">
                      <AccordionTrigger>
                        Restricciones Geográficas
                      </AccordionTrigger>
                      <AccordionContent>
                        {geoFields.map((field, index) => (
                          <Card key={field.id} className="mb-4">
                            <CardContent className="pt-4">
                              <div className="grid grid-cols-3 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`geoRestrictions.${index}.country`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>País</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="País" />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`geoRestrictions.${index}.region`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Región</FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          placeholder="Región"
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`geoRestrictions.${index}.city`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Ciudad</FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          placeholder="Ciudad"
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => removeGeo(index)}
                                className="mt-2"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                        <Button
                          type="button"
                          onClick={() =>
                            appendGeo({ country: "", region: "", city: "" })
                          }
                        >
                          <PlusCircle className="h-4 w-4 mr-2" /> Añadir
                          Restricción Geográfica
                        </Button>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="device-restrictions">
                      <AccordionTrigger>
                        Restricciones de Dispositivo
                      </AccordionTrigger>
                      <AccordionContent>
                        {deviceFields.map((field, index) => (
                          <Card key={field.id} className="mb-4">
                            <CardContent className="pt-4">
                              <div className="flex justify-between items-center mb-4">
                                <FormField
                                  control={form.control}
                                  name={`deviceRestrictions.${index}.type`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Tipo de Dispositivo</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar tipo" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="desktop">
                                            Desktop
                                          </SelectItem>
                                          <SelectItem value="mobile">
                                            Mobile
                                          </SelectItem>
                                          <SelectItem value="tablet">
                                            Tablet
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`deviceRestrictions.${index}.os`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Sistemas Operativos</FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          placeholder="iOS, Android, Windows"
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        Separar múltiples OS con comas
                                      </FormDescription>
                                    </FormItem>
                                  )}
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  onClick={() => removeDevice(index)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <Button
                          type="button"
                          onClick={() =>
                            appendDevice({ type: "desktop", os: [] })
                          }
                        >
                          <PlusCircle className="h-4 w-4 mr-2" /> Añadir
                          Restricción de Dispositivo
                        </Button>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="auth-methods">
                      <AccordionTrigger>
                        Métodos de Autenticación Requeridos
                      </AccordionTrigger>
                      <AccordionContent>
                        <FormField
                          control={form.control}
                          name="requiredAuthMethods"
                          render={({ field }) => (
                            <FormItem>
                              <div className="mb-4">
                                <FormLabel>
                                  Seleccione los métodos de autenticación
                                  requeridos
                                </FormLabel>
                                <FormDescription>
                                  Los usuarios deberán completar todos los
                                  métodos seleccionados para acceder.
                                </FormDescription>
                              </div>
                              <div className="space-y-2">
                                {authMethods.map((method) => (
                                  <FormField
                                    key={method}
                                    control={form.control}
                                    name="requiredAuthMethods"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={method}
                                          className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(
                                                method
                                              )}
                                              onCheckedChange={(checked) => {
                                                const currentValue =
                                                  (field.value ||
                                                    []) as AuthMethod[];
                                                const newValue = checked
                                                  ? [...currentValue, method]
                                                  : currentValue.filter(
                                                      (value) =>
                                                        value !== method
                                                    );
                                                field.onChange(newValue);
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal">
                                            {method === "password" &&
                                              "Contraseña"}
                                            {method === "two-factor" &&
                                              "Autenticación de dos factores"}
                                            {method === "sso" &&
                                              "Inicio de sesión único (SSO)"}
                                          </FormLabel>
                                        </FormItem>
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar Cambios</Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
