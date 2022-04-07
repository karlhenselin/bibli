import "./App.css";
import { pick, pickRandom } from "./util";
import Game from "./Game";
import { useEffect, useState, Suspense } from "react";
import { About } from "./About";
import { languageOf, localeOf } from "./books";
import { bookify } from "./books";
import targetList from "./targets.json";
import { CluedLetter, isPunctuation, Clue } from "./clue";
import i18n from './i18n';
import Loading from "./Loading";
import LocaleContext from "./LocaleContext";


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

const params = new URLSearchParams(window.location.search);



function App() {


  type Page = "game" | "about" | "settings";
  const [page, setPage] = useState<Page>("game");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [locale, setLocale] = useState(i18n.language);
  const [dark, setDark] = useSetting<boolean>("dark", prefersDark);
  const [colorBlind, setColorBlind] = useSetting<boolean>("colorblind", false);
  const [random, setRandom] = useSetting<boolean>("random", false);
  const [puzzleText, setPuzzleText] = useState<string | null>(params.get("puzzleId"))
  const [puzzleId, setPuzzleId] = useState<number>(params.get("puzzleId") === null ? (random ? pickRandom(targets) : pick(targets)) : -1);
  const [loadingVerse, setLoadingVerse] = useState<boolean>(false);
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

  i18n.on('languageChanged', (lng) => setLocale(i18n.language));


  useEffect(() => {
    if (random) {
      setPuzzleId(pickRandom(targets));
    } else {
      setPuzzleId(pick(targets));
    }
  }, [random, setPuzzleId]);

  useEffect(() => {
    const l: string = localeOf(translation.substring(translation.indexOf("-") + 1));
    if (locale !== l) {
      i18n.changeLanguage(l);
    }
  }, [translation, locale]);

  useEffect(() => {
    if (params.get("puzzleId") === null) {
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
      setTarget(new Map());

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
          setLoadingVerse(false);
        })
        .catch(err => {
          console.error(err);
        });
    } else {
      const url: string = "https://bibli.petraguardsoftware.com/puzzles.php?puzzleId=" + params.get("puzzleId");
      setTarget(new Map());
      fetch(url, {
        method: 'get'
      }).then(response => response.text())
        .then(data => {
          setTarget(wordsMapFromText(data));
          setLoadingVerse(false);
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [translation, puzzleId]);

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
      return i18n.t("random");
    }
    return i18n.t("daily")
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <Suspense fallback={<Loading />}>
        <div className={"App-container" + (colorBlind ? " color-blind" : "")}>
          <h1>
            BIBLI
          </h1>
          <div className="top-left">
            {page === "game" && puzzleText === null && (<button disabled={loadingVerse} onClick={() => {
              setRandom((x: boolean) => !x);
              setLoadingVerse(true);
            }}
            >{randomText()}</button>
            )}
            {page === "game" && random && (<button disabled={loadingVerse} onClick={() => {
              setPuzzleId(pickRandom(targets));
              setLoadingVerse(true);
            }}>{i18n.t("Randomize")}</button>)}

          </div>
          <div className="top-right">
            {page !== "game" ? (
              link("❌", "Close", "game")
            ) : (
              <>
                {link("❓", i18n.t("About"), "about")}
                {link("⚙️", i18n.t("Settings"), "settings")}
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
                <label htmlFor="dark-setting">{i18n.t("Dark theme")}</label>
              </div>
              <div className="Settings-setting">
                <input
                  id="colorblind-setting"
                  type="checkbox"
                  checked={colorBlind}
                  onChange={() => setColorBlind((x: boolean) => !x)}
                />
                <label htmlFor="colorblind-setting">{i18n.t("High-contrast colors")}</label>
              </div>
              {puzzleText === null &&
                <div className="Settings-setting">
                  <label htmlFor="translation-setting">{i18n.t("Bible")}:</label>
                  <select
                    disabled={loadingVerse}
                    name="translation-setting"
                    id="translation-setting"
                    value={translation}
                    onChange={(e) => {
                      setTranslation(e.target.value);
                      setLoadingVerse(true);
                    }}
                  >
                    <option value="HCSB-English">Holman Christian Standard Bible (HCSB, English)</option>
                    <option value="NIV-English">New International Version (NIV, English)</option>
                    <option value="LBLA-Spanish">La Biblia de las Américas (LBLA, Español)</option>
                    <option value="LUTH1545-German">Luther Bible 1545 (LUTH, Deutsch)</option>
                    <option value="NEG1979-French">Nouvelle Edition de Genève 1979 (NEG, Français)</option>
                    <option value="SFB15-Swedish">Svenska Folkbibeln 2015 (SFB15, Svenska)</option>

                  </select>
                </div>
              }
              <div className="Settings-setting">
                <label htmlFor="keyboard-setting">{i18n.t("Keyboard layout")}:</label>
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
                <label htmlFor="enter-left-setting">{i18n.t('"Enter" on left side')}</label>
              </div>
            </div>
          )
          }

          {
            (target.size > 0 &&
              <Game
                hidden={page !== "game"}
                refresh={0}
                colorBlind={colorBlind}
                keyboardLayout={keyboard.replaceAll(
                  /[BE]/g,
                  (x) => (enterLeft ? "EB" : "BE")["BE".indexOf(x)]
                )}
                language={language}
                target={target}
                reference={puzzleText === null ? bookify(targets[puzzleId], language) : "Custom Game"}
                puzzleId={puzzleId}
                translation={puzzleText === null ? translation : puzzleText.toString()}
              />) || i18n.t('Loading') + "..."
          }
        </div >
      </Suspense>
    </LocaleContext.Provider>

  );
}

export default App;


