export const createSchema: string = `
CREATE TABLE IF NOT EXISTS versions (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    number TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sections (
  id INTEGER PRIMARY KEY NOT NULL,
  uid TEXT NOT NULL,
  name TEXT NOT NULL,
  subname TEXT NOT NULL,
  page INTEGER NOT NULL,
  indx INTEGER NOT NULL,
  status INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS sections_index_name ON sections (name);
CREATE INDEX IF NOT EXISTS sections_index_page ON sections (page);
CREATE INDEX IF NOT EXISTS sections_index_indx ON sections (indx);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY NOT NULL,
  section_id INTEGER NOT NULL,
  uid TEXT NOT NULL,
  sentence TEXT NOT NULL,
  popup TEXT NOT NULL,
  score TEXT NOT NULL,
  cond TEXT,
  answers TEXT NOT NULL,
  has_evidence INTEGER NOT NULL,
  indx INTEGER NOT NULL,
  status INTEGER NOT NULL,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET DEFAULT
);

CREATE INDEX IF NOT EXISTS questions_index_section_id ON questions (section_id);
CREATE INDEX IF NOT EXISTS questions_index_uid ON questions (uid);
CREATE INDEX IF NOT EXISTS questions_index_indx ON questions (indx);

CREATE TABLE IF NOT EXISTS auditories (
  id INTEGER PRIMARY KEY NOT NULL,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  close_note TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  lat TEXT NOT NULL,
  lng TEXT NOT NULL,
  status INTEGER NOT NULL,
  creation_date TEXT NOT NULL,
  update_date TEXT NOT NULL,
  remote_id INTEGER
);

CREATE INDEX IF NOT EXISTS title ON auditories (title);
CREATE INDEX IF NOT EXISTS date ON auditories (date);

CREATE TABLE IF NOT EXISTS auditory_evidences (
  id INTEGER PRIMARY KEY NOT NULL,
  auditory_id INTEGER NOT NULL,
  dir TEXT NOT NULL,
  creation_date TEXT NOT NULL,
  uploaded INTEGER,
  FOREIGN KEY (auditory_id) REFERENCES auditories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS answers (
  id INTEGER PRIMARY KEY NOT NULL,
  auditory_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  value TEXT NOT NULL,
  notes TEXT,
  creation_date TEXT NOT NULL,
  update_date TEXT NOT NULL,
  FOREIGN KEY (auditory_id) REFERENCES auditories(id) ON DELETE CASCADE
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS answer_evidences (
  id INTEGER PRIMARY KEY NOT NULL,
  auditory_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  dir TEXT NOT NULL,
  uploaded INTEGER,
  creation_date TEXT NOT NULL,
  FOREIGN KEY (auditory_id) REFERENCES auditories(id) ON DELETE CASCADE
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);
`;

const SECTION_ROWS: Array<Array<any>> = [
  ['S1', 'CARACTERÍSTICAS DE LA CALLE', '',               1, 1, 1],
  ['S2', 'SEGURIDAD',                   'Tramo de calle', 2, 2, 1],
  ['S3', 'SEGURIDAD',                   'Intersección',   3, 3, 1],
  ['S4', 'ACCESIBILIDAD',               'Tramo de calle', 4, 4, 1],
  ['S5', 'ACCESIBILIDAD',               'Intersección',   5, 5, 1],
  ['S6', 'CONFORT',                     'Tramo de calle', 6, 6, 1],
  ['S7', 'CONFORT',                     'Intersección',   7, 7, 1],
];

const QUESTION_ROWS: Array<Array<any>> = [
  [1, '1',    0, '',       1,  1, 1, 'Nombre de la calle',                      'FREETEXT',   ''],
  [1, '2',    0, '',       1,  2, 1, 'Entre qué calles se encuentra el tramo',  'FREETEXT',   ''],
  [1, '3',    0, '',       1,  3, 1, 'Tipo funcional de calle',                 `${JSON.stringify([{v:1,t:'Acceso controlado (AC)'},{v:2,t:'Avenida (AV)'},{v:3,t:'Colectora (CO)'},{v:4,t:'Calle Local (LO)'}])}`, ''],
  [1, '4',    0, '',       1,  4, 1, 'Sentidos',                                `${JSON.stringify([{v:1,t:'Un solo sentido'},{v:2,t:'Doble sentido'}])}`, ''],
  [1, '5',    0, '1-4-1',  1,  5, 1, 'Número de carriles',                      'ONEDIGIT',   ''],
  [1, '5',    0, '1-4-2',  1,  5, 1, 'Número de carriles por sentido',          'ONEDIGIT',   ''],

  [2, 'S1',   0, '*13',       1,  1, 1, '¿Cuál es la velocidad máxima permitida?',                                                                           `${JSON.stringify([{v:1,t:'AC < 80 km/h'},{v:2,t:'AV < 50 km/h'},{v:3,t:'CO < 40 km/h'},{v:4,t:'LO <30 km/h'}])}`, ''],
  [2, 'S2',   0, '',       1,  2, 1, '¿Cuenta con señales de reducción de velocidad?',                                                                    `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Marcas en pavimento o señales'],
  [2, 'S3.1', 0, '*15',       1,  3, 1, '¿Cuenta con menos de 3 carriles contando franja de estacionamiento?',                                               `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      ''],
  [2, 'S3.2', 0, '',       1,  4, 1, '¿La sección del arrollo vehicular mide 9 metros o menos?',                                                          `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Considerar la distacnia entre guarniciones, o de banqueta a banqueta.'],
  [2, 'S3',   1, '',       1,  5, 1, '¿El diseño del tramo se considera de baja velocidad?',                                                              `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      ''],
  [2, 'S4',   1, '',       1,  6, 1, '¿Cuenta con reductores de velocidad?',                                                                              `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Reductor de velocidad [plataforma/tope/vibrador'],
  [2, 'S5.1', 0, '',       1,  7, 1, '¿Existen accesos a cocheras presentes en el tramo a analizar?',                                                     `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      ''],
  [2, 'S5.2', 0, '2-7-1',  1,  8, 1, 'En caso de existir cocheras, ¿estas tienen una longitud de 6 metros o menos?',                                      `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      ''],
  [2, 'S5.3', 0, '2-7-1',  1,  9, 1, '¿La banqueta mantiene su nivel en los accesos a cocheras?',                                                         `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      ''],
  [2, 'S5.4', 1, '2-7-1',  1, 10, 1, '¿Los accesos a las cocheras son seguros?',                                                                          `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      ''],
  [2, 'S6',   1, '',       1, 11, 1, '¿La banqueta cuenta con protección adicional dada la presencia de ciclovía, estacionamiento o franja de árboles?',  `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      ''],
  [2, 'S7',   1, '',       1, 12, 1, '¿Existe presencia de infraestructura ciclista?',                                                                    `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Ciclovía en avenidas/Ciclocarril en colectoras'],
  [2, 'S8',   1, '',       1, 13, 1, '¿La banqueta cuenta con iluminación nocturna?',                                                                     `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Porcentaje del área peatonal iluminada'],
  [2, 'S9',   1, '',       1, 14, 1, '¿La calle promueve la actividad durante el día?',                                                                   `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Mezcla de usos y fachadas activas'],

  [3, 'S10',  1, '',       1,  1, 1, '¿Existen semáforos que prioricen el cruce de los peatones?',                            `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Semáforo en avenida primaria o colectora'],
  [3, 'S11',  1, '',       1,  2, 1, '¿La geometría de las esquinas prioriza el cruce por encima del giro de los vehículos?', `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Radio de giro < 6 metros [sujeto a la geometría vial'],
  [3, 'S12',  1, '',       1,  3, 1, '¿El número de carriles en cada una de las calles que se intersectan es menor a 3?',     `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Carriles que se cruzan de manera continua < 3'],
  [3, 'S13',  1, '',       1,  4, 1, '¿Las esquinas cuentan con protecciones para peatones? (Bolardos)',                      `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Bolardos en esquinas de avenidas primarias'],
  [3, 'S14',  1, '',       1,  5, 1, '¿El área de la intersección ofrece una libre perspectiva visual?',                      `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Todas las esquinas sin obstáculos a la visibilidad'],
  [3, 'S15',  1, '',       1,  6, 1, '¿El área de la intersección cuenta con iluminación nocturna?',                          `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Todos los cruces peatonales con iluminación nocturna'],

  [4, 'AC1',  1, '',       1,  1, 1, '¿La superficie de la banqueta del tramo es continua?',                                                        `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Ninguna discontinuidad en banqueta para silla de ruedas'],
  [4, 'AC2',  1, '',       1,  2, 1, '¿La textura del pavimento tiene buen agarre, inclusive al humedecerse?',                                      `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Sin puntos de acumulación de agua o pavimento resbaloso'],
  [4, 'AC3',  1, '',       1,  3, 1, '¿La franja por donde se puede caminar libremente en la banqueta, tiene un ancho igual o mayor a 2.5 metros?', `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Sección efectiva de la franja peatonal > 2.5 metros'],
  [4, 'AC4',  1, '',       1,  4, 1, '¿La banqueta está libre de aglomeraciones de personas en las horas de máxima demanda?',                       `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'No hay ningún punto con saturación peatonal en horas de máxima demanda'],
  [4, 'AC5',  1, '',       1,  5, 1, '¿Es posible cruzar con facilidad a media cuadra?',                                                            `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'No existen rejas o barreras que impiden el cruce'],
  [4, 'AC6',  1, '',       1,  6, 1, 'Marcas claras de carriles y sentidos',                                                                        `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Señalamientos de carriles y sentidos'],

  [5, 'AC7',  1, '',       1,  1, 1, '¿Las banquetas, rampas y guarniciones son de buena calidad?',                               `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Son de materiales resistentes y con textura apropiada'],
  [5, 'AC8',  1, '',       1,  2, 1, '¿Las esquinas presentan rampas con pendientes apropiadas que resuelven todos los cruces?',  `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Todas las esquinas son accesibles'],
  [5, 'AC9',  1, '',       1,  3, 1, '¿Las líneas de deseo pueden caminarse libremente?',                                         `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Las trayectorias peatonales de cruce se hacen de manera directa'],
  [5, 'AC10', 1, '',       1,  4, 1, '¿Las cebras peatonales están clara y correctamente pintadas?',                              `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Marcas de rayas de cruce peatonal y línea de alto'],
  [5, 'AC11', 1, '',       1,  5, 1, '¿Los cruces cuentan con guías podotáctiles?',                                               `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Al menos señales de alerta en los bordes de la banqueta antes del cruce.'],
  [5, 'AC12', 1, '',       1,  6, 1, '¿Los cruces cuentan con semáforos auditivos?',                                              `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Superficies podotáctiles y semáforos accesibles'],
  [5, 'AC13', 1, '',       1,  7, 1, 'Diseño intuitivo',                                                                          `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Diseño fácil de comprender para todas las personas'],

  [6, 'CO1',  1, '',       1,  1, 1, '¿La franja peatonal está libre de obstáculos que entorpezcan el caminar?',                                 `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Sin obstáculos fijos o móviles que reducen la sección'],
  [6, 'CO2',  1, '',       1,  2, 1, '¿Existen árboles que cubran del sol más del 50% de la franja peatonal?',                                   `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Franja peatonal > 50% con cobertura de fronda de árboles'],
  [6, 'CO3',  1, '',       1,  3, 1, '¿Existe una franja de jardinera o de árboles?',                                                            `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Franja de área verde o árboles'],
  [6, 'CO4',  1, '',       1,  4, 1, '¿Existen marquesinas o balcones que cubran más del 25% de la franja peatonal?',                            `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Franja peatonal > 25% con techos adosados o balcones'],
  [6, 'CO5',  0, '',       1,  5, 1, '¿Existen paradas de transporte público?',                                                                  `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      ''],
  [6, 'CO6',  1, '6-5-1',  1,  6, 1, '¿Las paradas de transporte público tienen una techumbre que proteja adecuadamente del sol y la lluvia?',   `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Paradas de transporte público con techo'],
  [6, 'CO7',  1, '',       1,  7, 1, '¿Existen espacios de ocio o descanso?',                                                                    `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Bancas, juegos, fuentes, etc. al menos a dos cuadras.'],

  [7, 'CO8',  1, '',       1,  1, 1, '¿Existen obstáculos que entorpezcan el cruce a pie?',         `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Obstáculos como piedras, coladeras, hoyos, botes, postes, etc.'],
  [7, 'CO9',  1, '',       1,  2, 1, '¿El tiempo de espera para cruzar es menor a 30 segundos?',    `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Tiempo bajo de espera para cruzar'],
  [7, 'CO10', 1, '',       1,  3, 1, '¿El tiempo para atravesar el cruce peatonal es suficiente?',  `${JSON.stringify([{v:1,t:'Sí'},{v:2,t:'No'}])}`,      'Tiempo suficiente para cruzar la calle'],
];

export const loadData: string = `
  INSERT INTO sections (uid, name, subname, page, indx, status) VALUES
  ${SECTION_ROWS.map(i => `("${i[0]}", "${i[1]}", "${i[2]}", ${i[3]}, ${i[4]}, ${i[5]})`).join(',')};

  INSERT INTO questions (section_id, uid, score, cond, has_evidence, indx, status, sentence, answers, popup) VALUES
  ${QUESTION_ROWS.map(i => `(${i[0]}, "${i[1]}", ${i[2]}, "${i[3]}", ${i[4]}, ${i[5]}, ${i[6]}, "${i[7]}", '${i[8]}', "${i[9]}")`).join(',')};

  INSERT INTO versions (name, number) VALUES ("ORIGINAL", 1);
`;

export const createFakeSchema: string = `
CREATE TABLE IF NOT EXISTS versions (
    id INTEGER PRIMARY KEY NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    company TEXT,
    size REAL,
    age INTEGER,
    last_modified INTEGER DEFAULT (strftime('%s', 'now'))
);
CREATE TABLE IF NOT EXISTS sections (
  id INTEGER PRIMARY KEY NOT NULL,
  userid INTEGER,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  last_modified INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (userid) REFERENCES users(id) ON DELETE SET DEFAULT
);
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  size INTEGER,
  img BLOB,
  last_modified INTEGER DEFAULT (strftime('%s', 'now'))
);
CREATE TABLE IF NOT EXISTS test56 (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT,
  name1 TEXT
);
CREATE INDEX IF NOT EXISTS users_index_name ON users (name);
CREATE INDEX IF NOT EXISTS users_index_last_modified ON users (last_modified);
CREATE INDEX IF NOT EXISTS messages_index_name ON messages (title);
CREATE INDEX IF NOT EXISTS messages_index_last_modified ON messages (last_modified);
CREATE INDEX IF NOT EXISTS images_index_name ON images (name);
CREATE INDEX IF NOT EXISTS images_index_last_modified ON images (last_modified);
CREATE TRIGGER IF NOT EXISTS users_trigger_last_modified
AFTER UPDATE ON users
FOR EACH ROW WHEN NEW.last_modified <= OLD.last_modified
BEGIN
    UPDATE users SET last_modified= (strftime('%s', 'now')) WHERE id=OLD.id;
END;
CREATE TRIGGER IF NOT EXISTS messages_trigger_last_modified
AFTER UPDATE ON messages
FOR EACH ROW WHEN NEW.last_modified <= OLD.last_modified
BEGIN
    UPDATE messages SET last_modified= (strftime('%s', 'now')) WHERE id=OLD.id;
END;
CREATE TRIGGER IF NOT EXISTS images_trigger_last_modified
AFTER UPDATE ON images
FOR EACH ROW WHEN NEW.last_modified <= OLD.last_modified
BEGIN
    UPDATE images SET last_modified= (strftime('%s', 'now')) WHERE id=OLD.id;
END;
PRAGMA user_version = 1;
`;

// Insert some Users
const row: Array<Array<any>> = [
  ['Whiteley', 'Whiteley.com', 30.2],
  ['Jones', 'Jones.com', 44],
];
export const twoUsers: string = `
DELETE FROM users;
INSERT INTO users (name,email,age) VALUES ("${row[0][0]}","${row[0][1]}",${row[0][2]});
INSERT INTO users (name,email,age) VALUES ("${row[1][0]}","${row[1][1]}",${row[1][2]});
`;
