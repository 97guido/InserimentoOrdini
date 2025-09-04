var tot = 0;
var loading = false;

function init() {
    checkLogin()
    setButtonNames();
    setAllItems();
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkLogin() {

    try {
        var lpsw = getCookie("loginPsw")
        if (lpsw == "") {
            var c = prompt("Inserisci password").toString()
            var encryptKey = CryptoJS.AES.decrypt("U2FsdGVkX191/cxdxSAF8AHQKnNjc4A17PLR0eEmdc9PWn0V4DC1jQownWm/YKg5KSErz+ns3JjfS+2+fHieLQ==", c).toString(CryptoJS.enc.Utf8)
            c = "";
            document.cookie = `loginPsw=${encryptKey};`
            lpsw = encryptKey;
        }

        var decriptedSecret = CryptoJS.AES.decrypt("U2FsdGVkX1+tfPI7bxB+DlvTTL8RJUMbhXBohfxyF1EIwAjJNKmIMJoofuxCsVjqdOlKkqleH4gIqw+CmcNuiw==", lpsw).toString(CryptoJS.enc.Utf8)
        if ( decriptedSecret == "SWYzFgxbv1LcLOlOcqFIUXKpWj8JYF5k") {
            // Login authorized
        }
        else {
            document.cookie = "loginPsw=;";
            lpsw = "";
            checkLogin();
        }
    }
    catch (ex) {
        checkLogin();
    }
}

function setAllItems() {

    items.forEach(item => {

        var newDiv = createListItem(item);
    
        if (item.categorie.includes("cibo")) document.querySelectorAll('#div_mangiare')[0].appendChild(newDiv);
        if (item.categorie.includes("bar")) document.querySelectorAll('#div_bere')[0].appendChild(newDiv);
        if (item.categorie.includes("cibo") && item.categorie.includes("bar")) {
            var newDivDup = createListItem(item);
            document.querySelectorAll('#div_mangiare')[0].appendChild(newDivDup);
        };
    });   
}

function createListItem(item) {
    var newDiv = document.createElement('div');
    newDiv.classList.add("itemBox");

    var newBtn = document.createElement('input');
    newBtn.id = item.id_num.replaceAll('num_', 'btn_');
    newBtn.type = "button";
    newBtn.value = item.name;
    newBtn.style.background = item.colore;
    newBtn.classList.add("label_btn");
    newBtn.onclick = function() { addToItem(item.id_num) };
    
    var newBtnDel = document.createElement('input');
    newBtnDel.value = "-";
    newBtnDel.type = "button";
    newBtnDel.classList.add("del_btn");
    newBtnDel.onclick = function() { removeToItem(item.id_num) };
    
    var newNum = document.createElement('input');
    newNum.id = item.id_num;
    newNum.type = "number";
    newNum.value = 0;
    newNum.oninput = function() { updateNumber(item.id_num) };

    newDiv.appendChild(newBtn);
    newDiv.appendChild(newBtnDel);
    newDiv.appendChild(newNum);

    return newDiv;
}


function setButtonNames() {
    document.querySelectorAll('div > div > div > input[type=button]').forEach(el => {
        if (el.id != '') {
            var idToFind = el.id.replaceAll('btn_','num_');
            items.forEach(item => {
                if (idToFind == item.id_num) el.value = item.name;
            });
        }
    });
}

function addToItem(idItem) {
    
    var numItem = -1;
    
    items.forEach((el, index) => {
        if (el.id_num == idItem) numItem = index;
    });

    if (numItem == -1) return;

    ++(items[numItem].quantita);
    document.getElementById(items[numItem].id_num).value = items[numItem].quantita;
    updateConto();
}

function removeToItem(idItem) {

    var numItem = -1;
    
    items.forEach((el, index) => {
        if (el.id_num == idItem) numItem = index;
    });

    if (numItem == -1) return;

    if (items[numItem].quantita < 1) return;
    --(items[numItem].quantita);
    document.getElementById(items[numItem].id_num).value = items[numItem].quantita;
    updateConto();
}

function updateNumber(idItem) {

    var numItem = -1;
    
    items.forEach((el, index) => {
        if (el.id_num == idItem) numItem = index;
    });

    if (numItem == -1) return;

    var qty = Number(document.getElementById(items[numItem].id_num).value);
    if (qty < 0) qty = 0;
    items[numItem].quantita = qty;
    updateConto();
}

function updateConto() {
    tot = 0;
    
    items.forEach(el => {
        tot += el.prezzo * el.quantita;

        if (document.getElementById(el.id_num) != undefined) {
            document.getElementById(el.id_num).value = el.quantita;

            document.querySelectorAll(`#${el.id_num}`).forEach(node => {
                node.value = el.quantita;
            });

            if (el.quantita > 0) {
                document.querySelectorAll(`#${el.id_num.replaceAll('num_', 'btn_')}`).forEach(node => { node.style.background = '#71c06a'; });
                document.querySelectorAll(`#${el.id_num}`).forEach(node => { node.style.background = '#71c06a'; });
            }
            else {
                document.querySelectorAll(`#${el.id_num.replaceAll('num_', 'btn_')}`).forEach(node => { node.style.background = el.colore; });
                document.querySelectorAll(`#${el.id_num}`).forEach(node => { node.style.background = 'white'; });
            }
        }




    });
    document.getElementById('totBox').innerHTML = `Totale € ${tot.toFixed(2)}`.replaceAll('.', ',');
}

function confermaOrdine() {

    if (items.filter(x => x.quantita > 0).length < 1) return

    fetch('https://script.google.com/macros/s/AKfycbxgGI0HYYoNvC1s7ffy8oDHt4kPAD4I0Dh_miuAJq2wEWG4W800ARNxim-pBLoEjk7kYQ/exec?content=json',
    {
        method: 'POST',
        body: `{ 
            "tot": ${tot},
            "items": ${JSON.stringify(items.filter(x => x.quantita > 0))} 
        }`
    }
  ) // Example API call
   .then(response => response.text())
   .then(data => {
      console.log('Data from API:', data);
      azzeraCampi()
      loadingEnd()
      // Process the response data
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      loadingEnd()
    });

    loadingStart()

    
}

function azzeraCampi() {

    tot = 0;
    items.forEach(el => {
        el.quantita = 0;
    });
    document.getElementById('totBox').innerHTML = 'Totale:';
    updateConto();
}

function loadingStart() {
    if (!loading) {
        loading = true
    }
    document.getElementById("main_div").style.display = 'none'
    document.getElementById("loading_div").style.display = 'block'
}

function loadingEnd() {
    if (loading) {
        loading = false
    }
    document.getElementById("main_div").style.display = 'block'
    document.getElementById("loading_div").style.display = 'none'
}