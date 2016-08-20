import { Routes } from '@angular/router';

import { HomeRoutes } from './+home/index';
import { LegalRoutes } from './+legal/index';

export const routes: Routes = [
  ...HomeRoutes,
  ...LegalRoutes
];