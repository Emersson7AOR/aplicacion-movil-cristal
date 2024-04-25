import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-prueba2',
  templateUrl: './prueba2.page.html',
  styleUrls: ['./prueba2.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class Prueba2Page implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
