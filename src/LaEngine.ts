import { parse_template } from "./modules/common";
import { ConjOptions, Conjugation, LaVerb } from "./modules/conjugation/LaVerb";
import { NounData, LaNominal, AdjectiveData } from "./modules/declination/LaNominal";
import { LaPersonalPronoun, PersonalPronounData } from "./modules/declination/LaPersonalPronoun";
import { Headword } from "./modules/headword/HeadWord";
import { HeadwordParser } from "./modules/headword/HeadwordParser";

export type FormData = NounData | AdjectiveData | Conjugation | PersonalPronounData;
export type TemplateData = FormData | Headword;

export interface EngineOptions {
    verbOptions?: ConjOptions;
}

export class LaEngine {
    private conj = new LaVerb();
    private nominal = new LaNominal();
    private ppron = new LaPersonalPronoun();
    private headword: HeadwordParser;

    public constructor(options?: EngineOptions) {
        this.conj = new LaVerb(options?.verbOptions);
        this.nominal = new LaNominal();
        this.headword = new HeadwordParser(this.nominal, this.conj);
    }

    public decline_noun(template: string): NounData {
        const args = parse_template(template);
        return this.nominal.do_generate_noun_forms(args);
    }

    public decline_gerund(template: string): NounData {
        const args = parse_template(template);
        const gerund = args.get("1");

        const gerundTemplate = `{{la-ndecl|${gerund}<2.sg>|nom_sg=-|voc_sg=-}}`;
        const gerundArgs = parse_template(gerundTemplate);
        return this.nominal.do_generate_noun_forms(gerundArgs, "gerunds");
    }

    public decline_adjective(template: string): AdjectiveData {
        const args = parse_template(template);
        return this.nominal.do_generate_adj_forms(args);
    }

    public conjugate_verb(template: string): Conjugation {
        const args = parse_template(template);
        return this.conj.make_data(args);
    }

    public parse_headword(template: string, lemma: string): Headword {
        return this.headword.parse(template, lemma);
    }

    public parse_word(template: string): FormData {
        const args = parse_template(template);
        const templateName = args.get("0") || "";

        switch (templateName) {
            case "la-conj":
                return this.conj.make_data(args);
            case "la-ndecl":
                return this.nominal.do_generate_noun_forms(args);
            case "la-adecl":
                return this.nominal.do_generate_adj_forms(args);
            case "la-decl-gerund":
                return this.decline_gerund(template);
            case "la-decl-ppron":
                return this.ppron.make_data();
            default:
                throw Error(`Unknown template ${templateName}`);
        }
    }

    public parse_template(template: string, lemma: string): TemplateData {
        if (this.headword.isHeadwordTemplate(template)) {
            return this.headword.parse(template, lemma);
        } else {
            return this.parse_word(template);
        }
    }
}
