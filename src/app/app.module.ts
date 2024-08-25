import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CamaraCaptureComponent } from './camara-capture/camara-capture.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EscalaDetalleComponent } from './escala-detalle/escala-detalle.component';
import { EvaluarComponent } from './pages/evaluar/evaluar.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { TablaIntentosComponent } from './tabla-intentos/tabla-intentos.component';
import { CamaraCaptureContinueComponent } from './camara-capture-continue/camara-capture-continue.component';

import { FormsModule } from '@angular/forms';
import { ConfirmationDialogService } from './services/confirmation-dialog.service';

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
  ],
  imports: [BrowserModule, AppRoutingModule, NgbModule, FormsModule],
  providers: [ConfirmationDialogService],
  bootstrap: [AppComponent],
})
export class AppModule {}
