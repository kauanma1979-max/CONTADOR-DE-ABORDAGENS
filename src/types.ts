export interface Autuacao {
  tipo: 'CONDUTOR' | 'VEÍCULO';
  descricao: string;
  quantidade: number;
}

export interface Operacao {
  motosAbordadas: number;
  recolhaVeiculos: number;
  cidade: string;
  data: string;
  endereco: string;
  autuacoes: Autuacao[];
}
