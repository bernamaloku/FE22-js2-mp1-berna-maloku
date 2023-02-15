const playButton = document.getElementById("spela-knapp");
const namnInput = document.getElementById("spelare-namn");
const statusText = document.getElementById("dator-vs");

const pScore = document.getElementById("spelare-score");
const cScore = document.getElementById("comp-score");
const resultatStatus = document.getElementById("resultat-status");
const highScoreList = document.querySelector("ol");


playButton.onclick = async function (event) {
  event.preventDefault();
  const spelareNamn = namnInput.value;
  statusText.textContent += spelareNamn;
  document.getElementById("namn-input").style.display = "none";
  namnInput.style.display = "none";
  playButton.style.display = "none";
  console.log(spelareNamn);
  let obj = { name: spelareNamn, score: 0 };
  await sparaResultat(obj);
};

let pVal;
let cVal;
let spelarVinst = 0;
let arrayList = [];

const sten = document.getElementById("sten-btn");
const påse = document.getElementById("påse-btn");
const sax = document.getElementById("sax-btn");

const STEN = "STEN";
const PÅSE = "PÅSE";
const SAX = "SAX";

//Koden lägger till händelseavlyssnare till tre HTML-element med ID:n "sten", "påse" och "sax". När varje element klickas anropas motsvarande anonyma funktion, som anropar handleButton-funktionen med argumentet som motsvarar det konstanta värdet på den klickade(pressed) knappen ("STEN", "PÅSE", eller "SAX").

async function handleButton(buttonVal) {
  pVal = buttonVal;
  await valueResults();
}

sten.addEventListener("click", async function (event) {
  event.preventDefault();
  await handleButton(STEN);
});

påse.addEventListener("click", async function (event) {
  event.preventDefault();
  await handleButton(PÅSE);
});

sax.addEventListener("click", async function (event) {
  event.preventDefault();
  await handleButton(SAX);
});

//Detta är en funktion som hämtar highscore från firebase och visar den på sidan.

const url = `https://js2-mp1-7c90e-default-rtdb.europe-west1.firebasedatabase.app/users.json`;

async function visaHighScore() {
  if (highScoreList) {
    highScoreList.innerHTML = "";
  }
  if (arrayList.length > 0) {
    for (let i = 0; i < 5 && i < arrayList.length; i++) {
      const listItem = document.createElement("li");
      listItem.textContent = `${arrayList[i].name} ${arrayList[i].score}`;
      highScoreList.appendChild(listItem);
    }
  }
}

visaHighScore();

//Detta är en funktion som jämför spelarens val med datorns val. Den visar sedan vem som vann eller om det var oavgjort.

async function valueResults() {
  const cVal = visaDatorVal();
  let vinnare;
  if (pVal === cVal) {
    vinnare = "Ingen har vunnit!";
  } else if (
    (pVal === STEN && cVal === PÅSE) ||
    (pVal === SAX && cVal === STEN) ||
    (pVal === PÅSE && cVal === SAX)
  ) {
    vinnare = "Datorn vann över dig! :/";
    spelaOm();
  } else {
    spelarVinst++;
    vinnare = "DU VANN!";
    let obj = { name: namnInput.value, score: spelarVinst };
    await sparaResultat(obj);
  }
  resultatStatus.textContent = `Datorn valde ${cVal} och du valde ${pVal}! ${vinnare} `;
  slutaSpel();
}

//Detta är en funktion som returnerar ett slumpmässigt värde från en array. Funktionen tar inga argument. Funktionen använder Math-objektet för att generera ett slumptal mellan 0 och 2, som sedan används som ett index för value arrayn.

function visaDatorVal() {
  const values = ["STEN", "PÅSE", "SAX"];
  const randomIndex = Math.floor(Math.random() * values.length);
  return values[randomIndex];
}
function slutaSpel() {
  if (pScore) {
    pScore.textContent = spelarVinst;
  }
}

//Detta är en funktion som hämtar data från ett API och returnerar det.
async function hämtaHighscores() {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

//Detta är en funktion som sparar poängen till ett API. Det krävs ett argument. Funktionen använder hämtning för att skicka en PUT-förfrågan med poängen som body. Om det misslyckas, ger det ett fel och loggar det i konsolen.

async function hämtaLista() {
  const fetchUrl = await fetch(url);
  const data = await fetchUrl.json();
  const användare = Object.values(data);
  arrayList = användare;
}

function uppdateraAnvandare(obj) {
  return arrayList.some((user) => {
    if (user.name === obj.name) {
      if (obj.score > user.score) user.score = obj.score;
      return true;
    }
  });
}

async function sparaResultat(score) {
  await hämtaLista();

  if (!uppdateraAnvandare(score)) {
    arrayList.push(score);
  }

  function jämföraTvåRes(score1, score2) {
    return score2.score - score1.score;
  }
  arrayList.sort(jämföraTvåRes);

  const options = {
    method: "PUT",
    body: JSON.stringify(arrayList),
    headers: {
      "content-type": "application/json; charset=UTF-8",
    },
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Kunde ej spara poäng: ${response.status}`);
    }
    await visaHighScore();
  } catch (error) {
    console.error(error);
  }
}

//Detta är en funktion som återställer poängen till 0. Den tar inga argument och returnerar ingenting. Funktionen använder två andra funktioner, uppdateraPoäng och uppdateraText, för att uppdatera poängen i DOM.
function spelaOm() {
  spelarVinst = 0;
  uppdateraPoäng(pScore, spelarVinst);
  uppdateraText(resultatStatus, "");
}

function uppdateraPoäng(element, value) {
  element.textContent = value;
}

function uppdateraText(element, text) {
  element.textContent = text;
}
