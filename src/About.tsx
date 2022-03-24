import { gameName } from "./util";
import Game from "./Game";
import { Language } from "./books";
import { wordsMapFromText } from "./App";
import i18n from "./i18n";
export function About() {
  return (
    <div className="App-about">
      <p>
        <i>{gameName}</i> {i18n.t("about")}
      </p>
      <p>
        {i18n.t("about2")}
      </p>
      <hr />
      <p>
        {i18n.t("about3")}
        <b>bthise</b>
        {i18n.t("about4")}
        <b>oftwar</b>
        {i18n.t("about5")}
        <b>ptegud</b>
        {i18n.t("about6")}
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
        reference={i18n.t("How To Play")}
        puzzleId={9999}
        translation={i18n.t("tutorial") + "-"}
      />
      <hr />
      <p>{i18n.t("Can you find a 17 guess solution?")}</p>
      <hr />
      <p>
        {i18n.t("Report issues")}{" "}
        <a href="https://github.com/karlhenselin/bibli/issues">{i18n.t("here")}</a>.
      </p>
      <p>
        {i18n.t("adfree")}
      </p>
    </div>
  );
}
