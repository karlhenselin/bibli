import { gameName } from "./util";
import Game from "./Game";
import { Language } from "./books";
import { wordsMapFromText } from "./App";
export function About() {
  return (
    <div className="App-about">
      <p>
        <i>{gameName}</i> is a game to encourage time with familiar Bible passages, working memory, and creative problem solving.
      </p>
      <p>
        Try to fill in the bible passage.
        Letters fade away after 5 other guesses unless they are locked into a completed word.
        The invisible letters can still make words, but you need to remember what you typed.
      </p>
      <hr />
      <p>
        For example, to complete this game in just 18 guesses you could type
        <b>bthise</b> (which would complete the words is, the, best, and the letters "se" are ready for petraguardsoftware)
        then type <b>oftwar</b> to complete Software. Now "ar" was what you typed last, so it's ready to go for Petraguard, so just type <b>ptegud</b> (in any order) to win!
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
      <p>Can you find a 17 guess solution?</p>
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
