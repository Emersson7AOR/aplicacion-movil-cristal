import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonLabel, IonItem, IonSelect, IonSelectOption, IonHeader, IonCard, IonGrid, IonRow, IonCardContent, IonCardHeader, IonTitle, IonToolbar, IonCardSubtitle, IonCardTitle, IonCol, IonButton } from '@ionic/angular/standalone';
import { DetalleProducto, Grafica, GraficaProductosService } from 'src/app/services/producto/grafica-productos.service';
import { Venta, VentasService } from 'src/app/services/ventas/ventas.service';


interface Week {
  name: string;
  startDate: string;
  endDate: string;
}

interface Month {
  name: string;
  weeks: Week[];
}

@Component({
  selector: 'app-reporte-ventas',
  templateUrl: './reporte-ventas.page.html',
  styleUrls: ['./reporte-ventas.page.scss'],
  standalone: true,
  imports: [IonButton, IonLabel, IonCol,  IonItem, IonSelect, IonSelectOption, IonCardTitle, IonGrid, IonRow, IonCardSubtitle, IonCardContent, IonCardHeader, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard]
})
export class ReporteVentasPage implements OnInit {

  chartOptions: any; 
  ventas : Venta[] = [];
  ventasM: Venta[] = [];
  productos: Grafica[] = [];


  //LO NUEVO DE ANGULAR YA DESDE AQUI SE ACCEDE AL METODO
  private readonly ventasService = inject(VentasService);
  ventas$ = this.ventasService.getAllVentas();

  private readonly graficaProductosService = inject(GraficaProductosService);

  
  constructor() {
    const currentDate = new Date();
    this.selectedYear = currentDate.getFullYear(); // Establece el año actual como predeterminado
    this.generateYears();
    this.generateMonths();
    this.selectCurrentMonth();
   }

   ngOnInit() {
    this.generateYears();
    this.generateMonths();
    // Selecciona el mes y año actual por defecto
    this.selectCurrentMonthAndYear();
  }

  //PARA LOS AÑITOOOSSS
  years: number[] = []; // Almacenará los años desde 2010 hasta el año actual
  selectedYear: number | any = null; // Almacenará el año seleccionado

  //PARA SELECCIONAR LAS SEMANAS SEGUN EL MES
  months: Month[] = [];
  selectedMonth: Month | any = null;
  selectedWeek: Week | any = null;

  //GENERANDO LOS AÑOS HASTA EL ACTUAL POR MEDIO DE UN OBJETO DE TIPO DATE CON AYUDA DE LA FUNCION 
   generateYears() {
    const currentYear = new Date().getFullYear();
    for (let year = 2010; year <= currentYear; year++) {
      this.years.push(year);
    }
  }
  
  //GENERANDO LOS MESES SEGUN EL AÑO SELECCIONADO
  generateMonths() {
    this.months = []; // Limpiar los meses existentes antes de generar nuevos despues de generar el año
    const year = this.selectedYear || new Date().getFullYear(); // Usar el año seleccionado o el año actual

    for (let month = 0; month < 12; month++) {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
     
      const monthName = new Intl.DateTimeFormat('es', { month: 'long' }).format(firstDay);
      const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();

      const weeks = this.generateWeeks(firstDay, lastDay);

      this.months.push({
        name: capitalizedMonthName,
        weeks: weeks,
      });
    }
       // Establecer el mes actual por defecto si no hay nada seleccionado
    if (!this.selectedMonth) {
      const currentMonthIndex = new Date().getMonth();
      this.selectedMonth = this.months[currentMonthIndex];
      // Asignar el año actual si no se ha seleccionado uno
      this.selectedYear = year;
    }
  }
  //GENERA LAS SEMANAAS PARA MOSTRARLAS EN EL SELECT OPTION
  generateWeeks(startDate: Date, endDate: Date): Week[]{
    const weeks = [];
    const startDateCopy = new Date(startDate);

    while (startDateCopy <= endDate) {
      const endDateOfWeek = new Date(startDateCopy);
      endDateOfWeek.setDate(endDateOfWeek.getDate() + 6);

      weeks.push({
        name: `Semana ${weeks.length + 1}`,
        startDate: startDateCopy.toLocaleDateString('es'),
        endDate: endDateOfWeek.toLocaleDateString('es'),
      });

      startDateCopy.setDate(startDateCopy.getDate() + 7);
    }

    return weeks;
  }

  onYearChange(event: any) {
    this.selectedYear = event.value;
    this.generateMonths(); // Regenera los meses para el año seleccionado
  
    // Si el año seleccionado es el año actual, selecciona automáticamente el mes actual
    if (this.selectedYear === new Date().getFullYear()) {
      this.selectCurrentMonth();
    } else {
      // Si selecciona otro año entonces hay que poner un mes por defaulttttt
      this.selectedMonth = this.months[0]; // no puede ser nullo porque va a marcar error:()
    }
  }

  
  //SELECCIONA LOS MESES, Y CO  EL SERVICE PASAN EL AÑO Y MES AL APICITA

   // Al cambiar el mes, se selecciona el mes y se calculan las fechas de inicio y fin del mes seleccionado
   onMonthChange(event: any = {}) {
    // Asumir el mes actual si no se provee un evento con valor por medio de un objeto de tipo date y la funcion getMonth
    const currentMonth = new Date().getMonth();
  
    // Encuentra y selecciona el mes basado en el nombre del mes
    this.selectedMonth = this.months.find((month) => month.name === event.value);
    if (!this.selectedMonth) {
      // Si por alguna razón no se encuentra el mes, usar el mes actual como fallback
      this.selectedMonth = this.months[currentMonth];
    }
    this.selectedWeek = null; // Limpiar la semana seleccionada al cambiar el mes
  
    const year = this.selectedYear;
    const monthIndex = this.months.findIndex((month) => month.name === event.value);
  
    // Calcula la fecha de inicio y fin para el mes seleccionado
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0);
  
    // Formatea las fechas a cadena en formato "YYYY-MM-DD"
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
  
    console.log(`StartDate: ${formattedStartDate}, EndDate: ${formattedEndDate}`);
  
    // Llama al servicio usando las fechas calculadas
    this.graficaProductosService.getGraficaProductos(startDate, endDate).subscribe({
      next: (productos: Grafica[]) => {
        console.log(productos);
        // Ahora mapeamos usando nuestra nueva interfaz para extraer correctamente el nombreProducto
        const producto = productos.map(item => {
          // Verifica si item.nombreProducto es un string válido antes de parsearlo
          if (item && item.nombreProducto) {
            const detalle: DetalleProducto = JSON.parse(item.nombreProducto);
            return detalle.nombreProducto;
          }
          return 'No disponible'; // Puedes retornar un valor por defecto o manejarlo como prefieras
        });
        
        const cantidad = productos.map(item => item.cantidadTotal);
        this.crearGrafica(producto, cantidad);
      },
      error: (error) => {
        console.error("Error al obtener las graficas de productos", error);
      }
    });
  
     //SERVICIO PARA TRAER LAS VENTAS POR MES Y AÑO
     this.ventasService.getVentasPorFecha(startDate, endDate).subscribe({
      next: (ventasM: Venta[]) =>{
        console.log("Ventas del mes", ventasM);
        this.ventasM = ventasM;
      },
      error:(error) =>{
        console.error("Error al obtener las ventas por mes")
      }
    });
  
  }
  
   //CONVERTIR LOS MESES A NUMERO PARA
   //convertir el mes a numero
   convertirMesANumero(nombreMes: string): number {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses.indexOf(nombreMes) + 1;

  }

   //SELECCIONA LA SEMANA, LA ENVIA, RECIBE LA RESPUESTA Y LE COLOCA LAS VENTAS
   selectWeek(week: { name: string, startDate: string, endDate: string }) {
    console.log(week);
    this.selectedWeek = week;
    
    // Aquí, convierte las cadenas de fecha a objetos Date
    const [startDay, startMonth, startYear] = week.startDate.split('/').map(Number);
    const [endDay, endMonth, endYear] = week.endDate.split('/').map(Number);
    
    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);
    
    // Llama al servicio pasando objetos Date
    this.ventasService.getVentasPorFecha(startDate, endDate).subscribe({
      next: (ventasS: Venta[]) => {
        console.log(ventasS);
        this.ventas = ventasS; // Actualiza el array de ventas en tu componente
      },
      error: (error) => {
        console.error("Error al obtener las ventas fechas para la grafica", error);
      }
    });
  }
  selectCurrentMonthAndYear() {
    const currentDate = new Date();
    this.selectedYear = currentDate.getFullYear();
    const currentMonthIndex = currentDate.getMonth();
    this.selectedMonth = this.months[currentMonthIndex];
  
    // Asegurarse de calcular las fechas correctamente aquí
    const startDate = new Date(this.selectedYear, currentMonthIndex, 1);
    const endDate = new Date(this.selectedYear, currentMonthIndex + 1, 0);
    //SERVICIO PARA TRAER LAS VENTAS POR MES Y AÑO
    this.ventasService.getVentasPorFecha(startDate, endDate).subscribe({
      next: (ventasM: Venta[]) =>{
        console.log("Ventas del mes", ventasM);
        this.ventasM = ventasM;
      },
      error:(error) =>{
        console.error("Error al obtener las ventas por mes")
      }
    });

    //SERVIOCIO PARA CREAR LA GRAAFICA SOLO TRAE EL NOMBRE DE LOS PRODUCTOS Y LA CANTIDAD TOTAL
    this.graficaProductosService.getGraficaProductos(startDate, endDate).subscribe({
      next: (productos: Grafica[]) => {
        console.log(productos);
        // Ahora mapeamos usando nuestra nueva interfaz para extraer correctamente el nombreProducto
        const producto = productos.map(item => {
          // Verifica si item.nombreProducto es un string válido antes de parsearlo
          if (item && item.nombreProducto) {
            const detalle: DetalleProducto = JSON.parse(item.nombreProducto);
            return detalle.nombreProducto;
          }
          return 'No disponible'; // Puedes retornar un valor por defecto o manejarlo como prefieras
        });
        
        const cantidad = productos.map(item => item.cantidadTotal);
        this.crearGrafica(producto, cantidad);
      },
      error: (error) => {
        console.error("Error al obtener las graficas de productos", error);
      }
    });
  }
  
  //POR CUALQUIER COSA QUE FALLE AL VOLVERLA A INICIAR, SE PUEDE CULPAR A ESTA FUNCION
  // Asegúrate de actualizar selectCurrentMonth para que no dependa de un evento
  selectCurrentMonth() {
    const currentMonth = new Date().getMonth(); // Obtiene el mes actual (0-11)
    const monthName = new Intl.DateTimeFormat('es', { month: 'long' }).format(new Date());
    this.selectedMonth = this.months[currentMonth]; // Asegúrate de que esto seleccione correctamente el mes actual
    // Nota: No necesitas buscar por nombre si ya sabes el índice del mes actual
  }
  capitalizeMonthName(monthName: string): string {
    return monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();
  }

  crearGrafica(productos: string[], cantidades: number[]) {
    let dataPoints = productos.map((producto, index) => ({
      label: producto,
      y: cantidades[index]
    }));
  
    this.chartOptions = null;
    //AQUI ESTOY ESPERANDO PARA RENDERIZAR LA GRAFICA
    setTimeout(() => {
      this.chartOptions = {
        animationEnabled: true,
        title: {
          text: "Productos más vendidos",
          fontFamily: "Arial",
          fontSize : 20
        },
        axisY: {
          title: "Unidades Vendidas",
          fontFamily: "Arial",
          fontSize : 15
        },
        data: [{
          type: "splineArea",
          color: "rgba(54,158,173,.7)",
          dataPoints: dataPoints
        }]
      };
      setTimeout(() => {
          //aqui se convierte la grafica a base 64
      }, 3000);
    });
  
    }
}
