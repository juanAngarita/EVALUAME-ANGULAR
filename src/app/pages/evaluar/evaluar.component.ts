import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, UrlSegment } from '@angular/router';

@Component({
  selector: 'app-evaluar',
  templateUrl: './evaluar.component.html',
  styleUrls: ['./evaluar.component.css'],
})
export class EvaluarComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  id: number = 0;
  evaluacionContinua: boolean = true;

  ngOnInit() {
    this.route.url.subscribe((segments: UrlSegment[]) => {
      const isContinuaRoute = segments.some(
        (segment) => segment.path === 'continua'
      );
      this.evaluacionContinua = isContinuaRoute;

      console.log('Es ruta continua:', this.evaluacionContinua);
    });

    this.route.params.subscribe((params: Params) => {
      console.log('Params', params);
      this.id = params['id'];
      console.log('ID' + this.id);
    });
  }
}
