import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from './core/controllers/session.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  constructor(
    private sessionService: SessionService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // const actualUrl = window.location.href.split('#')[1] ? window.location.href.split('#')[1] : '/na/login';
    // this.sessionService
    //   .intializeProtection()
    //   .subscribe({
    //     next: () => {
          this.sessionService
            .login()
            .subscribe({
              next: res => {
                console.log(res)
                this.sessionService
                  .getUser(res.data.token.plainTextToken)
                  .subscribe({
                    next: () => {
                      // if (actualUrl.includes('login') || actualUrl.includes('check-session')) {
                      //   this.router.navigateByUrl('/app/home');
                      // } else {
                      //   this.router.navigateByUrl(actualUrl);
                      // }
                    },
                    error: err => {
                      // if (actualUrl.includes('app') || actualUrl.includes('check-session')) {
                      //   this.router.navigateByUrl('/login');
                      // } else {
                      //   this.router.navigateByUrl(actualUrl);
                      // }
                    },
                  });
              },
              error: err => console.log(err),
            })
      //   }
      // });


  //   if (!actualUrl || !actualUrl.includes('user-confirm')) {
  //     this.router.navigateByUrl('/na/check-session');

  //     this.sessionService
  //       .getUser()
  //       .subscribe({
  //         next: () => {
  //           if (actualUrl.includes('login') || actualUrl.includes('check-session')) {
  //             this.router.navigateByUrl('/app/home');
  //           } else {
  //             this.router.navigateByUrl(actualUrl);
  //           }
  //         },
  //         error: err => {
  //           if (actualUrl.includes('app') || actualUrl.includes('check-session')) {
  //             this.router.navigateByUrl('/login');
  //           } else {
  //             this.router.navigateByUrl(actualUrl);
  //           }
  //         },
  //       });
  //   }
  }

}
