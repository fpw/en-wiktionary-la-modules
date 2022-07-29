/**
 * This is a complete re-implementation of Wiktionary's Module:la-adj/data, developed by Benwing2.
 * It was converted from Lua to TypeScript by Folke Will <folko@solhost.org>.
 *
 * Original source: https://en.wiktionary.org/wiki/Module:la-adj/data
 * Based on version: https://en.wiktionary.org/w/index.php?title=Module:la-adj/data&oldid=63799019
 *
 * Lua idioms, function and variable names kept as in the original in order to easily
 * backport later changes to this implementation.
 *
 * For that reason, it's suggested to add a type-aware wrapper around this class and leave
 * this code unchanged instead of improving the types and use of idioms in this class.
 *
 */
import { NumberTantum, SegmentData } from "./LaNominal";
import { setNominalForm } from "./NominalForm";

export const m_adj_decl: Map<string, ((data: SegmentData, args: string[]) => void)> = new Map([
    ["0", (data, args) => {
        data.title = "indeclinable " + singularize(data.pos);
        const stem = args[0];

        setNominalForm(data.forms, "nom_sg_m", [stem]);
        setNominalForm(data.forms, "nom_pl_m", [stem]);

        setNominalForm(data.forms, "gen_sg_m", [stem]);
        setNominalForm(data.forms, "gen_pl_m", [stem]);

        setNominalForm(data.forms, "dat_sg_m", [stem]);
        setNominalForm(data.forms, "dat_pl_m", [stem]);

        setNominalForm(data.forms, "acc_sg_m", [stem]);
        setNominalForm(data.forms, "acc_pl_m", [stem]);

        setNominalForm(data.forms, "abl_sg_m", [stem]);
        setNominalForm(data.forms, "abl_pl_m", [stem]);

        setNominalForm(data.forms, "loc_sg_m", [stem]);
        setNominalForm(data.forms, "loc_pl_m", [stem]);

        setNominalForm(data.forms, "voc_sg_m", [stem]);
        setNominalForm(data.forms, "voc_pl_m", [stem]);

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
        setNominalForm(data.forms, "nom_sg_m", [original || (stem + us)]);
        setNominalForm(data.forms, "nom_sg_f", [stem + a_sf]);
        setNominalForm(data.forms, "nom_sg_n", [stem + um]);
        setNominalForm(data.forms, "nom_pl_m", [stem + "ī"]);
        setNominalForm(data.forms, "nom_pl_f", [stem + "ae"]);
        setNominalForm(data.forms, "nom_pl_n", [stem + "a"]);

        setNominalForm(data.forms, "gen_sg_m", [stem + "ī"]);
        setNominalForm(data.forms, "gen_sg_f", [stem + ae_gsf]);
        setNominalForm(data.forms, "gen_sg_n", [stem + "ī"]);
        setNominalForm(data.forms, "gen_pl_m", [stem + "ōrum"]);
        setNominalForm(data.forms, "gen_pl_f", [stem + "ārum"]);
        setNominalForm(data.forms, "gen_pl_n", [stem + "ōrum"]);

        setNominalForm(data.forms, "dat_sg_m", [stem + "ō"]);
        setNominalForm(data.forms, "dat_sg_f", [stem + "ae"]);
        setNominalForm(data.forms, "dat_sg_n", [stem + "ō"]);
        setNominalForm(data.forms, "dat_pl_m", [stem + "īs"]);
        setNominalForm(data.forms, "dat_pl_f", [stem + "īs"]);
        setNominalForm(data.forms, "dat_pl_n", [stem + "īs"]);

        setNominalForm(data.forms, "acc_sg_m", [stem + um]);
        setNominalForm(data.forms, "acc_sg_f", [stem + am]);
        setNominalForm(data.forms, "acc_sg_n", [stem + um]);
        setNominalForm(data.forms, "acc_pl_m", [stem + "ōs"]);
        setNominalForm(data.forms, "acc_pl_f", [stem + "ās"]);
        setNominalForm(data.forms, "acc_pl_n", [stem + "a"]);

        setNominalForm(data.forms, "abl_sg_m", [stem + "ō"]);
        setNominalForm(data.forms, "abl_sg_f", [stem + a_macron]);
        setNominalForm(data.forms, "abl_sg_n", [stem + "ō"]);
        setNominalForm(data.forms, "abl_pl_m", [stem + "īs"]);
        setNominalForm(data.forms, "abl_pl_f", [stem + "īs"]);
        setNominalForm(data.forms, "abl_pl_n", [stem + "īs"]);

        setNominalForm(data.forms, "voc_sg_m", [original || (stem + "e")]);
        setNominalForm(data.forms, "voc_sg_f", [stem + a_sf]);
        setNominalForm(data.forms, "voc_sg_n", [stem + um]);
        setNominalForm(data.forms, "voc_pl_m", [stem + "ī"]);
        setNominalForm(data.forms, "voc_pl_f", [stem + "ae"]);
        setNominalForm(data.forms, "voc_pl_n", [stem + "a"]);

        setNominalForm(data.forms, "loc_sg_m", [stem + "ī"]);
        setNominalForm(data.forms, "loc_sg_f", [stem + "ae"]);
        setNominalForm(data.forms, "loc_sg_n", [stem + "ī"]);
        setNominalForm(data.forms, "loc_pl_m", [stem + "īs"]);
        setNominalForm(data.forms, "loc_pl_f", [stem + "īs"]);
        setNominalForm(data.forms, "loc_pl_n", [stem + "īs"]);

        if (data.types.has("ius")) {
            data.subtitles.push("pronominal");
            data.categories.push("Latin first and second declension " + data.pos + " with genitive singular in -ī̆us");
            setNominalForm(data.forms, "gen_sg_m", [stem + "ī̆us"]);
            setNominalForm(data.forms, "gen_sg_f", [stem + "ī̆us"]);
            setNominalForm(data.forms, "gen_sg_n", [stem + "ī̆us"]);
            setNominalForm(data.forms, "dat_sg_m", [stem + "ī"]);
            setNominalForm(data.forms, "dat_sg_f", [stem + "ī"]);
            setNominalForm(data.forms, "dat_sg_n", [stem + "ī"]);
        } else if (data.types.has("not_ius")) {
            data.subtitles.push("non-pronominal");
        }

        if (stem == "me") {
            setNominalForm(data.forms, "voc_sg_m", ["mī"]);
        }

        if (data.types.has("ic")) {
            data.subtitles.push("'hic'-type");
            let oc = "oc";
            let oc_macron = "ōc";
            if (stem == "ill") {
                oc = "uc";
                oc_macron = "ūc";
            }

            setNominalForm(data.forms, "nom_sg_m", [stem + "ic"]);
            setNominalForm(data.forms, "nom_sg_f", [stem + "aec"]);
            setNominalForm(data.forms, "nom_sg_n", [stem + oc]);
            setNominalForm(data.forms, "nom_pl_n", [stem + "aec"]);

            setNominalForm(data.forms, "gen_sg_m", [stem + "uius"]);
            setNominalForm(data.forms, "gen_sg_f", [stem + "uius"]);
            setNominalForm(data.forms, "gen_sg_n", [stem + "uius"]);

            setNominalForm(data.forms, "dat_sg_m", [stem + "uic"]);
            setNominalForm(data.forms, "dat_sg_f", [stem + "uic"]);
            setNominalForm(data.forms, "dat_sg_n", [stem + "uic"]);

            setNominalForm(data.forms, "acc_sg_m", [stem + "unc"]);
            setNominalForm(data.forms, "acc_sg_f", [stem + "anc"]);
            setNominalForm(data.forms, "acc_sg_n", [stem + oc]);
            setNominalForm(data.forms, "acc_pl_n", [stem + "aec"]);

            setNominalForm(data.forms, "abl_sg_m", [stem + "ōc"]);
            setNominalForm(data.forms, "abl_sg_f", [stem + "āc"]);
            setNominalForm(data.forms, "abl_sg_n", [stem + oc_macron]);

            data.voc = false;
        }

        data.categories.push("Latin first and second declension " + data.pos);
    }],
    ["1-1", (data, args) => {
        data.title = "first-declension " + singularize(data.pos);
        data.subtitles.push("masculine and neuter forms identical to feminine forms");
        const stem = args[0];
        setNominalForm(data.forms, "nom_sg_m", [stem + "a"]);
        setNominalForm(data.forms, "nom_pl_m", [stem + "ae"]);

        setNominalForm(data.forms, "gen_sg_m", [stem + "ae"]);
        setNominalForm(data.forms, "gen_pl_m", [stem + "ārum"]);

        setNominalForm(data.forms, "dat_sg_m", [stem + "ae"]);
        setNominalForm(data.forms, "dat_pl_m", [stem + "īs"]);

        setNominalForm(data.forms, "acc_sg_m", [stem + "am"]);
        setNominalForm(data.forms, "acc_sg_n", [stem + "a"]);
        setNominalForm(data.forms, "acc_pl_m", [stem + "ās"]);
        setNominalForm(data.forms, "acc_pl_n", [stem + "ae"]);

        setNominalForm(data.forms, "abl_sg_m", [stem + "ā"]);
        setNominalForm(data.forms, "abl_pl_m", [stem + "īs"]);

        setNominalForm(data.forms, "loc_sg_m", [stem + "ae"]);
        setNominalForm(data.forms, "loc_pl_m", [stem + "īs"]);

        setNominalForm(data.forms, "voc_sg_m", [stem + "a"]);
        setNominalForm(data.forms, "voc_pl_m", [stem + "ae"]);

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

        setNominalForm(data.forms, "nom_sg_m", [stem + us]);
        setNominalForm(data.forms, "nom_sg_n", [stem + um]);
        setNominalForm(data.forms, "nom_pl_m", [stem + i_pl]);
        setNominalForm(data.forms, "nom_pl_n", [stem + "a"]);

        setNominalForm(data.forms, "gen_sg_m", [stem + "ī"]);
        setNominalForm(data.forms, "gen_sg_n", [stem + "ī"]);
        setNominalForm(data.forms, "gen_pl_m", [stem + "ōrum"]);
        setNominalForm(data.forms, "gen_pl_n", [stem + "ōrum"]);

        setNominalForm(data.forms, "dat_sg_m", [stem + "ō"]);
        setNominalForm(data.forms, "dat_sg_n", [stem + "ō"]);
        setNominalForm(data.forms, "dat_pl_m", [stem + "īs"]);
        setNominalForm(data.forms, "dat_pl_n", [stem + "īs"]);

        setNominalForm(data.forms, "acc_sg_m", [stem + um]);
        setNominalForm(data.forms, "acc_sg_n", [stem + um]);
        setNominalForm(data.forms, "acc_pl_m", [stem + "ōs"]);
        setNominalForm(data.forms, "acc_pl_n", [stem + "a"]);

        setNominalForm(data.forms, "abl_sg_m", [stem + "ō"]);
        setNominalForm(data.forms, "abl_sg_n", [stem + "ō"]);
        setNominalForm(data.forms, "abl_pl_m", [stem + "īs"]);
        setNominalForm(data.forms, "abl_pl_n", [stem + "īs"]);

        setNominalForm(data.forms, "loc_sg_m", [stem + "ī"]);
        setNominalForm(data.forms, "loc_sg_n", [stem + "ī"]);
        setNominalForm(data.forms, "loc_pl_m", [stem + "īs"]);
        setNominalForm(data.forms, "loc_pl_n", [stem + "īs"]);

        setNominalForm(data.forms, "voc_sg_m", [stem + "e"]);
        setNominalForm(data.forms, "voc_sg_n", [stem + um]);
        setNominalForm(data.forms, "voc_pl_m", [stem + i_pl]);
        setNominalForm(data.forms, "voc_pl_n", [stem + "a"]);

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

        setNominalForm(data.forms, "nom_sg_m", [stem1]);
        setNominalForm(data.forms, "nom_sg_n", [stem1]);
        setNominalForm(data.forms, "nom_pl_m", [stem2 + "ēs"]);
        setNominalForm(data.forms, "nom_pl_n", [stem2 + "ia"]);

        setNominalForm(data.forms, "gen_sg_m", [stem2 + "is"]);
        setNominalForm(data.forms, "gen_sg_n", [stem2 + "is"]);
        setNominalForm(data.forms, "gen_pl_m", [stem2 + "ium"]);
        setNominalForm(data.forms, "gen_pl_n", [stem2 + "ium"]);

        setNominalForm(data.forms, "dat_sg_m", [stem2 + "ī"]);
        setNominalForm(data.forms, "dat_sg_n", [stem2 + "ī"]);
        setNominalForm(data.forms, "dat_pl_m", [stem2 + "ibus"]);
        setNominalForm(data.forms, "dat_pl_n", [stem2 + "ibus"]);

        setNominalForm(data.forms, "acc_sg_m", [stem2 + "em"]);
        setNominalForm(data.forms, "acc_sg_n", [stem1]);
        setNominalForm(data.forms, "acc_pl_m", [stem2 + "ēs"]);
        setNominalForm(data.forms, "acc_pl_n", [stem2 + "ia"]);

        setNominalForm(data.forms, "abl_sg_m", [stem2 + "ī"]);
        setNominalForm(data.forms, "abl_sg_n", [stem2 + "ī"]);
        setNominalForm(data.forms, "abl_pl_m", [stem2 + "ibus"]);
        setNominalForm(data.forms, "abl_pl_n", [stem2 + "ibus"]);

        setNominalForm(data.forms, "loc_sg_m", [stem2 + "ī"]);
        setNominalForm(data.forms, "loc_sg_n", [stem2 + "ī"]);
        setNominalForm(data.forms, "loc_pl_m", [stem2 + "ibus"]);
        setNominalForm(data.forms, "loc_pl_n", [stem2 + "ibus"]);

        setNominalForm(data.forms, "voc_sg_m", [stem1]);
        setNominalForm(data.forms, "voc_sg_n", [stem1]);
        setNominalForm(data.forms, "voc_pl_m", [stem2 + "ēs"]);
        setNominalForm(data.forms, "voc_pl_n", [stem2 + "ia"]);

        if (data.types.has("par")) {
            data.subtitles.push("non-i-stem");

            setNominalForm(data.forms, "nom_pl_n", [stem2 + "a"]);
            setNominalForm(data.forms, "gen_pl_m", [stem2 + "um"]);
            setNominalForm(data.forms, "gen_pl_n", [stem2 + "um"]);
            setNominalForm(data.forms, "abl_sg_m", [stem2 + "e"]);
            setNominalForm(data.forms, "abl_sg_n", [stem2 + "e"]);
            setNominalForm(data.forms, "loc_sg_m", [stem2 + "ī", stem2 + "e"]);
            setNominalForm(data.forms, "loc_sg_n", [stem2 + "ī", stem2 + "e"]);
            setNominalForm(data.forms, "acc_pl_n", [stem2 + "a"]);
            setNominalForm(data.forms, "voc_pl_n", [stem2 + "a"]);
        } else if (data.types.has("not_par")) {
            data.subtitles.push("i-stem");
        }

        const es_base = stem1.match(/^(.*)ēs$/);
        if (es_base && es_base[1] == stem2) {
            if (data.types.has("greek")) {
                const note = "It is unknown if Classical Latin preserved (or would have preserved) the shortness of the original Greek short ending.";
                setNominalForm(data.forms, "nom_sg_n", [stem2 + "es", stem2 + "ēs"]);
                data.notes.set("nom_sg_n1", note);
                setNominalForm(data.forms, "acc_sg_n", [stem2 + "es", stem2 + "ēs"]);
                data.notes.set("acc_sg_n1", note);
                setNominalForm(data.forms, "voc_sg_m", [stem2 + "es", stem2 + "ēs"]);
                data.notes.set("voc_sg_m1", note);
                setNominalForm(data.forms, "voc_sg_n", [stem2 + "es", stem2 + "ēs"]);
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
        setNominalForm(data.forms, "nom_sg_n", [stem + "us"]);
        setNominalForm(data.forms, "acc_sg_n", [stem + "us"]);
        setNominalForm(data.forms, "voc_sg_n", [stem + "us"]);

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

        if (!data.declOpts.suppressAdjPtcForms) {
            setNominalForm(data.forms, "abl_sg_m", [stem2 + "e", stem2 + "ī"]);
            data.notes.set("abl_sg_m2", "When used purely as an adjective.");
            setNominalForm(data.forms, "abl_sg_n", [stem2 + "e", stem2 + "ī"]);
            data.notes.set("abl_sg_n2", "When used purely as an adjective.");
        } else {
            setNominalForm(data.forms, "abl_sg_m", [stem2 + "ī"]);
            setNominalForm(data.forms, "abl_sg_n", [stem2 + "ī"]);
        }

        if (!data.declOpts.suppressNonNeuterIStemAccIs) {
            setNominalForm(data.forms, "acc_pl_m", [stem2 + "ēs", stem2 + "īs"]);
        } else {
            setNominalForm(data.forms, "acc_pl_m", [stem2 + "ēs"]);
        }
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

        setNominalForm(data.forms, "nom_sg_m", [stem + "is"]);
        setNominalForm(data.forms, "nom_sg_n", [stem + "e"]);
        setNominalForm(data.forms, "nom_pl_m", [stem + "ēs"]);
        setNominalForm(data.forms, "nom_pl_n", [stem + "ia"]);

        setNominalForm(data.forms, "gen_sg_m", [stem + "is"]);
        setNominalForm(data.forms, "gen_sg_n", [stem + "is"]);
        setNominalForm(data.forms, "gen_pl_m", [stem + "ium"]);
        setNominalForm(data.forms, "gen_pl_n", [stem + "ium"]);

        setNominalForm(data.forms, "dat_sg_m", [stem + "ī"]);
        setNominalForm(data.forms, "dat_sg_n", [stem + "ī"]);
        setNominalForm(data.forms, "dat_pl_m", [stem + "ibus"]);
        setNominalForm(data.forms, "dat_pl_n", [stem + "ibus"]);

        setNominalForm(data.forms, "acc_sg_m", [stem + "em"]);
        setNominalForm(data.forms, "acc_sg_n", [stem + "e"]);
        if (!data.declOpts.suppressNonNeuterIStemAccIs) {
            setNominalForm(data.forms, "acc_pl_m", [stem + "ēs", stem + "īs"]);
        } else {
            setNominalForm(data.forms, "acc_pl_m", [stem + "ēs"]);
        }
        setNominalForm(data.forms, "acc_pl_n", [stem + "ia"]);

        setNominalForm(data.forms, "abl_sg_m", [stem + "ī"]);
        setNominalForm(data.forms, "abl_sg_n", [stem + "ī"]);
        setNominalForm(data.forms, "abl_pl_m", [stem + "ibus"]);
        setNominalForm(data.forms, "abl_pl_n", [stem + "ibus"]);

        setNominalForm(data.forms, "loc_sg_m", [stem + "ī"]);
        setNominalForm(data.forms, "loc_sg_n", [stem + "ī"]);
        setNominalForm(data.forms, "loc_pl_m", [stem + "ibus"]);
        setNominalForm(data.forms, "loc_pl_n", [stem + "ibus"]);

        setNominalForm(data.forms, "voc_sg_m", [stem + "is"]);
        setNominalForm(data.forms, "voc_sg_n", [stem + "e"]);
        setNominalForm(data.forms, "voc_pl_m", [stem + "ēs"]);
        setNominalForm(data.forms, "voc_pl_n", [stem + "ia"]);

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

        setNominalForm(data.forms, "nom_sg_m", [stem1]);
        setNominalForm(data.forms, "nom_sg_f", [stem2 + "is"]);
        setNominalForm(data.forms, "nom_sg_n", [stem2 + "e"]);
        setNominalForm(data.forms, "nom_pl_m", [stem2 + "ēs"]);
        setNominalForm(data.forms, "nom_pl_f", [stem2 + "ēs"]);
        setNominalForm(data.forms, "nom_pl_n", [stem2 + "ia"]);

        setNominalForm(data.forms, "gen_sg_m", [stem2 + "is"]);
        setNominalForm(data.forms, "gen_sg_f", [stem2 + "is"]);
        setNominalForm(data.forms, "gen_sg_n", [stem2 + "is"]);
        setNominalForm(data.forms, "gen_pl_m", [stem2 + "ium"]);
        setNominalForm(data.forms, "gen_pl_f", [stem2 + "ium"]);
        setNominalForm(data.forms, "gen_pl_n", [stem2 + "ium"]);

        setNominalForm(data.forms, "dat_sg_m", [stem2 + "ī"]);
        setNominalForm(data.forms, "dat_sg_f", [stem2 + "ī"]);
        setNominalForm(data.forms, "dat_sg_n", [stem2 + "ī"]);
        setNominalForm(data.forms, "dat_pl_m", [stem2 + "ibus"]);
        setNominalForm(data.forms, "dat_pl_f", [stem2 + "ibus"]);
        setNominalForm(data.forms, "dat_pl_n", [stem2 + "ibus"]);

        setNominalForm(data.forms, "acc_sg_m", [stem2 + "em"]);
        setNominalForm(data.forms, "acc_sg_f", [stem2 + "em"]);
        setNominalForm(data.forms, "acc_sg_n", [stem2 + "e"]);
        setNominalForm(data.forms, "acc_pl_m", [stem2 + "ēs"]);
        setNominalForm(data.forms, "acc_pl_f", [stem2 + "ēs"]);
        setNominalForm(data.forms, "acc_pl_n", [stem2 + "ia"]);

        setNominalForm(data.forms, "abl_sg_m", [stem2 + "ī"]);
        setNominalForm(data.forms, "abl_sg_f", [stem2 + "ī"]);
        setNominalForm(data.forms, "abl_sg_n", [stem2 + "ī"]);
        setNominalForm(data.forms, "abl_pl_m", [stem2 + "ibus"]);
        setNominalForm(data.forms, "abl_pl_f", [stem2 + "ibus"]);
        setNominalForm(data.forms, "abl_pl_n", [stem2 + "ibus"]);

        setNominalForm(data.forms, "loc_sg_m", [stem2 + "ī"]);
        setNominalForm(data.forms, "loc_sg_f", [stem2 + "ī"]);
        setNominalForm(data.forms, "loc_sg_n", [stem2 + "ī"]);
        setNominalForm(data.forms, "loc_pl_m", [stem2 + "ibus"]);
        setNominalForm(data.forms, "loc_pl_f", [stem2 + "ibus"]);
        setNominalForm(data.forms, "loc_pl_n", [stem2 + "ibus"]);

        setNominalForm(data.forms, "voc_sg_m", [stem1]);
        setNominalForm(data.forms, "voc_sg_f", [stem2 + "is"]);
        setNominalForm(data.forms, "voc_sg_n", [stem2 + "e"]);
        setNominalForm(data.forms, "voc_pl_m", [stem2 + "ēs"]);
        setNominalForm(data.forms, "voc_pl_f", [stem2 + "ēs"]);
        setNominalForm(data.forms, "voc_pl_n", [stem2 + "ia"]);

        data.categories.push("Latin third declension " + data.pos);
        data.categories.push("Latin third declension " + data.pos + " of three terminations");
    }],
    ["irreg", (data, args) => {
        if (args[0] == "duo" || args[0] == "ambō") {
            const stem = args[0] == "duo" ? "du" : "amb";
            data.title = (stem == "amb") ? "irregular adjective" : "numeral";
            data.num = NumberTantum.Plural;

            const stem_with_o = stem + (stem == "amb" ? "ō" : "o");
            setNominalForm(data.forms, "nom_pl_m", [stem_with_o]);
            setNominalForm(data.forms, "nom_pl_f", [stem + "ae"]);
            setNominalForm(data.forms, "nom_pl_n", [stem_with_o]);

            setNominalForm(data.forms, "gen_pl_m", [stem + "ōrum"]);
            setNominalForm(data.forms, "gen_pl_f", [stem + "ārum"]);
            setNominalForm(data.forms, "gen_pl_n", [stem + "ōrum"]);

            setNominalForm(data.forms, "dat_pl_m", [stem + "ōbus"]);
            setNominalForm(data.forms, "dat_pl_f", [stem + "ābus"]);
            setNominalForm(data.forms, "dat_pl_n", [stem + "ōbus"]);

            setNominalForm(data.forms, "acc_pl_m", [stem + "ōs", stem_with_o]);
            setNominalForm(data.forms, "acc_pl_f", [stem + "ās"]);
            setNominalForm(data.forms, "acc_pl_n", [stem_with_o]);

            setNominalForm(data.forms, "abl_pl_m", [stem + "ōbus"]);
            setNominalForm(data.forms, "abl_pl_f", [stem + "ābus"]);
            setNominalForm(data.forms, "abl_pl_n", [stem + "ōbus"]);

            setNominalForm(data.forms, "voc_pl_m", [stem_with_o]);
            setNominalForm(data.forms, "voc_pl_f", [stem + "ae"]);
            setNominalForm(data.forms, "voc_pl_n", [stem_with_o]);

            if (stem == "du") {
                data.footnote = "Note: The genitive masculine and neuter can also be found in the contracted form 'duum' (also spelt 'duûm').";
            }
        } else if (args[0] == "mīlle") {
            data.title = "semi-indeclinable numeral";
            setNominalForm(data.forms, "nom_sg_m", ["mīlle"]);
            setNominalForm(data.forms, "nom_pl_m", ["mīlia", "mīllia"]);

            setNominalForm(data.forms, "gen_sg_m", ["mīlle"]);
            setNominalForm(data.forms, "gen_pl_m", ["mīlium", "mīllium"]);

            setNominalForm(data.forms, "dat_sg_m", ["mīlle"]);
            setNominalForm(data.forms, "dat_pl_m", ["mīlibus", "mīllibus"]);

            setNominalForm(data.forms, "acc_sg_m", ["mīlle"]);
            setNominalForm(data.forms, "acc_pl_m", ["mīlia", "mīllia"]);

            setNominalForm(data.forms, "abl_sg_m", ["mīlle"]);
            setNominalForm(data.forms, "abl_pl_m", ["mīlibus", "mīllibus"]);

            setNominalForm(data.forms, "voc_sg_m", ["mīlle"]);
            setNominalForm(data.forms, "voc_pl_m", ["mīlia", "mīllia"]);
        } else if (args[0] == "illic") {
            data.title = "demonstrative pronoun";
            setNominalForm(data.forms, "nom_sg_m", ["illic"]);
            setNominalForm(data.forms, "nom_sg_f", ["illaec"]);
            setNominalForm(data.forms, "nom_sg_n", ["illuc", "illoc"]);
            setNominalForm(data.forms, "nom_pl_n", ["illaec"]);

            setNominalForm(data.forms, "nom_sg_m", ["illunc"]);
            setNominalForm(data.forms, "nom_sg_f", ["illanc"]);
            setNominalForm(data.forms, "nom_sg_n", ["illuc", "illoc"]);
            setNominalForm(data.forms, "nom_pl_n", ["illaec"]);

            setNominalForm(data.forms, "abl_sg_m", ["illōc"]);
            setNominalForm(data.forms, "abl_sg_f", ["illāc"]);
            setNominalForm(data.forms, "abl_sg_n", ["illōc"]);

            data.voc = false;

        } else if (args[0] == "plūs") {
            data.title = "irregular third-declension comparative adjective";

            setNominalForm(data.forms, "nom_sg_m", [""]);
            setNominalForm(data.forms, "nom_sg_n", ["plūs"]);
            setNominalForm(data.forms, "nom_pl_m", ["plūrēs"]);
            setNominalForm(data.forms, "nom_pl_n", ["plūra"]);

            setNominalForm(data.forms, "gen_sg_m", [""]);
            setNominalForm(data.forms, "gen_sg_n", ["plūris"]);
            setNominalForm(data.forms, "gen_pl_m", ["plūrium"]);
            setNominalForm(data.forms, "gen_pl_n", ["plūrium"]);

            setNominalForm(data.forms, "dat_sg_m", [""]);
            setNominalForm(data.forms, "dat_sg_n", [""]);
            setNominalForm(data.forms, "dat_pl_m", ["plūribus"]);
            setNominalForm(data.forms, "dat_pl_n", ["plūribus"]);

            setNominalForm(data.forms, "acc_sg_m", [""]);
            setNominalForm(data.forms, "acc_sg_n", ["plūs"]);
            setNominalForm(data.forms, "acc_pl_m", ["plūrēs"]);
            setNominalForm(data.forms, "acc_pl_n", ["plūra"]);

            setNominalForm(data.forms, "abl_sg_m", [""]);
            setNominalForm(data.forms, "abl_sg_n", ["plūre"]);
            setNominalForm(data.forms, "abl_pl_m", ["plūribus"]);
            setNominalForm(data.forms, "abl_pl_n", ["plūribus"]);

            setNominalForm(data.forms, "voc_sg_m", [""]);
            setNominalForm(data.forms, "voc_sg_n", ["plūs"]);
            setNominalForm(data.forms, "voc_pl_m", ["plūrēs"]);
            setNominalForm(data.forms, "voc_pl_n", ["plūra"]);

            data.footnote = "Note: Singular forms take the genitive of the whole and do not function as adjectives.";
            data.categories.push("Latin third declension " + data.pos);
            data.categories.push("Latin third declension " + data.pos + " of one termination");
        } else if (args[0] == "is" || args[0] == "īdem") {
            data.title = "demonstrative pronoun";
            const note1 = "The dat. singular is found spelled EIEI (here represented as 'ēī') and scanned as two longs in Plautus, but also as a monosyllable. The latter is its normal scansion in Classical. Other spellings include EEI, IEI.";
            const note2 = "The nom./dat./abl. plural forms regularly developed into a monosyllable  /iː(s)/, with later remodelling - compare the etymology of deus. This /iː/ was normally spelled as EI during and as II after the Republic; a disyllabic 'iī', spelled II, Iꟾ, apears in Silver Age poetry, while disyllabic 'eīs' is only post-Classical. Other spellings include EEI(S), EIEI(S), IEI(S).";

            if (!data.declOpts.suppressRareIrregForms) {
                setNominalForm(data.forms, "nom_pl_m", ["ī", "iī", "eī"]);
                data.notes.set("nom_pl_m1", note2);

                setNominalForm(data.forms, "dat_sg_m", ["ei", "ēī"]);
                data.notes.set("dat_sg_m1", note1);
                setNominalForm(data.forms, "dat_sg_f", ["ei", "ēī"]);
                data.notes.set("dat_sg_f1", note1);
                setNominalForm(data.forms, "dat_sg_n", ["ei", "ēī"]);
                data.notes.set("dat_sg_n1", note1);
                setNominalForm(data.forms, "dat_pl_m", ["īs", "iīs", "eīs"]);
                data.notes.set("dat_pl_m1", note2);
                setNominalForm(data.forms, "dat_pl_f", ["īs", "iīs", "eīs"]);
                data.notes.set("dat_pl_f1", note2);
                setNominalForm(data.forms, "dat_pl_n", ["īs", "iīs", "eīs"]);
                data.notes.set("dat_pl_n1", note2);

                setNominalForm(data.forms, "abl_pl_m", ["īs", "iīs", "eīs"]);
                data.notes.set("abl_pl_m1", note2);
                setNominalForm(data.forms, "abl_pl_f", ["īs", "iīs", "eīs"]);
                data.notes.set("abl_pl_f1", note2);
                setNominalForm(data.forms, "abl_pl_n", ["īs", "iīs", "eīs"]);
                data.notes.set("abl_pl_n1", note2);
            } else {
                setNominalForm(data.forms, "nom_pl_m", ["iī"]);
                setNominalForm(data.forms, "dat_sg_m", ["eī"]);
                setNominalForm(data.forms, "dat_sg_f", ["eī"]);
                setNominalForm(data.forms, "dat_sg_n", ["eī"]);
                setNominalForm(data.forms, "dat_pl_m", ["iīs"]);
                setNominalForm(data.forms, "dat_pl_f", ["iīs"]);
                setNominalForm(data.forms, "dat_pl_n", ["iīs"]);
                setNominalForm(data.forms, "abl_pl_m", ["iīs"]);
                setNominalForm(data.forms, "abl_pl_f", ["iīs"]);
                setNominalForm(data.forms, "abl_pl_n", ["iīs"]);
            }

            setNominalForm(data.forms, "nom_sg_m", ["is"]);
            setNominalForm(data.forms, "nom_sg_f", ["ea"]);
            setNominalForm(data.forms, "nom_sg_n", ["id"]);
            setNominalForm(data.forms, "nom_pl_f", ["eae"]);
            setNominalForm(data.forms, "nom_pl_n", ["ea"]);

            setNominalForm(data.forms, "gen_sg_m", ["eius"]);
            setNominalForm(data.forms, "gen_sg_f", ["eius"]);
            setNominalForm(data.forms, "gen_sg_n", ["eius"]);
            setNominalForm(data.forms, "gen_pl_m", ["eōrum"]);
            setNominalForm(data.forms, "gen_pl_f", ["eārum"]);
            setNominalForm(data.forms, "gen_pl_n", ["eōrum"]);

            setNominalForm(data.forms, "acc_sg_m", ["eum"]);
            setNominalForm(data.forms, "acc_sg_f", ["eam"]);
            setNominalForm(data.forms, "acc_sg_n", ["id"]);
            setNominalForm(data.forms, "acc_pl_m", ["eōs"]);
            setNominalForm(data.forms, "acc_pl_f", ["eās"]);
            setNominalForm(data.forms, "acc_pl_n", ["ea"]);

            setNominalForm(data.forms, "abl_sg_m", ["eō"]);
            setNominalForm(data.forms, "abl_sg_f", ["eā"]);
            setNominalForm(data.forms, "abl_sg_n", ["eō"]);

            data.voc = false;

            if (args[0] == "īdem") {
                setNominalForm(data.forms, "nom_sg_m", ["ī"]);
                setNominalForm(data.forms, "nom_sg_n", ["i"]);
                setNominalForm(data.forms, "nom_pl_m", ["ī"]);

                if (!data.declOpts.suppressRareIrregForms) {
                    setNominalForm(data.forms, "gen_pl_m", ["eōrun", "eōrum"]);
                    setNominalForm(data.forms, "gen_pl_f", ["eārun", "eārum"]);
                    setNominalForm(data.forms, "gen_pl_n", ["eōrun", "eōrum"]);
                    setNominalForm(data.forms, "acc_sg_m", ["eun", "eum"]);
                    setNominalForm(data.forms, "acc_sg_f", ["ean", "eam"]);
                } else {
                    setNominalForm(data.forms, "gen_pl_m", ["eōrun"]);
                    setNominalForm(data.forms, "gen_pl_f", ["eārun"]);
                    setNominalForm(data.forms, "gen_pl_n", ["eōrun"]);
                    setNominalForm(data.forms, "acc_sg_m", ["eun"]);
                    setNominalForm(data.forms, "acc_sg_f", ["ean"]);
                }
                setNominalForm(data.forms, "acc_sg_n", ["i"]);
            }
        } else if (args[0] == "ille") {
            data.types.add("ius");
            const d = m_adj_decl.get("1&2");
            if (!d) {
                throw Error("Decl 1&2 not ready");
            }

            d(data, ["ill"]);

            data.title = "demonstrative pronoun";

            setNominalForm(data.forms, "nom_sg_m", ["ille"]);
            setNominalForm(data.forms, "nom_sg_n", ["illud"]);

            setNominalForm(data.forms, "acc_sg_n", ["illud"]);

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

            setNominalForm(data.forms, "nom_sg_m", ["iste"]);
            setNominalForm(data.forms, "nom_sg_n", ["istud"]);

            setNominalForm(data.forms, "acc_sg_n", ["istud"]);

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

            setNominalForm(data.forms, "nom_sg_m", ["ipse"]);
            setNominalForm(data.forms, "nom_sg_n", ["ipsum"]);

            setNominalForm(data.forms, "acc_sg_n", ["ipsum"]);

            data.voc = false;

            data.categories = [];
        } else if (args[0] == "quis" || args[0] == "quī") {
            let id = "id";

            if (args[0] == "quī") {
                id = "od";
                setNominalForm(data.forms, "acc_sg_f", ["quam"]);
                setNominalForm(data.forms, "abl_sg_f", ["quā"]);
            } else {
                setNominalForm(data.forms, "acc_sg_f", ["quem"]);
                setNominalForm(data.forms, "abl_sg_f", ["quō"]);
            }
            data.title = "relative/interrogative pronoun";

            setNominalForm(data.forms, "nom_sg_m", ["quis"]);
            setNominalForm(data.forms, "nom_sg_f", ["quis", "quae"]);
            setNominalForm(data.forms, "nom_sg_n", ["qu" + id]);
            setNominalForm(data.forms, "nom_pl_m", ["quī"]);
            setNominalForm(data.forms, "nom_pl_f", ["quae"]);
            setNominalForm(data.forms, "nom_pl_n", ["quae"]);

            setNominalForm(data.forms, "gen_sg_m", ["cuius"]);
            setNominalForm(data.forms, "gen_sg_f", ["cuius"]);
            setNominalForm(data.forms, "gen_sg_n", ["cuius"]);
            setNominalForm(data.forms, "gen_pl_m", ["quōrum"]);
            setNominalForm(data.forms, "gen_pl_f", ["quārum"]);
            setNominalForm(data.forms, "gen_pl_n", ["quōrum"]);

            setNominalForm(data.forms, "dat_sg_m", ["cui"]);
            setNominalForm(data.forms, "dat_sg_f", ["cui"]);
            setNominalForm(data.forms, "dat_sg_n", ["cui"]);
            if (!data.declOpts.suppressRareIrregForms) {
                setNominalForm(data.forms, "dat_pl_m", ["quibus", "quīs"]);
                setNominalForm(data.forms, "dat_pl_f", ["quibus", "quīs"]);
                setNominalForm(data.forms, "dat_pl_n", ["quibus", "quīs"]);

                setNominalForm(data.forms, "abl_pl_m", ["quibus", "quīs"]);
                setNominalForm(data.forms, "abl_pl_f", ["quibus", "quīs"]);
                setNominalForm(data.forms, "abl_pl_n", ["quibus", "quīs"]);
            } else {
                setNominalForm(data.forms, "dat_pl_m", ["quibus"]);
                setNominalForm(data.forms, "dat_pl_f", ["quibus"]);
                setNominalForm(data.forms, "dat_pl_n", ["quibus"]);

                setNominalForm(data.forms, "abl_pl_m", ["quibus"]);
                setNominalForm(data.forms, "abl_pl_f", ["quibus"]);
                setNominalForm(data.forms, "abl_pl_n", ["quibus"]);
            }

            setNominalForm(data.forms, "acc_sg_m", ["quem"]);
            setNominalForm(data.forms, "acc_sg_n", ["qu" + id]);
            setNominalForm(data.forms, "acc_pl_m", ["quōs"]);
            setNominalForm(data.forms, "acc_pl_f", ["quās"]);
            setNominalForm(data.forms, "acc_pl_n", ["quae"]);

            setNominalForm(data.forms, "abl_sg_m", ["quō"]);
            setNominalForm(data.forms, "abl_sg_n", ["quō"]);

            data.voc = false;

            if (args[0] == "quī") {
                setNominalForm(data.forms, "nom_sg_m", ["quī"]);
                setNominalForm(data.forms, "nom_sg_f", ["quae"]);
            }
        } else if (args[0] == "quisquis") {
            data.title = "relative/interrogative pronoun";
            setNominalForm(data.forms, "nom_sg_m", ["quisquis"]);
            setNominalForm(data.forms, "nom_sg_f", ["quisquis"]);
            if (!data.declOpts.suppressRareIrregForms) {
                setNominalForm(data.forms, "nom_sg_n", ["quidquid", "quicquid"]);

                setNominalForm(data.forms, "dat_pl_m", ["quibusquibus", "quīsquīs"]);
                setNominalForm(data.forms, "dat_pl_f", ["quibusquibus", "quīsquīs"]);
                setNominalForm(data.forms, "dat_pl_n", ["quibusquibus", "quīsquīs"]);

                setNominalForm(data.forms, "acc_sg_n", ["quidquid", "quicquid"]);

                setNominalForm(data.forms, "abl_pl_m", ["quibusquibus", "quīsquīs"]);
                setNominalForm(data.forms, "abl_pl_f", ["quibusquibus", "quīsquīs"]);
                setNominalForm(data.forms, "abl_pl_n", ["quibusquibus", "quīsquīs"]);

                setNominalForm(data.forms, "voc_sg_n", ["quidquid", "quicquid"]);
            } else {
                setNominalForm(data.forms, "nom_sg_n", ["quidquid"]);

                setNominalForm(data.forms, "dat_pl_m", ["quibusquibus"]);
                setNominalForm(data.forms, "dat_pl_f", ["quibusquibus"]);
                setNominalForm(data.forms, "dat_pl_n", ["quibusquibus"]);

                setNominalForm(data.forms, "acc_sg_n", ["quidquid"]);

                setNominalForm(data.forms, "abl_pl_m", ["quibusquibus"]);
                setNominalForm(data.forms, "abl_pl_f", ["quibusquibus"]);
                setNominalForm(data.forms, "abl_pl_n", ["quibusquibus"]);

                setNominalForm(data.forms, "voc_sg_n", ["quidquid"]);
            }
            setNominalForm(data.forms, "nom_pl_m", ["quīquī"]);
            setNominalForm(data.forms, "nom_pl_f", ["quaequae"]);
            setNominalForm(data.forms, "nom_pl_n", ["quaequae"]);

            setNominalForm(data.forms, "gen_sg_m", ["cuiuscuius"]);
            setNominalForm(data.forms, "gen_sg_f", ["cuiuscuius"]);
            setNominalForm(data.forms, "gen_sg_n", ["cuiuscuius"]);
            setNominalForm(data.forms, "gen_pl_m", ["quōrumquōrum"]);
            setNominalForm(data.forms, "gen_pl_f", ["quārumquārum"]);
            setNominalForm(data.forms, "gen_pl_n", ["quōrumquōrum"]);

            setNominalForm(data.forms, "dat_sg_m", ["cuicui"]);
            setNominalForm(data.forms, "dat_sg_f", ["cuicui"]);
            setNominalForm(data.forms, "dat_sg_n", ["cuicui"]);

            setNominalForm(data.forms, "acc_sg_m", ["quemquem"]);
            setNominalForm(data.forms, "acc_sg_f", ["quamquam"]);
            setNominalForm(data.forms, "acc_pl_m", ["quōsquōs"]);
            setNominalForm(data.forms, "acc_pl_f", ["quāsquās"]);
            setNominalForm(data.forms, "acc_pl_n", ["quaequae"]);

            setNominalForm(data.forms, "abl_sg_m", ["quōquō"]);
            setNominalForm(data.forms, "abl_sg_f", ["quāquā"]);
            setNominalForm(data.forms, "abl_sg_n", ["quōquō"]);

            setNominalForm(data.forms, "voc_sg_m", ["quisquis"]);
            setNominalForm(data.forms, "voc_sg_f", ["quisquis"]);
            setNominalForm(data.forms, "voc_pl_m", ["quīquī"]);
            setNominalForm(data.forms, "voc_pl_f", ["quaequae"]);
            setNominalForm(data.forms, "voc_pl_n", ["quaequae"]);

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
