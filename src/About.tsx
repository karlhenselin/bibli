import { gameName } from "./util";

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
        Report issues{" "}
        <a href="https://github.com/karlhenselin/bibli/issues">here</a>.
      </p>
      <p>
        This game will be free and ad-free forever.
      </p>
    </div>
  );
}
