/* =========================================
   SELEÇÃO DE ELEMENTOS DO JOGO (DOM)
   =========================================
   Aqui, guardamos em constantes as referências
   aos elementos HTML que serão manipulados
   durante o jogo, como o personagem, obstáculos e telas.
*/
const mario = document.querySelector(".mario");
const pipe = document.querySelector(".pipe");
const scoreElement = document.querySelector('.score');
const livesContainer = document.querySelector('#lives-container');
const bullet = document.querySelector('.bullet');
const gameOverScreen = document.querySelector('.game-over-screen');
const jogarDenovoScreen = document.querySelector('.tela-jogar-denovo');
const finalScoreElement = document.querySelector('#final-score');
const gameBoard = document.querySelector('.game-board');
const root = document.documentElement;
const clouds = document.querySelector('.clouds');
const starLayer = document.querySelector('#star-layer');
const infernoBackground = document.querySelector("#inferno-background");
const spriteMorteTemporario = './_media/napstablookMorte.gif';
const passioneScreen = document.querySelector('#passioneScreen');

/* =========================================
   ELEMENTOS DA TELA INICIAL
   =========================================
   Referências aos elementos da primeira tela
   que o jogador vê, onde ele insere o nickname.
*/
const telaInicial = document.querySelector('.tela-Inicial');
const startButton = document.querySelector('#start-button');

/* =========================================
   RECURSOS DE ÁUDIO E IMAGENS PADRÃO
   =========================================
   Pré-carregamento dos arquivos de áudio e
   definição de imagens padrão para o jogo.
*/
var musicaMario = new Audio('./_media/_sons/trilhasonoramario.mp3');
const jumpSound = new Audio('./_media/_sons/jump.mp3');
const selectSound = new Audio('./_media/_sons/undertale-select.mp3');
const coinSound = new Audio('./_media/_sons/coin-audio.mp3');
var localGameOver = './_imagens/morte/game-over-mario.png';

/* =========================================
   VARIÁVEIS DE ESTADO DO JOGO
   =========================================
   Variáveis que controlam o estado atual do
   jogo, como pontuação, vidas, pausa, etc.
*/
let pausa = false;
let estaInvuneravel = false;
var vida = 3;
let score = 0;
let moedasColetadas = 0;
let playerNick = '';
let loop;
let scoreInterval;
let personagemSelecionadoId = 'marioDiv';

/* =========================================
   FLAGS DE CONTROLE DE TEMA
   =========================================
   Variáveis booleanas para garantir que as
   mudanças de tema (tarde, noite, inferno)
   aconteçam apenas uma vez.
*/
let tardeAtivada = false;
let noiteAtivada = false;
let infernoAtivado = false;

/* =========================================
   FUNÇÕES PRINCIPAIS DE JOGABILIDADE
   =========================================
   Funções que controlam as ações básicas
   do jogador e do jogo.
*/

/**
 * Atualiza os ícones de vida na tela.
 * Ela limpa o contêiner de vidas e o recria
 * com o número atual de vidas do jogador.
 */
function atualizarVidas() {
    livesContainer.innerHTML = '';
    for (let i = 0; i < vida; i++) {
        const lifeIcon = document.createElement('img');
        lifeIcon.src = './_media/life.gif';
        lifeIcon.classList.add('life-icon');
        livesContainer.appendChild(lifeIcon);
    }
}

/**
 * Controla a ação de pulo do personagem.
 */
const jump = () => {
    if (!mario.classList.contains('jump')) {
        mario.classList.add('jump');
        jumpSound.play();
        setTimeout(() => mario.classList.remove('jump'), 500);
    }
}

/**
 * Chamada quando o jogador colide com um obstáculo.
 * Reduz uma vida, atualiza a tela e, se houver
 * vidas restantes, mostra o sprite de morte temporária.
 */
function perdeVida() {
    vida--;
    atualizarVidas();

    if (vida >= 0) {
        mario.src = spriteMorteTemporario;
    }
}

/**
 * Ativa um curto período de invulnerabilidade
 * após o jogador perder uma vida e continuar.
 */
function ativarInvunerabilidade() {
    estaInvuneravel = true;
    mario.classList.add('invuneravel');
    setTimeout(() => {
        estaInvuneravel = false;
        mario.classList.remove('invuneravel');
    }, 500);
}

function checarCodigo(sequencia, evento) {
    let position = 0;
    return function (key) {
        if (key === sequencia[position]) {
            position++;
            if (position === sequencia.length) {
                evento();
                position = 0;
            }
        } else {
            position = (key === sequencia[0]) ? 1 : 0;
        }
    }
}

const checkKonami = checarCodigo(konamiCode, () => {
    mario.src = './_media/wario.gif';
    mario.style.transform = 'scaleX(-1)';
});
const checkRoberto = checarCodigo(robertoCode, () => {
    mario.src = './_imagens/image.png';
    mario.style.transform = 'scaleX(1)';
});
const checkPalmeiras = checarCodigo(palmeirasCode, () => {
    mario.src = './_imagens/matheus.png';
    mario.style.transform = 'scaleX(1)';
});
const checkSonic = checarCodigo(sonicCode, () => {
    mario.src = './_media/sonic.gif';
    mario.style.transform = 'scaleX(1)';
});

/* =========================================
   FUNÇÕES DE EFEITOS VISUAIS
   =========================================
   Funções que criam elementos dinâmicos para
   melhorar a estética do jogo.
*/
function criarBrasa() {
    const ember = document.createElement('div');
    ember.classList.add('ember');
    ember.style.left = `${Math.random() * 100}%`;
    ember.style.animationDelay = `${Math.random() * 3}s`;
    gameBoard.appendChild(ember);
}

/* =========================================
   FUNÇÃO PRINCIPAL DO JOGO (STARTGAME)
   =========================================
   Esta é a função central que controla todo o
   fluxo do jogo, iniciando os loops de
   pontuação e de colisão.
*/
function startGame() {
    telaInicial.style.display = 'none';
    pipe.style.animationPlayState = 'running';
    root.style.setProperty('--velocidade', `2.0s`);
    atualizarVidas();

    scoreInterval = setInterval(() => {
        if (!pausa) score++;
        scoreElement.textContent = `Score: ${score}`;

        // AUMENTO PROGRESSIVO DE VELOCIDADE
        if (score % 1 === 0 && score > 0 && !infernoAtivado && !pausa) {
            let velocidadeAtual = parseFloat(getComputedStyle(root).getPropertyValue('--velocidade'));
            if (velocidadeAtual > 1.5) {
                let novaVelocidade = Math.max(1.5, velocidadeAtual - 0.001);
                root.style.setProperty('--velocidade', `${novaVelocidade.toFixed(3)}s`);
            }
        }

        // MUDANÇAS DE TEMA
        if (score >= 500 && !tardeAtivada) {
            gameBoard.className = 'game-board theme-tarde';
            starLayer.style.display = 'block';
            musicaMario.pause();
            musicaMario = new Audio('./_media/_sons/HoraDeAventura.mp3');
            musicaMario.play();
            tardeAtivada = true;
        }
        if (score >= 1000 && !noiteAtivada) {
            starLayer.style.animation = 'brilha-estrela-animation 5s infinite linear';
            gameBoard.className = 'game-board theme-noite';
            musicaMario.pause();
            musicaMario = new Audio('./_media/_sons/silkSong.mp3');
            musicaMario.play();
            noiteAtivada = true;
        }
        if (score >= 1500 && !infernoAtivado) {
            gameBoard.className = 'game-board theme-infernal';
            root.style.setProperty('--velocidade', '1.0s');
            clouds.src = './_media/minecraft-ghast.gif';
            musicaMario.pause();
            musicaMario = new Audio('./_media/_sons/DoomEternal.mp3');
            musicaMario.play();
            gameBoard.classList.add('tremer');
            infernoBackground.style.display = 'block';
            for (let i = 0; i < 50; i++) {
                criarBrasa();
            }
            infernoAtivado = true;
        }

        // LÓGICA DE BULLET
        // if (score >= 500 && bullet.style.display !== 'block') {
        //     bullet.style.display = 'block';
        //     bullet.style.animationPlayState = 'running';
        // }

        // LÓGICA DE MOEDAS
        if (score > 0 && score % 50 == 0) {
            let alturaAleatoria = Math.random() * (200 - 80) + 80;
            criarMoeda(alturaAleatoria);
        }
    }, 100);

    // LOOP PRINCIPAL DE VERIFICAÇÃO DE COLISÃO
    loop = setInterval(() => {
        if (pausa || estaInvuneravel) return;
        musicaMario.play();

        const marioPositionBottom = +window.getComputedStyle(mario).bottom.replace('px', '');
        const marioPositionLeft = mario.offsetLeft;

        // VERIFICA COLISÃO COM MOEDAS
        document.querySelectorAll('.coin').forEach((moeda) => {
            const moedaPositionLeft = moeda.offsetLeft;
            const moedaPositionBottom = +window.getComputedStyle(moeda).bottom.replace('px', '');
            if (
                marioPositionLeft < moedaPositionLeft + 40 &&
                marioPositionLeft + 120 > moedaPositionLeft &&
                marioPositionBottom < moedaPositionBottom + 40 &&
                marioPositionBottom + 120 > moedaPositionBottom
            ) {
                moeda.remove();
                coinSound.play();
                score += 10;
                moedasColetadas++;
                if (moedasColetadas % 10 === 0 && moedasColetadas > 0) {
                    vida++;
                    atualizarVidas();
                }
            }
        });

        const pipePosition = pipe.offsetLeft;
        const bulletPosition = bullet.offsetLeft;

        // VERIFICA COLISÃO COM OBSTÁCULOS
        if ((pipePosition <= 120 && pipePosition > 0 && marioPositionBottom < 80) ||
            (bullet.style.display === 'block' && bulletPosition <= 120 && bulletPosition > 0 && marioPositionBottom < 80)) {
            pausa = true;
            pipe.style.animationPlayState = 'paused';
            bullet.style.animationPlayState = 'paused';

            if (vida > 0) {
                perdeVida(); // Chama a função de perder vida
                jogarDenovoScreen.style.display = 'flex';
            } else {
                morrer(pipePosition, bulletPosition, marioPositionBottom);
            }
        }
    }, 10);
}

/* =========================================
   EVENT LISTENERS (OUVINTES DE EVENTOS)
   =========================================
   Código que "escuta" ações do usuário,
   como pressionar teclas ou clicar em botões.
*/
document.addEventListener('keydown', (event) => {
    jump();
    checkKonami(event.key);
    checkRoberto(event.key);
    checkPalmeiras(event.key);
    checkSonic(event.key);
});

startButton.addEventListener('click', () => {
    const nick = nicknameInput.value.trim();
    if (nick) {
        playerNick = nick;
        startGame();
    } else {
        alert('Por favor, digite um nick para começar!');
    }
});

/* =========================================
   FUNÇÕES DE LÓGICA DE MENU E ESTADO
   =========================================
   Funções que gerenciam a seleção de
   personagens, a tela de "continuar" e o
   estado final de "Game Over".
*/
function escolhaPersonagem(personagem) {
    selectSound.currentTime = 0;
    selectSound.play();

    if (personagemSelecionadoId) {
        document.getElementById(personagemSelecionadoId).classList.remove('selecionado');
    }

    const novaSelecaoDiv = document.getElementById(`${personagem}Div`);
    if (novaSelecaoDiv) {
        novaSelecaoDiv.classList.add('selecionado');
        personagemSelecionadoId = `${personagem}Div`;
    }

    let marioGifPath = './_media/mario.gif';
    let gameOverImagePath = `./_imagens/morte/game-over-mario.png`;
    let mudarDirecao = false;

    switch (personagem) {
        case 'mario':
            marioGifPath = './_media/mario.gif';
            gameOverImagePath = `./_imagens/morte/game-over-mario.png`;
            break;
        case 'sonic':
            marioGifPath = './_media/sonic.gif';
            gameOverImagePath = `./_imagens/morte/game-over-sonic.png`;
            break;
        case 'megaman':
            marioGifPath = './_media/yd6sCid.gif';
            gameOverImagePath = `./_imagens/morte/game-over-megaman.png`;
            break;
        case 'link':
            marioGifPath = './_media/link.gif';
            gameOverImagePath = `./_imagens/morte/game-over-link.png`;
            break;
        case 'goku':
            marioGifPath = './_media/goku.gif';
            gameOverImagePath = `./_imagens/morte/game-over-goku.png`;
            break;
        case 'jotaro':
            marioGifPath = './_media/jotaroA.gif';
            gameOverImagePath = `./_imagens/morte/game-over-jotaro.gif`;
            break;
        case 'hollow':
            marioGifPath = './_media/hollow.gif';
            gameOverImagePath = `./_imagens/morte/game-over-hollow.png`;
            mudarDirecao = true;
            break;
        case 'hornet':
            marioGifPath = './_media/hornet.gif';
            gameOverImagePath = `./_imagens/morte/game-over-hornet.png`;
            mudarDirecao = true;
            break;
        default:
            console.warn(`Personagem '${personagem}' não reconhecido. Usando Mario padrão.`);
            break;
    }

    mario.src = marioGifPath;
    localGameOver = gameOverImagePath;
    mario.style.transform = mudarDirecao ? 'scaleX(-1)' : 'scaleX(1)';
}

function continuarReniciar(escolha) {
    if (escolha === 'continuar') {
        jogarDenovoScreen.style.display = 'none';
        pipe.style.right = '-80px';
        pipe.style.left = '';
        pipe.style.animationPlayState = 'running';
        bullet.style.right = '-80px';
        bullet.style.left = '';
        bullet.style.animationPlayState = 'running';
        pausa = false;
        ativarInvunerabilidade();
        escolhaPersonagem(personagemSelecionadoId.replace('Div', ''));

    } else if (escolha === 'Reniciar') {
        window.location.reload();
    }
}

function morrer(pipePosition, bulletPosition, marioPosition) {
    pipe.style.animation = "none";
    pipe.style.left = `${pipePosition}px`;
    bullet.style.animation = "none";
    bullet.style.left = `${bulletPosition}px`;
    mario.style.animation = "none";
    mario.style.bottom = `${marioPosition}px`;
    mario.src = localGameOver;
    mario.style.width = '75px';
    mario.style.marginLeft = '50px';
    gameOverScreen.style.display = 'flex';
    clearInterval(loop);
    clearInterval(scoreInterval);
    finalScoreElement.textContent = score;
    musicaMario.pause();
    salvarPontuacao(playerNick, score);
}

function criarMoeda(bottom) {
    const novaMoeda = document.createElement('img');
    novaMoeda.src = './_imagens/coin.png';
    novaMoeda.classList.add('coin');
    novaMoeda.style.bottom = `${bottom}px`;
    gameBoard.appendChild(novaMoeda);

    setTimeout(() => {
        if (novaMoeda) {
            novaMoeda.remove();
        }
    }, 4000);
}

/* =========================================
   INICIALIZAÇÃO DA PÁGINA
   =========================================
   Código que executa assim que a página é
   carregada, como a tela de startup.
*/
document.addEventListener('DOMContentLoaded', () => {
    const marioDiv = document.getElementById('marioDiv');
    if (marioDiv) {
        marioDiv.classList.add('selecionado');
    }

    // LÓGICA DA TELA DE STARTUP COM IMAGEM
    telaInicial.style.display = 'none';
    const startupDisplayTime = 1500; // 3 segundos

    function finishStartup() {
        passioneScreen.classList.add('fade-out');
        setTimeout(() => {
            passioneScreen.remove();
            telaInicial.style.display = 'flex';
        }, 1000);
    }
    setTimeout(finishStartup, startupDisplayTime);
});