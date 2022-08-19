import { VerbData } from "../conjugation/LaVerb";
import { AdjectiveData, NounData } from "../declination/LaNominal";

export type HeadwordData =
     NominalHead | AdjectivalHead | PrepositionHead |
     ComparativeHead | SuperlativeHead |
     VerbalHead | ParticleHead | GerundHead |
     AdverbHead | NumeralAdverbHead |
     LetterHead | InterjectionHead | PhraseHead | FormHead;

export interface BaseHead {
    templateType: "headword";
    heads: string[];
}

export interface FormHead extends BaseHead {
    headType: "form";
    partOfSpeech: string; // as below
}

export enum NominalType {
    Noun = "nouns",
    Numeral = "numerals",
    Suffix = "suffixes",
    ProperNoun = "proper nouns",
}

export interface NominalHead extends BaseHead {
    headType: "nominal";
    partOfSpeech: NominalType;
    indeclinable: boolean;
    data: NounData;
    genders: string[];
}

export enum AdjectivalType {
    Adjective = "adjectives",
    Numeral = "numerals",
    Suffix = "suffixes",
    Pronoun = "pronouns",
    Determiner = "determiners",
    Participle = "participles",
}

export interface AdjectivalHead extends BaseHead {
    headType: "adjectival";
    partOfSpeech: AdjectivalType;
    indeclinable: boolean;
    data: AdjectiveData;
    comparatives: string[];
    superlatives: string[];
    adverbs: string[];
}

export enum VerbalType {
    Verb = "verbs",
    Suffix = "suffixes",
}

export interface VerbalHead extends BaseHead {
    headType: "verbal";
    partOfSpeech: VerbalType;
    data: VerbData;
    infinitives: string[];
}

export interface GerundHead extends BaseHead {
    headType: "gerund";
    gerundive?: string;
}

export interface ComparativeHead extends BaseHead {
    headType: "comparative";
    neuter: string[];
    positive: string[];
    isLemma: boolean;
}

export interface SuperlativeHead extends BaseHead {
    headType: "superlative";
    neuter: string[];
    feminine: string[];
    positive: string[];
    isLemma: boolean;
}

export enum AdverbType {
    Adverb = "adverbs",
    Suffix = "suffixes",
    Comparative = "comparatives",
    Superlative = "superlatives",
}

export interface AdverbHead extends BaseHead {
    headType: "adverb";
    partOfSpeech: AdverbType;
    comparatives: string[];
    superlatives: string[];
}

export interface NumeralAdverbHead extends BaseHead {
    headType: "numeral_adverb";
    numType: string;
}

export interface LetterHead extends BaseHead {
    headType: "letter";
    upper: string[];
    lower: string[];
    mixed: string[];
    scriptCode: string;
}

export interface PrepositionHead extends BaseHead {
    headType: "preposition";
    genitive: boolean;
    accusative: boolean;
    ablative: boolean;
}

export interface PhraseHead extends BaseHead {
    headType: "phrase";
}

export interface InterjectionHead extends BaseHead {
    headType: "interjection";
}

export interface ParticleHead extends BaseHead {
    headType: "particle";
    partOfSpeech: string; // unfortunately, this is not standardized
}
