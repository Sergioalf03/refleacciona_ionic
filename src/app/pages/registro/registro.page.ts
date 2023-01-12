import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

  user: any = {};
  constructor() { }

  ngOnInit() {
  }
  onRegister( formRegister: NgForm ) {

  }

}
