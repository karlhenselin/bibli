import "./App.css";
import { pick, pickRandom } from "./util";
import Game from "./Game";
import { useEffect, useState } from "react";
import { About } from "./About";
import { languageOf } from "./books";
import { bookify } from "./books";
import targetList from "./targets.json";
import { CluedLetter, isPunctuation, Clue } from "./clue";

const targets = targetList;
let candidate: string;

export function wordsMapFromText(target: string): Map<number, CluedLetter[]> {
  const wordsMap: Map<number, CluedLetter[]> = new Map<number, CluedLetter[]>();
  const words: string[] = target.split(" ");
  for (const word in words) {
    let wordsCluedLetters: CluedLetter[] = [];
    let letters = words[word].split('');
    for (var n of letters) {
      if (isPunctuation(n)) {
        wordsCluedLetters.push(new CluedLetter(n, Clue.Punctuation));
      } else {
        wordsCluedLetters.push(new CluedLetter(n, undefined));
      }
    }
    wordsMap.set(parseInt(word), wordsCluedLetters);
  }
  return wordsMap;
}



function useSetting<T>(
  key: string,
  initial: T
): [T, (value: T | ((t: T) => T)) => void] {
  const [current, setCurrent] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initial;
    } catch (e) {
      return initial;
    }
  });
  const setSetting = (value: T | ((t: T) => T)) => {
    try {
      const v = value instanceof Function ? value(current) : value;
      setCurrent(v);
      window.localStorage.setItem(key, JSON.stringify(v));
    } catch (e) { }
  };
  return [current, setSetting];
}


function App() {
  type Page = "game" | "about" | "settings";
  const [page, setPage] = useState<Page>("game");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [dark, setDark] = useSetting<boolean>("dark", prefersDark);
  const [colorBlind, setColorBlind] = useSetting<boolean>("colorblind", false);
  const [random, setRandom] = useSetting<boolean>("random", false);
  const [puzzleId, setPuzzleId] = useState<number>(0);
  const [refresh, doRefresh] = useState(0);
  const [keyboard, setKeyboard] = useSetting<string>(
    "keyboard",
    "qwertyuiop-asdfghjkl-BzxcvbnmE"
  );
  const [translation, setTranslation] = useSetting<string>(
    "translation",
    "NIV-English"
  );
  const [target, setTarget] = useState<Map<number, CluedLetter[]>>(new Map());
  const [enterLeft, setEnterLeft] = useSetting<boolean>("enter-left", false);


  useEffect(() => {
    if (random) {
      setPuzzleId(pickRandom(targets));
    } else {
      setPuzzleId(pick(targets));
    }
  }, [random, setPuzzleId]);

  useEffect(() => {
    candidate = bookify(targets[puzzleId], languageOf(translation.substring(translation.indexOf("-") + 1)));
    let url: string;
    if (translation !== "") {
      url = "https://petraguardsoftware.com/bibles.php?search=" + encodeURIComponent(candidate) + "&version=" + encodeURIComponent(translation.substring(0, translation.indexOf("-")));
    } else {
      url = "https://petraguardsoftware.com/bibles.php?search=" + encodeURIComponent(candidate);
    }

    function tryReplaceSpace(x: HTMLCollectionOf<Element>) {
      if (x) {
        for (let y of x) {
          y.replaceWith(" ");
        }
      }
    }

    fetch(url, {
      method: 'get'
    }).then(response => response.text())
      .then(data => {
        const div = document.createElement("div");
        div.innerHTML = data;
        tryReplaceSpace(div.getElementsByTagName('br'));
        const text: string = div.innerText
          .replace(/[\u2018\u2019]/g, "'")
          .replace(/ß/g, "ss")
          .replace(/[\u201C\u201D]/g, '')
          .replace(/\s{2,}/g, ' ')//get rid of all enters and doubled spaces   
          .replace(/^[\s—-]+|[\s—-]+$/g, "")//trim;

        setTarget(wordsMapFromText(candidate + " " + text));

      })
      .catch(err => {
        console.error(err);
      });
  }, [translation, puzzleId, refresh]);

  useEffect(() => {
    document.body.className = dark ? "dark" : "";
    setTimeout(() => {
      // Avoid transition on page load
      document.body.style.transition = "0.3s background-color ease-out";
    }, 1);
  }, [dark]);

  const link = (emoji: string, label: string, page: Page) => (
    <button
      className="emoji-link"
      onClick={() => setPage(page)}
      title={label}
      aria-label={label}
    >
      {emoji}
    </button>
  );
  let language = languageOf(translation.substring(translation.indexOf("-") + 1));

  function randomText(): string {
    if (random) {
      return "Random";
    }
    return "Daily"
  }

  return (
    <div className={"App-container" + (colorBlind ? " color-blind" : "")}>
      <h1>
        BIBLI
      </h1>
      <div className="top-right">
        {page !== "game" ? (
          link("❌", "Close", "game")
        ) : (
          <>
            <button onClick={() => {
              setRandom((x: boolean) => !x);
            }
            }
              id="random"
            >{randomText()}</button>

            {link("❓", "About", "about")}
            {link("⚙️", "Settings", "settings")}
          </>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: 5,
          top: 5,
          visibility: page === "game" ? "visible" : "hidden",
        }}
      >
      </div>
      {page === "about" && <About />}
      {page === "settings" && (
        <div className="Settings">
          <div className="Settings-setting">
            <input
              id="dark-setting"
              type="checkbox"
              checked={dark}
              onChange={() => setDark((x: boolean) => !x)}
            />
            <label htmlFor="dark-setting">Dark theme</label>
          </div>
          <div className="Settings-setting">
            <input
              id="colorblind-setting"
              type="checkbox"
              checked={colorBlind}
              onChange={() => setColorBlind((x: boolean) => !x)}
            />
            <label htmlFor="colorblind-setting">High-contrast colors</label>
          </div>

          <div className="Settings-setting">
            <label htmlFor="translation-setting">Bible:</label>
            <select
              name="translation-setting"
              id="translation-setting"
              value={translation}
              onChange={(e) => {
                setTranslation(e.target.value);
                doRefresh(prev => prev + 1);
              }}
            >
              <option value="HCSB-English">Holman Christian Standard Bible (HCSB, English)</option>
              <option value="NIV-English">New International Version (NIV, English)</option>
              <option value="LBLA-Spanish">La Biblia de las Américas (LBLA, Español)</option>
              <option value="LUTH1545-German">Luther Bible 1545 (LUTH, Deutsch)</option>
              <option value="NEG1979-French">Nouvelle Edition de Genève 1979 (NEG, Français)</option>


            </select>
          </div>
          <div className="Settings-setting">
            <label htmlFor="keyboard-setting">Keyboard layout:</label>
            <select
              name="keyboard-setting"
              id="keyboard-setting"
              value={keyboard}
              onChange={(e) => setKeyboard(e.target.value)}
            >
              <option value="qwertyuiop-asdfghjkl-BzxcvbnmE">QWERTY</option>
              <option value="azertyuiop-qsdfghjklm-BwxcvbnE">AZERTY</option>
              <option value="qwertzuiop-asdfghjkl-ByxcvbnmE">QWERTZ</option>
              <option value="BpyfgcrlE-aoeuidhtns-qjkxbmwvz">Dvorak</option>
              <option value="qwfpgjluy-arstdhneio-BzxcvbkmE">Colemak</option>
            </select>
            <input
              style={{ marginLeft: 20 }}
              id="enter-left-setting"
              type="checkbox"
              checked={enterLeft}
              onChange={() => setEnterLeft((x: boolean) => !x)}
            />
            <label htmlFor="enter-left-setting">"Enter" on left side</label>
          </div>
        </div>
      )}

      {(target.size > 0 &&
        <Game
          hidden={page !== "game"}
          refresh={refresh}
          colorBlind={colorBlind}
          keyboardLayout={keyboard.replaceAll(
            /[BE]/g,
            (x) => (enterLeft ? "EB" : "BE")["BE".indexOf(x)]
          )}
          language={language}
          target={target}
          reference={bookify(targets[puzzleId], language)}
          puzzleId={puzzleId}
          translation={translation}
        />) || "Loading..."}
    </div>
  );
}

export default App;


