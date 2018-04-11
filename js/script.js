// create the module
var indexApp = angular.module('parkingApp', ['ngRoute', 'ngStorage']);
var ipserver = "172.16.0.212:5044";
var protocol = "http";

var curToken = { value: "", enable: false };

// variabile per il menu
var searchFor;

var TipoPosto = ["Auto", "Camper", "Moto", "Autobus", "Disabile"];

//  Aggiunta della variabile e funzione globali per nascondere/mostrare il menù
indexApp.run(function ($rootScope) {
    $rootScope.logIn = false;

    $rootScope.hideMenu = function (value) {
        $rootScope.logIn = value;
    };
});

// configure our routes
indexApp.config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: './home.html',
        controller: 'homeController'
    })
        .when('/login', {
            templateUrl: './login.html',
            controller: 'gestisciLogin'
        })
        .when('/singup', {
            templateUrl: './singup.html',
            controller: 'gestisciSingup'
        })
        .when('/logout', {
            templateUrl: './out.html',
            controller: 'gestisciLogout'
        })
        .when('/parcheggi', {
            templateUrl: './parcheggi.html',
            controller: 'gestisciParcheggi'
        }).when('/mainAdmin', {
            templateUrl: './gParcheggi.html',
            controller: 'gestisciParcheggiAdmin'
        })
        .when('/utenti', {
            templateUrl: './utenti.html',
            controller: 'gestisciUtenti'
        })
        .when('/prenotazioni', {
            templateUrl: './prenotazioni.html',
            controller: 'gestisciPrenotazioni'
        });
});

var menuSet = function (val) {
    if (val == 0) {
        $("#linkHome").addClass("active");
        $("#linkParcheggi").removeClass("active");
        $("#linkMain").removeClass("active");
        $("#linkUtenti").removeClass("active");

        $("#navSearchUtenti").hide();
        $("#navSearchParcheggi").hide();
    }
    else {
        if (val == 1) {
            $("#linkHome").removeClass("active");
            $("#linkParcheggi").addClass("active");
            $("#linkMain").removeClass("active");
            $("#linkUtenti").removeClass("active");

            $("#navSearchUtenti").hide();
            $("#navSearchParcheggi").hide();
        }
        else {
            if (val == 2) {
                $("#linkHome").removeClass("active");
                $("#linkParcheggi").removeClass("active");
                $("#linkMain").addClass("active");
                $("#linkUtenti").removeClass("active");

                $("#navSearchUtenti").hide();
                $("#navSearchParcheggi").show();
            }
            else {
                if (val == 3) {
                    $("#linkHome").removeClass("active");
                    $("#linkParcheggi").removeClass("active");
                    $("#linkMain").removeClass("active");
                    $("#linkUtenti").addClass("active");

                    $("#navSearchUtenti").show();
                    $("#navSearchParcheggi").hide();
                }
                else {
                    $("#linkHome").removeClass("active");
                    $("#linkParcheggi").removeClass("active");
                    $("#linkMain").removeClass("active");
                    $("#linkUtenti").removeClass("active");

                    $("#navSearchUtenti").hide();
                    $("#navSearchParcheggi").hide();
                }
            }
        }
    }
};

indexApp.controller('homeController', function ($scope, $localStorage, $location) {
    if ($localStorage.XToken) {
        curToken = $localStorage.XToken;
        $scope.hideMenu(true);
        menuSet(2);
        $location.path('/mainAdmin');
    }

    menuSet(0);

    $("#logoUnicam").click(function () {
        $scope.$applyAsync(function () {
            $location.path('/login');
        });
    });
});

indexApp.controller('gestisciParcheggi', function ($scope, $http, $localStorage, $location) {
    if ($localStorage.XToken) {
        curToken = $localStorage.XToken;
        $scope.hideMenu(true);
        menuSet(2);
        $location.path('/mainAdmin');
    }

    menuSet(1);

    $("#logoUnicam").click(function () {
        $scope.$applyAsync(function () {
            $location.path('/login');
        });
    });

    $http({
        method: "POST",
        url: protocol + "://" + ipserver + "/getAllParcheggi",
        headers: { 'Content-Type': 'application/json' }
    }).then(function (response) {
        if (response.status == 200)
            if (response.data.parcheggi)
                $scope.Parcheggi = response.data.parcheggi;
            else
                alert("Errore sconosciuto!");
        else
            alert("Errore sconosciuto.");

    }, function (response) {
        if (response.data != null && response.data.error !== undefined)
            alert(response.data.error.info);
        else
            alert("Server irraggiungibile.");
    });
});

indexApp.controller('gestisciUtenti', function ($scope, $http, $localStorage, $location, $window) {
    if ($localStorage.XToken) {
        curToken = $localStorage.XToken;
        $scope.hideMenu(true);
    }

    $scope.page = 1;
    searchFor = 1;
    $scope.AllAutisti = [];
    $scope.Autisti = [];
    $scope.Search = [];
    $scope.Parcheggi = [];
    menuSet(3);

    var getAllParcheggi = function () {
        $http({
            method: "POST",
            url: protocol + "://" + ipserver + "/getAllParcheggi",
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            if (response.status == 200)
                if (response.data.parcheggi)
                    $scope.Parcheggi = response.data.parcheggi;
                else
                    alert("Errore sconosciuto!");
            else
                alert("Errore sconosciuto.");

        }, function (response) {
            if (response.data != null && response.data.error !== undefined)
                alert(response.data.error.info);
            else
                alert("Server irraggiungibile.");
        });
    }

    $http({
        method: "POST",
        url: protocol + "://" + ipserver + "/getAllAutisti",
        headers: { 'Content-Type': 'application/json' },
        data: { 'token': curToken.value }
    }).then(function (response) {
        if (response.status == 200)
            if (response.data.autisti) {
                $scope.AllAutisti = response.data.autisti;
                visualizza($scope.page, $scope.AllAutisti);
            }
            else
                alert("Errore sconosciuto!");
    }, function (response) {
        if (response.data != null && response.data.error !== undefined)
            alert(response.data.error.info);
        else
            alert("Server irraggiungibile.");
    });

    getAllParcheggi();

    var IndexFromId = function (id) {
        var j;
        for (j = 0; j < $scope.AllAutisti.length; j++)
            if ($scope.AllAutisti[j].id == id)
                return j;
    };

    $scope.ModificaUtente = function (index, value) {
        // Nascondo/Mostro i tasti relativi alla funzionalità richiesta
        if (value) {
            $("#username" + index).removeAttr("disabled");
            $("#email" + index).removeAttr("disabled");
            $("#nome" + index).removeAttr("disabled");
            $("#cognome" + index).removeAttr("disabled");
            $("#dataDiNascita" + index).removeAttr("disabled");
            $("#telefono" + index).removeAttr("disabled");
            $("#abilitato" + index).removeAttr("disabled");
            $("#numero_carta" + index).removeAttr("disabled");
            $("#pin" + index).removeAttr("disabled");
            $("#dataDiScadenza" + index).removeAttr("disabled");

            $("#modifica" + index).hide();
            $("#elimina" + index).hide();
            $("#btnPrenotazioni" + index).hide();
            $("#annulla" + index).show();
            $("#salva" + index).show();
        }
        else {
            $("#username" + index).attr("disabled", "disabled");
            $("#email" + index).attr("disabled", "disabled");
            $("#nome" + index).attr("disabled", "disabled");
            $("#cognome" + index).attr("disabled", "disabled");
            $("#dataDiNascita" + index).attr("disabled", "disabled");
            $("#telefono" + index).attr("disabled", "disabled");
            $("#abilitato" + index).attr("disabled", "disabled");
            $("#numero_carta" + index).attr("disabled", "disabled");
            $("#pin" + index).attr("disabled", "disabled");
            $("#dataDiScadenza" + index).attr("disabled", "disabled");

            $("#modifica" + index).show();
            $("#elimina" + index).show();
            $("#btnPrenotazioni" + index).show();
            $("#annulla" + index).hide();
            $("#salva" + index).hide();

            //  Ripristino i valori originali
            $("#username" + index).val($scope.Autisti[index].username);
            $("#email" + index).val($scope.Autisti[index].email);
            $("#nome" + index).val($scope.Autisti[index].nome);
            $("#cognome" + index).val($scope.Autisti[index].cognome);
            $("#dataDiNascita" + index).val($scope.Autisti[index].dataDiNascita);
            $("#telefono" + index).val($scope.Autisti[index].telefono);
            $("#abilitato" + index).prop('checked', $scope.Autisti[index].abilitato);
            $("#numero_carta" + index).val($scope.Autisti[index].carta_di_credito.numero_carta);
            $("#pin" + index).val($scope.Autisti[index].carta_di_credito.pin);
            $("#dataDiScadenza" + index).val($scope.Autisti[index].carta_di_credito.dataDiScadenza);
        }
    };

    $scope.SalvaUtente = function (index) {
        var parametri = {
            token: curToken.value,
            autista: {
                id: $scope.Autisti[index].id,
                username: $("#username" + index).val() || $scope.Autisti[index].username,
                password: $scope.Autisti[index].password,
                email: $("#email" + index).val() || $scope.Autisti[index].email,
                nome: $("#nome" + index).val() || $scope.Autisti[index].nome,
                cognome: $("#cognome" + index).val() || $scope.Autisti[index].cognome,
                dataDiNascita: $("#dataDiNascita" + index).val(),
                telefono: $("#telefono" + index).val(),
                abilitato: $("#abilitato" + index).is(':checked'),
                carta_di_credito: {
                    numero_carta: $("#numero_carta" + index).val(),
                    pin: $("#pin" + index).val(),
                    dataDiScadenza: $("#dataDiScadenza" + index).val()
                }
            }
        };

        $http({
            method: "PATCH",
            url: protocol + "://" + ipserver + "/cambiaCredenziali",
            headers: { 'Content-Type': 'application/json' },
            data: parametri
        }).then(function (response) {
            if (response.status == 200)
                if (response.data.successful !== undefined) {
                    alert(response.data.successful.info);
                    //  Setto i nuovi valori
                    $scope.Autisti[index] = parametri.autista;
                    $scope.AllAutisti[IndexFromId(parametri.autista.id)] = parametri.autista;
                    if ($scope.Search.length > 0)
                        $scope.Search[(($scope.page - 1) * 10) + index] = parametri.autista;
                    $scope.ModificaUtente(index, false);
                }
                else
                    alert("Errore sconosciuto!");
            else
                alert("Errore sconosciuto!");
        }, function (response) {
            $scope.ModificaUtente(index, false);
            if (response.data != null && response.data.error !== undefined)
                alert(response.data.error.info);
            else
                alert("Server irraggiungibile.");
        });
    };

    $scope.EliminaUtente = function (index) {
        if (confirm("Sicuro di voler eliminare questo utente ?")) {
            var parametri = {
                token: curToken.value,
                id: $scope.Autisti[index].id
            };

            $http({
                method: "DELETE",
                url: protocol + "://" + ipserver + "/deleteAutista",
                headers: { 'Content-Type': 'application/json' },
                data: parametri
            }).then(function (response) {
                if (response.status == 200) {
                    if (response.data.successful !== undefined) {
                        for (var i = IndexFromId($scope.Autisti[index].id); i < $scope.AllAutisti.length - 1; i++)
                            $scope.AllAutisti[i] = $scope.AllAutisti[i + 1];

                        $scope.AllAutisti[$scope.AllAutisti.length - 1] = null;
                        $scope.AllAutisti.length = $scope.AllAutisti.length - 1;
                        alert(response.data.successful.info);
                        visualizza($scope.page, $scope.AllAutisti);
                    }
                    else
                        alert("Errore sconosciuto!");
                }
                else
                    alert("Errore sconosciuto!");
            }, function (response) {
                if (response.data != null && response.data.error !== undefined)
                    alert(response.data.error.info);
                else
                    alert("Server irraggiungibile.");
            });
        };
    };

    $scope.ModalPrenotazioni = function (index) {
        $("#modalNomeUser").text("Prenotazioni in corso di " + $scope.Autisti[index].nome);

        var parametri = {
            token: curToken.value,
            idUtente: $scope.Autisti[index].id
        };

        $http({
            method: "POST",
            url: protocol + "://" + ipserver + "/getPrenotazioniInAttoUtente",
            headers: { 'Content-Type': 'application/json' },
            data: parametri
        }).then(function (response) {
            if (response.status == 200) {
                if (response.data.prenotazioniInAtto !== undefined) {
                    if ($scope.Parcheggi !== undefined && $scope.Parcheggi.length > 0) {
                        $scope.PrenotazioniUtente = response.data.prenotazioniInAtto;

                        for (var i = 0; i < $scope.PrenotazioniUtente.length; i++) {
                            $scope.PrenotazioniUtente[i].nomePosto = TipoPosto[$scope.PrenotazioniUtente[i].idPosto];
                            for (var j = 0; j < $scope.Parcheggi.length; j++)
                                if ($scope.PrenotazioniUtente[i].idParcheggio == $scope.Parcheggi[j].id) {
                                    $scope.PrenotazioniUtente[i].indirizzo = $scope.Parcheggi[j].indirizzo.via
                                        + ", " + $scope.Parcheggi[j].indirizzo.n_civico + ", "
                                        + $scope.Parcheggi[j].indirizzo.cap + ", "
                                        + $scope.Parcheggi[j].indirizzo.citta + " "
                                        + $scope.Parcheggi[j].indirizzo.provincia;
                                    break;
                                }
                        }

                        $("#prenotazioniModalLong").modal('show');
                    }
                    else {
                        getAllParcheggi();
                        if ($scope.Parcheggi !== undefined && $scope.Parcheggi.length > 0) {
                            $scope.PrenotazioniUtente = response.data.prenotazioniInAtto;

                            for (var i = 0; i < $scope.PrenotazioniUtente.length; i++) {
                                $scope.PrenotazioniUtente[i].nomePosto = TipoPosto[$scope.PrenotazioniUtente[i].idPosto];
                                for (var j = 0; j < $scope.Parcheggi.length; j++)
                                    if ($scope.PrenotazioniUtente[i].idParcheggio == $scope.Parcheggi[j].id) {
                                        $scope.PrenotazioniUtente[i].indirizzo = $scope.Parcheggi[j].indirizzo.via
                                            + ", " + $scope.Parcheggi[j].indirizzo.n_civico + ", "
                                            + $scope.Parcheggi[j].indirizzo.cap + ", "
                                            + $scope.Parcheggi[j].indirizzo.citta + " "
                                            + $scope.Parcheggi[j].indirizzo.provincia;
                                        break;
                                    }
                            }

                            $("#prenotazioniModalLong").modal('show');
                        }
                    }
                }
                else
                    alert("Errore sconosciuto!");
            }
            else
                alert("Errore sconosciuto!");
        }, function (response) {
            if (response.data != null && response.data.error !== undefined)
                alert(response.data.error.info);
            else
                alert("Server irraggiungibile.");
        });
    };

    $scope.resetCode = function (index) {
        if (confirm("Vuoi resettare il Codice di questa prenotazione ?")) {
            var parametri = {
                token: curToken.value,
                idPrenotazione: $scope.PrenotazioniUtente[index].idPrenotazione
            };

            $http({
                method: "PATCH",
                url: protocol + "://" + ipserver + "/resetQRCode",
                headers: { 'Content-Type': 'application/json' },
                data: parametri
            }).then(function (response) {
                if (response.status == 200) {
                    if (response.data.QRCODE !== undefined) {
                        if (response.data.successful !== undefined)
                            alert(response.data.successful.info);
                        $scope.PrenotazioniUtente[index].codice = response.data.QRCODE;
                    }
                    else
                        alert("Errore sconosciuto!");
                }
                else
                    alert("Errore sconosciuto!");
            }, function (response) {
                if (response.data != null && response.data.error !== undefined)
                    alert(response.data.error.info);
                else
                    alert("Server irraggiungibile.");
            });
        };
    };

    var Search = function () {
        var input = $("#inputSearch").val();
        var output = [];
        var i = 0;


        if ((input === undefined) || input.length < 1) {
            $scope.page = 1;
            $scope.Search = [];
            visualizza($scope.page, $scope.AllAutisti);
        }
        else
            if (searchFor == 1) {   // Cerca per nome
                $scope.AllAutisti.forEach(user => {
                    if (user.nome.toLowerCase().startsWith(input.toLowerCase())) {
                        output[i] = user;
                        i++;
                    }
                });
                $scope.page = 1;
                $scope.Search = output;
                visualizza($scope.page, output);
            }
            else
                if (searchFor == 2) {   // Cerca per cognome
                    $scope.AllAutisti.forEach(user => {
                        if (user.cognome.toLowerCase().startsWith(input.toLowerCase())) {
                            output[i] = user;
                            i++;
                        }
                    });
                    $scope.page = 1;
                    $scope.Search = output;
                    visualizza($scope.page, output);
                }
                else
                    if (searchFor == 3) {   // Cerca per ID
                        $scope.AllAutisti.forEach(user => {
                            if (user.id == input) {
                                output[i] = user;
                                i++;
                            }
                        });
                        $scope.page = 1;
                        $scope.Search = output;
                        visualizza($scope.page, output);
                    }
                    else
                        if (searchFor == 4) {   // Cerca per username
                            $scope.AllAutisti.forEach(user => {
                                if (user.username.toLowerCase().startsWith(input.toLowerCase())) {
                                    output[i] = user;
                                    i++;
                                }
                            });
                            $scope.page = 1;
                            $scope.Search = output;
                            visualizza($scope.page, output);
                        } else {
                            $scope.Search = [];
                            alert("Prima devi selezionare per cosa cercare.");
                        }
    };

    $("#cercaPerNome").click(function () {
        $("#cercaPerUtenti").text("Cerca per nome");
        searchFor = 1;
    });

    $("#cercaPerCognome").click(function () {
        $("#cercaPerUtenti").text("Cerca per cognome");
        searchFor = 2;
    });

    $("#cercaPerID").click(function () {
        $("#cercaPerUtenti").text("Cerca per id");
        searchFor = 3;
    });

    $("#cercaPerUsername").click(function () {
        $("#cercaPerUtenti").text("Cerca per username");
        searchFor = 4;
    });

    $("#inputSearch").keyup(function () {
        $scope.$applyAsync(Search);
    });

    $("#btnSearch").click(Search);

    var visualizza = function (pagina, users) {
        var user_for_page = 10;
        var start = user_for_page * (pagina - 1);
        var end = user_for_page * pagina;

        if (end > users.length)
            end = users.length;

        var app = [];
        var j = 0;

        for (var i = start; i < end; i++) {
            app[j] = users[i];
            j++;
        }

        $scope.Autisti = app;
    };

    $scope.Next = function () {
        var extra = 0;

        var vet = [];

        if ($scope.Search.length > 0)
            vet = $scope.Search;
        else
            vet = $scope.AllAutisti;

        if ((vet.length % 10) > 0)
            extra = 1;

        if ($scope.page + 1 <= (vet.length / 10) + extra) {
            $scope.page++;
            visualizza($scope.page, vet);
            $window.scrollTo(0, 0);
        }
    };

    $scope.Previous = function () {
        var vet = [];

        if ($scope.Search.length > 0)
            vet = $scope.Search;
        else
            vet = $scope.AllAutisti;

        if ($scope.page > 1) {
            $scope.page--;
            visualizza($scope.page, vet);
            $window.scrollTo(0, 0);
        }
    };
});

indexApp.controller('gestisciPrenotazioni', function ($scope, $http, $localStorage, $location) {
    if ($localStorage.XToken) {
        curToken = $localStorage.XToken;
        $scope.hideMenu(true);
    }

    menuSet(4);

});

indexApp.controller('gestisciParcheggiAdmin', function ($scope, $http, $localStorage, $location, $window) {
    if ($localStorage.XToken) {
        curToken = $localStorage.XToken;
        $scope.hideMenu(true);
    }

    $scope.aggiungiNuovoParcheggio = false;
    $scope.AllParcheggi = [];
    $scope.Parcheggi = [];
    $scope.Search = [];
    $scope.page = 1;
    searchFor = 1;
    menuSet(2);

    $http({
        method: "POST",
        url: protocol + "://" + ipserver + "/getAllBaseParcheggi",
        headers: { 'Content-Type': 'application/json' }
    }).then(function (response) {
        if (response.status == 200)
            if (response.data.parcheggi) {
                $scope.AllParcheggi = response.data.parcheggi;
                visualizza($scope.page, $scope.AllParcheggi);
            }
            else
                alert("Errore sconosciuto!");
        else
            alert("Errore sconosciuto.");

    }, function (response) {
        if (response.data != null && response.data.error !== undefined)
            alert(response.data.error.info);
        else
            alert("Server irraggiungibile.");
    });

    var IndexFromId = function (id) {
        var j;
        for (j = 0; j < $scope.AllParcheggi.length; j++)
            if ($scope.AllParcheggi[j].id == id)
                return j;
    };

    $scope.AggiungiNuovoParcheggio = function () {
        $scope.aggiungiNuovoParcheggio = true;
    };

    $scope.SalvaNuovoParcheggio = function (salva) {
        if (!salva)
            $scope.aggiungiNuovoParcheggio = false;
        else {
            var par = {
                token: curToken.value,
                parcheggio: {
                    indirizzo: {
                        citta: $("#cittaNuovo").val(),
                        provincia: $("#provinciaNuovo").val(),
                        cap: $("#capNuovo").val(),
                        via: $("#viaNuovo").val(),
                        n_civico: $("#n_civicoNuovo").val()
                    },
                    coordinate: {
                        x: $("#latitutineNuovo").val(),
                        y: $("#longitutineNuovo").val()
                    },
                    key: CryptoJS.SHA1($("#keyNuovo").val()).toString(),
                    tariffaOrariaLavorativi: $("#tariffaOrariaLavorativiNuovo").val(),
                    tariffaOrariaFestivi: $("#tariffaOrariaFestiviNuovo").val(),
                    nPostiMacchina: $("#nPostiMacchinaNuovo").val(),
                    nPostiAutobus: $("#nPostiAutobusNuovo").val(),
                    nPostiCamper: $("#nPostiCamperNuovo").val(),
                    nPostiMoto: $("#nPostiMotoNuovo").val(),
                    nPostiDisabile: $("#nPostiDisabileNuovo").val()
                }
            };

            if (isNaN(par.parcheggio.coordinate.x) || isNaN(par.parcheggio.coordinate.y)) {
                alert("Le coordinate inserite sono in un formato errato.");
                return;
            }

            $http({
                method: "POST",
                url: protocol + "://" + ipserver + "/addParcheggio",
                headers: { 'Content-Type': 'application/json' },
                data: par
            }).then(function (response) {
                if (response.status == 200)
                    if (response.data.successful !== undefined) {
                        par.parcheggio.id = response.data.id;
                        alert(response.data.successful.info);
                        $scope.aggiungiNuovoParcheggio = false;
                        $scope.AllParcheggi[$scope.AllParcheggi.length] = par.parcheggio;
                        visualizza($scope.page, $scope.AllParcheggi);
                    }
                    else
                        alert("Errore sconosciuto!");
                else
                    alert("Errore sconosciuto!");
            }, function (response) {
                if (response.data != null && response.data.error !== undefined)
                    alert(response.data.error.info);
                else
                    alert("Server irraggiungibile.");
            });
        }
    };

    $scope.EliminaParcheggio = function (index) {
        if (confirm("Sicuro di voler eliminare questo parcheggio ?\n(sarà impossibile eliminarlo se ci sono delle prenotazioni in corso)")) {
            var parametri = {
                token: curToken.value,
                id: $scope.Parcheggi[index].id
            };

            $http({
                method: "DELETE",
                url: protocol + "://" + ipserver + "/deleteParcheggio",
                headers: { 'Content-Type': 'application/json' },
                data: parametri
            }).then(function (response) {
                if (response.status == 200) {
                    if (response.data.successful !== undefined) {
                        for (var i = IndexFromId($scope.Parcheggi[index].id); i < $scope.AllParcheggi.length - 1; i++)
                            $scope.AllParcheggi[i] = $scope.AllParcheggi[i + 1];

                        $scope.AllParcheggi[$scope.AllParcheggi.length - 1] = null;
                        $scope.AllParcheggi.length = $scope.AllParcheggi.length - 1;
                        alert(response.data.successful.info);
                        visualizza($scope.page, $scope.AllParcheggi);
                        $window.scrollTo(0, 0);
                    }
                    else
                        alert("Errore sconosciuto!");
                }
                else
                    alert("Errore sconosciuto!");
            }, function (response) {
                if (response.data != null && response.data.error !== undefined)
                    alert(response.data.error.info);
                else
                    alert("Server irraggiungibile.");
            });
        }
    };

    $scope.ModificaParcheggio = function (index, value) {
        // Nascondo/Mostro i tasti relativi alla funzionalità richiesta
        if (value) {
            $("#citta" + index).removeAttr("disabled");
            $("#via" + index).removeAttr("disabled");
            $("#cap" + index).removeAttr("disabled");
            $("#n_civico" + index).removeAttr("disabled");
            $("#provincia" + index).removeAttr("disabled");
            $("#latitutine" + index).removeAttr("disabled");
            $("#longitutine" + index).removeAttr("disabled");
            $("#key" + index).removeAttr("disabled");
            $("#tariffaOrariaFestivi" + index).removeAttr("disabled");
            $("#tariffaOrariaLavorativi" + index).removeAttr("disabled");
            $("#nPostiMacchina" + index).removeAttr("disabled");
            $("#nPostiAutobus" + index).removeAttr("disabled");
            $("#nPostiCamper" + index).removeAttr("disabled");
            $("#nPostiMoto" + index).removeAttr("disabled");
            $("#nPostiDisabile" + index).removeAttr("disabled");

            $("#elimina" + index).hide();
            $("#modifica" + index).hide();
            $("#annulla" + index).show();
            $("#salva" + index).show();
        }
        else {
            $("#citta" + index).attr("disabled", "disabled");
            $("#via" + index).attr("disabled", "disabled");
            $("#cap" + index).attr("disabled", "disabled");
            $("#n_civico" + index).attr("disabled", "disabled");
            $("#provincia" + index).attr("disabled", "disabled");
            $("#latitutine" + index).attr("disabled", "disabled");
            $("#longitutine" + index).attr("disabled", "disabled");
            $("#key" + index).attr("disabled", "disabled");
            $("#tariffaOrariaFestivi" + index).attr("disabled", "disabled");
            $("#tariffaOrariaLavorativi" + index).attr("disabled", "disabled");
            $("#nPostiMacchina" + index).attr("disabled", "disabled");
            $("#nPostiAutobus" + index).attr("disabled", "disabled");
            $("#nPostiCamper" + index).attr("disabled", "disabled");
            $("#nPostiMoto" + index).attr("disabled", "disabled");
            $("#nPostiDisabile" + index).attr("disabled", "disabled");

            $("#elimina" + index).show();
            $("#modifica" + index).show();
            $("#annulla" + index).hide();
            $("#salva" + index).hide();

            //  Ripristino i valori originali
            $("#citta" + index).val($scope.Parcheggi[index].indirizzo.citta);
            $("#via" + index).val($scope.Parcheggi[index].indirizzo.via);
            $("#cap" + index).val($scope.Parcheggi[index].indirizzo.cap);
            $("#n_civico" + index).val($scope.Parcheggi[index].indirizzo.n_civico);
            $("#provincia" + index).val($scope.Parcheggi[index].indirizzo.provincia);
            $("#latitutine" + index).val($scope.Parcheggi[index].coordinate.x);
            $("#longitutine" + index).val($scope.Parcheggi[index].coordinate.y);
            $("#key" + index).val("");
            $("#tariffaOrariaFestivi" + index).val($scope.Parcheggi[index].tariffaOrariaFestivi);
            $("#tariffaOrariaLavorativi" + index).val($scope.Parcheggi[index].tariffaOrariaLavorativi);
            $("#nPostiMacchina" + index).val($scope.Parcheggi[index].nPostiMacchina);
            $("#nPostiAutobus" + index).val($scope.Parcheggi[index].nPostiAutobus);
            $("#nPostiCamper" + index).val($scope.Parcheggi[index].nPostiCamper);
            $("#nPostiMoto" + index).val($scope.Parcheggi[index].nPostiMoto);
            $("#nPostiDisabile" + index).val($scope.Parcheggi[index].nPostiDisabile);
        }
    };

    $scope.SalvaParcheggio = function (index) {
        newKey = $scope.Parcheggi[index].key;

        if ($("#key" + index).val() !== undefined && $("#key" + index).val().length > 0)
            newKey = CryptoJS.SHA1($("#key" + index).val()).toString();

        var parametri = {
            token: curToken.value,
            parcheggio: {
                id: $scope.Parcheggi[index].id,
                indirizzo: {
                    citta: $("#citta" + index).val() || $scope.Parcheggi[index].indirizzo.citta,
                    provincia: $("#provincia" + index).val() || $scope.Parcheggi[index].indirizzo.provincia,
                    cap: $("#cap" + index).val() || $scope.Parcheggi[index].indirizzo.cap,
                    via: $("#via" + index).val() || $scope.Parcheggi[index].indirizzo.via,
                    n_civico: $("#n_civico" + index).val() || $scope.Parcheggi[index].indirizzo.n_civico
                },
                key: newKey,
                coordinate: {
                    x: $("#latitutine" + index).val() || $scope.Parcheggi[index].coordinate.x,
                    y: $("#longitutine" + index).val() || $scope.Parcheggi[index].coordinate.y
                },
                tariffaOrariaLavorativi: $("#tariffaOrariaLavorativi" + index).val() || $scope.Parcheggi[index].tariffaOrariaFestivi,
                tariffaOrariaFestivi: $("#tariffaOrariaFestivi" + index).val() || $scope.Parcheggi[index].tariffaOrariaLavorativii
            }
        };

        if (isNaN(parametri.parcheggio.coordinate.x))
            parametri.parcheggio.coordinate.x = $scope.Parcheggi[index].coordinate.x;

        if (isNaN(parametri.parcheggio.coordinate.y))
            parametri.parcheggio.coordinate.y = scope.Parcheggi[index].coordinate.y;

        if ($("#nPostiMacchina" + index).val() != $scope.Parcheggi[index].nPostiMacchina ||
            $("#nPostiAutobus" + index).val() != $scope.Parcheggi[index].nPostiAutobus ||
            $("#nPostiCamper" + index).val() != $scope.Parcheggi[index].nPostiCamper ||
            $("#nPostiMoto" + index).val() != $scope.Parcheggi[index].nPostiMoto ||
            $("#nPostiDisabile" + index).val() != $scope.Parcheggi[index].nPostiDisabile) {
            parametri.parcheggio.nPostiMacchina = $("#nPostiMacchina" + index).val() || $scope.Parcheggi[index].nPostiMacchina;
            parametri.parcheggio.nPostiAutobus = $("#nPostiAutobus" + index).val() || $scope.Parcheggi[index].nPostiAutobus;
            parametri.parcheggio.nPostiCamper = $("#nPostiCamper" + index).val() || $scope.Parcheggi[index].nPostiCamper;
            parametri.parcheggio.nPostiMoto = $("#nPostiMoto" + index).val() || $scope.Parcheggi[index].nPostiMoto;
            parametri.parcheggio.nPostiDisabile = $("#nPostiDisabile" + index).val() || $scope.Parcheggi[index].nPostiDisabile;
        }

        $http({
            method: "PATCH",
            url: protocol + "://" + ipserver + "/aggiornaParcheggio",
            headers: { 'Content-Type': 'application/json' },
            data: parametri
        }).then(function (response) {
            if (response.status == 200)
                if (response.data.successful !== undefined) {
                    alert(response.data.successful.info);

                    if (parametri.parcheggio.nPostiMacchina === undefined) {
                        parametri.parcheggio.nPostiMacchina = $scope.Parcheggi[index].nPostiMacchina;
                        parametri.parcheggio.nPostiAutobus = $scope.Parcheggi[index].nPostiAutobus;
                        parametri.parcheggio.nPostiCamper = $scope.Parcheggi[index].nPostiCamper;
                        parametri.parcheggio.nPostiMoto = $scope.Parcheggi[index].nPostiMoto;
                        parametri.parcheggio.nPostiDisabile = $scope.Parcheggi[index].nPostiDisabile;
                    }
                    //  Setto i nuovi valori
                    $scope.Parcheggi[index] = parametri.parcheggio;
                    $scope.AllParcheggi[IndexFromId(parametri.parcheggio.id)] = parametri.parcheggio;
                    if ($scope.Search.length > 0)
                        $scope.Search[(($scope.page - 1) * 10) + index] = parametri.parcheggio;
                    $scope.ModificaParcheggio(index, false);
                }
                else
                    alert("Errore sconosciuto!");
            else
                alert("Errore sconosciuto!");
        }, function (response) {
            $scope.ModificaParcheggio(index, false);
            if (response.data != null && response.data.error !== undefined)
                alert(response.data.error.info);
            else
                alert("Server irraggiungibile.");
        });
    };


    var visualizza = function (pagina, parche) {
        var park_for_page = 10;
        var start = park_for_page * (pagina - 1);
        var end = park_for_page * pagina;

        if (end > parche.length)
            end = parche.length;

        var app = [];
        var j = 0;

        for (var i = start; i < end; i++) {
            app[j] = parche[i];
            j++;
        }

        $scope.Parcheggi = app;
    };

    $scope.Next = function () {
        var extra = 0;

        var vet = [];

        if ($scope.Search.length > 0)
            vet = $scope.Search;
        else
            vet = $scope.AllParcheggi;

        if ((vet.length % 10) > 0)
            extra = 1;

        if ($scope.page + 1 <= (vet.length / 10) + extra) {
            $scope.page++;
            visualizza($scope.page, vet);
            $window.scrollTo(0, 0);
        }
    };

    $scope.Previous = function () {
        var vet = [];

        if ($scope.Search.length > 0)
            vet = $scope.Search;
        else
            vet = $scope.AllParcheggi;

        if ($scope.page > 1) {
            $scope.page--;
            visualizza($scope.page, vet);
            $window.scrollTo(0, 0);
        }
    };

    var Search = function () {
        var input = $("#inputSearch2").val();
        var output = [];
        var i = 0;


        if ((input === undefined) || input.length < 1) {
            $scope.page = 1;
            $scope.Search = [];
            visualizza($scope.page, $scope.AllParcheggi);
        }
        else
            if (searchFor == 1) {   // Cerca per città
                $scope.AllParcheggi.forEach(par => {
                    if (par.indirizzo.citta.toLowerCase().startsWith(input.toLowerCase())) {
                        output[i] = par;
                        i++;
                    }
                });
                $scope.page = 1;
                $scope.Search = output;
                visualizza($scope.page, output);
            }
            else
                if (searchFor == 2) {   // Cerca per provincia
                    $scope.AllParcheggi.forEach(par => {
                        if (par.indirizzo.provincia.toLowerCase().startsWith(input.toLowerCase())) {
                            output[i] = par;
                            i++;
                        }
                    });
                    $scope.page = 1;
                    $scope.Search = output;
                    visualizza($scope.page, output);
                }
                else
                    if (searchFor == 3) {   // Cerca per ID
                        $scope.AllParcheggi.forEach(par => {
                            if (par.id == input) {
                                output[i] = par;
                                i++;
                            }
                        });
                        $scope.page = 1;
                        $scope.Search = output;
                        visualizza($scope.page, output);
                    }
                    else {
                        $scope.Search = [];
                        alert("Prima devi selezionare per cosa cercare.");
                    }
    };

    $scope.ModalPrenotazioni = function (index) {
        var parametri = {
            token: curToken.value,
            idParcheggio: $scope.Parcheggi[index].id
        };

        var indir = $scope.Parcheggi[index].indirizzo.via + ", "
            + $scope.Parcheggi[index].indirizzo.n_civico + ", "
            + $scope.Parcheggi[index].indirizzo.cap + ", "
            + $scope.Parcheggi[index].indirizzo.citta + " "
            + $scope.Parcheggi[index].indirizzo.provincia;

        $http({
            method: "POST",
            url: protocol + "://" + ipserver + "/getPrenotazioniPagateParcheggio",
            headers: { 'Content-Type': 'application/json' },
            data: parametri
        }).then(function (response) {
            if (response.status == 200) {
                if (response.data.prenotazioniPagate !== undefined) {
                    $scope.PrenotazioniParcheggio = response.data.prenotazioniPagate;

                    for (var i = 0; i < $scope.PrenotazioniParcheggio.length; i++) {
                        $scope.PrenotazioniParcheggio[i].nomePosto = TipoPosto[$scope.PrenotazioniParcheggio[i].tipoParcheggio];
                        $scope.PrenotazioniParcheggio[i].indirizzo = indir;
                    }

                    $("#prenotazioniModalLong").modal('show');
                }
                else
                    alert("Errore sconosciuto!");
            }
            else
                alert("Errore sconosciuto!");
        }, function (response) {
            if (response.data != null && response.data.error !== undefined)
                alert(response.data.error.info);
            else
                alert("Server irraggiungibile.");
        });
    };

    $("#cercaPerCitta").click(function () {
        $("#cercaPerParcheggi").text("Cerca per città");
        searchFor = 1;
    });

    $("#cercaPerProvincia").click(function () {
        $("#cercaPerParcheggi").text("Cerca per provincia");
        searchFor = 2;
    });

    $("#cercaPerIDpar").click(function () {
        $("#cercaPerParcheggi").text("Cerca per id");
        searchFor = 3;
    });

    $("#inputSearch2").keyup(function () {
        $scope.$applyAsync(Search);
    });

    $("#btnSearch2").click(Search);
});

indexApp.controller('gestisciLogout', function ($scope, $location, $localStorage) {
    $scope.hideMenu(false);
    curToken = { value: "", enable: false };
    $localStorage.XToken = null;
    $location.path('/');
});


indexApp.controller('gestisciLogin', function ($scope, $http, $location, $localStorage) {
    if ($localStorage.XToken) {
        curToken = $localStorage.XToken;
        $scope.hideMenu(true);
        menuSet(2);
        $location.path('/mainAdmin');
    }

    menuSet();

    //   Autenticazione via token (se si è precedentementi loggati)
    if (curToken.enable == true) {
        $http({
            method: "POST",
            url: protocol + "://" + ipserver + "/mainAdmin",
            headers: { 'Content-Type': 'application/json' },
            data: { 'token': curToken.value }
        }).then(function (response) {
            if (response.status == 200) {
                if (response.data.successful !== undefined) {
                    alert(response.data.message);
                    $location.path('/home');
                }
                else
                    alert("Errore sconosciuto!");
            }
            else
                alert("Errore sconosciuto!");
        }, function (response) {
            if (response.data != null && response.data.error !== undefined)
                alert(response.data.error.info);
            else
                alert("Server irraggiungibile.");
        });
    }

    // funzione per l'invio dei dati di login a node
    $scope.login = function () {
        if ($scope.username == undefined || $scope.password == undefined)
            return;

        var parametri = {
            username: $scope.username,
            password: CryptoJS.SHA1($scope.password).toString(),
            admin: true
        };

        $http({
            method: "POST",
            url: protocol + "://" + ipserver + "/login",
            headers: { 'Content-Type': 'application/json' },
            data: parametri
        }).then(function (response) {
            if (response.status == 200) {
                if (!response.data.admin || !response.data.token)
                    alert("Si è verificato un errore nella richiesta di autenticazione!");
                else {
                    curToken.value = response.data.token;
                    curToken.enable = true;
                    $localStorage.admin = response.data.admin;
                    $scope.hideMenu(true);
                    $localStorage.XToken = curToken;
                    $location.path('/mainAdmin');
                }
            }
        }, function (response) {
            if (response.data != null && response.data.error !== undefined)
                alert(response.data.error.info);
            else
                alert("Server irraggiungibile.");
        });
    }
});

indexApp.controller("gestisciSingup", function ($scope, $http, $location, $localStorage) {
    // Tolgo l'ora dal datetime per la data di nascita dell' utente
    $('#datanascita').datetimepicker({
        format: 'YYYY/MM/DD'
    });

    menuSet();

    $("#logoUnicam").click(function () {
        $scope.$applyAsync(function () {
            $location.path('/login');
        });
    });

    $scope.message = "Registrati";

    $scope.registra = function () {

        $scope.datanascita = $('#nascita').val(); // Non riesco ad ottenerlo diversamente

        var parametri = {
            autista: {
                username: $scope.username,
                password: CryptoJS.SHA1($scope.password).toString(),
                email: $scope.email,
                nome: $scope.nome,
                cognome: $scope.cognome,
                dataDiNascita: $scope.datanascita,
                telefono: $scope.telefono
            }
        };

        $http({
            method: "POST",
            url: protocol + "://" + ipserver + "/signup",
            headers: { 'Content-Type': 'application/json' },
            data: parametri
        }).then(function (response) {
            if (response.status == 200) {
                if (response.data.successful !== undefined) {
                    alert(response.data.successful.info);
                    $location.path('/');
                }
                else
                    alert("Errore sconosciuto!");
            }
            else
                alert("Errore sconosciuto!");
        }, function (response) {
            if (response.data != null && response.data.error !== undefined)
                alert(response.data.error.info);
            else
                alert("Server irraggiungibile.");
        });
    };
});