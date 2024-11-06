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

  save(id: string, data: any[]) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`
      INSERT INTO general_count_auditory_count (
        general_count_auditory_id, count1, count2, count3, count4, count5, count6, count7, count8, count9, count10, count11, count12, creation_date, update_date)
        VALUES ("${id}", "${data[0]}", "${data[1]}", "${data[2]}", "${data[3]}", "${data[4]}", "${data[5]}", "${data[6]}", "${data[7]}", "${data[8]}", "${data[9]}", "${data[10]}", "${data[11]}", "${now}", "${now}");
    `);
  }

  update(id: string, data: any[]) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`
      UPDATE general_count_auditory_count SET
        count1 = "${data[0]}",
        count2 = "${data[1]}",
        count3 = "${data[2]}",
        count4 = "${data[3]}",
        count5 = "${data[4]}",
        count6 = "${data[5]}",
        count7 = "${data[6]}",
        count8 = "${data[7]}",
        count9 = "${data[8]}",
        count10 = "${data[9]}",
        count11 = "${data[10]}",
        count12 = "${data[11]}",
        update_date = "${now}"
        WHERE id = id;
    `);
  }

  getCountForm(id: string) {
    return this.databaseService.executeQuery(`
    SELECT * FROM general_count_auditory_count WHERE general_count_auditory_id = ${id} limit 1;
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
