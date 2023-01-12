import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recover-account',
  templateUrl: './recover-account.page.html',
  styleUrls: ['./recover-account.page.scss'],
})
export class RecoverAccountPage implements OnInit {

  user:any = {};
  constructor( private router: Router) { }

  ngOnInit() {
  }

  onRecuperar(formRecuperar: NgForm) {

    this.router.navigateByUrl('/code');
  }

}
