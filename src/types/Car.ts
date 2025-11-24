export interface Car {
  id: number;
  marca?: string | null;
  model?: string | null;
  consumo?: number | null;
  km?: number | null;
  combustible?: string | null;
  anoFabricacion?: number | null;
  cilindrada?: number | null;
  puertas?: number | null;
  plazas?: number | null;
  itv?: string | null; // DateTime = string ISO en JSON
  ambiental?: "B" | "C" | "CERO" | "ECO" | null;
  precio: number;
  potencia?: number | null;
  carroceria?: string | null;
  cambio?: "manual" | "automatico" | null;
  color?: string | null;
  matricula?: string | null;
  tipoVenta?: "COCHE" | "PIEZAS" | null;
  garantia?: boolean | null;
  descripcion?: string | null;

  imagenes: {
    id: number;
    url: string;
  }[];

  defectos: any[];
  piezas: any[];
  compras: any[];
  favoritos: any[];
  mensajes: any[];
}
