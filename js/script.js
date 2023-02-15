const playButton = document.getElementById("spela-knapp");
const namnInput = document.getElementById("spelare-namn");
const statusText = document.getElementById("dator-vs");

const pScore = document.getElementById("spelare-score");
const cScore = document.getElementById("comp-score");
const resultatStatus = document.getElementById("resultat-status");
const highScoreList = document.querySelector("ol");

//funktion som gör så att när playButton är klickad de gör den tar value från input och lägger den på en variabel som heter spelareNamn. Det gömmer öven input fiel, play button och status text.

playButton.onclick = function (event) {
  event.preventDefault();
  const spelareNamn = namnInput.value;
  statusText.textContent += spelareNamn;
  document.getElementById("namn-input").style.display = "none";
  namnInput.style.display = "none";
  playButton.style.display = "none";
  console.log(spelareNamn);
};

let pVal;
let cVal;
let spelarVinst;
let highscore = 0;

const sten = document.getElementById("sten-btn");
const påse = document.getElementById("påse-btn");
const sax = document.getElementById("sax-btn");

const STEN = "STEN";
const PÅSE = "PÅSE";
const SAX = "SAX";

//Koden lägger till händelseavlyssnare till tre HTML-element med ID:n "sten", "påse" och "sax". När varje element klickas anropas motsvarande anonyma funktion, som anropar handleButton-funktionen med argumentet som motsvarar det konstanta värdet på den klickade(pressed) knappen ("STEN", "PÅSE", eller "SAX").

function handleButton(buttonVal) {
  pVal = buttonVal;
  valueResults();
}

sten.addEventListener("click", function (event) {
  event.preventDefault();
  handleButton(STEN);
});

påse.addEventListener("click", function (event) {
  event.preventDefault();
  handleButton(PÅSE);
});

sax.addEventListener("click", function (event) {
  event.preventDefault();
  handleButton(SAX);
});

//Detta är en funktion som hämtar highscore från firebase och visar den på sidan.

const url = `https://javascript2-miniprojekt1-default-rtdb.europe-west1.firebasedatabase.app/highscoresArray.json`;

async function visaHighScore() {
  const response = await hämtaHighscores();
  const highscoresArray = Object.values(response);
  console.log(highscoresArray);
  function jämföraTvåRes(score1, score2) {
    return score2.score - score1.score;
  }
  highscoresArray.sort(jämföraTvåRes);
  if (highScoreList) {
    highScoreList.innerHTML = "";
  }
  
  if (highscoresArray.length > 0) {
    const highestScore = highscoresArray[0];
    const listItem = document.createElement("li");
    listItem.textContent = `${highestScore.name} ${highestScore.score}`;
    if (highScoreList) {
      highScoreList.appendChild(listItem);
    }
  }
}



visaHighScore();

//Detta är en funktion som jämför spelarens val med datorns val. Den visar sedan vem som vann eller om det var oavgjort.

async function valueResults() {
  const cVal = await visaDatorVal();
  let vinnare;
  if (pVal === cVal) {
    vinnare = "Ingen har vunnit!";
  } else if (
    (pVal === STEN && cVal === PÅSE) ||
    (pVal === SAX && cVal === STEN) ||
    (pVal === PÅSE && cVal === SAX)
  ) {
    vinnare = "";
    spelaOm();
    let obj = {};
    obj.name = namnInput.value;
    obj.score = spelarVinst;
    sparaResultat(obj);
  } else {
    spelarVinst++;
    if (
      highscore &&
      highscore.length &&
      spelarVinst > highscore[highscore.length - 1].score
    ) {
      //sparaResultat({ name: namnInput.value, score: spelarVinst });
    }
    vinnare = "DU VANN!";
  }
  resultatStatus.textContent = `Datorn valde ${cVal} och du valde ${pVal}! ${vinnare}`;
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

//Detta är en funktion som sparar poängen till ett API. Det krävs ett argument. Funktionen använder hämtning för att skicka en POST-förfrågan med poängen som body. Om det misslyckas, ger det ett fel och loggar det i konsolen.

async function sparaResultat(score) {
  const options = {
    method: "POST",
    body: JSON.stringify(score),
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

