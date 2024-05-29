import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CamaraCaptureComponent } from './camara-capture/camara-capture.component';
import { EvaluarComponent } from './pages/evaluar/evaluar.component';

const routes: Routes = [
  
  { path: 'home', component: HomeComponent },
  { path: 'evaluar/:id', component: EvaluarComponent },
  { path: '', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
