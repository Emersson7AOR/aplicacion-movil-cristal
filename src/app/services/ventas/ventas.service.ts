import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Empleado{
  idEmpleado : string;
  nombreEmpleado?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
}

export interface Cliente{
  idCliente : string;
  nombreCliente? : string;
  apellidoPaterno? : string;
  apellidoMaterno?: string;
}

export interface Producto{
  idProducto: number;
  clave?: string;
  nombreProducto?: string;
  precio?: number;
}

export interface Detalle{
  subTotal: number;
  cantidadProductos: number;
  producto?:Producto;
}

export interface Venta{
  idVenta : number;
  fechaVenta: Date;
  totalPagar: number;
  detalles: Detalle[];
  cliente: Cliente;
  empleado: Empleado;
}


export interface VentaAgregar{
  fechaVenta: string;
  totalPagar: number;
  detalles: Detalle[];
  cliente: Cliente;
  empleado: Empleado;
}

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private url : string = "http://localhost:8080/ventas"
  private readonly _http= inject(HttpClient);

  constructor() { }

  getAllVentas(): Observable<Venta[]>{
    return this._http.get<Venta[]>(`${this.url}/listar`);
  }

  // Nuevo método para obtener ventas por rango de fechas
  getVentasPorFecha(startDate: Date, endDate: Date): Observable<Venta[]> {
    // Formatear las fechas como strings si es necesario
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Crear parámetros HTTP
    const params = new HttpParams()
      .set('startDate', startDateStr)
      .set('endDate', endDateStr);

    return this._http.get<Venta[]>(`${this.url}/porFechas`, { params });
  }

  //OBTENER LAS VENTAS DEL DIA
  getVentasDia() : Observable<Venta[]>{
    return this._http.get<Venta[]>(`${this.url}/ventasDelDia`);
  }

  //MERTODO AGREGAR Ventas
  agregarVenta(venta: VentaAgregar) : Observable<any>{
    return this._http.post(this.url + "/agregar", venta);
  }
  
}
