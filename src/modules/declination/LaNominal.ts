/**
 * This is a complete re-implementation of Wiktionary's Module:la-nominal, developed by Benwing2.
 * It was converted from Lua to TypeScript by Folke Will <folko@solhost.org>.
 *
 * Original source: https://en.wiktionary.org/wiki/Module:la-nominal
 * Based on version: https://en.wiktionary.org/w/index.php?title=Module:la-nominal&oldid=62391877
 *
 * Lua idioms, function and variable names kept as in the original in order to easily
 * backport later changes to this implementation.
 *
 * For that reason, it's suggested to add a type-aware wrapper around this class and leave
 * this code unchanged instead of improving the types and use of idioms in this class.
 *
 */
import { ArgMap, array_equals, extract_base, FormMap, is_enum_value, read_list, remove_links } from "../common";
import { m_adj_decl } from "./LaAdjData";
import { m_noun_decl } from "./LaNounData";
import { getNominalForm, NominalForm, setNominalForm } from "./NominalForm";

export interface DeclOptions {
    suppressOldGenitive?: boolean;
    suppressNonNeuterIStemAccIs?: boolean;
    suppressRareIrregForms?: boolean;
    populateAllTerminations?: boolean;
    suppressAdjPtcForms?: boolean;
}

export enum Gender {
    M = "M",
    F = "F",
    N = "N",
}

export enum NumberTantum {
    Singular = "sg",
    Plural = "pl",
    Both = "both",
}

interface SegmentRun {
    segments: (Segment | Alternant)[];
    loc: boolean;
    num?: NumberTantum;
    gender?: Gender;
    is_adj?: boolean;
    propses: DeclProp[];
}

interface Segment {
    type: "Segment";

    decl: string;
    headword_decl: string;
    is_adj: boolean;
    lemma: string;
    orig_lemma: string;
    stem2?: string;
    gender?: Gender;
    types: Set<string>;
    num?: NumberTantum;
    loc: boolean;
    args: string[];
    orig_prefix?: string;
    prefix?: string;
}

interface Alternant {
    type: "Alternant";

    alternants: SegmentRun[];
    loc: boolean;
    num?: NumberTantum;
    gender?: Gender;
    is_adj?: boolean;
    propses: DeclProp[];
}

export interface DeclProp {
    decl: string;
    headword_decl: string;
    types: Set<string>;
}

interface Declensions {
    forms: FormMap<NominalForm>;
    notes: Map<string, string[][]>;
    title: string[];
    subtitleses: (string | string[])[];
    orig_titles: string[];
    categories: string[];
    voc: boolean;
    noneut: boolean;
}

export interface DeclensionData {
    templateType: "declension";
    declensionType: "noun" | "adjective";

    title: string;
    num?: NumberTantum;
    propses: DeclProp[];
    forms: FormMap<NominalForm>;
    categories: string[];
    notes: Map<string, string[]>;
    user_specified: Set<string>;
    pos: string;
    num_type?: string;

    // only in headwords
    indecl: boolean;
    overriding_lemma: string[];
}

export interface NounData extends DeclensionData {
    declensionType: "noun";

    // only in headwords
    gender?: Gender;
    m?: string[];
    f?: string[];
    overriding_genders?: string[];
}

export interface AdjectiveData extends DeclensionData {
    declensionType: "adjective";

    voc: boolean;
    noneut: boolean;

    // only in headwords
    comp: string[];
    sup: string[];
    adv: string[];
}

export interface SegmentData {
    declOpts: DeclOptions;
    title?: string;
    subtitles: (string | string[])[];
    footnote: string;
    num?: NumberTantum;
    loc?: boolean;
    pos: string;
    forms: FormMap<NominalForm>;
    types: Set<string>;
    categories: string[];
    notes: Map<string, string>;

    // adjectives
    gender?: Gender;
    voc?: boolean;
    noneut?: boolean;
}

type EndingTable = [
    string | string[],
    string,
    string[],
    ((base: string, stem2: string) => [string, string])?
][];

export class LaNominal {
    public static readonly EmptyForm = "—";
    private readonly options: DeclOptions;
    private readonly cases = ["nom", "gen", "dat", "acc", "abl", "voc", "loc"];
    private readonly genders = ["m", "f", "n"];
    private readonly nums = ["sg", "pl"];
    private readonly linked_prefixes = ["", "linked_"];
    private readonly potential_noun_lemma_slots = ["nom_sg", "nom_pl"];
    private readonly potential_adj_lemma_slots = [
        "nom_sg_m",
	    "nom_pl_m",
	    "nom_sg_f",
	    "nom_pl_f",
	    "nom_sg_n",
	    "nom_pl_n"
    ];

    private readonly irreg_adj_to_decl: Map<string, string> = new Map([
        ["duo", "irreg+"],
        ["ambō", "irreg+"],
        ["mīlle", "3-1+"],
        ["plūs", "3-1+"],
        ["is", "1&2+"],
        ["īdem", "1&2+"],
        ["ille", "1&2+"],
        ["ipse", "1&2+"],
        ["iste", "1&2+"],
        ["quis", "irreg+"],
        ["quī", "irreg+"],
        ["quisquis", "irreg+"],
    ]);


    private readonly irreg_noun_to_decl: Map<string, string> = new Map([
        ["bōs",  "3"],
        ["cherub",  "irreg"],
        ["deus",  "2"],
        ["Deus",  "2"],
        ["domus",  "4,2"],
        ["Iēsus",  "4"],
        ["Jēsus",  "4"],
        ["Iēsūs",  "4"],
        ["Jēsūs",  "4"],
        ["iūgerum",  "2,3"],
        ["jūgerum",  "2,3"],
        ["sūs",  "3"],
        ["ēthos",  "3"],
        ["Athōs",  "2"],
        ["lexis",  "3"],
        ["vēnum",  "4,2"],
        ["vīs",  "3"],
    ]);

    private readonly declension_to_english = new Map([
        ["1", "first"],
        ["2", "second"],
        ["3", "third"],
        ["4", "fourth"],
        ["5", "fifth"],
    ]);

    public constructor(options?: DeclOptions) {
        this.options = options || {};
    }

    public do_generate_noun_forms(args: ArgMap, pos: string = "nouns", from_headword = false): NounData {
        const parsed_run = this.parse_segment_run_allowing_alternants(args.get("1")?.trim() || "");
        parsed_run.loc = parsed_run.loc || args.has("loc_sg") || args.has("loc_pl");

        let num = args.get("num");
        if (num !== undefined && !is_enum_value(NumberTantum, num)) {
            num = undefined;
        }
        parsed_run.num = num || parsed_run.num;

        const declensions = this.decline_segment_run(parsed_run, pos, false);

        if (!parsed_run.loc) {
            setNominalForm(declensions.forms, "loc_sg", undefined);
            setNominalForm(declensions.forms, "loc_pl", undefined);
        }

        declensions.title = [this.construct_title(args.get("title"), declensions.title.join(""), false, parsed_run)];

        const all_data: NounData = {
            templateType: "declension",
            declensionType: "noun",

            title: declensions.title.join(" "),
            num: parsed_run.num,
            gender: parsed_run.gender,
            propses: parsed_run.propses,
            forms: declensions.forms,
            categories: declensions.categories,
            notes: new Map(),
            user_specified: new Set(),
            pos: pos,
            num_type: args.get("type"),

            // only if headword
            indecl: args.has("indecl"),
            m: read_list(args, "m"),
            f: read_list(args, "f"),
            overriding_lemma: read_list(args, "lemma"),
            overriding_genders: read_list(args, "g")
        };

        for (const slot of this.iter_noun_slots()) {
            const noteses = declensions.notes.get(slot);
            if (noteses) {
                noteses.forEach((notes, index) => {
                    all_data.notes.set(`${slot}${index + 1}`, notes);
                });
            }
        }

        this.process_noun_forms_and_overrides(all_data, args);

        return all_data;
    }

    public do_generate_adj_forms(args: ArgMap, pos: string = "adjectives", from_headword = false): AdjectiveData {
        let segment_run = args.get("1")?.trim() || "";
        if (!segment_run.match(/[<(]/)) {
            segment_run = segment_run + (args.has("indecl") ? "<0+>" : "<+>");
        }

        const parsed_run = this.parse_segment_run_allowing_alternants(segment_run);
        parsed_run.loc = parsed_run.loc || (args.has("loc_sg_m") || args.has("loc_sg_f") || args.has("loc_sg_n") || args.has("loc_pl_m") || args.has("loc_pl_f") || args.has("loc_pl_n"));

        let num = args.get("num");
        if (num !== undefined && !is_enum_value(NumberTantum, num)) {
            num = undefined;
        }
        parsed_run.num = num || parsed_run.num;

        const overriding_voc = (args.has("voc_sg_m") || args.has("voc_sg_f") || args.has("voc_sg_n") || args.has("voc_pl_m") || args.has("voc_pl_f") || args.has("voc_pl_n"));
        const declensions = this.decline_segment_run(parsed_run, pos, true);

        if (!parsed_run.loc) {
            setNominalForm(declensions.forms, "loc_sg_m", undefined);
            setNominalForm(declensions.forms, "loc_sg_f", undefined);
            setNominalForm(declensions.forms, "loc_sg_n", undefined);
            setNominalForm(declensions.forms, "loc_pl_m", undefined);
            setNominalForm(declensions.forms, "loc_pl_f", undefined);
            setNominalForm(declensions.forms, "loc_pl_n", undefined);
        }

        if (!overriding_voc && !declensions.voc) {
            setNominalForm(declensions.forms, "voc_sg_m", undefined);
            setNominalForm(declensions.forms, "voc_sg_f", undefined);
            setNominalForm(declensions.forms, "voc_sg_n", undefined);
            setNominalForm(declensions.forms, "voc_pl_m", undefined);
            setNominalForm(declensions.forms, "voc_pl_f", undefined);
            setNominalForm(declensions.forms, "voc_pl_n", undefined);
        }

        declensions.title = [this.construct_title(args.get("title"), declensions.title.join(""), from_headword, parsed_run)];

        const all_data: AdjectiveData = {
            templateType: "declension",
            declensionType: "adjective",

            title: declensions.title.join(""),
            num: parsed_run.num,
            propses: parsed_run.propses,
            forms: declensions.forms,
            categories: declensions.categories,
            notes: new Map(),
            user_specified: new Set(),
            voc: declensions.voc,
            noneut: args.has("noneut") || declensions.noneut,
            pos: pos,
            num_type: args.get("type"),

            // only if headword
            overriding_lemma: read_list(args, "lemma"),
            indecl: args.has("indecl"),
            comp: read_list(args, "comp"),
            sup: read_list(args, "sup"),
            adv: read_list(args, "adv")

        };

        for (const slot of this.iter_adj_slots()) {
            const noteses = declensions.notes.get(slot);
            if (noteses) {
                noteses.forEach((notes, index) => {
                    all_data.notes.set(`${slot}${index + 1}`, notes);
                });
            }
        }

        this.process_adj_forms_and_overrides(all_data, args);

        return all_data;
    }

    private construct_title(args_title: string | undefined, declensions_title: string, from_headword: boolean, parsed_run: SegmentRun): string {
        if (args_title) {
            declensions_title = args_title.replace("<1>", "first declension");
            declensions_title = declensions_title.replace("<1&2>", "first/second declension");
            declensions_title = declensions_title.replace("<2>", "second declension");
            declensions_title = declensions_title.replace("<3>", "third declension");
            declensions_title = declensions_title.replace("<4>", "fourth declension");
            declensions_title = declensions_title.replace("<5>", "fifth declension");
            if (from_headword) {
                declensions_title = declensions_title[0].toLowerCase() + declensions_title.replace(/\.$/, "").substr(1);
            } else {
                if (declensions_title.startsWith(" ")) {
                    declensions_title = declensions_title.substr(1);
                }
                declensions_title = declensions_title[0].toUpperCase() + declensions_title.substr(1);
            }
        } else {
            const post_text_parts = [];
            if (parsed_run.loc) {
                post_text_parts.push(", with locative");
            }
            if (parsed_run.num == "sg") {
                post_text_parts.push(", singular only");
            } else if (parsed_run.num == "pl") {
                post_text_parts.push(", plural only");
            }

            const post_text = post_text_parts.join("");
            if (from_headword) {
                declensions_title = declensions_title[0].toLowerCase() + declensions_title.substr(1) + post_text;
            } else {
                if (declensions_title.length > 0) {
                    declensions_title = declensions_title[0].toUpperCase() + declensions_title.substr(1) + post_text + ".";
                }
            }
        }

        return declensions_title;
    }

    private process_noun_forms_and_overrides(data: NounData, args: ArgMap) {
        const linked_to_non_linked_noun_slots = new Map();

        for (const slot of this.potential_noun_lemma_slots) {
            linked_to_non_linked_noun_slots.set("linked_" + slot, slot);
        }

        for (const slot of this.iter_noun_slots()) {
            let val: string[] = [];
            if (args.has(slot)) {
                val = args.get(slot)?.split("/") || [];
                data.user_specified.add(slot);
            } else {
                const non_linked_equiv_slot = linked_to_non_linked_noun_slots.get(slot);
                if (non_linked_equiv_slot && args.has(non_linked_equiv_slot)) {
                    val = args.get(non_linked_equiv_slot)?.split("/") || [];
                    data.user_specified.add(slot);
                } else {
                    val = getNominalForm(data.forms, slot) || [];
                }
            }

            if (val) {
                if ((data.num == "pl" && slot.includes("sg")) || (data.num == "sg" && slot.includes("pl"))) {
                    setNominalForm(data.forms, slot, [""]);
                } else if (val[0] == "" || val[0] == "-" || val[0] == "—") {
                    setNominalForm(data.forms, slot, [LaNominal.EmptyForm]);
                } else {
                    setNominalForm(data.forms, slot, val);
                }
            }
        }
    }

    private process_adj_forms_and_overrides(data: AdjectiveData, args: ArgMap) {
        const linked_to_non_linked_adj_slots = new Map();
        for (const slot of this.potential_adj_lemma_slots) {
            linked_to_non_linked_adj_slots.set("linked_" + slot, slot);
        }

        for (const slot of this.iter_adj_slots()) {
            if (data.noneut && slot.match(/_n/)) {
                setNominalForm(data.forms, slot, undefined);
            }
            let val: string[] | undefined;
            const ovr = args.get(slot);
            if (ovr) {
                val = ovr.split("/");
                data.user_specified.add(slot);
            } else {
                const non_linked_equiv_slot = linked_to_non_linked_adj_slots.get(slot);
                if (non_linked_equiv_slot && args.has(non_linked_equiv_slot)) {
                    val = args.get(non_linked_equiv_slot)?.split("/") || [];
                    data.user_specified.add(slot);
                } else {
                    val = getNominalForm(data.forms, slot);
                }
            }
            if (val) {
                if ((data.num == "pl" && slot.match(/sg/)) || (data.num == "sg" && slot.match(/pl/))) {
                    setNominalForm(data.forms, slot, undefined);
                } else if (val[0] == "" || val[0] == "-" || val[0] == "—") {
                    setNominalForm(data.forms, slot, [LaNominal.EmptyForm]);
                } else {
                    setNominalForm(data.forms, slot, val);
                }
            }
        }

        for (const gender of ["f", "n"]) {
            let other_is_masc = true;
            for (const cas of this.cases) {
                for (const num of this.nums) {
                    const genderForm = getNominalForm(data.forms, cas + "_" + num + "_" + gender);
                    const amscForm = getNominalForm(data.forms, cas + "_" + num + "_m");
                    if (!array_equals(genderForm, amscForm)) {
                        other_is_masc = false;
                        break;
                    }
                }
                if (!other_is_masc) {
                    break;
                }
            }

            if (other_is_masc && !this.options.populateAllTerminations) {
                for (const cas of this.cases) {
                    for (const num of this.nums) {
                        setNominalForm(data.forms, cas + "_" + num + "_" + gender, undefined);
                    }
                }
            }
        }
    }

    private iter_slots(is_adj: boolean, overridable_only = false) {
        if (is_adj) {
            return this.iter_adj_slots(overridable_only);
        } else {
            return this.iter_noun_slots(overridable_only);
        }
    }

    private iter_adj_slots(overridable_only = false): string[] {
        let cas = 1;
        let num = 1;
        let gen = 1;
        let linked_variant = 0;
        const entries: string[] = [];

        while (true) {
            linked_variant = linked_variant + 1;
            let max_linked_variant;
            if (overridable_only) {
                max_linked_variant = 1;
            } else {
                if (this.cases[cas - 1] == "nom" && this.genders[gen - 1] == "m") {
                    max_linked_variant = 2;
                } else {
                    max_linked_variant = 1;
                }
            }
            if (linked_variant > max_linked_variant) {
                linked_variant = 1;
                gen++;
                if (gen > this.genders.length) {
                    gen = 1;
                    num++;
                    if (num > this.nums.length) {
                        num = 1;
                        cas++;
                        if (cas > this.cases.length) {
                            break;
                        }
                    }
                }
            }
            entries.push(this.linked_prefixes[linked_variant - 1] + this.cases[cas - 1] + "_" + this.nums[num - 1] + "_" + this.genders[gen - 1]);
        }
        return entries;
    }

    private iter_noun_slots(overridable_only = false): string[] {
        let cas = 1;
        let num = 1;
        let linked_variant = 0;

        const entries: string[] = [];

        while (true) {
            linked_variant = linked_variant + 1;
            let max_linked_variant = 1;
            if (!overridable_only) {
                if (this.cases[cas - 1] == "nom") {
                    max_linked_variant = 2;
                }
            }
            if (linked_variant > max_linked_variant) {
                linked_variant = 1;
                num++;
                if (num > this.nums.length) {
                    num = 1;
                    cas++;
                    if (cas > this.cases.length) {
                        break;
                    }
                }
            }
            entries.push(this.linked_prefixes[linked_variant - 1] + this.cases[cas - 1] + "_" + this.nums[num - 1]);
        }

        return entries;
    }

    private parse_segment_run_allowing_alternants(segment_run: string): SegmentRun {
        const alternating_segments = this.capturing_split(segment_run, /(\(\(.*?\)\))/);
        const parsed_segments: (Segment | Alternant)[] = [];
        let loc = false;
        let num: NumberTantum | undefined;
        let gender: Gender | undefined;
        let is_adj: boolean | undefined;
        const propses: DeclProp[] = [];

        for (let i = 0; i < alternating_segments.length; i++) {
            const alternating_segment = alternating_segments[i];
            let this_is_adj: boolean | undefined;
            if (alternating_segment) {
                if (i % 2 == 0) {
                    const parsed_run = this.parse_segment_run(alternating_segment);
                    for (const parsed_segment of parsed_run.segments) {
                        parsed_segments.push(parsed_segment);
                    }
                    loc = loc || parsed_run.loc;
                    num = num || parsed_run.num;
                    gender = gender || parsed_run.gender;
                    this_is_adj = parsed_run.is_adj;
                    for (const prop of parsed_run.propses) {
                        propses.push(prop);
                    }
                } else {
                    const parsed_alternating_segment = this.parse_alternant(alternating_segment);
                    parsed_segments.push(parsed_alternating_segment);
                    loc = loc || parsed_alternating_segment.loc;
                    num = num || parsed_alternating_segment.num;
                    gender = gender || parsed_alternating_segment.gender;
                    this_is_adj = parsed_alternating_segment.is_adj;
                    propses.push(...parsed_alternating_segment.propses);
                }
            }
            if (is_adj === undefined) {
                is_adj = this_is_adj;
            } else if (this_is_adj !== undefined) {
                is_adj = is_adj && this_is_adj;
            }
        }

        return {
            segments: parsed_segments,
            loc: loc,
            num: num,
            gender: gender,
            is_adj: is_adj,
            propses: propses
        };
    }

    private parse_alternant(alternant: string): Alternant {
        const parsed_alternants: SegmentRun[] = [];
        const alternant_spec = alternant.match(/^\(\((.*)\)\)$/);
        let loc = false;
        let num: NumberTantum | undefined;
        let gender: Gender | undefined;
        let is_adj: boolean | undefined;
        const propses: DeclProp[] = [];

        if (!alternant_spec) {
            throw Error(`Invalid alternant spec`);
        }

        const alternants = alternant_spec[1].split(",");
        alternants.forEach((altr, i) => {
            const parsed_run = this.parse_segment_run(altr);
            parsed_alternants.push(parsed_run);
            loc = loc || parsed_run.loc;
            if (i == 0) {
                num = parsed_run.num;
            } else if (num != parsed_run.num) {
                num = NumberTantum.Both;
            }
            gender = gender || parsed_run.gender;
            if (is_adj === undefined) {
                is_adj = parsed_run.is_adj;
            } else if (parsed_run.is_adj !== undefined && parsed_run.is_adj !== is_adj) {
                throw Error(`Saw both noun and adjective alternants; not allowed`);
            }
            propses.push(...parsed_run.propses);
        });

        return {
            type: "Alternant",
            alternants: parsed_alternants,
            loc: loc,
            num: num,
            gender: gender,
            is_adj: is_adj,
            propses: propses,
        };
    }

    private parse_segment_run(segment_run: string): SegmentRun {
        const is_suffix = segment_run.startsWith("-");
        const segments: string[] = [];

        const bracketed_segments = this.capturing_split(segment_run, /(\[\[[^\[\]]-\]\]<.*?>)/);
        bracketed_segments.forEach((bracketed_segment, i) => {
            if (i % 2 == 1) {
                segments.push(bracketed_segment);
            } else {
                let regex;
                if (is_suffix) {
                    regex = /([^<> ,]+<.*?>)/;
                } else {
                    regex = /([^<> ,\-]+<.*?>)/;
                }
                for (const subsegment of this.capturing_split(bracketed_segment, regex)) {
                    segments.push(subsegment);
                }
            }
        });

        let loc = false;
        let num: NumberTantum | undefined;
        let gender: Gender| undefined;
        let is_adj: boolean | undefined;
        const propses: DeclProp[] = [];
        const parsed_segments: Segment[] = [];

        for (let i = 1; i < segments.length; i += 2) {
            const parsed_segment = this.parse_segment(segments[i]);
            loc = loc || parsed_segment.loc;
            num = num || parsed_segment.num;
            if (is_adj === undefined) {
                is_adj = parsed_segment.is_adj;
            } else {
                is_adj = is_adj && parsed_segment.is_adj;
            }
            gender = gender || parsed_segment.gender;
            parsed_segment.orig_prefix = segments[i - 1];
            parsed_segment.prefix = remove_links(segments[i - 1]);
            parsed_segments.push(parsed_segment);
            const props: DeclProp = {
                decl: parsed_segment.decl,
                headword_decl: parsed_segment.headword_decl,
                types: parsed_segment.types,
            };
            propses.push(props);
        }

        if (segments[segments.length - 1]) {
            parsed_segments.push({
                type: "Segment",
                args: [],
                decl: "",
                headword_decl: "",
                is_adj: false,
                lemma: "",
                orig_lemma: "",
                loc: false,
                types: new Set(),
                orig_prefix: segments[segments.length - 1],
                prefix: remove_links(segments[segments.length - 1])
            });
        }

        return {
            segments: parsed_segments,
            loc: loc,
            num: num,
            gender: gender,
            propses: propses
        };
    }

    private capturing_split(str: string, pattern: RegExp): string[] {
        return str.split(pattern);
    }

    private parse_segment(segment: string): Segment {
        const match = segment.match(/^(.*)<(.*?)>$/);
        if (!match) {
            throw Error("No match");
        }
        const stem_part = match[1];
        const spec_part = match[2];
        const stems = stem_part.split("/");
        const specs = spec_part.split(".");

        const types = new Set<string>();
        let num: NumberTantum | undefined;
        let loc = false;

        let decl: string = "";
        for (let j = 0; j < specs.length; j++) {
            let spec = specs[j];
            if (j == 0) {
                decl = spec;
            } else {
                const m2 = spec.match(/^(-?)(.*?)$/);
                if (m2) {
                    const begins_with_hypen = m2[1];
                    spec = m2[2];
                    spec = begins_with_hypen + spec.replace(/-/g, "_");
                    types.add(spec);
                }
            }
        }

        const orig_lemma = stems[0];
        if (!orig_lemma) {
            throw Error("No lemma");
        }

        const lemma = remove_links(orig_lemma);
        let stem2 = stems[1];

        if (stems.length > 2) {
            throw Error(`Too many stems, at most 2 should be give: ${stem_part}`);
        }

        let is_adj = false;

        let headword_decl;
        let base;
        let detected_subtypes;

        if (decl.match(/\+/)) {
            decl = decl.replace(/\+/g, "");
            [base, stem2, decl, detected_subtypes] = this.detect_adj_type_and_subtype(lemma, stem2, decl, types);
            is_adj = true;

            const irreg = this.irreg_adj_to_decl.get(lemma);
            if (irreg) {
                headword_decl = `irreg/${irreg}`;
            } else {
                headword_decl = decl + "+";
            }

            for (const subtype of detected_subtypes) {
                if (types.has("-" + subtype)) {
                    types.delete("-" + subtype);
                } else {
                    types.add(subtype);
                }
            }
        } else {
            [base, stem2, detected_subtypes] = this.detect_noun_subtype(lemma, stem2, decl, types);

            const irreg = this.irreg_noun_to_decl.get(lemma);
            if (irreg) {
                headword_decl = `irreg/${irreg}`;
            } else {
                headword_decl = decl;
            }

            for (const subtype of detected_subtypes) {
                if (types.has("-" + subtype)) {
                    types.delete("-" + subtype);
                } else if ((subtype == "M" || subtype == "F" || subtype == "N") && (types.has("M") || types.has("F") || types.has("N"))) {
                    // don't create conflicting gender specs
                } else if ((subtype == "sg" || subtype == "pl" || subtype == "both") && (types.has("sg") || types.has("pl") || types.has("both"))) {
                    // don't create conflicting number restrictions
                } else {
                    types.add(subtype);
                }
            }

            if (!types.has("pl") && !types.has("both") && lemma.match(/^[A-ZĀĒĪŌŪȲĂĔĬŎŬ]/)) {
                types.add("sg");
            }
        }

        if (types.has("loc")) {
            loc = true;
            types.delete("loc");
        }

        let gender: Gender | undefined;
        if (types.has("M")) {
            gender = Gender.M;
        } else if (types.has("F")) {
            gender = Gender.F;
        } else if (types.has("N")) {
            gender = Gender.N;
        }

        if (types.has("pl")) {
            num = NumberTantum.Plural;
            types.delete("pl");
        } else if (types.has("sg")) {
            num = NumberTantum.Singular;
            types.delete("sg");
        }

        const args = [base, stem2];

        return {
            type: "Segment",
            decl: decl,
            headword_decl: headword_decl,
            is_adj: is_adj,
            gender: gender,
            orig_lemma: orig_lemma,
            lemma: lemma,
            stem2: stem2,
            types: types,
            num: num,
            loc: loc,
            args: args,
        };
    }

    private detect_adj_type_and_subtype(lemma: string, stem2: string, typ: string, subtypes: Set<string>): [any, any, any, any] {
        if (!typ.match(/^[0123]/) && !typ.match(/^irreg/)) {
            subtypes = new Set(subtypes);
            subtypes.add(typ);
            typ = "";
        }

        function base_as_stem2(base: string, stem2x: string): [string, string] {
            return ["foo", base];
        }

        function constant_base(baseval: string): ((base: string, stem2: string) => [string, string]) {
            return (base: string, s2: string) => [baseval, ""];
        }

        function decl12_stem2(base: string): string {
            return base;
        }

        function decl3_stem2(base: string): string {
            return LaNominal.make_stem2(base);
        }

        const decl12_entries: EndingTable = [
            ["us", "1&2", []],
            ["a", "1&2", []],
            ["um", "1&2", []],
            ["ī", "1&2", ["pl"]],
            ["ae", "1&2", ["pl"]],
            ["a", "1&2", ["pl"]],
            ["os", "1&2", ["greekA", "-greekE"]],
            ["os", "1&2", ["greekE", "-greekA"]],
            ["ē", "1&2", ["greekE", "-greekA"]],
            ["on", "1&2", ["greekA", "-greekE"]],
            ["on", "1&2", ["greekE", "-greekA"]],
            ["^(.*er)$", "1&2", ["er"]],
            ["^(.*ur)$", "1&2", ["er"]],
            ["^(h)ic$", "1&2", ["ic"]],
        ];

        const decl3_entries: EndingTable = [
            ["^(.*er)$", "3-3", []],
            ["is", "3-2", []],
            ["e", "3-2", []],
            ["^(.*[ij])or$", "3-C", []],
            ["^(min)or$", "3-C", []],
            ["^(.*ēs)$", "3-1", ["I"]],
            ["^(.*ēs)$", "3-1", ["par"]],
            ["^(.*[ij])ōrēs$", "3-C", ["pl"]],
            ["^(min)ōrēs$", "3-C", ["pl"]],
            ["ēs", "3-2", ["pl", "I"]],
            ["ēs", "3-1", ["pl", "par"], base_as_stem2],
            ["ia", "3-2", ["pl", "I"]],
            ["a", "3-1", ["pl", "par"], base_as_stem2],
            ["", "3-1", ["I"]],
            ["", "3-1", ["par"]],
        ];

        if (!typ) {
            const [base, new_stem2, rettype, new_subtypes] = this.get_adj_type_and_subtype_by_ending(lemma, stem2, undefined, subtypes, decl12_entries, decl12_stem2);
            if (base) {
                return [base, new_stem2, rettype, new_subtypes];
            } else {
                return this.get_adj_type_and_subtype_by_ending(lemma, stem2, typ, subtypes, decl3_entries, decl3_stem2);
            }
        } else if (typ == "0") {
            return [lemma, "", "0", []];
        } else if (typ == "3") {
            return this.get_adj_type_and_subtype_by_ending(lemma, stem2, typ, subtypes, decl3_entries, decl3_stem2);
        } else if (typ == "1&2") {
            return this.get_adj_type_and_subtype_by_ending(lemma, stem2, typ, subtypes, decl12_entries, decl12_stem2);
        } else if (typ == "1-1") {
            return this.get_adj_type_and_subtype_by_ending(lemma, stem2, typ, subtypes, [
                ["a", "1-1", []],
                ["ae", "1-1", ["pl"]]
            ]);
        } else if (typ == "2-2") {
            return this.get_adj_type_and_subtype_by_ending(lemma, stem2, typ, subtypes, [
                ["us", "2-2", []],
                ["um", "2-2", []],
                ["ī", "2-2", ["pl"]],
                ["a", "2-2", ["pl"]],
                ["os", "2-2", ["greek"]],
                ["on", "2-2", ["greek"]],
                ["oe", "2-2", ["greek", "pl"]],
            ]);
        } else if (typ == "3-1") {
            return this.get_adj_type_and_subtype_by_ending(lemma, stem2, typ, subtypes, [
                ["^(.*ēs)$", "3-1", ["I"]],
                ["^(.*ēs)$", "3-1", ["par"]],
                ["ēs", "3-1", ["pl", "I"], base_as_stem2],
                ["ēs", "3-1", ["pl", "par"], base_as_stem2],
                ["ia", "3-1", ["pl", "I"], base_as_stem2],
                ["a", "3-1", ["pl", "par"], base_as_stem2],
                ["", "3-1", ["I"]],
                ["", "3-1", ["par"]],
            ], decl3_stem2);
        } else if (typ == "3-2") {
            return this.get_adj_type_and_subtype_by_ending(lemma, stem2, typ, subtypes, [
                ["is", "3-2", []],
                ["e", "3-2", []],
                ["ēs", "3-2", []],
                ["ēs", "3-2", ["pl"]],
                ["ia", "3-2", ["pl"]],
            ], decl3_stem2);
        } else if (typ == "3-C") {
            return this.get_adj_type_and_subtype_by_ending(lemma, stem2, typ, subtypes, [
                ["^(.*[ij])or$", "3-C", []],
                ["^(min)or$", "3-C", []],
                ["^(.*[ij])ōrēs$", "3-C", ["pl"]],
                ["^(min)ōrēs$", "3-C", ["pl"]],
            ], decl3_stem2);
        } else if (typ == "irreg") {
            return this.get_adj_type_and_subtype_by_ending(lemma, stem2, typ, subtypes, [
                ["^(duo)$", typ, ["pl"]],
                ["^(ambō)$", typ, ["pl"]],
                ["^(mīll?ia)$", typ, ["N", "pl"], constant_base("mīlle")],
                ["^(ea)$", typ, [], constant_base("is")],
                ["^(id)$", typ, [], constant_base("is")],
                ["^([ei]ī)$", typ, ["pl"], constant_base("is")],
                ["^(eae?)$", typ, ["pl"], constant_base("is")],
                ["^(eadem)$", typ, [], constant_base("īdem")],
                ["^([īi]dem)$", typ, [], constant_base("īdem")],
                ["^(īdem)$", typ, ["pl"]],
                ["^(eae?dem)$", typ, ["pl"], constant_base("īdem")],
                ["^(i[lps][lst])a$", typ, [], (base: string, s2: string) => [base + "e", ""]],
                ["^(i[ls][lt])ud$", typ, [], (base: string, s2: string) => [base + "e", ""]],
                ["^(ipsum)$", typ, [], constant_base("ipse")],
                ["^(i[lps][lst])ī$", typ, ["pl"], (base: string, s2: string) => [base + "e", ""]],
                ["^(i[lps][lst])ae?$", typ, ["pl"], (base: string, s2: string) => [base + "e", ""]],
                ["^(quī)$", typ, []],
                ["^(quī)$", typ, ["pl"]],
                ["^(quae)$", typ, [], constant_base("quī")],
                ["^(quae)$", typ, ["pl"], constant_base("quī")],
                ["^(quid)$", typ, [], constant_base("quis")],
                ["^(quod)$", typ, [], constant_base("quī")],
                ["^(qui[cd]quid)$", typ, [], constant_base("quisquis")],
                ["^(quīquī)$", typ, ["pl"], constant_base("quisquis")],
                ["^(quaequae)$", typ, ["pl"], constant_base("quisquis")],
                ["", typ, []],
            ]);
        } else {
            return this.get_adj_type_and_subtype_by_ending(lemma, stem2, typ, subtypes, [
                ["ēs", typ, ["pl"], base_as_stem2],
                ["ia", typ, ["pl"], base_as_stem2],
                ["", typ, []],
            ], decl3_stem2);
        }
    }

    private get_adj_type_and_subtype_by_ending(
        lemma: string,
        stem2: string,
        decltype: string | undefined,
        specified_subtypes: Set<string>,
        endings_and_subtypes: EndingTable,
        process_stem2?: (base: string) => string):
        [string, string, string, string[]]
    {
        for (const [ending, rettype, subtypes, process_retval] of endings_and_subtypes) {
            let not_this_subtype = false;
            if (specified_subtypes.has("pl") && !subtypes.includes("pl")) {
                not_this_subtype = true;
            } else {
                for (const subtype of subtypes) {
                    if (specified_subtypes.has("-" + subtype)) {
                        not_this_subtype = true;
                        break;
                    }
                    const must_not_be_present = subtype.match(/^-(.*)$/);
                    if (must_not_be_present && specified_subtypes.has(must_not_be_present[1])) {
                        not_this_subtype = true;
                        break;
                    }
                }
            }
            if (!not_this_subtype) {
                let base: string | undefined;
                if (typeof(ending) != "string") {
                    const lemma_ending = ending[0];
                    const stem2_ending = ending[1];
                    base = extract_base(lemma, lemma_ending);
                    if (base && base + stem2_ending != stem2) {
                        base = undefined;
                    }
                } else {
                    base = extract_base(lemma, ending);
                }
                if (base !== undefined) {
                    const new_subtypes = [];
                    for (const subtype of subtypes) {
                        if (!subtype.startsWith("-")) {
                            new_subtypes.push(subtype);
                        }
                    }
                    if (process_retval) {
                        [base, stem2] = process_retval(base, stem2);
                    }
                    if (process_stem2) {
                        stem2 = stem2 || process_stem2(base);
                    }
                    return [base, stem2, rettype, new_subtypes];
                }
            }
        }

        if (decltype === undefined) {
            return ["", "", "", []];
        } else if (decltype == "") {
            throw Error(`Unrecognized ending for adjective: ${lemma}`);
        } else {
            throw Error(`Unrecognized ending for declension-${decltype} adjective: ${lemma}`);
        }
    }

    private detect_noun_subtype(lemma: string, stem2: string, typ: string, subtypes: Set<string>): [string, string, Set<string>] {
        if (typ == "1") {
            return this.get_noun_subtype_by_ending(lemma, stem2, typ, subtypes, [
                ["ām", ["F", "am"]],
                ["ās", ["M", "Greek", "Ma"]],
                ["ēs", ["M", "Greek", "Me"]],
                ["ē", ["F", "Greek"]],
                ["ae", ["F", "pl"]],
                ["a", ["F"]],
            ]);
        } else if (typ == "2") {
            let detected_subtypes;
            [lemma, stem2, detected_subtypes] = this.get_noun_subtype_by_ending(lemma, stem2, typ, subtypes, [
                ["^(.*r)$", ["M", "er"]],
                ["^(.*v)os$", ["M", "vos"]],
                ["^(.*v)om$", ["N", "vom"]],
                ["os", ["M", "Greek"]],
                ["os", ["N", "Greek", "us"]],
                ["on", ["N", "Greek"]],
                ["^([A-ZĀĒĪŌŪȲĂĔĬŎŬ].*)ius$", ["M", "ius", "voci", "sg"]],
                ["ius", ["M", "ius"]],
                ["ium", ["N", "ium"]],
                ["us", ["M"]],
                ["us", ["N", "us"]],
                ["um", ["N"]],
                ["iī", ["M", "ius", "pl"]],
                ["ia", ["N", "ium", "pl"]],
                ["ī", ["M", "pl"]],
                ["ī", ["N", "us", "pl"]],
                ["a", ["N", "pl"]],
            ]);
            stem2 = stem2 || lemma;
            return [lemma, stem2, detected_subtypes];
        } else if (typ == "3") {
            let match;
            if (subtypes.has("pl")) {
                if (subtypes.has("Greek")) {
                    match = lemma.match(/^(.*)erēs$/);
                    if (match) {
                        return [match[1] + "ēr", match[1] + "er", new Set(["er"])];
                    }
                    match = lemma.match(/^(.*)ontēs$/);
                    if (match) {
                        return [match[1] + "ōn", match[1] + "ont", new Set(["on"])];
                    }
                    match = lemma.match(/^(.*)es$/);
                    if (match) {
                        return ["foo", stem2 || match[1], new Set()];
                    }
                    throw Error(`Unrecognized ending for declension-3 plural Greek noun: ${lemma}`);
                }
                match = lemma.match(/^(.*)ia$/);
                if (match) {
                    return ["foo", stem2 || match[1], new Set(["N", "I", "pure"])];
                }
                match = lemma.match(/^(.*)a$/);
                if (match) {
                    return ["foo", stem2 || match[1], new Set(["N"])];
                }
                match = lemma.match(/^(.*)ēs$/);
                if (match) {
                    return ["foo", stem2 || match[1], new Set()];
                }
                throw Error(`Unrecognized ending for declension-3 plural noun: ${lemma}`);
            }

            stem2 = stem2 || LaNominal.make_stem2(lemma);
            let detected_subtypes;
            let base;
            let tmp;
            if (subtypes.has("Greek")) {
                [base, tmp, detected_subtypes] = this.get_noun_subtype_by_ending(lemma, stem2, "", subtypes, [
                    [["is", ""], ["I"]],
                    ["ēr", ["er"]],
                    ["ōn", ["on"]],
                ]);
                if (base) {
                    return [lemma, stem2, detected_subtypes];
                }
                return [lemma, stem2, new Set()];
            }
            if (!subtypes.has("N")) {
                [base, tmp, detected_subtypes] = this.get_noun_subtype_by_ending(lemma, stem2, "", subtypes, [
                    [["^([A-ZĀĒĪŌŪȲĂĔĬŎŬ].*pol)is$", ""], ["F", "polis", "sg", "loc"]],
                    [["tūdō", "tūdin"], ["F"]],
                    [["tās", "tāt"], ["F"]],
                    [["tūs", "tūt"], ["F"]],
                    [["tiō", "tiōn"], ["F"]],
                    [["siō", "siōn"], ["F"]],
                    [["xiō", "xiōn"], ["F"]],
                    [["gō", "gin"], ["F"]],
                    [["or", "ōr"], ["M"]],
                    [["trīx", "trīc"], ["F"]],
                    [["trix", "trīc"], ["F"]],
                    [["is", ""], ["I"]],
                    [["^([a-zāēīōūȳăĕĭŏŭ].*)ēs$", ""], ["I"]],
                ]);
                if (base) {
                    return [lemma, stem2, detected_subtypes];
                }
            }

            [base, tmp, detected_subtypes] = this.get_noun_subtype_by_ending(lemma, stem2, "", subtypes, [
                [["us", "or"], ["N"]],
                [["us", "er"], ["N"]],
                [["ma", "mat"], ["N"]],
                [["men", "min"], ["N"]],
                [["^([A-ZĀĒĪŌŪȲĂĔĬŎŬ].*)e$", ""], ["N", "sg"]],
                [["e", ""], ["N", "I", "pure"]],
                [["al", "āl"], ["N", "I", "pure"]],
                [["ar", "ār"], ["N", "I", "pure"]],
            ]);
            if (base) {
                return [lemma, stem2, detected_subtypes];
            }
            return [lemma, stem2, new Set()];
        } else if (typ == "4") {
            if (subtypes.has("echo") || subtypes.has("argo") || subtypes.has("Callisto")) {
                const match = lemma.match(/^(.*)ō$/);
                if (!match) {
                    throw Error(`Declension-4 noun of subtype .echo, .argo or .Callisto should end in -ō: ${lemma}`);
                }
                const base = match[1];
                if (subtypes.has("Callisto")) {
                    return [base, "", new Set(["F", "sg"])];
                } else {
                    return [base, "", new Set(["F"])];
                }
            }
            return this.get_noun_subtype_by_ending(lemma, stem2, typ, subtypes, [
                ["us", ["M"]],
                ["ū", ["N"]],
                ["ūs", ["M", "pl"]],
                ["ua", ["N", "pl"]],
            ]);
        } else if (typ == "5") {
            return this.get_noun_subtype_by_ending(lemma, stem2, typ, subtypes, [
                ["iēs", ["F", "i"]],
                ["iēs", ["F", "i", "pl"]],
                ["ēs", ["F"]],
                ["ēs", ["F", "pl"]],
            ]);
        } else if (typ == "irreg" && lemma == "domus") {
            return [lemma, "", new Set(["loc"])];
        } else if (typ == "indecl" || (typ == "irreg" && (lemma == "Deus" || lemma == "Iēsus" || lemma == "Jēsus" || lemma == "Athōs" || lemma == "vēnum"))) {
            return [lemma, "", new Set(["sg"])];
        } else {
            return [lemma, "", new Set()];
        }
    }

    private static make_stem2(stem: string): string {
        const patterns = [
            ["tūdō", "tūdin"],
            ["is", ""],
            ["ēs", ""],
            ["āns", "ant"],
            ["ēns", "ent"],
            ["ōns", "ont"],
            ["ceps", "cipit"],
            ["us", "or"],
            ["ex", "ic"],
            ["ma", "mat"],
            ["e", ""],
            ["al", "āl"],
            ["ar", "ār"],
            ["men", "min"],
            ["er", "r"],
            ["or", "ōr"],
            ["gō", "gin"],
            ["ō", "ōn"],
            ["ps", "p"],
            ["bs", "b"],
            ["s", "t"],
            ["x", "c"],
        ];

        for (const pattern of patterns) {
            const key = pattern[0];
            const val = pattern[1];
            if (stem.match(new RegExp(key + "$"))) {
                return stem.replace(new RegExp(key + "$"), val);
            }
        }
        return stem;
    }

    private get_noun_subtype_by_ending(
        lemma: string,
        stem2: string,
        decltype: string,
        specified_subtypes: Set<string>,
        endings_and_subtypes: [(string | string[]), string[]][]):
        [string, string, Set<string>]
    {
        for (const ending_and_subtype of endings_and_subtypes) {
            const ending = ending_and_subtype[0];
            const subtypes = ending_and_subtype[1];
            let not_this_subtype = false;
            if (specified_subtypes.has("pl") && !subtypes.includes("pl")) {
                not_this_subtype = true;
            } else {
                for (const subtype of subtypes) {
                    if (specified_subtypes.has("-" + subtype) ||
                        (subtype == "N" && (specified_subtypes.has("M") || specified_subtypes.has("F"))) ||
                        ((subtype == "M" || subtype == "F") && specified_subtypes.has("N")) ||
                        (subtype == "sg" && specified_subtypes.has("pl")) ||
                        (subtype == "pl" && specified_subtypes.has("sg"))) {
                            not_this_subtype = true;
                            break;
                        }
                }
            }
            if (!not_this_subtype) {
                if (Array.isArray(ending)) {
                    const lemma_ending = ending[0];
                    const stem2_ending = ending[1];
                    const base = extract_base(lemma, lemma_ending);
                    if (base && (base + stem2_ending) == stem2) {
                        return [base, stem2, new Set(subtypes)];
                    }
                } else {
                    const base = extract_base(lemma, ending);
                    if (base) {
                        return [base, stem2, new Set(subtypes)];
                    }
                }
            }
        }
        if (decltype) {
            throw Error(`Unrecognized ending for declension-${decltype} noun: ${lemma}`);
        }

        return ["", "", new Set()];
    }

    private decline_segment_run(parsed_run: SegmentRun, pos: string, is_adj: boolean): Declensions {
        const declensions: Declensions = {
            forms: new Map(),
            notes: new Map(),
            title: [],
            subtitleses: [],
            orig_titles: [],
            categories: [],
            voc: true,
            noneut: false,
        };

        for (const slot of this.iter_slots(is_adj)) {
            setNominalForm(declensions.forms, slot, [""]);
        }

        for (const seg of parsed_run.segments) {
            if (seg.type == "Segment" && seg.decl) {
                seg.loc = parsed_run.loc;
                seg.num = seg.num || parsed_run.num;
                seg.gender = seg.gender || parsed_run.gender;

                let data: SegmentData;
                let potential_lemma_slots;

                if (seg.is_adj) {
                    const decline = m_adj_decl.get(seg.decl);
                    if (!decline) {
                        throw Error(`Unrecognized declension '${seg.decl}'`);
                    }

                    potential_lemma_slots = this.potential_adj_lemma_slots;
                    data = {
                        declOpts: this.options,
                        subtitles: [],
                        footnote: "",
                        num: seg.num,
                        gender: seg.gender,
                        voc: true,
                        noneut: false,
                        pos: is_adj ? pos : "adjectives",
                        forms: new Map(),
                        types: seg.types,
                        categories: [],
                        notes: new Map(),
                    };
                    decline(data, seg.args);

                    if (!data.voc) {
                        declensions.voc = false;
                    }
                    if (data.noneut) {
                        declensions.noneut = true;
                    }

                    if (data.types.has("sufn")) {
                        data.subtitles.push(["with", " 'm' optionally → 'n' in compounds"]);
                    } else if (data.types.has("not_sufn")) {
                        data.subtitles.push(["without", " 'm' optionally → 'n' in compounds"]);
                    }

                    if (data.title) {
                        declensions.orig_titles.push(data.title);
                    }
                    if (data.subtitles.length > 0) {
                        const subtitles: string[] = [];
                        for (const subtitle of data.subtitles) {
                            if (typeof(subtitle) == "string") {
                                subtitles.push(subtitle);
                            } else {
                                subtitles.push(subtitle.join(""));
                            }
                        }
                        data.title = data.title + " (" + subtitles.join(", ") + ")";
                    }
                    for (const subtitle of data.subtitles) {
                        declensions.subtitleses.push(subtitle);
                    }
                } else {
                    const decline = m_noun_decl.get(seg.decl);
                    if (!decline) {
                        throw Error(`Unrecognized declension '${seg.decl}'`);
                    }
                    potential_lemma_slots = this.potential_noun_lemma_slots;
                    data = {
                        declOpts: this.options,
                        subtitles: [],
                        footnote: "",
                        num: seg.num,
                        loc: seg.loc,
                        pos: pos,
                        forms: new Map(),
                        types: seg.types,
                        categories: [],
                        notes: new Map(),
                    };

                    decline(data, seg.args);

                    if (!data.title) {
                        const match = seg.headword_decl.match(/^irreg\/(.*)$/);
                        let apparent_decl;
                        if (match) {
                            apparent_decl = match[1];
                            if (data.subtitles.length == 0) {
                                data.subtitles.push("irregular");
                            }
                        } else {
                            apparent_decl = seg.headword_decl;
                        }
                        const english = this.declension_to_english.get(apparent_decl);
                        if (english) {
                            data.title = `${english}-declension`;
                        } else if (apparent_decl == "irreg") {
                            data.title = "irregular";
                        } else if (apparent_decl == "indecl" || apparent_decl == "0") {
                            data.title = "indeclinable";
                        } else {
                            throw Error(`Internal error! Don't recognize noun declension ${apparent_decl}`);
                        }
                        data.title = data.title + " noun";
                    }
                    if (data.types.has("sufn")) {
                        data.subtitles.push(["with", " 'm' optionally → 'n' in compounds"]);
                    } else if (data.types.has("not_sufn")) {
                        data.subtitles.push(["without", " 'm' optionally → 'n' in compounds"]);
                    }
                    declensions.orig_titles.push(data.title);
                    if (data.subtitles.length > 0) {
                        const subtitles: string[] = [];
                        for (const subtitle of data.subtitles) {
                            if (typeof(subtitle) == "string") {
                                subtitles.push(subtitle);
                            } else {
                                subtitles.push(subtitle.join(""));
                            }
                        }
                        data.title = data.title + ` (${subtitles.join(", ")})`;
                    }

                    for (const subtitle of data.subtitles) {
                        declensions.subtitleses.push(subtitle);
                    }
                }

                for (const slot of potential_lemma_slots) {
                    const forms = getNominalForm(data.forms, slot);
                    if (forms) {
                        const linked_forms = [];
                        for (const form of forms) {
                            if (form == seg.lemma) {
                                linked_forms.push(seg.orig_lemma);
                            } else {
                                linked_forms.push(form);
                            }
                        }
                        setNominalForm(data.forms, `linked_${slot}`, linked_forms);
                    }
                }

                if (seg.types.has("lig")) {
                    this.apply_ligatures(data.forms, is_adj);
                }

                if (seg.types.has("sufn")) {
                    this.apply_sufn(data.forms, is_adj);
                }

                this.propagate_number_restrictions(data.forms, seg.num, is_adj);

                for (const slot of this.iter_slots(is_adj)) {
                    let new_forms: string[] | undefined;
                    if (is_adj) {
                        if (!seg.is_adj) {
                            throw Error(`Can't decline noun '${seg.lemma}' when overall term is an adjective`);
                        }
                        new_forms = getNominalForm(data.forms, slot);
                        if (!new_forms && slot.match(/_[fn]$/)) {
                            new_forms = getNominalForm(data.forms, slot.replace(/_[fn]$/, "_m"));
                        }
                    } else if (seg.is_adj) {
                        if (!seg.gender) {
                            throw Error(`Declining modifying adjective ${seg.lemma} but don't know gender of associated noun`);
                        }
                        new_forms = getNominalForm(data.forms, slot + "_" + seg.gender.toLowerCase()) ||
                             getNominalForm(data.forms, slot + "_m");
                    } else {
                        new_forms = getNominalForm(data.forms, slot);
                    }

                    const new_notes: string[][] = [];

                    if (new_forms) {
                        for (let j = 0; j < new_forms.length; j++) {
                            const noteses = data.notes.get(`${slot}${j + 1}`);
                            if (noteses) {
                                new_notes[j] = [noteses];
                            }
                        }
                    }

                    const oldForms = getNominalForm(declensions.forms, slot);
                    const [forms, notes] = this.append_form(oldForms, declensions.notes.get(slot), new_forms, new_notes, slot.includes("linked") ? seg.orig_prefix : seg.prefix);
                    setNominalForm(declensions.forms, slot, forms);
                    declensions.notes.set(slot, notes);
                }

                if (!seg.types.has("nocat") && (is_adj || !seg.is_adj)) {
                    for (const cat of data.categories) {
                        this.insert_if_not(declensions.categories, cat);
                    }
                }

                if (seg.prefix != "" && seg.prefix != "-" && seg.prefix != " ") {
                    declensions.title.push("indeclinable portion");
                }

                if (data.title) {
                    declensions.title.push(data.title);
                }
            } else if (seg.type == "Alternant") {
                let seg_declensions: Declensions | undefined;
                const seg_titles: string[] = [];
                const seg_subtitleses: (string | string[])[][] = [];
                const seg_stems_seen: string[] = [];
                const seg_categories: string[] = [];

                let title_the_hard_way = false;
                let alternant_decl: string = "";
                let alternant_decl_title;

                for (const this_parsed_run of seg.alternants) {
                    let num_non_constant_segments = 0;
                    for (const segment of (this_parsed_run.segments)) {
                        if (segment.type == "Segment" && segment.decl) {
                            if (!alternant_decl) {
                                alternant_decl = segment.decl;
                            } else if (alternant_decl != segment.decl) {
                                title_the_hard_way = true;
                                num_non_constant_segments = 500;
                                break;
                            }
                            num_non_constant_segments++;
                        }
                    }
                    if (num_non_constant_segments != 1) {
                        title_the_hard_way = true;
                    }
                }
                if (!title_the_hard_way) {
                    const subtypeses: Set<string> = new Set();
                    for (const this_parsed_run of seg.alternants) {
                        for (const segment of this_parsed_run.segments) {
                            if (segment.type == "Segment" && segment.decl) {
                                segment.types.forEach(t => subtypeses.add(t));
                                this.insert_if_not(seg_stems_seen, segment.stem2 || "");
                            }
                        }
                    }
                    for (const this_parsed_run of seg.alternants) {
                        for (const segment of this_parsed_run.segments) {
                            if (segment.type == "Segment" && segment.decl) {
                                const neg_subtypes = this.set_difference(subtypeses, segment.types);
                                for (const neg_subtype of neg_subtypes) {
                                    segment.types.add("not_" + neg_subtype);
                                }
                            }
                        }
                    }
                }

                for (const this_parsed_run of seg.alternants) {
                    this_parsed_run.loc = seg.loc;
                    this_parsed_run.num = this_parsed_run.num || seg.num;
                    this_parsed_run.gender = this_parsed_run.gender || seg.gender;
                    const this_declensions = this.decline_segment_run(this_parsed_run, pos, is_adj);

                    if (!this_declensions.voc) {
                        declensions.voc = false;
                    }

                    if (this_declensions.noneut) {
                        declensions.noneut = true;
                    }

                    if (this_parsed_run.num == "sg" || this_parsed_run.num == "pl") {
                        for (const slot of (this.iter_slots(is_adj))) {
                            if ((this_parsed_run.num == "sg" && slot.includes("pl")) ||
                                (this_parsed_run.num == "pl" && slot.includes("sg"))) {
                                    setNominalForm(this_declensions.forms, slot, []);
                                    this_declensions.notes.set(slot, []);
                                }
                        }
                    }

                    if (!seg_declensions) {
                        seg_declensions = this_declensions;
                    } else {
                        for (const slot of this.iter_slots(is_adj)) {
                            const curforms = getNominalForm(seg_declensions.forms, slot) || [];
                            const newforms = getNominalForm(this_declensions.forms, slot) || [];
                            const newform_index_to_new_index: number[] = [];
                            newforms.forEach((form, newj) => {
                                let did_break = false;
                                for (let j = 0; j < curforms.length; j++) {
                                    if (curforms[j] == form) {
                                        newform_index_to_new_index[newj] = j;
                                        did_break = true;
                                        break;
                                    }
                                }
                                if (!did_break) {
                                    curforms.push(form);
                                    newform_index_to_new_index[newj] = curforms.length - 1;
                                }
                            });

                            setNominalForm(seg_declensions.forms, slot, curforms);
                            const curnotes = seg_declensions.notes.get(slot) || [];
                            const newnotes = this_declensions.notes.get(slot);
                            if (newnotes) {
                                newnotes.forEach((notes, index) => {
                                    const combined_index = newform_index_to_new_index[index];
                                    if (!curnotes[combined_index]) {
                                        curnotes[combined_index] = notes;
                                    } else {
                                        const combined = Array.from(curnotes[combined_index]);
                                        for (const note of newnotes) {
                                            this.insert_if_not(combined, newnotes);
                                        }
                                        curnotes[combined_index] = combined;
                                    }
                                });
                            }
                        }
                    }
                    for (const cat of this_declensions.categories) {
                        this.insert_if_not(seg_categories, cat);
                    }
                    this.insert_if_not(seg_titles, this_declensions.title.join(""));

                    seg_subtitleses.push(this_declensions.subtitleses);

                    if (!alternant_decl_title) {
                        alternant_decl_title = this_declensions.orig_titles[0];
                    }
                }

                if (!seg_declensions) {
                    throw Error("No segment declensions");
                }

                this.propagate_number_restrictions(seg_declensions?.forms, parsed_run.num, is_adj);

                for (const slot of this.iter_slots(is_adj)) {
                    const declForms = getNominalForm(declensions.forms, slot);
                    const segForms = getNominalForm(seg_declensions.forms, slot);
                    const [newForms, notes] = this.append_form(declForms, declensions.notes.get(slot), segForms, seg_declensions.notes.get(slot), undefined);
                    setNominalForm(declensions.forms, slot, newForms);
                    declensions.notes.set(slot, notes);
                }

                if (is_adj || !seg.is_adj) {
                    for (const cat of seg_categories) {
                        this.insert_if_not(declensions.categories, cat);
                    }
                }

                let title_to_insert;
                if (title_the_hard_way) {
                    title_to_insert = this.join_sentences(seg_titles, " or ");
                } else {
                    const first = seg_subtitleses[0];
                    if (typeof(first) == "string") {
                        throw Error("Expected multi-title");
                    }
                    const first_subtitles: (string | string[])[] = first;
                    let num_common_subtitles = first_subtitles.length;
                    for (let i = 1; i < seg_subtitleses.length; i++) {
                        const this_subtitles = seg_subtitleses[i];
                        for (let j = 0; j < num_common_subtitles; j++) {
                            if (first_subtitles[j] != this_subtitles[j]) {
                                num_common_subtitles = j;
                                break;
                            }
                        }
                    }

                    const common_subtitles: string[] = [];
                    for (let i = 0; i < num_common_subtitles; i++) {
                        const entry = first_subtitles[i];
                        if (typeof(entry) != "string") {
                            common_subtitles.push(entry.join(""));
                        } else {
                            common_subtitles.push(entry);
                        }
                    }

                    const common_subtitle_portion = common_subtitles.join(", ");
                    let non_common_subtitle_portion: string | undefined;
                    let common_prefix: string | undefined;
                    let common_suffix: string | undefined;

                    for (let i = 0; i < seg_subtitleses.length; i++) {
                        const this_subtitles = seg_subtitleses[i];
                        if (typeof(this_subtitles) == "string") {
                            throw Error("Expected subtitles to be array");
                        }
                        if (this_subtitles.length != num_common_subtitles + 1 || typeof(this_subtitles[num_common_subtitles]) == "string" || this_subtitles[num_common_subtitles].length != 2) {
                            break;
                        }
                        if (i == 0) {
                            common_prefix = this_subtitles[num_common_subtitles][0];
                            common_suffix = this_subtitles[num_common_subtitles][1];
                        } else {
                            const this_prefix = this_subtitles[num_common_subtitles][0];
                            const this_suffix = this_subtitles[num_common_subtitles][1];
                            if (this_prefix != common_prefix) {
                                common_prefix = undefined;
                            }
                            if (this_suffix != common_suffix) {
                                common_suffix = undefined;
                            }
                            if (!common_prefix && !common_suffix) {
                                break;
                            }
                        }
                    }
                    if (common_prefix || common_suffix) {
                        if (common_prefix && common_suffix) {
                            throw Error("Something is wrong, first non-common subtitle is actually common to all segments");
                        }
                        if (common_prefix) {
                            const non_common_parts = [];
                            for (const subtitles of seg_subtitleses) {
                                non_common_parts.push(subtitles[num_common_subtitles][1]);
                            }
                            non_common_subtitle_portion = common_prefix + non_common_parts.join(" or ");
                        } else {
                            const non_common_parts = [];
                            for (const subtitles of seg_subtitleses) {
                                non_common_parts.push(subtitles[num_common_subtitles][0]);
                            }
                            non_common_subtitle_portion = non_common_parts.join( " or ") + common_suffix;
                        }
                    } else {
                        let saw_non_common_subtitles = false;
                        const non_common_subtitles = [];
                        for (const this_subtitles of seg_subtitleses) {
                            const this_non_common_subtitles = [];
                            for (let j = num_common_subtitles; j < this_subtitles.length; j++) {
                                this_non_common_subtitles.push(this_subtitles[j]);
                            }
                            if (this_non_common_subtitles.length > 0) {
                                non_common_subtitles.push(this_non_common_subtitles.join(", "));
                                saw_non_common_subtitles = true;
                            } else {
                                non_common_subtitles.push("otherwise");
                            }
                        }
                        non_common_subtitle_portion = saw_non_common_subtitles ? non_common_subtitles.join(" or ") : "";
                    }

                    const subtitle_portions = [];
                    if (common_subtitle_portion) {
                        subtitle_portions.push(common_subtitle_portion);
                    }
                    if (non_common_subtitle_portion) {
                        subtitle_portions.push(non_common_subtitle_portion);
                    }
                    if (seg_stems_seen.length > 1) {
                        const number_to_english = [
                            "zero", "one", "two", "three", "four", "five"
                        ];

                        subtitle_portions.push((number_to_english[seg_stems_seen.length] || `${seg_stems_seen.length}`) + " different stems");
                    }
                    const subtitle_portion = subtitle_portions.join("; ");
                    if (subtitle_portion) {
                        title_to_insert = alternant_decl_title + " (" + subtitle_portion + ")";
                    } else {
                        title_to_insert =  alternant_decl_title;
                    }
                }
                if (title_to_insert) {
                    declensions.title.push(title_to_insert);
                }
            } else {
                for (const slot of this.iter_slots(is_adj)) {
                    const prefix = slot.includes("linked") ? seg.orig_prefix : seg.prefix;
                    const [forms, notes] = this.append_form(getNominalForm(declensions.forms, slot), declensions.notes.get(slot), [prefix || ""], undefined, undefined);
                    setNominalForm(declensions.forms, slot, forms);
                    declensions.notes.set(slot, notes);
                }
                declensions.title.push("indeclinable portion");
            }
        }

        const titles: string[] = [];
        declensions.title.forEach((title, i) => {
            if (i == 0) {
                titles.push(title[0].toUpperCase() + title.substr(1));
            } else {
                titles.push(this.add_indefinite_article(title));
            }
        });
        declensions.title = [titles.join(" with ")];

        return declensions;
    }

    private add_indefinite_article(text: string): string {
        if (text.match(/^[aeiou]/i)) {
            return `an ${text}`;
        } else {
            return `a ${text}`;
        }
    }

    private join_sentences(sentences: string[], joiner: string): string {
        const sentences_to_join: string[] = [];
        sentences.forEach((sentence, i) => {
            if (i < sentences.length - 1) {
                sentence = sentence.replace(/\.$/, "");
            }
            if (i > 0) {
                sentence = sentence[0].toLowerCase() + sentence.substr(1);
            }
            sentences_to_join.push(sentence);
        });
        return sentences_to_join.join(joiner);
    }

    private set_difference(a: Set<string>, b: Set<string>): Set<string> {
        const res = new Set<string>();
        for (const key of a.keys()) {
            if (!b.has(key)) {
                res.add(key);
            }
        }
        return res;
    }

    private append_form(
        forms: string[] | undefined,
        notes: string[][] | undefined,
        new_forms: string[] | undefined,
        new_notes: string[][] | undefined,
        prefix: string | undefined):
        [string[], string[][]]
    {
        forms = forms || [];
        new_forms = new_forms || [];
        notes = notes || [];
        new_notes = new_notes || [];
        prefix = prefix || "";

        if (new_forms.length == 1) {
            for (let i = 0; i < forms.length; i++) {
                forms[i] = forms[i] + prefix + new_forms[0];
                if (new_notes[0]) {
                    if (!notes[i]) {
                        notes[i] = new_notes[0];
                    } else {
                        const combined_notes = Array.from(notes[i]);
                        for (const note of new_notes[0]) {
                            combined_notes.push(note);
                        }
                        notes[i] = combined_notes;
                    }
                }
            }
            return [forms, notes];
        } else {
            const ret_forms = [];
            const ret_notes: string[][] = [];

            for (let i = 0; i < forms.length; i++) {
                for (let j = 0; j < new_forms.length; j++) {
                    ret_forms.push(forms[i] + prefix + new_forms[j]);
                    if (new_notes[j]) {
                        if (!notes[i]) {
                            ret_notes[i * new_forms.length + j] = new_notes[j];
                        } else {
                            const combined_notes = Array.from(notes[i]);
                            for (const note of new_notes[j]) {
                                combined_notes.push(note);
                            }
                            ret_notes[i * new_forms.length + j] = combined_notes;
                        }
                    }
                }
            }
            return [ret_forms, ret_notes];
        }
    }

    private apply_ligatures(forms: FormMap<NominalForm>, is_adj: boolean) {
        for (const slot of this.iter_slots(is_adj)) {
            const ffs = getNominalForm(forms, slot) || [];
            for (let i = 0; i < ffs.length; i++) {
                ffs[i] = ffs[i].replace(/Ae/g, "Æ");
                ffs[i] = ffs[i].replace(/Oe/g, "Œ");
                ffs[i] = ffs[i].replace(/ae/g, "æ");
                ffs[i] = ffs[i].replace(/oe/g, "œ");
            }
            setNominalForm(forms, slot, ffs);
        }
    }

    private apply_sufn(forms: FormMap<NominalForm>, is_adj: boolean) {
        for (const slot of this.iter_slots(is_adj)) {
            const ffs = getNominalForm(forms, slot) || [];
            if (ffs.length == 1 && !slot.includes("linked")) {
                const form = ffs[0];
                if (form.match(/m$/)) {
                    setNominalForm(forms, slot, [form.replace(/m$/, "n"), ...ffs]);
                }
            } else {
                let final_m = false;
                for (const form of getNominalForm(forms, slot) || []) {
                    if (form.match(/m$/)) {
                        final_m = true;
                    }
                }
                if (final_m) {
                    const newval = [];
                    for (const form of getNominalForm(forms, slot) || []) {
                        if (form.match(/m$/)) {
                            const val = form.replace(/m$/, "n");
                            newval.push(val);
                        }
                        newval.push(form);
                    }
                }
            }
        }
    }

    private propagate_number_restrictions(forms: FormMap<NominalForm>, num: string | undefined, is_adj: boolean) {
        if (num == "sg" || num == "pl") {
            for (const slot of this.iter_slots(is_adj)) {
                if (slot.match(num)) {
                    const other_num_slot = (num == "sg") ? slot.replace("sg", "pl") : slot.replace("pl", "sg");
                    setNominalForm(forms, other_num_slot, getNominalForm(forms, slot) || []);
                }
            }
        }
    }

    private insert_if_not(data: any[], entry: any, pos = 0) {
        if (data.includes(entry)) {
            return;
        }
        if (pos == 0) {
            data.push(entry);
        } else {
            data.splice(pos - 1, 0, entry);
        }
    }
}
