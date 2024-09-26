import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CamaraCaptureComponent } from './components/camara-capture/camara-capture.component';
import { EvaluarComponent } from './pages/evaluar/evaluar.component';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'evaluar/:id', component: EvaluarComponent },
  { path: 'evaluar/continua/:id', component: EvaluarComponent },
  { path: '', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
