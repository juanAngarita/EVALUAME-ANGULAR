import { Component, ElementRef, Inject, Input, ViewChild } from '@angular/core';
import { ConfirmationDialogService } from '../../services/confirmation-dialog.service';
import { EscalaService } from '../../services/escala.service';
import { KeypointsService } from '../../services/keypoints.service';
import { NormalizeService } from '../../services/normalize/normalize.service';
import { DOCUMENT } from '@angular/common';
import { Escala } from '../../model/Escala';

@Component({
  selector: 'app-capture',
  templateUrl: './capture.component.html',
  styleUrls: ['./capture.component.css'],
})
export abstract class CaptureComponent {
  //DICCIONATIO DE PUNTOS CLAVE
  PUNTOS: { [key: string]: number } = {};
  //DICCIONARIO DE CONEXIONES
  keypointConnections: { [key: string]: string[] } = {};

  //Elementos para la captura de movimiento
  video: HTMLVideoElement | null = null;

  //Elementos del HTML
  @ViewChild('video') videoElement!: ElementRef;
  @ViewChild('canvas') canvasElement!: ElementRef;

  //INPUT -> ID DEL ÍTEM
  @Input()
  id: number = 0;

  desactivarBoton: boolean = false;

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
    this.PUNTOS = this.keypointsService.PUNTOS;
    this.keypointConnections = this.keypointsService.keypointConnections;
  }

  abstract runPoseEstimation(): any;
  abstract initCamera(): any;
  abstract cargarModel(): any;

  ngOnInit() {
    //Carga del modelo de Pose
    this.runPoseEstimation();
    //Si ya se tienen 3 intentos no se permite activar el boton
    if (this.escala!.intentos >= 3) {
      this.desactivarBoton = true;
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

  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
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
}
