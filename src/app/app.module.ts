import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EvaluarComponent } from './pages/evaluar/evaluar.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';

import { FormsModule } from '@angular/forms';
import { ConfirmationDialogService } from './services/confirmation-dialog.service';
import { FooterComponent } from './layout/footer/footer.component';
import { CaptureComponent } from './components/capture/capture.component';
import { TablaIntentosComponent } from './components/tabla-intentos/tabla-intentos.component';
import { HomeComponent } from './pages/home/home.component';
import { CamaraCaptureComponent } from './components/camara-capture/camara-capture.component';
import { EscalaDetalleComponent } from './components/escala-detalle/escala-detalle.component';
import { CamaraCaptureContinueComponent } from './components/camara-capture-continue/camara-capture-continue.component';

@NgModule({
  declarations: [
    AppComponent,
    CamaraCaptureComponent,
    HomeComponent,
    HeaderComponent,
    EscalaDetalleComponent,
    EvaluarComponent,
    ConfirmationDialogComponent,
    TablaIntentosComponent,
    CamaraCaptureContinueComponent,
    FooterComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, NgbModule, FormsModule],
  providers: [ConfirmationDialogService],
  bootstrap: [AppComponent],
})
export class AppModule {}
