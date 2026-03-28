export type UserContext = {
  userId: string;
  email: string;
  role: 'ADMIN_MUNICIPIO' | 'OPERADOR_GENERADOR' | 'OPERADOR_RECOLECTOR';
  organizationId: string;
};
