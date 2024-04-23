import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },  {
    path: 'reporte-ventas',
    loadComponent: () => import('./pages/reporte-ventas/reporte-ventas.page').then( m => m.ReporteVentasPage)
  },

];
