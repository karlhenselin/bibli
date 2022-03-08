import { useEffect, useRef, useState, useCallback } from "react";
import { Passage } from "./Passage";
import { Clue, clue, guessesNotInTarget, CluedLetter, decrimentClue, clueFadedWords } from "./clue";
import { Keyboard } from "./Keyboard";
import { Language } from "./books";
import { pickTodaysTarget } from "./App";
import { Chart, getCanvas } from "./chart";
import {
  gameName
} from "./util";
//import { decode, encode } from "./base64";

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
  reference: string;
}

function mergeClues(letterStates: Map<number, CluedLetter[]>, arg1: Map<number, CluedLetter[]>): Map<number, CluedLetter[]> {
  letterStates.forEach(function (value, key) {
    for (const i in value) {
      if (value[i].clue === Clue.Correct
        || value[i].clue === Clue.Punctuation
      ) {
        //no change
      } else if (arg1.get(key)![i].clue === Clue.Correct) {
        value[i].clue = Clue.Correct;
      }
      else
        if (value[i].isFaded()) {
          value[i].clue = decrimentClue(value[i].clue);
        } else {
          value[i].clue = arg1.get(key)![i].clue;
        }
    }
  });

  clueFadedWords(letterStates);

  return letterStates;
}

function Game(props: GameProps) {
  const [gameState, setGameState] = useState<GameState>(GameState.Playing);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [target, setTarget] = useState<Map<number, CluedLetter[]>>(() => { return props.target });
  const [reference, setReference] = useState<string>(() => { return props.reference });
  const [letterInfo, setLetterInfo] = useState<Map<string, Clue>>(() => new Map<string, Clue>());
  const [hint, setHint] = useState<string>('Make your first guess!');
  const tableRef = useRef<HTMLTableElement>(null);
  const [won, setWon] = useState<boolean>(false);
  const startNextGame = () => {
    pickTodaysTarget();
    setHint("");
    setGuesses([]);
    setCurrentGuess("");
    setGameState(GameState.Playing);
    setWon(false);
  };

  async function shareWon(copiedHint: string, text?: string) {
    const canvas = getCanvas();

    canvas.toBlob(async function (blob) {
      try {
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        setHint(copiedHint);
      } catch (e) {
        return "Copying image to clipboard failed: " + e;
      }
    });
  }

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

  const onKey = useCallback((key: string) => {
    if (gameState !== GameState.Playing) {
      if (key === "Enter") {
        startNextGame();
      }
      return;
    }
    if (/^[a-z]$/i.test(key)) {
      setCurrentGuess(key.toLowerCase());
      tableRef.current?.focus();
      setHint("");
      setGuesses((guesses) => guesses.concat([key.toLowerCase()]));
      const t = mergeClues(new Map(target), clue(guesses.concat([key.toLowerCase()]).join(''), target))
      setTarget((nt) => t);
      let newLetters = new Map(letterInfo);
      for (const cl of guessesNotInTarget(key.toLowerCase(), target)) {
        if (cl.clue !== undefined) {
          newLetters.set(cl.letter.toLowerCase(), cl.clue);
        }
      }
      if (newLetters.size !== 0) {
        setLetterInfo(new Map([...letterInfo, ...newLetters]));
      }
      if (allDone(t)) {
        setWon(true);
        setHint("You solved " + reference + " in " + (guesses.length + 1) + " guesses.");
        setGameState(GameState.Won);
      }
    }



  }, [letterInfo, gameState, guesses, target, won]);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (!e.ctrlKey && !e.metaKey) {
      onKey(e.key);
    }
    if (e.key === "Backspace") {
      e.preventDefault();
    }
  }, [onKey]);

  useEffect(() => {

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [currentGuess, gameState, onKeyDown, guesses]);


  return (
    <div className="Game" style={{ display: props.hidden ? "none" : "block" }}>
      <div id="chartHolder" style={{ display: won ? "block" : "none" }}>
        <Chart
          color={"#67b6c7"}
          data={{
            "100+": 2,
            "80-99": 13,
            "60-79": 13,
            "40-59": 14,
            "20-39": 18,
            "<20": 4
          }}
          your={guesses.length + 1}
          padding={10}
          gridColor={"#a55ca5"}
          gridScale={5}
          won={won}
        /><div className="wonHint">
          {hint || `\u00a0`}
        </div>
        {gameState !== GameState.Playing && (

          <button
            onClick={() => {
              shareWon(
                "Result copied to clipboard!",
                `${gameName} ${guesses.length}\n`
              );
            }}
          >
            Share results
          </button>
        )}
      </div>
      <div
        className="Game-rows"
        tabIndex={0}
        aria-label="Passage"
        ref={tableRef}
      >
        <Passage
          key={0}
          cluedLetters={target}
        />
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

      </p>
    </div>
  );
}

export default Game;



function allDone(target: Map<number, CluedLetter[]>): boolean {
  return Array.from(target.values()).flat().filter((x) => x.clue !== Clue.Punctuation && x.clue !== Clue.Correct && x.clue !== Clue.Space).length === 0
}


