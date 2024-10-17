import sqlite3 from 'sqlite3';
import path from 'path';
import { ipcMain } from 'electron';

// Open the database connection
const dbPath = path.join(__dirname, 'test.db');
const db = new sqlite3.Database(dbPath);


const MAX_VEHICLES_PER_USER = 25;
const MAX_ADJUSTERS_PER_SHOCK = 10;
const MAX_ADJUSTER_MAX = 100;
const MAX_SHOCK_SETS_PER_VEHICLE = 25;

// Function to handle database queries
export const handleQueryDatabase = () => { 
  ipcMain.handle('query-database', async (event, query) => {
    return new Promise((resolve, reject) => {
      db.all(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  });
};

export const handleInsertData = () => {
  ipcMain.handle('insert-data', async (event, data) => {
    return new Promise((resolve, reject) => {
      const checkQuery = `SELECT COUNT(*) AS vehicleCount FROM Vehicles WHERE User_ID = ?`;

      // Check the current vehicle count for the user
      db.get(checkQuery, [data.User_ID], (err, row) => {
        if (err) {
          reject(err);
        } else if ((row as { vehicleCount: number }).vehicleCount >= MAX_VEHICLES_PER_USER) {
          reject(new Error(`User already has the maximum of ${MAX_VEHICLES_PER_USER} vehicles`));
        } else {
          // Proceed with inserting the new vehicle if limit is not reached
          const query = `INSERT INTO Vehicles (User_ID, Vehicle_Type_ID, Nickname_ID, Nickname, Make, Model, Year) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`;
          db.run(
            query,
            [
              data.User_ID,
              data.Vehicle_Type_ID,
              data.Nickname_ID,
              data.Nickname,
              data.Make,
              data.Model,
              data.Year,
            ],
            (err) => {
              if (err) reject(err);
              else resolve('Vehicle data inserted successfully');
            },
          );
        }
      });
    });
  });
};


// Function to handle delete data
export const handleDeleteData = () => {
  ipcMain.handle('delete-data', async (event, id) => {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM Vehicles WHERE Nickname_ID = ?`;
      db.run(query, [id], (err) => {
        if (err) reject(err);
        else resolve('Vehicle data deleted successfully');
      });
    });
  });
};

// Function to handle update data
export const handleUpdateData = () => {
  ipcMain.handle('update-data', async (event, data) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE Vehicles 
                     SET User_ID = ?, Vehicle_Type_ID = ?, Nickname = ?, Make = ?, Model = ?, Year = ? 
                     WHERE Nickname_ID = ?`;
      db.run(
        query,
        [
          data.User_ID,
          data.Vehicle_Type_ID,
          data.Nickname,
          data.Make,
          data.Model,
          data.Year,
          data.Nickname_ID,
        ],
        (err) => {
          if (err) reject(err);
          else resolve('Vehicle data updated successfully');
        },
      );
    });
  });
};

// Function to query all Shock Sets
export const handleQueryShockSets = () => {
  ipcMain.handle('query-shock-sets', async (event, query) => {
    return new Promise((resolve, reject) => {
      db.all(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  });
};


export const handleInsertShockSet = () => {
  ipcMain.handle('insert-shock-set', async (event, data) => {
    return new Promise((resolve, reject) => {
      // Check how many Shock Sets are already associated with the given Vehicle_ID
      const countQuery = `SELECT COUNT(*) AS shockSetCount FROM Shocks_Set WHERE Vehicle_ID = ?`;

      db.get(countQuery, [data.Vehicle_ID], (err, row) => {
        if (err) {
          reject(err);
        } else if ((row as { shockSetCount: number }).shockSetCount >= MAX_SHOCK_SETS_PER_VEHICLE) {
          // If the number of Shock Sets exceeds the limit, reject the insertion
          reject(new Error(`Vehicle already has the maximum of ${MAX_SHOCK_SETS_PER_VEHICLE} Shock Sets.`));
        } else {
          // Proceed with inserting the new Shock Set if the limit is not reached
          const query = `INSERT INTO Shocks_Set (Shock_Set_ID, User_ID, Vehicle_ID, Shock_Set_Nickname) 
                         VALUES (?, ?, ?, ?)`;
          db.run(
            query,
            [
              data.Shock_Set_ID,
              data.User_ID,
              data.Vehicle_ID,
              data.Shock_Set_Nickname,
            ],
            (err) => {
              if (err) reject(err);
              else resolve('Shock Set inserted successfully');
            },
          );
        }
      });
    });
  });
};


// Function to update an existing Shock Set
export const handleUpdateShockSet = () => {
  ipcMain.handle('update-shock-set', async (event, data) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE Shocks_Set 
                     SET User_ID = ?, Vehicle_ID = ?, Shock_Set_Nickname = ? 
                     WHERE Shock_Set_ID = ?`;
      db.run(
        query,
        [
          data.User_ID,
          data.Vehicle_ID,
          data.Shock_Set_Nickname,
          data.Shock_Set_ID,
        ],
        (err) => {
          if (err) reject(err);
          else resolve('Shock Set updated successfully');
        },
      );
    });
  });
};

// Function to delete a Shock Set by ID
export const handleDeleteShockSet = () => {
  ipcMain.handle('delete-shock-set', async (event, id) => {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM Shocks_Set WHERE Shock_Set_ID = ?`;
      db.run(query, [id], (err) => {
        if (err) reject(err);
        else resolve('Shock Set deleted successfully');
      });
    });
  });
};

export const handleInsertShock = () => {
  ipcMain.handle('insert-shock', async (event, data) => {
    return new Promise((resolve, reject) => {
      if (data.Adjuster_Amount > MAX_ADJUSTERS_PER_SHOCK) {
        reject(new Error('Adjuster amount cannot exceed 10.'));
      } else {
        const query = `INSERT INTO Shocks (Shock_Set_ID, Shock_Brand, Shock_Name, Shock_Location, isAdjustable, Adjuster_Amount) 
                       VALUES (?, ?, ?, ?, ?, ?)`;
        db.run(
          query,
          [
            data.Shock_Set_ID,
            data.Shock_Brand,
            data.Shock_Name,
            data.Shock_Location,
            data.isAdjustable,
            data.Adjuster_Amount,
          ],
          (err) => {
            if (err) reject(err);
            else resolve('Shock inserted successfully');
          },
        );
      }
    });
  });
};

export const handleUpdateShock = () => {
  ipcMain.handle('update-shock', async (event, data) => {
    return new Promise((resolve, reject) => {
      if (data.Adjuster_Amount > 10) {
        reject(new Error('Adjuster amount cannot exceed 10.'));
      } else {
        const query = `UPDATE Shocks 
                       SET Shock_Brand = ?, Shock_Name = ?, Shock_Location = ?, isAdjustable = ?, Adjuster_Amount = ? 
                       WHERE Shock_ID = ?`;
        db.run(
          query,
          [
            data.Shock_Brand,
            data.Shock_Name,
            data.Shock_Location,
            data.isAdjustable,
            data.Adjuster_Amount,
            data.Shock_ID,
          ],
          (err) => {
            if (err) reject(err);
            else resolve('Shock updated successfully');
          },
        );
      }
    });
  });
};


// Function to delete a Shock by ID
export const handleDeleteShock = () => {
  ipcMain.handle('delete-shock', async (event, id) => {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM Shocks WHERE Shock_ID = ?`;
      db.run(query, [id], (err) => {
        if (err) reject(err);
        else resolve('Shock deleted successfully');
      });
    });
  });
};

// Function to query all Shocks for a specific Shock Set
export const handleQueryShocks = () => {
  ipcMain.handle('query-shocks', async (event, shockSetId) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM Shocks WHERE Shock_Set_ID = ?`;
      db.all(query, [shockSetId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  });
};

export const handleInsertAdjuster = () => {
  ipcMain.handle('insert-adjuster', async (event, data) => {
    return new Promise((resolve, reject) => {
      // Query to get the current number of adjusters for the given Shock_ID
      const countQuery = `SELECT COUNT(*) AS adjusterCount FROM Adjusters WHERE Shock_ID = ?`;
      
      db.get(countQuery, [data.Shock_ID], (err, row) => {
        if (err) {
          reject(err);
        } else {
          // Query to get the maximum allowed adjusters for the Shock_ID from the Shocks table
          const maxAdjustersQuery = `SELECT Adjuster_Amount FROM Shocks WHERE Shock_ID = ?`;
          
          db.get(maxAdjustersQuery, [data.Shock_ID], (err, shock) => {
            if (err) {
              reject(err);
            } else if (((row as { adjusterCount: number }).adjusterCount || 0) >= ((shock as { Adjuster_Amount: number }).Adjuster_Amount)) {
              reject(new Error(`Cannot add more adjusters. Maximum allowed is ${(shock as { Adjuster_Amount: number }).Adjuster_Amount}.`));
            } else {
              // Proceed to insert the new adjuster if the limit is not reached
              const insertQuery = `INSERT INTO Adjusters (Shock_ID, Adjuster_ID, Adjuster_Nickname, Adjuster_Type, Adjuster_Max) 
                                   VALUES (?, ?, ?, ?, ?)`;
              db.run(
                insertQuery,
                [
                  data.Shock_ID,
                  data.Adjuster_ID,
                  data.Adjuster_Nickname,
                  data.Adjuster_Type,
                  data.Adjuster_Max,
                ],
                (err) => {
                  if (err) reject(err);
                  else resolve('Adjuster inserted successfully');
                },
              );
            }
          });
        }
      });
    });
  });
};





// Function to query Adjusters for a specific Shock
export const handleQueryAdjusters = () => {
  ipcMain.handle('query-adjusters', async (event, shockId) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM Adjusters WHERE Shock_ID = ?`;
      db.all(query, [shockId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          console.log("Fetched Adjusters:", rows); // Log to verify correct data
          resolve(rows);
        }
      });
    });
  });
};



export const handleUpdateAdjuster = () => {
  ipcMain.handle('update-adjuster', async (event, data) => {
    return new Promise((resolve, reject) => {
      // Validate Adjuster_Max does not exceed 100
      if (data.Adjuster_Max > MAX_ADJUSTER_MAX) {
        reject(new Error('Adjuster_Max cannot exceed 100.'));
      } else {
        const query = `UPDATE Adjusters 
                       SET Adjuster_Nickname = ?, Adjuster_Type = ?, Adjuster_Max = ? 
                       WHERE Adjuster_ID = ?`;
        db.run(
          query,
          [
            data.Adjuster_Nickname,
            data.Adjuster_Type,
            data.Adjuster_Max,
            data.Adjuster_ID,
          ],
          (err) => {
            if (err) reject(err);
            else resolve('Adjuster updated successfully');
          },
        );
      }
    });
  });
};


// Function to delete an Adjuster by ID
export const handleDeleteAdjuster = () => {
  ipcMain.handle('delete-adjuster', async (event, id) => {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM Adjusters WHERE Adjuster_ID = ?`;
      db.run(query, [id], (err) => {
        if (err) reject(err);
        else resolve('Adjuster deleted successfully');
      });
    });
  });
};


// ... existing imports and code ...

export const handleQueryTestLogs = () => {
  ipcMain.handle('query-test-logs', async (event, testId) => {
    return new Promise((resolve, reject) => {
      const query = testId 
        ? `SELECT * FROM Test_Logs WHERE Test_ID = ?`
        : `SELECT * FROM Test_Logs`;
      db.all(query, testId ? [testId] : [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  });
};

export const handleInsertTestLog = () => {
  ipcMain.handle('insert-test-log', async (event, data) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO Test_Logs (Interval, Test_ID, Force, Position, Velocity, Time_Since_Start, Ex1, Ex2) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      db.run(
        query,
        [data.Interval, data.Test_ID, data.Force, data.Position, data.Velocity, data.Time_Since_Start, data.Ex1, data.Ex2],
        (err) => {
          if (err) reject(err);
          else resolve('Test log inserted successfully');
        },
      );
    });
  });
};

export const handleUpdateTestLog = () => {
  ipcMain.handle('update-test-log', async (event, data) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE Test_Logs 
                     SET Force = ?, Position = ?, Velocity = ?, Time_Since_Start = ?, Ex1 = ?, Ex2 = ? 
                     WHERE Interval = ? AND Test_ID = ?`;
      db.run(
        query,
        [data.Force, data.Position, data.Velocity, data.Time_Since_Start, data.Ex1, data.Ex2, data.Interval, data.Test_ID],
        (err) => {
          if (err) reject(err);
          else resolve('Test log updated successfully');
        },
      );
    });
  });
};

export const handleDeleteTestLog = () => {
  ipcMain.handle('delete-test-log', async (event, interval, testId) => {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM Test_Logs WHERE Interval = ? AND Test_ID = ?`;
      db.run(query, [interval, testId], (err) => {
        if (err) reject(err);
        else resolve('Test log deleted successfully');
      });
    });
  });
};



// Function to query Test Records
export const handleQueryTestRecords = () => {
  ipcMain.handle('query-test-records', async (event, userId) => {
    return new Promise((resolve, reject) => {
      const query = userId 
        ? `SELECT * FROM Test_Records WHERE User_ID = ?`
        : `SELECT * FROM Test_Records`;
      db.all(query, userId ? [userId] : [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  });
};

// Function to insert a new Test Record
export const handleInsertTestRecord = () => {
  ipcMain.handle('insert-test-record', async (event, data) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO Test_Records (User_ID, Test_ID, Test_Type, Vehicle_Type_ID, Shock_Set_ID, Shock_ID, Number_Of_Clicks, LocationValue, LocationNumber, Date, Speed, Time_Started, Time_Ended, Dyno_Serial_Number, Recorded_IP_Address, Barometric_Pressure, Gas_Pressure, Strokes, Stroke_Length, Test_Log, Notes) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      db.run(
        query,
        [data.User_ID, data.Test_ID, data.Test_Type, data.Vehicle_Type_ID, data.Shock_Set_ID, data.Shock_ID, data.Number_Of_Clicks, data.LocationValue, data.LocationNumber, data.Date, data.Speed, data.Time_Started, data.Time_Ended, data.Dyno_Serial_Number, data.Recorded_IP_Address, data.Barometric_Pressure, data.Gas_Pressure, data.Strokes, data.Stroke_Length, data.Test_Log, data.Notes],
        (err) => {
          if (err) reject(err);
          else resolve('Test record inserted successfully');
        }
      );
    });
  });
};

// Function to update an existing Test Record
export const handleUpdateTestRecord = () => {
  ipcMain.handle('update-test-record', async (event, data) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE Test_Records 
                     SET Test_Type = ?, Vehicle_Type_ID = ?, Shock_Set_ID = ?, Shock_ID = ?, Number_Of_Clicks = ?, LocationValue = ?, LocationNumber = ?, Date = ?, Speed = ?, Time_Started = ?, Time_Ended = ?, Dyno_Serial_Number = ?, Recorded_IP_Address = ?, Barometric_Pressure = ?, Gas_Pressure = ?, Strokes = ?, Stroke_Length = ?, Test_Log = ?, Notes = ?
                     WHERE User_ID = ? AND Test_ID = ?`;
      db.run(
        query,
        [data.Test_Type, data.Vehicle_Type_ID, data.Shock_Set_ID, data.Shock_ID, data.Number_Of_Clicks, data.LocationValue, data.LocationNumber, data.Date, data.Speed, data.Time_Started, data.Time_Ended, data.Dyno_Serial_Number, data.Recorded_IP_Address, data.Barometric_Pressure, data.Gas_Pressure, data.Strokes, data.Stroke_Length, data.Test_Log, data.Notes, data.User_ID, data.Test_ID],
        (err) => {
          if (err) reject(err);
          else resolve('Test record updated successfully');
        }
      );
    });
  });
};

// Function to delete a Test Record
export const handleDeleteTestRecord = () => {
  ipcMain.handle('delete-test-record', async (event, userId, testId) => {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM Test_Records WHERE User_ID = ? AND Test_ID = ?`;
      db.run(query, [userId, testId], (err) => {
        if (err) reject(err);
        else resolve('Test record deleted successfully');
      });
    });
  });
};