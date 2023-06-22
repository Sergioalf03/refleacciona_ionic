import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-buttons',
  templateUrl: './header-buttons.component.html',
})
export class HeaderButtonsComponent implements OnInit {

  @Input() homeUrl!: string;
  @Input() backUrl!: string;
  @Input() addUrl!: string;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {}

  onGoingHome() {
    this.router.navigateByUrl(this.homeUrl);
  }

  onAddElement() {
    this.router.navigateByUrl(this.addUrl);
  }

  onGoingBack() {
    this.router.navigateByUrl(this.backUrl);
  }

}
