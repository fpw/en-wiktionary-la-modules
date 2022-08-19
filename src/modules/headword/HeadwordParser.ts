/**
 * This is based on https://en.wiktionary.org/wiki/Module:la-headword developed by Benwing2.
 * It was converted from Lua to TypeScript by Folke Will <folko@solhost.org>.
 *
 * Original source: https://en.wiktionary.org/wiki/Module:la-headword
 *
 * Lua idioms, function and variable names kept as in the original in order to easily
 * backport later changes to this implementation.
 *
 * For that reason, it's suggested to add a type-aware wrapper around this class and leave
 * this code unchanged instead of improving the types and use of idioms in this class.
 *
 */
import { parse_template, read_list } from "../common";
import { LaVerb } from "../conjugation/LaVerb";
import { getVerbForm } from "../conjugation/VerbForm";
import { LaNominal } from "../declination/LaNominal";
import { getNominalForm } from "../declination/NominalForm";
import { AdjectivalType, AdverbType, HeadwordData, NominalType, VerbalType } from "./HeadWord";

export type Args = Map<string, string>;

type Parser = (args: Args, lemma: string) => HeadwordData;

export class HeadwordParser {
    private templateParsers: Map<string, Parser> = new Map([
        // these are parsed by la-ndecl
        ["la-noun",         args => this.parseNominalHead(args, NominalType.Noun)],
        ["la-num-noun",     args => this.parseNominalHead(args, NominalType.Numeral)],
        ["la-suffix-noun",  args => this.parseNominalHead(args, NominalType.Suffix)],
        ["la-proper noun",  args => this.parseNominalHead(args, NominalType.ProperNoun)],

        // these are parsed by la-adecl
        ["la-adj",          args => this.parseAdjectivalHead(args, AdjectivalType.Adjective)],
        ["la-num-adj",      args => this.parseAdjectivalHead(args, AdjectivalType.Numeral)],
        ["la-suffix-adj",   args => this.parseAdjectivalHead(args, AdjectivalType.Suffix)],
        ["la-pronoun",      args => this.parseAdjectivalHead(args, AdjectivalType.Pronoun)],
        ["la-det",          args => this.parseAdjectivalHead(args, AdjectivalType.Determiner)],
        ["la-part",         args => this.parseAdjectivalHead(args, AdjectivalType.Participle)],

        // these are parsed by la-verb
        ["la-verb",         args => this.parseVerbalHead(args, VerbalType.Verb)],
        ["la-suffix-verb",  args => this.parseVerbalHead(args, VerbalType.Suffix)],

        // these are all custom
        ["la-gerund",       (args, lemma) => this.parseGerund(args)],
        ["la-adj-comp",     (args, lemma) => this.parseComparativeAdj(args, lemma)],
        ["la-adj-sup",      (args, lemma) => this.parseSuperlativeAdj(args, lemma)],
        ["la-adv",          (args, lemma) => this.parseAdverb(args, AdverbType.Adverb)],
        ["la-adv-comp",     (args, lemma) => this.parseAdverbCompSup(args, AdverbType.Comparative)],
        ["la-adv-sup",      (args, lemma) => this.parseAdverbCompSup(args, AdverbType.Superlative)],
        ["la-suffix-adv",   (args, lemma) => this.parseAdverb(args, AdverbType.Suffix)],
        ["la-num-adv",      (args, lemma) => this.parseAdverbNumeral(args)],
        ["la-prep",         (args, lemma) => this.parsePreposition(args, lemma)],
        ["la-letter",       (args, lemma) => this.parseLetter(args, lemma)],
        ["la-interj",       (args, lemma) => this.parseInterjection(args, lemma)],
        ["la-phrase",       (args, lemma) => this.parsePhrase(args, lemma)],
        ["head",            (args, lemma) => this.parseHead(args, lemma)],

        // forms only
        ["la-adj-form",         (args, lemma) => this.parseForm(args, lemma, "adjectives")],
        ["la-noun-form",        (args, lemma) => this.parseForm(args, lemma, "nouns")],
        ["la-proper noun-form", (args, lemma) => this.parseForm(args, lemma, "proper nouns")],
        ["la-num-form",         (args, lemma) => this.parseForm(args, lemma, "numerals")],
        ["la-pronoun-form",     (args, lemma) => this.parseForm(args, lemma, "pronouns")],
        ["la-part-form",        (args, lemma) => this.parseForm(args, lemma, "participles")],
        ["la-verb-form",        (args, lemma) => this.parseForm(args, lemma, "verbs")],
        ["la-gerund-form",      (args, lemma) => this.parseForm(args, lemma, "gerunds")],
        ["la-suffix-form",      (args, lemma) => this.parseForm(args, lemma, "suffixes")],
        ["la-det-form",         (args, lemma) => this.parseForm(args, lemma, "determiners")],
    ]);

    private nominal: LaNominal;
    private conj: LaVerb;
    private logger: ((msg: string) => void) | undefined;

    public constructor(nominal: LaNominal, conj: LaVerb, logger?: (msg: string) => void) {
        this.nominal = nominal;
        this.conj = conj;
        this.logger = logger;
    }

    public isHeadwordTemplate(template: string): boolean {
        const args = parse_template(template);
        const templateName = args.get("0");
        if (!templateName) {
            throw Error(`Invalid template string: ${template}`);
        }
        return this.templateParsers.has(templateName);
    }

    public parse(template: string, lemma: string): HeadwordData {
        const args = parse_template(template);
        const templateName = args.get("0") || "nil";
        const parseFunc = this.templateParsers.get(templateName);
        if (!parseFunc) {
            throw Error(`Not a headword template: ${template}`);
        }

        const data = parseFunc(args, lemma);
        if (data.heads.length == 0) {
            throw Error(`No heads for ${template} in ${lemma}`);
        }

        return data;
    }

    private log(msg: string) {
        if (this.logger) {
            this.logger(msg);
        }
    }

    private parseNominalHead(args: Args, pos: NominalType): HeadwordData {
        const overridePos = args.get("pos") || pos;
        const decl = this.nominal.do_generate_noun_forms(args, overridePos, true);
        const isNum = (pos == "numerals");

        let lemmata = decl.overriding_lemma;
        const lemmaNum = (decl.num == "pl" ? "pl" : "sg");
        if (lemmata.length == 0) {
            lemmata = getNominalForm(decl.forms, `linked_nom_${lemmaNum}`) || [];
        }

        let genders = decl.overriding_genders || [];
        if (genders.length == 0) {
            if (decl.gender) {
                genders = [decl.gender.toLowerCase()];
            } else if (!isNum) {
                throw Error("Couldn't infer gender");
            }
        }

        return {
            templateType: "headword",
            headType: "nominal",
            partOfSpeech: pos,
            indeclinable: args.has("indecl"),
            data: decl,
            heads: lemmata,
            genders: genders,
        };
    }

    private parseAdjectivalHead(args: Args, pos: AdjectivalType): HeadwordData {
        const overridePos = args.get("pos") || pos;
        const decl = this.nominal.do_generate_adj_forms(args, overridePos, true);

        let lemmata = decl.overriding_lemma;
        const lemmaNum = (decl.num == "pl" ? "pl" : "sg");
        if (lemmata.length == 0) {
            lemmata = getNominalForm(decl.forms, `linked_nom_${lemmaNum}_m`) || [];
        }

        return {
            templateType: "headword",
            headType: "adjectival",
            partOfSpeech: pos,
            indeclinable: args.has("indecl"),
            data: decl,
            heads: lemmata,
            comparatives: decl.comp,
            superlatives: decl.sup,
            adverbs: decl.adv,
        };
    }

    private parseVerbalHead(args: Args, pos: VerbalType): HeadwordData {
        const conj = this.conj.make_data(args);

        let lemma_forms = conj.data.overriding_lemma;
        if (lemma_forms.length == 0) {
            lemma_forms = LaVerb.get_lemma_forms(conj.data, true);
        }

        const infinitives = getVerbForm(conj.data.forms, "pres_actv_inf") || [];

        return {
            templateType: "headword",
            headType: "verbal",
            data: conj,
            partOfSpeech: pos,
            heads: lemma_forms,
            infinitives: infinitives,
        };
    }

    private parseGerund(args: Args): HeadwordData {
        const gerund = args.get("1") || "";
        const match = gerund.match(/^(.*)um$/);
        if (!match) {
            throw Error(`Unrecognized gerund ending in: ${gerund}`);
        }
        const stem = match[1];

        const a2 = args.get("2") || "";
        let gerundive;
        if (a2 == "-") {
            gerundive = undefined;
        } else {
            gerundive = a2 || (stem + "us");
        }

        return {
            templateType: "headword",
            headType: "gerund",
            heads: [gerund],
            gerundive: gerundive,
        };
    }

    private parseComparativeAdj(args: Args, lemma: string): HeadwordData {
        const a1 = args.get("1");
        const a2 = args.get("2");
        const is_lemma = args.get("is_lemma");
        const heads = read_list(args, "head");
        const positive = read_list(args, "pos");

        if (heads.length == 0) {
            if (a1) {
                heads.push(a1);
            } else {
                heads.push(lemma);
            }
        }

        if (positive.length == 0) {
            if (a2) {
                positive.push(a2);
            }
        }

        const n: string[] = [];
        for (const head of heads) {
            if (!head.endsWith("or")) {
                this.log(`Strange comparative head ${head} in ${lemma}`);
            }
            const neuter = head.replace(/or$/, "us");
            n.push(neuter);
        }

        return {
            templateType: "headword",
            headType: "comparative",
            isLemma: is_lemma ? true : false,
            heads: heads,
            neuter: n,
            positive: positive,
        };
    }

    private parseSuperlativeAdj(args: Args, lemma: string): HeadwordData {
        const a1 = args.get("1");
        const a2 = args.get("2");
        const is_lemma = args.get("is_lemma");
        const heads = read_list(args, "head");
        const positive = read_list(args, "pos");

        if (heads.length == 0) {
            if (a1) {
                heads.push(a1);
            } else {
                heads.push(lemma);
            }
        }

        if (positive.length == 0) {
            if (a2) {
                positive.push(a2);
            }
        }

        const n: string[] = [];
        const f: string[] = [];
        for (const head of heads) {
            if (!head.endsWith("us")) {
                this.log(`Skpping invalid superlative head ${head} in ${lemma}`);
                continue;
            }
            const stem = head.replace(/us$/, "");
            f.push(stem + "a");
            n.push(stem + "um");
        }

        return {
            templateType: "headword",
            headType: "superlative",
            isLemma: is_lemma ? true : false,
            heads: heads,
            neuter: n,
            feminine: f,
            positive: positive,
        };
    }

    private parseAdverb(args: Args, pos: AdverbType): HeadwordData {
        const a1 = args.get("1");
        const a2 = args.get("2");
        const a3 = args.get("3");
        const heads = read_list(args, "head");
        let comp = read_list(args, "comp");
        let sup = read_list(args, "sup");

        if (a1) {
            heads.push(a1);
        }

        if (a2) {
            comp.push(a2);
        }

        if (a3) {
            sup.push(a3);
        }

        if (comp.length > 0 && comp[0] == "-") {
            sup = ["-"];
        }

        if (comp.length == 0 || sup.length == 0) {
            const default_comp: string[] = [];
            const default_sup: string[] = [];
            for (const head of heads) {
                let stem;
                for (let suff of ["iter", "nter", "ter", "er", "iē", "ē", "im", "ō"]) {
                    const match = head.match(new RegExp(`(.*)${suff}$`));
                    if (match) {
                        stem = match[1];
                        if (suff == "nter") {
                            stem = stem + "nt";
                            suff = "er";
                        }
                        default_comp.push(stem + "ius");
                        default_sup.push(stem + "issimē");
                        break;
                    }
                }
                if (!stem) {
                    throw Error("Unrecognized adverb type");
                }
            }
            if (comp.length == 0) {
                comp = default_comp;
            }
            if (sup.length == 0) {
                sup = default_sup;
            }
        }

        if (comp.length > 0 && comp[0] == "-") {
            comp = [];
        }

        if (sup.length > 0 && sup[0] == "-") {
            sup = [];
        }

        return {
            templateType: "headword",
            headType: "adverb",
            partOfSpeech: pos,
            heads: heads,
            comparatives: comp,
            superlatives: sup,
        };
    }

    private parseAdverbNumeral(args: Args): HeadwordData {
        const a1 = args.get("1") || "";
        const numType = args.get("type") || "";

        return {
            templateType: "headword",
            headType: "numeral_adverb",
            heads: [a1],
            numType: numType,
        };
    }

    private parseAdverbCompSup(args: Args, pos: AdverbType): HeadwordData {
        const head = args.get("1");
        let heads: string[] | undefined;
        if (head) {
            heads = [head];
        }

        return {
            templateType: "headword",
            headType: "adverb",
            partOfSpeech: pos,
            heads: heads || [],
            comparatives: [],
            superlatives: [],
        };
    }

    private parseLetter(args: Args, lemma: string): HeadwordData {
        const upper = read_list(args, "upper");
        const lower = read_list(args, "lower");
        const mixed = read_list(args, "mixed");
        const sc = args.get("sc") || "";

        if (upper.length == 0 && lower.length == 0 && mixed.length == 0) {
            this.log(`No parameters for letter ${lemma}`);
            upper.push(lemma);
        }

        return {
            templateType: "headword",
            headType: "letter",
            heads: upper.concat(lower).concat(mixed),
            upper: upper,
            lower: lower,
            mixed: mixed,
            scriptCode: sc,
        };
    }

    private parsePreposition(args: Args, lemma: string): HeadwordData {
        let genitive = false;
        let ablative = false;
        let accusative = false;

        const heads = read_list(args, "head");

        for (const [key, value] of args) {
            if (value == "genitive") {
                genitive = true;
            } else if (value == "ablative") {
                ablative = true;
            } else if (value == "accusative") {
                accusative = true;
            } else {
                if (key != "0") {
                    heads.push(value);
                }
            }
        }

        if (heads.length == 0) {
            heads.push(lemma);
        }

        return {
            templateType: "headword",
            headType: "preposition",
            heads: heads,
            genitive: genitive,
            accusative: accusative,
            ablative: ablative,
        };
    }

    private parseInterjection(args: Args, lemma: string): HeadwordData {
        const head = args.get("head");
        let interj = head || args.get("1");
        if (!interj) {
            interj = lemma;
        }

        return {
            templateType: "headword",
            headType: "interjection",
            heads: [interj],
        };
    }

    private parsePhrase(args: Args, lemma: string): HeadwordData {
        let phrase = args.get("1");
        if (!phrase) {
            phrase = lemma;
        }

        return {
            templateType: "headword",
            headType: "phrase",
            heads: [phrase],
        };
    }

    private parseHead(args: Args, lemma: string): HeadwordData {
        const pos = args.get("2");
        const heads = read_list(args, "head");

        if (!pos) {
            throw Error(`la-head without pos: ${lemma}`);
        }

        if (heads.length == 0) {
            heads.push(lemma);
        }

        return {
            templateType: "headword",
            headType: "particle",
            partOfSpeech: pos,
            heads: heads,
        };
    }

    private parseForm(args: Args, lemma: string, pos: string): HeadwordData {
        let form = args.get("1");
        if (!form) {
            form = lemma;
        }

        return {
            templateType: "headword",
            headType: "form",
            partOfSpeech: pos,
            heads: [form],
        };
    }
}
