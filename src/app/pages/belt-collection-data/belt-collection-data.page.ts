import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { URI_BELT_COUNT_FORM, URI_BELT_COUNT_LIST, URI_BELT_FORM } from 'src/app/core/constants/uris';
import { BeltCollectionService } from 'src/app/services/belt-collection.service';
import { HelmetCollectionService } from 'src/app/services/helmet-collection.service';

@Component({
  selector: 'app-belt-collection-data',
  templateUrl: './belt-collection-data.page.html',
})
export class BeltCollectionDataPage implements OnInit {

  backUrl = URI_BELT_FORM('0');
  registrationCount = 0;
  auditoryId = '0';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private beltCollectionService: BeltCollectionService,
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

    this.registrationCount = this.beltCollectionService.list.length;
  }

  openCountForm() {
    this.router.navigateByUrl(URI_BELT_COUNT_FORM(this.auditoryId));
  }

  onOpenList() {
    this.router.navigateByUrl(URI_BELT_COUNT_LIST(this.auditoryId));
  }

  onReturn() {
    this.router.navigateByUrl(URI_BELT_FORM(this.auditoryId));
  }

}
