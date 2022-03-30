import Game from "./Game";
import { Language } from "./books";
import { wordsMapFromText } from "./App";
import i18n from "./i18n";
export function First() {
    return (
        <div className="App-about">
            <p>
                Solve the puzzle by clicking letters.
            </p>
            <p>
                Letters disappear after 5 other guesses, so you need to try and remember where they were.
            </p>
            <hr />
            <p>
                The answer to the first puzzle is shown below. Learn to play by completing this puzzle.
                You don't have to work from beginning to end. Letters you type attempt to complete all the words they are part of.
                A word is completed when either all the letters in it are visible, or all the letters in it have been typed without typing any letters that aren't in the word.

            </p>
            <hr />
            <h3>{i18n.t("I understand how play this game.")}</h3>
            <hr />
            <Game
                hidden={false}
                refresh={0}
                colorBlind={false}
                keyboardLayout={"qwertyuiop-asdfghjkl-BzxcvbnmE"}
                language={Language.English}
                target={wordsMapFromText(i18n.t("I understand how play this game."))}
                reference={i18n.t("First")}
                puzzleId={9998}
                translation={i18n.t("start") + "-"}
            />
            <hr />
            <p>{i18n.t("The hardest part of the game is solving long words. Can you find a 13 guess solution?")}</p>
        </div>
    );
}
