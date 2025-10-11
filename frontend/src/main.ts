import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Force rebuild: 2025-10-11-cloudrun
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
