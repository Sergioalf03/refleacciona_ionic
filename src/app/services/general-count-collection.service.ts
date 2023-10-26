import { Injectable } from '@angular/core';
import { DatabaseService } from '../core/controllers/database.service';
import { SessionService } from '../core/controllers/session.service';

@Injectable({
  providedIn: 'root'
})
export class GeneralCountCollectionService {

  list: any[] = [];

  constructor(
    private databaseService: DatabaseService,
    private sessionService: SessionService,
  ) { }

  save(data: any) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`
      INSERT INTO general_count_auditory_count (general_count_auditory_id, origin, destination, vehicle_type, creation_date, update_date)
      VALUES ("${data.general_count_auditory_id}", "${data.origin}", "${data.destination}", "${data.vehicleType}", "${now}", "${now}");
    `);
  }

  getCount(id: string) {
    return this.databaseService.executeQuery(`
      SELECT COUNT(*) AS total FROM general_count_auditory_count WHERE general_count_auditory_id = ${id};
    `);
  }

  getList(id: string) {
    return this.databaseService.executeQuery(`
      SELECT * FROM general_count_auditory_count WHERE general_count_auditory_id = ${id};
    `);
  }

  delete(id: string) {
    return this.databaseService.executeQuery(`
      DELETE FROM general_count_auditory_count WHERE id = ${id};
    `);
  }
}
