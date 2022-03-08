import { clue, Clue, CluedLetter } from "../src/clue";
const assert = require("assert");
describe("Clue", () => {
  it('works with 1 letter words.', () => {
    let cl = new CluedLetter("g",Clue.Fade0);
    let vClue: Map<number, CluedLetter[]> = clue("bhetg", new Map().set(0,[cl]));
    assert.equal(vClue.get(0)[0].clue, Clue.Correct);
  });

});