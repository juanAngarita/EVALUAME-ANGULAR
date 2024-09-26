import { Component } from '@angular/core';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import { CaptureComponent } from '../capture/capture.component';
@Component({
  selector: 'app-camara-capture-continue',
  templateUrl: './camara-capture-continue.component.html',
  styleUrls: ['./camara-capture-continue.component.css'],
})
export class CamaraCaptureContinueComponent extends CaptureComponent {
  //CARGAR EL MODELO DE CLASIFIFCACION
  async cargarModel() {
    console.log('Cargando modelo continuo...');
    //Esperar que tensorflow esté listo
    await tf.ready();
    const baseHref = this.document.getElementsByTagName('base')[0].href;
    //Cargar el modelo
    this.poseClassifier = await tf.loadLayersModel(
      `${baseHref}assets/models/continue/${this.id}/model.json`
    );
    console.log('Modelo de clasificación: ', this.poseClassifier.model);
  }

  colorearEsqueleto() {
    if (this.puntaje >= 0 && this.puntaje < 0.5) {
      this.colorEsqueleto = this.colors['red'];
    } else if (this.puntaje >= 0.5 && this.puntaje < 1.5) {
      this.colorEsqueleto = this.colors['yellow'];
    } else if (this.puntaje >= 1.5) {
      this.colorEsqueleto = this.colors['green'];
    }
  }

  //Predecir a partir de un conjunto de entrada
  predecir(processedInput: any): number {
    const classification = this.poseClassifier.predict(processedInput);

    const value = classification.dataSync()[0];
    return value;
  }

  calcularPuntajePromedio(): number {
    let promedioPuntajes =
      this.ultimosPuntajes.reduce((a, b) => a + b, 0) /
      this.ultimosPuntajes.length;

    return Number(promedioPuntajes.toFixed(2));
  }
}
