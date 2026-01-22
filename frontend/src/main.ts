/**
 * PUNTO DE ENTRADA PRINCIPAL
 * 
 * Bootstrap de la aplicación Angular
 * Inicia la aplicación y carga el componente raíz
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
