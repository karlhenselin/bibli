import { Clue, clueClass, ICluedLetter, clueWord } from "./clue";

interface PassageProps {
  passageLength: number;
  cluedLetters: ICluedLetter[];
  annotation?: string;
}

export function Passage(props: PassageProps) {
  const letterDivs = props.cluedLetters
    .map(({ clue, letter }, i) => {
        let letterClass = "Row-letter";
        if(letter === " "){
          letterClass += " Space";
        }else if (clue !== undefined) {
          letterClass += " " + clueClass(clue);
        }

      return (
        <div
          key={i}
          className={letterClass}
          aria-live={"off"}
          aria-label={letter.toUpperCase()}
        >
          {letter}
        </div>
      );
    });
  let wordClass = "Row Row-locked-in";
  return (
    <div className={wordClass}>
      {letterDivs}
      {props.annotation && (
        <span className="Row-annotation">{props.annotation}</span>
      )}
    </div>
  );
}
