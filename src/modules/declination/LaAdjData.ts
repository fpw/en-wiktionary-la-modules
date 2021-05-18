/**
 * This is a complete re-implementation of Wiktionary's Module:la-adj/data, developed by Benwing2.
 * It was converted from Lua to TypeScript by Folke Will <folko@solhost.org>.
 *
 * Original source: https://en.wiktionary.org/wiki/Module:la-adj/data
 * Based on version: https://en.wiktionary.org/w/index.php?title=Module:la-adj/data&oldid=62514179
 *
 * Lua idioms, function and variable names kept as in the original in order to easily
 * backport later changes to this implementation.
 *
 * For that reason, it's suggested to add a type-aware wrapper around this class and leave
 * this code unchanged instead of improving the types and use of idioms in this class.
 *
 */
import { NumberTantum, SegmentData } from "./LaNominal";

export const m_adj_decl: Map<string, ((data: SegmentData, args: string[]) => void)> = new Map([
    ["0", (data, args) => {
        data.title = "indeclinable " + singularize(data.pos);
        const stem = args[0];

        data.forms.set("nom_sg_m", [stem]);
        data.forms.set("nom_pl_m", [stem]);

        data.forms.set("gen_sg_m", [stem]);
        data.forms.set("gen_pl_m", [stem]);

        data.forms.set("dat_sg_m", [stem]);
        data.forms.set("dat_pl_m", [stem]);

        data.forms.set("acc_sg_m", [stem]);
        data.forms.set("acc_pl_m", [stem]);

        data.forms.set("abl_sg_m", [stem]);
        data.forms.set("abl_pl_m", [stem]);

        data.forms.set("loc_sg_m", [stem]);
        data.forms.set("loc_pl_m", [stem]);

        data.forms.set("voc_sg_m", [stem]);
        data.forms.set("voc_pl_m", [stem]);

        data.categories.push("Latin indeclinable " + data.pos);
    }],
    ["1&2", (data, args) => {
        const singpos = singularize(data.pos);
        if (data.gender == "F") {
            data.title = "first-declension " + singpos;
        } else if (data.gender) {
            data.title = "second-declension " + singpos;
        } else {
            data.title = "first/second-declension " + singpos;
        }

        let stem = args[0];
        let original: string | undefined;

        if (data.types.has("er")) {
            if (stem.match(/er$/)) {
                data.subtitles.push("nominative masculine singular in '-er'");
                data.categories.push("Latin first and second declension " + data.pos + " with nominative masculine singular in -er");
            } else if (stem.match(/ur$/)) {
                data.subtitles.push("nominative masculine singular in '-ur'");
                data.categories.push("Latin first and second declension " + data.pos + " with nominative masculine singular in -ur");
            } else {
                throw Error(`Unrecognized '-r' stem (doesn't and in '-er' or '-ur'): ${stem}`);
            }
            original = stem;
            stem = args[1];
        }

        let us = "us";
        let a_sf = "a";
        let um = "um";
        let ae_gsf = "ae";
        let am = "am";
        let a_macron = "ā";

        if (data.types.has("greekA") || data.types.has("greekE")) {
            data.subtitles.push("Greek-type");
            data.categories.push("Latin first and second declension " + data.pos + " with Greek declension");
            if (data.types.has("greekA")) {
                us = "os";
                um = "on";
                am = "ān";
            } else {
                us = "os",
                a_sf = "ē";
                um = "on";
                ae_gsf = "ēs";
                am = "ēn";
                a_macron = "ē";
            }
        }
        data.forms.set("nom_sg_m", [original || (stem + us)]);
        data.forms.set("nom_sg_f", [stem + a_sf]);
        data.forms.set("nom_sg_n", [stem + um]);
        data.forms.set("nom_pl_m", [stem + "ī"]);
        data.forms.set("nom_pl_f", [stem + "ae"]);
        data.forms.set("nom_pl_n", [stem + "a"]);

        data.forms.set("gen_sg_m", [stem + "ī"]);
        data.forms.set("gen_sg_f", [stem + ae_gsf]);
        data.forms.set("gen_sg_n", [stem + "ī"]);
        data.forms.set("gen_pl_m", [stem + "ōrum"]);
        data.forms.set("gen_pl_f", [stem + "ārum"]);
        data.forms.set("gen_pl_n", [stem + "ōrum"]);

        data.forms.set("dat_sg_m", [stem + "ō"]);
        data.forms.set("dat_sg_f", [stem + "ae"]);
        data.forms.set("dat_sg_n", [stem + "ō"]);
        data.forms.set("dat_pl_m", [stem + "īs"]);
        data.forms.set("dat_pl_f", [stem + "īs"]);
        data.forms.set("dat_pl_n", [stem + "īs"]);

        data.forms.set("acc_sg_m", [stem + um]);
        data.forms.set("acc_sg_f", [stem + am]);
        data.forms.set("acc_sg_n", [stem + um]);
        data.forms.set("acc_pl_m", [stem + "ōs"]);
        data.forms.set("acc_pl_f", [stem + "ās"]);
        data.forms.set("acc_pl_n", [stem + "a"]);

        data.forms.set("abl_sg_m", [stem + "ō"]);
        data.forms.set("abl_sg_f", [stem + a_macron]);
        data.forms.set("abl_sg_n", [stem + "ō"]);
        data.forms.set("abl_pl_m", [stem + "īs"]);
        data.forms.set("abl_pl_f", [stem + "īs"]);
        data.forms.set("abl_pl_n", [stem + "īs"]);

        data.forms.set("voc_sg_m", [original || (stem + "e")]);
        data.forms.set("voc_sg_f", [stem + a_sf]);
        data.forms.set("voc_sg_n", [stem + um]);
        data.forms.set("voc_pl_m", [stem + "ī"]);
        data.forms.set("voc_pl_f", [stem + "ae"]);
        data.forms.set("voc_pl_n", [stem + "a"]);

        data.forms.set("loc_sg_m", [stem + "ī"]);
        data.forms.set("loc_sg_f", [stem + "ae"]);
        data.forms.set("loc_sg_n", [stem + "ī"]);
        data.forms.set("loc_pl_m", [stem + "īs"]);
        data.forms.set("loc_pl_f", [stem + "īs"]);
        data.forms.set("loc_pl_n", [stem + "īs"]);

        if (data.types.has("ius")) {
            data.subtitles.push("pronominal");
            data.categories.push("Latin first and second declension " + data.pos + " with genitive singular in -ī̆us");
            data.forms.set("gen_sg_m", [stem + "ī̆us"]);
            data.forms.set("gen_sg_f", [stem + "ī̆us"]);
            data.forms.set("gen_sg_n", [stem + "ī̆us"]);
            data.forms.set("dat_sg_m", [stem + "ī"]);
            data.forms.set("dat_sg_f", [stem + "ī"]);
            data.forms.set("dat_sg_n", [stem + "ī"]);
        } else if (data.types.has("not_ius")) {
            data.subtitles.push("non-pronominal");
        }

        if (stem == "me") {
            data.forms.set("voc_sg_m", ["mī"]);
        }

        if (data.types.has("ic")) {
            data.subtitles.push("'hic'-type");
            let oc = "oc";
            let oc_macron = "ōc";
            if (stem == "ill") {
                oc = "uc";
                oc_macron = "ūc";
            }

            data.forms.set("nom_sg_m", [stem + "ic"]);
            data.forms.set("nom_sg_f", [stem + "aec"]);
            data.forms.set("nom_sg_n", [stem + oc]);
            data.forms.set("nom_pl_n", [stem + "aec"]);

            data.forms.set("gen_sg_m", [stem + "uius"]);
            data.forms.set("gen_sg_f", [stem + "uius"]);
            data.forms.set("gen_sg_n", [stem + "uius"]);

            data.forms.set("dat_sg_m", [stem + "uic"]);
            data.forms.set("dat_sg_f", [stem + "uic"]);
            data.forms.set("dat_sg_n", [stem + "uic"]);

            data.forms.set("acc_sg_m", [stem + "unc"]);
            data.forms.set("acc_sg_f", [stem + "anc"]);
            data.forms.set("acc_sg_n", [stem + oc]);
            data.forms.set("acc_pl_n", [stem + "aec"]);

            data.forms.set("abl_sg_m", [stem + "ōc"]);
            data.forms.set("abl_sg_f", [stem + "āc"]);
            data.forms.set("abl_sg_n", [stem + oc_macron]);

            data.voc = false;
        }

        data.categories.push("Latin first and second declension " + data.pos);
    }],
    ["1-1", (data, args) => {
        data.title = "first-declension " + singularize(data.pos);
        data.subtitles.push("masculine and neuter forms identical to feminine forms");
        const stem = args[0];
        data.forms.set("nom_sg_m", [stem + "a"]);
        data.forms.set("nom_pl_m", [stem + "ae"]);

        data.forms.set("gen_sg_m", [stem + "ae"]);
        data.forms.set("gen_pl_m", [stem + "ārum"]);

        data.forms.set("dat_sg_m", [stem + "ae"]);
        data.forms.set("dat_pl_m", [stem + "īs"]);

        data.forms.set("acc_sg_m", [stem + "am"]);
        data.forms.set("acc_sg_n", [stem + "a"]);
        data.forms.set("acc_pl_m", [stem + "ās"]);
        data.forms.set("acc_pl_n", [stem + "ae"]);

        data.forms.set("abl_sg_m", [stem + "ā"]);
        data.forms.set("abl_pl_m", [stem + "īs"]);

        data.forms.set("loc_sg_m", [stem + "ae"]);
        data.forms.set("loc_pl_m", [stem + "īs"]);

        data.forms.set("voc_sg_m", [stem + "a"]);
        data.forms.set("voc_pl_m", [stem + "ae"]);

        data.categories.push("Latin first declension " + data.pos);
    }],
    ["2-2", (data, args) => {
        data.title = "second-declension " + singularize(data.pos);
        data.subtitles.push("feminine forms identical to masculine forms");

        const stem = args[0];

        let us = "us";
        let um = "um";
        let i_pl = "ī";

        if (data.types.has("greek")) {
            data.subtitles.push("Greek-type");
            data.categories.push("Latin second declension " + data.pos + " with Greek declension");
            us = "os";
            um = "on";
            i_pl = "oe";
        }

        data.forms.set("nom_sg_m", [stem + us]);
        data.forms.set("nom_sg_n", [stem + um]);
        data.forms.set("nom_pl_m", [stem + i_pl]);
        data.forms.set("nom_pl_n", [stem + "a"]);

        data.forms.set("gen_sg_m", [stem + "ī"]);
        data.forms.set("gen_sg_n", [stem + "ī"]);
        data.forms.set("gen_pl_m", [stem + "ōrum"]);
        data.forms.set("gen_pl_n", [stem + "ōrum"]);

        data.forms.set("dat_sg_m", [stem + "ō"]);
        data.forms.set("dat_sg_n", [stem + "ō"]);
        data.forms.set("dat_pl_m", [stem + "īs"]);
        data.forms.set("dat_pl_n", [stem + "īs"]);

        data.forms.set("acc_sg_m", [stem + um]);
        data.forms.set("acc_sg_n", [stem + um]);
        data.forms.set("acc_pl_m", [stem + "ōs"]);
        data.forms.set("acc_pl_n", [stem + "a"]);

        data.forms.set("abl_sg_m", [stem + "ō"]);
        data.forms.set("abl_sg_n", [stem + "ō"]);
        data.forms.set("abl_pl_m", [stem + "īs"]);
        data.forms.set("abl_pl_n", [stem + "īs"]);

        data.forms.set("loc_sg_m", [stem + "ī"]);
        data.forms.set("loc_sg_n", [stem + "ī"]);
        data.forms.set("loc_pl_m", [stem + "īs"]);
        data.forms.set("loc_pl_n", [stem + "īs"]);

        data.forms.set("voc_sg_m", [stem + "e"]);
        data.forms.set("voc_sg_n", [stem + um]);
        data.forms.set("voc_pl_m", [stem + i_pl]);
        data.forms.set("voc_pl_n", [stem + "a"]);

        data.categories.push("Latin second declension " + data.pos);
    }],
    ["3-1", (data, args) => {
        const singpos = singularize(data.pos);
        if (data.gender) {
            data.title = "third-declension " + singpos;
        } else {
            data.title = "third-declension one-termination " + singpos;
        }

        const stem1 = args[0];
        const stem2 = args[1];

        data.forms.set("nom_sg_m", [stem1]);
        data.forms.set("nom_sg_n", [stem1]);
        data.forms.set("nom_pl_m", [stem2 + "ēs"]);
        data.forms.set("nom_pl_n", [stem2 + "ia"]);

        data.forms.set("gen_sg_m", [stem2 + "is"]);
        data.forms.set("gen_sg_n", [stem2 + "is"]);
        data.forms.set("gen_pl_m", [stem2 + "ium"]);
        data.forms.set("gen_pl_n", [stem2 + "ium"]);

        data.forms.set("dat_sg_m", [stem2 + "ī"]);
        data.forms.set("dat_sg_n", [stem2 + "ī"]);
        data.forms.set("dat_pl_m", [stem2 + "ibus"]);
        data.forms.set("dat_pl_n", [stem2 + "ibus"]);

        data.forms.set("acc_sg_m", [stem2 + "em"]);
        data.forms.set("acc_sg_n", [stem1]);
        data.forms.set("acc_pl_m", [stem2 + "ēs"]);
        data.forms.set("acc_pl_n", [stem2 + "ia"]);

        data.forms.set("abl_sg_m", [stem2 + "ī"]);
        data.forms.set("abl_sg_n", [stem2 + "ī"]);
        data.forms.set("abl_pl_m", [stem2 + "ibus"]);
        data.forms.set("abl_pl_n", [stem2 + "ibus"]);

        data.forms.set("loc_sg_m", [stem2 + "ī"]);
        data.forms.set("loc_sg_n", [stem2 + "ī"]);
        data.forms.set("loc_pl_m", [stem2 + "ibus"]);
        data.forms.set("loc_pl_n", [stem2 + "ibus"]);

        data.forms.set("voc_sg_m", [stem1]);
        data.forms.set("voc_sg_n", [stem1]);
        data.forms.set("voc_pl_m", [stem2 + "ēs"]);
        data.forms.set("voc_pl_n", [stem2 + "ia"]);

        if (data.types.has("par")) {
            data.subtitles.push("non-i-stem");

            data.forms.set("nom_pl_n", [stem2 + "a"]);
            data.forms.set("gen_pl_m", [stem2 + "um"]);
            data.forms.set("gen_pl_n", [stem2 + "um"]);
            data.forms.set("abl_sg_m", [stem2 + "e"]);
            data.forms.set("abl_sg_n", [stem2 + "e"]);
            data.forms.set("loc_sg_m", [stem2 + "ī", stem2 + "e"]);
            data.forms.set("loc_sg_n", [stem2 + "ī", stem2 + "e"]);
            data.forms.set("acc_pl_n", [stem2 + "a"]);
            data.forms.set("voc_pl_n", [stem2 + "a"]);
        } else if (data.types.has("not_par")) {
            data.subtitles.push("i-stem");
        }

        const es_base = stem1.match(/^(.*)ēs$/);
        if (es_base && es_base[1] == stem2) {
            if (data.types.has("greek")) {
                const note = "It is unknown if Classical Latin preserved (or would have preserved) the shortness of the original Greek short ending.";
                data.forms.set("nom_sg_n", [stem2 + "es", stem2 + "ēs"]);
                data.notes.set("nom_sg_n1", note);
                data.forms.set("acc_sg_n", [stem2 + "es", stem2 + "ēs"]);
                data.notes.set("acc_sg_n1", note);
                data.forms.set("voc_sg_m", [stem2 + "es", stem2 + "ēs"]);
                data.notes.set("voc_sg_m1", note);
                data.forms.set("voc_sg_n", [stem2 + "es", stem2 + "ēs"]);
                data.notes.set("voc_sg_n1", note);
                data.subtitles.push("Greek-type");
            } else if (data.types.has("not_greek")) {
                data.subtitles.push("non-Greek-type");
            }
        }

        data.categories.push("Latin third declension " + data.pos);
        data.categories.push("Latin third declension " + data.pos + " of one termination");
    }],
    ["3-C", (data, args) => {
        const stem = args[0];
        data.types.add("par");
        const d = m_adj_decl.get("3-1");
        if (!d) {
            throw Error("Decl 3-1 not ready");
        }
        d(data, [stem + "or", stem + "ōr"]);
        data.title = "third-declension comparative " + singularize(data.pos);
        data.subtitles = [];
        data.forms.set("nom_sg_n", [stem + "us"]);
        data.forms.set("acc_sg_n", [stem + "us"]);
        data.forms.set("voc_sg_n", [stem + "us"]);

    }],
    ["3-P", (data, args) => {
        const stem1 = args[0];
        const stem2 = args[1];

        const d = m_adj_decl.get("3-1");
        if (!d) {
            throw Error("Decl 3-1 not ready");
        }
        d(data, args);
        data.title = "third-declension participle";
        data.forms.set("abl_sg_m", [stem2 + "e", stem2 + "ī"]);
        data.notes.set("abl_sg_m2", "When used purely as an adjective.");
        data.forms.set("abl_sg_n", [stem2 + "e", stem2 + "ī"]);
        data.notes.set("abl_sg_n2", "When used purely as an adjective.");
        data.forms.set("acc_pl_m", [stem2 + "ēs", stem2 + "īs"]);
    }],
    ["3-2", (data, args) => {
        const singpos = singularize(data.pos);
        if (data.gender) {
            data.title = "third-declension " + singpos;
        } else {
            data.title = "third-declension two-termination " + singpos;
        }

        const stem = args[0];
        const stem2 = args[1];

        data.forms.set("nom_sg_m", [stem + "is"]);
        data.forms.set("nom_sg_n", [stem + "e"]);
        data.forms.set("nom_pl_m", [stem + "ēs"]);
        data.forms.set("nom_pl_n", [stem + "ia"]);

        data.forms.set("gen_sg_m", [stem + "is"]);
        data.forms.set("gen_sg_n", [stem + "is"]);
        data.forms.set("gen_pl_m", [stem + "ium"]);
        data.forms.set("gen_pl_n", [stem + "ium"]);

        data.forms.set("dat_sg_m", [stem + "ī"]);
        data.forms.set("dat_sg_n", [stem + "ī"]);
        data.forms.set("dat_pl_m", [stem + "ibus"]);
        data.forms.set("dat_pl_n", [stem + "ibus"]);

        data.forms.set("acc_sg_m", [stem + "em"]);
        data.forms.set("acc_sg_n", [stem + "e"]);
        data.forms.set("acc_pl_m", [stem + "ēs", stem + "īs"]);
        data.forms.set("acc_pl_n", [stem + "ia"]);

        data.forms.set("abl_sg_m", [stem + "ī"]);
        data.forms.set("abl_sg_n", [stem + "ī"]);
        data.forms.set("abl_pl_m", [stem + "ibus"]);
        data.forms.set("abl_pl_n", [stem + "ibus"]);

        data.forms.set("loc_sg_m", [stem + "ī"]);
        data.forms.set("loc_sg_n", [stem + "ī"]);
        data.forms.set("loc_pl_m", [stem + "ibus"]);
        data.forms.set("loc_pl_n", [stem + "ibus"]);

        data.forms.set("voc_sg_m", [stem + "is"]);
        data.forms.set("voc_sg_n", [stem + "e"]);
        data.forms.set("voc_pl_m", [stem + "ēs"]);
        data.forms.set("voc_pl_n", [stem + "ia"]);

        data.categories.push("Latin third declension " + data.pos);
        data.categories.push("Latin third declension " + data.pos + " of two terminations");
    }],
    ["3-3", (data, args) => {
        const singpos = singularize(data.pos);
        if (data.gender) {
            data.title = "third-declension " + singpos;
        } else {
            data.title = "third-declension three-termination " + singpos;
        }

        const stem1 = args[0];
        const stem2 = args[1];

        data.forms.set("nom_sg_m", [stem1]);
        data.forms.set("nom_sg_f", [stem2 + "is"]);
        data.forms.set("nom_sg_n", [stem2 + "e"]);
        data.forms.set("nom_pl_m", [stem2 + "ēs"]);
        data.forms.set("nom_pl_f", [stem2 + "ēs"]);
        data.forms.set("nom_pl_n", [stem2 + "ia"]);

        data.forms.set("gen_sg_m", [stem2 + "is"]);
        data.forms.set("gen_sg_f", [stem2 + "is"]);
        data.forms.set("gen_sg_n", [stem2 + "is"]);
        data.forms.set("gen_pl_m", [stem2 + "ium"]);
        data.forms.set("gen_pl_f", [stem2 + "ium"]);
        data.forms.set("gen_pl_n", [stem2 + "ium"]);

        data.forms.set("dat_sg_m", [stem2 + "ī"]);
        data.forms.set("dat_sg_f", [stem2 + "ī"]);
        data.forms.set("dat_sg_n", [stem2 + "ī"]);
        data.forms.set("dat_pl_m", [stem2 + "ibus"]);
        data.forms.set("dat_pl_f", [stem2 + "ibus"]);
        data.forms.set("dat_pl_n", [stem2 + "ibus"]);

        data.forms.set("acc_sg_m", [stem2 + "em"]);
        data.forms.set("acc_sg_f", [stem2 + "em"]);
        data.forms.set("acc_sg_n", [stem2 + "e"]);
        data.forms.set("acc_pl_m", [stem2 + "ēs"]);
        data.forms.set("acc_pl_f", [stem2 + "ēs"]);
        data.forms.set("acc_pl_n", [stem2 + "ia"]);

        data.forms.set("abl_sg_m", [stem2 + "ī"]);
        data.forms.set("abl_sg_f", [stem2 + "ī"]);
        data.forms.set("abl_sg_n", [stem2 + "ī"]);
        data.forms.set("abl_pl_m", [stem2 + "ibus"]);
        data.forms.set("abl_pl_f", [stem2 + "ibus"]);
        data.forms.set("abl_pl_n", [stem2 + "ibus"]);

        data.forms.set("loc_sg_m", [stem2 + "ī"]);
        data.forms.set("loc_sg_f", [stem2 + "ī"]);
        data.forms.set("loc_sg_n", [stem2 + "ī"]);
        data.forms.set("loc_pl_m", [stem2 + "ibus"]);
        data.forms.set("loc_pl_f", [stem2 + "ibus"]);
        data.forms.set("loc_pl_n", [stem2 + "ibus"]);

        data.forms.set("voc_sg_m", [stem1]);
        data.forms.set("voc_sg_f", [stem2 + "is"]);
        data.forms.set("voc_sg_n", [stem2 + "e"]);
        data.forms.set("voc_pl_m", [stem2 + "ēs"]);
        data.forms.set("voc_pl_f", [stem2 + "ēs"]);
        data.forms.set("voc_pl_n", [stem2 + "ia"]);

        data.categories.push("Latin third declension " + data.pos);
        data.categories.push("Latin third declension " + data.pos + " of three terminations");
    }],
    ["irreg", (data, args) => {
        if (args[0] == "duo" || args[0] == "ambō") {
            const stem = args[0] == "duo" ? "du" : "amb";
            data.title = (stem == "amb") ? "irregular adjective" : "numeral";
            data.num = NumberTantum.Plural;

            const stem_with_o = stem + (stem == "amb" ? "ō" : "o");
            data.forms.set("nom_pl_m", [stem_with_o]);
            data.forms.set("nom_pl_f", [stem + "ae"]);
            data.forms.set("nom_pl_n", [stem_with_o]);

            data.forms.set("gen_pl_m", [stem + "ōrum"]);
            data.forms.set("gen_pl_f", [stem + "ārum"]);
            data.forms.set("gen_pl_n", [stem + "ōrum"]);

            data.forms.set("dat_pl_m", [stem + "ōbus"]);
            data.forms.set("dat_pl_f", [stem + "ābus"]);
            data.forms.set("dat_pl_n", [stem + "ōbus"]);

            data.forms.set("acc_pl_m", [stem + "ōs", stem_with_o]);
            data.forms.set("acc_pl_f", [stem + "ās"]);
            data.forms.set("acc_pl_n", [stem_with_o]);

            data.forms.set("abl_pl_m", [stem + "ōbus"]);
            data.forms.set("abl_pl_f", [stem + "ābus"]);
            data.forms.set("abl_pl_n", [stem + "ōbus"]);

            data.forms.set("voc_pl_m", [stem_with_o]);
            data.forms.set("voc_pl_f", [stem + "ae"]);
            data.forms.set("voc_pl_n", [stem_with_o]);

            if (stem == "du") {
                data.footnote = "Note: The genitive masculine and neuter can also be found in the contracted form 'duum' (also spelt 'duûm').";
            }
        } else if (args[0] == "mīlle") {
            data.title = "semi-indeclinable numeral";
            data.forms.set("nom_sg_m", ["mīlle"]);
            data.forms.set("nom_pl_m", ["mīlia", "mīllia"]);

            data.forms.set("gen_sg_m", ["mīlle"]);
            data.forms.set("gen_pl_m", ["mīlium", "mīllium"]);

            data.forms.set("dat_sg_m", ["mīlle"]);
            data.forms.set("dat_pl_m", ["mīlibus", "mīllibus"]);

            data.forms.set("acc_sg_m", ["mīlle"]);
            data.forms.set("acc_pl_m", ["mīlia", "mīllia"]);

            data.forms.set("abl_sg_m", ["mīlle"]);
            data.forms.set("abl_pl_m", ["mīlibus", "mīllibus"]);

            data.forms.set("voc_sg_m", ["mīlle"]);
            data.forms.set("voc_pl_m", ["mīlia", "mīllia"]);
        } else if (args[0] == "plūs") {
            data.title = "irregular third-declension comparative adjective";

            data.forms.set("nom_sg_m", [""]);
            data.forms.set("nom_sg_n", ["plūs"]);
            data.forms.set("nom_pl_m", ["plūrēs"]);
            data.forms.set("nom_pl_n", ["plūra"]);

            data.forms.set("gen_sg_m", [""]);
            data.forms.set("gen_sg_n", ["plūris"]);
            data.forms.set("gen_pl_m", ["plūrium"]);
            data.forms.set("gen_pl_n", ["plūrium"]);

            data.forms.set("dat_sg_m", [""]);
            data.forms.set("dat_sg_n", [""]);
            data.forms.set("dat_pl_m", ["plūribus"]);
            data.forms.set("dat_pl_n", ["plūribus"]);

            data.forms.set("acc_sg_m", [""]);
            data.forms.set("acc_sg_n", ["plūs"]);
            data.forms.set("acc_pl_m", ["plūrēs"]);
            data.forms.set("acc_pl_n", ["plūra"]);

            data.forms.set("abl_sg_m", [""]);
            data.forms.set("abl_sg_n", ["plūre"]);
            data.forms.set("abl_pl_m", ["plūribus"]);
            data.forms.set("abl_pl_n", ["plūribus"]);

            data.forms.set("voc_sg_m", [""]);
            data.forms.set("voc_sg_n", ["plūs"]);
            data.forms.set("voc_pl_m", ["plūrēs"]);
            data.forms.set("voc_pl_n", ["plūra"]);

            data.footnote = "Note: Singular forms take the genitive of the whole and do not function as adjectives.";
            data.categories.push("Latin third declension " + data.pos);
            data.categories.push("Latin third declension " + data.pos + " of one termination");
        } else if (args[0] == "is" || args[0] == "īdem") {
            data.title = "demonstrative pronoun";
            const note1 = "The dat. singular is found spelled EIEI (here represented as 'ēī') and scanned as two longs in Plautus, but also as a monosyllable. The latter is its normal scansion in Classical. Other spellings include EEI, IEI.";
            const note2 = "The nom./dat./abl. plural forms regularly developed into a monosyllable  /iː(s)/, with later remodelling - compare the etymology of deus. This /iː/ was normally spelled as EI during and as II after the Republic; a disyllabic 'iī', spelled II, Iꟾ, apears in Silver Age poetry, while disyllabic 'eīs' is only post-Classical. Other spellings include EEI(S), EIEI(S), IEI(S).";

            data.forms.set("nom_sg_m", ["is"]);
            data.forms.set("nom_sg_f", ["ea"]);
            data.forms.set("nom_sg_n", ["id"]);
            data.forms.set("nom_pl_m", ["ī", "iī", "eī"]);
            data.notes.set("nom_pl_m1", note2);
            data.forms.set("nom_pl_f", ["eae"]);
            data.forms.set("nom_pl_n", ["ea"]);

            data.forms.set("gen_sg_m", ["eius"]);
            data.forms.set("gen_sg_f", ["eius"]);
            data.forms.set("gen_sg_n", ["eius"]);
            data.forms.set("gen_pl_m", ["eōrum"]);
            data.forms.set("gen_pl_f", ["eārum"]);
            data.forms.set("gen_pl_n", ["eōrum"]);

            data.forms.set("dat_sg_m", ["ei", "ēī"]);
            data.notes.set("dat_sg_m1", note1);
            data.forms.set("dat_sg_f", ["ei", "ēī"]);
            data.notes.set("dat_sg_f1", note1);
            data.forms.set("dat_sg_n", ["ei", "ēī"]);
            data.notes.set("dat_sg_n1", note1);
            data.forms.set("dat_pl_m", ["īs", "iīs", "eīs"]);
            data.notes.set("dat_pl_m1", note2);
            data.forms.set("dat_pl_f", ["īs", "iīs", "eīs"]);
            data.notes.set("dat_pl_f1", note2);
            data.forms.set("dat_pl_n", ["īs", "iīs", "eīs"]);
            data.notes.set("dat_pl_n1", note2);

            data.forms.set("acc_sg_m", ["eum"]);
            data.forms.set("acc_sg_f", ["eam"]);
            data.forms.set("acc_sg_n", ["id"]);
            data.forms.set("acc_pl_m", ["eōs"]);
            data.forms.set("acc_pl_f", ["eās"]);
            data.forms.set("acc_pl_n", ["ea"]);

            data.forms.set("abl_sg_m", ["eō"]);
            data.forms.set("abl_sg_f", ["eā"]);
            data.forms.set("abl_sg_n", ["eō"]);
            data.forms.set("abl_pl_m", ["īs", "iīs", "eīs"]);
            data.notes.set("abl_pl_m1", note2);
            data.forms.set("abl_pl_f", ["īs", "iīs", "eīs"]);
            data.notes.set("abl_pl_f1", note2);
            data.forms.set("abl_pl_n", ["īs", "iīs", "eīs"]);
            data.notes.set("abl_pl_n1", note2);

            data.voc = false;

            if (args[0] == "īdem") {
                data.forms.set("nom_sg_m", ["ī"]);
                data.forms.set("nom_sg_n", ["i"]);
                data.forms.set("nom_pl_m", ["ī"]);

                data.forms.set("gen_pl_m", ["eōrun", "eōrum"]);
                data.forms.set("gen_pl_f", ["eārun", "eārum"]);
                data.forms.set("gen_pl_n", ["eōrun", "eōrum"]);

                data.forms.set("acc_sg_m", ["eun", "eum"]);
                data.forms.set("acc_sg_f", ["ean", "eam"]);
                data.forms.set("acc_sg_n", ["i"]);
            }
        } else if (args[0] == "ille") {
            data.types.add("ius");
            const d = m_adj_decl.get("1&2");
            if (!d) {
                throw Error("Decl 1&2 not ready");
            }

            d(data, ["ill"]);

            data.title = "demonstrative pronoun";

            data.forms.set("nom_sg_m", ["ille"]);
            data.forms.set("nom_sg_n", ["illud"]);

            data.forms.set("acc_sg_n", ["illud"]);

            data.voc = false;
            data.categories = [];
        } else if (args[0] == "iste") {
            data.types.add("ius");
            const d = m_adj_decl.get("1&2");
            if (!d) {
                throw Error("Decl 1&2 not ready");
            }

            d(data, ["ist"]);

            data.title = "demonstrative pronoun";

            data.forms.set("nom_sg_m", ["iste"]);
            data.forms.set("nom_sg_n", ["istud"]);

            data.forms.set("acc_sg_n", ["istud"]);

            data.voc = false;

            data.categories = [];
        } else if (args[0] == "ipse") {
            data.types.add("ius");
            const d = m_adj_decl.get("1&2");
            if (!d) {
                throw Error("Decl 1&2 not ready");
            }

            d(data, ["ips"]);

            data.title = "demonstrative pronoun";

            data.forms.set("nom_sg_m", ["ipse"]);
            data.forms.set("nom_sg_n", ["ipsum"]);

            data.forms.set("acc_sg_n", ["ipsum"]);

            data.voc = false;

            data.categories = [];
        } else if (args[0] == "quis" || args[0] == "quī") {
            let id = "id";
            let em = "em";
            let o = "ō";

            if (args[0] == "quī") {
                id = "od";
                em = "am";
                o = "ā";
            }
            data.title = "relative/interrogative pronoun";

            data.forms.set("nom_sg_m", ["quis"]);
            data.forms.set("nom_sg_f", ["quis", "quae"]);
            data.forms.set("nom_sg_n", ["qu" + id]);
            data.forms.set("nom_pl_m", ["quī"]);
            data.forms.set("nom_pl_f", ["quae"]);
            data.forms.set("nom_pl_n", ["quae"]);

            data.forms.set("gen_sg_m", ["cuius"]);
            data.forms.set("gen_sg_f", ["cuius"]);
            data.forms.set("gen_sg_n", ["cuius"]);
            data.forms.set("gen_pl_m", ["quōrum"]);
            data.forms.set("gen_pl_f", ["quārum"]);
            data.forms.set("gen_pl_n", ["quōrum"]);

            data.forms.set("dat_sg_m", ["cui"]);
            data.forms.set("dat_sg_f", ["cui"]);
            data.forms.set("dat_sg_n", ["cui"]);
            data.forms.set("dat_pl_m", ["quibus", "quīs"]);
            data.forms.set("dat_pl_f", ["quibus", "quīs"]);
            data.forms.set("dat_pl_n", ["quibus", "quīs"]);

            data.forms.set("acc_sg_m", ["quem"]);
            data.forms.set("acc_sg_f", ["qu" + em, "quam"]);
            data.forms.set("acc_sg_n", ["qu" + id]);
            data.forms.set("acc_pl_m", ["quōs"]);
            data.forms.set("acc_pl_f", ["quās"]);
            data.forms.set("acc_pl_n", ["quae"]);

            data.forms.set("abl_sg_m", ["quō"]);
            data.forms.set("abl_sg_f", ["qu" + o, "quā"]);
            data.forms.set("abl_sg_n", ["quō"]);
            data.forms.set("abl_pl_m", ["quibus", "quīs"]);
            data.forms.set("abl_pl_f", ["quibus", "quīs"]);
            data.forms.set("abl_pl_n", ["quibus", "quīs"]);

            data.voc = false;

            if (args[0] == "quī") {
                data.forms.set("nom_sg_m", ["quī"]);
                data.forms.set("nom_sg_f", ["quae"]);
            }
        } else if (args[0] == "quisquis") {
            data.title = "relative/interrogative pronoun";
            data.forms.set("nom_sg_m", ["quisquis"]);
            data.forms.set("nom_sg_f", ["quisquis"]);
            data.forms.set("nom_sg_n", ["quidquid", "quicquid"]);
            data.forms.set("nom_pl_m", ["quīquī"]);
            data.forms.set("nom_pl_f", ["quaequae"]);
            data.forms.set("nom_pl_n", ["quaequae"]);

            data.forms.set("gen_sg_m", ["cuiuscuius"]);
            data.forms.set("gen_sg_f", ["cuiuscuius"]);
            data.forms.set("gen_sg_n", ["cuiuscuius"]);
            data.forms.set("gen_pl_m", ["quōrumquōrum"]);
            data.forms.set("gen_pl_f", ["quārumquārum"]);
            data.forms.set("gen_pl_n", ["quōrumquōrum"]);

            data.forms.set("dat_sg_m", ["cuicui"]);
            data.forms.set("dat_sg_f", ["cuicui"]);
            data.forms.set("dat_sg_n", ["cuicui"]);
            data.forms.set("dat_pl_m", ["quibusquibus", "quīsquīs"]);
            data.forms.set("dat_pl_f", ["quibusquibus", "quīsquīs"]);
            data.forms.set("dat_pl_n", ["quibusquibus", "quīsquīs"]);

            data.forms.set("acc_sg_m", ["quemquem"]);
            data.forms.set("acc_sg_f", ["quamquam"]);
            data.forms.set("acc_sg_n", ["quidquid", "quicquid"]);
            data.forms.set("acc_pl_m", ["quōsquōs"]);
            data.forms.set("acc_pl_f", ["quāsquās"]);
            data.forms.set("acc_pl_n", ["quaequae"]);

            data.forms.set("abl_sg_m", ["quōquō"]);
            data.forms.set("abl_sg_f", ["quāquā"]);
            data.forms.set("abl_sg_n", ["quōquō"]);
            data.forms.set("abl_pl_m", ["quibusquibus", "quīsquīs"]);
            data.forms.set("abl_pl_f", ["quibusquibus", "quīsquīs"]);
            data.forms.set("abl_pl_n", ["quibusquibus", "quīsquīs"]);

            data.forms.set("voc_sg_m", ["quisquis"]);
            data.forms.set("voc_sg_f", ["quisquis"]);
            data.forms.set("voc_sg_n", ["quidquid", "quicquid"]);
            data.forms.set("voc_pl_m", ["quīquī"]);
            data.forms.set("voc_pl_f", ["quaequae"]);
            data.forms.set("voc_pl_n", ["quaequae"]);

            data.voc = true;
        } else {
            throw Error(`Adjective '${args[0]}' not recognized`);
        }
    }],
]);

function singularize(plural: string): string {
    if (plural.match(/xes$/) || plural.match(/[cs]hes$/)) {
        return plural.replace(/es$/, "");
    } else {
        return plural.replace(/s$/, "");
    }
}
