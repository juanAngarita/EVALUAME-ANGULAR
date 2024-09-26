import { AfterViewInit, Component } from '@angular/core';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import { ConfirmationDialogService } from '../../services/confirmation-dialog.service';

import { CaptureComponent } from '../capture/capture.component';
@Component({
  providers: [ConfirmationDialogService],
  selector: 'app-camara-capture',
  templateUrl: './camara-capture.component.html',
  styleUrls: ['./camara-capture.component.css'],
})
export class CamaraCaptureComponent
  extends CaptureComponent
  implements AfterViewInit
{
  //CARGAR EL MODELO DE CLASIFIFCACION
  async cargarModel() {
    console.log('Cargando modelo discretos...');
    //Esperar que tensorflow esté listo
    await tf.ready();
    const baseHref = this.document.getElementsByTagName('base')[0].href;
    //Cargar el modelo
    this.poseClassifier = await tf.loadLayersModel(
      `${baseHref}assets/models/${this.id}/model.json`
    );
    console.log('MODELO RN CARGADO');
  }

  colorearEsqueleto() {
    if (this.puntaje == 0) {
      this.colorEsqueleto = this.colors['red'];
    } else if (this.puntaje == 1) {
      this.colorEsqueleto = this.colors['yellow'];
    } else if (this.puntaje == 2) {
      this.colorEsqueleto = this.colors['green'];
    }
  }

  //Predecir a partir de un conjunto de entrada
  predecir(processedInput: any): number {
    const classification = this.poseClassifier.predict(processedInput);

    // Obtener la predicción con mejores resultados
    const value = classification.argMax(-1).dataSync()[0];
    return value;
  }

  calcularPuntajePromedio(): number {
    let promedioPuntajes =
      this.ultimosPuntajes.reduce((a, b) => a + b, 0) /
      this.ultimosPuntajes.length;

    promedioPuntajes = Math.round(promedioPuntajes);
    return promedioPuntajes;
  }
}
