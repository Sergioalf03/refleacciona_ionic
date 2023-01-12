import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit {

  user: any = {};
  constructor() { }

  ngOnInit() {
  }

  onChangePwd(formChange: NgForm) {

  }

}
