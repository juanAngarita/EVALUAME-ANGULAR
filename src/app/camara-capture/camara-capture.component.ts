import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import { ConfirmationDialogService } from '../services/confirmation-dialog.service';
import { Escala } from '../model/Escala';
import { EscalaService } from '../services/escala.service';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';
import { KeypointsService } from '../services/keypoints.service';
@Component({
  providers: [ConfirmationDialogService],
  selector: 'app-camara-capture',
  templateUrl: './camara-capture.component.html',
  styleUrls: ['./camara-capture.component.css'],
})
export class CamaraCaptureComponent implements AfterViewInit {
  //DICCIONATIO DE PUNTOS CLAVE
  PUNTOS: { [key: string]: number } = {};

  //DICCIONARIO DE CONEXIONES
  keypointConnections: { [key: string]: string[] } = {};

  //Elementos del HTML
  @ViewChild('video') videoElement!: ElementRef;
  @ViewChild('canvas') canvasElement!: ElementRef;

  //INPUT -> ID DEL ÍTEM
  @Input()
  id: number = 0;
  //objeto con la información de la escala
  escala: Escala | null = null;

  //Elementos para la captura de movimiento
  video: HTMLVideoElement | null = null;
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;

  //ELEMENTOS ESTIMACIÓN DE POSE
  estado: boolean = false; //SI SE ESTÁ GRABANDO
  poses: any;
  puntaje: number = 0;
  desactivarBoton: boolean = false;
  colorEsqueleto: string = 'rgb(255, 255, 255)';

  //ESTIMACIÓN DE POSE Y MODELOS
  poseClassifier: any;

  mensajeAlerta: string = '';

  promedioConfianza: number = 0;

  mejorPuntaje: number = 0;
  ultimosPuntajes: number[] = [];
  constructor(
    private confirmationDialogService: ConfirmationDialogService,
    private escalaService: EscalaService,
    @Inject(DOCUMENT) private document: Document,
    private keypointsService: KeypointsService
  ) {}

  //INICIALIZAR LA ESCALA EN BASE AL ID
  ngOnChanges() {
    this.escala = this.escalaService.findById(this.id);
    this.PUNTOS = this.keypointsService.PUNTOS;
    this.keypointConnections = this.keypointsService.keypointConnections;
  }

  ngOnInit() {
    console.log('Funcion ngOnInit');
    this.runPoseEstimation();
  }

  //OBTENER LOS ELEMENTOS DEL HTML + INICIALIZAR LA CAMARA
  ngAfterViewInit() {
    this.video = this.videoElement.nativeElement;
    this.video!.width = 640;
    this.video!.height = 480;
    this.canvas = this.canvasElement.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    //Inicializar la camata
    this.initCamera();
    //Inicializar el modelo de clasificación
    this.cargarModel();
  }

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
        'El puntaje calculado es: ' + this.mejorPuntaje,
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

      //RECORRER PUNTO POR PUNTO Y PITARLO
      for (let i = 0; i < pose.length; i++) {
        let x = pose[i].x;
        let y = pose[i].y;
        let name: string = pose[i].name;
        let score = pose[i].score.toFixed(2);
        if (score > 0.5) {
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
        let predict_data = this.landmarks_to_embedding(fila);

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
        console.log('PUNTAJEe:', this.puntaje);
        if (this.puntaje == 0) {
          this.colorEsqueleto = 'rgb(255, 0, 0)';
        } else if (this.puntaje == 1) {
          this.colorEsqueleto = 'rgb(255, 255, 0)';
        } else if (this.puntaje == 2) {
          this.colorEsqueleto = 'rgb(0, 255, 0)';
        }
      }
    }
  }

  //PROCESAMIENTO DE DATOS
  get_center_point(
    landmarks: any,
    left_bodypart: number,
    right_bodypart: number
  ) {
    let left = tf.gather(landmarks, left_bodypart, 1);
    let right = tf.gather(landmarks, right_bodypart, 1);
    const center = tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5));
    return center;
  }

  get_pose_size(landmarks: any, torso_size_multiplier = 2.5) {
    let hips_center = this.get_center_point(
      landmarks,
      this.PUNTOS['LEFT_HIP'],
      this.PUNTOS['RIGHT_HIP']
    );
    let shoulders_center = this.get_center_point(
      landmarks,
      this.PUNTOS['LEFT_SHOULDER'],
      this.PUNTOS['RIGHT_SHOULDER']
    );
    let torso_size = tf.norm(tf.sub(shoulders_center, hips_center));
    let pose_center_new = this.get_center_point(
      landmarks,
      this.PUNTOS['LEFT_HIP'],
      this.PUNTOS['RIGHT_HIP']
    );
    pose_center_new = tf.expandDims(pose_center_new, 1);

    pose_center_new = tf.broadcastTo(pose_center_new, [1, 33, 2]);
    // return: shape(17,2)
    let d = tf.gather(tf.sub(landmarks, pose_center_new), 0, 0);
    let max_dist = tf.max(tf.norm(d, 'euclidean', 0));

    // normalize scale
    let pose_size = tf.maximum(
      tf.mul(torso_size, torso_size_multiplier),
      max_dist
    );
    return pose_size;
  }

  normalize_pose_landmarks(landmarks: any) {
    let pose_center = this.get_center_point(
      landmarks,
      this.PUNTOS['LEFT_HIP'],
      this.PUNTOS['RIGHT_HIP']
    );

    pose_center = tf.expandDims(pose_center, 1);

    pose_center = tf.broadcastTo(pose_center, [1, 33, 2]);

    landmarks = tf.sub(landmarks, pose_center);

    let pose_size = this.get_pose_size(landmarks);
    landmarks = tf.div(landmarks, pose_size);

    landmarks.array().then((array: any[]) => {
      console.log('Nuevo:', array);
    });
    return landmarks;
  }

  landmarks_to_embedding(landmarks: any) {
    // normalize landmarks 2D
    landmarks = this.normalize_pose_landmarks(tf.expandDims(landmarks, 0));
    let embedding = tf.reshape(landmarks, [1, 66]);
    return embedding;
  }
  //////////
  //FIN PROCESAMIENTO DE DATOS

  //Predecir a partir de un conjunto de entrada
  predecir(processedInput: any): number {
    const classification = this.poseClassifier.predict(processedInput);

    // Obtener la predicción con mejores resultados
    const value = classification.argMax(-1).dataSync()[0];
    return value;
  }

  //PINTA 1 PUNTO CLAVE
  pintarPuntosClave(x: number, y: number, score: number, name: string) {
    let mirroredX = this.canvas.width - x;

    // Dibujar el punto clave como un círculo
    this.ctx.beginPath();
    this.ctx.fillStyle = 'rgb(255, 0, 0)';
    this.ctx.arc(mirroredX, y, 5, 0, Math.PI * 2);
    this.ctx.fill();

    // Dibujar el nombre y la puntuación cerca del punto clave
    //this.ctx.fillStyle = 'rgb(0, 255, 0)';
    //this.ctx.fillText(name, mirroredX, y - 10);
    //this.ctx.fillText(score.toString(), mirroredX, y + 15);
  }

  //DIBUJAR SEGMENTO DE LINEA
  drawSegment(
    [mx, my]: [number, number],
    [tx, ty]: [number, number],
    color: string
  ) {
    let mirroredmX = this.canvas.width - mx;
    let mirroredtX = this.canvas.width - tx;

    this.ctx.beginPath();
    this.ctx.moveTo(mirroredmX, my);
    this.ctx.lineTo(mirroredtX, ty);
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }
}
