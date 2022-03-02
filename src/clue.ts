export enum Clue {
  Absent,
  Elsewhere,
  Correct,
  Space
}

export interface ICluedLetter {
  clue?: Clue;
  letter: string;
}

class CluedLetter implements ICluedLetter {
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

  let tempWord = word.replace(guesses.slice(-1), "");
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

  let tempWord = word.replace(guesses.slice(-1), "");
  if(tempWord.length < wordLength){
    let letters: string[] = word.split("");
    for(let i in letters){
      if(letters[i] === guesses.slice(-1)){
        cluedLetters[i].clue = Clue.Correct;
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

export function clue(guesses: string, target: string): CluedLetter[] {
  const clues: CluedLetter[] = [];
  const wordsMap: Map<string, CluedLetter[]> =  new Map<string, CluedLetter[]>();
  const words: string[] = target.split(" ");
  for(const word of words){
    let wordsCluedLetters: CluedLetter[] = [];
    let letters = word.split('');
    for(var n in letters){
      wordsCluedLetters.push(new CluedLetter(""));
    }
    wordsMap.set(word,wordsCluedLetters);
  }
  
  wordsMap.forEach((cluedLetters: CluedLetter[], word: string) => {
    //check for whole words first.
    if(wordInAllGuesses(word.toUpperCase(), guesses.toUpperCase())){
      for(var i = 0; i < cluedLetters.length; i++) {
        cluedLetters[i].clue = Clue.Correct;
        cluedLetters[i].letter = word.substring(i,i+1);
      }
    }

    //check for individual letters next.
    checkAdditionalLetters(word.toUpperCase(),guesses.toUpperCase(),cluedLetters);

   

    //now merge that into the array to return.
    for(var i = 0; i < cluedLetters.length; i++) {
      clues.push(cluedLetters[i])
    }
    clues.push(new CluedLetter(" ",Clue.Space));
  })
  
  return clues.slice(0,-1);
}

export function guessesNotInTarget(guesses: string, target: string): CluedLetter[]
//Mark any guesses that aren't any good at all as absent to prevent double guesses.
{
  let absent: CluedLetter[] = [];
  const uniqueGuesses = guesses.toUpperCase().split('').filter(onlyUnique);
  const usedLetters = target.toUpperCase().split('').filter(onlyUnique);
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
  }else if (clue === Clue.Elsewhere) {
    return "letter-elsewhere";
  } else {
    return "letter-correct";
  }
}

export function clueWord(clue: Clue): string {
  if (clue === Clue.Absent) {
    return "no";
  } else if (clue === Clue.Elsewhere) {
    return "elsewhere";
  } else {
    return "correct";
  }
}

export function describeClue(clue: CluedLetter[]): string {
  return clue
    .map(({ letter, clue }) => letter.toUpperCase() + " " + clueWord(clue!))
    .join(", ");
}
