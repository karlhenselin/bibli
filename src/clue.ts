export enum Clue {
  Absent,
  Space,
  Punctuation,
  Fade4,
  Fade3,
  Fade2,
  Fade1,
  Fade0,
  Correct
}
function decrimentClue(clue: Clue | undefined): Clue | undefined {
  if (clue === Clue.Fade0) {
    clue = Clue.Fade1;
  } else if (clue === Clue.Fade1) {
    clue = Clue.Fade2;
  } else if (clue === Clue.Fade2) {
    clue = Clue.Fade3;
  } else if (clue === Clue.Fade3) {
    clue = Clue.Fade4;
  } else if (clue === Clue.Fade4) {
    clue = undefined;
  }
  return clue
}
export interface ICluedLetter {
  clue: Clue | undefined;
  letter: string;
  isFaded(): boolean;
}

function lettersNoPunctuationOf(cluedLetters: CluedLetter[]): string {
  return cluedLetters.map((x) => x.letter).filter((x) => !isPunctuation(x)).join('');
}

export class CluedLetter implements ICluedLetter {
  isFaded(): boolean {
    return this.clue === Clue.Fade0 || this.clue === Clue.Fade1 || this.clue === Clue.Fade2 || this.clue === Clue.Fade3 || this.clue === Clue.Fade4;
  }
  constructor(public letter: string, public clue: Clue | undefined) {
  }

}


function wordInGuesses(word: string, guesses: string): boolean {
  let wordLength = word.length;

  if (wordLength === 0) {
    return true;
  }

  if (guesses.length === 0) {
    return false;
  }

  let tempWord = word.replaceAll(guesses.slice(-1), "");
  if (tempWord.length < wordLength) {
    return wordInGuesses(tempWord, guesses.replaceAll(guesses.slice(-1), ""));
  }
  return false;//No letters were removed, so this word didn't work out this time. It might from other guesses, of some letters might also.
}

export function onlyUnique(value: any, index: number, self: any[]) {
  return self.indexOf(value) === index;
}


function isFadedOrPunctuation(value: ICluedLetter, index: number, self: ICluedLetter[]) {
  return value.isFaded() || isPunctuation(value.letter);
}


export function isPunctuation(l: string): boolean {
  return /[1234567890!@#$%^&*()-=_+„]/.test(l) || /\p{Punctuation}/u.test(l);
}

function accentFold(inStr: string) {
  return inStr.normalize("NFD").replace(/\p{Diacritic}/gu, "")
}

export function clue(guesses: string, wordsMap: Map<number, CluedLetter[]>): Map<number, CluedLetter[]> {
  wordsMap.forEach((cluedLetters: CluedLetter[], word: number) => {
    //fade old clues

    for (var i = 0; i < cluedLetters.length; i++) {
      if (cluedLetters[i].clue !== Clue.Punctuation
        && cluedLetters[i].clue !== Clue.Correct) {
        cluedLetters[i].clue = decrimentClue(cluedLetters[i].clue)
      }
    }


    //check for whole words.
    if (wordInGuesses(accentFold(lettersNoPunctuationOf(cluedLetters)).toUpperCase(), guesses.toUpperCase())) {
      for (var j = 0; j < cluedLetters.length; j++) {
        if (cluedLetters[j].clue !== Clue.Punctuation) {
          cluedLetters[j].clue = Clue.Correct;
        }
      }
    }

    //Mark last clue.
    for (var k = 0; k < cluedLetters.length; k++) {
      if (cluedLetters[k].clue !== Clue.Correct && accentFold(cluedLetters[k].letter).toUpperCase() === guesses.slice(-1).toUpperCase()) {
        cluedLetters[k].clue = Clue.Fade0;
      }
    }

  })

  return wordsMap;
}

export function guessesNotInTarget(guesses: string, target: Map<number, CluedLetter[]>): CluedLetter[]
//Mark any guesses that aren't any good at all as absent to prevent double guesses.
{
  let absent: CluedLetter[] = [];
  const uniqueGuesses = guesses.toUpperCase().split('').filter(onlyUnique);
  const usedLetters: string = Array.from(target.values()).flat().filter((x) => x.clue !== Clue.Correct).map((x) => accentFold(x.letter).toUpperCase()).filter(onlyUnique).join('');
  for (var guess of uniqueGuesses) {
    if (usedLetters.indexOf(guess) === -1) {
      absent.push(new CluedLetter(guess, Clue.Absent));
    }
  }
  return absent
}
export function clueClass(clue: Clue | undefined): string {
  if (clue === Clue.Absent) {
    return "letter-absent";
  } else if (clue === Clue.Space) {
    return "letter-space";
  } else if (clue === Clue.Punctuation) {
    return "letter-punctuation";
  } else if (clue === Clue.Fade0) {
    return "letter-fade0";
  } else if (clue === Clue.Fade1) {
    return "letter-fade1";
  } else if (clue === Clue.Fade2) {
    return "letter-fade2";
  } else if (clue === Clue.Fade3) {
    return "letter-fade3";
  } else if (clue === Clue.Fade4) {
    return "letter-fade4";
  } else if (clue === Clue.Correct) {
    return "letter-correct";
  }
  return "letter-hidden";
}

export function clueWord(clue: Clue): string {
  if (clue === Clue.Absent) {
    return "no";
  } else {
    return "correct";
  }
}

export function describeClue(clue: CluedLetter[]): string {
  return clue
    .map(({ letter, clue }) => letter.toUpperCase() + " " + clueWord(clue!))
    .join(", ");
}

export function clueFadedWords(cluedLetters: Map<number, CluedLetter[]>) {
  cluedLetters.forEach((word: CluedLetter[]) => {
    if (word.length === word.filter(isFadedOrPunctuation).length) {
      word.filter((x) => x.clue !== Clue.Punctuation).forEach((x: ICluedLetter) => x.clue = Clue.Correct);
    }
  });
}
