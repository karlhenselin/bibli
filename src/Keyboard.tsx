import { Clue, clueClass } from "./clue";

interface KeyboardProps {
  layout: string;
  letterInfo: Map<string, Clue>;
  onKey: (key: string) => void;
}

export function Keyboard(props: KeyboardProps) {
  const keyboard = props.layout
    .split("-")
    .map((row) =>
      row
        .split("")
        .map((key) => key.replace("B", "Backspace").replace("E", "Enter"))
    );
  return (
    <div className="Game-keyboard" aria-hidden="true">
      {keyboard.map((row, i) => (
        <div key={i} className="Game-keyboard-row">
          {row.map((label, j) => {
            let className = "Game-keyboard-button";
            let shouldDisable: boolean = false;
            const clue = props.letterInfo.get(label);
            if (clue === Clue.Absent) {
              className += " " + clueClass(Clue.Absent);
              shouldDisable = true;
            }
            if (clue === Clue.Fade0) {
              shouldDisable = true;
            }
            if (clue === Clue.Fade1) {
              shouldDisable = true;
            }
            if (clue === Clue.Fade2) {
              shouldDisable = true;
            }
            if (clue === Clue.Fade3) {
              shouldDisable = true;
            }
            if (clue === Clue.Fade4) {
              shouldDisable = true;
            }
            if (label.length > 1) {
              className += " Game-keyboard-button-wide";
            }
            return (
              <button
                tabIndex={-1}
                key={j}
                className={className}
                disabled={shouldDisable}
                onClick={() => {
                  props.onKey(label);
                }}
              >
                {label.replace("Backspace", "⌫").replace("Enter", "↵")}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
