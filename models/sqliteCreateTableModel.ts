import { SQLiteColumn } from './sqliteColumn';

export class sqliteCreateTableModel {
  public tableName: string;
  public columns: Array<SQLiteColumn>;
}
