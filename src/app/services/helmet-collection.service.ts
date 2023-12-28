import { Injectable } from '@angular/core';
import { DatabaseService } from '../core/controllers/database.service';
import { SessionService } from '../core/controllers/session.service';

@Injectable({
  providedIn: 'root'
})
export class HelmetCollectionService {

  list: any[] = [];

  constructor(
    private databaseService: DatabaseService,
    private sessionService: SessionService,
  ) { }

  save(data: any) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`
      INSERT INTO helmet_auditory_count (helmet_auditory_id, origin, destination, users_count, helmets_count, creation_date, update_date)
      VALUES ("${data.helmet_auditory_id}", "${data.origin}", "${data.destination}", "${data.helmetlessCount}", "${data.helmetCount}", "${now}", "${now}");
    `);
  }

  update(id: string, data: any) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`
      UPDATE helmet_auditory_count
      SET origin = "${data.origin}", destination = "${data.destination}", users_count = "${data.helmetlessCount}", helmets_count = "${data.helmetCount}", update_date = "${now}"
      WHERE id = ${id};
    `);
  }

  getCount(id: string) {
    return this.databaseService.executeQuery(`
      SELECT COUNT(*) AS total FROM helmet_auditory_count WHERE helmet_auditory_id = ${id};
    `);
    // return this.databaseService.executeQuery(`
    //   SELECT * FROM helmet_auditory_count;
    // `);
  }

  getList(id: string) {
    return this.databaseService.executeQuery(`
      SELECT * FROM helmet_auditory_count WHERE helmet_auditory_id = ${id};
    `);
  }

  delete(id: string) {
    return this.databaseService.executeQuery(`
      DELETE FROM helmet_auditory_count WHERE id = ${id};
    `);
  }

  getByAuditoryId(id: string) {
    return this.databaseService.executeQuery(`
      SELECT * FROM helmet_auditory_count WHERE helmet_auditory_id = ${id} limit 1;
    `);
  }

}
