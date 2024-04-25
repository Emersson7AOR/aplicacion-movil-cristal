import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'reporte-ventas',
    pathMatch: 'full',
  },
  {
    path: 'reporte-ventas',
    loadComponent: () => import('./pages/reporte-ventas/reporte-ventas.page').then( m => m.ReporteVentasPage)
  },
  {
    path: 'modal-detalles',
    loadComponent: () => import('./pages/modal-detalles/modal-detalles.page').then( m => m.ModalDetallesPage)
  },

];
