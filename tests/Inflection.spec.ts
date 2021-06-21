import zlib = require("zlib");
import readline = require("readline");
import "mocha";
import { createReadStream, existsSync } from "fs";
import { expect, should } from "chai";
import { LaEngine } from "../src/LaEngine";
import { Conjugation, ConjugationData, ConjugationInfo } from "../src/modules/conjugation/LaVerb";
import { remove_html, remove_links } from "../src/modules/common";
import { AdjectiveData, DeclensionData, DeclProp, NounData } from "../src/modules/declination/LaNominal";
import { VerbAffix } from "../src/modules/conjugation/VerbAffix";
import { VerbForm } from "../src/modules/conjugation/VerbForm";

interface TestVector {
    lemma: string;
    heads: InflectionData[];
    inflections: InflectionData[];
}

interface InflectionData {
    input: string;
    output: any;
}

describe("engine", () => {
    const engine = new LaEngine();

    it("should match all test data", function() {
        this.timeout(0);

        // get from https://folko.solhost.org/wiktionary/la-test-vectors.gz
        const file = "./tests/data/la-test-vectors.gz";

        if (!existsSync(file)) {
            return;
        }

        const reader = readline.createInterface({
            input: createReadStream(file)
                    .pipe(zlib.createGunzip())
        });

        reader.on("line", line => {
            checkEntry(engine, JSON.parse(line) as TestVector);
        });

        return new Promise<void>(accept => {
            reader.once("close", () => {
                accept();
            });
        });
    });

    it("should decline gerunds as ndecl", () => {
        const data = engine.parse_template("{{la-decl-gerund|amandum}}", "amandum");
        expect(data.templateType).to.equal("declension");
        if (data.templateType == "declension") {
            expect(data.pos).to.equal("gerunds");
        }
    });

    it("should conjugate revertī correctly", () => {
        const data = engine.parse_template("{{la-conj|3.semi-depon|revertor|revers}}", "reverti");
        expect(data.templateType).to.equal("conjugation");
        if (data.templateType == "conjugation") {
            expect(data.data.forms.get(VerbForm.pres_actv_indc_2s)).to.contain("reverteris");
            expect(data.data.forms.get(VerbForm.perf_actv_indc_2s)).to.contain("revertistī");
        }
    });
});

function checkEntry(engine: LaEngine, entry: TestVector): void {
    for (const inf of entry.inflections) {
        processTemplate(engine, inf, entry.lemma);
    }

    for (const head of entry.heads) {
        processTemplate(engine, head, entry.lemma);
    }
}

function processTemplate(engine: LaEngine, inf: InflectionData, lemma: string) {
    const data = engine.parse_template(inf.input, lemma);

    switch (data.templateType) {
        case "conjugation":
            processVerb(data, inf.output);
            break;
        case "declension":
            switch (data.declensionType) {
                case "noun":
                    processNoun(data, inf.output);
                    break;
                case "adjective":
                    processAdjective(data, inf.output);
                    break;
            }
    }
}

function processVerb(conj: Conjugation, luaData: any) {
    const [data, info] = [conj.data, conj.info];

    compareVerbData(luaData.data, data);
    compareVerbInfo(luaData.info, info);

    // compare forms
    const luaForms = toMap(luaData.data.forms);
    compareForms(data.forms, luaForms);
}

function compareVerbData(luaData: any, jsData: ConjugationData) {
    // compare overriding_lemma
    expect(luaData.overriding_lemma || []).to.eql(jsData.overriding_lemma || []);

    // compare categories
    const luaCategories = luaData.categories.filter((c: string) => !c.includes("red links"));
    expect(luaCategories).to.eql(jsData.categories);

    // compare presuf
    for (const key of Object.keys(VerbAffix)) {
        const luaVal = luaData[key] || "";
        const jsVal = jsData.presuf.get(key as VerbAffix) || "";
        expect(luaVal).to.equal(jsVal);
    }

    // compare footnotes
    const luaNotes = new Map<string, string[]>();
    for (const [key, value] of Object.entries(luaData.form_footnote_indices)) {
        luaNotes.set(key, [luaData.footnotes[Number.parseInt(value as string, 10) - 1]]);
    }
    compareForms(jsData.footnotes, luaNotes);

    // compare forms
    compareForms(jsData.forms, toMap(luaData.forms));
}

function compareVerbInfo(luaInfo: any, jsInfo: ConjugationInfo) {
    // compare perf_stem
    expect(luaInfo.perf_stem || []).to.eql(jsInfo.perf_stem);

    // compare supine_stem
    expect(luaInfo.supine_stem || []).to.eql(jsInfo.supine_stem);

    // compare pres_stem
    expect(luaInfo.pres_stem || "").to.equal(jsInfo.pres_stem || "");

    // compare conj_type
    expect(luaInfo.conj_type).to.equal(jsInfo.conj_type);

    // compare conj_subtype
    expect(luaInfo.conj_subtype || "").to.equal(jsInfo.conj_subtype || "");

    // compare lemma
    expect(luaInfo.lemma || "").to.equal(jsInfo.lemma);

    // compare orig_lemma
    expect(luaInfo.orig_lemma || "").to.equal(jsInfo.orig_lemma);

    // compare prefix
    expect(luaInfo.prefix || "").to.equal(jsInfo.prefix);

    // compare verb
    expect(luaInfo.verb || "").to.equal(jsInfo.verb);

    // compare subtypes
    expect((Array.from(Object.keys(luaInfo.subtypes)))).to.eql(Array.from(jsInfo.subtypes.keys()));
}

function processNoun(decl: NounData, luaData: any) {
    // compare gender
    expect(luaData.gender).to.equal(decl.gender);

    // compare overriding_genders
    expect(luaData.overriding_genders || []).to.eql(decl.overriding_genders);

    expect(luaData.m || []).to.eql(decl.m);
    expect(luaData.f || []).to.eql(decl.f);

    compareNominal(luaData, decl);
}

function processAdjective(decl: AdjectiveData, luaData: any) {
    // compare noneut
    expect(luaData.noneut).equal(decl.noneut);

    // compare voc
    expect(luaData.voc).equal(decl.voc);

    // compare comp
    expect(luaData.comp || []).to.eql(decl.comp);

    // compare sup
    expect(luaData.sup || []).to.eql(decl.sup);

    // compare adv
    expect(luaData.adv || []).to.eql(decl.adv);

    compareNominal(luaData, decl);
}

function compareNominal(luaData: any, jsData: DeclensionData) {
    // compare overriding_lemma
    expect(luaData.overriding_lemma || []).to.eql(jsData.overriding_lemma);

    // compare title
    const titleShould = remove_links(luaData.title).replace(/''/g, "'");
    const titleIs = remove_links(jsData.title).replace(/''/g, "'");
    expect(titleShould).to.equal(titleIs);

    // compare pos
    expect(luaData.pos).to.equal(jsData.pos);

    // compare num
    expect(luaData.num || "").to.equal(jsData.num || "");

    // Compare user_specified
    expect(Object.keys(luaData.user_specified)).to.eql(Array.from(jsData.user_specified.values()));

    // compare categories
    const luaCategories = luaData.categories.filter((c: string) => !c.includes("red links"));
    expect(luaCategories).to.eql(jsData.categories);

    // compare notes
    compareForms(jsData.notes, toMap(luaData.notes));

    // compare indecl
    expect(luaData.indecl ? true : false).to.equal(jsData.indecl);

    // compare num_type
    expect(luaData.num_type).to.equal(jsData.num_type);

    // compare forms
    const jsForms = jsData.forms;
    const luaForms = toMap(luaData.forms);
    compareForms(jsForms, luaForms);

    // compare props
    const props = convertProps(luaData.propses);
    expect(props.length).to.equal(jsData.propses.length);

    for (let i = 0; i < props.length; i++) {
        expect(props[i].headword_decl).to.equal(jsData.propses[i].headword_decl);
        expect(props[i].decl).to.equal(jsData.propses[i].decl);
        expect(Array.from(props[i].types.keys())).to.eql(Array.from(jsData.propses[i].types.keys()));
    }
}

function convertProps(luaData: any): DeclProp[] {
    const luaProps: DeclProp[] = [];
    for (const prop of luaData) {
        if (Array.isArray(prop)) {
            luaProps.push(...convertProps(prop));
        } else {
            luaProps.push({
                decl: prop.decl,
                headword_decl: prop.headword_decl,
                types: new Set(Object.keys(prop.types))
            });
        }
    }
    return luaProps;
}

function toMap(forms: any): Map<string, string[]> {
    const res = new Map<string, string[]>();
    for (const [key, value] of Object.entries(forms)) {
        if (typeof(value) == "string") {
            res.set(key, [value]);
        } else {
            res.set(key, value as string[]);
        }
    }
    return res;
}

function compareForms(jsEntry: Map<string, string[]>, luaEntry: Map<string, string[]>) {
    const keys = new Set<string>();

    for (const key of jsEntry.keys()) {
        keys.add(key);
    }

    for (const key of luaEntry.keys()) {
        keys.add(key);
    }

    for (const key of keys) {
        const jsForms = jsEntry.get(key) || [];
        const luaForms = luaEntry.get(key) || [];

        if ((jsForms[0] == "" && luaForms.length == 0) || (luaForms[0] == "" && jsForms.length == 0)) {
            continue;
        }

        expect(jsForms.length).to.equal(luaForms.length,
            `[${luaForms.toString()}] vs [${jsForms.toString()}] in ${key}`);

        for (let i = 0; i < luaForms.length; i++) {
            const jsForm = remove_links(jsForms[i]);
            const luaForm = remove_links(remove_html(luaForms[i].replace(/''/g, "'")));
            expect(luaForm).to.equal(jsForm);
        }
    }
}
