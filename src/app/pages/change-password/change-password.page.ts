import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
})
export class ChangePasswordPage implements OnInit {

  user: any = {};
  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  onChangePwd(formChange: NgForm) {

  }

  onGoingLogin() {
    this.router.navigateByUrl('/login');
  }

}
