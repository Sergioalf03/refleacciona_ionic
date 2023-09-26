import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { URI_HELMET_COUNT_FORM, URI_HELMET_LIST } from 'src/app/core/constants/uris';

@Component({
  selector: 'app-helmet-collection-data',
  templateUrl: './helmet-collection-data.page.html'
})
export class HelmetCollectionDataPage implements OnInit {

  backUrl = URI_HELMET_LIST('local');
  registrationCount = 0;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  openCountForm() {
    this.router.navigateByUrl(URI_HELMET_COUNT_FORM('0'));
  }

}
