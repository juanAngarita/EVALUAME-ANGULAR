import { Component, Input } from '@angular/core';
import { Escala } from '../model/Escala';
import { EscalaService } from '../services/escala.service';

@Component({
  selector: 'app-escala-detalle',
  templateUrl: './escala-detalle.component.html',
  styleUrls: ['./escala-detalle.component.css'],
})
export class EscalaDetalleComponent {
  @Input()
  id: number = 0;

  escala: Escala | undefined = undefined;

  constructor(private escalaService: EscalaService) {}

  ngOnInit() {
    //this.escala = this.escalaService.findById(1);
  }

  ngOnChanges() {
    this.escala = this.escalaService.findById(this.id);
    this.escala!.detalles!.imagen0 = 'assets/images/item' + this.id + '-0.png';
    this.escala!.detalles!.imagen1 = 'assets/images/item' + this.id + '-1.png';
    this.escala!.detalles!.imagen2 = 'assets/images/item' + this.id + '-2.png';
  }
}
