// Este arquivo agora é opcional, pois as requisições estão diretas na página
// Mas mantenha ele para organização:

const API_CONFIG = {
  FOOTBALL: {
    BASE_URL: 'https://v3.football.api-sports.io',
    API_KEY: 'bd4c7bac40a7d470b2d5d4453d2a72ae'
  },
  FUTEBOL: {
    BASE_URL: 'https://api.api-futebol.com.br/v1',
    API_KEY: 'test_b9ac9fd142018989701d6f00426e27'
  }
};

export class FootballApiService {
  // Métodos podem ser usados para organizar, mas não são obrigatórios
  static async testConnection() {
    return { status: 'API Service Available' };
  }
}