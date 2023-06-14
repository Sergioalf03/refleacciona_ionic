export const createSchema: string = `
CREATE TABLE IF NOT EXISTS versions (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    number TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sections (
  id INTEGER PRIMARY KEY NOT NULL,
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
  score TEXT NOT NULL,
  condition TEXT,
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
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  lat TEXT NOT NULL,
  lng TEXT NOT NULL,
  status INTEGER NOT NULL,
  creationDate TEXT NOT NULL,
  updateDate TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS title ON auditories (title);
CREATE INDEX IF NOT EXISTS date ON auditories (date);

CREATE TABLE IF NOT EXISTS auditory_evidences (
  id INTEGER PRIMARY KEY NOT NULL,
  auditory_id INTEGER NOT NULL,
  dir TEXT NOT NULL,
  creationDate TEXT NOT NULL,
  FOREIGN KEY (auditory_id) REFERENCES auditories(id) ON DELETE SET DEFAULT
);
`;

const SECTION_ROWS: Array<Array<any>> = [
  ['CARACTERÍSTICAS DE LA CALLE', '',               1, 1, 0, 1],
  ['SEGURIDAD',                   'Tramo de calle', 2, 2, 0, 1],
  ['SEGURIDAD',                   'Intersección',   3, 3, 0, 1],
  ['ACCESIBILIDAD',               'Tramo de calle', 4, 4, 0, 1],
  ['ACCESIBILIDAD',               'Intersección',   5, 5, 0, 1],
  ['CONFORT',                     'Tramo de calle', 6, 6, 0, 1],
  ['CONFORT',                     'Intersección',   7, 7, 0, 1],
];

const QUESTION_ROWS: Array<Array<any>> = [
  [1, '1', 0, '',       1, 1, 1, 'Nombre de la calle',                      'FREETEXT'],
  [1, '2', 0, '',       1, 2, 1, 'Entre qué calles se encuentra el tramo',  'FREETEXT'],
  [1, '3', 0, '',       1, 3, 1, 'Tipo funcional de calle',                 `[{v:1,t:'Acceso controlado (AC)'},{v:2,t:'Avenida (AV)'},{v:3,t:'Colectora (CO)'},{v:3,t:'Calle Local (LO)'}]`],
  [1, '4', 0, '',       1, 4, 1, 'Sentidos',                                `[{v:1,t:'Un solo sentido'},{v:2,t:'Doble sentido'}]`],
  [1, '5', 0, '1-4-1',  1, 5, 1, 'Número de carriles',                      'ONEDIGIT'],
  [1, '5', 0, '1-4-2',  1, 5, 1, 'Número de carriles por sentido',          'ONEDIGIT'],
];

export const loadData: string = `
  INSERT INTO sections (name, subname, page, indx, status) VALUES
  ${SECTION_ROWS.map(i => `("${i[0]}", "${i[1]}", ${i[2]}, ${i[3]}, ${i[4]})`).join(',')};

  INSERT INTO questions (section_id, uid, score, condition, has_evidence, indx, status, sentence, answers) VALUES
  ${QUESTION_ROWS.map(i => `(${i[0]}, "${i[1]}", ${i[2]}, "${i[3]}", ${i[4]}, ${i[5]}, ${i[6]}, "${i[7]}", "${i[8]}")`).join(',')};

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
