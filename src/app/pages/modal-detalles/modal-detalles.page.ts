import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Venta } from 'src/app/services/ventas/ventas.service';

@Component({
  selector: 'app-modal-detalles',
  templateUrl: './modal-detalles.page.html',
  styleUrls: ['./modal-detalles.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ModalDetallesPage implements OnInit {
  @Input() venta!: Venta; // Recibe la venta como input

  constructor(private modalCtrl: ModalController) { }
  
  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }
  ngOnInit() {
  }

}
