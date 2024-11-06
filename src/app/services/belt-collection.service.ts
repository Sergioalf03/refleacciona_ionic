import { Injectable } from '@angular/core';
import { DatabaseService } from '../core/controllers/database.service';
import { SessionService } from '../core/controllers/session.service';

@Injectable({
  providedIn: 'root'
})
export class BeltCollectionService {

  list: any[] = [];

  constructor(
    private databaseService: DatabaseService,
    private sessionService: SessionService,
  ) { }

  save(data: any) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`
      INSERT INTO belt_auditory_count (belt_auditory_id, origin, destination, adults_count, belts_count, child_count, chairs_count, coopilot, overuse_count, vehicle_type, creation_date, update_date)
      VALUES ("${data.belt_auditory_id}", "${data.origin}", "${data.destination}", "${data.beltUserCount}", "${data.beltCount}", "${data.chairUserCount}", "${data.chairCount}", "0", "0", "${data.vehicleType}", "${now}", "${now}");
    `);
  }

  update(id: string, data: any) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`
      UPDATE belt_auditory_count
      SET origin = "${data.origin}", destination = "${data.destination}", adults_count = "${data.beltUserCount}", belts_count = "${data.beltCount}", child_count = "${data.chairUserCount}", chairs_count = "${data.chairCount}", update_date = "${now}"
      WHERE id = ${id};
    `);
  }

  getCount(id: string) {
    return this.databaseService.executeQuery(`
      SELECT COUNT(*) AS total FROM belt_auditory_count WHERE belt_auditory_id = ${id};
    `);
    // return this.databaseService.executeQuery(`
    //   SELECT * FROM belt_auditory_count;
    // `);
  }

  getList(id: string) {
    return this.databaseService.executeQuery(`
      SELECT * FROM belt_auditory_count WHERE belt_auditory_id = ${id};
    `);
  }

  delete(id: string) {
    return this.databaseService.executeQuery(`
      DELETE FROM belt_auditory_count WHERE id = ${id};
    `);
  }

  getByAuditoryId(id: string) {
    return this.databaseService.executeQuery(`
      SELECT * FROM belt_auditory_count WHERE belt_auditory_id = ${id} limit 1;
    `);
  }
}
