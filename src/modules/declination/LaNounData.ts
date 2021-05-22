/**
 * This is a complete re-implementation of Wiktionary's Module:la-adj/data, developed by Benwing2.
 * It was converted from Lua to TypeScript by Folke Will <folko@solhost.org>.
 *
 * Original source: https://en.wiktionary.org/wiki/Module:la-noun/data
 * Based on version: https://en.wiktionary.org/w/index.php?title=Module:la-noun/data&oldid=61773265
 *
 * Lua idioms, function and variable names kept as in the original in order to easily
 * backport later changes to this implementation.
 *
 * For that reason, it's suggested to add a type-aware wrapper around this class and leave
 * this code unchanged instead of improving the types and use of idioms in this class.
 *
 */
import { strip_macrons } from "../common";
import { NumberTantum, SegmentData } from "./LaNominal";
import { getNominalForm, setNominalForm } from "./NominalForm";

export const m_noun_decl: Map<string, ((data: SegmentData, args: string[]) => void)> = new Map([
    ["1", (data, args) => {
        const stem = args[0];

        setNominalForm(data.forms, "nom_sg", [stem + "a"]);
        setNominalForm(data.forms, "gen_sg", [stem + "ae"]);
        setNominalForm(data.forms, "dat_sg", [stem + "ae"]);
        setNominalForm(data.forms, "acc_sg", [stem + "am"]);
        setNominalForm(data.forms, "abl_sg", [stem + "ā"]);
        setNominalForm(data.forms, "voc_sg", [stem + "a"]);

        setNominalForm(data.forms, "nom_pl", [stem + "ae"]);
        setNominalForm(data.forms, "gen_pl", [stem + "ārum"]);
        setNominalForm(data.forms, "dat_pl", [stem + "īs"]);
        setNominalForm(data.forms, "acc_pl", [stem + "ās"]);
        setNominalForm(data.forms, "abl_pl", [stem + "īs"]);
        setNominalForm(data.forms, "voc_pl", [stem + "ae"]);

        if (data.types.has("abus")) {
            data.subtitles.push(["dative/ablative plural in ", "'-ābus'"]);
            setNominalForm(data.forms, "dat_pl", [stem + "ābus"]);
            setNominalForm(data.forms, "abl_pl", [stem + "ābus"]);
        } else if (data.types.has("not_abus")) {
            data.subtitles.push(["dative/ablative plural in ", "'-īs'"]);
        }

        if (data.types.has("am")) {
            data.subtitles.push(["nominative/vocative singular in ", "'-ām'"]);
            setNominalForm(data.forms, "nom_sg", [stem + "ām"]);
            setNominalForm(data.forms, "acc_sg", [stem + "ām"]);
            setNominalForm(data.forms, "voc_sg", [stem + "ām"]);
            setNominalForm(data.forms, "abl_sg", [stem + "ām", stem + "ā"]);
        } else if (data.types.has("Greek")) {
            if (data.types.has("Ma")) {
                data.subtitles.push("masculine Greek-type with nominative singular in '-ās'");
                setNominalForm(data.forms, "nom_sg", [stem + "ās"]);
                setNominalForm(data.forms, "acc_sg", [stem + "ān"]);
                setNominalForm(data.forms, "voc_sg", [stem + "ā"]);
            } else if (data.types.has("Me")) {
                data.subtitles.push("masculine Greek-type with nominative singular in '-ēs'");
                setNominalForm(data.forms, "nom_sg", [stem + "ēs"]);
                setNominalForm(data.forms, "acc_sg", [stem + "ēn"]);
                setNominalForm(data.forms, "abl_sg", [stem + "ē"]);
                setNominalForm(data.forms, "voc_sg", [stem + "ē"]);
            } else {
                data.subtitles.push("Greek-type");
                setNominalForm(data.forms, "nom_sg", [stem + "ē"]);
                setNominalForm(data.forms, "gen_sg", [stem + "ēs"]);
                setNominalForm(data.forms, "acc_sg", [stem + "ēn"]);
                setNominalForm(data.forms, "abl_sg", [stem + "ē"]);
                setNominalForm(data.forms, "voc_sg", [stem + "ē"]);
            }
        } else if (data.types.has("not_Greek")) {
            data.subtitles.push("non-Greek-type");
        } else if (data.types.has("not_am")) {
            data.subtitles.push(["nominative/vocative singular in ", "'-a'"]);
        }

        if (data.loc) {
            setNominalForm(data.forms, "loc_sg", [stem + "ae"]);
            setNominalForm(data.forms, "loc_pl", [stem + "īs"]);
        }
    }],
    ["2", (data, args) => {
        const stem1 = args[0];
        const stem2 = args[1];

        setNominalForm(data.forms, "nom_sg", [stem1 + "us"]);
        setNominalForm(data.forms, "gen_sg", [stem1 + "ī"]);
        setNominalForm(data.forms, "dat_sg", [stem1 + "ō"]);
        setNominalForm(data.forms, "acc_sg", [stem1 + "um"]);
        setNominalForm(data.forms, "abl_sg", [stem1 + "ō"]);
        setNominalForm(data.forms, "voc_sg", [stem1 + "e"]);

        setNominalForm(data.forms, "nom_pl", [stem1 + "ī"]);
        setNominalForm(data.forms, "gen_pl", [stem1 + "ōrum"]);
        setNominalForm(data.forms, "dat_pl", [stem1 + "īs"]);
        setNominalForm(data.forms, "acc_pl", [stem1 + "ōs"]);
        setNominalForm(data.forms, "abl_pl", [stem1 + "īs"]);
        setNominalForm(data.forms, "voc_pl", [stem1 + "ī"]);

        if (data.types.has("N")) {
            data.subtitles.push("neuter");
            setNominalForm(data.forms, "nom_sg", [stem1 + "um"]);
            setNominalForm(data.forms, "voc_sg", [stem1 + "um"]);

            setNominalForm(data.forms, "nom_pl", [stem1 + "a"]);
            setNominalForm(data.forms, "acc_pl", [stem1 + "a"]);
            setNominalForm(data.forms, "voc_pl", [stem1 + "a"]);

            if (data.types.has("ium")) {
                setNominalForm(data.forms, "nom_sg", [stem1 + "ium"]);
                setNominalForm(data.forms, "gen_sg", [stem1 + "iī", stem1 + "ī"]);
                setNominalForm(data.forms, "dat_sg", [stem1 + "iō"]);
                setNominalForm(data.forms, "acc_sg", [stem1 + "ium"]);
                setNominalForm(data.forms, "abl_sg", [stem1 + "iō"]);
                setNominalForm(data.forms, "voc_sg", [stem1 + "ium"]);

                setNominalForm(data.forms, "nom_pl", [stem1 + "ia"]);
                setNominalForm(data.forms, "gen_pl", [stem1 + "iōrum"]);
                setNominalForm(data.forms, "dat_pl", [stem1 + "iīs"]);
                setNominalForm(data.forms, "acc_pl", [stem1 + "ia"]);
                setNominalForm(data.forms, "abl_pl", [stem1 + "iīs"]);
                setNominalForm(data.forms, "voc_pl", [stem1 + "ia"]);

                data.notes.set("gen_sg2", "Found in older Latin (until the Augustan Age).");
            } else if (data.types.has("a")) {
                data.subtitles.push("nominative/accusative/vocative plural in '-a'");

                setNominalForm(data.forms, "nom_sg", [stem1 + "us"]);
                setNominalForm(data.forms, "acc_sg", [stem1 + "us"]);
                setNominalForm(data.forms, "voc_sg", [stem1 + "us"]);

                setNominalForm(data.forms, "nom_pl", [stem1 + "a"]);
                setNominalForm(data.forms, "acc_pl", [stem1 + "a"]);
                setNominalForm(data.forms, "voc_pl", [stem1 + "a"]);
            } else if (data.types.has("vom")) {
                data.subtitles.push("nominative singular in '-om' after 'v'");
                setNominalForm(data.forms, "nom_sg", [stem1 + "om"]);
                setNominalForm(data.forms, "acc_sg", [stem1 + "om"]);
                setNominalForm(data.forms, "voc_sg", [stem1 + "om"]);
            } else if (data.types.has("Greek") && data.types.has("us")) {
                data.subtitles.push("Greek-type");
                data.subtitles.push("nominative/accusative/vocative in '-os'");

                setNominalForm(data.forms, "nom_sg", [stem1 + "os"]);
                setNominalForm(data.forms, "acc_sg", [stem1 + "os"]);
                setNominalForm(data.forms, "voc_sg", [stem1 + "os"]);

                setNominalForm(data.forms, "nom_pl", [stem1 + "ē"]);
                setNominalForm(data.forms, "gen_pl", [stem1 + "ōn"]);
                setNominalForm(data.forms, "acc_pl", [stem1 + "ē"]);
                setNominalForm(data.forms, "voc_pl", [stem1 + "ē"]);
            } else if (data.types.has("Greek")) {
                data.subtitles.push("Greek-type");
                setNominalForm(data.forms, "nom_sg", [stem1 + "on"]);
                setNominalForm(data.forms, "acc_sg", [stem1 + "on"]);
                setNominalForm(data.forms, "voc_sg", [stem1 + "on"]);
            } else if (data.types.has("us")) {
                data.subtitles.push("nominative/accusative/vocative in '-us'");
                setNominalForm(data.forms, "nom_sg", [stem1 + "us"]);
                setNominalForm(data.forms, "acc_sg", [stem1 + "us"]);
                setNominalForm(data.forms, "voc_sg", [stem1 + "us"]);

                setNominalForm(data.forms, "nom_pl", [stem1 + "ī"]);
                setNominalForm(data.forms, "acc_pl", [stem1 + "ōs"]);
                setNominalForm(data.forms, "voc_pl", [stem1 + "ī"]);
            } else if (data.types.has("not_Greek") || data.types.has("not_us")) {
                data.subtitles.push("nominative/accusative/vocative in '-um'");
            }
        } else if (data.types.has("er")) {
            if (stem1.match(/[aiouy]r$/)) {
                data.subtitles.push("nominative singular in '-r'");
            } else {
                data.subtitles.push("nominative singular in '-er'");
            }

            setNominalForm(data.forms, "nom_sg", [stem1]);
            setNominalForm(data.forms, "gen_sg", [stem2 + "ī"]);
            setNominalForm(data.forms, "dat_sg", [stem2 + "ō"]);
            setNominalForm(data.forms, "acc_sg", [stem2 + "um"]);
            setNominalForm(data.forms, "abl_sg", [stem2 + "ō"]);
            setNominalForm(data.forms, "voc_sg", [stem1]);

            setNominalForm(data.forms, "nom_pl", [stem2 + "ī"]);
            setNominalForm(data.forms, "gen_pl", [stem2 + "ōrum"]);
            setNominalForm(data.forms, "dat_pl", [stem2 + "īs"]);
            setNominalForm(data.forms, "acc_pl", [stem2 + "ōs"]);
            setNominalForm(data.forms, "abl_pl", [stem2 + "īs"]);
            setNominalForm(data.forms, "voc_pl", [stem2 + "ī"]);
        } else if (data.types.has("ius")) {
            setNominalForm(data.forms, "nom_sg", [stem1 + "ius"]);
            setNominalForm(data.forms, "gen_sg", [stem1 + "iī", stem1 + "ī"]);
            setNominalForm(data.forms, "dat_sg", [stem1 + "iō"]);
            setNominalForm(data.forms, "acc_sg", [stem1 + "ium"]);
            setNominalForm(data.forms, "abl_sg", [stem1 + "iō"]);

            if (data.types.has("voci")) {
                setNominalForm(data.forms, "voc_sg", [stem1 + "ī"]);
            } else {
                setNominalForm(data.forms, "voc_sg", [stem1 + "ie"]);
            }

            setNominalForm(data.forms, "nom_pl", [stem1 + "iī"]);
            setNominalForm(data.forms, "gen_pl", [stem1 + "iōrum"]);
            setNominalForm(data.forms, "dat_pl", [stem1 + "iīs"]);
            setNominalForm(data.forms, "acc_pl", [stem1 + "iōs"]);
            setNominalForm(data.forms, "abl_pl", [stem1 + "iīs"]);
            setNominalForm(data.forms, "voc_pl", [stem1 + "iī"]);

            data.notes.set("gen_sg2", "Found in older Latin (until the Augustan Age).");
        } else if (data.types.has("vos")) {
            data.subtitles.push("nominative singular in '-os' after 'v'");
            setNominalForm(data.forms, "nom_sg", [stem1 + "os"]);
            setNominalForm(data.forms, "acc_sg", [stem1 + "om"]);
        } else if (data.types.has("Greek")) {
            data.subtitles.push("Greek-type");
            setNominalForm(data.forms, "nom_sg", [stem1 + "os"]);
            setNominalForm(data.forms, "acc_sg", [stem1 + "on"]);
        } else if (data.types.has("not_Greek")) {
            data.subtitles.push("non-Greek-type");
        }

        if (data.types.has("genplum")) {
            data.subtitles.push(["contracted", " genitive plural"]);
            data.notes.set("gen_pl2", "Contraction found in poetry.");
            if (data.types.has("ius") || data.types.has("ium")) {
                setNominalForm(data.forms, "gen_pl", [stem2 + "iōrum", stem2 + "ium"]);
            } else {
                setNominalForm(data.forms, "gen_pl", [stem2 + "ōrum", stem2 + "um"]);
            }
        } else if (data.types.has("not_genplum")) {
            data.subtitles.push(["normal", " genitive plural"]);
        }

        if (data.loc) {
            if (data.types.has("ius") || data.types.has("ium")) {
                setNominalForm(data.forms, "loc_sg", [stem2 + "iī"]);
                setNominalForm(data.forms, "loc_pl", [stem2 + "iīs"]);
            } else {
                setNominalForm(data.forms, "loc_sg", [stem2 + "ī"]);
                setNominalForm(data.forms, "loc_pl", [stem2 + "īs"]);
            }
        }
    }],
    ["3", (data, args) => {
        let stem1 = args[0];
        const stem2 = args[1];

        function parisyllabic_type(): string {
            const stem1_vowels = strip_macrons(stem1).replace(/[^AEIOUYaeiouy]/g, "");
            const stem2_vowels = strip_macrons(stem2).replace(/[^AEIOUYaeiouy]/g, "");
            return stem1_vowels.length > stem2_vowels.length ? "parisyllabic" : "imparisyllabic";
        }

        function non_i_stem_type() {
            return parisyllabic_type() + " non-i-stem";
        }

        setNominalForm(data.forms, "nom_sg", [stem1]);
        setNominalForm(data.forms, "gen_sg", [stem2 + "is"]);
        setNominalForm(data.forms, "dat_sg", [stem2 + "ī"]);
        setNominalForm(data.forms, "acc_sg", [stem2 + "em"]);
        setNominalForm(data.forms, "abl_sg", [stem2 + "e"]);
        setNominalForm(data.forms, "voc_sg", [stem1]);

        setNominalForm(data.forms, "nom_pl", [stem2 + "ēs"]);
        setNominalForm(data.forms, "gen_pl", [stem2 + "um"]);
        setNominalForm(data.forms, "dat_pl", [stem2 + "ibus"]);
        setNominalForm(data.forms, "acc_pl", [stem2 + "ēs"]);
        setNominalForm(data.forms, "abl_pl", [stem2 + "ibus"]);
        setNominalForm(data.forms, "voc_pl", [stem2 + "ēs"]);

        let acc_sg_i_stem_subtype = false;
        let not_acc_sg_i_stem_subtype = false;

        for (const subtype of data.types.keys()) {
            if (acc_sg_i_stem_subtypes.has(subtype)) {
                acc_sg_i_stem_subtype = true;
                break;
            }
        }

        for (const [acc_sg_subtype, [endings, title]] of acc_sg_i_stem_subtypes) {
            if (data.types.has("not_" + acc_sg_subtype)) {
                not_acc_sg_i_stem_subtype = true;
                break;
            }
        }

        let abl_sg_i_stem_subtype = false;
        let not_abl_sg_i_stem_subtype = false;
        for (const subtype of data.types.keys()) {
            if (abl_sg_i_stem_subtypes.has(subtype)) {
                abl_sg_i_stem_subtype = true;
                break;
            }
        }

        for (const [abl_sg_subtype, [endings, title]] of abl_sg_i_stem_subtypes) {
            if (data.types.has("not_" + abl_sg_subtype)) {
                not_abl_sg_i_stem_subtype = true;
                break;
            }
        }


        if (data.types.has("Greek")) {
            data.subtitles.push("Greek-type");

            if (data.types.has("er")) {
                data.subtitles.push("variant with nominative singular in '-ēr'");
                stem1 = extract_stem(stem1, "ēr");

                setNominalForm(data.forms, "nom_sg", [stem1 + "ēr"]);
                setNominalForm(data.forms, "gen_sg", [stem1 + "eris"]);
                setNominalForm(data.forms, "dat_sg", [stem1 + "erī"]);
                setNominalForm(data.forms, "acc_sg", [stem1 + "era", stem1 + "erem"]);
                setNominalForm(data.forms, "abl_sg", [stem1 + "ere"]);
                setNominalForm(data.forms, "voc_sg", [stem1 + "ēr"]);

                setNominalForm(data.forms, "nom_pl", [stem1 + "erēs"]);
                setNominalForm(data.forms, "gen_pl", [stem1 + "erum"]);
                setNominalForm(data.forms, "dat_pl", [stem1 + "eribus"]);
                setNominalForm(data.forms, "acc_pl", [stem1 + "erēs"]);
                setNominalForm(data.forms, "abl_pl", [stem1 + "eribus"]);
                setNominalForm(data.forms, "voc_pl", [stem1 + "erēs"]);
            } else if (data.types.has("on")) {
                data.subtitles.push("variant with nominative singular in '-ōn'");
                stem1 = extract_stem(stem1, "ōn");

                setNominalForm(data.forms, "nom_sg", [stem1 + "ōn"]);
                setNominalForm(data.forms, "gen_sg", [stem1 + "ontis", stem1 + "ontos"]);
                setNominalForm(data.forms, "dat_sg", [stem1 + "ontī"]);
                setNominalForm(data.forms, "acc_sg", [stem1 + "onta"]);
                setNominalForm(data.forms, "abl_sg", [stem1 + "onte"]);
                setNominalForm(data.forms, "voc_sg", [stem1 + "ōn"]);

                setNominalForm(data.forms, "nom_pl", [stem1 + "ontēs"]);
                setNominalForm(data.forms, "gen_pl", [stem1 + "ontum", stem1 + "ontium"]);
                setNominalForm(data.forms, "dat_pl", [stem1 + "ontibus"]);
                setNominalForm(data.forms, "acc_pl", [stem1 + "ontēs", stem1 + "ontās"]);
                setNominalForm(data.forms, "abl_pl", [stem1 + "ontibus"]);
                setNominalForm(data.forms, "voc_pl", [stem1 + "ontēs"]);
            } else if (data.types.has("I")) {
                data.subtitles.push("i-stem");
                setNominalForm(data.forms, "gen_sg", [stem2 + "is", stem2 + "eōs", stem2 + "ios"]);
                setNominalForm(data.forms, "acc_sg", [stem2 + "im", stem2 + "in", stem2 + "em"]);
                setNominalForm(data.forms, "abl_sg", [stem2 + "ī", stem2 + "e"]);
                setNominalForm(data.forms, "voc_sg", [stem2 + "is", stem2 + "i"]);

                data.notes.set("acc_sg3", "Found sometimes in Medieval and New Latin.");
                data.notes.set("abl_sg2", "Found sometimes in Medieval and New Latin.");

                setNominalForm(data.forms, "nom_pl", [stem2 + "ēs", stem2 + "eis"]);
                setNominalForm(data.forms, "gen_pl", [stem2 + "ium", stem2 + "eōn"]);
                setNominalForm(data.forms, "acc_pl", [stem2 + "ēs", stem2 + "eis"]);
                setNominalForm(data.forms, "voc_pl", [stem2 + "ēs", stem2 + "eis"]);

                if (data.types.has("poetic_esi")) {
                    setNominalForm(data.forms, "dat_pl", [stem2 + "ibus", stem2 + "esi"]);
                    setNominalForm(data.forms, "abl_pl", [stem2 + "ibus", stem2 + "esi"]);
                    data.notes.set("dat_pl2", "Primarily in poetry.");
                    data.notes.set("abl_pl2", "Primarily in poetry.");
                }
            } else {
                data.subtitles.push("normal variant");

                setNominalForm(data.forms, "gen_sg", [stem2 + "os"]);
                if (stem2.match(/y$/)) {
                    setNominalForm(data.forms, "acc_sg", [stem2 + "n"]);
                } else {
                    setNominalForm(data.forms, "acc_sg", [stem2 + "a"]);
                }
                setNominalForm(data.forms, "nom_pl", [stem2 + "es"]);
                setNominalForm(data.forms, "acc_pl", [stem2 + "as"]);
                setNominalForm(data.forms, "voc_pl", [stem2 + "es"]);

                if (stem1.match(/[iyï]s$/)) {
                    setNominalForm(data.forms, "voc_sg", [stem1, stem1.replace(/s/g, "")]);
                    data.notes.set("voc_sg2", "In poetry.");
                }
            }
        } else if (data.types.has("not_Greek")) {
            data.subtitles.push("non-Greek-type");
        }

        if (data.types.has("polis")) {
            stem1 = extract_stem(stem1, "polis");
            data.subtitles.push("i-stem, partially Greek-type");
            setNominalForm(data.forms, "nom_sg", [stem1 + "polis"]);
            setNominalForm(data.forms, "gen_sg", [stem1 + "polis"]);
            setNominalForm(data.forms, "dat_sg", [stem1 + "polī"]);
            setNominalForm(data.forms, "acc_sg", [stem1 + "polim", stem1 + "polin"]);
            setNominalForm(data.forms, "abl_sg", [stem1 + "polī"]);
            setNominalForm(data.forms, "voc_sg", [stem1 + "polis", stem1 + "polī"]);
        } else if (data.types.has("not_polis")) {
            data.subtitles.push(non_i_stem_type());
        }

        if (data.types.has("N")) {
            data.subtitles.push("neuter");

            setNominalForm(data.forms, "acc_sg", [stem1]);

            if (data.types.has("I")) {
                if (data.types.has("pure")) {
                    data.subtitles.push("“pure” i-stem");

                    setNominalForm(data.forms, "abl_sg", [stem2 + "ī"]);

                    setNominalForm(data.forms, "nom_pl", [stem2 + "ia"]);
                    setNominalForm(data.forms, "gen_pl", [stem2 + "ium"]);
                    setNominalForm(data.forms, "acc_pl", [stem2 + "ia"]);
                    setNominalForm(data.forms, "voc_pl", [stem2 + "ia"]);
                } else {
                    data.subtitles.push("i-stem");
                    setNominalForm(data.forms, "nom_pl", [stem2 + "a"]);
                    setNominalForm(data.forms, "gen_pl", [stem2 + "ium", stem2 + "um"]);
                    setNominalForm(data.forms, "acc_pl", [stem2 + "a"]);
                    setNominalForm(data.forms, "voc_pl", [stem2 + "a"]);
                }
            } else {
                data.subtitles.push(non_i_stem_type());
                setNominalForm(data.forms, "nom_pl", [stem2 + "a"]);
                setNominalForm(data.forms, "acc_pl", [stem2 + "a"]);
                setNominalForm(data.forms, "voc_pl", [stem2 + "a"]);
            }
        } else if (data.types.has("I") || acc_sg_i_stem_subtype || abl_sg_i_stem_subtype) {
            if (data.types.has("not_N")) {
                data.subtitles.push("non-neuter i-stem");
            } else {
                data.subtitles.push("i-stem");
            }

            setNominalForm(data.forms, "gen_pl", [stem2 + "ium"]);
            setNominalForm(data.forms, "acc_pl", [stem2 + "ēs", stem2 + "īs"]);

            for (const subtype of data.types) {
                const acc_sg_i_stem_props = acc_sg_i_stem_subtypes.get(subtype);
                if (acc_sg_i_stem_props) {
                    setNominalForm(data.forms, "acc_sg", []);
                    for (const ending of acc_sg_i_stem_props[0]) {
                        setNominalForm(data.forms, "acc_sg", (getNominalForm(data.forms, "acc_sg") || []).concat([stem2 + ending]));
                    }
                    if (data.num != "pl") {
                        data.subtitles.push(acc_sg_i_stem_props[1]);
                    }
                    break;
                }
            }

            for (const subtype of data.types) {
                const abl_sg_i_stem_props = abl_sg_i_stem_subtypes.get(subtype);
                if (abl_sg_i_stem_props) {
                    setNominalForm(data.forms, "abl_sg", []);
                    for (const ending of abl_sg_i_stem_props[0]) {
                        setNominalForm(data.forms, "abl_sg", (getNominalForm(data.forms, "abl_sg") || []).concat([stem2 + ending]));
                    }
                    if (data.num != "pl") {
                        data.subtitles.push(abl_sg_i_stem_props[1]);
                    }
                    break;
                }
            }
        } else if (data.types.has("not_N") && data.types.has("not_I")) {
            data.subtitles.push("non-neuter " + non_i_stem_type());
        } else if (data.types.has("not_N")) {
            data.subtitles.push("non-neuter");
        } else if (data.types.has("not_I")) {
            data.subtitles.push(non_i_stem_type());
        }

        if (data.loc) {
            const loc_sg = Array.from(getNominalForm(data.forms, "dat_sg") || []);
            const abl_sg = getNominalForm(data.forms, "abl_sg") || [];
            for (const form of abl_sg) {
                insert_if_not(loc_sg, form);
            }
            setNominalForm(data.forms, "loc_sg", loc_sg);
            setNominalForm(data.forms, "loc_pl", getNominalForm(data.forms, "abl_pl") || []);
        }
    }],
    ["4", (data, args) => {
        const stem = args[0];

        setNominalForm(data.forms, "nom_sg", [stem + "us"]);
        setNominalForm(data.forms, "gen_sg", [stem + "ūs"]);
        setNominalForm(data.forms, "dat_sg", [stem + "uī"]);
        setNominalForm(data.forms, "acc_sg", [stem + "um"]);
        setNominalForm(data.forms, "abl_sg", [stem + "ū"]);
        setNominalForm(data.forms, "voc_sg", [stem + "us"]);

        setNominalForm(data.forms, "nom_pl", [stem + "ūs"]);
        setNominalForm(data.forms, "gen_pl", [stem + "uum"]);
        setNominalForm(data.forms, "dat_pl", [stem + "ibus"]);
        setNominalForm(data.forms, "acc_pl", [stem + "ūs"]);
        setNominalForm(data.forms, "abl_pl", [stem + "ibus"]);
        setNominalForm(data.forms, "voc_pl", [stem + "ūs"]);

        if (data.types.has("echo")) {
            data.subtitles.push("nominative/vocative singular in '-ō'");
            setNominalForm(data.forms, "nom_sg", [stem + "ō"]);
            setNominalForm(data.forms, "voc_sg", [stem + "ō"]);
        } else if (data.types.has("argo")) {
            data.subtitles.push("nominative/accusative/vocative singular in '-ō', ablative singular in '-uī'");
            setNominalForm(data.forms, "nom_sg", [stem + "ō"]);
            setNominalForm(data.forms, "acc_sg", [stem + "ō"]);
            setNominalForm(data.forms, "abl_sg", [stem + "uī"]);
            setNominalForm(data.forms, "voc_sg", [stem + "ō"]);
        } else if (data.types.has("Callisto")) {
            data.subtitles.push("all cases except the genitive singular in '-ō'");
            setNominalForm(data.forms, "nom_sg", [stem + "ō"]);
            setNominalForm(data.forms, "dat_sg", [stem + "ō"]);
            setNominalForm(data.forms, "acc_sg", [stem + "ō"]);
            setNominalForm(data.forms, "abl_sg", [stem + "ō"]);
            setNominalForm(data.forms, "voc_sg", [stem + "ō"]);
        }

        if (data.types.has("N")) {
            data.subtitles.push("neuter");

            setNominalForm(data.forms, "nom_sg", [stem + "ū"]);
            setNominalForm(data.forms, "dat_sg", [stem + "ū"]);
            setNominalForm(data.forms, "acc_sg", [stem + "ū"]);
            setNominalForm(data.forms, "voc_sg", [stem + "ū"]);

            setNominalForm(data.forms, "nom_pl", [stem + "ua"]);
            setNominalForm(data.forms, "acc_pl", [stem + "ua"]);
            setNominalForm(data.forms, "voc_pl", [stem + "ua"]);
        }

        if (data.types.has("ubus")) {
            data.subtitles.push("dative/ablative plural in '-ubus'");

            setNominalForm(data.forms, "dat_pl", [stem + "ubus"]);
            setNominalForm(data.forms, "abl_pl", [stem + "ubus"]);
        } else if (data.types.has("not_ubus")) {
            data.subtitles.push("'-ibus'");
        }

        if (data.loc) {
            setNominalForm(data.forms, "loc_sg", getNominalForm(data.forms, "abl_sg") || []);
            setNominalForm(data.forms, "loc_pl", getNominalForm(data.forms, "abl_pl") || []);
        }

    }],
    ["5", (data, args) => {
        let stem = args[0];

        if (data.types.has("i")) {
            stem = stem + "i";
        }

        setNominalForm(data.forms, "nom_sg", [stem + "ēs"]);
        setNominalForm(data.forms, "gen_sg", [stem + "eī"]);
        setNominalForm(data.forms, "dat_sg", [stem + "eī"]);
        setNominalForm(data.forms, "acc_sg", [stem + "em"]);
        setNominalForm(data.forms, "abl_sg", [stem + "ē"]);
        setNominalForm(data.forms, "voc_sg", [stem + "ēs"]);

        setNominalForm(data.forms, "nom_pl", [stem + "ēs"]);
        setNominalForm(data.forms, "gen_pl", [stem + "ērum"]);
        setNominalForm(data.forms, "dat_pl", [stem + "ēbus"]);
        setNominalForm(data.forms, "acc_pl", [stem + "ēs"]);
        setNominalForm(data.forms, "abl_pl", [stem + "ēbus"]);
        setNominalForm(data.forms, "voc_pl", [stem + "ēs"]);

        if (data.types.has("i")) {
            setNominalForm(data.forms, "gen_sg", [stem + "ēī"]);
            setNominalForm(data.forms, "dat_sg", [stem + "ēī"]);
        }

        if (data.loc) {
            setNominalForm(data.forms, "loc_sg", [stem + "ē"]);
            setNominalForm(data.forms, "loc_pl", [stem + "ēbus"]);
        }
    }],
    ["0", (data, args) => {
        const stem = args[0];

        setNominalForm(data.forms, "nom_sg", [stem]);
        setNominalForm(data.forms, "gen_sg", [stem]);
        setNominalForm(data.forms, "dat_sg", [stem]);
        setNominalForm(data.forms, "acc_sg", [stem]);
        setNominalForm(data.forms, "abl_sg", [stem]);
        setNominalForm(data.forms, "voc_sg", [stem]);

        setNominalForm(data.forms, "nom_pl", [stem]);
        setNominalForm(data.forms, "gen_pl", [stem]);
        setNominalForm(data.forms, "dat_pl", [stem]);
        setNominalForm(data.forms, "acc_pl", [stem]);
        setNominalForm(data.forms, "abl_pl", [stem]);
        setNominalForm(data.forms, "voc_pl", [stem]);

        if (data.loc) {
            setNominalForm(data.forms, "loc_sg", [stem]);
            setNominalForm(data.forms, "loc_pl", [stem]);
        }
    }],
    ["indecl", (data, args) => {
        data.title = "Not declined; used only in the nominative and accusative singular.";

        const stem = args[0];

        setNominalForm(data.forms, "nom_sg", ["-"]);
        setNominalForm(data.forms, "gen_sg", ["-"]);
        setNominalForm(data.forms, "dat_sg", ["-"]);
        setNominalForm(data.forms, "acc_sg", ["-"]);
        setNominalForm(data.forms, "abl_sg", ["-"]);
        setNominalForm(data.forms, "voc_sg", ["-"]);

        setNominalForm(data.forms, "nom_pl", ["-"]);
        setNominalForm(data.forms, "gen_pl", ["-"]);
        setNominalForm(data.forms, "dat_pl", ["-"]);
        setNominalForm(data.forms, "acc_pl", ["-"]);
        setNominalForm(data.forms, "abl_pl", ["-"]);
        setNominalForm(data.forms, "voc_pl", ["-"]);

        setNominalForm(data.forms, "nom_sg", [stem]);
        setNominalForm(data.forms, "acc_sg", [stem]);
        data.num = NumberTantum.Singular;
    }],
    ["irreg", (data, args) => {
        const stem = args[0];
        setNominalForm(data.forms, "nom_sg", ["-"]);
        setNominalForm(data.forms, "gen_sg", ["-"]);
        setNominalForm(data.forms, "dat_sg", ["-"]);
        setNominalForm(data.forms, "acc_sg", ["-"]);
        setNominalForm(data.forms, "abl_sg", ["-"]);
        setNominalForm(data.forms, "voc_sg", ["-"]);

        setNominalForm(data.forms, "nom_pl", ["-"]);
        setNominalForm(data.forms, "gen_pl", ["-"]);
        setNominalForm(data.forms, "dat_pl", ["-"]);
        setNominalForm(data.forms, "acc_pl", ["-"]);
        setNominalForm(data.forms, "abl_pl", ["-"]);
        setNominalForm(data.forms, "voc_pl", ["-"]);

        if (stem == "bōs") {
            setNominalForm(data.forms, "nom_sg", ["bōs"]);
            setNominalForm(data.forms, "gen_sg", ["bovis"]);
            setNominalForm(data.forms, "dat_sg", ["bovī"]);
            setNominalForm(data.forms, "acc_sg", ["bovem"]);
            setNominalForm(data.forms, "abl_sg", ["bove"]);
            setNominalForm(data.forms, "voc_sg", ["bōs"]);

            setNominalForm(data.forms, "nom_pl", ["bovēs"]);
            setNominalForm(data.forms, "gen_pl", ["boum"]);
            setNominalForm(data.forms, "dat_pl", ["bōbus", "būbus"]);
            setNominalForm(data.forms, "acc_pl", ["bovēs"]);
            setNominalForm(data.forms, "abl_pl", ["bōbus", "būbus"]);
            setNominalForm(data.forms, "voc_pl", ["bovēs"]);
        } else if (stem == "cherub") {
            data.title = "mostly indeclinable";
            data.subtitles.push("with a distinct plural");

            setNominalForm(data.forms, "nom_sg", ["cherub"]);
            setNominalForm(data.forms, "gen_sg", ["cherub"]);
            setNominalForm(data.forms, "dat_sg", ["cherub"]);
            setNominalForm(data.forms, "acc_sg", ["cherub"]);
            setNominalForm(data.forms, "abl_sg", ["cherub"]);
            setNominalForm(data.forms, "voc_sg", ["cherub"]);

            setNominalForm(data.forms, "nom_pl", ["cherubim", "cherubin"]);
            setNominalForm(data.forms, "gen_pl", ["cherubim", "cherubin"]);
            setNominalForm(data.forms, "dat_pl", ["cherubim", "cherubin"]);
            setNominalForm(data.forms, "acc_pl", ["cherubim", "cherubin"]);
            setNominalForm(data.forms, "abl_pl", ["cherubim", "cherubin"]);
            setNominalForm(data.forms, "voc_pl", ["cherubim", "cherubin"]);
        } else if (stem == "deus") {
            setNominalForm(data.forms, "nom_sg", ["deus"]);
            setNominalForm(data.forms, "gen_sg", ["deī"]);
            setNominalForm(data.forms, "dat_sg", ["deō"]);
            setNominalForm(data.forms, "acc_sg", ["deum"]);
            setNominalForm(data.forms, "abl_sg", ["deō"]);
            setNominalForm(data.forms, "voc_sg", ["deus"]);

            setNominalForm(data.forms, "nom_pl", ["dī", "diī", "deī"]);
            setNominalForm(data.forms, "gen_pl", ["deōrum", "deûm", "divom"]);
            setNominalForm(data.forms, "dat_pl", ["dīs", "diīs", "deīs"]);
            setNominalForm(data.forms, "acc_pl", ["deōs"]);
            setNominalForm(data.forms, "abl_pl", ["dīs", "diīs", "deīs"]);
            setNominalForm(data.forms, "voc_pl", ["dī", "diī", "deī"]);
        } else if (stem == "Deus") {
            setNominalForm(data.forms, "nom_sg", ["Deus"]);
            setNominalForm(data.forms, "gen_sg", ["Deī"]);
            setNominalForm(data.forms, "dat_sg", ["Deō"]);
            setNominalForm(data.forms, "acc_sg", ["Deum"]);
            setNominalForm(data.forms, "abl_sg", ["Deō"]);
            setNominalForm(data.forms, "voc_sg", ["Deus"]);
            data.num = NumberTantum.Singular;
        } else if (stem == "domus") {
            data.title = "fourth/second-declension noun";

            setNominalForm(data.forms, "nom_sg", ["domus"]);
            setNominalForm(data.forms, "gen_sg", ["domūs", "domī"]);
            setNominalForm(data.forms, "dat_sg", ["domuī", "domō", "domū"]);
            setNominalForm(data.forms, "acc_sg", ["domum"]);
            setNominalForm(data.forms, "abl_sg", ["domū", "domō"]);
            setNominalForm(data.forms, "voc_sg", ["domus"]);
            setNominalForm(data.forms, "loc_sg", ["domī"]);

            setNominalForm(data.forms, "nom_pl", ["domūs"]);
            setNominalForm(data.forms, "gen_pl", ["domuum", "domōrum"]);
            setNominalForm(data.forms, "dat_pl", ["domibus"]);
            setNominalForm(data.forms, "acc_pl", ["domūs", "domōs"]);
            setNominalForm(data.forms, "abl_pl", ["domibus"]);
            setNominalForm(data.forms, "voc_pl", ["domūs"]);
            setNominalForm(data.forms, "loc_pl", ["domibus"]);

            data.loc = true;
        } else if (stem == "Iēsus" || stem == "Jēsus" || stem == "Iēsūs" || stem == "Jēsūs") {
            data.subtitles.push("highly irregular");
            const ij = stem[0];
            setNominalForm(data.forms, "nom_sg", [stem]);
            setNominalForm(data.forms, "gen_sg", [ij + "ēsū"]);
            setNominalForm(data.forms, "dat_sg", [ij + "ēsū"]);
            setNominalForm(data.forms, "acc_sg", [ij + "ēsum"]);
            setNominalForm(data.forms, "abl_sg", [ij + "ēsū"]);
            setNominalForm(data.forms, "voc_sg", [ij + "ēsū"]);
            data.num = NumberTantum.Singular;
        } else if (stem == "iūgerum" || stem == "jūgerum") {
            const ij = stem[0];
            data.title = "second–third-declension hybrid noun";
            data.subtitles.push("neuter");

            setNominalForm(data.forms, "nom_sg", [ij + "ūgerum"]);
            setNominalForm(data.forms, "gen_sg", [ij + "ūgerī"]);
            setNominalForm(data.forms, "dat_sg", [ij + "ūgerō"]);
            setNominalForm(data.forms, "acc_sg", [ij + "ūgerum"]);
            setNominalForm(data.forms, "abl_sg", [ij + "ūgerō"]);
            setNominalForm(data.forms, "voc_sg", [ij + "ūgerum"]);
            setNominalForm(data.forms, "nom_pl", [ij + "ūgera"]);
            setNominalForm(data.forms, "gen_pl", [ij + "ūgerum"]);
            setNominalForm(data.forms, "dat_pl", [ij + "ūgeribus"]);
            setNominalForm(data.forms, "acc_pl", [ij + "ūgera"]);
            setNominalForm(data.forms, "abl_pl", [ij + "ūgeribus", ij + "ūgerīs"]);
            setNominalForm(data.forms, "voc_pl", [ij + "ūgera"]);

            data.notes.set("abl_pl2", "Once only, in:<br/>M. Terentius Varro, 'Res Rusticae', bk I, ch. x");
        } else if (stem == "sūs") {
            setNominalForm(data.forms, "nom_sg", ["sūs"]);
            setNominalForm(data.forms, "gen_sg", ["suis"]);
            setNominalForm(data.forms, "dat_sg", ["suī"]);
            setNominalForm(data.forms, "acc_sg", ["suem"]);
            setNominalForm(data.forms, "abl_sg", ["sue"]);
            setNominalForm(data.forms, "voc_sg", ["sūs"]);

            setNominalForm(data.forms, "nom_pl", ["suēs"]);
            setNominalForm(data.forms, "gen_pl", ["suum"]);
            setNominalForm(data.forms, "dat_pl", ["suibus", "sūbus", "subus"]);
            setNominalForm(data.forms, "acc_pl", ["suēs"]);
            setNominalForm(data.forms, "abl_pl", ["suibus", "sūbus", "subus"]);
            setNominalForm(data.forms, "voc_pl", ["suēs"]);
        } else if (stem == "ēthos") {
            data.subtitles.push("irregular");
            data.subtitles.push("Greek-type");

            setNominalForm(data.forms, "nom_sg", ["ēthos"]);
            setNominalForm(data.forms, "gen_sg", ["ētheos"]);
            setNominalForm(data.forms, "acc_sg", ["ēthos"]);
            setNominalForm(data.forms, "voc_sg", ["ēthos"]);

            setNominalForm(data.forms, "nom_pl", ["ēthea", "ēthē"]);
            setNominalForm(data.forms, "dat_pl", ["ēthesi", "ēthesin"]);
            setNominalForm(data.forms, "acc_pl", ["ēthea", "ēthē"]);
            setNominalForm(data.forms, "abl_pl", ["ēthesi", "ēthesin"]);
            setNominalForm(data.forms, "voc_pl", ["ēthea", "ēthē"]);
        } else if (stem == "lexis") {
            data.subtitles.push("irregular");
            data.subtitles.push("Greek-type");

            setNominalForm(data.forms, "nom_sg", ["lexis"]);
            setNominalForm(data.forms, "gen_sg", ["lexeōs"]);
            setNominalForm(data.forms, "acc_pl", ["lexeis"]);
        } else if (stem == "Athōs") {
            data.subtitles.push("highly irregular");
            data.subtitles.push("Greek-type");

            setNominalForm(data.forms, "nom_sg", ["Athōs"]);
            setNominalForm(data.forms, "gen_sg", ["Athō"]);
            setNominalForm(data.forms, "dat_sg", ["Athō"]);
            setNominalForm(data.forms, "acc_sg", ["Athō", "Athōn"]);
            setNominalForm(data.forms, "abl_sg", ["Athō"]);
            setNominalForm(data.forms, "voc_sg", ["Athōs"]);
            data.num = NumberTantum.Singular;
        } else if (stem == "vēnum") {
            data.title = "fourth/second-declension noun";
            data.subtitles.push("defective");

            setNominalForm(data.forms, "dat_sg", ["vēnuī", "vēnō"]);
            setNominalForm(data.forms, "acc_sg", ["vēnum"]);
            data.num = NumberTantum.Singular;
        } else if (stem == "vīs") {
            data.subtitles.push("irregular");
            data.subtitles.push("defective");

            setNominalForm(data.forms, "nom_sg", ["vīs"]);
            setNominalForm(data.forms, "gen_sg", ["*vīs"]);
            setNominalForm(data.forms, "dat_sg", ["*vī"]);
            setNominalForm(data.forms, "acc_sg", ["vim"]);
            setNominalForm(data.forms, "abl_sg", ["vī"]);
            setNominalForm(data.forms, "voc_sg", ["vīs"]);

            setNominalForm(data.forms, "nom_pl", ["vīrēs"]);
            setNominalForm(data.forms, "gen_pl", ["vīrium"]);
            setNominalForm(data.forms, "dat_pl", ["vīribus"]);
            setNominalForm(data.forms, "acc_pl", ["vīrēs", "vīrīs"]);
            setNominalForm(data.forms, "abl_pl", ["vīribus"]);
            setNominalForm(data.forms, "voc_pl", ["vīrēs"]);
        } else {
            throw Error(`Stem ${stem} not recognized.`);
        }
    }],
]);

const acc_sg_i_stem_subtypes = new Map<string, [string[], string]>([
    ["acc_im",          [["im"],             "accusative singular in '-im'"]],
    ["acc_im_in",       [["im", "in"],       "accusative singular in '-im' or '-in'"]],
    ["acc_im_in_em",    [["im", "in", "em"], "accusative singular in '-im', '-in' or '-em'"]],
    ["acc_im_em",       [["im", "em"],       "accusative singular in '-im' or '-em'"]],
    ["acc_im_occ_em",   [["im", "em"],       "accusative singular in '-im' or occasionally '-em'"]],
    ["acc_em_im",       [["em", "im"],       "accusative singular in '-em' or '-im'"]],
]);

const abl_sg_i_stem_subtypes = new Map<string, [string[], string]>([
    ["abl_i",       [["ī"],      "ablative singular in '-ī'"]],
    ["abl_i_e",     [["ī", "e"], "ablative singular in '-ī' or '-e'"]],
    ["abl_e_i",     [["e", "ī"], "ablative singular in '-e' or '-ī'"]],
    ["abl_e_occ_i", [["e", "ī"], "ablative singular in '-e' or occasionally '-ī'"]],
]);

function extract_stem(form: string, ending: string): string {
    const base = form.match(new RegExp(`^(.*)${ending}$`));
    if (!base) {
        throw Error(`Form ${form} should end in -${ending}`);
    }
    return base[1];
}

function insert_if_not(data: string[], entry: string, pos = 0) {
    if (data.includes(entry)) {
        return;
    }
    if (pos == 0) {
        data.push(entry);
    } else {
        data.splice(pos - 1, 0, entry);
    }
}
