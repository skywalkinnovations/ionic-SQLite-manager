/* author: kurt
   description: This is a database manager that handles creation of tables and saves and cruds
   version:2
   Date created: 12/6/2017
   build on: https://github.com/mirkonasato/ionix-sqlite

   example to call methods:
   import { DatabaseManagerService } from '../../services/database-manager';
   constructor:    public _dbService: DatabaseManagerService
   method:

   this._dbService.insertRecordOrSaveBatch('hymnbook',result.hymbooks).then(result => {
   //do nothing
      },
   error => {
   console.error("Error : " + error.message);
   });

   */
import { Injectable } from '@angular/core';
import { SqlDatabase } from 'ionix-sqlite';
import { sqliteCreateTableModel } from '../models/SQLiteCreateTableModel'
import { SqlResultSet } from 'ionix-sqlite/SqlResultSet';


@Injectable()
export class DatabaseManagerService {
  public databaseName: string = "difelahymns.db";
  private dbPromise: Promise<SqlDatabase>;

  constructor() {
    this.createTablesIfNotExist();
  }

  public createTable = (SQLiteCreateTable, constraint: string): void => {

    let columnQuery: string = "";
    if (SQLiteCreateTable.columns && SQLiteCreateTable.columns.length) {
      SQLiteCreateTable.columns.forEach(column => {
        columnQuery += column.name + ' ' + column.dataType + ',';
      });

      columnQuery = columnQuery.replace(/,\s*$/, "");

      let sqlQuery: string = "CREATE TABLE if not exists " + SQLiteCreateTable.tableName + " (" + columnQuery + (constraint ? ', ' + constraint : '') + ")";

      console.log("%cQuery EXECUTED: " + sqlQuery, "background: #222; color: #bada55");
      this.dbPromise = SqlDatabase.open(this.databaseName, [sqlQuery])
    }
    else {
      console.log('%cPlease specify columns for the table create...', "background: #222; color: #bada55");
    }

  };

  public insertRecordOrSaveBatch = (tableName: string, data: Array<object>): Promise<SqlResultSet> => {
    if (data && data.length) {
      let columns: string = Object.keys(data[0]).toString();
      let generatedValueString: string = "";
      data.forEach(record => {
        //Object.values doesnt exist in typescript, ES2017 will have it
        let recordValues = Object.keys(record).map(key => record[key]);
        generatedValueString += '(' + recordValues.map((value) => {
          if (typeof value === "object") {//incase its an object array
            return "'" + JSON.stringify(value) + "'";
          }
          else {
            return "'" + (value ? value : null) + "'";
          }

        }) + '),';
      });
      generatedValueString = generatedValueString.replace(/,\s*$/, "");
      let sqlQuery: string = "INSERT INTO " + tableName + " (" + columns + ") VALUES " + generatedValueString;
      console.log("%cQuery EXECUTED: " + sqlQuery, "background: #222; color: #bada55");
      return this.dbPromise
        .then(db => db.execute(sqlQuery))
        .then(resultSet => {
          console.log("%cQuery EXECUTED: " + sqlQuery + " (async callback)", "background: #222; color: #bada55");
          console.log("%cExecuted:rowsAffected = " + resultSet.rowsAffected, "background: #222; color: #bada55");
          return resultSet;
        });
    }
  };

  public updateRecord = (tableName: string, data: Array<object>, whereClause: string): Promise<SqlResultSet> => {
    if (data && data.length) {
      let columns: string = Object.keys(data[0]).toString();
      let generatedValueString: string = "";
      data.forEach(record => {
        //Object.values doesnt exist in typescript, ES2017 will have it
        Object.keys(record).map(key => {
          generatedValueString += key + " = " + "'" + record[key] + "',"
        });
        generatedValueString = generatedValueString.replace(/,\s*$/, "");//replace last comma with blank
      });
      generatedValueString = generatedValueString.replace(/,\s*$/, "");
      let sqlQuery: string = "UPDATE " + tableName + " SET " + generatedValueString + " WHERE " + whereClause;
      console.log("%cQuery EXECUTED: " + sqlQuery, "background: #222; color: #bada55");
      return this.dbPromise
        .then(db => db.execute(sqlQuery))
        .then(resultSet => {
          console.log("%cQuery EXECUTED: " + sqlQuery + " (async callback)", "background: #222; color: #bada55");
          console.log("%cExecuted:rowsAffected = " + resultSet.rowsAffected, "background: #222; color: #bada55");
          return resultSet;
        });
    }
  };


  public deleteRecord = (tableName: string, whereClause: string): Promise<SqlResultSet> => {
    let sqlQuery: string = "DELETE FROM " + tableName + " WHERE " + whereClause;
    console.log("%cQuery EXECUTED: " + sqlQuery, "background: #222; color: #bada55");
    return this.dbPromise
      .then(db => db.execute(sqlQuery))
      .then(resultSet => {
        console.log("%cQuery EXECUTED: " + sqlQuery + " (async callback)", "background: #222; color: #bada55");
        console.log("%cExecuted:rowsAffected = " + resultSet.rowsAffected, "background: #222; color: #bada55");
        return resultSet;
      });
  }

  public removeAll = (tableName: string): Promise<SqlResultSet> => {
    let sqlQuery: string = "DELETE FROM " + tableName;
    console.log("%cQuery EXECUTED: " + sqlQuery, "background: #222; color: #bada55");
    return this.dbPromise
      .then(db => db.execute(sqlQuery))
      .then(resultSet => {
        console.log("%cQuery EXECUTED: " + sqlQuery + " (async callback)", "background: #222; color: #bada55");
        console.log("%cExecuted:rowsAffected = " + resultSet.rowsAffected, "background: #222; color: #bada55");
        return resultSet;
      });
  }


  public select(tableName: string, whereClause: string): Promise<Array<object>> {
    let sqlQuery: string = "SELECT * FROM " + tableName + " WHERE " + whereClause;
    console.log("%cQuery EXECUTED: " + sqlQuery, "background: #222; color: #bada55");
    return this.dbPromise
      .then(db => db.execute(sqlQuery))
      .then(resultSet => {
        const items = [];
        for (let i = 0; i < resultSet.rows.length; i++) {
          const row = resultSet.rows.item(i);
          items.push(row);
        }
        console.log("%cQuery EXECUTED: " + sqlQuery + " (async callback)", "background: #222; color: #bada55");
        console.log("%cExecuted:rowsAffected = " + resultSet.rowsAffected, "background: #222; color: #bada55");
        //console.log(items);
        //alert(JSON.stringify(items));
        return items;
      });
  }

  public selectAll(tableName: string): Promise<Array<object>> {
    let sqlQuery: string = "SELECT * FROM " + tableName;
    console.log("%cQuery EXECUTED: " + sqlQuery, "background: #222; color: #bada55");
    return this.dbPromise
      .then(db => db.execute(sqlQuery))
      .then(resultSet => {
        const items = [];
        for (let i = 0; i < resultSet.rows.length; i++) {
          const row = resultSet.rows.item(i);
          items.push(row);
        }
        console.log("%cQuery EXECUTED: " + sqlQuery + " (async callback)", "background: #222; color: #bada55");
        console.log("%cExecuted:rowsAffected = " + resultSet.rowsAffected, "background: #222; color: #bada55");
        //console.log(items);
        //alert(JSON.stringify(items));
        return items;
      });
  }

  public queryRunner = (userSqlQuery: string): Promise<SqlResultSet> => {
    let sqlQuery: string = userSqlQuery;
    console.log("%cQuery EXECUTED: " + sqlQuery, "background: #222; color: #bada55");
    return this.dbPromise
      .then(db => db.execute(sqlQuery))
      .then(resultSet => {
        console.log("%cQuery EXECUTED: " + sqlQuery + " (async callback)", "background: #222; color: #bada55");
        console.log("%cExecuted:rowsAffected = " + resultSet.rowsAffected, "background: #222; color: #bada55");
        return resultSet;
      });
  }

  public getCount = (tableName: string, whereClause: string): Promise<SqlResultSet> => {
    let sqlQuery: string = "SELECT COUNT (*) FROM " + tableName + " WHERE " + whereClause;
    console.log("%cQuery EXECUTED: " + sqlQuery, "background: #222;color: #bada55");
    return this.dbPromise
      .then(db => db.execute(sqlQuery))
      .then(resultSet => {
        console.log("%cQuery EXECUTED: " + sqlQuery + " (async callback)", "background: #222; color: #bada55");

        return resultSet;
      });
  }

  public createTablesIfNotExist = (): void => {
    const hymnbookTable: sqliteCreateTableModel = {
      tableName: "hymnbooklist",
      columns: [
        { name: "bookNumber",dataType: "INTEGER" },
        { name: "description",dataType: "TEXT" },
        { name: "hymnBookURL",dataType: "TEXT" },
        { name: "sequenceNumber",dataType: "INTEGER" }
      ]
    };
    const hymnlistTable: sqliteCreateTableModel = {
      tableName: "hymnlist",
      columns: [
        { name: "bookNumber",dataType: "INTEGER" },
        { name: "hymnNumber",dataType: "INTEGER" },
        { name: "title", dataType: "TEXT" },
        { name: "hymnURL", dataType: "TEXT" },
        { name: "sequenceNumber",dataType: "INTEGER" }
      ]
    };

    const hymnTable: sqliteCreateTableModel = {
      tableName: "hymns",
      columns: [
        { name: "version",dataType: "INTEGER" },
        { name: "hymnNumber",dataType: "INTEGER" },
        { name: "bookNumber",dataType: "INTEGER" },
        { name: "title",dataType: "TEXT" },
        { name: "author", dataType: "TEXT" },
        { name: "content",dataType: "TEXT" },
        { name: "sequenceNumber",dataType: "INTEGER" }
      ]
    };
    const versionControlTable: sqliteCreateTableModel = {
      tableName: "versionControl",
      columns: [
        { name: "key",dataType: "TEXT" },
        { name: "value",dataType: "INTEGER" }
      ]
    };

    const favouriteTable: sqliteCreateTableModel = {
      tableName: "favourite",
      columns: [
        { name: "hymnNumber", dataType: "INTEGER" },
        { name: "bookNumber", dataType: "INTEGER" },
        { name: "title", dataType: "TEXT" },
        { name: "author",dataType: "TEXT" },
        { name: "createdDateStamp",dataType: "TEXT" },
        { name: "syncedToServer",dataType: "INTEGER NOT NULL DEFAULT 0" },
        { name: "userId",dataType: "INTEGER"} ,
        { name: "username",dataType: "TEXT" }
      ]
    };

    const noteTable: sqliteCreateTableModel = {
      tableName: "note",
      columns: [
        { name: "noteId", dataType: "INTEGER PRIMARY KEY" },
        { name: "bookNumber", dataType: "INTEGER" },
        { name: "hymnNumber", dataType: "INTEGER" },
        { name: "hymnTitle", dataType: "TEXT" },
        { name: "verseIndex", dataType: "INTEGER NOT NULL DEFAULT 0" },
        { name: "noteTitle", dataType: "TEXT" },
        { name: "noteDescription", dataType: "TEXT" },
        { name: "syncedToServer",dataType: "INTEGER NOT NULL DEFAULT 0" },
        { name: "createdDateStamp",dataType: "TEXT" },
        { name: "userId",dataType: "INTEGER"} ,
        { name: "username",dataType: "TEXT" }
      ]
    };

    const highlightCategoryTable: sqliteCreateTableModel = {
      tableName: "highlightCategory",
      columns: [
        { name: "categoryId",dataType: "INTEGER PRIMARY KEY" },
        { name: "categoryKey",dataType: "TEXT" },
        { name: "color",dataType: "INTEGER" }
      ]
    };

    const highlightTable: sqliteCreateTableModel = {
      tableName: "highlight",
      columns: [
        { name: "highlightId",dataType: "INTEGER PRIMARY KEY" },
        { name: "bookNumber", dataType: "INTEGER" },
        { name: "hymnNumber", dataType: "INTEGER" },
        { name: "title", dataType: "TEXT" },
        { name: "author", dataType: "TEXT" },
        { name: "createdDateStamp",dataType: "TEXT" },
        { name: "userId",dataType: "INTEGER"} ,
        { name: "username",dataType: "TEXT" },
        { name: "verseIndex", dataType: "INTEGER NOT NULL DEFAULT 0" },
        { name: "categoryId", dataType: "INTEGER" },
        { name: "categoryKey", dataType: "TEXT" },
        { name: "syncedToServer",dataType: "INTEGER NOT NULL DEFAULT 0" }
      ]
    };

    const userHighlightCategoryTable: sqliteCreateTableModel = {
      tableName: "userHighlightCategory",
      columns: [
        { name: "label",dataType: "TEXT" },
        { name: "userId",dataType: "INTEGER"} ,
        { name: "username",dataType: "TEXT" },
        { name: "createdDateStamp",dataType: "TEXT" },
        { name: "categoryId",dataType: "INTEGER" },
        { name: "categoryKey",dataType: "TEXT" },
        { name: "syncedToServer",dataType: "INTEGER NOT NULL DEFAULT 0" }
      ]
    };

    this.createTable(hymnbookTable, null);
    this.createTable(hymnlistTable, null);
    this.createTable(hymnTable, null);
    this.createTable(versionControlTable, 'UNIQUE (key) ON CONFLICT REPLACE');
    this.createTable(favouriteTable, 'UNIQUE (hymnNumber,bookNumber,userId) ON CONFLICT REPLACE');
    this.createTable(noteTable, 'UNIQUE (hymnNumber,bookNumber,UserId,noteTitle,noteDescription) ON CONFLICT REPLACE');
    this.createTable(highlightCategoryTable,null);
    this.createTable(highlightTable,'UNIQUE (userId,hymnNumber,bookNumber,verseIndex) ON CONFLICT REPLACE');
    this.createTable(userHighlightCategoryTable,'UNIQUE (userId,categoryId,categoryKey) ON CONFLICT REPLACE');

  /* this is stubbed data to test the different generic CRUD methods
 this.removeAll('hymns');
 this.insertRecordOrSaveBatch('hymns',[
   {
     bookNumber: 1,
     description: "Lifela tsa Sione",
     hymnBookURL: "./assets/jsonfiles/LifelaTsaSione.json",
     sequenceNumber: 1
   },
   {
     bookNumber: 2,
     description: "Lifela tsa sd sd Sione",
     hymnBookURL: "./assets/jsonfiles/LifelaTsaSione.json",
     sequenceNumber: 1
   },
   {
     bookNumber: 3,
     description: "erttt one",
     hymnBookURL: "./assets/jsonfiles/LifelaTsaSione.json",
     sequenceNumber: 1
   }
 ]);
 this.deleteRecord('hymns',"bookNumber = 1");
 this.selectAll('hymns');
 this.select('hymns',"bookNumber = 2");
 this.queryRunner('Update hymns set description = "hi" where bookNumber = 2');
 this.updateRecord('hymns',[
   {
     bookNumber: 1,
     description: "hello",
     hymnBookURL: "its me",
     sequenceNumber: 1
   },
 ],"bookNumber = 2");
 */
}

}
