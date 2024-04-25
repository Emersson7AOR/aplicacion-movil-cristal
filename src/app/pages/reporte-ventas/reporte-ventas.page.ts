import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController, Platform } from '@ionic/angular';
import { DetalleProducto, Grafica, GraficaProductosService } from 'src/app/services/producto/grafica-productos.service';
import { Venta, VentasService } from 'src/app/services/ventas/ventas.service';
//Para crear el pdf
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { ModalDetallesPage } from '../modal-detalles/modal-detalles.page';
import {
  IonCard, IonCardHeader, IonCardContent,
  IonCardSubtitle, IonCardTitle, IonToolbar,
  IonHeader, IonContent, IonGrid, IonNote,
  IonCol, IonRow, IonSelect, IonSelectOption,
  IonIcon, IonItem, IonTitle, IonButton, IonList,
  IonLabel, IonModal, IonAlert } from "@ionic/angular/standalone";



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
  imports: [IonAlert, 
     CanvasJSAngularChartsModule,
     CommonModule, FormsModule,IonCard,
     IonCardHeader, IonCardContent,
     IonCardSubtitle, IonCardTitle, IonToolbar,
     IonHeader, IonContent, IonGrid, IonNote,
     IonCol, IonRow, IonSelect, IonSelectOption,
     IonIcon, IonItem, IonTitle, IonButton,
     IonList, IonLabel, IonModal
    ],
    providers: [ModalController, FileOpener] // Provee ModalController aquí

})
export class ReporteVentasPage implements OnInit {
  private graficaImagenUrl: string | undefined;

  chartOptions: any;
  ventas : Venta[] = [];
  ventasM: Venta[] = [];
  productos: Grafica[] = [];


  //LO NUEVO DE ANGULAR YA DESDE AQUI SE ACCEDE AL METODO
  private readonly ventasService = inject(VentasService);
  ventas$ = this.ventasService.getAllVentas();

  private readonly graficaProductosService = inject(GraficaProductosService);


  constructor(private modalCtrl: ModalController,
    //clase que nos ayuda a identificar el tipo de plataforma que es si movil o web, para descargar la imagen
    private platform : Platform,
    private fileOpener: FileOpener
  ) {
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
   onMonthChange(event: any) {
    // Asumir el mes actual si no se provee un evento con valor por medio de un objeto de tipo date y la funcion getMonth
    const currentMonth = new Date().getMonth();

    // Encuentra y selecciona el mes basado en el nombre del mes
    this.selectedMonth = this.months.find((month) => month.name === event.detail.value);

    this.selectedWeek = null; // Limpiar la semana seleccionada al cambiar el mes

    const year = this.selectedYear;
    const monthIndex = this.months.findIndex((month) => month.name === event.detail.value);

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

  //PARA ABRIR MI MODAL DE LOS DETALLES
  async selectVenta(venta: Venta) {
    const modal = await this.modalCtrl.create({
      component: ModalDetallesPage,
      componentProps: {
        venta: venta
      }
    });
    return await modal.present();
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
          fontSize : 13
        },
        axisY: {
          title: "Unidades Vendidas",
          fontFamily: "Arial",
          fontSize : 8
        },
        data: [{
          type: "splineArea",
          color: "rgba(54,158,173,.7)",
          fontSize : 8,
          dataPoints: dataPoints
        }]
      };
      setTimeout(() => {
        this.convertirGraficaABase64();
      }, 3000);
    });

    }

    convertirGraficaABase64() {
      // AQUI ACCEDEMOS AL ELEMENTO CANVAS POR MEDIO DEL ID 
      const chartContainer = document.getElementById('myChart'); 
      if (chartContainer) {
        const canvas = chartContainer.getElementsByTagName('canvas')[0];
        if (canvas) {
          const imagenBase64 = canvas.toDataURL("image/png");
          this.graficaImagenUrl = imagenBase64;
          console.log(this.graficaImagenUrl);
        }
      }
    } 

    //GENERAR REPORTE MENSUAL
   async generarReporteMensual() {
    const doc = new jsPDF();
    const margen = 15; // 2.5 cm en milímetros
    let paginaAncho = doc.internal.pageSize.getWidth();
  
    const logoEmpresa = '/assets/progomex.jpg';
    const logoAncho = 30; 
    const logoAlto = 30; 
  
    //AQUI ESTOY AÑADIENDO LA IMAGEN EN EL PDF A LA IZQUIERDA
    doc.addImage(logoEmpresa, 'JPEG', margen, 20, logoAncho, logoAlto); 
  
    doc.setFont("helvetica", "bold");   
    doc.setFontSize(9); 
    const elementosEncabezado = [
      "Productora y Maquila de Gomas Resinas de Mexico S. de R.L",
      "Carretera estatal la capilla el huasteco km.18 la Guadalupe Ver.",
      "271-219-42-031",
      "PMG110202LL5"
    ];
    
    let yEncabezado = 25; 
  
    elementosEncabezado.forEach((elemento) => {
      const xElemento = (paginaAncho - doc.getTextWidth(elemento)) / 2; 
      doc.text(elemento, xElemento, yEncabezado);
      yEncabezado += 7; 
    });
      
    //AGREGANDO UNA LINEA
     doc.setDrawColor(0);//aqui le puedo dar el color
     doc.setLineWidth(0.1); //esta es la funcion para darle grosor a la linea
     //si quiero poner la linea mas separada solo lo pongo yEncabezado + 3 o 1 o 2
     doc.line(15, yEncabezado , paginaAncho - 15, yEncabezado);
   
      // propiedades para el título del reporte 
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16); // Tamaño de fuente para el título
      const titulo = `Reporte de ventas del mes de: ${this.selectedMonth.name}`;
      const xTitulo = (paginaAncho - doc.getTextWidth(titulo)) / 2;
      doc.text(titulo, xTitulo, 61); // Para centrar el título en la página completa
      // línea después del título
      doc.line(15, yEncabezado + 12, paginaAncho - 15, yEncabezado + 12);
    
      //AGREGANDO LA GRAFICA AL REPORTE
      //le agrrego las propiedades de ancho y alto, asi como el centrado
      const imagenAncho = 140; 
        const imagenAlto = 80; 
        const xImagen = (paginaAncho - imagenAncho) / 2; 
        const yImagen = yEncabezado + 20; 
        
      if (this.graficaImagenUrl) {
        doc.addImage(this.graficaImagenUrl, 'PNG', xImagen, yImagen, imagenAncho, imagenAlto);
        let inicioInformacionVentas = yImagen + imagenAlto + 10; 
        paginaAncho = inicioInformacionVentas;
      
      }
  
      let yPosition = yEncabezado + 20 + imagenAlto + 20; 
  
     this.ventasM.forEach((ventaM, index) => {
      // Verificar si es necesario añadir una nueva página
      if (yPosition > (doc.internal.pageSize.height - 25)) {
        // No hay suficiente espacio, entonces agrego una nueva página
        doc.addPage();
        yPosition = 25; // Restablece la posición Y para el inicio de la nueva página
      }
      doc.setFontSize(10);
       // Encabezado de cada venta
       //OBETENER LA FECHA EN YYYY-MM-DD
        const fechaHoraISO = ventaM.fechaVenta.toString();
        
        // Ahora uso un split ya que fechaHoraISO es una cadena:
        const partes = fechaHoraISO.split('T');
        const fecha = partes[0];const horaCompleta = partes[1].split(':');
        const hora = `${horaCompleta[0]}:${horaCompleta[1]}`; // Formato HH:MM
  
       doc.setFont("helvetica", "bold");  
       doc.text(`Venta nº: ${index+1}     Fecha: ${fecha}     Hora: ${hora}`, 15, paginaAncho);
      
       // Calculando el ancho del texto "Total de Venta"
       const totalVentaTexto = `Total de venta: $ ${ventaM.totalPagar}.00`;
       const totalVentaAncho = doc.getTextWidth(totalVentaTexto);
       
       // Calculando la posición x para alinear a la derecha
       const margenDerecho = 15; // Por ejemplo, 10 mm de margen derecho
       const paginaAncho2 = doc.internal.pageSize.getWidth();
       const xTotalVenta = paginaAncho2 - totalVentaAncho - margenDerecho;
       
       // Posicionando "Total de Venta" a la derecha y al mismo nivel de "Venta ID"
       
       doc.setFont("helvetica", "bold");
       doc.text(totalVentaTexto, xTotalVenta, paginaAncho);;
        
       //NOMBRE DEL EMPLEADO
       paginaAncho += 6;
       const nombreCompletoEmpleado = `${ventaM.empleado?.nombreEmpleado} ${ventaM.empleado?.apellidoPaterno} ${ventaM.empleado?.apellidoMaterno}`;
       doc.setFont("helvetica", "normal");
       doc.text(`Empleado: ${nombreCompletoEmpleado}`, 15, paginaAncho);
  
       //NOMBRE DEL CLIENTE
       paginaAncho += 6; // Espacio despues del nombre del empleado
       const nombreCompletoCliente = `${ventaM.cliente?.nombreCliente} ${ventaM.cliente?.apellidoPaterno} ${ventaM.cliente?.apellidoMaterno}`;
       doc.setFont("helvetica", "normal");
       doc.text(`Cliente: ${nombreCompletoCliente}`, 15, paginaAncho);
  
       paginaAncho += 6; // Espacio después del nombre del cliente
          
        // Datos para la tabla de detalles
        const detallesColumn = ["Clave","Producto", "Cantidad", "Precio", "Subtotal"];
        const detallesRows = ventaM.detalles.map(detalle => [
          detalle.producto?.clave || 'N/A', 
          detalle.producto?.nombreProducto || 'N/A', // 'N/A' como valor por defecto
          detalle.cantidadProductos || 0,
          detalle.producto?.precio || 0,
          detalle.subTotal || 0,
        ]);
  
        // Añadir tabla de detalles al documento
        autoTable(doc, {
          head: [detallesColumn],
          body: detallesRows,
          startY: paginaAncho,
          headStyles: {
            fillColor: [25, 110, 167], // Color verde en formato RGB 
            fontStyle: 'bold' // Estilo de fuente en negrita
          },
          bodyStyles: { 
          },
          didDrawPage: function(data) {
            if (data.cursor) {
              paginaAncho = data.cursor.y + 10; 
            }
          }
        });
  
     });
    
      if (this.platform.is('capacitor')) { //si es movil
          // Generar el blob y la URL del blob
            // Generar el blob del PDF
          const pdfOutput = doc.output('blob');
          const data = await new Response(pdfOutput).arrayBuffer();
          const base64 = btoa(new Uint8Array(data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        
          // Guardar el archivo en el dispositivo
          const fileName = `reporte_ventas_${this.selectedMonth.name}.pdf`;
          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64,
            directory: Directory.Documents,
            recursive: true
          });
        
          // Obtener la URI para el archivo guardado
          const uri = savedFile.uri;
        
          // Abrir el archivo PDF con la aplicación nativa
          this.fileOpener.open(uri, 'application/pdf')
            .then(() => console.log('File is opened'))
            .catch(err => console.error('Error opening file:', err));
      } else {//si es web
        // Guardar el PDF ESCRITORIO
        doc.save(`reporte_ventas_${this.selectedMonth.name}.pdf`);
        //ABRIR EL PDF EN EL NAVEGADOR 
        //lo estoy abriendo despues de un segundo para esperar a que se ejecute mi alert
        setTimeout(function () {
          window.open(doc.output('bloburl'), '_blank');
        }, 1000);
      }

   
  }

//GENERAR REPORTE SEMANAL
  async generarReporteSemanal() {
    const doc = new jsPDF();
    const margen = 15; 
    let paginaAncho = doc.internal.pageSize.getWidth();
    
    // Agregando el logo de la empresa
    const logoEmpresa = '/assets/progomex.jpg';
    const logoAncho = 30; 
    const logoAlto = 30; 
  
    // Añadir imagen: logo de la empresa alineado a la izquierda
    doc.addImage(logoEmpresa, 'JPEG', margen, 20, logoAncho, logoAlto); 
  
    //FUENTES PARA EL ENCABEZADO
    doc.setFont("helvetica", "bold"); 
    doc.setFontSize(9); 
    const elementosEncabezado = [
      "Productora y Maquila de Gomas Resinas de Mexico S. de R.L",
      "Carretera estatal la capilla el huasteco km.18 la Guadalupe Ver.",
      "271-219-42-031",
      "PMG110202LL5"
    ];
    
    let yEncabezado = 25; 
  
    elementosEncabezado.forEach((elemento) => {
      const xElemento = (paginaAncho - doc.getTextWidth(elemento)) / 2; 
      doc.text(elemento, xElemento, yEncabezado);
      yEncabezado += 7; // Añadir espacio vertical para la siguiente línea
    });
    
     // AÑADIENDO UNA LINEA ANTES DEL TITULO
     doc.setDrawColor(0);
     doc.setLineWidth(0.1);
     //si quiero ponerlo mas separado solo lo pongo yEncabezado + 3 o 1 o 2
     doc.line(15, yEncabezado , paginaAncho - 15, yEncabezado);
   
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16); 
      const titulo = `Reporte de ventas de: ${this.selectedWeek.name}`;
      const xTitulo = (paginaAncho - doc.getTextWidth(titulo)) / 2;
      doc.text(titulo, xTitulo, 61); 
      // Añadir una línea después del títulO
      doc.line(15, yEncabezado + 12, paginaAncho - 15, yEncabezado + 12);
    
      //AGREGANDO LA GRAFICA EN IMAGEEEEEEENNN
      const imagenAncho = 140; 
        const imagenAlto = 80; 
        const xImagen = (paginaAncho - imagenAncho) / 2; 
        const yImagen = yEncabezado + 20; 
        
      if (this.graficaImagenUrl) {
        doc.addImage(this.graficaImagenUrl, 'PNG', xImagen, yImagen, imagenAncho, imagenAlto);
        let inicioInformacionVentas = yImagen + imagenAlto + 10; 
        paginaAncho = inicioInformacionVentas; 
      
      }
  
      let yPosition = yEncabezado + 20 + imagenAlto + 20; // Posición 'y' después de la gráfica y un margen de 10 mm
     this.ventas.forEach((ventasS, index) => {
      // Verificar si es necesario añadir una nueva página
      if (yPosition > (doc.internal.pageSize.height - 25)) {
        // No hay suficiente espacio, agrega una nueva página
        doc.addPage();
        yPosition = 25; // Restablece la posición Y para el inicio de la nueva página
      }
      doc.setFontSize(10);
       // Encabezado de cada venta
       //OBETENER LA FECHA EN YYYY-MM-DD
        const fechaHoraISO = ventasS.fechaVenta.toString();
        
        // Ahora puedes usar split ya que fechaHoraISO es una cadena:
        const partes = fechaHoraISO.split('T');
        const fecha = partes[0];const horaCompleta = partes[1].split(':');
        const hora = `${horaCompleta[0]}:${horaCompleta[1]}`; // Formato HH:MM
  
       doc.setFont("helvetica", "bold");  
       doc.text(`Venta nº: ${index+1}     Fecha: ${fecha}     Hora: ${hora}`, 15, paginaAncho);
      
       // Calculando el ancho del texto "Total de Venta"
       const totalVentaTexto = `Total de venta: $ ${ventasS.totalPagar}.00`;
       const totalVentaAncho = doc.getTextWidth(totalVentaTexto);
       
       // Calculando la posición x para alinear a la derecha
       const margenDerecho = 15; // Por ejemplo, 10 mm de margen derecho
       const paginaAncho2 = doc.internal.pageSize.getWidth();
       const xTotalVenta = paginaAncho2 - totalVentaAncho - margenDerecho;
       
       // Posicionando "T otal de Venta" a la derecha y al mismo nivel de "Venta ID"
       
       doc.setFont("helvetica", "bold");
       doc.text(totalVentaTexto, xTotalVenta, paginaAncho);;
        
       //NOMBRE DEL EMPLEADO
       paginaAncho += 6;
       const nombreCompletoEmpleado = `${ventasS.empleado?.nombreEmpleado} ${ventasS.empleado?.apellidoPaterno} ${ventasS.empleado?.apellidoMaterno}`;
       doc.setFont("helvetica", "normal");
       doc.text(`Empleado: ${nombreCompletoEmpleado}`, 15, paginaAncho);
  
       //NOMBRE DEL CLIENTE
       paginaAncho += 6; // Espacio después del encabezado de la venta
       const nombreCompletoCliente = `${ventasS.cliente?.nombreCliente} ${ventasS.cliente?.apellidoPaterno} ${ventasS.cliente?.apellidoMaterno}`;
       doc.setFont("helvetica", "normal");
       doc.text(`Cliente: ${nombreCompletoCliente}`, 15, paginaAncho);
  
       paginaAncho += 6; // Espacio después del encabezado de la venta
          
        // Datos para la tabla de detalles
        const detallesColumn = ["Clave","Producto", "Cantidad", "Precio", "Subtotal"];
        const detallesRows = ventasS.detalles.map(detalle => [
          detalle.producto?.clave || 'N/A', 
          detalle.producto?.nombreProducto || 'N/A', // 'N/A' como valor por defecto
          detalle.cantidadProductos || 0,
          detalle.producto?.precio || 0,
          detalle.subTotal || 0,
        ]);
  
        // Añadir tabla de detalles al documento
        autoTable(doc, {
          head: [detallesColumn],
          body: detallesRows,
          startY: paginaAncho,
          headStyles: {
            fillColor: [25, 110, 167], // Color verde en formato RGB // Fuente
            fontStyle: 'bold' // Estilo de fuente en negrita
          },
          bodyStyles: { // Fuente para el cuerpo de la tabla
          },
          didDrawPage: function(data) {
            if (data.cursor) {
              paginaAncho = data.cursor.y + 10; // Actualizar la posición Y después de dibujar la tabla
            }
          }
        });
  
     });
      
     if (this.platform.is('capacitor')) { //si es movil
      // Generar el blob y la URL del blob
        // Generar el blob del PDF
      const pdfOutput = doc.output('blob');
      const data = await new Response(pdfOutput).arrayBuffer();
      const base64 = btoa(new Uint8Array(data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
    
      // Guardar el archivo en el dispositivo
      const fileName = `reporte_ventas_${this.selectedMonth.name}.pdf`;
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Documents,
        recursive: true
      });
    
      // Obtener la URI para el archivo guardado
      const uri = savedFile.uri;
    
      // Abrir el archivo PDF con la aplicación nativa
      this.fileOpener.open(uri, 'application/pdf')
        .then(() => console.log('File is opened'))
        .catch(err => console.error('Error opening file:', err));
    } else {//si es web
      // Guardar el PDF ESCRITORIO
      doc.save(`reporte_ventas_${this.selectedMonth.name}_${this.selectedWeek.name}.pdf`);
      //ABRIR EL PDF EN EL NAVEGADOR 
      //lo estoy abriendo despues de un segundo para esperar a que se ejecute mi alert
      setTimeout(function () {
        window.open(doc.output('bloburl'), '_blank');
      }, 1000);
    }
        

  }

  public alertButtons = [
    {
      text: 'Generar',
      role: 'cancel',
      handler: () => {
        this.generarReporteMensual();
        console.log('Alert canceled');
      },
    },
    {
      text: 'Cancelar',
      role: 'confirm',
      handler: () => {
        console.log('Alert confirmed');
      },
    },
  ];

  setResult(ev: any) {
    console.log(`Dismissed with role: ${ev.detail.role}`);
  }

}
