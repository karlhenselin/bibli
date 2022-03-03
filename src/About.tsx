import { Clue } from "./clue";
import { Passage} from "./Passage";
import { gameName, maxGuesses } from "./util";

export function About() {
  return (
    <div className="App-about">
      <p>
        <i>{gameName}</i> is a game to encourage time with familiar Bible passages.
      </p>
      <p>
        You get {maxGuesses} tries to guess a target passage.
        <br />
        Letters that don't fit with other letters in a word that's incomplete float away on the next guessed letter. Guess letters in order of a word to save your guesses.
      </p>
      <hr />
     
      <p>
        Report issues{" "}
        <a href="https://github.com/karlhenselin/bubli/issues">here</a>.
      </p>
      <p>
        This game will be free and ad-free forever.
      </p>
    </div>
  );
}
