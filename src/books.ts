export enum Language {
    English,
    Spanish,
    German,
    French
}

export function languageOf(s: string): Language {
    if (s === "Spanish") {
        return Language.Spanish;
    } else if (s === "German") {
        return Language.German;
    } else if (s === "French") {
        return Language.French;
    }
    return Language.English;
}

export function localeOf(s: string): string {
    if (s === "Spanish") {
        return "es";
    } else if (s === "German") {
        return "de";
    } else if (s === "French") {
        return "fr";
    }
    return "en";
}

const bookMap: Map<Language, string[]> = new Map(
    [
        [Language.English, ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation']],
        [Language.Spanish, ['Génesis', 'Éxodo', 'Levítico', 'Números', 'Deuteronomio', 'Josué', 'Jueces', 'Rut', '1 Samuel', '2 Samuel', '1 Reyes', '2 Reyes', '1 Crónicas', '2 Crónicas', 'Esdras', 'Nehemías', 'Ester', 'Job', 'Salmos', 'Proverbios', 'Eclesiastés', 'Cantares', 'Isaías', 'Jeremías', 'Lamentaciones', 'Ezequiel', 'Daniel', 'Oseas', 'Joel', 'Amós', 'Abdías', 'Jonás', 'Miqueas', 'Nahúm', 'Habacuc', 'Sofonías', 'Hageo', 'Zacarías', 'Malaquías', 'Mateo', 'Marcos', 'Lucas', 'Juan', 'Hechos', 'Romanos', '1 Corintios', '2 Corintios', 'Gálatas', 'Efesios', 'Filipenses', 'Colosenses', '1 Tesalonicenses', '2 Tesalonicenses', '1 Timoteo', '2 Timoteo', 'Tito', 'Filemón', 'Hebreos', 'Santiago', '1 Pedro', '2 Pedro', '1 Juan', '2 Juan', '3 Juan', 'Judas', 'Apocalipsis']],
        [Language.German, ['Genesis', 'Exodus', 'Levitikus', 'Numeri', 'Deuteronomium', 'Josua', 'Richter', 'Rut', '1.Samuel', '2.Samuel', '1.Könige', '2.Könige', '1.Chronik', '2.Chronik', 'Esra', 'Nehemia', 'Ester', 'Hiob ', 'Psalter', 'Sprüche ', 'Prediger ', 'Hohelied', 'Jesaja', 'Jeremia', 'Klagelieder ', 'Hesekiel ', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadja', 'Jona', 'Micha', 'Nahum', 'Habakuk', 'Zefanja', 'Haggai', 'Sacharja', 'Maleachi', 'Matthäus', 'Markus', 'Lukas', 'Johannes', 'Apostelgeschichte', 'Römer', '1.Korinther', '2.Korinther', 'Galater', 'Epheser', 'Philipper', 'Kolosser', '1.Thessalonicher', '2.Thessalonicher', '1.Timotheus', '2.Timotheus', 'Titus', 'Philemon', 'Hebräer', 'Jakobus', '1.Petrus', '2.Petrus', '1.Johannes', '2.Johannes', '3.Johannes', 'Judas', 'Offenbarung']],
        [Language.French, ['Genèse', 'Exode', 'Lévitique', 'Nombres', 'Deutéronome', 'Josué', 'Juges', 'Ruth', '1 Samuel', '2 Samuel', '1 Rois', '2 Rois', '1 Chroniques', '2 Chroniques', 'Esdras', 'Néhémie', 'Esther', 'Job', 'Psaumes', 'Proverbes', 'Ecclésiaste', 'Cantique des cantiques', 'Ésaïe', 'Jérémie', 'Lamentations', 'Ézéchiel', 'Daniel', 'Osée', 'Joël', 'Amos', 'Abdias', 'Jonas', 'Michée', 'Nahum', 'Habakuk', 'Sophonie', 'Aggée', 'Zacharie', 'Malachie', 'Matthieu', 'Marc', 'Luc', 'Jean', 'Actes', 'Romains ', '1 Corinthiens', '2 Corinthiens', 'Galates', 'Éphésiens', 'Philippiens', 'Colossiens', '1 Thessaloniciens', '2 Thessaloniciens', '1 Timothée', '2 Timothée', 'Tite', 'Philémon', 'Hébreux', 'Jacques', '1 Pierre', '2 Pierre', '1 Jean', '2 Jean', '3 Jean', 'Jude', 'Apocalypse']]
    ]);

export function bookify(s: string, l: Language): string {
    const book = bookMap.get(l);
    if (book === undefined) {
        return s;
    }

    return book[parseInt(s.substring(0, s.indexOf(" ")), 10)] + s.substring(s.indexOf(" "));
}
