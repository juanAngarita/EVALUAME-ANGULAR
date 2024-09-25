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
  //ELEMENTOS ESTIMACIÓN DE POSE
  estado: boolean = false; //SI SE ESTÁ GRABANDO
  poses: any;
  puntaje: number = 0;
  colorEsqueleto: string = 'rgb(255, 255, 255)';

  //ESTIMACIÓN DE POSE Y MODELOS
  poseClassifier: any;

  mensajeAlerta: string = '';

  promedioConfianza: number = 0;

  mejorPuntaje: number = 0;
  ultimosPuntajes: number[] = [];

  //BOTON DE "INICIAR EVALUACIÓN"
  cambiarEstado(element: any) {
    let button = element;
    this.estado = !this.estado;
    if (this.estado == true) {
      button.textContent = 'GRABANDO';
    } else {
      this.openConfirmationDialog();
      button.textContent = 'INICIAR EVALUACIÓN';
      this.colorEsqueleto = 'rgb(255, 255, 255)';
    }
  }

  //DIALOGO DE CONFIRMACIÓN
  openConfirmationDialog() {
    //EN CASO DE QUE EL USUARIO ACEPTE EL PUNTAJE SE LLAMA A ACTUALIZAR PUNTAJES
    this.confirmationDialogService
      .confirm(
        'Confirmar el puntaje',
        'El puntaje calculado es: ' + this.puntaje,
        'Aceptar',
        'Cancelar'
      )
      .then((confirmed) => this.actualizarPuntajes())
      .catch(() =>
        console.log(
          'User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'
        )
      );
  }
  //ACTUALIZA EL PUNTAJE TANTO EN EL SERVICIO COMO EN EL FRONT
  actualizarPuntajes() {
    if (this.escala) {
      this.escalaService.actualizarPuntaje(this.escala.id, this.mejorPuntaje);
      let intentos = this.escala.intentos;
      this.escala.puntajes[intentos] = this.mejorPuntaje;
      this.escala.intentos++;
      //EN CASO DE QUE SE HAYA LLEGADO AL MÁXIMO DE INTENTOS
      if (this.escala.intentos == 3) {
        this.desactivarBoton = true;
        console.log('NO HAY MAS INTENTOS DISPONIBLES');
      }
    }
    this.mejorPuntaje = 0;
    this.ultimosPuntajes = [];
  }

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

  async runPoseEstimation() {
    //Esperar a que tf esté listo
    await tf.ready();
    //Crear el detector de pose

    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.BlazePose,
      { runtime: 'tfjs', modelType: 'heavy' }
    );
    //obtener las poses
    setInterval(() => this.getPoses(detector), 100);
  }

  async getPoses(detector: poseDetection.PoseDetector) {
    if (detector && this.video) {
      this.poses = await detector.estimatePoses(this.video);
      //console.log(this.poses);
      this.drawPoses(this.poses);
    }
  }

  //INICIALIZAR LA CAMARA
  async initCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.video!.srcObject = stream;

      this.video!.onloadedmetadata = () => {
        //SE ALINEA EL TAMAÑO DEL CANVAS Y DEL VIDEO
        this.canvas.width = this.video!.videoWidth;
        this.canvas.height = this.video!.videoHeight;
        // Llama a la función captureImage dentro del intervalo
        //setInterval para actualizar continuamente el contenido del canvas con el marco de video más reciente
        setInterval(() => this.captureImage(), 100);
      };
    } catch (err) {
      console.error('Error al acceder a la cámara: ', err);
    }
  }

  //RENDERIZADOS DE LA IMAGEN
  captureImage() {
    //RENDERIZADO DEL VIDEO
    if (this.video) {
      // Limpiar el lienzo antes de dibujar la nueva imagen
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // Dibujar la imagen del video en el canvas
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(
        this.video,
        -this.canvas.width,
        0,
        this.canvas.width,
        this.canvas.height
      );
      // Restaurar la transformación
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    //RENDERIZADO DE LAS POSES
    if (this.poses && this.poses.length > 0) {
      let counter: number = 0.0;
      for (let i = 0; i < this.poses[0].keypoints.length; i++) {
        counter += Number(this.poses[0].keypoints[i].score.toFixed(2));
      }

      this.promedioConfianza = counter / this.poses[0].keypoints.length;
      this.promedioConfianza = Number(this.promedioConfianza.toFixed(2));
      this.drawPoses(this.poses);
      if (this.promedioConfianza < 0.6) {
        this.mensajeAlerta =
          'No se reconoce ninguna pose con confianza suficiente';
        this.desactivarBoton = true;
      } else {
        this.mensajeAlerta = '';
        this.desactivarBoton = false;
      }
    } else {
      this.mensajeAlerta = 'No se reconocen personas en la escena';
      this.promedioConfianza = 0.0;
      this.desactivarBoton = true;
    }
  }

  drawPoses(poses: any) {
    //OBTIENE LOS KEYPOINTS
    let pose = poses[0].keypoints;

    //Si ya hay poses detectadas
    if (pose) {
      let fila = [];
      //console.log(poses)
      //mostrarResumenDatos();

      //RECORRER PUNTO POR PUNTO Y PITARLO
      for (let i = 0; i < pose.length; i++) {
        let x = pose[i].x;
        let y = pose[i].y;
        let name: string = pose[i].name;
        let score = pose[i].score.toFixed(2);
        if (score > 0.3) {
          this.pintarPuntosClave(x, y, score, name);
          let conexiones: string[] = this.keypointConnections[name];
          if (conexiones) {
            for (let conexion of conexiones) {
              let conName = conexion.toUpperCase();
              if (pose[this.PUNTOS[conName]].score > 0.3) {
                this.drawSegment(
                  [x, y],
                  [pose[this.PUNTOS[conName]].x, pose[this.PUNTOS[conName]].y],
                  this.colorEsqueleto
                );
              }
            }
          }
        }

        //SI SE ESTÁ GRABANDO SE AGREGAN TODAS LAS POSES AL RREGLO
        if (this.estado) {
          fila.push([parseFloat(x.toFixed(2)), parseFloat(y.toFixed(2))]);
        }
      }

      if (this.estado) {
        let predict_data = this.normalizeService.landmarks_to_embedding(fila);

        this.puntaje = this.predecir(predict_data);
        this.ultimosPuntajes.push(this.puntaje);
        if (this.ultimosPuntajes.length > 30) {
          this.ultimosPuntajes.shift();
          let promedioPuntajes =
            this.ultimosPuntajes.reduce((a, b) => a + b, 0) /
            this.ultimosPuntajes.length;

          promedioPuntajes = Math.round(promedioPuntajes);
          this.mejorPuntaje = Math.max(this.mejorPuntaje, promedioPuntajes);
        }

        if (this.puntaje > 2.0) {
          this.puntaje = 2.0;
        }

        if (this.puntaje >= 0 && this.puntaje < 0.5) {
          this.colorEsqueleto = 'rgb(255, 0, 0)';
        } else if (this.puntaje >= 0.5 && this.puntaje < 1.5) {
          this.colorEsqueleto = 'rgb(255, 255, 0)';
        } else if (this.puntaje >= 1.5) {
          this.colorEsqueleto = 'rgb(0, 255, 0)';
        }
      }
    }
  }

  //Predecir a partir de un conjunto de entrada
  predecir(processedInput: any): number {
    const classification = this.poseClassifier.predict(processedInput);

    // Obtener la predicción con mejores resultados
    //const value = classification.argMax(-1).dataSync()[0];
    // console.log('CLASIFICACION:', value);
    const value = classification.dataSync()[0];
    //return value;
    return value;
  }
}
