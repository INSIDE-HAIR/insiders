/**
 * Team Mapper - Convierte grupos de usuario a equipos del dashboard
 */

// Mapping de grupos a equipos
const GROUP_TO_TEAM_MAPPING: Record<string, string[]> = {
  // Grupos administrativos
  'admin': ['gestion'],
  'administrators': ['gestion'],
  'management': ['gestion'],
  'gestores': ['gestion'],
  
  // Grupos creativos
  'creative': ['creativos'],
  'creativos': ['creativos'],
  'designers': ['creativos'],
  'diseñadores': ['creativos'],
  'content': ['creativos'],
  
  // Grupos de consultoría
  'consulting': ['consultoria'],
  'consultoria': ['consultoria'],
  'consultores': ['consultoria'],
  'consultants': ['consultoria'],
  'advisors': ['consultoria'],
  
  // Grupos de crecimiento
  'growth': ['crecimiento'],
  'crecimiento': ['crecimiento'],
  'marketing': ['crecimiento'],
  'sales': ['crecimiento'],
  'ventas': ['crecimiento'],
  
  // Grupos múltiples (pueden pertenecer a varios equipos)
  'lead': ['gestion', 'consultoria'],
  'manager': ['gestion'],
  'director': ['gestion', 'consultoria', 'crecimiento'],
  'coordinator': ['creativos', 'consultoria']
};

// Mapping de dominios a equipos automáticos
const DOMAIN_TO_TEAM_MAPPING: Record<string, string[]> = {
  'insidesalons.com': ['gestion'], // Dominio principal tiene acceso a gestión
  'insidehair.es': ['gestion', 'creativos'],
  // Agregar más dominios según sea necesario
};

// Mapping de roles a equipos por defecto
const ROLE_TO_TEAM_MAPPING: Record<string, string[]> = {
  'ADMIN': ['gestion'],
  'CLIENT': [], // Los clientes no tienen equipos por defecto
  'EMPLOYEE': ['creativos'], // Empleados van al equipo creativo por defecto
};

/**
 * Convierte grupos de usuario a equipos
 */
export function mapGroupsToTeams(groups: string[]): string[] {
  const teams = new Set<string>();
  
  groups.forEach(group => {
    const normalizedGroup = group.toLowerCase().trim();
    const mappedTeams = GROUP_TO_TEAM_MAPPING[normalizedGroup];
    
    if (mappedTeams) {
      mappedTeams.forEach(team => teams.add(team));
    }
  });
  
  return Array.from(teams);
}

/**
 * Obtiene equipos basados en el dominio del email
 */
export function mapDomainToTeams(domain: string): string[] {
  const normalizedDomain = domain.toLowerCase().trim();
  return DOMAIN_TO_TEAM_MAPPING[normalizedDomain] || [];
}

/**
 * Obtiene equipos basados en el rol del usuario
 */
export function mapRoleToTeams(role: string): string[] {
  return ROLE_TO_TEAM_MAPPING[role] || [];
}

/**
 * Combina todos los métodos para obtener equipos finales
 */
export function getUserTeams(
  groups: string[],
  domain: string,
  role: string
): string[] {
  const teams = new Set<string>();
  
  // Agregar equipos de grupos
  mapGroupsToTeams(groups).forEach(team => teams.add(team));
  
  // Agregar equipos de dominio
  mapDomainToTeams(domain).forEach(team => teams.add(team));
  
  // Agregar equipos de rol (si no hay otros equipos)
  if (teams.size === 0) {
    mapRoleToTeams(role).forEach(team => teams.add(team));
  }
  
  return Array.from(teams);
}

/**
 * Extrae el dominio de un email
 */
export function extractDomainFromEmail(email: string): string {
  const parts = email.split('@');
  return parts.length > 1 ? parts[1] : '';
}

/**
 * Valida si un equipo es válido
 */
export function isValidTeam(team: string): boolean {
  const validTeams = ['gestion', 'creativos', 'consultoria', 'crecimiento'];
  return validTeams.includes(team);
}

/**
 * Obtiene todos los equipos disponibles
 */
export function getAllAvailableTeams(): string[] {
  return ['gestion', 'creativos', 'consultoria', 'crecimiento'];
}