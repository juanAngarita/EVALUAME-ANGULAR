import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import * as backend from '@tensorflow/tfjs-backend-webgpu';
import { ConfirmationDialogService } from '../services/confirmation-dialog.service';
import { Escala } from '../model/Escala';
import { EscalaService } from '../services/escala.service';


@Component({
  providers: [ConfirmationDialogService],
  selector: 'app-camara-capture',
  templateUrl: './camara-capture.component.html',
  styleUrls: ['./camara-capture.component.css']
})
export class CamaraCaptureComponent implements AfterViewInit {

  //DICCIONATIO DE PUNTOS CLAVE
  PUNTOS: { [key: string]: number } = {
    NOSE: 0,
    LEFT_EYE: 1,
    RIGHT_EYE: 2,
    LEFT_EAR: 3,
    RIGHT_EAR: 4,
    LEFT_SHOULDER: 5,
    RIGHT_SHOULDER: 6,
    LEFT_ELBOW: 7,
    RIGHT_ELBOW: 8,
    LEFT_WRIST: 9,
    RIGHT_WRIST: 10,
    LEFT_HIP: 11,
    RIGHT_HIP: 12,
    LEFT_KNEE: 13,
    RIGHT_KNEE: 14,
    LEFT_ANKLE: 15,
    RIGHT_ANKLE: 16,
  }

  //DICCIONARIO DE CONEXIONES
  keypointConnections: { [key: string]: string[] } = {
    nose: ['left_ear', 'right_ear'],
    left_ear: ['left_shoulder'],
    right_ear: ['right_shoulder'],
    left_shoulder: ['right_shoulder', 'left_elbow', 'left_hip'],
    right_shoulder: ['right_elbow', 'right_hip'],
    left_elbow: ['left_wrist'],
    right_elbow: ['right_wrist'],
    left_hip: ['left_knee', 'right_hip'],
    right_hip: ['right_knee'],
    left_knee: ['left_ankle'],
    right_knee: ['right_ankle']
  }

  //Elementos del HTML
  @ViewChild('video') videoElement!: ElementRef;
  @ViewChild('canvas') canvasElement!: ElementRef;

  //INPUT -> ID DEL ÍTEM
  @Input()
  id: number = 0;
  escala: Escala | null = null;

  //Elementos para la captura de movimiento
  video: HTMLVideoElement | null = null;
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;

  //ELEMENTOS ESTIMACIÓN DE POSE
  estado: boolean = false; //SI SE ESTÁ GRABANDO
  poses: any;
  puntaje: number = 3;
  desactivarBoton: boolean = false
  colorEsqueleto: string = 'rgb(255, 255, 255)'


  //ESTIMACIÓN DE POSE Y MODELOS
  poseClassifier: any

  constructor(
    private confirmationDialogService: ConfirmationDialogService,
    private escalaService: EscalaService
  ) { }

  //INICIALIZAR LA ESCALA EN BASE AL ID
  ngOnChanges() {
    this.escala = this.escalaService.findById(this.id);
  }

  ngOnInit() {
    console.log("Funcion init");
    //!!!CAMBIAR ACÁ EL TIPO DE MODELO!!!
    //1. SINGLEPOSE_LIGHTNING (MoveNet)
    //2. SINGLEPOSE_THUNDER (MoveNet)
    this.runMovenet()
  }

  //OBTENER LOS ELEMENTOS DEL HTML + INICIALIZAR LA CAMARA
  ngAfterViewInit() {
    this.video = this.videoElement.nativeElement;
    this.canvas = this.canvasElement.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.initCamera();
    this.cargarModel();
  }

  //BOTON DE "INICIAR EVALUACIÓN"
  cambiarEstado(element: any) {
    let button = element
    this.estado = !this.estado;
    if (this.estado == true) {
      button.textContent = "GRABANDO";
    } else {
      this.openConfirmationDialog();
      button.textContent = "INICIAR EVALUACIÓN";
      this.colorEsqueleto = 'rgb(255, 255, 255)'
    }
  }

  //DIALOGO DE CONFIRMACIÓN
  openConfirmationDialog() {
    //EN CASO DE QUE EL USUARIO ACEPTE EL PUNTAJE SE LLAMA A ACTUALIZAR PUNTAJES
    this.confirmationDialogService.confirm('Confirmar el puntaje', 'El puntaje calculado es: ' + this.puntaje, "Aceptar", "Cancelar")
      .then((confirmed) => this.actualizarPuntajes())
      .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }
  //ACTUALIZA EL PUNTAJE TANTO EN EL SERVICIO COMO EN EL FRONT 
  actualizarPuntajes() {
    if (this.escala) {
      this.escalaService.actualizarPuntaje(this.escala.id, this.puntaje);
      let intentos = this.escala.intentos;
      this.escala.puntajes[intentos] = this.puntaje;
      this.escala.intentos++;
      //EN CASO DE QUE SE HAYA LLEGADO AL MÁXIMO DE INTENTOS
      if (this.escala.intentos == 3) {
        this.desactivarBoton = true;
        console.log("apagando boton")
      }
    }
  }

  //CARGAR EL MODELO DE CLASIFIFCACION
  async cargarModel() {
    this.poseClassifier = await tf.loadLayersModel('/assets/models/model.json');
    console.log("Clasificacion de pose :", this.poseClassifier)
    //console.log(poseClassifier.model)
  }



  async runMovenet() {
    //Esperar a que tf esté listo
    await tf.ready();
    //Crear el detector de pose
    const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER };
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
    //obtener las poses
    setInterval(() => this.getPoses(detector), 100);
  }

  async getPoses(detector: poseDetection.PoseDetector) {
    if (detector && this.video) {
      this.poses = await detector.estimatePoses(this.video);
      //console.log(this.poses)
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
      console.error("Error al acceder a la cámara: ", err);
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
      this.ctx.drawImage(this.video, -this.canvas.width, 0, this.canvas.width, this.canvas.height);
      // Restaurar la transformación
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    //RENDERIZADO DE LAS POSES
    if (this.poses) {
      this.drawPoses(this.poses)
    }
  }

  drawPoses(poses: any) {
    //OBTIENE LOS KEYPOINTS
    let pose = poses[0].keypoints

    //Si ya hay poses detectadas
    if (pose) {
      let fila = []
      //console.log(poses)
      //mostrarResumenDatos();

      //RECORRER PUNTO POR PUNTO Y PITARLO
      for (let i = 0; i < pose.length; i++) {
        let x = pose[i].x;
        let y = pose[i].y;
        let name: string = pose[i].name;
        let score = pose[i].score.toFixed(2);
        if (score > 0.3) {
          this.pintarPuntosClave(x, y, score, name)
          let conexiones: string[] = this.keypointConnections[name];
          if (conexiones) {
            for (let conexion of conexiones) {
              let conName = conexion.toUpperCase()
              if (pose[this.PUNTOS[conName]].score > 0.3) {
                this.drawSegment([x, y],
                  [pose[this.PUNTOS[conName]].x,
                  pose[this.PUNTOS[conName]].y],
                  this.colorEsqueleto)
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

        console.log("FILA:" ,fila)

        let predict_data = this.landmarks_to_embedding(fila)

        console.log("PREDICT DATA:" , predict_data)

        let puntaje = this.predecir(predict_data)

        if(puntaje == 0){
          this.colorEsqueleto = 'rgb(255, 0, 0)'
        }else if(puntaje == 1){
          this.colorEsqueleto = 'rgb(255, 255, 0)'
        }else if(puntaje == 2){
          this.colorEsqueleto = 'rgb(0, 255, 0)'
        }
      }

    }
  }

  //PROCESAMIENTO DE DATOS
  get_center_point(landmarks: any, left_bodypart: number, right_bodypart: number) {
    let left = tf.gather(landmarks, left_bodypart, 1)
    let right = tf.gather(landmarks, right_bodypart, 1)
    const center = tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5))
    return center
  }

  get_pose_size(landmarks: any, torso_size_multiplier = 2.5) {
    let hips_center = this.get_center_point(landmarks, this.PUNTOS["LEFT_HIP"], this.PUNTOS["RIGHT_HIP"])
    let shoulders_center = this.get_center_point(landmarks, this.PUNTOS["LEFT_SHOULDER"], this.PUNTOS["RIGHT_SHOULDER"])
    let torso_size = tf.norm(tf.sub(shoulders_center, hips_center))
    let pose_center_new = this.get_center_point(landmarks, this.PUNTOS["LEFT_HIP"], this.PUNTOS["RIGHT_HIP"])
    pose_center_new = tf.expandDims(pose_center_new, 1)

    pose_center_new = tf.broadcastTo(pose_center_new,
      [1, 17, 2]
    )
    // return: shape(17,2)
    let d = tf.gather(tf.sub(landmarks, pose_center_new), 0, 0)
    let max_dist = tf.max(tf.norm(d, 'euclidean', 0))

    // normalize scale
    let pose_size = tf.maximum(tf.mul(torso_size, torso_size_multiplier), max_dist)
    return pose_size
  }

  normalize_pose_landmarks(landmarks: any) {

    let pose_center = this.get_center_point(landmarks, this.PUNTOS["LEFT_HIP"], this.PUNTOS["RIGHT_HIP"])

    pose_center = tf.expandDims(pose_center, 1)

    pose_center = tf.broadcastTo(pose_center,
      [1, 17, 2]
    )

    landmarks = tf.sub(landmarks, pose_center)

    let pose_size = this.get_pose_size(landmarks)
    landmarks = tf.div(landmarks, pose_size)

    landmarks.array().then((array: any[]) => {
      console.log("Nuevo:", array);
    });
    return landmarks
  }

  landmarks_to_embedding(landmarks: any) {
    // normalize landmarks 2D
    landmarks = this.normalize_pose_landmarks(tf.expandDims(landmarks, 0))
    let embedding = tf.reshape(landmarks, [1, 34])
    return embedding
  }
  //////////
  //FIN PROCESAMIENTO DE DATOS

  predecir(processedInput: any){
    const classification = this.poseClassifier.predict(processedInput)
  
    // Get the value
    const value = classification.argMax(-1).dataSync()[0]
  
        // Arreglo proporcionado
    var arreglo = ['110', '111', '112', '150', '151', '152', '160', '161', '162', '170', '171', '172', '210', '211', '212', '300', '301', '302'];

    // Crear un diccionario donde la clave sea una secuencia de números que comience en 0
    var diccionario: {[key: string]: string} = {};

    // Llenar el diccionario
    for (var i = 0; i < arreglo.length; i++) {
        diccionario[i.toString()] = arreglo[i];
    }

    // Convertir el número en una cadena
    var numeroStr = diccionario[value].toString();

    // Obtener los dos primeros dígitos
    var dosPrimerosDigitos = parseInt(numeroStr.substring(0, 2));

    // Obtener el último dígito
    var ultimoDigito = parseInt(numeroStr.substring(2));

    console.log("PRUEBA", dosPrimerosDigitos)
    console.log("PREDICCION", ultimoDigito)
    return ultimoDigito;
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
  drawSegment([mx, my]: [number, number], [tx, ty]: [number, number], color: string) {
    let mirroredmX = this.canvas.width - mx;
    let mirroredtX = this.canvas.width - tx;

    this.ctx.beginPath()
    this.ctx.moveTo(mirroredmX, my)
    this.ctx.lineTo(mirroredtX, ty)
    this.ctx.lineWidth = 5
    this.ctx.strokeStyle = color
    this.ctx.stroke()
  }
}
