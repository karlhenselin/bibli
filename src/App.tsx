import "./App.css";
import { pick } from "./util";
import Game from "./Game";
import { useEffect, useState } from "react";
import { About } from "./About";
import { languageOf } from "./books";
import { Language, bookify } from "./books";
import targetList from "./targets.json";
import { CluedLetter, isPunctuation, Clue } from "./clue";

var $ = require("jquery");
const targets = targetList;
let target: Map<number, CluedLetter[]>;
let candidate: string;
pickTodaysTarget();

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

export function pickTodaysTarget() {
  candidate = bookify(pick(targets), Language.English);
  //candidate = '1 Samuel 2: 3';
  const url = "http://localhost:3000/api/passage/?search=" + encodeURIComponent(candidate);
  return $.ajax({
    url: url,
    context: document.body,
    async: false

  }).done(function (data: any) {
    var thetext = $(data).find(".result-text-style-normal");
    thetext.find('h3').remove();
    thetext.find('a').remove();
    thetext.find('.versenum').remove();//kill the verse numbers.
    thetext.find('.chapternum').remove();//kill all #'s (verse numbers)
    thetext.find('.footnotes').remove();//kill the actual footnotes.
    thetext.find('.footnote').remove();//kill the actual footnotes.
    thetext.find('.crossreference').remove();//kill the actual footnotes.
    thetext.find('.crossrefs').remove();//get rid of crossreferences
    thetext.find('br').replaceWith(' ');//replace <br/> with a space so that we don't get words stuck together.

    const text: string = thetext.text().replace(/\s{2,}/g, ' ')//get rid of all enters and doubled spaces
      .replace(/^\s+|\s+$/g, "")//trim
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '');
    target = wordsMapFromText(text);
  }).catch((err: string) => { throw (err) });
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
  const [keyboard, setKeyboard] = useSetting<string>(
    "keyboard",
    "qwertyuiop-asdfghjkl-BzxcvbnmE"
  );
  const [translation, setTranslation] = useSetting<string>(
    "translation",
    "HCSB-English"
  );

  const [enterLeft, setEnterLeft] = useSetting<boolean>("enter-left", false);

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
            <label htmlFor="translation-setting">Translation:</label>
            <select
              name="translation-setting"
              id="translation-setting"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
            >
              <option value="HCSB-English">Holman Christian Standard Bible (HCSB, English)</option>
              <option value="NIV-English">New International Version (NIV, English)</option>
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
      <Game
        hidden={page !== "game"}
        colorBlind={colorBlind}
        keyboardLayout={keyboard.replaceAll(
          /[BE]/g,
          (x) => (enterLeft ? "EB" : "BE")["BE".indexOf(x)]
        )}
        language={languageOf(translation.substring(translation.indexOf("-")))}
        target={target}
        reference={candidate}
      />
    </div>
  );
}

export default App;
