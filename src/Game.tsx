import { useEffect, useRef, useState } from "react";
import { Passage} from "./Passage";
import { Clue, clue, describeClue,guessesNotInTarget, ICluedLetter, CluedLetter, dectrimentClue, clueFadedWords } from "./clue";
import { Keyboard } from "./Keyboard";
import targetList from "./targets.json";
import {
  describeSeed,
  gameName,
  //pick,
  resetRng,
  seed,
  speak,
  urlParam
} from "./util";
import { decode, encode } from "./base64";

enum GameState {
  Playing,
  Won,
  Lost,
}

interface GameProps {
  maxGuesses: number;
  hidden: boolean;
  colorBlind: boolean;
  keyboardLayout: string;
}

const targets = targetList;
const minLength = 4;
const defaultLength = 5;
const maxLength = 11;
const limitLength = (n: number) =>
  n >= minLength && n <= maxLength ? n : defaultLength;

function randomTarget(): string {
  let candidate: string;
  //do {
//    candidate = pick(targets);
    //fetch("https://www.biblegateway.com/passage/?search=" + encodeURI(candidate), {
//      mode: "no-cors",
      //method: "GET",
    //}).then(response => console.log(response))
    //.catch(err => {console.log(err)});
  //} while (/\*/.test(candidate));
  return "for God so loved the world that he gave his one and only son";
}

function getChallengeUrl(target: string): string {
  return (
    window.location.origin +
    window.location.pathname +
    "?challenge=" +
    encode(target)
  );
}

let initChallenge = "";
let challengeError = false;
try {
  initChallenge = decode(urlParam("challenge") ?? "").toLowerCase();
} catch (e) {
  console.warn(e);
  challengeError = true;
}

function parseUrlLength(): number {
  const lengthParam = urlParam("length");
  if (!lengthParam) return defaultLength;
  return limitLength(Number(lengthParam));
}

function parseUrlGameNumber(): number {
  const gameParam = urlParam("game");
  if (!gameParam) return 1;
  const gameNumber = Number(gameParam);
  return gameNumber >= 1 && gameNumber <= 1000 ? gameNumber : 1;
}


function blankLetterState(target: string): ICluedLetter[] {
  const cluedLetters: ICluedLetter[] = [];
  const letters: string[] =  target.split('');
  for(const letter of letters){
    if(letter === " "){
      cluedLetters.push(new CluedLetter(letter, Clue.Space));
    }else{
      cluedLetters.push(new CluedLetter(letter, undefined));
    }
  }
  return cluedLetters;
}

function mergeClues(letterStates: ICluedLetter[], arg1: ICluedLetter[]) {
  const cluedLetters : ICluedLetter[] = [];
  for(const i in letterStates){
    if(letterStates[i].clue === Clue.Correct){
      cluedLetters.push(letterStates[i]);
    }else if (arg1[i].clue === Clue.Correct){
      cluedLetters.push(arg1[i]);
    }
    else 
      if(letterStates[i].isFaded()){
        cluedLetters.push(dectrimentClue(letterStates[i]));
      }else{
        cluedLetters.push(arg1[i]);
      }
  }

  clueFadedWords(cluedLetters);

  return cluedLetters;
}

let letterStates :ICluedLetter[] = [];


function Game(props: GameProps) {
  const [gameState, setGameState] = useState<GameState>(GameState.Playing);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [challenge, setChallenge] = useState<string>(initChallenge);
  const [gameNumber, setGameNumber] = useState(parseUrlGameNumber());
  const [target, setTarget] = useState(() => {
    resetRng();
    // Skip RNG ahead to the parsed initial game number:
    //for(let i = 1; i < gameNumber; i++) randomTarget(wordLength);
    return challenge || randomTarget();
  });
  
  if (letterStates.length === 0){
    letterStates = blankLetterState(target);
  }

  const [wordLength, setWordLength] = useState(() => { return target.length});
  const [hint, setHint] = useState<string>(
    challengeError
      ? `Invalid challenge string, playing random game.`
      : `Make your first guess!`
  );
  const currentSeedParams = () =>
    `?seed=${seed}&length=${wordLength}&game=${gameNumber}`;
  useEffect(() => {
    if (seed) {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + currentSeedParams()
      );
    }
  }, [wordLength, gameNumber]);
  const tableRef = useRef<HTMLTableElement>(null);
  const startNextGame = () => {
    if (challenge) {
      // Clear the URL parameters:
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setChallenge("");
    const newWordLength = limitLength(wordLength);
    setWordLength(newWordLength);
    //setTarget(randomTarget(newWordLength));
    setHint("");
    setGuesses([]);
    setCurrentGuess("");
    setGameState(GameState.Playing);
    setGameNumber((x) => x + 1);
    letterStates = blankLetterState(target);
  };

  async function share(copiedHint: string, text?: string) {
    const url = seed
      ? window.location.origin + window.location.pathname + currentSeedParams()
      : getChallengeUrl(target);
    const body = url + (text ? "\n\n" + text : "");
    if (
      /android|iphone|ipad|ipod|webos/i.test(navigator.userAgent) &&
      !/firefox/i.test(navigator.userAgent)
    ) {
      try {
        await navigator.share({ text: body });
        return;
      } catch (e) {
        console.warn("navigator.share failed:", e);
      }
    }
    try {
      await navigator.clipboard.writeText(body);
      setHint(copiedHint);
      return;
    } catch (e) {
      console.warn("navigator.clipboard.writeText failed:", e);
    }
    setHint(url);
  }

  const onKey = (key: string) => {
    if (gameState !== GameState.Playing) {
      if (key === "Enter") {
        startNextGame();
      }
      return;
    }
    if (guesses.length === props.maxGuesses) return;
    if (/^[a-z]$/i.test(key)) {
      setCurrentGuess((guess) =>
        (guess + key.toLowerCase()).slice(0, wordLength)
      );
      tableRef.current?.focus();
      setHint("");
    } else if (key === "Backspace") {
      setCurrentGuess((guess) => guess.slice(0, -1));
      setHint("");
    } else if (key === "Enter") {

      //for(const g of guesses) {
//        const c = clue(g, target);
      //}
      setGuesses((guesses) => guesses.concat([currentGuess]));
      setCurrentGuess((guess) => "");

      const gameOver = (verbed: string) =>
        `You ${verbed}! The answer was ${target.toUpperCase()}. (Enter to ${
          challenge ? "play a random game" : "play again"
        })`;

      if (currentGuess === target) {
        setHint(gameOver("won"));
        setGameState(GameState.Won);
      } else if (guesses.length + 1 === props.maxGuesses) {
        setHint(gameOver("lost"));
        setGameState(GameState.Lost);
      } else {
        setHint("");
        speak(describeClue(clue(currentGuess, target)));
      }
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        onKey(e.key);
      }
      if (e.key === "Backspace") {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [currentGuess, gameState]);

  let letterInfo = new Map<string, Clue>();

  const tableRows = Array(1)
    .fill(undefined)
    .map((_, i) => {
      const guess = [...guesses, currentGuess][i] ?? "";
      letterStates = mergeClues(letterStates, clue(guess, target));
      for(const cl of guessesNotInTarget(guess, target)){
        if(cl.clue !== undefined){
          letterInfo.set(cl.letter.toLowerCase(),cl.clue);
        }
      }
      
      
      return (
        <Passage
          key={i}
          passageLength={wordLength}
          cluedLetters={letterStates}
        />
      );
    })
    .concat(Array(1).fill(undefined).map((_, i) => {
      return (
        <Passage
          key={2}
          passageLength={1}
          cluedLetters={[]}
        />
      );
    }));

  return (
    <div className="Game" style={{ display: props.hidden ? "none" : "block" }}>
      <div
        className="Game-rows"
        tabIndex={0}
        aria-label="Passage"
        ref={tableRef}
      >
        {tableRows}
      </div>
      <p
        role="alert"
        style={{
          userSelect: /https?:/.test(hint) ? "text" : "none",
          whiteSpace: "pre-wrap",
        }}
      >
        {hint || `\u00a0`}
      </p>
      <Keyboard
        layout={props.keyboardLayout}
        letterInfo={letterInfo}
        onKey={onKey}
      />
      <div className="Game-seed-info">
        {challenge
          ? "playing a challenge game"
          : seed
          ? `${describeSeed(seed)} — length ${wordLength}, game ${gameNumber}`
          : "playing a random game"}
      </div>
      <p>
        <button
          onClick={() => {
            share("Link copied to clipboard!");
          }}
        >
          Share a link to this game
        </button>{" "}
        {gameState !== GameState.Playing && (
          <button
            onClick={() => {
              const emoji = props.colorBlind
                ? ["⬛", "🟦", "🟧"]
                : ["⬛", "🟨", "🟩"];
              const score = gameState === GameState.Lost ? "X" : guesses.length;
              share(
                "Result copied to clipboard!",
                `${gameName} ${score}/${props.maxGuesses}\n` +
                  guesses
                    .map((guess) =>
                      clue(guess, target)
                        .map((c) => emoji[c.clue ?? 0])
                        .join("")
                    )
                    .join("\n")
              );
            }}
          >
            Share emoji results
          </button>
        )}
      </p>
    </div>
  );
}

export default Game;



