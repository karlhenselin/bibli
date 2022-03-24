import { gameName } from "./util";
import Game from "./Game";
import { Language } from "./books";
import { wordsMapFromText } from "./App";
export function About() {
  return (
    <div className="App-about">
      <p>
        <i>{gameName}</i> is a game to encourage time with familiar Bible passages and maybe learn new ones.
      </p>
      <p>
        Bubli is a fun word-based hangman sort of game. You have to fill in the bible passage but there is a little catch.
        The letters you guess fade away after 5 other guesses unless they are locked into a completed word.
        Longer words can still be completed, but you need to type only letters that are in the word to lock it.
      </p>
      <hr />
      <p>
        For example, to complete the phrase <i>Petraguardsoftware is the best!</i> in just 18 guesses you could type
        <b>bthise</b> (which would complete the words is, the, best, and the se are ready for petraguardsoftware)
        then type <b>oftwar</b> (in any order) to complete Software. Now "ar" was what you typed last, so it's ready to go for Petraguard, so just type <b>ptegud</b> (in any order) to win!
      </p>
      <hr />
      <h3>Petraguard Software is the best!</h3>
      <hr />
      <Game
        hidden={false}
        refresh={0}
        colorBlind={false}
        keyboardLayout={"qwertyuiop-asdfghjkl-BzxcvbnmE"}
        language={Language.English}
        target={wordsMapFromText("Petraguard Software is the best!")}
        reference={"How To Play"}
        puzzleId={9999}
        translation={"tutorial-"}
      />
      <hr />
      <p>Can you find an 18 guess solution?</p>
      <hr />
      <p>
        Report issues{" "}
        <a href="https://github.com/karlhenselin/bibli/issues">here</a>.
      </p>
      <p>
        This game will be free and ad-free forever.
      </p>
    </div>
  );
}
