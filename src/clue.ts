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
export function dectrimentClue(clue: Clue) : Clue{
  if(clue === Clue.Fade0 ){
    clue = Clue.Fade1;
  } else if(clue === Clue.Fade1 ){
    clue = Clue.Fade2;
  } else if(clue === Clue.Fade2 ){
    clue = Clue.Fade3;
  } else if(clue === Clue.Fade3 ){
    clue = Clue.Fade4;
  } else if(clue === Clue.Fade4 ){
    clue = undefined;
  }
  return clue
}
export interface ICluedLetter {
  clue?: Clue;
  letter: string;
  isFaded(): boolean;
}

function lettersOf(cluedLetters: CluedLetter[]): string {
  return cluedLetters.map((x) => x.letter).join('');
}

function lettersNoPunctuationOf(cluedLetters: CluedLetter[]): string {
  return cluedLetters.map((x) => x.letter).filter((x) => !isPunctuation(x)).join('');
}

export class CluedLetter implements ICluedLetter {
  isFaded(): boolean {
    return this.clue === Clue.Fade0 || this.clue === Clue.Fade1 || this.clue === Clue.Fade2 || this.clue === Clue.Fade3 || this.clue === Clue.Fade4;
  }
  constructor(public letter: string,public clue?: Clue) {
  }
  
}

function wordInAllGuesses(word: string, guesses: string): boolean{
  if(guesses.length === 0){
    return false;
  }
  if(word.length === 0){
    return true;
  }
  if(wordInGuesses(word,guesses)){
    return true;
  }
  return wordInAllGuesses(word, guesses.substring(0,guesses.length-1));

}

function wordInGuesses(word: string, guesses: string): boolean{
  let wordLength = word.length;

  if(wordLength === 0){
    return true;
  }

  if(guesses.length === 0){
    return false;
  }

  let tempWord = word.replaceAll(guesses.slice(-1), "");
  if(tempWord.length < wordLength){
    return wordInGuesses(tempWord, guesses.substring(0,guesses.length-1));
  }
  return false;//No letters were removed, so this word didn't work out this time. It might from other guesses, of some letters might also.
}

function checkAdditionalLetters(word: string, guesses: string, cluedLetters: CluedLetter[]){
  let wordLength = word.length;

  if(wordLength === 0){
    return true;
  }

  if(guesses.length === 0){
    return false;
  }

  let tempWord = word.replaceAll(guesses.slice(-1), "");
  if(tempWord.length < wordLength){
    let letters: string[] = word.split("");
    for(let i in letters){
      if(letters[i] === guesses.slice(-1)){
        if(cluedLetters[i].clue === undefined){
          cluedLetters[i].clue = Clue.Fade0;
        }else{
          cluedLetters[i].clue = dectrimentClue(cluedLetters[i].clue);
        }
        cluedLetters[i].letter = letters[i];
      }
    }
    checkAdditionalLetters(word, guesses.slice(0,-1), cluedLetters);
  };
  return;
}


function onlyUnique(value: any, index: number, self: any[]) {
  return self.indexOf(value) === index;
}


function isFadedOrPunctuation(value: ICluedLetter, index: number, self: ICluedLetter[]) {
  return value.isFaded() || isPunctuation(value.letter);
}


export function isPunctuation(l: string): boolean{
  return /[,.:;?1234567890!@#$%^&*()-=_+]/.test(l);
}


export function clue(guesses: string, wordsMap: Map<number, CluedLetter[]>): Map<number, CluedLetter[]> {
  wordsMap.forEach((cluedLetters: CluedLetter[], word: number) => {
    //check for whole words first.
    if(wordInAllGuesses(lettersNoPunctuationOf(cluedLetters).toUpperCase(), guesses.slice(-1 * Math.max(12,guesses.length)).toUpperCase())){
      for(var i = 0; i < cluedLetters.length; i++) {
        if(cluedLetters[i].clue !== Clue.Punctuation){
          cluedLetters[i].clue = Clue.Correct;
          cluedLetters[i].letter = lettersOf(cluedLetters).substring(i,i+1);
        }
      }
    }

    //check for individual letters next.
    checkAdditionalLetters(lettersNoPunctuationOf(cluedLetters).toUpperCase(),guesses.toUpperCase(),cluedLetters);

  })
  
  return wordsMap;
}

export function guessesNotInTarget(guesses: string, target: Map<number, CluedLetter[]>): CluedLetter[]
//Mark any guesses that aren't any good at all as absent to prevent double guesses.
{
  let absent: CluedLetter[] = [];
  const uniqueGuesses = guesses.toUpperCase().split('').filter(onlyUnique);
  const usedLetters: string = Array.from(target.values()).flat().map((x) => x.letter.toUpperCase()).filter(onlyUnique).join('');
  for(var guess of uniqueGuesses){
    if(usedLetters.indexOf(guess) === -1){
      absent.push(new CluedLetter(guess,Clue.Absent));
    }
  }
  return absent
}
export function clueClass(clue: Clue): string {
  if (clue === Clue.Absent) {
    return "letter-absent";
  } else if (clue === Clue.Space) {
    return "letter-space";
  } else if (clue === Clue.Punctuation) {
    return "letter-punctuation";
  }else if (clue === Clue.Fade0) {
    return "letter-fade0";
  }else if (clue === Clue.Fade1) {
    return "letter-fade1";
  }else if (clue === Clue.Fade2) {
    return "letter-fade2";
  }else if (clue === Clue.Fade3) {
    return "letter-fade3";
  }else if (clue === Clue.Fade4) {
    return "letter-fade4";
  }else if (clue === Clue.Correct) {
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
    if(word.length === word.filter(isFadedOrPunctuation).length){
      word.forEach((x: ICluedLetter) => x.clue = Clue.Correct);
    }
  });
}
