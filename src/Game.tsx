import { useEffect, useRef, useState,useCallback } from "react";
import { Passage} from "./Passage";
import { Clue, clue, guessesNotInTarget, ICluedLetter, CluedLetter, dectrimentClue, clueFadedWords } from "./clue";
import { Keyboard } from "./Keyboard";
import {Language} from "./books";
import {randomTarget} from "./App";
import {
  gameName
} from "./util";
import { decode, encode } from "./base64";

enum GameState {
  Playing,
  Won,
  Lost,
}

interface GameProps {
  hidden: boolean;
  colorBlind: boolean;
  keyboardLayout: string;
  language: Language;
  target: Map<number, CluedLetter[]>;
}

function mergeClues(letterStates: Map<number, CluedLetter[]>, arg1: Map<number, CluedLetter[]>): Map<number, CluedLetter[]>{
  letterStates.forEach(function(value, key) {
    for(const i in value){
      if(value[i].clue === Clue.Correct
      || value[i].clue === Clue.Punctuation
      ){
          //no change
      }else if (arg1[key] != undefined && arg1[key][i].clue === Clue.Correct){
        value[i].clue = Clue.Correct;
      }
      else 
        if(value[i].isFaded()){
          value[i].clue = dectrimentClue(value[i].clue);
        }//else{
          //value[i].clue = arg1[key][i].clue;
        //}
    }
  });    
  
  clueFadedWords(letterStates);

  return letterStates;
}

function Game(props: GameProps) {
  const [gameState, setGameState] = useState<GameState>(GameState.Playing);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [target, setTarget] = useState<Map<number, CluedLetter[]>>(() => {return props.target});
  const [wordLength, setWordLength] = useState(() => { return target.size});
  const [hint, setHint] = useState<string>('Make your first guess!');
  const tableRef = useRef<HTMLTableElement>(null);
  const startNextGame = () => {
    randomTarget();
    setHint("");
    setGuesses([]);
    setCurrentGuess("");
    setGameState(GameState.Playing);
  };

  async function share(copiedHint: string, text?: string) {
    const url = window.location.origin + window.location.pathname
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
    if (/^[a-z]$/i.test(key)) {
      setCurrentGuess((guess) =>
        (guess + key.toLowerCase()).slice(0, wordLength)
      );
      tableRef.current?.focus();
      setHint("");
      setGuesses((guesses) => guesses.concat([key]));
      setTarget((t) => mergeClues(new Map(target), clue(guesses.concat([key]).join(''), target)));
    } else if (key === "Enter") {
      setCurrentGuess((guess) => "");
      const gameOver = (verbed: string) =>
        `You ${verbed})`;

      if (allDone(target)) {
        setHint(gameOver("won"));
        setGameState(GameState.Won);
      } else {
        setHint("");
       // speak(describeClue(clue(currentGuess, target)));
      }
    }
  };

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (!e.ctrlKey && !e.metaKey) {
      onKey(e.key);
    }
    if (e.key === "Backspace") {
      e.preventDefault();
    }
  }, [onKey,currentGuess,gameState]);

  useEffect(() => {
    
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [currentGuess, gameState, onKeyDown]);

  let letterInfo = new Map<string, Clue>();
  const tableRows = Array(1)
    .fill(undefined)
    .map((_, i) => {
      const guess = [...guesses, currentGuess][i] ?? "";
      
      for(const cl of guessesNotInTarget(guess, target)){
        if(cl.clue !== undefined){
          letterInfo.set(cl.letter.toLowerCase(),cl.clue);
        }
      }
      
      return (
        <Passage
          key={i}
          cluedLetters={target}
        />
      );
    })
    .concat(Array(1).fill(undefined).map((_, i) => {
      return (
        <Passage
          key={2}
          cluedLetters={new Map}
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
              share(
                "Result copied to clipboard!",
                `${gameName} ${guesses.length}\n` +
                  guesses
                    .map((guess) =>
                      //clue(guess, target)
                      []
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



function allDone(target: Map<number, CluedLetter[]>):boolean {
  throw new Error("Function not implemented.");
}


