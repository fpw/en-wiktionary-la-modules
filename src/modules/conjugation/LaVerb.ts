/**
 * This is a complete re-implementation of Wiktionary's Module:la-verb, developed by Benwing2.
 * It was converted from Lua to TypeScript by Folke Will <folko@solhost.org>.
 *
 * A few new options to suppress certain rate forms were added.
 *
 * Original source: https://en.wiktionary.org/wiki/Module:la-verb
 * Based on version: https://en.wiktionary.org/w/index.php?title=Module:la-verb&oldid=61433260
 *
 * Lua idioms, function and variable names kept as in the original in order to easily
 * backport later changes to this implementation.
 *
 * For that reason, it's suggested to add a type-aware wrapper around this class and leave
 * this code unchanged instead of improving the types and use of idioms in this class.
 *
 */
import { ArgMap, extract_base, FormMap, read_list, remove_links, strip_macrons } from "../common";
import { VerbAffix } from "./VerbAffix";
import { getVerbForm, setVerbForm, VerbForm } from "./VerbForm";
import { addVerbType, hasVerbType, VerbType } from "./VerbType";

export type ConjType = "1st" | "2nd" | "3rd" | "3rd-io" | "4th" | "irreg";

export interface ConjOptions {
    // suppress the -ere form in the 3rd person perfect singular,
    // see https://www.reddit.com/r/LatinLanguage/comments/bm2dsq/difference_between_amaverunt_and_amavere/
    suppressPerfectEre?: boolean;

    // suppress -re forms in the 2nd person singular passive form,
    // see https://latin.stackexchange.com/a/2922
    suppressPassiveRe?: boolean;

    // suppress und-variants in future participles,
    // see https://latin.stackexchange.com/a/4900
    suppressUndVariants?: boolean;

    // suppress the additional -i perfect forms in the 4th conjugation,
    // see https://latin.stackexchange.com/a/9351
    suppressIPerfect?: boolean;

    // suppress poetic forms that are set using options like poetsyncperf
    suppressPoet?: boolean;
}

export interface Conjugation {
    templateType: "conjugation";

    info: ConjugationInfo;
    data: ConjugationData;
}

export interface ConjugationInfo {
    lemma: string;
    orig_lemma: string;
    conj_type: ConjType;
    conj_subtype?: ConjType;
    subtypes: Set<VerbType>;

    verb: string;
    prefix: string;

    pres_stem: string;
    perf_stem: string[];
    supine_stem: string[];
}

export interface ConjugationData {
    forms: FormMap<VerbForm>;
    presuf: Map<VerbAffix, string>;
    categories: string[];
    footnotes: FormMap<string>;
    overriding_lemma: string[];
}

type ConjugationFunction = (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => void;

export class LaVerb {
    private non_generic_slots: string[];
    private generic_slots: string[];
    private irreg_verbs_to_conj_type = new Map<string, ConjType>([
        ["aiō", "3rd-io"],
        ["aiiō", "3rd-io"],
        ["ajō", "3rd-io"],
        ["dīcō", "3rd"],
        ["dūcō", "3rd"],
        ["faciō", "3rd-io"],
        ["fīō", "3rd"],
        ["ferō", "3rd"],
        ["inquam", "irreg"],
        ["libet", "2nd"],
        ["lubet", "2nd"],
        ["licet", "2nd"],
        ["volō", "irreg"],
        ["mālō", "irreg"],
        ["nōlō", "irreg"],
        ["possum", "irreg"],
        ["piget", "2nd"],
        ["coepī", "irreg"],
        ["sum", "irreg"],
        ["edō", "3rd"],
        ["dō", "1st"],
        ["eō", "irreg"],
    ]);
    private allowed_subtypes = new Set<string>([
        "impers",
        "3only",
        "depon",
        "semidepon",
        "optsemidepon",
        "nopass",
        "pass3only",
        "passimpers",
        "perfaspres",
        "noperf",
        "nopasvperf",
        "nosup",
        "supfutractvonly",
        "noimp",
        "nofut",
        "p3inf",
        "poetsyncperf",
        "optsyncperf",
        "alwayssyncperf",
        "m",
        "f",
        "n",
        "mp",
        "fp",
        "np",
        "highlydef",
    ]);

    private static potential_lemma_slots = [
        "1s_pres_actv_indc", // regular
        "3s_pres_actv_indc", // impersonal
        "1s_perf_actv_indc", // coepī
        "3s_perf_actv_indc", // doesn't occur?
    ];

    private conjugations = new Map<string, ConjugationFunction>();
    private irreg_conjugations = new Map<string, ConjugationFunction>();
    private options: ConjOptions;

    public constructor(options?: ConjOptions) {
        this.options = options || {};
        [this.non_generic_slots, this.generic_slots] = this.initialize_slots();
        this.setup_conjs();
    }

    public make_data(args: ArgMap): Conjugation {
        for (const slot of this.iter_slots(true, false)) {
            if (!args.has(slot)) {
                args.set(slot, "");
            }
        }

        const [conj_type, conj_subtype, subtypes, orig_lemma, lemma] = this.detect_decl_and_subtypes(args);
        const conj = this.conjugations.get(conj_type);
        if (!conj) {
            throw Error(`Unknown conjugation type ${conj_type}`);
        }

        const data: ConjugationData = {
            overriding_lemma: read_list(args, "lemma"),
            forms: new Map(),
            presuf: new Map(),
            categories: [],
            footnotes: new Map(),
        };

        const typeinfo: ConjugationInfo = {
            lemma: lemma,
            orig_lemma: orig_lemma,
            conj_type: conj_type,
            conj_subtype: conj_subtype,
            subtypes: subtypes,
            verb: "",
            prefix: "",
            pres_stem: "",
            perf_stem: [],
            supine_stem: []
        };

        if (args.get("passive_prefix") && !args.get("prefix")) {
            throw Error("Can't specify passiv_prefix without prefix");
        }
        if (args.get("plural_prefix") && !args.get("prefix")) {
            throw Error("Can't specify plural_prefix without prefix");
        }
        if (args.get("plural_passive_prefix") && !args.get("prefix")) {
            throw Error("Can't specify plural_passive_prefix without prefix");
        }
        if (args.get("passive_suffix") && !args.get("suffix")) {
            throw Error("Can't specify passive_suffix without suffix");
        }
        if (args.get("plural_suffix") && !args.get("suffix")) {
            throw Error("Can't specify plural_suffix without suffix");
        }
        if (args.get("plural_passive_suffix") && !args.get("suffix")) {
            throw Error("Can't specify plural_passive_suffix without suffix");
        }

        const normalize_prefix = (prefix: string | undefined): string => {
            if (!prefix) {
                return "";
            }

            const no_space_prefix = prefix.match(/(.*)_$/);
            if (no_space_prefix) {
                return no_space_prefix[1];
            } else if (prefix.match(/-$/)) {
                return prefix;
            } else {
                return prefix + " ";
            }
        };

        const normalize_suffix = (suffix: string | undefined): string => {
            if (!suffix) {
                return "";
            }

            const no_space_suffix = suffix.match(/_(.*)$/);
            if (no_space_suffix) {
                return no_space_suffix[1];
            } else if (suffix.match(/^-/)) {
                return suffix;
            } else {
                return " " + suffix;
            }
        };

        data.presuf.set(VerbAffix.Prefix, normalize_prefix(args.get("prefix")));
        data.presuf.set(VerbAffix.PassivePrefix, normalize_prefix(args.get("passive_prefix")) || data.presuf.get(VerbAffix.Prefix) || "");
        data.presuf.set(VerbAffix.PluralPrefix, normalize_prefix(args.get("plural_prefix")) || data.presuf.get(VerbAffix.Prefix) || "");

        data.presuf.set(VerbAffix.PluralPassivePrefix, normalize_prefix(args.get("plural_passive_prefix")) || normalize_prefix(args.get("passive_prefix")) || data.presuf.get(VerbAffix.PluralPrefix) || "");
        data.presuf.set(VerbAffix.GenitivePrefix, normalize_prefix(args.get("gen_prefix")));
        data.presuf.set(VerbAffix.DativePrefix, normalize_prefix(args.get("dat_prefix")));
        data.presuf.set(VerbAffix.AccusativePrefix, normalize_prefix(args.get("acc_prefix")));
        data.presuf.set(VerbAffix.AblativePrefix, normalize_prefix(args.get("abl_prefix")));

        data.presuf.set(VerbAffix.Suffix, normalize_suffix(args.get("suffix")));
        data.presuf.set(VerbAffix.PassiveSuffix, normalize_suffix(args.get("passive_suffix")) || data.presuf.get(VerbAffix.Suffix) || "");
        data.presuf.set(VerbAffix.PluralSuffix, normalize_suffix(args.get("plural_suffix")) || data.presuf.get(VerbAffix.Suffix) || "");
        data.presuf.set(VerbAffix.PluralPassiveSuffix, normalize_suffix(args.get("plural_passive_suffix")) || normalize_suffix(args.get("passive_suffix")) || data.presuf.get(VerbAffix.PluralSuffix) || "");

        data.presuf.set(VerbAffix.GenitiveSuffix, normalize_suffix(args.get("gen_suffix")));
        data.presuf.set(VerbAffix.DativeSuffix, normalize_suffix(args.get("dat_suffix")));
        data.presuf.set(VerbAffix.AccusativeSuffive, normalize_suffix(args.get("acc_suffix")));
        data.presuf.set(VerbAffix.AblativeSuffix, normalize_suffix(args.get("abl_suffix")));

        conj(args, data, typeinfo);

        this.suppress(data);
        this.postprocess(data, typeinfo);
        this.override(data, args);
        this.set_linked_forms(data, typeinfo);
        this.add_prefix_suffix(data);

        return {
            templateType: "conjugation",

            info: typeinfo,
            data: data
        };
    }

    public static get_valid_forms(raw_forms: string[] | undefined): string[] {
        const valid_forms: string[] = [];

        if (raw_forms) {
            for (const subform of raw_forms) {
                if (!LaVerb.form_is_empty([subform])) {
                    valid_forms.push(subform);
                }
            }
        }

        return valid_forms;
    }

    public static get_lemma_forms(data: ConjugationData, do_linked: boolean): string[] {
        const linked_prefix = (do_linked ? "linked_" : "");
        for (const slot of LaVerb.potential_lemma_slots) {
            const lemma_forms = LaVerb.get_valid_forms(getVerbForm(data.forms, linked_prefix + slot));
            if (lemma_forms.length > 0) {
                return lemma_forms;
            }
        }
        return [];
    }

    private setup_conjs() {
        this.conjugations.set("1st", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            this.get_regular_stems(args, typeinfo);
            data.categories.push("Latin first conjugation verbs");
            for (const perf_stem of typeinfo.perf_stem) {
                if (perf_stem == typeinfo.pres_stem + "āv") {
                    data.categories.push("Latin first conjugation verbs with perfect in -av-");
                } else if (perf_stem == typeinfo.pres_stem + "u") {
                    data.categories.push("Latin first conjugation verbs with perfect in -u-");
                } else if (perf_stem == typeinfo.pres_stem) {
                    data.categories.push("Latin first conjugation verbs with suffixless perfect");
                } else {
                    data.categories.push("Latin first conjugation verbs with irregular perfect");
                }
            }
            this.make_pres_1st(data, typeinfo, typeinfo.pres_stem);
            this.make_perf_and_supine(data, typeinfo);
        });

        this.conjugations.set("2nd", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            this.get_regular_stems(args, typeinfo);
            data.categories.push("Latin second conjugation verbs");
            for (let perf_stem of typeinfo.perf_stem) {
                let pres_stem = typeinfo.pres_stem;
                pres_stem = pres_stem.replace(/qu/g, "1");
                perf_stem = perf_stem.replace(/qu/g, "1");
                if (perf_stem == pres_stem + "ēv") {
                    data.categories.push("Latin second conjugation verbs with perfect in -ev-");
                } else if (perf_stem == pres_stem + "u") {
                    data.categories.push("Latin second conjugation verbs with perfect in -u-");
                } else if (perf_stem == pres_stem) {
                    data.categories.push("Latin second conjugation verbs with suffixless perfect");
                } else if (this.has_perf_in_s_or_x(pres_stem, perf_stem)) {
                    data.categories.push("Latin second conjugation verbs with perfect in -s- or -x-");
                } else {
                    data.categories.push("Latin second conjugation verbs with irregular perfect");
                }
            }
            this.make_pres_2nd(data, typeinfo, typeinfo.pres_stem);
            this.make_perf_and_supine(data, typeinfo);
        });

        this.conjugations.set("3rd", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            this.get_regular_stems(args, typeinfo);
            this.set_3rd_conj_categories(data, typeinfo);

            if (typeinfo.pres_stem.match(/[āēīōū]sc$/)) {
                data.categories.push("Latin inchoative verbs");
            }
            this.make_pres_3rd(data, typeinfo, typeinfo.pres_stem);
            this.make_perf_and_supine(data, typeinfo);
        });

        this.conjugations.set("3rd-io", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            this.get_regular_stems(args, typeinfo);
            this.set_3rd_conj_categories(data, typeinfo);

            if (typeinfo.pres_stem.match(/[āēīōū]sc$/)) {
                data.categories.push("Latin inchoative verbs");
            }
            this.make_pres_3rd_io(data, typeinfo, typeinfo.pres_stem);
            this.make_perf_and_supine(data, typeinfo);
        });

        this.conjugations.set("4th", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            this.get_regular_stems(args, typeinfo);
            data.categories.push("Latin fourth conjugation verbs");

            for (let perf_stem of typeinfo.perf_stem) {
                let pres_stem = typeinfo.pres_stem;
                pres_stem = pres_stem.replace(/qu/g, "1");
                perf_stem = perf_stem.replace(/qu/g, "1");
                if (perf_stem == pres_stem + "īv") {
                    data.categories.push("Latin fourth conjugation verbs with perfect in -iv-");
                } else if (perf_stem == pres_stem + "i") {
                    data.categories.push("Latin fourth conjugation verbs with perfect in -i-");
                } else if (perf_stem == pres_stem + "u") {
                    data.categories.push("Latin fourth conjugation verbs with perfect in -u-");
                } else if (perf_stem == pres_stem) {
                    data.categories.push("Latin fourth conjugation verbs with suffixless perfect");
                } else if (this.has_perf_in_s_or_x(pres_stem, perf_stem)) {
                    data.categories.push("Latin fourth conjugation verbs with perfect in -s- or -x-");
                } else {
                    data.categories.push("Latin fourth conjugation verbs with irregular perfect");
                }
            }

            this.make_pres_4th(data, typeinfo, typeinfo.pres_stem);
            this.make_perf_and_supine(data, typeinfo);

            if (this.form_contains(getVerbForm(data.forms, "1s_pres_actv_indc"), "serviō") || this.form_contains(getVerbForm(data.forms, "1s_pres_actv_indc"), "saeviō")) {
                this.add_forms(data, "impf_actv_indc", typeinfo.pres_stem,
                    ["iēbam", "ībam"],
                    ["iēbās", "ībās"],
                    ["iēbat", "ībat"],
                    ["iēbāmus", "ībāmus"],
                    ["iēbātis", "ībātis"],
                    ["iēbant", "ībant"]
                );

                this.add_forms(data, "futr_actv_indc", typeinfo.pres_stem,
                    ["iam", "ībō"],
                    ["iēs", "ībis"],
                    ["iet", "ībit"],
                    ["iēmus", "ībimus"],
                    ["iētis", "ībitis"],
                    ["ient", "ībunt"]
                );
            }

            if (hasVerbType(typeinfo.subtypes, "alwayssyncperf") || hasVerbType(typeinfo.subtypes, "optsyncperf")) {
                data.forms.forEach((forms: string[], key: VerbForm) => {
                    if (key.match(/perf/) || key.match(/plup/) || key.match(/futp/)) {
                        setVerbForm(data.forms, key, []);
                        for (const f of forms) {
                            if (hasVerbType(typeinfo.subtypes, "optsyncperf")) {
                                this.insert_if_not(getVerbForm(data.forms, key) || [], f);
                            }
                            this.insert_if_not(getVerbForm(data.forms, key) || [], this.ivi_ive(f));
                        }
                    }
                });
            }
        });

        this.conjugations.set("irreg", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            const verb = this.ine(args.get("1"));
            const prefix = this.ine(args.get("2"));
            if (!verb) {
                throw Error("The verb to be conjugated has not been specified.");
            }

            const conj = this.irreg_conjugations.get(verb);
            if (!conj) {
                throw Error(`The verb ${verb} is not recognised as an irregular verb.`);
            }

            typeinfo.verb = verb;
            typeinfo.prefix = prefix;
            conj(args, data, typeinfo);
        });

        this.setup_irreg_conjs();
    }

    private set_3rd_conj_categories(data: ConjugationData, typeinfo: ConjugationInfo) {
        data.categories.push("Latin third conjugation verbs");

        for (let perf_stem of typeinfo.perf_stem) {
            let pres_stem = typeinfo.pres_stem;
            pres_stem = pres_stem.replace(/qu/g, "1");
            perf_stem = perf_stem.replace(/qu/g, "1");
            if (perf_stem == pres_stem + "āv") {
                data.categories.push("Latin third conjugation verbs with perfect in -av-");
            } else if (perf_stem == pres_stem + "ēv") {
                data.categories.push("Latin third conjugation verbs with perfect in -ev-");
            } else if (perf_stem == pres_stem + "īv") {
                data.categories.push("Latin third conjugation verbs with perfect in -iv-");
            } else if (perf_stem == pres_stem + "i") {
                data.categories.push("Latin third conjugation verbs with perfect in -i-");
            } else if (perf_stem == pres_stem + "u") {
                data.categories.push("Latin third conjugation verbs with perfect in -u-");
            } else if (perf_stem == pres_stem) {
                data.categories.push("Latin third conjugation verbs with suffixless perfect");
            } else if (this.has_perf_in_s_or_x(pres_stem, perf_stem)) {
                data.categories.push("Latin third conjugation verbs with perfect in -s- or -x-");
            } else {
                data.categories.push("Latin third conjugation verbs with irregular perfect");
            }
        }
    }

    private iter_slots(include_generic: boolean, include_linked: boolean): string[] {
        let stage = 1;
        let slotnum = 0;
        let max_slotnum = this.non_generic_slots.length;

        const entries: string[] = [];

        while (true) {
            if (slotnum >= max_slotnum) {
                slotnum = 0;
                stage++;
                if (stage == 2) {
                    if (include_generic) {
                        max_slotnum = this.generic_slots.length;
                    } else {
                        stage++;
                    }
                }
                if (stage == 3) {
                    if (include_linked) {
                        max_slotnum = LaVerb.potential_lemma_slots.length;
                    } else {
                        stage++;
                    }
                }
                if (stage > 3) {
                    break;
                }
            }
            if (stage == 1) {
                entries.push(this.non_generic_slots[slotnum]);
            } else if (stage == 2) {
                entries.push(this.generic_slots[slotnum]);
            } else {
                entries.push("linked_" + LaVerb.potential_lemma_slots[slotnum]);
            }
            slotnum++;
        }

        return entries;
    }

    private initialize_slots(): [string[], string[]] {
        const generic_slots: string[] = [];
        const non_generic_slots: string[] = [];

        const handle_slot = (slot: string, generic: boolean) => {
            if (generic) {
                generic_slots.push(slot);
            } else {
                non_generic_slots.push(slot);
            }
        };

        for (const v of ["actv", "pasv"]) {
            const handle_tense = (t: string, mood: string) => {
                const non_pers_slot = t + "_" + v + "_" + mood;
                handle_slot(non_pers_slot, true);
                for (const p of ["1s", "2s", "3s", "1p", "2p", "3p"]) {
                    handle_slot(p + "_" + non_pers_slot, false);
                }
            };

            for (const t of ["pres", "impf", "futr", "perf", "plup", "futp"]) {
                handle_tense(t, "indc");
            }

            for (const t of ["pres", "impf", "perf", "plup"]) {
                handle_tense(t, "subj");
            }

            for (const t of ["pres", "futr"]) {
                handle_tense(t, "impr");
            }
        }

        for (const f of ["inf", "ptc"]) {
            for (const t of ["pres_actv", "perf_actv", "futr_actv", "pres_pasv", "perf_pasv", "futr_pasv"]) {
                handle_slot(t + "_" + f, false);
            }
        }

        for (const n of ["ger_gen", "ger_dat", "ger_acc", "ger_abl", "sup_acc", "sup_abl"]) {
            handle_slot(n, false);
        }

        return [non_generic_slots, generic_slots];
    }

    private detect_decl_and_subtypes(args: ArgMap): [ConjType, ConjType | undefined, Set<VerbType>, string, string] {
        const specs = args.get("1")?.split(".");
        const subtypes = new Set<VerbType>();
        let conj_arg ="";

        if (!specs) {
            throw Error("No specs");
        }

        for (let [i, spec] of specs.entries()) {
            if (i == 0) {
                conj_arg = spec;
            } else {
                const begins_with_hypen = spec.startsWith("-");
                spec = spec.replace(/-/g, "");
                if (begins_with_hypen) {
                    spec = "-" + spec;
                }
                addVerbType(subtypes, spec);
            }
        }

        let orig_lemma = args.get("2");
        if (!orig_lemma) {
            throw Error("No orig_lemma");
        }

        orig_lemma = orig_lemma.replace(/o$/, "ō");
        const lemma = orig_lemma;
        const match = conj_arg.match(/^([124])(\+\+?)$/);
        let base_conj_arg = "";
        let auto_perf_supine = "";
        if (match) {
            base_conj_arg = match[1];
            auto_perf_supine = match[2];
            if (base_conj_arg) {
                if (auto_perf_supine == "++" && base_conj_arg != "4") {
                    throw Error("Conjugation types 1++ and 2++ not allowed");
                }
                conj_arg = base_conj_arg;
            }
        }

        let conjtype: ConjType;
        let base = "";
        let auto_perf = "";
        let auto_supine = "";
        let detected_subtypes: string[] = [];
        let conj_subtype: ConjType | undefined;
        if (conj_arg == "1") {
            conjtype = "1st";
            [base, detected_subtypes] = this.get_subtype_by_ending(lemma, "1", subtypes, new Map([
                ["ō", []],
                ["or", ["depon"]],
                ["at", ["impers"]],
                ["ātur", ["depon", "impers"]]
            ]));
            if (auto_perf_supine) {
                auto_perf = base + "āv";
                auto_supine = base + "āt";
            }
        } else if (conj_arg == "2") {
            conjtype = "2nd";
            [base, detected_subtypes] = this.get_subtype_by_ending(lemma, "2", subtypes, new Map([
                ["eō", []],
                ["eor", ["depon"]],
                ["et", ["impers"]],
                ["ētur", ["depon", "impers"]]
            ]));
            if (auto_perf_supine) {
                auto_perf = base + "u";
                auto_supine = base + "it";
            }
        } else if (conj_arg == "3") {
            [base, detected_subtypes] = this.get_subtype_by_ending(lemma, "", subtypes, new Map([
                ["iō", ["I"]],
                ["ior", ["depon", "I"]],
            ]));
            if (base) {
                conjtype = "3rd-io";
            } else {
                [base, detected_subtypes] = this.get_subtype_by_ending(lemma, "3", subtypes, new Map([
                    ["ō", []],
                    ["or", ["depon"]],
                    ["it", ["impers"]],
                    ["itur", ["depon", "impers"]]
                ]));
                if (hasVerbType(subtypes, "I")) {
                    conjtype = "3rd-io";
                } else {
                    conjtype = "3rd";
                }
            }
        } else if (conj_arg == "4") {
            conjtype = "4th";
            [base, detected_subtypes] = this.get_subtype_by_ending(lemma, "4", subtypes, new Map([
                ["iō", []],
                ["ior", ["depon"]],
                ["it", ["impers"]],
                ["ītur", ["depon", "impers"]]
            ]));

            if (auto_perf_supine == "++" && this.options.suppressIPerfect) {
                auto_perf_supine = "+";
            }

            if (auto_perf_supine == "++") {
                auto_perf = base + "īv/" + base + "i";
                auto_supine = base + "īt";
            } else if (auto_perf_supine == "+") {
                auto_perf = base + "īv";
                auto_supine = base + "īt";
            }
        } else if (conj_arg == "irreg") {
            let prefix: string;
            conjtype = "irreg";
            [prefix, base] = this.split_prefix_and_base(lemma, [
                "aiō",
                "aiiō",
                "ajō",
                "dīcō",
                "dūcō",
                "faciō",
                "fīō",
                "ferō",
                "inquam",
                "libet",
                "lubet",
                "licet",
                "volō",
                "mālō",
                "nōlō",
                "possum",
                "piget",
                "coepī",
                "sum",
                "edō",
                "dō",
                "eō",
            ]);
            conj_subtype = this.irreg_verbs_to_conj_type.get(base);
            if (!conj_subtype) {
                throw Error(`No conj_subtype for ${base}`);
            }
            args.set("1", strip_macrons(base));
            args.set("2", prefix);
            detected_subtypes = [];
        } else {
            throw Error(`Unrecognized conjugation '${conj_arg}'`);
        }

        for (const detected_subtype of detected_subtypes) {
            if (detected_subtype == "impers" && hasVerbType(subtypes, "3only")) {
                // nothing to do
            } else {
                addVerbType(subtypes, detected_subtype);
            }
        }

        if (conjtype != "irreg") {
            args.set("1", base);
            let perf_stem = "";
            let supine_stem = "";
            if (hasVerbType(subtypes, "depon") || hasVerbType(subtypes, "semidepon")) {
                supine_stem = args.get("3") || auto_supine;
                if (supine_stem == "-") {
                    supine_stem = "";
                }
                if (!supine_stem) {
                    addVerbType(subtypes, "noperf");
                    addVerbType(subtypes, "nosup");
                }
                args.set("2", supine_stem);
                args.delete("3");
            } else {
                perf_stem = args.get("3") || auto_perf;
                if (perf_stem == "-") {
                    perf_stem = "";
                }
                if (!perf_stem) {
                    addVerbType(subtypes, "noperf");
                }
                supine_stem = args.get("4") || auto_supine;
                if (supine_stem == "-") {
                    supine_stem = "";
                }
                if (!supine_stem) {
                    addVerbType(subtypes, "nosup");
                }
                args.set("2", perf_stem);
                args.set("3", supine_stem);
            }
            args.delete("4");

            if (hasVerbType(subtypes, "depon") && hasVerbType(subtypes, "semidepon")) {
                // added by @fpw: Support for revertor which is a reverse semi-depon
                perf_stem = base;
                args.set("3", perf_stem);
                subtypes.delete(VerbType.Deponent);
            }
        }

        for (const subtype of subtypes) {
            if (!this.allowed_subtypes.has(subtype)) {
                if (!(conjtype == "3rd" && subtype == "-I") && !(conjtype == "3rd-io" && subtype == "I")) {
                    throw Error(`Unrecognized verb subtype: ${subtype}`);
                }
            }
        }

        return [conjtype, conj_subtype, subtypes, orig_lemma, lemma];
    }

    private get_subtype_by_ending(lemma: string, conjtype: string, specified_subtypes: Set<VerbType>, endings_and_subtypes: FormMap<string>): [string, string[]] {
        for (const [ending, subtypes] of endings_and_subtypes) {
            let not_this_subtype = false;
            for (const subtype of subtypes) {
                if (hasVerbType(specified_subtypes, `-${subtype}`)) {
                    not_this_subtype = true;
                    break;
                }
            }
            if (!not_this_subtype) {
                const base = extract_base(lemma, ending);
                if (base) {
                    return [base, subtypes];
                }
            }
        }
        if (conjtype) {
            throw Error(`Unrecognized ending for conjugation-${conjtype} verb: ${lemma}`);
        }
        return ["", []];
    }

    private split_prefix_and_base(lemma: string, main_verbs: string[]): [string, string] {
        for (const main of main_verbs) {
            const regex = new RegExp(`^(.*)${main}$`);
            const match = lemma.match(regex);
            if (match) {
                const prefix = match[1];
                return [prefix, main];
            }
        }
        throw Error(`Argument ${lemma} doesn't end in any of ${main_verbs.join(", ")}`);
    }

    private get_regular_stems(args: ArgMap, typeinfo: ConjugationInfo) {
        let pres_stem = "";
        let perf_stem = "";
        let supine_stem = "";

        if (hasVerbType(typeinfo.subtypes, "depon") || hasVerbType(typeinfo.subtypes, "semidepon")) {
            pres_stem = this.ine(args.get("1"));
            supine_stem = this.ine(args.get("2"));
            perf_stem = this.ine(args.get("3")); // added by @fpw for reverti
        } else {
            pres_stem = this.ine(args.get("1"));
            perf_stem = this.ine(args.get("2"));
            supine_stem = this.ine(args.get("3"));
        }

        if (hasVerbType(typeinfo.subtypes, "perfaspres") && !pres_stem) {
            pres_stem = "whatever";
        }

        if (!pres_stem) {
            throw Error("Present stem has not been provided");
        }

        typeinfo.pres_stem = pres_stem;

        if (perf_stem) {
            typeinfo.perf_stem = perf_stem.split("/");
        } else {
            typeinfo.perf_stem = [];
        }

        if (supine_stem) {
            typeinfo.supine_stem = supine_stem.split("/");
        } else {
            typeinfo.supine_stem = [];
        }
    }

    private ine(str?: string): string {
        if (!str) {
            return "";
        } else {
            return str;
        }
    }

    private add_forms(data: ConjugationData, keytype: string, stem: string, suf1s: any, suf2s: any, suf3s: any, suf1p: any, suf2p: any, suf3p: any) {
        this.add_form(data, "1s_" + keytype, stem, suf1s);
        this.add_form(data, "2s_" + keytype, stem, suf2s);
        this.add_form(data, "3s_" + keytype, stem, suf3s);
        this.add_form(data, "1p_" + keytype, stem, suf1p);
        this.add_form(data, "2p_" + keytype, stem, suf2p);
        this.add_form(data, "3p_" + keytype, stem, suf3p);
    }

    private add_23_forms(data: ConjugationData, keytype: string, stem: string, suf2s: any, suf3s: any, suf2p: any, suf3p: any) {
        this.add_form(data, "2s_" + keytype, stem, suf2s);
        this.add_form(data, "3s_" + keytype, stem, suf3s);
        this.add_form(data, "2p_" + keytype, stem, suf2p);
        this.add_form(data, "3p_" + keytype, stem, suf3p);
    }

    private add_2_forms(data: ConjugationData, keytype: string, stem: string, suf2s: any, suf2p: any) {
        this.add_form(data, "2s_" + keytype, stem, suf2s);
        this.add_form(data, "2p_" + keytype, stem, suf2p);
    }

    private add_form(data: ConjugationData, key: string, stem: string, suf: string | string[], pos = 0) {
        if (suf === undefined || (!stem && !suf)) {
            return;
        }

        let sufArr: string[] = [];
        if (typeof(suf) == "string") {
            sufArr.push(suf);
        } else {
            sufArr = suf;
        }

        for (const s of sufArr) {
            const form = getVerbForm(data.forms, key);
            if (!form) {
                setVerbForm(data.forms, key, []);
            }
            this.insert_if_not(getVerbForm(data.forms, key) || [], stem + s, pos);
        }
    }

    private insert_if_not(data: string[], entry: string, pos = 0) {
        if (data.includes(entry)) {
            return;
        }
        if (pos == 0) {
            data.push(entry);
        } else {
            data.splice(pos - 1, 0, entry);
        }
    }

    private make_pres_1st(data: ConjugationData, typeinfo: ConjugationInfo, pres_stem: string) {
        if (!pres_stem) {
            return;
        }

        this.add_forms(data, "pres_actv_indc", pres_stem, "ō", "ās", "at", "āmus", "ātis", "ant");
        this.add_forms(data, "impf_actv_indc", pres_stem, "ābam", "ābās", "ābat", "ābāmus", "ābātis", "ābant");
        this.add_forms(data, "futr_actv_indc", pres_stem, "ābō", "ābis", "ābit", "ābimus", "ābitis", "ābunt");

        this.add_forms(data, "pres_pasv_indc", pres_stem, "or", ["āris", "āre"], "ātur", "āmur", "āminī", "antur");
        this.add_forms(data, "impf_pasv_indc", pres_stem, "ābar", ["ābāris", "ābāre"], "ābātur", "ābāmur", "ābāminī", "ābantur");
        this.add_forms(data, "futr_pasv_indc", pres_stem, "ābor", ["āberis", "ābere"], "ābitur", "ābimur", "ābiminī", "ābuntur");

        this.add_forms(data, "pres_actv_subj", pres_stem, "em", "ēs", "et", "ēmus", "ētis", "ent");
        this.add_forms(data, "impf_actv_subj", pres_stem, "ārem", "ārēs", "āret", "ārēmus", "ārētis", "ārent");

        this.add_forms(data, "pres_pasv_subj", pres_stem, "er", ["ēris", "ēre"], "ētur", "ēmur", "ēminī", "entur");
        this.add_forms(data, "impf_pasv_subj", pres_stem, "ārer", ["ārēris", "ārēre"], "ārētur", "ārēmur", "ārēminī", "ārentur");

        this.add_2_forms(data, "pres_actv_impr", pres_stem, "ā", "āte");
        this.add_23_forms(data, "futr_actv_impr", pres_stem, "ātō", "ātō", "ātōte", "antō");

        this.add_2_forms(data, "pres_pasv_impr", pres_stem, "āre", "āminī");
        this.add_23_forms(data, "futr_pasv_impr", pres_stem, "ātor", "ātor", [], "antor");

        setVerbForm(data.forms, "pres_actv_inf", [pres_stem + "āre"]);
        setVerbForm(data.forms, "pres_pasv_inf", [pres_stem + "ārī"]);

        setVerbForm(data.forms, "pres_actv_ptc", [pres_stem + "āns"]);

        this.make_gerund(data, typeinfo, pres_stem + "and");
    }

    private make_pres_2nd(data: ConjugationData, typeinfo: ConjugationInfo, pres_stem: string, nopass = false, noimpr = false) {
        this.add_forms(data, "pres_actv_indc", pres_stem, "eō", "ēs", "et", "ēmus", "ētis", "ent");
        this.add_forms(data, "impf_actv_indc", pres_stem, "ēbam", "ēbās", "ēbat", "ēbāmus", "ēbātis", "ēbant");
        this.add_forms(data, "futr_actv_indc", pres_stem, "ēbō", "ēbis", "ēbit", "ēbimus", "ēbitis", "ēbunt");

        this.add_forms(data, "pres_actv_subj", pres_stem, "eam", "eās", "eat", "eāmus", "eātis", "eant");
        this.add_forms(data, "impf_actv_subj", pres_stem, "ērem", "ērēs", "ēret", "ērēmus", "ērētis", "ērent");

        if (!noimpr) {
            this.add_2_forms(data, "pres_actv_impr", pres_stem, "ē", "ēte");
            this.add_23_forms(data, "futr_actv_impr", pres_stem, "ētō", "ētō", "ētōte", "entō");
        }

        if (!nopass) {
            this.add_forms(data, "pres_pasv_indc", pres_stem, "eor", ["ēris", "ēre"], "ētur", "ēmur", "ēminī", "entur");
            this.add_forms(data, "impf_pasv_indc", pres_stem, "ēbar", ["ēbāris", "ēbāre"], "ēbātur", "ēbāmur", "ēbāminī", "ēbantur");
            this.add_forms(data, "futr_pasv_indc", pres_stem, "ēbor", ["ēberis", "ēbere"], "ēbitur", "ēbimur", "ēbiminī", "ēbuntur");

            this.add_forms(data, "pres_pasv_subj", pres_stem, "ear", ["eāris", "eāre"], "eātur", "eāmur", "eāminī", "eantur");
            this.add_forms(data, "impf_pasv_subj", pres_stem, "ērer", ["ērēris", "ērēre"], "ērētur", "ērēmur", "ērēminī", "ērentur");

            if (!noimpr) {
                this.add_2_forms(data, "pres_pasv_impr", pres_stem, "ēre", "ēminī");
                this.add_23_forms(data, "futr_pasv_impr", pres_stem, "ētor", "ētor", [], "entor");
            }
        }

        setVerbForm(data.forms, "pres_actv_inf", [pres_stem + "ēre"]);
        if (!nopass) {
            setVerbForm(data.forms, "pres_pasv_inf", [pres_stem + "ērī"]);
        }

        setVerbForm(data.forms, "pres_actv_ptc", [pres_stem + "ēns"]);
        this.make_gerund(data, typeinfo, pres_stem + "end", false, false, nopass);
    }

    private make_pres_3rd(data: ConjugationData, typeinfo: ConjugationInfo, pres_stem: string, nopass = false, noimpr = false) {
        this.add_forms(data, "pres_actv_indc", pres_stem, "ō", "is", "it", "imus", "itis", "unt");
        this.add_forms(data, "impf_actv_indc", pres_stem, "ēbam", "ēbās", "ēbat", "ēbāmus", "ēbātis", "ēbant");
        this.add_forms(data, "futr_actv_indc", pres_stem, "am", "ēs", "et", "ēmus", "ētis", "ent");

        this.add_forms(data, "pres_pasv_indc", pres_stem, "or", ["eris", "ere"], "itur", "imur", "iminī", "untur");
        this.add_forms(data, "impf_pasv_indc", pres_stem, "ēbar", ["ēbāris", "ēbāre"], "ēbātur", "ēbāmur", "ēbāminī", "ēbantur");
        this.add_forms(data, "futr_pasv_indc", pres_stem, "ar", ["ēris", "ēre"], "ētur", "ēmur", "ēminī", "entur");

        this.add_forms(data, "pres_actv_subj", pres_stem, "am", "ās", "at", "āmus", "ātis", "ant");
        this.add_forms(data, "impf_actv_subj", pres_stem, "erem", "erēs", "eret", "erēmus", "erētis", "erent");

        this.add_forms(data, "pres_pasv_subj", pres_stem, "ar", ["āris", "āre"], "ātur", "āmur", "āminī", "antur");
        this.add_forms(data, "impf_pasv_subj", pres_stem, "erer", ["erēris", "erēre"], "erētur", "erēmur", "erēminī", "erentur");

        this.add_2_forms(data, "pres_actv_impr", pres_stem, "e", "ite");
        this.add_23_forms(data, "futr_actv_impr", pres_stem, "itō", "itō", "itōte", "untō");

        this.add_2_forms(data, "pres_pasv_impr", pres_stem, "ere", "iminī");
        this.add_23_forms(data, "futr_pasv_impr", pres_stem, "itor", "itor", [], "untor");

        setVerbForm(data.forms, "pres_actv_inf", [pres_stem + "ere"]);
        setVerbForm(data.forms, "pres_pasv_inf", [pres_stem + "ī"]);
        setVerbForm(data.forms, "pres_actv_ptc", [pres_stem + "ēns"]);

        this.make_gerund(data, typeinfo, pres_stem + "end", true);
    }

    private make_pres_3rd_io(data: ConjugationData, typeinfo: ConjugationInfo, pres_stem: string, nopass = false, noimpr = false) {
        this.add_forms(data, "pres_actv_indc", pres_stem, "iō", "is", "it", "imus", "itis", "iunt");
        this.add_forms(data, "impf_actv_indc", pres_stem, "iēbam", "iēbās", "iēbat", "iēbāmus", "iēbātis", "iēbant");
        this.add_forms(data, "futr_actv_indc", pres_stem, "iam", "iēs", "iet", "iēmus", "iētis", "ient");

        this.add_forms(data, "pres_actv_subj", pres_stem, "iam", "iās", "iat", "iāmus", "iātis", "iant");
        this.add_forms(data, "impf_actv_subj", pres_stem, "erem", "erēs", "eret", "erēmus", "erētis", "erent");

        this.add_2_forms(data, "pres_actv_impr", pres_stem, "e", "ite");
        this.add_23_forms(data, "futr_actv_impr", pres_stem, "itō", "itō", "itōte", "iuntō");

        if (!nopass) {
            this.add_forms(data, "pres_pasv_indc", pres_stem, "ior", ["eris", "ere"], "itur", "imur", "iminī", "iuntur");
            this.add_forms(data, "impf_pasv_indc", pres_stem, "iēbar", ["iēbāris", "iēbāre"], "iēbātur", "iēbāmur", "iēbāminī", "iēbantur");
            this.add_forms(data, "futr_pasv_indc", pres_stem, "iar", ["iēris", "iēre"], "iētur", "iēmur", "iēminī", "ientur");

            this.add_forms(data, "pres_pasv_subj", pres_stem, "iar", ["iāris", "iāre"], "iātur", "iāmur", "iāminī", "iantur");
            this.add_forms(data, "impf_pasv_subj", pres_stem, "erer", ["erēris", "erēre"], "erētur", "erēmur", "erēminī", "erentur");

            this.add_2_forms(data, "pres_pasv_impr", pres_stem, "ere", "iminī");
            this.add_23_forms(data, "futr_pasv_impr", pres_stem, "itor", "itor", [], "iuntor");
        }

        setVerbForm(data.forms, "pres_actv_inf", [pres_stem + "ere"]);
        if (!nopass) {
            setVerbForm(data.forms, "pres_pasv_inf", [pres_stem + "ī"]);
        }

        setVerbForm(data.forms, "pres_actv_ptc", [pres_stem + "iēns"]);
        this.make_gerund(data, typeinfo, pres_stem + "iend", true, false, nopass);
    }

    private make_pres_4th(data: ConjugationData, typeinfo: ConjugationInfo, pres_stem: string, nopass = false, noimpr = false) {
        this.add_forms(data, "pres_actv_indc", pres_stem, "iō", "īs", "it", "īmus", "ītis", "iunt");
        this.add_forms(data, "impf_actv_indc", pres_stem, "iēbam", "iēbās", "iēbat", "iēbāmus", "iēbātis", "iēbant");
        this.add_forms(data, "futr_actv_indc", pres_stem, "iam", "iēs", "iet", "iēmus", "iētis", "ient");

        this.add_forms(data, "pres_pasv_indc", pres_stem, "ior", ["īris", "īre"], "ītur", "īmur", "īminī", "iuntur");
        this.add_forms(data, "impf_pasv_indc", pres_stem, "iēbar", ["iēbāris", "iēbāre"], "iēbātur", "iēbāmur", "iēbāminī", "iēbantur");
        this.add_forms(data, "futr_pasv_indc", pres_stem, "iar", ["iēris", "iēre"], "iētur", "iēmur", "iēminī", "ientur");

        this.add_forms(data, "pres_actv_subj", pres_stem, "iam", "iās", "iat", "iāmus", "iātis", "iant");
        this.add_forms(data, "impf_actv_subj", pres_stem, "īrem", "īrēs", "īret", "īrēmus", "īrētis", "īrent");

        this.add_forms(data, "pres_pasv_subj", pres_stem, "iar", ["iāris", "iāre"], "iātur", "iāmur", "iāminī", "iantur");
        this.add_forms(data, "impf_pasv_subj", pres_stem, "īrer", ["īrēris", "īrēre"], "īrētur", "īrēmur", "īrēminī", "īrentur");

        this.add_2_forms(data, "pres_actv_impr", pres_stem, "ī", "īte");
        this.add_23_forms(data, "futr_actv_impr", pres_stem, "ītō", "ītō", "ītōte", "iuntō");

        this.add_2_forms(data, "pres_pasv_impr", pres_stem, "īre", "īminī");
        this.add_23_forms(data, "futr_pasv_impr", pres_stem, "ītor", "ītor", [], "iuntor");

        setVerbForm(data.forms, "pres_actv_inf", [pres_stem + "īre"]);
        setVerbForm(data.forms, "pres_pasv_inf", [pres_stem + "īrī"]);
        setVerbForm(data.forms, "pres_actv_ptc", [pres_stem + "iēns"]);

        this.make_gerund(data, typeinfo, pres_stem + "iend", true);
    }

    private make_perf_and_supine(data: ConjugationData, typeinfo: ConjugationInfo) {
        if (hasVerbType(typeinfo.subtypes, "optsemidepon")) {
            this.make_perf(data, typeinfo.perf_stem, "noinf");
            this.make_deponent_perf(data, typeinfo.supine_stem);
        } else {
            this.make_perf(data, typeinfo.perf_stem);
            this.make_supine(data, typeinfo, typeinfo.supine_stem);
        }
    }

    private make_perf(data: ConjugationData, perf_stem: string[], no_inf?: string) {
        if (!perf_stem.length) {
            return;
        }

        const perf3p = ["ērunt"];
        if (!this.options.suppressPerfectEre) {
            perf3p.push("ēre");
        }

        for (const stem of perf_stem) {
            this.add_forms(data, "perf_actv_indc", stem, "ī", "istī", "it", "imus", "istis", perf3p);
            this.add_forms(data, "plup_actv_indc", stem, "eram", "erās", "erat", "erāmus", "erātis", "erant");
            this.add_forms(data, "futp_actv_indc", stem, "erō", "eris", "erit", "erimus", "eritis", "erint");
            this.add_forms(data, "perf_actv_subj", stem, "erim", "erīs", "erit", "erīmus", "erītis", "erint");
            this.add_forms(data, "plup_actv_subj", stem, "issem", "issēs", "isset", "issēmus", "issētis", "issent");

            if (!no_inf) {
                this.add_form(data, "perf_actv_inf", stem, "isse");
            }
        }
    }

    private make_deponent_perf(data: ConjugationData, supine_stem: string[]) {
        if (!supine_stem.length) {
            return;
        }

        for (const stem of supine_stem) {
            const stems = stem + "us ";
            const stemp = stem + "ī ";

            this.add_forms(data, "perf_actv_indc", stems, "[[esse|sum]]", "[[esse|es]]", "[[esse|est]]", [], [], []);
            this.add_forms(data, "perf_actv_indc", stemp, [], [], [], "[[esse|sumus]]", "[[esse|estis]]", "[[esse|sunt]]");

            this.add_forms(data, "plup_actv_indc", stems, "[[esse|eram]]", "[[esse|erās]]", "[[esse|erat]]", [], [], []);
            this.add_forms(data, "plup_actv_indc", stemp, [], [], [], "erāmus", "erātis", "erant");

            this.add_forms(data, "futp_actv_indc", stems, "[[esse|erō]]", "[[esse|eris]]", "[[esse|erit]]", [], [], []);
            this.add_forms(data, "futp_actv_indc", stemp, [], [], [], "[[esse|erimus]]", "[[esse|eritis]]", "[[esse|erint]]");

            this.add_forms(data, "perf_actv_subj", stems, "[[esse|sim]]", "[[esse|sīs]]", "[[esse|sit]]", [], [], []);
            this.add_forms(data, "perf_actv_subj", stemp, [], [], [], "sīmus", "sītis", "sint");

            this.add_forms(data, "plup_actv_subj", stems, "[[esse|essem]]", "[[esse|essēs]]", "[[esse|esset]]", [], [], []);
            this.add_forms(data, "plup_actv_subj", stemp, [], [], [], "[[esse|essēmus]]", "[[esse|essētis]]", "[[esse|essent]]");

            this.add_form(data, "perf_actv_inf", "", "" + stem + "um [[esse|esse]]");
            this.add_form(data, "futr_actv_inf", "", "" + stem + "ūrum [[esse|esse]]");
            this.add_form(data, "perf_actv_ptc", stem, "us");
            this.add_form(data, "futr_actv_ptc", stem, "ūrus");

            this.add_form(data, "sup_acc", stem, "um");
            this.add_form(data, "sup_abl", stem, "ū");
        }
    }

    private make_supine(data: ConjugationData, typeinfo: ConjugationInfo, supine_stem: string[]) {
        if (!supine_stem.length) {
            return;
        }

        for (const stem of supine_stem) {
            let perf_pasv_ptc_lemma = "";
            let perf_pasv_ptc;
            let perf_pasv_ptc_acc;
            let futr_actv_ptc = stem + "ūrus";
            if (hasVerbType(typeinfo.subtypes, "passimpers")) {
                perf_pasv_ptc_lemma = stem + "um";
                perf_pasv_ptc = perf_pasv_ptc_lemma;
                perf_pasv_ptc_acc = perf_pasv_ptc_lemma;
            } else {
                perf_pasv_ptc_lemma = stem + "us";
                if (hasVerbType(typeinfo.subtypes, "mp")) {
                    perf_pasv_ptc = stem + "ī";
                    perf_pasv_ptc_acc = stem + "ōs";
                } else if (hasVerbType(typeinfo.subtypes, "fp")) {
                    perf_pasv_ptc = stem + "ae";
                    perf_pasv_ptc_acc = stem + "ās";
                } else if (hasVerbType(typeinfo.subtypes, "np")) {
                    perf_pasv_ptc = stem + "a";
                    perf_pasv_ptc_acc = perf_pasv_ptc;
                } else if (hasVerbType(typeinfo.subtypes, "f")) {
                    perf_pasv_ptc = stem + "a";
                    perf_pasv_ptc_acc = stem + "am";
                } else if (hasVerbType(typeinfo.subtypes, "n")) {
                    perf_pasv_ptc = stem + "um";
                    perf_pasv_ptc_acc = perf_pasv_ptc;
                } else {
                    perf_pasv_ptc = perf_pasv_ptc_lemma;
                    perf_pasv_ptc_acc = stem + "um";
                }
            }

            let perf_pasv_inf;
            if (perf_pasv_ptc_acc != perf_pasv_ptc_lemma) {
                perf_pasv_inf = perf_pasv_ptc_acc;
            } else {
                perf_pasv_inf = perf_pasv_ptc_lemma;
            }
            perf_pasv_inf += " [[esse|esse]]";
            const futr_pasv_inf = stem + "um" + " [[īre|īrī]]";

            const mortu = [
                "conmortu",
                "commortu",
                "dēmortu",
                "ēmortu",
                "inmortu",
                "immortu",
                "inēmortu",
                "intermortu",
                "permortu",
                "praemortu",
                "superēmortu",
            ];
            const ort = [
                "ort",
                "abort",
                "adort",
                "coort",
                "exort",
                "hort",
                "obort"
            ];

            let futr_actv_inf: string | undefined;
            if (mortu.includes(stem)) {
                futr_actv_ptc = stem.replace(/mortu$/, "moritūrus");
            } else if (ort.includes(stem)) {
                futr_actv_ptc = stem.replace(/ort$/, "oritūrus");
            } else if (stem == "mortu") {
                futr_actv_inf = "";
                futr_actv_ptc = "moritūrus";
            }

            if (futr_actv_inf === undefined) {
                futr_actv_inf = futr_actv_ptc.replace(/us$/, "um") + " [[esse|esse]]";
            }
            this.add_form(data, "futr_actv_inf", "", futr_actv_inf);
            this.add_form(data, "perf_pasv_inf", "", perf_pasv_inf);
            this.add_form(data, "futr_pasv_inf", "", futr_pasv_inf);
            this.add_form(data, "futr_actv_ptc", "", futr_actv_ptc);
            this.add_form(data, "perf_pasv_ptc", "", perf_pasv_ptc);

            this.add_form(data, "sup_acc", stem, "um");
            this.add_form(data, "sup_abl", stem, "ū");
        }
    }

    private make_gerund(data: ConjugationData, typeinfo: ConjugationInfo, base: string, und_variant = false, no_gerund = false, no_futr_pasv_ptc = false) {
        interface Endings {
            nom: string;
            gen: string;
            dat: string;
            acc: string;
            abl: string;
        }

        const neut_endings: Endings = {
            nom: "um",
            gen: "ī",
            dat: "ō",
            acc: "um",
            abl: "ō",
        };

        let endings: Endings;
        if (hasVerbType(typeinfo.subtypes, "f")) {
            endings = {
                nom: "a",
                gen: "ae",
                dat: "ae",
                acc: "am",
                abl: "ā",
            };
        } else if (hasVerbType(typeinfo.subtypes, "n")) {
            endings = neut_endings;
        } else if (hasVerbType(typeinfo.subtypes, "mp")) {
            endings = {
                nom: "ī",
                gen: "ōrum",
                dat: "īs",
                acc: "ōs",
                abl: "īs",
            };
        } else if (hasVerbType(typeinfo.subtypes, "fp")) {
            endings = {
                nom: "ae",
                gen: "ārum",
                dat: "īs",
                acc: "ās",
                abl: "īs",
            };
        } else if (hasVerbType(typeinfo.subtypes, "np")) {
            endings = {
                nom: "a",
                gen: "ōrum",
                dat: "īs",
                acc: "a",
                abl: "īs",
            };
        } else {
            endings = {
                nom: "us",
                gen: "ī",
                dat: "ō",
                acc: "um",
                abl: "ō",
            };
        }

        const endingMap = new Map<string, string>();
        endingMap.set("nom", endings.nom);
        endingMap.set("gen", endings.gen);
        endingMap.set("dat", endings.dat);
        endingMap.set("acc", endings.acc);
        endingMap.set("abl", endings.abl);

        if (base.match(/[uv]end$/)) {
            und_variant = false;
        }

        if (this.options.suppressUndVariants) {
            und_variant = false;
        }

        let und_base = "";
        if (und_variant) {
            und_base = base.replace(/end$/, "und");
        }
        for (let [cas, ending] of endingMap) {
            if (cas == "nom") {
                if (!no_futr_pasv_ptc) {
                    if (hasVerbType(typeinfo.subtypes, "passimpers")) {
                        ending = "um";
                    }
                    this.add_form(data, "futr_pasv_ptc", "", base + ending);
                    if (und_base) {
                        this.add_form(data, "futr_pasv_ptc", "", und_base + ending);
                    }
                }
            } else if (data.presuf.get(cas + "_prefix" as VerbAffix) || data.presuf.get(cas + "_suffix" as VerbAffix) && !no_gerund) {
                this.add_form(data, "ger_" + cas, "", (data.presuf.get(cas + "_prefix" as VerbAffix) || "") + base + ending + (data.presuf.get(cas + "_suffix" as VerbAffix) || ""));
                if (und_base) {
                    this.add_form(data, "ger_" + cas, "", (data.presuf.get(cas + "_prefix" as VerbAffix) || "") + und_base + ending + (data.presuf.get(cas + "_suffix" as VerbAffix) || ""));
                }
            }
        }

        endingMap.set("nom", neut_endings.nom);
        endingMap.set("gen", neut_endings.gen);
        endingMap.set("dat", neut_endings.dat);
        endingMap.set("acc", neut_endings.acc);
        endingMap.set("abl", neut_endings.abl);

        if (!no_gerund) {
            for (const [cas, ending] of endingMap) {
                this.add_form(data, "ger_" + cas, "", (data.presuf.get("prefix" as VerbAffix) || "") + base + ending + (data.presuf.get("suffix" as VerbAffix) || ""));
            }
        }
    }

    private has_perf_in_s_or_x(pres_stem: string, perf_stem: string): boolean {
        if (pres_stem == perf_stem) {
            return false;
        }

        return (perf_stem != "") && (perf_stem.match(/[sx]$/) != null);
    }

    private form_contains(forms: string[] | undefined, form: string) {
        if (!forms) {
            return false;
        }
        return forms.includes(form);
    }

    private ivi_ive(str: string): string {
        let form = str.replace(/īvī/g, "iī");
        form = form.replace(/īvi/g, "ī");
        form = form.replace(/īve/g, "ī");
        form = form.replace(/īvē/g, "ē");
        return form;
    }

    private postprocess(data: ConjugationData, typeinfo: ConjugationInfo) {
        if (hasVerbType(typeinfo.subtypes, "nosup")) {
            this.insert_if_not(data.categories, "Latin verbs with missing supine stem");
            this.insert_if_not(data.categories, "Latin defective verbs");

            for (const key of data.forms.keys()) {
                if (key.match("sup") || (key == "perf_actv_ptc" || key == "perf_pasv_ptc" || key == "perf_pasv_inf" ||
                    key == "futr_actv_ptc" || key == "futr_actv_inf" || key == "futr_pasv_inf" ||
                    ((hasVerbType(typeinfo.subtypes, "depon") || hasVerbType(typeinfo.subtypes, "semidepon") || hasVerbType(typeinfo.subtypes, "optsemidepon")) && key == "perf_actv_inf")))
                {
                    setVerbForm(data.forms, key, []);
                }
            }
        } else if (hasVerbType(typeinfo.subtypes, "supfutractvonly")) {
            this.insert_if_not(data.categories, "Latin verbs with missing supine stem except in the future active participle");
            this.insert_if_not(data.categories, "Latin defective verbs");
            for (const key of data.forms.keys()) {
                if (key.match("sup") || key == "perf_actv_ptc" || key == "perf_pasv_ptc" || key == "perf_pasv_inf" || key == "futr_pasv_inf") {
                    setVerbForm(data.forms, key, []);
                }
            }
        }

        const perf_pasv_ptc = getVerbForm(data.forms, "perf_pasv_ptc");
        if (perf_pasv_ptc && !LaVerb.form_is_empty(perf_pasv_ptc)) {
            if (hasVerbType(typeinfo.subtypes, "passimpers")) {
                for (const ppp of perf_pasv_ptc) {
                    if (!LaVerb.form_is_empty([ppp])) {
                        this.add_form(data, "3s_perf_pasv_indc", ppp, " [[esse|est]]");
                        this.add_form(data, "3s_futp_pasv_indc", ppp, " [[esse|erit]]");
                        this.add_form(data, "3s_plup_pasv_indc", ppp, " [[esse|erat]]");
                        this.add_form(data, "3s_perf_pasv_subj", ppp, " [[esse|sit]]");
                        this.add_form(data, "3s_plup_pasv_subj", ppp, [" [[esse|esset]]", " [[esse|foret]]"]);
                    }
                }
            } else if (hasVerbType(typeinfo.subtypes, "pass3only")) {
                for (const ppp of perf_pasv_ptc) {
                    if (!LaVerb.form_is_empty([ppp])) {
                        let ppp_s = "";
                        let ppp_p = "";
                        if (hasVerbType(typeinfo.subtypes, "mp")) {
                            ppp_p = ppp;
                        } else if (hasVerbType(typeinfo.subtypes, "fp")) {
                            ppp_p = ppp;
                        } else if (hasVerbType(typeinfo.subtypes, "np")) {
                            ppp_p = ppp;
                        } else if (hasVerbType(typeinfo.subtypes, "f")) {
                            ppp_s = ppp;
                            ppp_p = ppp.replace(/a$/, "ae");
                        } else if (hasVerbType(typeinfo.subtypes, "n")) {
                            ppp_s = ppp;
                            ppp_p = ppp.replace(/um$/, "a");
                        } else {
                            ppp_s = ppp;
                            ppp_p = ppp.replace(/us$/, "ī");
                        }

                        if (!hasVerbType(typeinfo.subtypes, "mp") && !hasVerbType(typeinfo.subtypes, "fp") && !hasVerbType(typeinfo.subtypes, "np")) {
                            this.add_form(data, "3s_perf_pasv_indc", ppp_s, " [[esse|est]]");
                            this.add_form(data, "3s_futp_pasv_indc", ppp_s, " [[esse|erit]]");
                            this.add_form(data, "3s_plup_pasv_indc", ppp_s, " [[esse|erat]]");
                            this.add_form(data, "3s_perf_pasv_subj", ppp_s, " [[esse|sit]]");
                            this.add_form(data, "3s_plup_pasv_subj", ppp_s, [" [[esse|esset]]", " [[esse|foret]]"]);
                        }
                        this.add_form(data, "3p_perf_pasv_indc", ppp_p, " [[esse|sunt]]");
                        this.add_form(data, "3p_futp_pasv_indc", ppp_p, " [[esse|erunt]]");
                        this.add_form(data, "3p_plup_pasv_indc", ppp_p, " [[esse|erant]]");
                        this.add_form(data, "3p_perf_pasv_subj", ppp_p, " [[esse|sint]]");
                        this.add_form(data, "3p_plup_pasv_subj", ppp_p, [" [[esse|essent]]", " [[esse|forent]]"]);
                    }
                }
            } else {
                this.make_perfect_passive(data);
            }
        }

        if (hasVerbType(typeinfo.subtypes, "perfaspres")) {
            this.insert_if_not(data.categories, "Latin defective verbs");
            this.insert_if_not(data.categories, "Latin active-only verbs");
            this.insert_if_not(data.categories, "Latin verbs with perfect forms having imperfective meanings");

            setVerbForm(data.forms, "perf_actv_ptc", getVerbForm(data.forms, "perf_pasv_ptc") || []);
            setVerbForm(data.forms, "pres_actv_inf", getVerbForm(data.forms, "perf_actv_inf") || []);

            for (const key of data.forms.keys()) {
                if (key != "futr_actv_inf" && key != "futr_actv_ptc") {
                    if (key.match(/pasv/) || (key.match(/pres/) && key != "pres_actv_inf") || key.match(/impf/) || key.match(/futr/)) {
                        setVerbForm(data.forms, key, []);
                    }
                }
            }

            for (const [key, form] of data.forms) {
                if (key.match(/perf/) && key != "perf_actv_ptc") {
                    setVerbForm(data.forms, key.replace(/perf/, "pres"), form);
                    setVerbForm(data.forms, key, []);
                } else if (key.match(/plup/)) {
                    setVerbForm(data.forms, key.replace(/plup/, "impf"), form);
                    setVerbForm(data.forms, key, []);
                } else if (key.match(/futp/)) {
                    setVerbForm(data.forms, key.replace(/futp/, "futr"), form);
                    setVerbForm(data.forms, key, []);
                } else if (key.match(/ger/)) {
                    setVerbForm(data.forms, key, []);
                }
            }

            setVerbForm(data.forms, "pres_actv_ptc", []);
        }

        if (hasVerbType(typeinfo.subtypes, "impers")) {
            this.insert_if_not(data.categories, "Latin impersonal verbs");

            for (const key of data.forms.keys()) {
                if (key.match(/^[12][sp]/) || key.match(/^3p/)) {
                    setVerbForm(data.forms, key, []);
                }
            }
        } else if (hasVerbType(typeinfo.subtypes, "3only")) {
            this.insert_if_not(data.categories, "Latin third-person-only verbs");

            for (const key of data.forms.keys()) {
                if (key.match(/^[12][sp]/)) {
                    setVerbForm(data.forms, key, []);
                }
            }
        }

        if (hasVerbType(typeinfo.subtypes, "nopasvperf") && !hasVerbType(typeinfo.subtypes, "nosup") && !hasVerbType(typeinfo.subtypes, "supfutractvonly")) {
            this.insert_if_not(data.categories, "Latin defective verbs");

            for (const key of data.forms.keys()) {
                if (key.match(/pasv/) && (key.match(/perf/) || key.match(/plup/) || key.match(/futp/))) {
                    setVerbForm(data.forms, key, []);
                }
            }
        }

        if (hasVerbType(typeinfo.subtypes, "optsemidepon")) {
            this.insert_if_not(data.categories, "Latin semi-deponent verbs");
            this.insert_if_not(data.categories, "Latin optionally semi-deponent verbs");

            for (const key of data.forms.keys()) {
                if (key.match(/pres_pasv/) || key.match(/impf_pasv/) || key.match(/futr_pasv/)) {
                    setVerbForm(data.forms, key, []);
                }
            }
        } else if (hasVerbType(typeinfo.subtypes, "semidepon")) {
            this.insert_if_not(data.categories, "Latin semi-deponent verbs");

            if (typeinfo.perf_stem.length != 0) { // added by @fpw for reverti
                for (const [key, form] of data.forms) {
                    if (key.match(/pres_pasv/) || key.match(/impf_pasv/) || key.match(/futr_pasv/) && key != "futr_pasv_ptc" && key != "futr_pasv_inf" && key != "pres_pasv_ptc") {
                        setVerbForm(data.forms, key.replace(/pasv/, "actv"), form);
                        setVerbForm(data.forms, key, []);
                    } else if (key.match(/sup_/)) {
                        setVerbForm(data.forms, key, []);
                    }
                }
            } else {
                for (const key of data.forms.keys()) {
                    if (key.match(/perf_actv/) || key.match(/plup_actv/) || key.match(/futp_actv/) || key.match(/pres_pasv/) || key.match(/impf_pasv/) || key.match(/futr_pasv/)) {
                        setVerbForm(data.forms, key, []);
                    }
                }

                for (const [key, form] of data.forms) {
                    if (key.match(/perf_pasv/) || key.match(/plup_pasv/) || key.match(/futp_pasv/)) {
                        setVerbForm(data.forms, key.replace(/pasv/, "actv"), form);
                        setVerbForm(data.forms, key, []);
                    }
                }
            }
        } else if (hasVerbType(typeinfo.subtypes, "depon")) {
            this.insert_if_not(data.categories, "Latin deponent verbs");

            for (const key of data.forms.keys()) {
                if ((key.match(/actv/) && key != "pres_actv_ptc" && key != "futr_actv_ptc" && key != "futr_actv_inf") || key == "futr_pasv_inf") {
                    setVerbForm(data.forms, key, []);
                }
            }

            for (const [key, form] of data.forms) {
                if (key.match(/pasv/) && key != "pres_pasv_ptc" && key != "futr_pasv_ptc" && key != "futr_pasv_inf") {
                    setVerbForm(data.forms, key.replace(/pasv/, "actv"), form);
                    setVerbForm(data.forms, key, []);
                }
            }
        }

        if (hasVerbType(typeinfo.subtypes, "noperf")) {
            this.insert_if_not(data.categories, "Latin verbs with missing perfect stem");
            this.insert_if_not(data.categories, "Latin defective verbs");

            for (const key of data.forms.keys()) {
                if (key.match(/actv/) && (key.match(/perf/) || key.match(/plup/) || key.match(/futp/))) {
                    setVerbForm(data.forms, key, []);
                }
            }
        }

        if (hasVerbType(typeinfo.subtypes, "nopass")) {
            this.insert_if_not(data.categories, "Latin active-only verbs");

            for (const key of data.forms.keys()) {
                if (key.match(/pasv/)) {
                    setVerbForm(data.forms, key, []);
                }
            }
        } else if (hasVerbType(typeinfo.subtypes, "pass3only")) {
            this.insert_if_not(data.categories, "Latin verbs with third-person passive");

            for (const key of data.forms.keys()) {
                if (key.match(/pasv/) && (key.match(/^[12][sp]/) || key.match(/impr/))) {
                    setVerbForm(data.forms, key, []);
                }

                if (hasVerbType(typeinfo.subtypes, "mp") || hasVerbType(typeinfo.subtypes, "fp") || hasVerbType(typeinfo.subtypes, "np")) {
                    if (key.match(/pasv/) && key.match(/^3s/)) {
                        setVerbForm(data.forms, key, []);
                    }
                }
            }
        } else if (hasVerbType(typeinfo.subtypes, "passimpers")) {
            this.insert_if_not(data.categories, "Latin verbs with impersonal passive");

            for (const key of data.forms.keys()) {
                if (key.match(/pasv/) && (key.match(/^[12][sp]/) || key.match(/^3p/) || key.match(/impr/)) || key == "futr_pasv_inf") {
                    setVerbForm(data.forms, key, []);
                }
            }
        }

        if (hasVerbType(typeinfo.subtypes, "noimp")) {
            this.insert_if_not(data.categories, "Latin verbs with missing imperative");
            this.insert_if_not(data.categories, "Latin defective verbs");

            for (const key of data.forms.keys()) {
                if (key.match(/impr/)) {
                    setVerbForm(data.forms, key, []);
                }
            }
        }

        if (hasVerbType(typeinfo.subtypes, "nofut")) {
            this.insert_if_not(data.categories, "Latin verbs with missing future");
            this.insert_if_not(data.categories, "Latin defective verbs");

            for (const key of data.forms.keys()) {
                if (key.match(/fut/)) {
                    setVerbForm(data.forms, key, []);
                }
            }
        }

        if (hasVerbType(typeinfo.subtypes, "p3inf") && !this.options.suppressPoet) {
            const is_depon = hasVerbType(typeinfo.subtypes, "depon");
            const form = "pres_" + (is_depon ? "actv" : "pasv") + "_inf";
            const formval = getVerbForm(data.forms, form) || [];
            const newvals = [...formval];
            for (const fv of formval) {
                newvals.push(fv.replace(/^(.*).$/, "$1" + "ier"));
            }
            setVerbForm(data.forms, form, newvals);
            data.footnotes.set(form, ["The present passive infinitive in -ier is a rare poetic form which is attested for this verb."]);
        }

        if (hasVerbType(typeinfo.subtypes, "poetsyncperf") && !this.options.suppressPoet) {
            const sss: [string, string][] = [
                ["perf_actv_inf", "sse"],
                ["2s_perf_actv_indc", "stī"],
                ["2p_perf_actv_indc", "stis"],
                ["1s_plup_actv_subj", "ssem"],
                ["2s_plup_actv_subj", "ssēs"],
                ["3s_plup_actv_subj", "sset"],
                ["1p_plup_actv_subj", "ssēmus"],
                ["2p_plup_actv_subj", "ssētis"],
                ["3p_plup_actv_subj", "ssent"]
            ];

            const add_sync_perf = (form: string, suff_sync: string) => {
                const formval = getVerbForm(data.forms, form) || [];
                for (const fv of formval) {
                    const regex1 = new RegExp(`vi${suff_sync}$`);
                    const regex2 = new RegExp(`[aeiouyāēīōūȳăĕĭŏŭ]ui${suff_sync}$`);
                    if (fv.match(regex1) || fv.match(regex2)) {
                        const rep = fv.substr(0, fv.length - suff_sync.length - 2) + suff_sync;
                        this.insert_if_not(formval, rep);
                    }
                }
                data.footnotes.set(form, ["At least one rare poetic syncopated perfect form is attested."]);
            };
            for (const [key, val] of sss) {
                add_sync_perf(key, val);
            }
        }
    }

    private suppress(data: ConjugationData) {
        if (this.options.suppressPassiveRe) {
            for (const slot of this.iter_slots(true, true)) {
                if (slot.match(/^2s_/) && slot.match(/pasv/)) {
                    const forms = getVerbForm(data.forms, slot);
                    if (!forms) {
                        continue;
                    }
                    const newForms: string[] = [];
                    for (const form of forms) {
                        if (!form.match(/re$/) || forms.length == 1) {
                            newForms.push(form);
                        }
                    }
                    setVerbForm(data.forms, slot, newForms);
                }
            }
        }
    }

    private static form_is_empty(forms: string[] | undefined): boolean {
        if (!forms) {
            return true;
        }

        const allEmpty = forms.every(form => {
            return form == "" || form == "-" || form == "—" || form == "&mdash;";
        });

        return allEmpty;
    }

    private make_perfect_passive(data: ConjugationData) {
        const ppp = getVerbForm(data.forms, "perf_pasv_ptc") || [];
        const ppplinks: string[] = [];
        for (const pppform of ppp) {
            ppplinks.push(`[[${pppform}]]`);
        }

        const ppplink = ppplinks.join(" or ");
        const sumlink = "[[sum]]";

        const text_for_slot = new Map<string, string>([
            ["perf_pasv_indc", "present active indicative"],
            ["futp_pasv_indc", "future active indicative"],
            ["plup_pasv_indc", "imperfect active indicative"],
            ["perf_pasv_subj", "present active subjunctive"],
            ["plup_pasv_subj", "imperfect active subjunctive"],
        ]);

        const passivePrefix = data.presuf.get(VerbAffix.PassivePrefix);
        const passiveSuffix = data.presuf.get(VerbAffix.PassiveSuffix);

        let prefix_joiner = "";
        let suffix_joiner = "";
        if (passivePrefix && passivePrefix.endsWith(" ")) {
            prefix_joiner = "+ ";
        }
        if (passiveSuffix && passiveSuffix.startsWith(" ")) {
            suffix_joiner = " +";
        }
        for (const [slot, text] of text_for_slot) {
            const entry = (passivePrefix || "") +
                            prefix_joiner +
                            ppplink + " + " +
                            text + " of " + sumlink +
                            suffix_joiner +
                            (passiveSuffix || "");
            setVerbForm(data.forms, slot, [entry]);
        }
    }

    private override(data: ConjugationData, args: ArgMap) {
        for (const slot of this.iter_slots(true, false)) {
            const arg = args.get(slot);
            if (arg) {
                setVerbForm(data.forms, slot, arg.split("/"));
            }
        }
    }

    private add_prefix_suffix(data: ConjugationData) {
        if (!data.presuf.get(VerbAffix.Prefix) && !data.presuf.get(VerbAffix.Suffix)) {
            return;
        }

        const active_prefix = data.presuf.get(VerbAffix.Prefix) || "";
        const passive_prefix = data.presuf.get(VerbAffix.PassivePrefix) || "";
        const plural_prefix = data.presuf.get(VerbAffix.PluralPrefix) || "";
        const plural_passive_prefix = data.presuf.get(VerbAffix.PluralPassivePrefix) || "";
        const active_prefix_no_links = remove_links(active_prefix);
        const passive_prefix_no_links = remove_links(passive_prefix);
        const plural_prefix_no_links = remove_links(plural_prefix);
        const plural_passive_prefix_no_links = remove_links(plural_passive_prefix);

        const active_suffix = data.presuf.get(VerbAffix.Suffix) || "";
        const passive_suffix = data.presuf.get(VerbAffix.PassiveSuffix) || "";
        const plural_suffix = data.presuf.get(VerbAffix.PluralSuffix) || "";
        const plural_passive_suffix = data.presuf.get(VerbAffix.PluralPassiveSuffix) || "";
        const active_suffix_no_links = remove_links(active_suffix);
        const passive_suffix_no_links = remove_links(passive_suffix);
        const plural_suffix_no_links = remove_links(plural_suffix);
        const plural_passive_suffix_no_links = remove_links(plural_passive_suffix);

        for (const slot of this.iter_slots(false, true)) {
            if (!slot.match(/ger_/)) {
                let prefix = "";
                let suffix = "";
                let prefix_no_links = "";
                let suffix_no_links = "";
                if (slot.match(/pasv/) && slot.match(/[123]p/)) {
                    prefix = plural_passive_prefix;
                    suffix = plural_passive_suffix;
                    prefix_no_links = plural_passive_prefix_no_links;
                    suffix_no_links = plural_passive_suffix_no_links;
                } else if (slot.match(/pasv/) && !slot.match(/_inf/)) {
                    prefix = passive_prefix;
                    suffix = passive_suffix;
                    prefix_no_links = passive_prefix_no_links;
                    suffix_no_links = passive_suffix_no_links;
                } else if (slot.match(/[123]p/)) {
                    prefix = plural_prefix;
                    suffix = plural_suffix;
                    prefix_no_links = plural_prefix_no_links;
                    suffix_no_links = plural_suffix_no_links;
                } else {
                    prefix = active_prefix;
                    suffix = active_suffix;
                    prefix_no_links = active_prefix_no_links;
                    suffix_no_links = active_suffix_no_links;
                }

                const forms = getVerbForm(data.forms, slot) || [];
                if (!LaVerb.form_is_empty(forms)) {
                    const affixed_forms = [];
                    for (const form of forms) {
                        if (LaVerb.form_is_empty([form])) {
                            affixed_forms.push(form);
                        } else {
                            affixed_forms.push(prefix_no_links + form + suffix_no_links);
                        }
                    }
                    setVerbForm(data.forms, slot, affixed_forms);
                }
            }
        }
    }

    private set_linked_forms(data: ConjugationData, typeinfo: ConjugationInfo) {
        for (const slot of LaVerb.potential_lemma_slots) {
            const linked_forms: string[] = [];
            const forms = getVerbForm(data.forms, slot);
            if (forms) {
                for (const form of forms) {
                    if (form == typeinfo.lemma) {
                        linked_forms.push(typeinfo.orig_lemma);
                    } else {
                        linked_forms.push(form);
                    }
                }
            }
            setVerbForm(data.forms, "linked_" + slot, linked_forms);
        }
    }


    private setup_irreg_conjs() {
        this.irreg_conjugations.set("aio", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            data.categories.push("Latin third conjugation verbs");
            data.categories.push("Latin irregular verbs");
            data.categories.push("Latin active-only verbs");
            data.categories.push("Latin defective verbs");

            addVerbType(typeinfo.subtypes, "irreg");
            addVerbType(typeinfo.subtypes, "highlydef");

            const prefix = typeinfo.prefix;
            setVerbForm(data.forms, "1s_pres_actv_indc", [prefix + "aiō"]);
            setVerbForm(data.forms, "2s_pres_actv_indc", [prefix + "ais"]);
            setVerbForm(data.forms, "3s_pres_actv_indc", [prefix + "ait"]);
            setVerbForm(data.forms, "3p_pres_actv_indc", [prefix + "aiunt"]);

            setVerbForm(data.forms, "1s_impf_actv_indc", [prefix + "aiēbam"]);
            setVerbForm(data.forms, "2s_impf_actv_indc", [prefix + "aiēbās"]);
            setVerbForm(data.forms, "3s_impf_actv_indc", [prefix + "aiēbat"]);
            setVerbForm(data.forms, "1p_impf_actv_indc", [prefix + "aiēbāmus"]);
            setVerbForm(data.forms, "2p_impf_actv_indc", [prefix + "aiēbātis"]);
            setVerbForm(data.forms, "3p_impf_actv_indc", [prefix + "aiēbant"]);

            setVerbForm(data.forms, "2s_perf_actv_indc", [prefix + "aistī"]);
            setVerbForm(data.forms, "3s_perf_actv_indc", [prefix + "ait"]);

            setVerbForm(data.forms, "2s_pres_actv_subj", [prefix + "aiās"]);
            setVerbForm(data.forms, "3s_pres_actv_subj", [prefix + "aiat"]);
            setVerbForm(data.forms, "3p_pres_actv_subj", [prefix + "aiant"]);

            setVerbForm(data.forms, "2s_pres_actv_impr", [prefix + "ai"]);

            setVerbForm(data.forms, "pres_actv_inf", [prefix + "aiere"]);
            setVerbForm(data.forms, "pres_actv_ptc", [prefix + "aiēns"]);
        });

        this.irreg_conjugations.set("aiio", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            data.categories.push("Latin third conjugation verbs");
            data.categories.push("Latin irregular verbs");
            data.categories.push("Latin active-only verbs");
            data.categories.push("Latin defective verbs");

            addVerbType(typeinfo.subtypes, "irreg");
            addVerbType(typeinfo.subtypes, "highlydef");

            const prefix = typeinfo.prefix;
            setVerbForm(data.forms, "1s_pres_actv_indc", [prefix + "aiiō"]);
            setVerbForm(data.forms, "2s_pres_actv_indc", [prefix + "ais"]);
            setVerbForm(data.forms, "3s_pres_actv_indc", [prefix + "ait"]);
            setVerbForm(data.forms, "3p_pres_actv_indc", [prefix + "aiunt"]);

            setVerbForm(data.forms, "1s_impf_actv_indc", [prefix + "aiiēbam"]);
            setVerbForm(data.forms, "2s_impf_actv_indc", [prefix + "aiiēbās"]);
            setVerbForm(data.forms, "3s_impf_actv_indc", [prefix + "aiiēbat"]);
            setVerbForm(data.forms, "1p_impf_actv_indc", [prefix + "aiiēbāmus"]);
            setVerbForm(data.forms, "2p_impf_actv_indc", [prefix + "aiiēbātis"]);
            setVerbForm(data.forms, "3p_impf_actv_indc", [prefix + "aiiēbant"]);

            setVerbForm(data.forms, "2s_perf_actv_indc", [prefix + "aistī"]);
            setVerbForm(data.forms, "3s_perf_actv_indc", [prefix + "ait"]);

            setVerbForm(data.forms, "2s_pres_actv_subj", [prefix + "aiiās"]);
            setVerbForm(data.forms, "3s_pres_actv_subj", [prefix + "aiiat"]);
            setVerbForm(data.forms, "3p_pres_actv_subj", [prefix + "aiiant"]);

            setVerbForm(data.forms, "2s_pres_actv_impr", [prefix + "ai"]);

            setVerbForm(data.forms, "pres_actv_inf", [prefix + "aiiere"]);
            setVerbForm(data.forms, "pres_actv_ptc", [prefix + "aiiēns"]);
        });

        this.irreg_conjugations.set("ajo", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            data.categories.push("Latin third conjugation verbs");
            data.categories.push("Latin irregular verbs");
            data.categories.push("Latin active-only verbs");
            data.categories.push("Latin defective verbs");

            addVerbType(typeinfo.subtypes, "irreg");
            addVerbType(typeinfo.subtypes, "highlydef");

            const prefix = typeinfo.prefix;
            setVerbForm(data.forms, "1s_pres_actv_indc", [prefix + "ajō"]);
            setVerbForm(data.forms, "2s_pres_actv_indc", [prefix + "ais"]);
            setVerbForm(data.forms, "3s_pres_actv_indc", [prefix + "ait"]);
            setVerbForm(data.forms, "3p_pres_actv_indc", [prefix + "ajunt"]);

            setVerbForm(data.forms, "1s_impf_actv_indc", [prefix + "ajēbam"]);
            setVerbForm(data.forms, "2s_impf_actv_indc", [prefix + "ajēbās"]);
            setVerbForm(data.forms, "3s_impf_actv_indc", [prefix + "ajēbat"]);
            setVerbForm(data.forms, "1p_impf_actv_indc", [prefix + "ajēbāmus"]);
            setVerbForm(data.forms, "2p_impf_actv_indc", [prefix + "ajēbātis"]);
            setVerbForm(data.forms, "3p_impf_actv_indc", [prefix + "ajēbant"]);

            setVerbForm(data.forms, "2s_perf_actv_indc", [prefix + "aistī"]);
            setVerbForm(data.forms, "3s_perf_actv_indc", [prefix + "ait"]);

            setVerbForm(data.forms, "2s_pres_actv_subj", [prefix + "ajās"]);
            setVerbForm(data.forms, "3s_pres_actv_subj", [prefix + "ajat"]);
            setVerbForm(data.forms, "3p_pres_actv_subj", [prefix + "ajant"]);

            setVerbForm(data.forms, "2s_pres_actv_impr", [prefix + "ai"]);

            setVerbForm(data.forms, "pres_actv_inf", [prefix + "ajere"]);
            setVerbForm(data.forms, "pres_actv_ptc", [prefix + "ajēns"]);
        });

        this.irreg_conjugations.set("dico", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            data.categories.push("Latin third conjugation verbs");
            data.categories.push("Latin irregular verbs");

            const prefix = typeinfo.prefix;
            this.make_pres_3rd(data, typeinfo, prefix + "dīc");
            this.make_perf(data, [prefix + "dīx"]);
            this.make_supine(data, typeinfo, [prefix + "dict"]);

            this.add_form(data, "2s_pres_actv_impr", prefix, "dīc", 1);
        });

        this.irreg_conjugations.set("do", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            data.categories.push("Latin first conjugation verbs");
            data.categories.push("Latin irregular verbs");

            addVerbType(typeinfo.subtypes, "irreg");
            const prefix = typeinfo.prefix;

            this.make_perf(data, [prefix + "ded"]);
            this.make_supine(data, typeinfo, [prefix + "dat"]);

            this.add_forms(data, "pres_actv_indc", prefix, "dō", "dās", "dat", "damus", "datis", "dant");
            this.add_forms(data, "impf_actv_indc", prefix, "dabam", "dabās", "dabat", "dabāmus", "dabātis", "dabant");
            this.add_forms(data, "futr_actv_indc", prefix, "dabō", "dabis", "dabit", "dabimus", "dabitis", "dabunt");

            this.add_forms(data, "pres_pasv_indc", prefix, "dor", ["daris", "dare"], "datur", "damur", "daminī", "dantur");
            this.add_forms(data, "impf_pasv_indc", prefix, "dabar", ["dabāris", "dabāre"], "dabātur", "dabāmur", "dabāminī", "dabantur");
            this.add_forms(data, "futr_pasv_indc", prefix, "dabor", ["daberis", "dabere"], "dabitur", "dabimur", "dabiminī", "dabuntur");

            this.add_forms(data, "pres_actv_subj", prefix, "dem", "dēs", "det", "dēmus", "dētis", "dent");
            this.add_forms(data, "impf_actv_subj", prefix, "darem", "darēs", "daret", "darēmus", "darētis", "darent");

            this.add_forms(data, "pres_pasv_subj", prefix, "der", ["dēris", "dēre"], "dētur", "dēmur", "dēminī", "dentur");
            this.add_forms(data, "impf_pasv_subj", prefix, "darer", ["darēris", "darēre"], "darētur", "darēmur", "darēminī", "darentur");

            this.add_2_forms(data, "pres_actv_impr", prefix, "dā", "date");
            this.add_23_forms(data, "futr_actv_impr", prefix, "datō", "datō", "datōte", "dantō");

            this.add_2_forms(data, "pres_pasv_impr", prefix, "dare", "daminī");
            this.add_23_forms(data, "futr_pasv_impr", prefix, "dator", "dator", [], "dantor");

            setVerbForm(data.forms, "pres_actv_inf", [prefix + "dare"]);
            setVerbForm(data.forms, "pres_pasv_inf", [prefix + "darī"]);

            setVerbForm(data.forms, "pres_actv_ptc", [prefix + "dāns"]);

            this.make_gerund(data, typeinfo, prefix + "dand");
        });

        this.irreg_conjugations.set("duco", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            data.categories.push("Latin third conjugation verbs");
            data.categories.push("Latin irregular verbs");

            const prefix = typeinfo.prefix;
            this.make_pres_3rd(data, typeinfo, prefix + "dūc");
            this.make_perf(data, [prefix + "dūx"]);
            this.make_supine(data, typeinfo, [prefix + "duct"]);

            this.add_form(data, "2s_pres_actv_impr", prefix, "dūc", 1);
        });

        this.irreg_conjugations.set("edo", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            data.categories.push("Latin third conjugation verbs");
            data.categories.push("Latin irregular verbs");

            addVerbType(typeinfo.subtypes, "irreg");

            const prefix = typeinfo.prefix;
            this.make_pres_3rd(data, typeinfo, prefix + "ed");
            this.make_perf(data, [prefix + "ēd"]);
            this.make_supine(data, typeinfo, [prefix + "ēs"]);

            this.add_forms(data, "pres_actv_indc", prefix, [], "ēs", "ēst", [], "ēstis", []);

            this.add_form(data, "3s_pres_pasv_indc", prefix, "ēstur");

            this.add_forms(data, "pres_actv_subj", prefix, "edim", "edīs", "edit", "edīmus", "edītis", "edint");
            this.add_forms(data, "impf_actv_subj", prefix, "ēssem", "ēssēs", "ēsset", "ēssēmus", "ēssētis", "ēssent");

            this.add_2_forms(data, "pres_actv_impr", prefix, "ēs", "ēste");
            this.add_23_forms(data, "futr_actv_impr", prefix, "ēstō", "ēstō", "ēstōte", []);

            this.add_form(data, "pres_actv_inf", prefix, "ēsse");
        });

        this.irreg_conjugations.set("eo", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            data.categories.push("Latin irregular verbs");

            const prefix = typeinfo.prefix;
            this.make_perf(data, [prefix + "i"]);
            this.make_supine(data, typeinfo, [prefix + "it"]);

            this.add_forms(data, "pres_actv_indc", prefix, "eō", "īs", "it", "īmus", "ītis", prefix == "prōd" ? ["eunt", "īnunt"] : "eunt");
            this.add_forms(data, "impf_actv_indc", prefix, "ībam", "ībās", "ībat", "ībāmus", "ībātis", "ībant");
            this.add_forms(data, "futr_actv_indc", prefix, "ībō", "ībis", "ībit", "ībimus", "ībitis", "ībunt");

            this.add_form(data, "1s_perf_actv_indc", prefix, "īvī");
            setVerbForm(data.forms, "2s_perf_actv_indc", [prefix + "īstī", prefix + "īvistī"]);
            this.add_form(data, "3s_perf_actv_indc", prefix, "īvit");
            setVerbForm(data.forms, "2p_perf_actv_indc", [prefix + "īstis"]);

            this.add_forms(data, "pres_pasv_indc", prefix, "eor", ["īris", "īre"], "ītur", "īmur", "īminī", "euntur");
            this.add_forms(data, "impf_pasv_indc", prefix, "ībar", ["ībāris", "ībāre"], "ībātur", "ībāmur", "ībāminī", "ībantur");
            this.add_forms(data, "futr_pasv_indc",  prefix, "ībor", ["īberis", "ībere"], "ībitur", "ībimur", "ībiminī", "ībuntur");

            this.add_forms(data, "pres_actv_subj", prefix, "eam", "eās", "eat", "eāmus", "eātis", "eant");
            this.add_forms(data, "impf_actv_subj", prefix, "īrem", "īrēs", "īret", "īrēmus", "īrētis", "īrent");

            setVerbForm(data.forms, "1s_plup_actv_subj", [prefix + "īssem"]);
            setVerbForm(data.forms, "2s_plup_actv_subj", [prefix + "īssēs"]);
            setVerbForm(data.forms, "3s_plup_actv_subj", [prefix + "īsset"]);
            setVerbForm(data.forms, "1p_plup_actv_subj", [prefix + "īssēmus"]);
            setVerbForm(data.forms, "2p_plup_actv_subj", [prefix + "īssētis"]);
            setVerbForm(data.forms, "3p_plup_actv_subj", [prefix + "īssent"]);

            this.add_forms(data, "pres_pasv_subj", prefix, "ear", ["eāris", "eāre"], "eātur", "eāmur", "eāminī", "eantur");
            this.add_forms(data, "impf_pasv_subj", prefix, "īrer", ["īrēris", "īrēre"], "īrētur", "īrēmur", "īrēminī", "īrentur");

            this.add_2_forms(data, "pres_actv_impr", prefix, "ī", "īte");
            this.add_23_forms(data, "futr_actv_impr", prefix, "ītō", "ītō", "ītōte", "euntō");

            this.add_2_forms(data, "pres_pasv_impr", prefix, "īre", "īminī");
            this.add_23_forms(data, "futr_pasv_impr", prefix, "ītor", "ītor", [], "euntor");

            setVerbForm(data.forms, "pres_actv_inf", [prefix + "īre"]);
            setVerbForm(data.forms, "pres_pasv_inf", [prefix + "īrī"]);

            setVerbForm(data.forms, "perf_actv_inf", [prefix + "īsse"]);
            setVerbForm(data.forms, "pres_actv_ptc", [prefix + "iēns"]);

            this.make_gerund(data, typeinfo, prefix + "eund");
        });

        this.irreg_conjugations.set("facio", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            data.categories.push("Latin third conjugation verbs");
            data.categories.push("Latin irregular verbs");
            data.categories.push("Latin suppletive verbs");

            const prefix = typeinfo.prefix;
            this.make_pres_3rd_io(data, typeinfo, prefix + "fac", true);
            this.make_gerund(data, typeinfo, prefix + "faciend", true, true);
            this.make_perf(data, [prefix + "fēc"]);
            this.make_supine(data, typeinfo, [prefix + "fact"]);

            if (!prefix) {
                this.add_form(data, "2s_pres_actv_impr", prefix, "fac", 1);
            }

            this.fio(data, prefix, "pasv");
        });

        this.irreg_conjugations.set("fio", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            data.categories.push("Latin third conjugation verbs");
            data.categories.push("Latin irregular verbs");
            data.categories.push("Latin suppletive verbs");

            const prefix = typeinfo.prefix;

            addVerbType(typeinfo.subtypes, "semidepon");
            this.fio(data, prefix, "actv");

            this.make_supine(data, typeinfo, [prefix + "fact"]);

            setVerbForm(data.forms, "futr_actv_inf", getVerbForm(data.forms, "futr_pasv_inf") || []);
            setVerbForm(data.forms, "pres_actv_ptc", []);
            setVerbForm(data.forms, "futr_actv_ptc", []);

            this.make_gerund(data, typeinfo, prefix + "fiend", true);
        });

        this.irreg_conjugations.set("fero", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            data.categories.push("Latin third conjugation verbs");
            data.categories.push("Latin irregular verbs");
            data.categories.push("Latin suppletive verbs");

            addVerbType(typeinfo.subtypes, "irreg");

            const prefix_pres = typeinfo.prefix;
            let prefix_perf = this.ine(args.get("3"));
            let prefix_supine = this.ine(args.get("4"));

            prefix_perf = prefix_perf || prefix_pres;
            prefix_supine = prefix_supine || prefix_pres;

            this.make_pres_3rd(data, typeinfo, prefix_pres + "fer");
            if (!prefix_perf) {
                this.make_perf(data, ["tul", "tetul"]);
                for (const slot of this.iter_slots(false, false)) {
                    if (slot.match(/perf/) || slot.match(/plup/) || slot.match(/futp/)) {
                        data.footnotes.set(slot, ["Archaic."]);
                    }
                }
            } else {
                this.make_perf(data, [prefix_perf + "tul"]);
            }
            this.make_supine(data, typeinfo, [prefix_supine + "lāt"]);

            setVerbForm(data.forms, "2s_pres_actv_indc", [prefix_pres + "fers"]);
            setVerbForm(data.forms, "3s_pres_actv_indc", [prefix_pres + "fert"]);
            setVerbForm(data.forms, "2p_pres_actv_indc", [prefix_pres + "fertis"]);

            setVerbForm(data.forms, "3s_pres_pasv_indc", [prefix_pres + "fertur"]);

            setVerbForm(data.forms, "1s_impf_actv_subj", [prefix_pres + "ferrem"]);
            setVerbForm(data.forms, "2s_impf_actv_subj", [prefix_pres + "ferrēs"]);
            setVerbForm(data.forms, "3s_impf_actv_subj", [prefix_pres + "ferret"]);
            setVerbForm(data.forms, "1p_impf_actv_subj", [prefix_pres + "ferrēmus"]);
            setVerbForm(data.forms, "2p_impf_actv_subj", [prefix_pres + "ferrētis"]);
            setVerbForm(data.forms, "3p_impf_actv_subj", [prefix_pres + "ferrent"]);

            setVerbForm(data.forms, "2s_pres_pasv_indc", [prefix_pres + "ferris", prefix_pres + "ferre"]);

            setVerbForm(data.forms, "1s_impf_pasv_subj", [prefix_pres + "ferrer"]);
            setVerbForm(data.forms, "2s_impf_pasv_subj", [prefix_pres + "ferrēris", prefix_pres + "ferrēre"]);
            setVerbForm(data.forms, "3s_impf_pasv_subj", [prefix_pres + "ferrētur"]);
            setVerbForm(data.forms, "1p_impf_pasv_subj", [prefix_pres + "ferrēmur"]);
            setVerbForm(data.forms, "2p_impf_pasv_subj", [prefix_pres + "ferrēminī"]);
            setVerbForm(data.forms, "3p_impf_pasv_subj", [prefix_pres + "ferrentur"]);

            setVerbForm(data.forms, "2s_pres_actv_impr", [prefix_pres + "fer"]);
            setVerbForm(data.forms, "2p_pres_actv_impr", [prefix_pres + "ferte"]);

            setVerbForm(data.forms, "2s_futr_actv_impr", [prefix_pres + "fertō"]);
            setVerbForm(data.forms, "3s_futr_actv_impr", [prefix_pres + "fertō"]);
            setVerbForm(data.forms, "2p_futr_actv_impr", [prefix_pres + "fertōte"]);

            setVerbForm(data.forms, "2s_pres_pasv_impr", [prefix_pres + "ferre"]);

            setVerbForm(data.forms, "2s_futr_pasv_impr", [prefix_pres + "fertor"]);
            setVerbForm(data.forms, "3s_futr_pasv_impr", [prefix_pres + "fertor"]);

            setVerbForm(data.forms, "pres_actv_inf", [prefix_pres + "ferre"]);
            setVerbForm(data.forms, "pres_pasv_inf", [prefix_pres + "ferrī"]);
        });

        this.irreg_conjugations.set("inquam", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            data.categories.push("Latin irregular verbs");
            data.categories.push("Latin defective verbs");

            addVerbType(typeinfo.subtypes, "highlydef");

            setVerbForm(data.forms, "1s_pres_actv_indc", ["inquam"]);
            setVerbForm(data.forms, "2s_pres_actv_indc", ["inquis"]);
            setVerbForm(data.forms, "3s_pres_actv_indc", ["inquit"]);
            setVerbForm(data.forms, "1p_pres_actv_indc", ["inquimus"]);
            setVerbForm(data.forms, "2p_pres_actv_indc", ["inquitis"]);
            setVerbForm(data.forms, "3p_pres_actv_indc", ["inquiunt"]);

            setVerbForm(data.forms, "2s_futr_actv_indc", ["inquiēs"]);
            setVerbForm(data.forms, "3s_futr_actv_indc", ["inquiet"]);

            setVerbForm(data.forms, "3s_impf_actv_indc", ["inquiēbat"]);

            setVerbForm(data.forms, "1s_perf_actv_indc", ["inquiī"]);
            setVerbForm(data.forms, "2s_perf_actv_indc", ["inquistī"]);
            setVerbForm(data.forms, "3s_perf_actv_indc", ["inquit"]);

            setVerbForm(data.forms, "3s_pres_actv_subj", ["inquiat"]);

            setVerbForm(data.forms, "2s_pres_actv_impr", ["inque"]);
            setVerbForm(data.forms, "2s_futr_actv_impr", ["inquitō"]);
            setVerbForm(data.forms, "3s_futr_actv_impr", ["inquitō"]);

            setVerbForm(data.forms, "pres_actv_ptc", ["inquiēns"]);
        });


        this.irreg_conjugations.set("libet", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            this.libet_lubet(data, typeinfo, "lib");
        });

        this.irreg_conjugations.set("lubet", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            this.libet_lubet(data, typeinfo, "lub");
        });

        this.irreg_conjugations.set("licet", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            data.categories.push("Latin second conjugation verbs");
            data.categories.push("Latin impersonal verbs");

            addVerbType(typeinfo.subtypes, "nopass");

            setVerbForm(data.forms, "3s_pres_actv_indc", ["licet"]);
            setVerbForm(data.forms, "3p_pres_actv_indc", ["licent"]);

            setVerbForm(data.forms, "3s_impf_actv_indc", ["licēbat"]);
            setVerbForm(data.forms, "3p_impf_actv_indc", ["licēbant"]);

            setVerbForm(data.forms, "3s_futr_actv_indc", ["licēbit"]);

            setVerbForm(data.forms, "3s_perf_actv_indc", ["licuit", "licitum [[esse|est]]"]);

            setVerbForm(data.forms, "3s_plup_actv_indc", ["licuerat", "licitum [[esse|erat]]"]);

            setVerbForm(data.forms, "3s_futp_actv_indc", ["licuerit", "licitum [[esse|erit]]"]);

            setVerbForm(data.forms, "3s_pres_actv_subj", ["liceat"]);
            setVerbForm(data.forms, "3p_pres_actv_subj", ["liceant"]);

            setVerbForm(data.forms, "3s_impf_actv_subj", ["licēret"]);

            setVerbForm(data.forms, "3s_perf_actv_subj", ["licuerit", "licitum [[esse|sit]]"]);

            setVerbForm(data.forms, "3s_plup_actv_subj", ["licuisset", "licitum [[esse|esset]]"]);

            setVerbForm(data.forms, "2s_futr_actv_impr", ["licētō"]);
            setVerbForm(data.forms, "3s_futr_actv_impr", ["licētō"]);

            setVerbForm(data.forms, "pres_actv_inf", ["licēre"]);
            setVerbForm(data.forms, "perf_actv_inf", ["licuisse", "licitum [[esse|esse]]"]);
            setVerbForm(data.forms, "futr_actv_inf", ["licitūrum [[esse|esse]]"]);

            setVerbForm(data.forms, "pres_actv_ptc", ["licēns"]);
            setVerbForm(data.forms, "perf_actv_ptc", ["licitus"]);
            setVerbForm(data.forms, "futr_actv_ptc", ["licitūrus"]);
        });

        this.irreg_conjugations.set("volo", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            data.categories.push("Latin irregular verbs");

            const prefix = typeinfo.prefix;

            addVerbType(typeinfo.subtypes, "nopass");
            addVerbType(typeinfo.subtypes, "noimp");
            this.make_perf(data, [prefix + "volu"]);
            this.add_forms(data, "pres_actv_indc", prefix, "volō", "vīs", prefix ? "vult" : ["vult", "volt"], "volumus", prefix ? "vultis" : ["vultis", "voltis"], "volunt");
            this.volo_malo_nolo(data, prefix + "vol", prefix + "vel");
        });

        this.irreg_conjugations.set("malo", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            data.categories.push("Latin irregular verbs");

            addVerbType(typeinfo.subtypes, "nopass");
            addVerbType(typeinfo.subtypes, "noimp");
            this.make_perf(data, ["mālu"]);
            this.add_forms(data, "pres_actv_indc", "", "mālō", "māvīs", "māvult", "mālumus", "māvultis", "mālunt");
            this.volo_malo_nolo(data, "māl", "māl");
        });

        this.irreg_conjugations.set("nolo", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            data.categories.push("Latin irregular verbs");

            addVerbType(typeinfo.subtypes, "nopass");

            this.make_perf(data, ["nōlu"]);
            this.add_forms(data, "pres_actv_indc", "", "nōlō", "nōn vīs", "nōn vult", "nōlumus", "nōn vultis", "nōlunt");
            this.add_forms(data, "impf_actv_indc", "nōlēb", "am", "ās", "at", "āmus", "ātis", "ant");
            this.volo_malo_nolo(data, "nōl", "nōl");

            this.add_2_forms(data, "pres_actv_impr", "nōlī", "", "te");
            this.add_23_forms(data, "futr_actv_impr", "nōl", "itō", "itō", "itōte", "untō");
        });

        this.irreg_conjugations.set("possum", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            data.categories.push("Latin irregular verbs");
            data.categories.push("Latin suppletive verbs");

            addVerbType(typeinfo.subtypes, "nopass");

            this.make_perf(data, ["potu"]);

            this.add_forms(data, "pres_actv_indc", "", "possum", "potes", "potest", "possumus", "potestis", "possunt");
            this.add_forms(data, "impf_actv_indc", "poter", "am", "ās", "at", "āmus", "ātis", "ant");
            this.add_forms(data, "futr_actv_indc", "poter", "ō", ["is", "e"], "it", "imus", "itis", "unt");

            this.add_forms(data, "pres_actv_subj", "poss", "im", "īs", "it", "īmus", "ītis", "int");
            this.add_forms(data, "impf_actv_subj", "poss", "em", "ēs", "et", "ēmus", "ētis", "ent");

            setVerbForm(data.forms, "pres_actv_inf", ["posse"]);
            setVerbForm(data.forms, "pres_actv_ptc", ["potēns"]);
        });

        this.irreg_conjugations.set("piget", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            data.categories.push("Latin second conjugation verbs");
            data.categories.push("Latin impersonal verbs");
            data.categories.push("Latin semi-deponent verbs");
            data.categories.push("Latin defective verbs");

            const prefix = typeinfo.prefix;

            setVerbForm(data.forms, "3s_pres_actv_indc", [prefix + "piget"]);
            setVerbForm(data.forms, "3s_impf_actv_indc", [prefix + "pigēbat"]);
            setVerbForm(data.forms, "3s_futr_actv_indc", [prefix + "pigēbit"]);
            setVerbForm(data.forms, "3s_perf_actv_indc", [prefix + "piguit", prefix + "pigitum [[esse|est]]"]);
            setVerbForm(data.forms, "3s_plup_actv_indc", [prefix + "piguerat", prefix + "pigitum [[esse|erat]]"]);
            setVerbForm(data.forms, "3s_futp_actv_indc", [prefix + "piguerit", prefix + "pigitum [[esse|erit]]"]);
            setVerbForm(data.forms, "3s_pres_actv_subj", [prefix + "pigeat"]);
            setVerbForm(data.forms, "3s_impf_actv_subj", [prefix + "pigēret"]);
            setVerbForm(data.forms, "3s_perf_actv_subj", [prefix + "piguerit", prefix + "pigitum [[esse|sit]]"]);
            setVerbForm(data.forms, "3s_plup_actv_subj", [prefix + "piguisset", prefix + "pigitum [[esse|esset]]"]);
            setVerbForm(data.forms, "pres_actv_inf", [prefix + "pigēre"]);
            setVerbForm(data.forms, "perf_actv_inf", [prefix + "pigitum [[esse|esse]]"]);
            setVerbForm(data.forms, "pres_actv_ptc", [prefix + "pigēns"]);
            setVerbForm(data.forms, "perf_actv_ptc", [prefix + "pigitum"]);

            this.make_gerund(data, typeinfo, prefix + "pigend");
        });

        this.irreg_conjugations.set("coepi", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            data.categories.push("Latin third conjugation verbs");
            data.categories.push("Latin defective verbs");

            const prefix = typeinfo.prefix;

            this.make_perf(data, [prefix + "coep"]);
            this.make_supine(data, typeinfo, [prefix + "coept"]);
            this.make_perfect_passive(data);
        });

        this.irreg_conjugations.set("sum", (args: ArgMap, data: ConjugationData, typeinfo: ConjugationInfo) => {
            data.categories.push("Latin irregular verbs");
            data.categories.push("Latin suppletive verbs");

            const prefix = typeinfo.prefix;
            const prefix_e = this.ine(args.get("3")) || prefix;
            const prefix_f = this.lengthen_prefix(this.ine(args.get("4")) || prefix);
            const prefix_s = this.lengthen_prefix(prefix);

            addVerbType(typeinfo.subtypes, "nopass");
            addVerbType(typeinfo.subtypes, "supfutractvonly");

            this.make_perf(data, [prefix_f + "fu"]);
            this.make_supine(data, typeinfo, [prefix_f + "fut"]);

            setVerbForm(data.forms, "1s_pres_actv_indc", [prefix_s + "sum"]);
            setVerbForm(data.forms, "2s_pres_actv_indc", [prefix_e + "es"]);
            setVerbForm(data.forms, "3s_pres_actv_indc", [prefix_e + "est"]);
            setVerbForm(data.forms, "1p_pres_actv_indc", [prefix_s + "sumus"]);
            setVerbForm(data.forms, "2p_pres_actv_indc", [prefix_e + "estis"]);
            setVerbForm(data.forms, "3p_pres_actv_indc", [prefix_s + "sunt"]);

            setVerbForm(data.forms, "1s_impf_actv_indc", [prefix_e + "eram"]);
            setVerbForm(data.forms, "2s_impf_actv_indc", [prefix_e + "erās"]);
            setVerbForm(data.forms, "3s_impf_actv_indc", [prefix_e + "erat"]);
            setVerbForm(data.forms, "1p_impf_actv_indc", [prefix_e + "erāmus"]);
            setVerbForm(data.forms, "2p_impf_actv_indc", [prefix_e + "erātis"]);
            setVerbForm(data.forms, "3p_impf_actv_indc", [prefix_e + "erant"]);

            setVerbForm(data.forms, "1s_futr_actv_indc", [prefix_e + "erō"]);
            setVerbForm(data.forms, "2s_futr_actv_indc", [prefix_e + "eris", prefix_e + "ere"]);
            setVerbForm(data.forms, "3s_futr_actv_indc", [prefix_e + "erit"]);
            setVerbForm(data.forms, "1p_futr_actv_indc", [prefix_e + "erimus"]);
            setVerbForm(data.forms, "2p_futr_actv_indc", [prefix_e + "eritis"]);
            setVerbForm(data.forms, "3p_futr_actv_indc", [prefix_e + "erunt"]);

            setVerbForm(data.forms, "1s_pres_actv_subj", [prefix_s + "sim"]);
            setVerbForm(data.forms, "2s_pres_actv_subj", [prefix_s + "sīs"]);
            setVerbForm(data.forms, "3s_pres_actv_subj", [prefix_s + "sit"]);
            setVerbForm(data.forms, "1p_pres_actv_subj", [prefix_s + "sīmus"]);
            setVerbForm(data.forms, "2p_pres_actv_subj", [prefix_s + "sītis"]);
            setVerbForm(data.forms, "3p_pres_actv_subj", [prefix_s + "sint"]);

            setVerbForm(data.forms, "1s_impf_actv_subj", [prefix_e + "essem", prefix_f + "forem"]);
            setVerbForm(data.forms, "2s_impf_actv_subj", [prefix_e + "essēs", prefix_f + "forēs"]);
            setVerbForm(data.forms, "3s_impf_actv_subj", [prefix_e + "esset", prefix_f + "foret"]);
            setVerbForm(data.forms, "1p_impf_actv_subj", [prefix_e + "essēmus", prefix_f + "forēmus"]);
            setVerbForm(data.forms, "2p_impf_actv_subj", [prefix_e + "essētis", prefix_f + "forētis"]);
            setVerbForm(data.forms, "3p_impf_actv_subj", [prefix_e + "essent", prefix_f + "forent"]);

            setVerbForm(data.forms, "2s_pres_actv_impr", [prefix_e + "es"]);
            setVerbForm(data.forms, "2p_pres_actv_impr", [prefix_e + "este"]);

            setVerbForm(data.forms, "2s_futr_actv_impr", [prefix_e + "estō"]);
            setVerbForm(data.forms, "3s_futr_actv_impr", [prefix_e + "estō"]);
            setVerbForm(data.forms, "2p_futr_actv_impr", [prefix_e + "estōte"]);
            setVerbForm(data.forms, "3p_futr_actv_impr", [prefix_s + "suntō"]);

            setVerbForm(data.forms, "pres_actv_inf", [prefix_e + "esse"]);

            setVerbForm(data.forms, "futr_actv_inf", [prefix_f + "futūrum [[esse|esse]]", prefix_f + "fore"]);

            if (prefix == "ab") {
                setVerbForm(data.forms, "pres_actv_ptc", ["absēns"]);
            } else if (prefix == "prae") {
                setVerbForm(data.forms, "pres_actv_ptc", ["praesēns"]);
            }

            setVerbForm(data.forms, "ger_gen", []);
            setVerbForm(data.forms, "ger_dat", []);
            setVerbForm(data.forms, "ger_acc", []);
            setVerbForm(data.forms, "ger_abl", []);

            setVerbForm(data.forms, "sup_acc", []);
            setVerbForm(data.forms, "sup_abl", []);
        });
    }

    private lengthen_prefix(prefix: string) {
        prefix = prefix.replace(/an$/, "ān");
        prefix = prefix.replace(/en$/, "ēn");
        prefix = prefix.replace(/in$/, "īn");
        prefix = prefix.replace(/on$/, "ōn");
        prefix = prefix.replace(/un$/, "ūn");

        return prefix;
    }

    private volo_malo_nolo(data: ConjugationData, indc_stem: string, subj_stem: string) {
        this.add_forms(data, "impf_actv_indc", indc_stem + "ēb", "am", "ās", "at", "āmus", "ātis", "ant");
        this.add_forms(data, "futr_actv_indc", indc_stem, "am", "ēs", "et", "ēmus", "ētis", "ent");

        this.add_forms(data, "pres_actv_subj", subj_stem, "im", "īs", "it", "īmus", "ītis", "int");
        this.add_forms(data, "impf_actv_subj", subj_stem + "l", "em", "ēs", "et", "ēmus", "ētis", "ent");

        setVerbForm(data.forms, "pres_actv_inf", [subj_stem + "le"]);
        setVerbForm(data.forms, "pres_actv_ptc", [indc_stem + "ēns"]);

    }

    private libet_lubet(data: ConjugationData, typeinfo: ConjugationInfo, stem: string) {
        data.categories.push("Latin second conjugation verbs");
        data.categories.push("Latin impersonal verbs");

        addVerbType(typeinfo.subtypes, "nopass");

        const prefix = typeinfo.prefix;
        stem = prefix + stem;

        setVerbForm(data.forms, "3s_pres_actv_indc", [stem + "et"]);
        setVerbForm(data.forms, "3s_impf_actv_indc", [stem + "ēbat"]);
        setVerbForm(data.forms, "3s_futr_actv_indc", [stem + "ēbit"]);
        setVerbForm(data.forms, "3s_perf_actv_indc", [stem + "uit", stem + "itum [[esse|est]]"]);
        setVerbForm(data.forms, "3s_plup_actv_indc", [stem + "uerat", stem + "itum [[esse|erat]]"]);
        setVerbForm(data.forms, "3s_futp_actv_indc", [stem + "uerit", stem + "itum [[esse|erit]]"]);
        setVerbForm(data.forms, "3s_pres_actv_subj", [stem + "eat"]);
        setVerbForm(data.forms, "3s_impf_actv_subj", [stem + "ēret"]);
        setVerbForm(data.forms, "3s_perf_actv_subj", [stem + "uerit", stem + "itum [[esse|sit]]"]);
        setVerbForm(data.forms, "3s_plup_actv_subj", [stem + "uisset", stem + "itum [[esse|esset]]"]);
        setVerbForm(data.forms, "3p_plup_actv_subj", [stem + "uissent"]);
        setVerbForm(data.forms, "pres_actv_inf", [stem + "ēre"]);
        setVerbForm(data.forms, "perf_actv_inf", [stem + "uisse", stem + "itum [[esse|esse]]"]);
        setVerbForm(data.forms, "pres_actv_ptc", [stem + "ēns"]);
        setVerbForm(data.forms, "perf_actv_ptc", [stem + "itum"]);
    }

    private fio(data: ConjugationData, prefix: string, voice: string) {
        this.add_forms(data, "pres_" + voice + "_indc", prefix, "fīō", "fīs", "fit", "fīmus", "fītis", "fīunt");
        this.add_forms(data, "impf_" + voice + "_indc", prefix + "fīēb", "am", "ās", "at", "āmus", "ātis", "ant");
        this.add_forms(data, "futr_" + voice + "_indc", prefix + "fī", "am", "ēs", "et", "ēmus", "ētis", "ent");

        this.add_forms(data, "pres_" + voice + "_subj", prefix + "fī", "am", "ās", "at", "āmus", "ātis", "ant");
        this.add_forms(data, "impf_" + voice + "_subj", prefix + "fier", "em", "ēs", "et", "ēmus", "ētis", "ent");

        this.add_2_forms(data, "pres_" + voice + "_impr", prefix + "fī", "", "te");
        this.add_23_forms(data, "futr_" + voice + "_impr", prefix + "fī", "tō", "tō", "tōte", "untō");

        this.add_form(data, "pres_" + voice + "_inf", prefix, "fierī");
    }
}
