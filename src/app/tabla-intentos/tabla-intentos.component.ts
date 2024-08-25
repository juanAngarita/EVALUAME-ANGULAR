import { Component, Input } from '@angular/core';
import { input } from '@tensorflow/tfjs';
import { Escala } from '../model/Escala';

@Component({
  selector: 'app-tabla-intentos',
  templateUrl: './tabla-intentos.component.html',
  styleUrls: ['./tabla-intentos.component.css'],
})
export class TablaIntentosComponent {
  @Input()
  escala: Escala | null = null;

  ngOnChanges() {}
}
