/**
 * Sahar Fatima
 * Simple Charity Website
 */

'use strict';

 // load packages
const path = require("path")
const express = require('express')
const mysql = require('mysql2');
const app = express()

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const mysqlConfig = {
  host: "mysql_server",
  user: "sahar",
  password: "password",
  database: "charitydb"
}

// port and host addresses 
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

//express middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/", express.static(__dirname + '/views'));

// connect to MySQL and build tables
let con =  mysql.createConnection(mysqlConfig);
con.connect(function(err) {
  if (err) throw err;
  console.log('connected')
}); 

con.connect(function(err) {
  if (err) throw err;  
  const sql = `
  CREATE TABLE IF NOT EXISTS charitydb.events ( 
    id INT NOT NULL AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL, 
    Location VARCHAR(255) NOT NULL, 
    Date VARCHAR(255) NOT NULL, 
    Details VARCHAR(500) NULL, 
    MaxCapacity INT NOT NULL, 
    TimeStamp TIMESTAMP on update CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  ) ENGINE = InnoDB;       
`;

  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("events table created");
  });
});

con.connect(function(err) {
  if (err) throw err;
  const sql = `
  CREATE TABLE IF NOT EXISTS charitydb.people ( 
    id INT NOT NULL AUTO_INCREMENT,
    LastName VARCHAR(255) NOT NULL, 
    FirstName VARCHAR(255) NOT NULL, 
    Age INT NOT NULL, 
    FamilySize INT NOT NULL,
    DietRestrictions VARCHAR(255) NULL,
    TimeStamp TIMESTAMP on update CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
    ) ENGINE = InnoDB;   
`;
 
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("people table created");
  });

});

con.connect(function(err) {
  if (err) throw err;
  const sql = `
  CREATE TABLE IF NOT EXISTS charitydb.eventToPerson ( 
    eventId INT NOT NULL,
    FOREIGN KEY(eventId) REFERENCES events(id),
    personId INT NOT NULL,
    FOREIGN KEY(personId) REFERENCES people(id)
    ) ENGINE = InnoDB;  
`;

  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("eventToPerson table created");
  });
});

/**
* Get function to diplay the home.html on the home page 
*/
app.get('/', (req,res) => {
  res.sendFile(__dirname + '/views/home.html');
});

/**************************************EVENTS API**************************************** */
// Get all Events
app.get('/events', function (req, res) {
  con.connect(function(err) {
    if (err) throw err;
    const sql = `SELECT * FROM events`
    con.query(sql, function (err, result, fields) {
      if (err) throw err;
      res.send(JSON.stringify(result))
    });
  });
})

// Get event by id
app.get('/event/:id', function (req, res) {
  var id = req.params.id;

  if(!id || isNaN(id)){
    res.status(404).send();
  }else{
    con.connect(function(err) {
      if (err) throw err;
      const sql = `SELECT * FROM events WHERE id='${id}'`
      con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result))
      });
    });
  }
})

// Register an Event
app.post('/addEvent', function (req, res) {
  var Name = req.body.Name;
  var Location = req.body.Location;
  var Date = req.body.Date;
  var Details = req.body.Details;
  var MaxCapacity = req.body.MaxCapacity;

  // if required parameters not found then send an error response 
  if(!Name || !Location || !Date || !MaxCapacity || isNaN(MaxCapacity)){
    res.status(404).send();
  }else{
    con.connect(function(err) { 
      if (err) throw err;
      var sql = `INSERT INTO events (Name, Location, Date, Details, MaxCapacity) SELECT '${Name}', '${Location}', '${Date}', '${Details}', '${MaxCapacity}'
      FROM DUAL WHERE NOT EXISTS (SELECT * FROM events WHERE Name='${Name}' AND Location='${Location}' AND Date='${Date}' AND Details='${Details}' AND MaxCapacity='${MaxCapacity}' LIMIT 1)`;
      con.query(sql, function (err, result) {
        if (err) throw err;
        res.send(`Insertion Completed`)
      });
    })
  }
})

//Update an Event
app.put('/updateEvent', function (req, res) {
  var Name = req.body.Name;
  var Location = req.body.Location;
  var Date = req.body.Date;
  var Details = req.body.Details;
  var MaxCapacity = req.body.MaxCapacity;
  var id = req.body.id;

  if(id != '' && isNaN(id) || MaxCapacity != '' && isNaN(MaxCapacity)){
    res.status(404).send();
  }else{
    con.connect(function(err) {
      if (err) throw err;
      //var sql = `UPDATE events SET Name='${Name}', Location='${Location}', Date='${Date}', Details='${Details}', MaxCapacity='${MaxCapacity} WHERE id='${id}'`;
      var sql = `UPDATE events SET Name='${Name}' WHERE id='${id}' AND '${Name}'!=''`;
      con.query(sql, function (err, result) {if (err) throw err;});

      sql = `UPDATE events SET Location='${Location}' WHERE id='${id}' AND '${Location}'!=''`;
      con.query(sql, function (err, result) {if (err) throw err;});

      sql = `UPDATE events SET Date='${Date}' WHERE id='${id}' AND '${Date}'!=''`;
      con.query(sql, function (err, result) {if (err) throw err;});

      sql = `UPDATE events SET Details='${Details}' WHERE id='${id}' AND '${Details}'!=''`;
      con.query(sql, function (err, result) {if (err) throw err;});

      sql = `UPDATE events SET MaxCapacity='${MaxCapacity}' WHERE id='${id}' AND '${MaxCapacity}'!=''`;
      con.query(sql, function (err, result) {if (err) throw err;});

      res.send(`Update Completed`)
    })
  }
})

//Delete Event 
app.delete('/deleteEvent/:id', function (req, res) {
  var id = req.params.id;
   
  if(!id || isNaN(id)){
    res.status(404).send();
  }else{
    con.connect(function(err) {
      if (err) throw err;
      // delete entries from eventToPerson table
      var sql = `DELETE from eventToPerson WHERE eventId='${id}'`;
      con.query(sql, function (err, result) {if (err) throw err;});

      //delete event from events table
      sql = `DELETE from events WHERE id='${id}'`;
      con.query(sql, function (err, result) {if (err) throw err;});  

      res.send(`Delete Completed`)
    })
  }
})

/**************************************PEOPLE API**************************************** */
// Get all People
app.get('/people', function (req, res) {
  con.connect(function(err) {
    if (err) throw err;
    const sql = `SELECT * FROM people`
    con.query(sql, function (err, result, fields) {
      if (err) throw err;
      res.send(JSON.stringify(result))
    });
  });
})

// Get person by id
app.get('/people/:id', function (req, res) {
  var id = req.params.id;

  if(!id || isNaN(id)){
    res.status(404).send();
  }else{
    con.connect(function(err) {
      if (err) throw err;
      const sql = `SELECT * FROM people WHERE id='${id}'`
      con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result))
      });
    });
  }
})

// Register a Person  
app.post('/addPerson', function (req, res) {
  var LastName = req.body.LastName;
  var FirstName = req.body.FirstName;
  var Age = req.body.Age;
  var FamilySize = req.body.FamilySize; 
  var DietRestrictions = req.body.DietRestrictions;

   // if required parameters not found then send an error response 
  if(!LastName || !FirstName || !Age || !FamilySize || isNaN(Age) || isNaN(FamilySize)){
    res.status(404).send();
  }
  else{
    con.connect(function(err) {
      if (err) throw err;
      var sql = `INSERT INTO people (LastName, FirstName, Age, FamilySize, DietRestrictions) SELECT '${LastName}', '${FirstName}', '${Age}', '${FamilySize}', '${DietRestrictions}'
      FROM DUAL WHERE NOT EXISTS (SELECT * FROM people WHERE LastName='${LastName}' AND FirstName='${FirstName}' AND Age='${Age}' AND FamilySize='${FamilySize}' AND DietRestrictions='${DietRestrictions}' LIMIT 1)`;
      con.query(sql, function (err, result) {
        if (err) throw err;
        res.send(`Insertion Completed`)
      });
    })
  }
}) 

//Update a Person
app.put('/updatePerson', function (req, res) {
  var LastName = req.body.LastName;
  var FirstName = req.body.FirstName;
  var Age = req.body.Age;
  var FamilySize = req.body.FamilySize;
  var DietRestrictions = req.body.DietRestrictions;
  var id = req.body.id;
   
  if(id != '' && isNaN(id) || Age != '' && isNaN(Age) || FamilySize != '' && isNaN(FamilySize)){
    res.status(404).send();
  }   
  else{
    con.connect(function(err) {
      if (err) throw err;
      //var sql = `UPDATE events SET Name='${Name}', Location='${Location}', Date='${Date}', Details='${Details}', MaxCapacity='${MaxCapacity} WHERE id='${id}'`;
      var sql = `UPDATE people SET LastName='${LastName}' WHERE id='${id}' AND '${LastName}'!=''`;
      con.query(sql, function (err, result) {if (err) throw err;});

      sql = `UPDATE people SET FirstName='${FirstName}' WHERE id='${id}' AND '${FirstName}'!=''`;
      con.query(sql, function (err, result) {if (err) throw err;});

      sql = `UPDATE people SET Age='${Age}' WHERE id='${id}' AND '${Age}'!=''`;
      con.query(sql, function (err, result) {if (err) throw err;});

      sql = `UPDATE people SET FamilySize='${FamilySize}' WHERE id='${id}' AND '${FamilySize}'!=''`;
      con.query(sql, function (err, result) {if (err) throw err;});

      sql = `UPDATE people SET DietRestrictions='${DietRestrictions}' WHERE id='${id}' AND '${DietRestrictions}'!=''`;
      con.query(sql, function (err, result) {if (err) throw err;});

      res.send(`Update Completed`)
    })
  }
})

//Delete Person 
app.delete('/deletePerson/:id', function (req, res) {
  var id = req.params.id;
  
  if(!id || isNaN(id)){
    res.status(404).send();
  }else{
    con.connect(function(err) { 
      if (err) throw err;
      // delete entries from eventToPerson table
      var sql = `DELETE from eventToPerson WHERE personId='${id}'`;
      con.query(sql, function (err, result) {if (err) throw err;});

      //delete event from people table
      sql = `DELETE from people WHERE id='${id}'`;
      con.query(sql, function (err, result) {if (err) throw err;});  

      res.send(`Delete Completed`)
    })
  }
}) 
/*********************Register person for event ******************************/
//Register Person for Event
app.post('/addPersonForEvent', function (req, res) {
  var eventId = req.body.eventId;
  var personId = req.body.personId;

  if(!eventId || isNaN(eventId) || !personId || isNaN(personId)){
    res.status(404).send();
  }   
  else{   
    con.connect(function(err) {  
      if (err) throw err;  
      var sql = `INSERT INTO eventToPerson (eventId, personId) SELECT '${eventId}', '${personId}' FROM DUAL WHERE NOT EXISTS 
      (SELECT * FROM eventToPerson WHERE eventId='${eventId}' AND personId='${personId}' LIMIT 1)`;
      con.query(sql, function (err, result) {
        if (err) throw err;
        res.send(`Insertion Completed`)
      });
    })
  }  
})  

//Return max cap for an event.
app.get('/maxCap/:id', function (req, res) {
  var eventId = req.params.id;

  if(!eventId || isNaN(eventId)){  
    res.status(404).send(); 
  }else{
    con.connect(function(err) {
      if (err) throw err;

      const sql = `SELECT MaxCapacity FROM events WHERE id='${eventId}'`

      con.query(sql, function (err, result, fields) {
        if (err) throw err;
       
        if(!result || result == ''){
          res.status(500).send();
        }else{
          res.send(JSON.stringify(result));  
        }
      }); 
    });
  }
}) 

//Return all people who are attending an event 
app.get('/attending_event/:id', function (req, res) {
  var eventId = req.params.id;

  if(!eventId || isNaN(eventId)){
    res.status(404).send();
  }else{
    con.connect(function(err) {
      if (err) throw err;
      const sql = `(SELECT * FROM eventToPerson INNER JOIN people ON eventToPerson.personId = people.id 
      WHERE eventToPerson.eventId='${eventId}')`
      con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
      });
    });
  }   
}) 
    
// // return all the events a person is attending
app.get('/attending_person/:id', function (req, res) {
  var personId = req.params.id;

  if(!personId || isNaN(personId)){
    res.status(404).send();
  }else{
    con.connect(function(err) {
      if (err) throw err;
      const sql = `(SELECT * FROM eventToPerson INNER JOIN events ON eventToPerson.eventId = events.id 
      WHERE eventToPerson.personId='${personId}')`
      con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
      });
    });
  } 
})

app.listen(3000)

console.log("listening on port 3000")

