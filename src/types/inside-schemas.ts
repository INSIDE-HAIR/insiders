// import { UserRole } from "@prisma/client";
import { UserRole } from "@prisma/client";
import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "El correo electrónico es requerido",
  }),
  password: z.string().min(1, {
    message: "La contraseña es requerida",
  }),
});

export const RegisterSchema = z
  .object({
    email: z.string().email({
      message: "El correo electrónico es requerido",
    }),
    password: z.string().min(6, {
      message: "La contraseña debe tener al menos 6 caracteres",
    }),
    confirmPassword: z.string().min(6, {
      message: "La contraseña debe tener al menos 6 caracteres",
    }),
    name: z
      .string()
      .min(1, { message: "El nombre es requerido" })
      .max(30, "Nombre demasiado largo"),
    lastName: z
      .string()
      .min(1, { message: "El apellido es requerido" })
      .max(30, "Nombre demasiado largo"),
    contactNumber: z
      .string()
      .min(1, { message: "El número de contacto es requerido" }),
    terms: z.boolean(),
    // code: z.optional(z.string()),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirmation"],
  });

//TODO: Add forms for forgot password, reset password, update password, update business profile, update user profile
export const ForgotPasswordSchema = z.object({
  email: z.string().email({
    message: "El correo electrónico es requerido",
  }),
});

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(6, {
      message: "La contraseña debe tener al menos 6 caracteres",
    }),
    passwordConfirmation: z.string().min(6, {
      message: "La contraseña debe tener al menos 6 caracteres",
    }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirmation"],
  });

export const UpdatePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, {
      message: "La contraseña debe tener al menos 6 caracteres",
    }),
    password: z.string().min(6, {
      message: "La contraseña debe tener al menos 6 caracteres",
    }),
    passwordConfirmation: z.string().min(6, {
      message: "La contraseña debe tener al menos 6 caracteres",
    }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirmation"],
  });

export const UpdateBusinessProfileSchema = z.object({
  businessName: z
    .string()
    .min(1, { message: "El nombre del negocio es requerido" }),
  businessNif: z.string().min(1, { message: "El NIF es requerida" }),
  businessPhone: z.string().min(1, { message: "El telefono es requerido" }),
  businessAddress: z.string().min(1, { message: "La dirección es requerida" }),
  businessCity: z.string().min(1, { message: "La ciudad es requerida" }),
  businessState: z.string().min(1, { message: "El estado es requerido" }),
  businessCountry: z.string().min(1, { message: "El país es requerido" }),
  businessPostalCode: z
    .string()
    .min(1, { message: "El código postal es requerido" }),
  businessNumberOFEmployees: z
    .number()
    .min(1, { message: "El número de empleados es requerido" }),
});

export const UpdateUserProfileSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido" }),
  lastName: z.string().min(1, { message: "El apellido es requerido" }),
  contactNumber: z
    .number()
    .min(1, { message: "El número de contacto es requerido" }),
});

// export const SettingsSchema = z.object({
//   name: z.optional(z.string()),
//   isTwoFactorEnabled: z.optional(z.boolean()),
//   role: z.enum([UserRole.ADMIN, UserRole.USER, UserRole.SUPERADMIN]),
//   email: z.optional(z.string().email()),
//   password: z.optional(z.string().min(6)),
//   newPassword: z.optional(z.string().min(6)),
// });

// export const EmailSchema = z.object({
//   email: z.string().email({
//     message: "Please enter a valid email address",
//   }),
// });

// export const NewPasswordSchema = z.object({
//   password: z
//     .string()
//     .min(6, { message: "Minimum 6 characters required." })
//     .max(50, "password is too long!"),
// });

// export const ResetSchema = z.object({
//   email: z.string().email({ message: "Email is required." }),
// });

// Definición de las constantes ajustadas
const campaignCodes = {
  A: "Campaña Mensual",
  B: "PrimeLady",
  C: "Start Marketing",
};

const clientsCode = {
  A: "INSIDERS",
  B: "SALÓN TORO",
  C: "TONI&GUY",
  D: "AH PELUQUEROS",
};

// Asegurándonos de que TypeScript interpreta los argumentos como tuplas
const campaignKeys = Object.keys(campaignCodes) as [string, ...string[]];
const clientKeys = Object.keys(clientsCode) as [string, ...string[]];

// Creando esquemas Zod para campaign y client
const campaignSchema = z.enum(campaignKeys);
const clientSchema = z.enum(clientKeys);

// Esquema completo que incluye campaign, year, month, client
export const RequestMarketingSalonSchema = z.object({
  campaign: campaignSchema,
  year: z
    .number()
    .min(2024, { message: "No hay información disponible para esta fecha." })
    .max(2100, { message: "No hay información disponible para esta fecha." }), // Asegurándonos de que el año sea razonable
  month: z
    .number()
    .min(1, { message: "Tiene que ser un número entre uno y doce" })
    .max(12, { message: "Tiene que ser un número entre uno y doce" }), // Meses de 1 a 12
  client: clientSchema,
});

export const UserSchema = z.object({
  id: z.optional(z.string()),
  name: z.optional(z.string()),
  isTwoFactorEnabled: z.optional(z.boolean()),
  lastName: z.optional(z.string().nullable()),
  email: z.optional(z.string().email()),
  emailVerified: z.optional(z.date().nullable()),
  image: z.optional(z.string().url().nullable()),
  password: z.optional(z.string().min(6)),
  newPassword: z.optional(z.string().min(6)),
  contactNumber: z.optional(z.string().nullable()),
  terms: z.optional(z.boolean()),
  role: z.enum([UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT, UserRole.DEBTOR, UserRole.PROVIDER, UserRole.LEAD]),
  holdedId: z.optional(z.string().nullable()),
  createdAt: z.optional(z.date()),
  updatedAt: z.optional(z.date()),
  lastLogin: z.optional(z.date()),
});

export const SettingsSchema = z.object({
  name: z.optional(z.string()),
  isTwoFactorEnabled: z.optional(z.boolean()),
  role: z.enum([UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT, UserRole.DEBTOR, UserRole.PROVIDER, UserRole.LEAD]),
  email: z.optional(z.string().email()),
  password: z.optional(z.string().min(6)),
  newPassword: z.optional(z.string().min(6)),
});
