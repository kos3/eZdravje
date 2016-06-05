
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


var patients = [["Janez", "Dedek", "1935-07-11", "M", "ehrid"],
                ["Nina", "Mama", "1973-11-11", "F", "ehrid"],
                ["Jure", "Otrok", "2003-10-30", "M", "ehrid"]];
                
var vitalSigns_patient1 = [["1999-04-20T20:11:23+01:00", 166, 81.9],
                           ["2002-04-27T18:28:58+01:00", 166, 80.5],
                           ["2005-05-04T17:59:01+01:00", 166, 82.3],
                           ["2008-05-11T19:02:37+01:00", 166, 81.5],
                           ["2010-05-18T20:46:04+01:00", 166, 80.6],
                           ["2011-05-25T19:22:33+01:00", 166, 80.3],
                           ["2013-04-27T18:28:58+01:00", 166, 80.5],
                           ["2014-05-04T17:59:01+01:00", 165, 81.3],
                           ["2015-01-03T19:02:37+01:00", 165, 80.5],
                           ["2015-07-18T20:46:04+01:00", 165, 79.6],
                           ["2016-01-25T19:22:33+01:00", 165, 78.3],
                           ["2016-06-01T18:41:42+01:00", 165, 76.9]];

var vitalSigns_patient2 = [["1999-04-20T11:16:17+01:00", 166, 62.0],
                           ["2000-04-27T15:16:22+01:00", 166, 62.4],
                           ["2002-05-04T19:16:42+01:00", 166, 62.5],
                           ["2004-05-11T11:16:16+01:00", 166, 61.6],
                           ["2005-05-18T13:16:45+01:00", 166, 61.2],
                           ["2008-05-25T17:16:53+01:00", 166, 60.9],
                           ["2010-04-27T15:16:22+01:00", 166, 62.4],
                           ["2012-05-04T19:16:42+01:00", 166, 62.5],
                           ["2014-05-11T11:16:16+01:00", 166, 61.6],
                           ["2015-07-18T13:16:45+01:00", 166, 61.2],
                           ["2016-01-25T17:16:53+01:00", 165, 60.9],
                           ["2016-06-01T09:16:15+01:00", 166, 61.4]];

var vitalSigns_patient3 = [["2004-10-20T11:16:17+01:00",  73,  8.4],
                           ["2005-04-27T15:16:22+01:00",  80, 10.0],
                           ["2006-05-04T19:16:42+01:00",  88, 12.1],
                           ["2007-05-11T11:16:16+01:00",  94, 13.5],
                           ["2009-05-18T13:16:45+01:00",  98, 14.1],
                           ["2011-05-25T17:16:53+01:00", 130, 30.8],
                           ["2013-04-27T15:16:22+01:00", 140, 35.0],
                           ["2014-05-04T19:16:42+01:00", 147, 39.7],
                           ["2015-01-11T11:16:16+01:00", 152, 46.5],
                           ["2015-08-18T13:16:45+01:00", 155, 48.1],
                           ["2016-01-25T17:16:53+01:00", 157, 52.8],
                           ["2016-06-03T09:16:15+01:00", 159, 54.6]];
               
/*
* Generator podatkov za novo stranko. Pri generiranju podatkov 
* je potrebno najprej kreirati novo stranko z določenimi 
* osebnimi podatki (ime, priimek in datum rojstva) ter za njo
* shraniti nekaj podatkov o vitalnih znakih.
* @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
* @return ehrId generiranega pacienta
*/
function generirajPodatke(stPacienta, callback) {
    ehrId = "";
    
    if(stPacienta > 3 || stPacienta < 1)
        return;

    var array = vitalSigns_patient1;
    if(stPacienta==2)
        array = vitalSigns_patient2;
    else if(stPacienta==3)
        array = vitalSigns_patient3;
    
    var i = stPacienta-1;
    ehrId = addEHRService(patients[i][0], patients[i][1], patients[i][2], patients[i][3], array, function(ehrId){
    	callback(ehrId);
    });
}

var ageTable = [];
$(document).ready(function() {
    $('#preberiPredlogoBolnika').change(function() {
        $("#kreirajSporocilo").html("");
        var podatki = $(this).val().split(",");
        $("#kreirajIme").val(podatki[0]);
        $("#kreirajPriimek").val(podatki[1]);
        $("#kreirajDatumRojstva").val(podatki[2]);
        $("#kreirajSpol").val(podatki[3]);
    });
    
    $('#preberiObstojeciEHR').change(function() {
		$("#preberiSporocilo").html("");
		var ehrId = $(this).val();
		$("#preberiEHRid").val(ehrId);
		
		// Meritve
		$('#dodajVitalnoEHR').val(ehrId);
		$('#preberiObstojeciEHRzaMeritve').val(ehrId);
		
		// branje meritve
		$('#meritveVitalnihZnakovEHRid').val(ehrId);
		
		// Preberi EHR podatke
		preberiEHRodBolnika();
		// preberi meritve
		preberiMeritveVitalnihZnakov();
	});
	
	/**
   * Napolni testne vrednosti (EHR ID, datum in ura, telesna višina,
   * telesna teža) pri vnosu vitalnih znakov stranke, ko uporabnik 
   * izbere vrednosti iz padajočega menuja ali ročno vnese EHR ID
   */
	$('#preberiObstojeciEHRzaMeritve').change(function() {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("");
		var podatki = $(this).val().split("|");
		$("#dodajVitalnoEHR").val(podatki[0]);
		$("#dodajVitalnoDatumInUra").val(podatki[1]);
		$("#dodajVitalnoTelesnaVisina").val(podatki[2]);
		$("#dodajVitalnoTelesnaTeza").val(podatki[3]);

		// preberi meritve
		$('#meritveVitalnihZnakovEHRid').val(podatki[0]);
		preberiMeritveVitalnihZnakov();
		
		// preberi graf
		$('#preberiObstojeciEHR').val(podatki[0]);
		$('#preberiEHRid').val(podatki[0]);
		preberiEHRodBolnika();
	});
	
	/**
   * Napolni testni EHR ID pri pregledu meritev vitalnih znakov obstoječe
   * stranke, ko uporabnik izbere vrednost iz padajočega menuja
   */
	$('#preberiEhrIdZaVitalneZnake').change(function() {
		$("#preberiMeritveVitalnihZnakovSporocilo").html("");
		$("#rezultatMeritveVitalnihZnakov").html("");
		var ehrId = $(this).val();
		$("#meritveVitalnihZnakovEHRid").val(ehrId);
	});
	
	$('#preberiTipZaVitalneZnake').change(function() {
		var ehrId = $("#meritveVitalnihZnakovEHRid").val();
		
		if(ehrId!='')
		    preberiMeritveVitalnihZnakov()
	});
	
	$('#btnGenerator').click(function(e){
	    e.preventDefault();
	    
	    for(var i = 1; i<4; i++){
	        generirajPodatke(i, function(ehrId){
	        	// ehrId is returned.
	        	if(ehrId != null) {
	        		preberiEHRodBolnika();
	        		preberiMeritveVitalnihZnakov();
	        	}
	        });
	    }
	});
	
	graphConfig();
	readJsonData();
});

function readJsonData() {
    $.getJSON( "./life_expect.json", function( data ) {
      $.each(data, function( key, val ) {
        ageTable.push(val);
      });
    });
}

/**
 * Kreiraj nov EHR zapis za stranko in dodaj osnovne demografske podatke.
 * V primeru uspešne akcije izpiši sporočilo s pridobljenim EHR ID, sicer
 * izpiši napako.
 */
function kreirajEHRzaBolnika() {
	var ime = $("#kreirajIme").val();
	var priimek = $("#kreirajPriimek").val();
	var datumRojstva = $("#kreirajDatumRojstva").val();
	var spol = $('#kreirajSpol').val();
	
	addEHRService(ime, priimek, datumRojstva, spol, null, function(ehrId){
		
	});
}

function addEHRService(ime, priimek, datumRojstva, spol, array, callback){
    sessionId = getSessionId();
    
    if (!ime || !priimek || !datumRojstva || !spol || ime.trim().length == 0 ||
      priimek.trim().length == 0 || datumRojstva.trim().length == 0 || spol.length == 0) {
		$("#kreirajSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
	    var gndr = spol === 'M' ? 'MALE' : 'FEMALE';
	
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datumRojstva,
		            gender: gndr,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                    
		                    if(array != null) {
    		                    for (var x = 0; x<array.length; x++)
                                    addMeritveService(ehrId, array[x][0], array[x][1], array[x][2])
		                    } else {
    		                    $("#kreirajSporocilo").html("<span class='obvestilo " +
                                  "label label-success fade-in'>Uspešno kreiran EHR '" + ehrId + "'.</span>");
    		                    $("#preberiEHRid").val(ehrId);
    		                    preberiEHRodBolnika();
		                    }
		                    
		                    // Dodaj uporabnike v EHR seznam
		                    $('#preberiObstojeciEHR').append('<option value="' + ehrId + '">'+ ime + ' ' + priimek +'</option>')
		                    $('#preberiObstojeciEHR').val(ehrId);
		                    $("#preberiEHRid").val(ehrId);
		                    
		                    // Dodaj uporabnike v seznam meritev
		                    $('#preberiObstojeciEHRzaMeritve').append('<option value="'+ehrId+'">'+ ime + ' ' + priimek +'</option>');
		                    $('#preberiObstojeciEHRzaMeritve').val(ehrId);
		                    $('#dodajVitalnoEHR').val(ehrId);
		                    
		                    // Dodaj uporabnike v seznam branja meritev
		                    $('#preberiEhrIdZaVitalneZnake').append('<option value="'+ehrId+'">'+ ime + ' ' + priimek +'</option>');
		                    
		                    // Dodaj EHR id v polje meritev
		                    $('#meritveVitalnihZnakovEHRid').val(ehrId);
		                    
		                    callback(ehrId);
		                }
		            },
		            error: function(err) {
		            	$("#kreirajSporocilo").html("<span class='obvestilo label " +
                    "label-danger fade-in'>Napaka '" +
                    JSON.parse(err.responseText).userMessage + "'!");
		            }
		        });
		    }
		});
	}
}

/**
 * Za podan EHR ID preberi demografske podrobnosti pacienta in izpiši sporočilo
 * s pridobljenimi podatki (ime, priimek in datum rojstva).
 */
function preberiEHRodBolnika() {
	sessionId = getSessionId();

	var ehrId = $("#preberiEHRid").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#preberiSporocilo").html("<span class='obvestilo label label-warning " +
      "fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				var dateOfBirth = party.dateOfBirth.split('T');
				
				$("#preberiSporocilo").html("<span class='obvestilo label " +
                "label-success fade-in'>Stranka '" + party.firstNames + " " +
                party.lastNames + "', spol: "+ party.gender +", ki se je rodila '" + dateOfBirth[0] +
                "'.</span>");
                graphCalculator(party.dateOfBirth, party.gender);
                
                $('#lblIme').html(party.firstNames);
                $('#lblPriimek').html(party.lastNames);
                $('#lblDatumRojstva').html(dateOfBirth[0]);
                $('#lblSpol').html(party.gender);
			},
			error: function(err) {
				$("#preberiSporocilo").html("<span class='obvestilo label " +
          "label-danger fade-in'>Napaka '" +
          JSON.parse(err.responseText).userMessage + "'!");
			}
		});
	}
}

/**
 * Za dodajanje vitalnih znakov pacienta je pripravljena kompozicija, ki
 * vključuje množico meritev vitalnih znakov (EHR ID, datum in ura,
 * telesna višina, telesna teža, sistolični in diastolični krvni tlak,
 * nasičenost krvi s kisikom in merilec).
 */
function dodajMeritveVitalnihZnakov() {
	var ehrId = $("#dodajVitalnoEHR").val();
	var datumInUra = $("#dodajVitalnoDatumInUra").val();
	var telesnaVisina = $("#dodajVitalnoTelesnaVisina").val();
	var telesnaTeza = $("#dodajVitalnoTelesnaTeza").val();

    addMeritveService(ehrId, datumInUra, telesnaVisina, telesnaTeza);
    preberiMeritveVitalnihZnakov();
}

function addMeritveService(ehrId, datumInUra, telesnaVisina, telesnaTeza) {
    sessionId = getSessionId();
    
    if (!ehrId || ehrId.trim().length == 0) {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo " +
      "label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
			// Struktura predloge je na voljo na naslednjem spletnem naslovu:
            // https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": datumInUra,
		    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
		    "vital_signs/body_weight/any_event/body_weight": telesnaTeza
		};
		var parametriZahteve = {
		    ehrId: ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT'
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		        $("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-success fade-in'>" + res.meta.href + ".</span>");
		    },
		    error: function(err) {
		    	$("#dodajMeritveVitalnihZnakovSporocilo").html(
            "<span class='obvestilo label label-danger fade-in'>Napaka '" +
            JSON.parse(err.responseText).userMessage + "'!");
		    }
		});
	}
}

/**
 * Pridobivanje vseh zgodovinskih podatkov meritev izbranih vitalnih znakov
 * (telesna temperatura, filtriranje telesne temperature in telesna teža).
 * Filtriranje telesne temperature je izvedena z AQL poizvedbo, ki se uporablja
 * za napredno iskanje po zdravstvenih podatkih.
 */
function preberiMeritveVitalnihZnakov() {
	sessionId = getSessionId();
	$('#preberiMeritveVitalnihZnakovSporocilo').empty();

	var ehrId = $("#meritveVitalnihZnakovEHRid").val();
	var tip = $("#preberiTipZaVitalneZnake").val();

	if (!ehrId || ehrId.trim().length == 0 || !tip || tip.trim().length == 0) {
		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo " +
      "label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#rezultatMeritveVitalnihZnakov").html("<br/><span>Pridobivanje podatkov za <b>'" + 
														 tip + "'</b> stranke <b>'" + party.firstNames +
        												 " " + party.lastNames + "'</b>.</span><br/><br/>");

				if (tip == "telesna teža") {
					$.ajax({
					    url: baseUrl + "/view/" + ehrId + "/" + "weight",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
						    	var results = "<table class='table table-striped table-hover'><tr><th>Datum</th><th class='text-right'>Telesna teža</th></tr>";
						        for (var i in res) {
						            var time = res[i].time.split('T');
						            
						            if(isFilter(res[i].time))
						            	results += "<tr><td>" + time[0] + "</td><td class='text-right'>" + res[i].weight + " " 	+ res[i].unit + "</td>";
						        }
						        
						        results += "</table>";
						        $("#rezultatMeritveVitalnihZnakov").append(results);
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    	}
					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
					    }
					});
				} else if (tip == "telesna višina") {
					$.ajax({
					    url: baseUrl + "/view/" + ehrId + "/" + "height",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
						    	var results = "<table class='table table-striped table-hover'><tr><th>Datum in ura</th> <th class='text-right'>Telesna višina</th></tr>";
						        for (var i in res) {
						            var time = res[i].time.split('T');
						            results += "<tr><td>" + time[0] + "</td><td class='text-right'>" + res[i].height + " " + res[i].unit + "</td>";
						        }
						        results += "</table>";
						        $("#rezultatMeritveVitalnihZnakov").append(results);
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    	}
					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
					    }
					});
				}
	    	},
	    	error: function(err) {
	    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
	    	}
		});
	}
}

var config = liquidFillGaugeDefaultSettings();
var gauge;
function graphConfig() {
    config.circleThickness = 0.4;
    config.circleColor = "#6DA398";
    config.textColor = "#178BCA";
    config.waveTextColor = "#A4DBF8";
    config.waveColor = "#178BCA";
    config.textVertPosition = 0.52;
    config.waveAnimateTime = 5000;
    config.waveHeight = 0;
    config.waveAnimate = false;
    config.waveCount = 2;
    config.waveOffset = 0.25;
    config.textSize = 1.2;
    config.minValue = 0;
    config.maxValue = 150;
    config.displayPercent = false;
    gauge = loadLiquidFillGauge("fillgauge", 0, config);
}

function graphCalculator(dateOfBirth, gender) {
    
    var starost = getDateDiff(dateOfBirth, 'now', 'years');
    var item = readAgeTableData(starost);
    
    if(item === undefined) {
        $('#fillgauge').empty();
    
        config.circleColor = 'green';
        gauge = loadLiquidFillGauge("fillgauge", 0, config);
        return;
    }
    
    var ageMax;
    var color;
    if(gender === 'FEMALE'){
        ageMax = item.expect_F + item.age_year;
        color = item.color_F;
    } else {
        ageMax = item.expect_M + item.age_year;
        color = item.color_M;
    }
    
    $('#fillgauge').empty();
    
    config.circleColor = color;
    config.maxValue = ageMax;
    gauge = loadLiquidFillGauge("fillgauge", 0, config);
    gauge.update(starost);
}


function getDateDiff(date1, date2, interval) {
    var second = 1000,
    minute = second * 60,
    hour = minute * 60,
    day = hour * 24,
    week = day * 7;
    date1 = new Date(date1);
    date2 = (date2 == 'now') ? new Date() : new Date(date2);
    var timediff = date2 - date1;
    if (isNaN(timediff)) return NaN;
    switch (interval) {
    case "years":
        return date2.getFullYear() - date1.getFullYear();
    case "months":
        return ((date2.getFullYear() * 12 + date2.getMonth()) - (date1.getFullYear() * 12 + date1.getMonth()));
    case "weeks":
        return Math.floor(timediff / week);
    case "days":
        return Math.floor(timediff / day);
    case "hours":
        return Math.floor(timediff / hour);
    case "minutes":
        return Math.floor(timediff / minute);
    case "seconds":
        return Math.floor(timediff / second);
    default:
        return undefined;
    }
}


function readAgeTableData(age) {
    var item;
    $.each(ageTable, function( key, val ) {
    
    if(val.age_year === age) {
        item = val;
        return;
    }
    });
    
    return item;
}

function getFilter() {
	return $("#rbTen").hasClass("active") ? "TEN" : $("#rbOne").hasClass("active") ? "ONE" : "ALL";
}

function dateCalculator() {
	var filter = getFilter();
	
	// Return today's date and time
	var currentTime = new Date()
	// returns the month (from 0 to 11)
	var month = currentTime.getMonth() + 1
	// returns the day of the month (from 1 to 31)
	var day = currentTime.getDate()
	// returns the year (four digits)
	var year = currentTime.getFullYear()
	
	var date = new Date(year,month,day);
	
	if(filter === "ONE")
		return new Date((year-1), month, day);
	if(filter === "TEN")
		return new Date((year-10), month, day);
	
	return null;
}

function isFilter(fDate) {
	var startDate = dateCalculator();
	if (startDate==null)
		return true;
	
	var todayAtMidn = new Date(fDate);
	
	if (todayAtMidn.getTime() >= startDate.getTime()) {
    	return true;
	}
	
	return false;
}