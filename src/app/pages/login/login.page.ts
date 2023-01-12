import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  user: any = {};
  constructor( private router:Router) { }

  ngOnInit() {
  }

  onRecuperar() {
    this.router.navigateByUrl('/recover');
  }


  btnLogin( formLogin: NgForm ) {
    console.log(formLogin.value);

    if (formLogin.invalid) { return; }
    
    formLogin.reset();
    this.router.navigateByUrl('/home');
   

  }

  onRegistrar() {
    this.router.navigateByUrl('/register');
  }

}
