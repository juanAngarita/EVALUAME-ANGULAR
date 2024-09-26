import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Escala } from 'src/app/model/Escala';
import { EscalaService } from 'src/app/services/escala.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  constructor(private escalaService: EscalaService, private router: Router) {}
  //Checkbox
  modoEscalaContinua = false;

  redirigir() {
    if (!this.modoEscalaContinua) {
      this.router.navigate(['/evaluar/' + this.idSeleccionado]);
    } else {
      this.router.navigate(['/evaluar/continua/' + this.idSeleccionado]);
    }
  }

  idSeleccionado: number = 0;
  escalas: Escala[] = [];
  ngOnInit() {
    this.escalas = this.escalaService.findAll();
    console.log(this.escalas);
  }

  seleccionar(id: number) {
    console.log('Item seleccionado: ', id);
    this.idSeleccionado = id;
  }
}
