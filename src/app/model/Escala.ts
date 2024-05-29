import { EscalaDetalles } from "./EscalaDetalles";

export interface Escala{
    id: number,
    posicionInicial: String,
    descripcion: string,
    puntajeMaximo: number,
    intentos: number,
    detalles?: EscalaDetalles,
    puntajes: number[]
}