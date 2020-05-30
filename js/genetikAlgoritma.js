
var map;
var directionsDisplay = null;
var directionsService;
var polylinePath;
var firstnode;
var fistnodeinarray;
var nodes = [];
var prevNodes = [];
var markers = [];
var durations = [];
var distances = [];


function initializeMap() {
    // Harita Ayar
    var opts = {
        center: new google.maps.LatLng(37.316667, 28.7836667),
        zoom: 8,
        streetViewControl: false,
        mapTypeControl: false
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), opts);

    // Harita tıklandığında
    google.maps.event.addListener(map, 'click', function(event) {
        // Hedef Ekle (max 9)
        if (nodes.length >= 9) {
            alert('Max 9 nokta ekleyebilirsiniz');
            returnyolu
        }

        // Temizle ;
        clearDirections();
        
        // Node Ekle
        var iconBase = '/map/images/';
        var say =markers.length;
 
        geocoder = new google.maps.Geocoder(); 
        var add2="";
        geocoder.geocode({'latLng':event.latLng},function(data2,status2){
        //alert('borda');
        if(status2 == google.maps.GeocoderStatus.OK){ 
        // alert(data2[1].join('\n'));
         //  alert(data2[1].formatted_address);
        add2 = data2[1].formatted_address; //this is the full address 
         drawMarker(event.latLng,String(add2),event.latLng,say);
         //alert(String(add2)); 
        } else {
         drawMarker(event.latLng,String(add2),event.latLng,say);
        }
      
        });

       
        // Nodeların enlem boylamlarını kaydet
        nodes.push(event.latLng);
       if(nodes.length<2)
        firstnode = (event.latLng);
        // hedef sayısını yenile
        $('#destinations-count').html(nodes.length);
    });



    // Konumum Butonu
    var myLocationDiv = document.createElement('div');
    new getMyLocation(myLocationDiv, map);

    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(myLocationDiv);
    
    function getMyLocation(myLocationDiv, map) {
        var myLocationBtn = document.createElement('button');
        myLocationBtn.innerHTML = 'Konumum';
        myLocationBtn.className = 'large-btn';
        myLocationBtn.style.margin = '5px';
        myLocationBtn.style.opacity = '0.95';
        myLocationBtn.style.borderRadius = '3px';
        myLocationDiv.appendChild(myLocationBtn);
    
        google.maps.event.addDomListener(myLocationBtn, 'click', function() {
            navigator.geolocation.getCurrentPosition(function(success) {
                map.setCenter(new google.maps.LatLng(success.coords.latitude, success.coords.longitude)); 
                map.setZoom(12);
                 alert(success.coords.latitude + '--' +  success.coords.longitude);
            });
        });
    }
}




function AddressEkle(adres){
geocoder = new google.maps.Geocoder();
  var address =adres;
    if (nodes.length >= 9) {
            alert('Max 9 nokta ekleyebilirsiniz');
            returnyolu
        }
  geocoder.geocode( { 'address': address}, function(results2, status2) {
    if (status2 == google.maps.GeocoderStatus.OK) {
      map.setCenter(results2[0].geometry.location);  
        drawMarker(results2[0].geometry.location,adres,results2[0].geometry.location,markers.length);
        // Nodeların enlem boylamlarını kaydet
        nodes.push(results2[0].geometry.location);


    } else {
      alert('Konum bulunamadı: ' + status2);
    }
  });
}





// Tüm uzaklıkları seyahat türüne göre al 
function getDistances(callback) {
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
        origins: nodes,
        destinations: nodes,
        travelMode: google.maps.TravelMode[$('#travel-type').val()],
        avoidHighways: parseInt($('#avoid-highways').val()) > 0 ? true : false, // otoban kullanma durumu
        avoidTolls: false
    }, function(distanceData) {
        // Uzaklık dizisi oluştur.
        var nodeDistanceData;
        for (originNodeIndex in distanceData.rows) {
            nodeDistanceData = distanceData.rows[originNodeIndex].elements;
            
            distances[originNodeIndex] = [];

            for (destinationNodeIndex in nodeDistanceData) {
             
               // if (durations[originNodeIndex][destinationNodeIndex] = nodeDistanceData[destinationNodeIndex].distance == 0) {
                //    alert('Hata: Mesafeler arası uzaklık alınamadı');
                 //   return;
               // }
                distances[originNodeIndex][destinationNodeIndex] = nodeDistanceData[destinationNodeIndex].distance.value;
              //  alert( "distances["+originNodeIndex+"]["+destinationNodeIndex+"] = nodeDistanceData["+destinationNodeIndex+"].distance.value = " + nodeDistanceData[destinationNodeIndex].distance.value);
            }
        }

        if (callback != undefined) {
            callback();
        }
    });
}

// Tüm süreleri seyahat türüne göre al 
function getDurations(callback) {
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
        origins: nodes,
        destinations: nodes,
        travelMode: google.maps.TravelMode[$('#travel-type').val()],
        avoidHighways: parseInt($('#avoid-highways').val()) > 0 ? true : false, // otoban kullanma durumu
        avoidTolls: false,
    }, function(distanceData) {
        // Süre dizisi oluştur.
        var nodeDistanceData;
        for (originNodeIndex in distanceData.rows) {
            nodeDistanceData = distanceData.rows[originNodeIndex].elements;
            durations[originNodeIndex] = [];
            distances[originNodeIndex] = [];

            for (destinationNodeIndex in nodeDistanceData) {

                if (durations[originNodeIndex][destinationNodeIndex] = nodeDistanceData[destinationNodeIndex].duration == undefined) {
                    alert('Hata: Mesafeler arası süre alınamadı');
                    return;
                }
                durations[originNodeIndex][destinationNodeIndex] = nodeDistanceData[destinationNodeIndex].duration.value;
                
                if (durations[originNodeIndex][destinationNodeIndex] = nodeDistanceData[destinationNodeIndex].distance == undefined) {
                    alert('Hata: Mesafeler arası uzaklık alınamadı');
                    return;
                }
                distances[originNodeIndex][destinationNodeIndex] = nodeDistanceData[destinationNodeIndex].distance.value;

            }
        }

        if (callback != undefined) {
            callback();
        }
    });
}

 //Markerları ve geçicisi path'i kaldır
function clearMapMarkers() {
    for (index in markers) {
        markers[index].setMap(null);
    }

    prevNodes = nodes;
    nodes = [];

    if (polylinePath != undefined) {
        polylinePath.setMap(null);
    }
    
    markers = [];
    
    $('#ga-buttons').show();
}
// Temizle
function clearDirections() {
    
    if (directionsDisplay != null) {
        directionsDisplay.setMap(null);
        directionsDisplay = null;
    }
}
// Tamamını temizle
function clearMap() {
    clearMapMarkers();
    clearDirections();
    
    $('#destinations-count').html('0');
    $('#routeadress').html('');
    window.location.reload(false);

}

function setMarkerAsStart(marker) {
    marker.infoWindow.close();
    setAsStart(marker.getPosition());
    drawMarkers(false);
}
 
function removeMarker(marker) {
    marker.infoWindow.close();
   removeWaypoint(marker.getPosition());
    drawMarkers(false);
}
 function removeWaypoint(latLng) {
    for (var i = 0; i < nodes.length; ++i) {
      if ( nodes[i].equals(latLng)) {
	//nodes[i] = null;
	return true;
      }
    }

 
  };

 function setAsStart(latLng) {
    firstnode = latLng;
    var j = -1;
    for (var i = 0; i < nodes.length; ++i) {
      if (j == -1) {
	j = i;
      }
      if (nodes[i].equals(latLng)) {
	for (var k = i; k > j; --k) {
	  swapWaypoints(k, k - 1);
	}
	break;
      }
    }
  }
    function swapWaypoints(i, j) {

    var tmpWaypoint = nodes[j];

    nodes[j] = nodes[i];
    nodes[i] = tmpWaypoint;

  }

  
function drawMarkers(updateViewport) {
    removeOldMarkers();
    var waypoints = nodes;
//    var addresses = tsp.getAddresses();
//    var labels = tsp.getLabels();
    for (var i = 0; i < waypoints.length; ++i) {
    
    
	drawMarker(nodes[i], "adress", "lbl", i);
     
    }
    if (updateViewport) {
	setViewportToCover(waypoints);
    }
}
    function drawMarker(latlng, addr, label, num) {
    var icon;
    icon = new google.maps.MarkerImage("/map/images/black" + (num + 1) + ".png");
    var marker = new google.maps.Marker({ 
        position: latlng, 
	icon: icon, 
	map: map });
    google.maps.event.addListener(marker, 'click', function(event) {
	var addrStr = (addr == null) ? "" : addr + "<br>";
	var labelStr = (label == null) ? "" : "<b>" + label + "</b><br>";
	var markerInd = -1;
	for (var i = 0; i < markers.length; ++i) {
	    if (markers[i] != null && marker.getPosition().equals(markers[i].getPosition())) {
		markerInd = i;
		break;
	    }
	}
	var infoWindow = new google.maps.InfoWindow({ 
	    content: labelStr + addrStr
		+ "<a href='javascript:setMarkerAsStart(markers[" 
		+ markerInd + "]"
		+ ")'>"
		+ "Başlangıç Noktası Olarak Ayarla"
		+ "</a><br>"
		
		+ "<a href='javascript:removeMarker(markers["
		+ markerInd + "])'>"
		+ "Lokasyonu Kaldır</a>",
	    position: marker.getPosition() });
	marker.infoWindow = infoWindow;
	infoWindow.open(map);
	//    tsp.removeWaypoint(marker.getPosition());
	//    marker.setMap(null);
    });
    markers.push(marker);
} 


function setViewportToCover(waypoints) {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < waypoints.length; ++i) {
	bounds.extend(waypoints[i]);
    }
    gebMap.fitBounds(bounds);
}

function removeOldMarkers() {
    for (var i = 0; i < markers.length; ++i) {
	markers[i].setMap(null);
    }
    markers = new Array();
}



function adres_getir(latlng,ilk){
        var geocoder = new google.maps.Geocoder(); 
        var add ="";
        geocoder.geocode({'latLng':latlng},function(data,status){
 
        if(status == google.maps.GeocoderStatus.OK){
 
        add = data[1].formatted_address; //this is the full address
       // alert(add);

            if(ilk == 0){
               $('#routeadd').html('');
            
            }


            $('#routeadd').html(($('#routeadd').html()+add+ ' --> <br>'));
      
        }else {
       
        }
 
        });
      
    }

// Google Maps
google.maps.event.addDomListener(window, 'load', initializeMap);

// Create listeners
$(document).ready(function() {
    $('#clear-map').click(clearMap);


   $('#btn_konumekle').click(function() { 
   
   
  var konum = $('#txt_konum').val()
  AddressEkle(konum);


 //  alert(konum);
    });



    // Start GA
    $('#find-route').click(function() {    
        if (nodes.length < 2) {
            if (prevNodes.length >= 2) {
                nodes = prevNodes;
            } else {
                alert('Noktaları seçmek için haritaya tıklayın');
                return;
            }
        }

        if (directionsDisplay != null) {
            directionsDisplay.setMap(null);
            directionsDisplay = null;
        }
        
       // $('#ga-buttons').hide();
        $('#find-route').hide();




        // Rota uzaklıkları al
        getDistances(function(){
            $('.ga-info').show();

            // Get config and create initial GA population
            ga.getConfig();
            var pop = new ga.population();
            pop.initialize(nodes.length);
            var route = pop.getFittest().chromosome;
            var adm = 1;
            ga.evolvePopulation(pop, function(update) {
                $('#generations-passed').html(update.generation);
                $('#best-time').html((update.population.getFittest().getDistance()/1000).toFixed(2) + ' km');
                $('#routeadd').html( $('#routeadd').html()+("<span class='list-group-item'>"+adm +". Adım " +(update.population.getFittest().getDistance()/1000).toFixed(2) + ' km <br> <\/span>'));
               adm+=1;
         //   alert(update.population.getFittest().getDistance());
                // Get route coordinates
                var route = update.population.getFittest().chromosome;
                var routeCoordinates = [];
                for (index in route) {

                    routeCoordinates[index] = nodes[route[index]];
                }
                routeCoordinates[route.length] = nodes[route[0]];

                // alert(routeCoordinates.join('\n'));


                // Display temp. route
                if (polylinePath != undefined) {
                    polylinePath.setMap(null);
                }
                polylinePath = new google.maps.Polyline({
                    path: routeCoordinates,
                    strokeColor: "#CF4858",
                    strokeOpacity: 0.75,
                    strokeWeight: 2
                });
                polylinePath.setMap(map);
               
               //alert(routeCoordinates.join('\n'));
                 // for (var i = 0; i < routeCoordinates.length; i++) { 
                  //adres_getir(routeCoordinates[i],i);
                // }
               //  $('#routeadd').html('');
              // $('#routeadd').html(routeCoordinates.join('\n').toLocaleString());


            }, function(result) {
                // Rotayı Al
                route = result.population.getFittest().chromosome;
               // alert(route.join('\n'));
                 var route2 = pop.getFittest().chromosome;
                 //rotada yerini bulduk
                 for (var i = 0; i < route.length; i++) {
                  if(firstnode == nodes[route[i]]){ fistnodeinarray = i; } 
                 }
                 // alert(fistnodeinarray+".de bulundu");
                 //bulduktan sonrası
                 for (var j = fistnodeinarray; j < route.length; j++) {
                  route2[j-fistnodeinarray] = route[j];
                 }
                 //bulmadan önce
                 for (var k = 0; k < fistnodeinarray; k++) {
                  route2[route.length-fistnodeinarray+k] = route[k];
                 }
                // alert(route2.join('\n'));
                


                // Add route to map
                directionsService = new google.maps.DirectionsService();
                directionsDisplay = new google.maps.DirectionsRenderer();
                directionsDisplay.setMap(map);
                var waypts = [];
               

               // for (var i = 0; i < nodes.length; i++) { 
              
                //adres_getir(nodes[i]);
                //}

                for (var i = 0; i < route2.length; i++) {
                 //alert(nodes[route[i]]);
                  //adres_getir(nodes[route[i]])

                 if(firstnode == nodes[route2[i]]){ fistnodeinarray = i; }


                    waypts.push({
                        location: nodes[route2[i]],
                        stopover: true
                    });
                }
              //  alert(nodes[route[0]]);

              
                
              


                // Add final route to map
                var request = {
                    origin: nodes[route2[0]],
                    destination: nodes[route2[0]],
                    waypoints: waypts,
                    travelMode: google.maps.TravelMode[$('#travel-type').val()],
                    avoidHighways: parseInt($('#avoid-highways').val()) > 0 ? true : false,
                    avoidTolls: false
                };
                directionsService.route(request, function(response, status) {
             
                 

                    if (status == google.maps.DirectionsStatus.OK) {
                      // directionsDisplay.setDirections(response);
                       // var legd = response.routes[ 0 ].legs[ 0 ];
                        new google.maps.DirectionsRenderer({
                    map: map,
                    directions: response,
                    suppressMarkers: true
                });    setAllMap(null);
                       var legs = response.routes[0].legs;
                        var tDistance = 0;
                        var tDuration = 0;
                        for(var i=0; i<legs.length; i++) {
                        var lastval = "0";
                   
                         
                        if(i==(legs.length)){lastval = "1"}
                        makeMarker( legs[i].start_location, i, "title",lastval );
                            tDistance += legs[i].distance.value;
                            tDuration += legs[i].duration.value;
                       }
                         $('#best-time').html($('#best-time').html() + ((tDuration/ 3600).toFixed(2) + ' Saat'));
                     // alert(legs.length);
                       //showSteps(response);
                    }
                   // clearMapMarkers(); PolySil
                });

            });
        });
    });



            function setAllMap(map) {
                    for (var i = 0; i < markers.length; i++) {
                    markers[i].setMap(map);
                    }
             }
             function deleteMarkers() {
                      clearMarkers();
                      markers = [];
             }
            function makeMarker( position, sira, title,son ) {
              //  if(son == 1) {sira = 0; }
                 new google.maps.Marker({
                  position: position,
                  map: map,
                  icon: '/map/images/black'+(sira)+'.png'
                
             });
            }

            function showSteps(directionResult) {
            var markerArray = [];
                  // For each step, place a marker, and add the text to the marker's
                  // info window. Also attach the marker to an array so we
                  // can keep track of it and remove it when calculating new
                  // routes.
                  var myRoute = directionResult.routes[0].legs[0];

                  for (var i = 0; i < myRoute.steps.length; i++) {
                    var marker = new google.maps.Marker({
                      position: myRoute.steps[i].start_location,
                      map: map,
                      icon: '/map/images/black1.png'      
                    });
                    attachInstructionText(marker, myRoute.steps[i].instructions);
                    markerArray[i] = marker;
                  }
                }

                function attachInstructionText(marker, text) {
                  google.maps.event.addListener(marker, 'click', function() {
                    // Open an info window when the marker is clicked on,
                    // containing the text of the step.
                    stepDisplay.setContent(text);
                    stepDisplay.open(map, marker);
                  });
                }
            });

// GA code
var ga = {
    // Default config
    "crossoverRate": 0.5,
    "mutationRate": 0.1,
    "populationSize": 50,
    "tournamentSize": 5,
    "elitism": true,
    "maxGenerations": 50,
    
    "tickerSpeed": 60,

    // Loads config from HTML inputs
    "getConfig": function() {
        ga.crossoverRate = parseFloat($('#crossover-rate').val());
        ga.mutationRate = parseFloat($('#mutation-rate').val());
        ga.populationSize = parseInt($('#population-size').val()) || 50;
        ga.elitism = parseInt($('#elitism').val()) || false;
        ga.maxGenerations = parseInt($('#generations').val()) || 50;
    },
    
    // Evolves given population
    "evolvePopulation": function(population, generationCallBack, completeCallBack) {        
        // Start evolution
        var generation = 1;
        var evolveInterval = setInterval(function() {
            if (generationCallBack != undefined) {
                generationCallBack({
                    population: population,
                    generation: generation,
                });
            }

            // Evolve population
            population = population.crossover();
            population.mutate();
            generation++;
            
            // If max generations passed
            if (generation > ga.maxGenerations) {
                // Stop looping
                clearInterval(evolveInterval);
                
                if (completeCallBack != undefined) {
                    completeCallBack({
                        population: population,
                        generation: generation,
                    });
                }
            }
        }, ga.tickerSpeed);
    },

    // Population class
    "population": function() {
        // Holds individuals of population
        this.individuals = [];
    
        // Initial population of random individuals with given chromosome length
        this.initialize = function(chromosomeLength) {
            this.individuals = [];
    
            for (var i = 0; i < ga.populationSize; i++) {
                var newIndividual = new ga.individual(chromosomeLength);
                newIndividual.initialize();
                this.individuals.push(newIndividual);
            }
        };
        
        // Mutates current population
        this.mutate = function() {
            var fittestIndex = this.getFittestIndex();

            for (index in this.individuals) {
                // Don't mutate if this is the elite individual and elitism is enabled 
                if (ga.elitism != true || index != fittestIndex) {
                    this.individuals[index].mutate();
                }
            }
        };

        // Çaprazlama işlemi yaptıktan sonra yeni popülasyonu döndürülür.
        this.crossover = function() { 
            var newPopulation = new ga.population();
            
            // En iyi bireyi bul
            var fittestIndex = this.getFittestIndex();

            for (index in this.individuals) {
                // elit seçim aktifse ve en iyi birey seçildiyse bu bireyi değiştirme
                if (ga.elitism == true && index == fittestIndex) {
                    
                    var eliteIndividual = 
                    new ga.individual(this.individuals[index].chromosomeLength);
                    eliteIndividual.setChromosome(this.individuals[index].chromosome.slice());
                    newPopulation.addIndividual(eliteIndividual);
                } else {
                    // ebevenyleri seç
                    var parent = this.tournamentSelection();
                    // çaprazlama uygulam
                    this.individuals[index].crossover(parent, newPopulation);
                }
            }
            
            return newPopulation;
        };

        // Adds an individual to current population
        this.addIndividual = function(individual) {
            this.individuals.push(individual);
        };

        // Selects an individual with tournament selection
        this.tournamentSelection = function() {
            // Randomly order population
            for (var i = 0; i < this.individuals.length; i++) {
                var randomIndex = Math.floor(Math.random() * this.individuals.length);
                var tempIndividual = this.individuals[randomIndex];
                this.individuals[randomIndex] = this.individuals[i];
                this.individuals[i] = tempIndividual;
            }

            // Create tournament population and add individuals
            var tournamentPopulation = new ga.population();
            for (var i = 0; i < ga.tournamentSize; i++) {
                tournamentPopulation.addIndividual(this.individuals[i]);
            }

            return tournamentPopulation.getFittest();
        };
        
        // Return the fittest individual's population index
        this.getFittestIndex = function() {
            var fittestIndex = 0;

            // Loop over population looking for fittest
            for (var i = 1; i < this.individuals.length; i++) {
                if (this.individuals[i].calcFitness() > this.individuals[fittestIndex].calcFitness()) {
                    fittestIndex = i;
                }
            }

            return fittestIndex;
        };

        // Return fittest individual
        this.getFittest = function() {
            return this.individuals[this.getFittestIndex()];
        };
    },

    // Individual class
    "individual": function(chromosomeLength) {
        this.chromosomeLength = chromosomeLength;
        this.fitness = null;
        this.chromosome = [];

        // Initialize random individual
        this.initialize = function() {
            this.chromosome = [];

            // Generate random chromosome
            for (var i = 0; i < this.chromosomeLength; i++) {
                this.chromosome.push(i);
            }
            for (var i = 0; i < this.chromosomeLength; i++) {
                var randomIndex = Math.floor(Math.random() * this.chromosomeLength);
                var tempNode = this.chromosome[randomIndex];
                this.chromosome[randomIndex] = this.chromosome[i];
                this.chromosome[i] = tempNode;
            }
        };
        
        // Set individual's chromosome
        this.setChromosome = function(chromosome) {
            this.chromosome = chromosome;
        };
        
        // Mutasyon
        this.mutate = function() {
            this.fitness = null;
            
            // rastgele değişlik
            for (index in this.chromosome) {
                if (ga.mutationRate > Math.random()) {
                    var randomIndex = Math.floor(Math.random() *
                    this.chromosomeLength);
                    var tempNode = this.chromosome[randomIndex];
                    this.chromosome[randomIndex] = this.chromosome[index];
                    this.chromosome[index] = tempNode;
                }
            }
        };
        
        // Returns individuals route distance
        this.getDistance = function() {
            var totalDistance = 0;

            for (index in this.chromosome) {
                var startNode = this.chromosome[index];
                var endNode = this.chromosome[0];
                if ((parseInt(index) + 1) < this.chromosome.length) {
                    endNode = this.chromosome[(parseInt(index) + 1)];
                }

                totalDistance += distances[startNode][endNode];
            }
            
            totalDistance += distances[startNode][endNode];
            
            return totalDistance;
        };

        // Calculates individuals fitness value
        this.calcFitness = function() {
            if (this.fitness != null) {
                return this.fitness;
            }
        
            var totalDistance = this.getDistance();

            this.fitness = 1 / totalDistance;
            return this.fitness;
        };

        // Applies crossover to current individual and mate, then adds it's offspring to given population
        this.crossover = function(individual, offspringPopulation) {
            var offspringChromosome = [];


            var startPos = Math.floor(this.chromosome.length * Math.random());
            var endPos = Math.floor(this.chromosome.length * Math.random());

            var i = startPos;
            while (i != endPos) {
                offspringChromosome[i] = individual.chromosome[i];
                i++

                if (i >= this.chromosome.length) {
                    i = 0;
                }
            }

           
            for (parentIndex in individual.chromosome) {
                var node = individual.chromosome[parentIndex];

                var nodeFound = false;
                for (offspringIndex in offspringChromosome) {
                    if (offspringChromosome[offspringIndex] == node) {
                        nodeFound = true;
                        break;
                    }
                }

                if (nodeFound == false) {
                    for (var offspringIndex = 0; offspringIndex < 
                    individual.chromosome.length; offspringIndex++) {
                        if (offspringChromosome[offspringIndex] == undefined) {
                            offspringChromosome[offspringIndex] = node;
                            break;
                        }
                    }
                }
            }

            
            var offspring = new ga.individual(this.chromosomeLength);
            offspring.setChromosome(offspringChromosome);
            offspringPopulation.addIndividual(offspring);
        };
    },
};
