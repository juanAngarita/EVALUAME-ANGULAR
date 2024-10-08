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
        'Sentado en borde de camilla o silla (pies sin apoyar) o en camilla/suelo (pies apoyados). Sin silla de ruedas. Sin apoyar la espalda.',
      descripcion: '3. UNA MANO A LA CABEZA SENTADO',
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
      id: 11,
      posicionInicial:
        'En decúbito prono, brazos a los lados (ver ítem 6) (pelvis en contacto con elsuelo).',
      descripcion: '11. Se apoya sobre los brazos extendidos',
      intentos: 0,
      puntajeMaximo: 0,
      detalles: {
        puntaje0: 'Incapaz',
        puntaje1:
          'Puede apoyarse sobre los brazos extendidos durante 3 segundos si se le coloca.',
        puntaje2:
          'Capaz de apoyarse sobre los brazos extendidos, con la cabeza en alto durante 3',
        instrucciones:
          '¿puedes llevar una mano a tu cabeza sin flexionar tu cuello?',
      },
      puntajes: [0, 0, 0],
    },
    {
      id: 17,
      posicionInicial:
        'En decúbito prono, brazos a los lados (ver ítem 6). Frente apoyada en elsuelo.',
      descripcion: '17. Levanta la cabeza desde decúbito prono',
      intentos: 0,
      puntajeMaximo: 0,
      detalles: {
        puntaje0: 'Incapaz.',
        puntaje1:
          'Levanta la cabezacon los brazos hacia el frente durante 3 segundos. ',
        puntaje2:
          'Capaz de levantar la cabeza en decúbito prono con los brazos a los lados durante 3 segundos.',
        instrucciones:
          '¿Puedes levantar la cabeza manteniendo los brazos a los lados durante 3 segundos?',
      },
      puntajes: [0, 0, 0],
    },
    {
      id: 21,
      posicionInicial:
        'En supino, con caderas y rodillas en extensión máxima posible.',
      descripcion: '21. Flexión de cadera derecha en supino',
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
      id: 15,
      posicionInicial:
        'En decúbito prono, brazos en posición media o a los lados',
      descripcion: '15. Cuadrupedia',
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
    {
      id: 16,
      posicionInicial:
        'Brazos a lo largo del cuerpo o más allá del apoya brazos.',
      descripcion: '16. PONER LOS DOS BRAZOS POR ENCIMA DE LA CABEZA',
      intentos: 0,
      puntajeMaximo: 0,
      detalles: {
        puntaje0: 'Incapaz.',
        puntaje1:
          'Puede levantar ambos brazos simultáneamente porencima de la cabeza solo si ﬂexiona el codo (usando compensación).',
        puntaje2:
          'Puede abducir ambos brazos simultáneamente con el codo en extensión formando un círculo completo hasta que se tocan encima de la cabeza.(Brooke 6).',
        instrucciones:
          'Levanta los brazos por encima de la cabeza hacia los lados intenta mantener los codos rectos',
      },
      puntajes: [0, 0, 0],
    },
  ];

  findAll() {
    return this.escalas;
  }

  findById(id: number) {
    //Buscar la escala por el indice
    return this.escalas.find((escala) => escala.id == id)!;
  }

  actualizarPuntaje(idEscala: number, puntaje: number) {
    let escala = this.findById(idEscala);
    let intentos = escala.intentos;
    escala.puntajes[intentos] = puntaje;
    escala.intentos++;

    if (puntaje > escala.puntajeMaximo) {
      escala.puntajeMaximo = puntaje;
    }
  }
}
