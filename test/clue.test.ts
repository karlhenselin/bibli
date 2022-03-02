import { clue, ICluedLetter,Clue } from "../src/clue";
const assert = require("assert");
describe("Clue", () => {
  it('works with 1 letter words.', () => {
    let vClue: ICluedLetter[] = clue("bhetg","g");
     assert.equal(vClue[0].clue,Clue.Correct);
  });

  });