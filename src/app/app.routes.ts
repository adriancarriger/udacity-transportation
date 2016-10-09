import { Routes } from '@angular/router';

import { homeRoutes } from './home/index';
import { legalRoutes } from './legal/index';

export const routes: Routes = [
  ...homeRoutes,
  ...legalRoutes
];
