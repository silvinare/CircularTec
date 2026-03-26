export type UserContext = {
  userId: string;
  role: 'ADMIN_MUNICIPIO' | 'OPERADOR_GENERADOR' | 'OPERADOR_RECOLECTOR';
  organizationId: string;
};
