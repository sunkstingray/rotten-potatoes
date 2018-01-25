
module.exports = function(app,passport){


  var express = require('express');
  var router = express.Router();
  var db = require('../models');
  var bestGames = [];
  var worstGames = [];
  var bestGamesList

  /* GET home page. */
  router.get('/', function(req, res) {
    db.reviews_tables.findAll({
      order: [['average', 'DESC']]
    }).then(function(data){
      var bestGames = getGamesArray(data);
      //console.log(bestGames);
      db.game_tables.findAll({
        limit: 10,
        order: [[db.reviews_tables, 'average']],
        where: {
          id: bestGames,
        }, include: [db.reviews_tables]
      }).then(function(childData){
        bestGamesList = childData;
        db.reviews_tables.findAll({
          order: ['average']
        }).then(function(childChilddata){
          // console.log(childChilddata)
          var worstGames = getGamesArray(childChilddata);
          //console.log(worstGames);
          db.game_tables.findAll({
            limit: 10,
            order: [[db.reviews_tables, 'average', 'DESC']],
            where: {
              id: worstGames,
            }, include: [db.reviews_tables]
          }).then(function(childChildChildData){
            // console.log(childData);

            var firstname = '';
            if(req.user){
              firstname = req.user.firstname;
            }

            res.render('./home/index', {worstGames: bestGamesList, topTen: childChildChildData, loggedin: req.isAuthenticated(),firstname: firstname});

          })
        })
      })
    })
  });

  /* GET specific game info */
  router.get('/games/:id', function(req, res) {
    var gameID = req.params.id;
    db.game_tables.findOne({
      where: {
        id: gameID,
      }, include:[db.reviews_tables]
    }).then(function(data){
      
      var firstname = '';
      if(req.user){
        firstname = req.user.firstname;
      }


      var averages = getAverage(data.dataValues.reviews_tables);
      //console.log(averages);
      res.render('./home/game', { 
        overallScore: averages[4],
        replayability: averages[2],
        graphics: averages[0],
        soundtrack: averages[3],
        gameTitle: data.name, 
        gameplay: averages[1],
        gameImage: data.image_thumbnail, 
        gameDescription: data.description, 
        gameid: gameID,

        loggedin: req.isAuthenticated(),
        firstname: firstname
      });
    })
  });

  /* GET list of all games we have on record */
  router.get('/games', function(req, res) {
   // console.log("get route"); //this part works
      // console.log(db.game_tables);
      var firstname = '';
      if(req.user){
        firstname = req.user.firstname;
      }
      db.game_tables.findAll({
        attributes: ['name', 'description', 'image_thumbnail', 'id'],
        order: [['name']],
      }).then(function(data){
    res.render('./home/gameList', {title: 'game list',  gamesList: data, loggedin: req.isAuthenticated(),firstname: firstname});
    })
  });

  /*SEARCH FOR GAMES*/
  router.get('/search', function(req,res){
    var firstname = '';
    if(req.user){
      firstname = req.user.firstname;
    }
    db.game_tables.findAll({
        where: {
          name: {
            $like: '%' + req.query.searchTerm + '%'
          }
        }
      }).then(function(data){
        res.render('./home/gameList', {title: 'game list',  gamesList: data, loggedin: req.isAuthenticated(),firstname: firstname});
      })

  });


  /* DISPLAY ACCOUNT DETAILS */
  router.get('/account',function(req, res) {
      res.render('./users/show',{user:req.user, loggedin:req.isAuthenticated(), firstname:req.user.firstname});
  });

  /* LOGOUT */
  router.get('/logout',function(req, res) {
      req.logout();
      res.render('./logout/logout');
  });

   /* AUTOCOMPLETE */
  router.get('/search/auto',function(req, res) {
     
      var query = req.query.term;
      console.log('Query:' + query);
      db.game_tables.findAll({
        where: {
          name: {
            $like: '%' + query + '%'
          }
        }
      }).then(function(data){
        console.log('data:' + data.length);
        var autoCompleteOptions = [];
        for (i=0;i < data.length;i++){
          autoCompleteOptions.push(data[i].name);
        }

        res.send(autoCompleteOptions);
      })


  });


  //function to get the average ratings of all reviews for a specific game
  var getAverage = function(table){
    var total_graphics_rating = 0;
    var total_game_play_rating = 0;
    var total_replayability_rating = 0;
    var total_soundtrack_rating = 0;
    var total_average = 0;

    for (i = 0; i < table.length; i ++){
      var current_graphics_rating = parseInt(table[i].dataValues.graphics_rating);
      var current_game_play_rating = parseInt(table[i].dataValues.game_play_rating);
      var current_replayability_rating = parseInt(table[i].dataValues.replayability);
      var current_soundtrack_rating = parseInt(table[i].dataValues.soundtrack);
      var current_average = parseInt(table[i].dataValues.average);
      total_graphics_rating += current_graphics_rating;
      total_game_play_rating += current_game_play_rating;
      total_replayability_rating += current_replayability_rating;
      total_soundtrack_rating += current_soundtrack_rating;
      total_average += current_average;
    }


    var avg_graphics_rating = total_graphics_rating/table.length;
    var avg_game_play_rating = total_game_play_rating/table.length;
    var avg_replayability_rating = total_replayability_rating/table.length;
    var avg_soundtrack_rating = total_soundtrack_rating/table.length;
    var avg_average = total_average/table.length

    var avgTable = [];
    avgTable.push(avg_graphics_rating);
    avgTable.push(avg_game_play_rating);
    avgTable.push(avg_replayability_rating);
    avgTable.push(avg_soundtrack_rating);
    avgTable.push(avg_average);

    return avgTable;
  }

  //funciton to get top ten gameIDs from the reviews table
  var getGamesArray= function(data){
    var gamesList = [];
    var indexGame = 0;
    for (var i = 0; i < data.length; i++){
      indexGame = gamesList.indexOf(data[i].dataValues.gameTableId);
      // console.log(indexGame);
      if (indexGame = -1){
        gamesList.push(data[i].dataValues.gameTableId);
      }
    }
    var newGamesList = gamesList.slice(9);
    console.log(newGamesList)
    return newGamesList;
  }

return router;

}