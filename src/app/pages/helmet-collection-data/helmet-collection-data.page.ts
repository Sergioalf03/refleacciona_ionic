import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { URI_HELMET_COLLECION_DETAIL, URI_HELMET_COUNT_FORM, URI_HELMET_COUNT_LIST, URI_HELMET_LIST } from 'src/app/core/constants/uris';
import { HelmetCollectionService } from 'src/app/services/helmet-collection.service';

@Component({
  selector: 'app-helmet-collection-data',
  templateUrl: './helmet-collection-data.page.html'
})
export class HelmetCollectionDataPage implements OnInit {

  backUrl = URI_HELMET_LIST('local');
  registrationCount = 0;
  auditoryId = '0';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private helmetCollectionService: HelmetCollectionService,
  ) { }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.activatedRoute
      .paramMap
      .subscribe({
        next: paramMap => {
          this.auditoryId = paramMap.get('id') || '0';
        }
      });

    this.registrationCount = this.helmetCollectionService.list.length;
  }

  openCountForm() {
    this.router.navigateByUrl(URI_HELMET_COUNT_FORM(this.auditoryId));
  }

  onOpenList() {
    this.router.navigateByUrl(URI_HELMET_COUNT_LIST(this.auditoryId));
  }

  onReturn() {
    this.router.navigateByUrl(URI_HELMET_LIST('local'));
  }

}
