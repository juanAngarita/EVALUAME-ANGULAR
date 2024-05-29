import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-evaluar',
  templateUrl: './evaluar.component.html',
  styleUrls: ['./evaluar.component.css']
})
export class EvaluarComponent implements OnInit{

  constructor(
    private route:ActivatedRoute
  ){}

  id:number = 0;

  ngOnInit(){
    this.route.params.subscribe((params: Params) => {
      console.log("Params",params)
      this.id= params['id'];
      console.log("ID" + this.id)
    });
  }

}
