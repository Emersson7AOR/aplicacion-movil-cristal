import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Grafica{
 nombreProducto: string;
 cantidadTotal: number;
}

export interface DetalleProducto {
  _id: {
    $oid: string;
  };
  nombreProducto: string; // Esta es la propiedad que queremos extraer
  clave: string;
  unidadMedida: string;
  precio: number;
  existencia: number;
  fotoProducto: string;
  _class: string;
}

@Injectable({
  providedIn: 'root'
})
export class GraficaProductosService {
  
  private readonly _httpGrafica = inject(HttpClient);
   private url : string = "http://192.168.8.14:8080/ventas";

  constructor() { }

  getGraficaProductos(startDate: Date, endDate: Date): Observable<Grafica[]> {
    // Formatear las fechas como strings si es necesario
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Crear parámetros HTTP
    const params = new HttpParams()
      .set('startDate', startDateStr)
      .set('endDate', endDateStr);

    return this._httpGrafica.get<Grafica[]>(`${this.url}/porResumenFechas`, { params });
  }
  
}
