import { questions, options, answerKeys } from "./quizzes.js";

const container = document.querySelector(".container");
const startCont = document.querySelector(".base-start");
const startBtn = document.querySelector(".start");
const nextBtn = document.querySelector(".next span");
const retryBtn = document.querySelector(".retry");
const quizStarter = document.querySelector(".quiz-container");
const resultCont = document.querySelector(".result-container");
const soundCont = document.querySelector(".sound-icon");
const sound = document.querySelector(".sound");
const noSound = document.querySelector(".no-sound");
const questionsCnt = document.querySelector(".questions-left");
const questionLabel = document.querySelector(".question");
const optionsList = document.querySelectorAll(".option");
const highestLabel = document.querySelector("#highscore-label");
const timer = document.querySelector(".timer");
const rightPer = document.querySelector("#right-per");
const wrongPer = document.querySelector("#wrong-per");
const finalScore = document.querySelector("#final-score");
const progress = document.querySelector(".progress");
const capRes = document.querySelector(".capture-result");
const quizData = JSON.parse(localStorage.getItem("mainData")) || {cnt: null, solved: null, currScore: null, highest: null};
let timeId;

const bgMusic = document.createElement("audio");
bgMusic.style.display = "none";
bgMusic.src = "media/bg.mp3";
bgMusic.loop = true;
container.append(bgMusic);

const correctMusic = document.createElement("audio");
correctMusic.style.display = "none";
correctMusic.src = "media/correct.mp3";
container.append(correctMusic);

const inCorrectMusic = document.createElement("audio");
inCorrectMusic.style.display = "none";
inCorrectMusic.src = "media/incorrect.mp3";
container.append(inCorrectMusic);

if(quizData.cnt !== null) {
    startCont.classList.remove("show");
    quizStarter.classList.add("show");

    sound.classList.add("no-display");
    noSound.classList.remove("no-display");
    
    if(!quizData.solved) {
        quizData.cnt--;
        quizData.solved = true;
    }

    nextQuiz();
}

if(quizData.highest) highestLabel.innerText = `Highest Score: ${quizData.highest}`;

function update() {
    if(quizData.cnt < questions.length) {
        questionsCnt.innerText = `${quizData.cnt + 1}/${questions.length}`;
        questionLabel.innerText = questions[quizData.cnt];
        quizData.solved = false;
        updateLS();

        optionsList.forEach((op, idx) => {
            op.innerText = options[quizData.cnt][idx];
            const spanEl = document.createElement("span");
            spanEl.classList.add("choice");

            if(idx !== answerKeys[quizData.cnt]) spanEl.innerHTML = `<img src="images/wrong.svg" alt="wrong">`
            else spanEl.innerHTML = `<img src="images/right.svg" alt="right">`
            op.append(spanEl);
        })
    }
}

function updateLS() {
    localStorage.setItem("mainData", JSON.stringify(quizData));
}

function setTimer() {
    const startTime = Date.now();
    const totalTime = 30;

    timeId = setInterval(() => {
        const remTime = totalTime - Math.floor((Date.now() - startTime) / 1000);
        if(remTime >= 10) timer.innerText = `00:${remTime}`;
        else timer.innerText = `00:0${remTime}`;

        let bg;
        let tBg;
        const percentage = Math.floor((remTime / totalTime) * 100);

        if(percentage <= 20) {
            bg = "#dbadad";
            tBg = "#cc4038";
        }

        else if(percentage <= 50) {
            bg = "#e2e69e";
            tBg = "rgba(130, 121, 35, 1)";
        }

        else {
            bg = "#cce2c2";
            tBg = "#229c23";
        }

        container.style.backgroundColor = bg;
        timer.style.backgroundColor = nextBtn.style.color = tBg;

        if(remTime <= 0) {
            optionsList[answerKeys[quizData.cnt]].classList.add("right-bd");
            optionsList[answerKeys[quizData.cnt]].children[0].classList.add("show");
            quizData.solved = true;
            updateLS();
            removeOptionsEL();
            clearInterval(timeId);
            setTimeout(() => {
                nextQuiz();
            }, 700);
        }
    }, 100)
}

function nextQuiz() {
    if(quizData.cnt != null && quizData.cnt < (questions.length - 1) && quizData.solved) {
        addOptionsEL();
        quizData.cnt++;
        update();
        updateLS();
        clearInterval(timeId);
        setTimer();
    }
    else if(quizData.cnt != null && quizData.solved) {
        quizStarter.classList.remove("show");
        resultCont.classList.add("show");
        finalScore.innerText = `${quizData.currScore}/${questions.length}`;

        const rPer = Math.ceil((quizData.currScore / questions.length) * 100);
        const wPer = Math.floor(((questions.length - quizData.currScore) / questions.length) * 100);

        rightPer.innerText = `${rPer}%`;
        wrongPer.innerText = `${wPer}%`;

        progress.style.width = rPer;

        if(quizData.highest === null || quizData.highest < quizData.currScore) quizData.highest = quizData.currScore;

        bgMusic.pause();
        updateLS();
        clearInterval(timeId);
    }
}

function choiceHandler(e) {
    const ans = options[quizData.cnt][answerKeys[quizData.cnt]];
    quizData.solved = true;
    updateLS();

    if(e.target.innerText !== ans) {
        e.target.classList.add("wrong-bd");
        e.target.classList.add("animate-wrong");
        inCorrectMusic.play();
    }
    else {
        quizData.currScore++;
        updateLS();
        correctMusic.play();
    }

    optionsList[answerKeys[quizData.cnt]].classList.add("right-bd");

    e.target.children[0].classList.add("show");
    optionsList[answerKeys[quizData.cnt]].children[0].classList.add("show");

    clearInterval(timeId);
    removeOptionsEL();

    setTimeout(() => {
        nextQuiz();
    }, 700);
}

function addOptionsEL() {
    optionsList.forEach((op) => {
        op.addEventListener("click", choiceHandler);
        op.classList.remove("wrong-bd");
        op.classList.remove("right-bd");
        op.classList.remove("animate-wrong");
    });
}

function removeOptionsEL() {
    optionsList.forEach((op) => {
        op.removeEventListener("click", choiceHandler);
    });
}

startBtn.addEventListener("click", () => {
    startCont.classList.remove("show");
    quizStarter.classList.add("show");

    sound.classList.remove("no-display");
    noSound.classList.add("no-display");

    quizData.cnt = 0;
    quizData.solved = false;
    quizData.currScore = 0;

    bgMusic.play();
    addOptionsEL();
    update();
    updateLS();
    setTimer();
})

nextBtn.addEventListener("click", nextQuiz);
retryBtn.addEventListener("click", () => {
    quizData.currScore = quizData.solved = quizData.cnt = null;
    resultCont.classList.remove("show");
    startCont.classList.add("show");

    bgMusic.currentTime = 0;
    highestLabel.innerText = `Highest Score: ${quizData.highest}`;
    container.style.backgroundColor = "#f6f4f0";
    updateLS();
});

soundCont.addEventListener("click", () => {
    sound.classList.toggle("no-display");
    noSound.classList.toggle("no-display");

    if(sound.classList.contains("no-display")) bgMusic.pause();
    else bgMusic.play();
});

capRes.addEventListener("click", () => {
    html2canvas(document.querySelector(".main-res")).then(canvas => {
        let imgData = canvas.toDataURL("image/png");
        let newWin = window.open();
        newWin.document.write(`<img src="${imgData}" alt="cap-img">`);
    });
});
