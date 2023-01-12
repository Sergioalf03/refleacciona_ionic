import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-send-code-recover',
  templateUrl: './send-code-recover.page.html',
  styleUrls: ['./send-code-recover.page.scss'],
})
export class SendCodeRecoverPage implements OnInit {

  user: any = {};
  constructor( private router: Router) { }

  ngOnInit() {
  }

  onSendCode(formSendCode:NgForm) {

    this.router.navigateByUrl('/change-password');


  }

}
