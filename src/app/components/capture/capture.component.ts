import { Component, ElementRef, Inject, Input, ViewChild } from '@angular/core';
import { ConfirmationDialogService } from '../../services/confirmation-dialog.service';
import { EscalaService } from '../../services/escala.service';
import { KeypointsService } from '../../services/keypoints.service';
import { NormalizeService } from '../../services/normalize/normalize.service';
import { DOCUMENT } from '@angular/common';
import { Escala } from '../../model/Escala';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
@Component({
  selector: 'app-capture',
  templateUrl: './capture.component.html',
  styleUrls: ['./capture.component.css'],
})
export abstract class CaptureComponent {
  //METODOS ABSTRACTOS QUE DEBEN SOBRESCRIBIR LOS HIJOS
  abstract colorearEsqueleto(): any;
  abstract cargarModel(): any;
  abstract predecir(processedInput: any): number;
  abstract calcularPuntajePromedio(): number;

  //Colores del esqueleto
  colors: { [key: string]: string } = {
    white: 'rgb(255, 255, 255)',
    red: 'rgb(255, 0, 0)',
    yellow: 'rgb(255, 255, 0)',
    green: 'rgb(0, 255, 0)',
  };

  //ELEMENTOS ESTIMACIÓN DE POSE
  grabando: boolean = false; //SI SE ESTÁ GRABANDO
  poses: any;
  puntaje: number = 0;
  colorEsqueleto: string = this.colors['white'];

  //ESTIMACIÓN DE POSE Y MODELOS
  poseClassifier: any;

  mensajeAlerta: string = '';
  promedioConfianza: number = 0;

  //Mejor puntaje durante el intento actual
  mejorPuntaje: number = 0;
  //Lista la cual va a contener máximo 90 puntajes es decir 3 segundos de grabacion
  ultimosPuntajes: number[] = [];

  //Elementos para la captura de movimiento
  video: HTMLVideoElement | null = null;
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;

  //Elementos del HTML
  @ViewChild('video') videoElement!: ElementRef;
  @ViewChild('canvas') canvasElement!: ElementRef;

  //INPUT -> ID DEL ÍTEM
  @Input()
  id: number = 0;

  btn_activated: boolean = false;

  //objeto con la información de la escala
  escala!: Escala;

  constructor(
    protected confirmationDialogService: ConfirmationDialogService,
    protected escalaService: EscalaService,
    @Inject(DOCUMENT) protected document: Document,
    protected keypointsService: KeypointsService,
    protected normalizeService: NormalizeService
  ) {}

  //INICIALIZAR LA ESCALA EN BASE AL ID
  ngOnChanges() {
    //Se busca la escala y se cargan datos adicionales
    this.escala = this.escalaService.findById(this.id);
  }

  ngOnInit() {
    //Carga del modelo de Pose
    this.runPoseEstimation();
    //Si ya se tienen 3 intentos no se permite activar el boton
    if (this.escala!.intentos >= 3) {
      this.btn_activated = false;
    }
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

  //OnClick del boton de grabacion
  cambiarEstado(element: any) {
    let button = element;
    //Cambiamos el grabando del botón
    this.grabando = !this.grabando;
    if (this.grabando == true) {
      button.textContent = 'GRABANDO';
    } else {
      //En caso de que se pare de grabar se muestra el popup
      this.openConfirmationDialog();
      button.textContent = 'INICIAR EVALUACIÓN';
      this.colorEsqueleto = this.colors['white'];
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
      //EN CASO DE QUE SE HAYA LLEGADO AL MÁXIMO DE INTENTOS
      if (this.escala.intentos >= 3) {
        this.btn_activated = true;
        console.log('NO HAY MAS INTENTOS DISPONIBLES');
      }
    }
    this.mejorPuntaje = 0;
    this.ultimosPuntajes = [];
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
        if (score > 0.1) {
          this.pintarPuntosClave(x, y, score, name);
          let conexiones: string[] =
            this.keypointsService.keypointConnections[name];
          if (conexiones) {
            for (let conexion of conexiones) {
              let conName = conexion.toUpperCase();
              if (pose[this.keypointsService.PUNTOS[conName]].score > 0.1) {
                this.drawSegment(
                  [x, y],
                  [
                    pose[this.keypointsService.PUNTOS[conName]].x,
                    pose[this.keypointsService.PUNTOS[conName]].y,
                  ],
                  this.colorEsqueleto
                );
              }
            }
          }
        }

        //SI SE ESTÁ GRABANDO SE AGREGAN TODAS LAS POSES AL RREGLO
        if (this.grabando) {
          fila.push([parseFloat(x.toFixed(2)), parseFloat(y.toFixed(2))]);
        }
      }

      if (this.grabando) {
        let predict_data = this.normalizeService.landmarks_to_embedding(fila);

        this.puntaje = this.predecir(predict_data);
        this.ultimosPuntajes.push(this.puntaje);
        if (this.ultimosPuntajes.length > 30) {
          this.ultimosPuntajes.shift();

          let promedioPuntajes = this.calcularPuntajePromedio();

          this.mejorPuntaje = Math.max(this.mejorPuntaje, promedioPuntajes);
        }

        if (this.puntaje > 2.0) {
          this.puntaje = 2.0;
        }

        this.colorearEsqueleto();
      }
    }
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

  //PINTA 1 PUNTO CLAVE
  pintarPuntosClave(x: number, y: number, score: number, name: string) {
    let mirroredX = this.canvas.width - x;

    // Dibujar el punto clave como un círculo
    this.ctx.beginPath();
    this.ctx.fillStyle = 'rgb(255, 0, 0)';
    this.ctx.arc(mirroredX, y, 5, 0, Math.PI * 2);
    this.ctx.fill();
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
      if (this.promedioConfianza < 0.5) {
        this.mensajeAlerta =
          'No se reconoce ninguna pose con confianza suficiente';
        this.btn_activated = true;
      } else if (this.escala!.intentos < 3) {
        this.mensajeAlerta = '';
        this.btn_activated = false;
      }
    } else {
      this.mensajeAlerta = 'No se reconocen personas en la escena';
      this.promedioConfianza = 0.0;
      this.btn_activated = true;
    }
  }
}
