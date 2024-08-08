import { Injectable } from '@angular/core';
import { Escala } from '../model/Escala';

@Injectable({
  providedIn: 'root',
})
export class EscalaService {
  constructor() {}

  escalas: Escala[] = [
    {
      id: 3,
      posicionInicial:
        'Sentado en borde de camilla o silla (pies sin apoyar) o en camilla/suelo (piesapoyados). Sin silla de ruedas. Sin apoyar la espalda.',
      descripcion: '1.UNA MANO A LA CABEZA SENTADO',
      intentos: 0,
      puntajeMaximo: 0,
      detalles: {
        puntaje0:
          'No puede traer las manos a la cabeza, siquiera usando el movimiento de la cabeza o el tronco',
        puntaje1: 'Solo puede traer la mano a la cabeza al flexionar la cabeza',
        puntaje2: 'Puede traer un mano a la cabeza. Cabeza y tronco estables',
        instrucciones:
          '¿Puedes sentarte en la camilla/silla sin apoyar las manos durante 3 segundos?',
      },
      puntajes: [0, 0, 0],
    },
    {
      id: 4,
      posicionInicial:
        'En decúbito prono, brazos a los lados (ver ítem 6) (pelvis en contacto con elsuelo).',
      descripcion: '2.Se apoya sobre los brazos extendidos',
      intentos: 0,
      puntajeMaximo: 0,
      detalles: {
        puntaje0: 'Incapaz',
        puntaje1:
          'Puede apoyarsesobre los brazosextendidos durante3’’ si se le coloca.',
        puntaje2:
          'Capaz de apoyarsesobre los brazosextendidos, con lacabeza en altodurante 3',
        instrucciones:
          '¿puedes llevar una mano a tu cabeza sin flexionar tu cuello?',
      },
      puntajes: [0, 0, 0],
    },
    {
      id: 5,
      posicionInicial:
        'En decúbito prono, brazos a los lados (ver ítem 6). Frente apoyada en elsuelo.',
      descripcion: 'Ítem 12:Levanta la cabeza desde decúbito prono',
      intentos: 0,
      puntajeMaximo: 0,
      detalles: {
        puntaje0: 'Incapaz.',
        puntaje1:
          'Levanta la cabezacon los brazos haciael frente durante 3’’. ',
        puntaje2:
          'Capaz de levantar lacabeza en decúbitoprono con los brazosa los lados durante3’’.',
        instrucciones:
          '¿Puedes levantar la cabeza manteniendo los brazos a los lados durante 3 segundos?',
      },
      puntajes: [0, 0, 0],
    },
    {
      id: 6,
      posicionInicial:
        'En supino, con caderas y rodillas en extensión máxima posible.',
      descripcion: 'Ítem 21:Flexión de cadera derecha en supino',
      intentos: 0,
      puntajeMaximo: 0,
      detalles: {
        puntaje0: 'Incapaz.',
        puntaje1:
          'Inicia flexión decadera y rodilladerechas(rango articulardisponible superior a10º*). ',
        puntaje2: 'Logra flexióncompleta de caderaderecha.',
        instrucciones:
          'Puedes llevar la rodilla derecha al pecho? Los individuos deberían realizar esta actividad sin apoyo de las manos',
      },
      puntajes: [0, 0, 0],
    },
    {
      id: 7,
      posicionInicial:
        'En decúbito prono, brazos en posición media o a los lados',
      descripcion: 'Ítem 15: Cuadrupedia',
      intentos: 0,
      puntajeMaximo: 0,
      detalles: {
        puntaje0: 'Incapaz.',
        puntaje1: 'Mantiene la posicióndurante 3’’ cuandose le coloca.',
        puntaje2:
          'Consigue ponerse enposición decuadrupedia con lacabeza en altodurante 3’’.',
        instrucciones:
          '¿Puedes ponerte sobre las manos y las rodillas, con la cabeza en alto ymantener la posición durante 3 segundos?',
      },
      puntajes: [0, 0, 0],
    },
  ];

  findAll() {
    return this.escalas;
  }

  findById(id: number) {
    return this.escalas[id - 1];
  }

  actualizarPuntaje(idEscala: number, puntaje: number) {
    let intentos = this.escalas[idEscala].intentos;
    this.escalas[idEscala].puntajes[intentos] = puntaje;
    this.escalas[idEscala].intentos++;
  }
}
