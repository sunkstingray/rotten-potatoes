// console.log("loaded");

$.get("apiRoutes/api/topTenGames", function(data){
    var addTable = $("<ul>");
    for (var i = 0; i < data.length; i++){
        addTable.append("<li>" + data[i].name + "</li>"); 
        console.log(addTable); 
    };
    $("#best-games-list").append(addTable);
});

