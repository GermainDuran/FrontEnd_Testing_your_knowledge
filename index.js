//Welcome pague
const helloPage = document.getElementById('hello-page')
const triviaPage = document.getElementById('trivia-page')
const gameOverPage = document.getElementById('game-over-page')

function displayHelloPage() {
    document.getElementById('hello-page').style.display = "block";
    document.getElementById('trivia-page').style.display = "none";
    document.getElementById('game-over-page').style.display = "none";
}//displayHelloPage


// con este evento lo que estoy haciendo es escuchar cuando el usuario le da click al boton START
// cuando le da click entonces utilizo la funcion de desplegar las preguntas que comienze el juego.
helloPage.addEventListener('click', function(event) {
  //debugger
    if(event.target.id === "start-button") {
        displayTriviaPage()
    }
})//helloPage addEventListener

// estoy invocando la funcion de welcome pague
displayHelloPage()
//******** END HELLO PAGE ***********
//****BEGIN TRIVIA PAGE **************************

//tengo un evento escuchando al boton salir por que debo revisar si el usuario quiere salir o
// si presiona salir entonces utilizo mi funcion de juego terminado
function displayTriviaPage() {
    document.getElementById('hello-page').style.display = "none";
    document.getElementById('trivia-page').style.display = "block";
    document.getElementById('game-over-page').style.display = "none";

    triviaPage.addEventListener('click', function(event) {
      //debugger
        if(event.target.id === "exit-button") {
            displayGameOverPage()
        }
    })
}

// utilizo esta funcion para obtener todas mis preguntas que las tengo en mi db con rails

function getAllQuestions(){
  return fetch('http://localhost:3000/api/v1/questions')
  .then(resp=>resp.json())
  .then(renderQuestions)
}

// con esta funcion cambio el orden de aparecer de las preguntas, por eso cada vez que corro el programa
// aparecen en distinto orden
function randomQuestion(array){
  let question = array[Math.floor( Math.random()*array.length)];
  let questionIndex = array.indexOf(question)
  array.splice(questionIndex, 1);
  return question;
}//end randomQuestion


// aqui lo que estoy haciendo es creando un evento para cuando el boton de siguiente pregunta sea clicked
const currentQuestion = document.getElementById('trivia-question-title')
function renderQuestions(questions) {
  let q = randomQuestion(questions)
  renderOneQuestion(q)
  triviaPage.addEventListener('click', function(event) {
      //debugger
      if(event.target.id === "next-button") {
          let q = randomQuestion(questions)
          renderOneQuestion(q)
          //add in the function that would go to the next question
      }
  })//eventListener
}//end renderQuestions

let userScore = 0
let questionCounter = 0
const triviaScore = document.getElementById('trivia-score')
triviaScore.innerHTML = `Score: ${userScore}`
////begin new

// con esta funcion es encargada para cuando una pregunta en el browser
// la desplego con mi h3 y luego para crear las respuesta utilizo mi funcion de crear respuestas pasandole la
//pregunta
function renderOneQuestion(q){
  // console.log(q)
  // debugger
  if (questionCounter < 10){
    // debugger
    currentQuestion.innerHTML = `
        <h3 id="trivia-question-title">Question: ${q.question}</h3>
        <form action=""  id="trivia-answer-choices">
            ${createAnswers(q)}
        </form>
    `
    questionCounter++
    document.querySelector('#trivia-answer-choices').addEventListener('change', function(event) {
        if(event.target.value === "true") {
          userScore +=1
          triviaScore.innerHTML = `Current Score: ${userScore}`
          // aqui despliego mi alerta con el mensaje de que fue correcto or incorrecto y el tiempo es 2000
          $("div#right_alert").show()
          setTimeout(hideAlert, 2000)

        } else {
          $("div#wrong_alert").show()
          setTimeout(hideAlert, 2000)
        }
        $("input[type=radio]").attr('disabled', true);
    })
  } else if(questionCounter === 10){

    displayGameOverPage()
  }
}

function hideAlert(){
  if ($("div#right_alert").show()){
    $("div#right_alert").hide()
  }
  if ($("div#wrong_alert").show()){
    $("div#wrong_alert").hide()
  }
}//end HideAlert

// con esta funcion creo las respuestas de la pregunta, utilizo un for para iterate por mis 4 respuestas
function createAnswers(q) {
    const answers = q.choices
    let myAnswers = ``
    for(let answer of answers) {
        let theAnswer = answer.answer_choice
        let rightOrWrong = answer.is_correct

        const oneAnswer = `<input type="radio" name="answers" value=${rightOrWrong}> ${theAnswer}<br>`
        myAnswers += oneAnswer
    }
    return myAnswers
}//end createAnswers
// estoy invocando a esta funcion para finalmente obtener las preguntas desplegada en la pantalla
getAllQuestions()


//juego terminado
// Aqui estoy un evento para cuando el juego se termina y el usuario presiona volver a jugar se vaya a la
// pagina inicial y poder volver a comenzzar
gameOverPage.addEventListener('click', function(event) {

  if(event.target.id === "again-button") {

    displayHelloPage()
    userScore = 0
    questionCounter = 0
    triviaScore.innerHTML = `Current Score: ${userScore}`
    let buttonElement = document.getElementById("form-submit-button")
    buttonElement.disabled = false
    //make a toggle function for turn true/false
    getAllQuestions()

    }
  })// start game over button
function displayGameOverPage() {
    document.getElementById('hello-page').style.display = "none";
    document.getElementById('trivia-page').style.display = "none";
    document.getElementById('game-over-page').style.display = "block";

  const currentUserFinalScore = document.getElementById('current-user-final-score')
  currentUserFinalScore.innerText = `You scored: ${userScore} out of 10 Questions`

  gameOverPage.addEventListener('submit', addUserNameAndScore)
  // Aqui estoy haciendo un post porque debo guardar al usuario y su puntaje
  function addUserNameAndScore(event){
    event.preventDefault();
    let userName = event.target.parentElement.children[4].children[0].value
    fetch(`http://localhost:3000/api/v1/games`, {
      method: "Post",
      headers: {
        'Content-Type':'application/json'
      },
      body: JSON.stringify({
        username: userName,
        score: userScore
      })
    })
    .then(resp=> resp.json())
    .then(getAllGames)
    .then(disableSubmitButton)

    function getAllGames(){
      return fetch('http://localhost:3000/api/v1/games')
        .then(resp=>resp.json())
        .then(sortGames)
    }//getAllGames

    // aqui estoy ordenando la tabla de los usuarios y su escores y luego solo publico los cinco
    function sortGames(games){
      games.sort(function(a, b){
        if (b.score < a.score){
          return -1;
        }
        if (b.score > a.score){
          return 1;
        }
        return 0;
      })//sort
      let topFiveGames= games.slice(0, 5)
      topFiveGames.forEach(function (game){

        //con esta tabla muestro los usuarios y su escore en la tabla
      const gameScoreTable = document.getElementById('game-score-table')
      gameScoreTable.innerHTML += `
        <tr data-id="${game.id}">
          <td>${game.username}</td>
          <td>${game.score}</td>
        </tr>
      `
    })//topFiveGames - function

    }//sortGames

    function disableSubmitButton(){
      let buttonElement = document.getElementById("form-submit-button")
      buttonElement.disabled = true
    }

  } //addUserNameAndScore



}//end DisplayOverPage
