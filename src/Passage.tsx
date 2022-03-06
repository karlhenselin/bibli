import { JsxEmit } from "typescript";
import { clueClass, CluedLetter, ICluedLetter, Clue } from "./clue";

interface PassageProps {
  cluedLetters: Map<number, ICluedLetter[]>;
  annotation?: string;
}

export function Passage(props: PassageProps) {
  const wordDivs:React.InputHTMLAttributes<HTMLInputElement>[] = [];
  props.cluedLetters.forEach((value, key) =>{
    let withSpace = [];
    value.forEach((x) => {withSpace.push(x)});
    withSpace.push( new CluedLetter(" ",Clue.Space));

    const letterDivs = withSpace
    .map(({ clue, letter }, i) => {
      let letterClass = "Row-letter " + clueClass(clue);

      return (
        <div
          key={key+"w" + i}
          className={letterClass}
          aria-live={"off"}
          aria-label={clue === undefined ? "" : letter.toUpperCase()}
        >
          {clue === undefined ? "" : letter}
        </div>
      );
    });
    wordDivs.push (
      <div
          key={key+"p"}
          className={"word word" + letterDivs.length}
        >
          {letterDivs}
        </div>

    )
  
});
  
  let wordClass = "Row Row-locked-in";
  return (
    <div className={wordClass}>
      {props.annotation && (
        <span className="Row-annotation">{props.annotation}</span>
      )}
      {wordDivs}
    </div>
  );
}
