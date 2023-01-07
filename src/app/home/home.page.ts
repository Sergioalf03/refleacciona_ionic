import { Component, OnInit } from '@angular/core';
import { SessionService } from '../core/controllers/session.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  user = '';
  mail = '';

  constructor(
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.user = this.sessionService.userName;
    this.mail = this.sessionService.userEmail;
  }

  onLogout() {
    this.sessionService.logout()
      .subscribe({
        next: res => console.log(res)
      });
  }

}
