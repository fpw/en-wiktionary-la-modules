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

export const m_noun_decl: Map<string, ((data: SegmentData, args: string[]) => void)> = new Map([
    ["1", (data, args) => {
        const stem = args[0];

        data.forms.set("nom_sg", [stem + "a"]);
        data.forms.set("gen_sg", [stem + "ae"]);
        data.forms.set("dat_sg", [stem + "ae"]);
        data.forms.set("acc_sg", [stem + "am"]);
        data.forms.set("abl_sg", [stem + "ā"]);
        data.forms.set("voc_sg", [stem + "a"]);

        data.forms.set("nom_pl", [stem + "ae"]);
        data.forms.set("gen_pl", [stem + "ārum"]);
        data.forms.set("dat_pl", [stem + "īs"]);
        data.forms.set("acc_pl", [stem + "ās"]);
        data.forms.set("abl_pl", [stem + "īs"]);
        data.forms.set("voc_pl", [stem + "ae"]);

        if (data.types.has("abus")) {
            data.subtitles.push(["dative/ablative plural in ", "'-ābus'"]);
            data.forms.set("dat_pl", [stem + "ābus"]);
            data.forms.set("abl_pl", [stem + "ābus"]);
        } else if (data.types.has("not_abus")) {
            data.subtitles.push(["dative/ablative plural in ", "'-īs'"]);
        }

        if (data.types.has("am")) {
            data.subtitles.push(["nominative/vocative singular in ", "'-ām'"]);
            data.forms.set("nom_sg", [stem + "ām"]);
            data.forms.set("acc_sg", [stem + "ām"]);
            data.forms.set("voc_sg", [stem + "ām"]);
            data.forms.set("abl_sg", [stem + "ām", stem + "ā"]);
        } else if (data.types.has("Greek")) {
            if (data.types.has("Ma")) {
                data.subtitles.push("masculine Greek-type with nominative singular in '-ās'");
                data.forms.set("nom_sg", [stem + "ās"]);
                data.forms.set("acc_sg", [stem + "ān"]);
                data.forms.set("voc_sg", [stem + "ā"]);
            } else if (data.types.has("Me")) {
                data.subtitles.push("masculine Greek-type with nominative singular in '-ēs'");
                data.forms.set("nom_sg", [stem + "ēs"]);
                data.forms.set("acc_sg", [stem + "ēn"]);
                data.forms.set("abl_sg", [stem + "ē"]);
                data.forms.set("voc_sg", [stem + "ē"]);
            } else {
                data.subtitles.push("Greek-type");
                data.forms.set("nom_sg", [stem + "ē"]);
                data.forms.set("gen_sg", [stem + "ēs"]);
                data.forms.set("acc_sg", [stem + "ēn"]);
                data.forms.set("abl_sg", [stem + "ē"]);
                data.forms.set("voc_sg", [stem + "ē"]);
            }
        } else if (data.types.has("not_Greek")) {
            data.subtitles.push("non-Greek-type");
        } else if (data.types.has("not_am")) {
            data.subtitles.push(["nominative/vocative singular in ", "'-a'"]);
        }

        if (data.loc) {
            data.forms.set("loc_sg", [stem + "ae"]);
            data.forms.set("loc_pl", [stem + "īs"]);
        }
    }],
    ["2", (data, args) => {
        const stem1 = args[0];
        const stem2 = args[1];

        data.forms.set("nom_sg", [stem1 + "us"]);
        data.forms.set("gen_sg", [stem1 + "ī"]);
        data.forms.set("dat_sg", [stem1 + "ō"]);
        data.forms.set("acc_sg", [stem1 + "um"]);
        data.forms.set("abl_sg", [stem1 + "ō"]);
        data.forms.set("voc_sg", [stem1 + "e"]);

        data.forms.set("nom_pl", [stem1 + "ī"]);
        data.forms.set("gen_pl", [stem1 + "ōrum"]);
        data.forms.set("dat_pl", [stem1 + "īs"]);
        data.forms.set("acc_pl", [stem1 + "ōs"]);
        data.forms.set("abl_pl", [stem1 + "īs"]);
        data.forms.set("voc_pl", [stem1 + "ī"]);

        if (data.types.has("N")) {
            data.subtitles.push("neuter");
            data.forms.set("nom_sg", [stem1 + "um"]);
            data.forms.set("voc_sg", [stem1 + "um"]);

            data.forms.set("nom_pl", [stem1 + "a"]);
            data.forms.set("acc_pl", [stem1 + "a"]);
            data.forms.set("voc_pl", [stem1 + "a"]);

            if (data.types.has("ium")) {
                data.forms.set("nom_sg", [stem1 + "ium"]);
                data.forms.set("gen_sg", [stem1 + "iī", stem1 + "ī"]);
                data.forms.set("dat_sg", [stem1 + "iō"]);
                data.forms.set("acc_sg", [stem1 + "ium"]);
                data.forms.set("abl_sg", [stem1 + "iō"]);
                data.forms.set("voc_sg", [stem1 + "ium"]);

                data.forms.set("nom_pl", [stem1 + "ia"]);
                data.forms.set("gen_pl", [stem1 + "iōrum"]);
                data.forms.set("dat_pl", [stem1 + "iīs"]);
                data.forms.set("acc_pl", [stem1 + "ia"]);
                data.forms.set("abl_pl", [stem1 + "iīs"]);
                data.forms.set("voc_pl", [stem1 + "ia"]);

                data.notes.set("gen_sg2", "Found in older Latin (until the Augustan Age).");
            } else if (data.types.has("a")) {
                data.subtitles.push("nominative/accusative/vocative plural in '-a'");

                data.forms.set("nom_sg", [stem1 + "us"]);
                data.forms.set("acc_sg", [stem1 + "us"]);
                data.forms.set("voc_sg", [stem1 + "us"]);

                data.forms.set("nom_pl", [stem1 + "a"]);
                data.forms.set("acc_pl", [stem1 + "a"]);
                data.forms.set("voc_pl", [stem1 + "a"]);
            } else if (data.types.has("vom")) {
                data.subtitles.push("nominative singular in '-om' after 'v'");
                data.forms.set("nom_sg", [stem1 + "om"]);
                data.forms.set("acc_sg", [stem1 + "om"]);
                data.forms.set("voc_sg", [stem1 + "om"]);
            } else if (data.types.has("Greek") && data.types.has("us")) {
                data.subtitles.push("Greek-type");
                data.subtitles.push("nominative/accusative/vocative in '-os'");

                data.forms.set("nom_sg", [stem1 + "os"]);
                data.forms.set("acc_sg", [stem1 + "os"]);
                data.forms.set("voc_sg", [stem1 + "os"]);

                data.forms.set("nom_pl", [stem1 + "ē"]);
                data.forms.set("gen_pl", [stem1 + "ōn"]);
                data.forms.set("acc_pl", [stem1 + "ē"]);
                data.forms.set("voc_pl", [stem1 + "ē"]);
            } else if (data.types.has("Greek")) {
                data.subtitles.push("Greek-type");
                data.forms.set("nom_sg", [stem1 + "on"]);
                data.forms.set("acc_sg", [stem1 + "on"]);
                data.forms.set("voc_sg", [stem1 + "on"]);
            } else if (data.types.has("us")) {
                data.subtitles.push("nominative/accusative/vocative in '-us'");
                data.forms.set("nom_sg", [stem1 + "us"]);
                data.forms.set("acc_sg", [stem1 + "us"]);
                data.forms.set("voc_sg", [stem1 + "us"]);

                data.forms.set("nom_pl", [stem1 + "ī"]);
                data.forms.set("acc_pl", [stem1 + "ōs"]);
                data.forms.set("voc_pl", [stem1 + "ī"]);
            } else if (data.types.has("not_Greek") || data.types.has("not_us")) {
                data.subtitles.push("nominative/accusative/vocative in '-um'");
            }
        } else if (data.types.has("er")) {
            if (stem1.match(/[aiouy]r$/)) {
                data.subtitles.push("nominative singular in '-r'");
            } else {
                data.subtitles.push("nominative singular in '-er'");
            }

            data.forms.set("nom_sg", [stem1]);
            data.forms.set("gen_sg", [stem2 + "ī"]);
            data.forms.set("dat_sg", [stem2 + "ō"]);
            data.forms.set("acc_sg", [stem2 + "um"]);
            data.forms.set("abl_sg", [stem2 + "ō"]);
            data.forms.set("voc_sg", [stem1]);

            data.forms.set("nom_pl", [stem2 + "ī"]);
            data.forms.set("gen_pl", [stem2 + "ōrum"]);
            data.forms.set("dat_pl", [stem2 + "īs"]);
            data.forms.set("acc_pl", [stem2 + "ōs"]);
            data.forms.set("abl_pl", [stem2 + "īs"]);
            data.forms.set("voc_pl", [stem2 + "ī"]);
        } else if (data.types.has("ius")) {
            data.forms.set("nom_sg", [stem1 + "ius"]);
            data.forms.set("gen_sg", [stem1 + "iī", stem1 + "ī"]);
            data.forms.set("dat_sg", [stem1 + "iō"]);
            data.forms.set("acc_sg", [stem1 + "ium"]);
            data.forms.set("abl_sg", [stem1 + "iō"]);

            if (data.types.has("voci")) {
                data.forms.set("voc_sg", [stem1 + "ī"]);
            } else {
                data.forms.set("voc_sg", [stem1 + "ie"]);
            }

            data.forms.set("nom_pl", [stem1 + "iī"]);
            data.forms.set("gen_pl", [stem1 + "iōrum"]);
            data.forms.set("dat_pl", [stem1 + "iīs"]);
            data.forms.set("acc_pl", [stem1 + "iōs"]);
            data.forms.set("abl_pl", [stem1 + "iīs"]);
            data.forms.set("voc_pl", [stem1 + "iī"]);

            data.notes.set("gen_sg2", "Found in older Latin (until the Augustan Age).");
        } else if (data.types.has("vos")) {
            data.subtitles.push("nominative singular in '-os' after 'v'");
            data.forms.set("nom_sg", [stem1 + "os"]);
            data.forms.set("acc_sg", [stem1 + "om"]);
        } else if (data.types.has("Greek")) {
            data.subtitles.push("Greek-type");
            data.forms.set("nom_sg", [stem1 + "os"]);
            data.forms.set("acc_sg", [stem1 + "on"]);
        } else if (data.types.has("not_Greek")) {
            data.subtitles.push("non-Greek-type");
        }

        if (data.types.has("genplum")) {
            data.subtitles.push(["contracted", " genitive plural"]);
            data.notes.set("gen_pl2", "Contraction found in poetry.");
            if (data.types.has("ius") || data.types.has("ium")) {
                data.forms.set("gen_pl", [stem2 + "iōrum", stem2 + "ium"]);
            } else {
                data.forms.set("gen_pl", [stem2 + "ōrum", stem2 + "um"]);
            }
        } else if (data.types.has("not_genplum")) {
            data.subtitles.push(["normal", " genitive plural"]);
        }

        if (data.loc) {
            if (data.types.has("ius") || data.types.has("ium")) {
                data.forms.set("loc_sg", [stem2 + "iī"]);
                data.forms.set("loc_pl", [stem2 + "iīs"]);
            } else {
                data.forms.set("loc_sg", [stem2 + "ī"]);
                data.forms.set("loc_pl", [stem2 + "īs"]);
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

        data.forms.set("nom_sg", [stem1]);
        data.forms.set("gen_sg", [stem2 + "is"]);
        data.forms.set("dat_sg", [stem2 + "ī"]);
        data.forms.set("acc_sg", [stem2 + "em"]);
        data.forms.set("abl_sg", [stem2 + "e"]);
        data.forms.set("voc_sg", [stem1]);

        data.forms.set("nom_pl", [stem2 + "ēs"]);
        data.forms.set("gen_pl", [stem2 + "um"]);
        data.forms.set("dat_pl", [stem2 + "ibus"]);
        data.forms.set("acc_pl", [stem2 + "ēs"]);
        data.forms.set("abl_pl", [stem2 + "ibus"]);
        data.forms.set("voc_pl", [stem2 + "ēs"]);

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

                data.forms.set("nom_sg", [stem1 + "ēr"]);
                data.forms.set("gen_sg", [stem1 + "eris"]);
                data.forms.set("dat_sg", [stem1 + "erī"]);
                data.forms.set("acc_sg", [stem1 + "era", stem1 + "erem"]);
                data.forms.set("abl_sg", [stem1 + "ere"]);
                data.forms.set("voc_sg", [stem1 + "ēr"]);

                data.forms.set("nom_pl", [stem1 + "erēs"]);
                data.forms.set("gen_pl", [stem1 + "erum"]);
                data.forms.set("dat_pl", [stem1 + "eribus"]);
                data.forms.set("acc_pl", [stem1 + "erēs"]);
                data.forms.set("abl_pl", [stem1 + "eribus"]);
                data.forms.set("voc_pl", [stem1 + "erēs"]);
            } else if (data.types.has("on")) {
                data.subtitles.push("variant with nominative singular in '-ōn'");
                stem1 = extract_stem(stem1, "ōn");

                data.forms.set("nom_sg", [stem1 + "ōn"]);
                data.forms.set("gen_sg", [stem1 + "ontis", stem1 + "ontos"]);
                data.forms.set("dat_sg", [stem1 + "ontī"]);
                data.forms.set("acc_sg", [stem1 + "onta"]);
                data.forms.set("abl_sg", [stem1 + "onte"]);
                data.forms.set("voc_sg", [stem1 + "ōn"]);

                data.forms.set("nom_pl", [stem1 + "ontēs"]);
                data.forms.set("gen_pl", [stem1 + "ontum", stem1 + "ontium"]);
                data.forms.set("dat_pl", [stem1 + "ontibus"]);
                data.forms.set("acc_pl", [stem1 + "ontēs", stem1 + "ontās"]);
                data.forms.set("abl_pl", [stem1 + "ontibus"]);
                data.forms.set("voc_pl", [stem1 + "ontēs"]);
            } else if (data.types.has("I")) {
                data.subtitles.push("i-stem");
                data.forms.set("gen_sg", [stem2 + "is", stem2 + "eōs", stem2 + "ios"]);
                data.forms.set("acc_sg", [stem2 + "im", stem2 + "in", stem2 + "em"]);
                data.forms.set("abl_sg", [stem2 + "ī", stem2 + "e"]);
                data.forms.set("voc_sg", [stem2 + "is", stem2 + "i"]);

                data.notes.set("acc_sg3", "Found sometimes in Medieval and New Latin.");
                data.notes.set("abl_sg2", "Found sometimes in Medieval and New Latin.");

                data.forms.set("nom_pl", [stem2 + "ēs", stem2 + "eis"]);
                data.forms.set("gen_pl", [stem2 + "ium", stem2 + "eōn"]);
                data.forms.set("acc_pl", [stem2 + "ēs", stem2 + "eis"]);
                data.forms.set("voc_pl", [stem2 + "ēs", stem2 + "eis"]);

                if (data.types.has("poetic_esi")) {
                    data.forms.set("dat_pl", [stem2 + "ibus", stem2 + "esi"]);
                    data.forms.set("abl_pl", [stem2 + "ibus", stem2 + "esi"]);
                    data.notes.set("dat_pl2", "Primarily in poetry.");
                    data.notes.set("abl_pl2", "Primarily in poetry.");
                }
            } else {
                data.subtitles.push("normal variant");

                data.forms.set("gen_sg", [stem2 + "os"]);
                if (stem2.match(/y$/)) {
                    data.forms.set("acc_sg", [stem2 + "n"]);
                } else {
                    data.forms.set("acc_sg", [stem2 + "a"]);
                }
                data.forms.set("nom_pl", [stem2 + "es"]);
                data.forms.set("acc_pl", [stem2 + "as"]);
                data.forms.set("voc_pl", [stem2 + "es"]);

                if (stem1.match(/[iyï]s$/)) {
                    data.forms.set("voc_sg", [stem1, stem1.replace(/s/g, "")]);
                    data.notes.set("voc_sg2", "In poetry.");
                }
            }
        } else if (data.types.has("not_Greek")) {
            data.subtitles.push("non-Greek-type");
        }

        if (data.types.has("polis")) {
            stem1 = extract_stem(stem1, "polis");
            data.subtitles.push("i-stem, partially Greek-type");
            data.forms.set("nom_sg", [stem1 + "polis"]);
            data.forms.set("gen_sg", [stem1 + "polis"]);
            data.forms.set("dat_sg", [stem1 + "polī"]);
            data.forms.set("acc_sg", [stem1 + "polim", stem1 + "polin"]);
            data.forms.set("abl_sg", [stem1 + "polī"]);
            data.forms.set("voc_sg", [stem1 + "polis", stem1 + "polī"]);
        } else if (data.types.has("not_polis")) {
            data.subtitles.push(non_i_stem_type());
        }

        if (data.types.has("N")) {
            data.subtitles.push("neuter");

            data.forms.set("acc_sg", [stem1]);

            if (data.types.has("I")) {
                if (data.types.has("pure")) {
                    data.subtitles.push("“pure” i-stem");

                    data.forms.set("abl_sg", [stem2 + "ī"]);

                    data.forms.set("nom_pl", [stem2 + "ia"]);
                    data.forms.set("gen_pl", [stem2 + "ium"]);
                    data.forms.set("acc_pl", [stem2 + "ia"]);
                    data.forms.set("voc_pl", [stem2 + "ia"]);
                } else {
                    data.subtitles.push("i-stem");
                    data.forms.set("nom_pl", [stem2 + "a"]);
                    data.forms.set("gen_pl", [stem2 + "ium", stem2 + "um"]);
                    data.forms.set("acc_pl", [stem2 + "a"]);
                    data.forms.set("voc_pl", [stem2 + "a"]);
                }
            } else {
                data.subtitles.push(non_i_stem_type());
                data.forms.set("nom_pl", [stem2 + "a"]);
                data.forms.set("acc_pl", [stem2 + "a"]);
                data.forms.set("voc_pl", [stem2 + "a"]);
            }
        } else if (data.types.has("I") || acc_sg_i_stem_subtype || abl_sg_i_stem_subtype) {
            if (data.types.has("not_N")) {
                data.subtitles.push("non-neuter i-stem");
            } else {
                data.subtitles.push("i-stem");
            }

            data.forms.set("gen_pl", [stem2 + "ium"]);
            data.forms.set("acc_pl", [stem2 + "ēs", stem2 + "īs"]);

            for (const subtype of data.types) {
                const acc_sg_i_stem_props = acc_sg_i_stem_subtypes.get(subtype);
                if (acc_sg_i_stem_props) {
                    data.forms.set("acc_sg", []);
                    for (const ending of acc_sg_i_stem_props[0]) {
                        data.forms.set("acc_sg", (data.forms.get("acc_sg") || []).concat([stem2 + ending]));
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
                    data.forms.set("abl_sg", []);
                    for (const ending of abl_sg_i_stem_props[0]) {
                        data.forms.set("abl_sg", (data.forms.get("abl_sg") || []).concat([stem2 + ending]));
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
            const loc_sg = Array.from(data.forms.get("dat_sg") || []);
            const abl_sg = data.forms.get("abl_sg") || [];
            for (const form of abl_sg) {
                insert_if_not(loc_sg, form);
            }
            data.forms.set("loc_sg", loc_sg);
            data.forms.set("loc_pl", data.forms.get("abl_pl") || []);
        }
    }],
    ["4", (data, args) => {
        const stem = args[0];

        data.forms.set("nom_sg", [stem + "us"]);
        data.forms.set("gen_sg", [stem + "ūs"]);
        data.forms.set("dat_sg", [stem + "uī"]);
        data.forms.set("acc_sg", [stem + "um"]);
        data.forms.set("abl_sg", [stem + "ū"]);
        data.forms.set("voc_sg", [stem + "us"]);

        data.forms.set("nom_pl", [stem + "ūs"]);
        data.forms.set("gen_pl", [stem + "uum"]);
        data.forms.set("dat_pl", [stem + "ibus"]);
        data.forms.set("acc_pl", [stem + "ūs"]);
        data.forms.set("abl_pl", [stem + "ibus"]);
        data.forms.set("voc_pl", [stem + "ūs"]);

        if (data.types.has("echo")) {
            data.subtitles.push("nominative/vocative singular in '-ō'");
            data.forms.set("nom_sg", [stem + "ō"]);
            data.forms.set("voc_sg", [stem + "ō"]);
        } else if (data.types.has("argo")) {
            data.subtitles.push("nominative/accusative/vocative singular in '-ō', ablative singular in '-uī'");
            data.forms.set("nom_sg", [stem + "ō"]);
            data.forms.set("acc_sg", [stem + "ō"]);
            data.forms.set("abl_sg", [stem + "uī"]);
            data.forms.set("voc_sg", [stem + "ō"]);
        } else if (data.types.has("Callisto")) {
            data.subtitles.push("all cases except the genitive singular in '-ō'");
            data.forms.set("nom_sg", [stem + "ō"]);
            data.forms.set("dat_sg", [stem + "ō"]);
            data.forms.set("acc_sg", [stem + "ō"]);
            data.forms.set("abl_sg", [stem + "ō"]);
            data.forms.set("voc_sg", [stem + "ō"]);
        }

        if (data.types.has("N")) {
            data.subtitles.push("neuter");

            data.forms.set("nom_sg", [stem + "ū"]);
            data.forms.set("dat_sg", [stem + "ū"]);
            data.forms.set("acc_sg", [stem + "ū"]);
            data.forms.set("voc_sg", [stem + "ū"]);

            data.forms.set("nom_pl", [stem + "ua"]);
            data.forms.set("acc_pl", [stem + "ua"]);
            data.forms.set("voc_pl", [stem + "ua"]);
        }

        if (data.types.has("ubus")) {
            data.subtitles.push("dative/ablative plural in '-ubus'");

            data.forms.set("dat_pl", [stem + "ubus"]);
            data.forms.set("abl_pl", [stem + "ubus"]);
        } else if (data.types.has("not_ubus")) {
            data.subtitles.push("'-ibus'");
        }

        if (data.loc) {
            data.forms.set("loc_sg", data.forms.get("abl_sg") || []);
            data.forms.set("loc_pl", data.forms.get("abl_pl") || []);
        }

    }],
    ["5", (data, args) => {
        let stem = args[0];

        if (data.types.has("i")) {
            stem = stem + "i";
        }

        data.forms.set("nom_sg", [stem + "ēs"]);
        data.forms.set("gen_sg", [stem + "eī"]);
        data.forms.set("dat_sg", [stem + "eī"]);
        data.forms.set("acc_sg", [stem + "em"]);
        data.forms.set("abl_sg", [stem + "ē"]);
        data.forms.set("voc_sg", [stem + "ēs"]);

        data.forms.set("nom_pl", [stem + "ēs"]);
        data.forms.set("gen_pl", [stem + "ērum"]);
        data.forms.set("dat_pl", [stem + "ēbus"]);
        data.forms.set("acc_pl", [stem + "ēs"]);
        data.forms.set("abl_pl", [stem + "ēbus"]);
        data.forms.set("voc_pl", [stem + "ēs"]);

        if (data.types.has("i")) {
            data.forms.set("gen_sg", [stem + "ēī"]);
            data.forms.set("dat_sg", [stem + "ēī"]);
        }

        if (data.loc) {
            data.forms.set("loc_sg", [stem + "ē"]);
            data.forms.set("loc_pl", [stem + "ēbus"]);
        }
    }],
    ["0", (data, args) => {
        const stem = args[0];

        data.forms.set("nom_sg", [stem]);
        data.forms.set("gen_sg", [stem]);
        data.forms.set("dat_sg", [stem]);
        data.forms.set("acc_sg", [stem]);
        data.forms.set("abl_sg", [stem]);
        data.forms.set("voc_sg", [stem]);

        data.forms.set("nom_pl", [stem]);
        data.forms.set("gen_pl", [stem]);
        data.forms.set("dat_pl", [stem]);
        data.forms.set("acc_pl", [stem]);
        data.forms.set("abl_pl", [stem]);
        data.forms.set("voc_pl", [stem]);

        if (data.loc) {
            data.forms.set("loc_sg", [stem]);
            data.forms.set("loc_pl", [stem]);
        }
    }],
    ["indecl", (data, args) => {
        data.title = "Not declined; used only in the nominative and accusative singular.";

        const stem = args[0];

        data.forms.set("nom_sg", ["-"]);
        data.forms.set("gen_sg", ["-"]);
        data.forms.set("dat_sg", ["-"]);
        data.forms.set("acc_sg", ["-"]);
        data.forms.set("abl_sg", ["-"]);
        data.forms.set("voc_sg", ["-"]);

        data.forms.set("nom_pl", ["-"]);
        data.forms.set("gen_pl", ["-"]);
        data.forms.set("dat_pl", ["-"]);
        data.forms.set("acc_pl", ["-"]);
        data.forms.set("abl_pl", ["-"]);
        data.forms.set("voc_pl", ["-"]);

        data.forms.set("nom_sg", [stem]);
        data.forms.set("acc_sg", [stem]);
        data.num = NumberTantum.Singular;
    }],
    ["irreg", (data, args) => {
        const stem = args[0];
        data.forms.set("nom_sg", ["-"]);
        data.forms.set("gen_sg", ["-"]);
        data.forms.set("dat_sg", ["-"]);
        data.forms.set("acc_sg", ["-"]);
        data.forms.set("abl_sg", ["-"]);
        data.forms.set("voc_sg", ["-"]);

        data.forms.set("nom_pl", ["-"]);
        data.forms.set("gen_pl", ["-"]);
        data.forms.set("dat_pl", ["-"]);
        data.forms.set("acc_pl", ["-"]);
        data.forms.set("abl_pl", ["-"]);
        data.forms.set("voc_pl", ["-"]);

        if (stem == "bōs") {
            data.forms.set("nom_sg", ["bōs"]);
            data.forms.set("gen_sg", ["bovis"]);
            data.forms.set("dat_sg", ["bovī"]);
            data.forms.set("acc_sg", ["bovem"]);
            data.forms.set("abl_sg", ["bove"]);
            data.forms.set("voc_sg", ["bōs"]);

            data.forms.set("nom_pl", ["bovēs"]);
            data.forms.set("gen_pl", ["boum"]);
            data.forms.set("dat_pl", ["bōbus", "būbus"]);
            data.forms.set("acc_pl", ["bovēs"]);
            data.forms.set("abl_pl", ["bōbus", "būbus"]);
            data.forms.set("voc_pl", ["bovēs"]);
        } else if (stem == "cherub") {
            data.title = "mostly indeclinable";
            data.subtitles.push("with a distinct plural");

            data.forms.set("nom_sg", ["cherub"]);
            data.forms.set("gen_sg", ["cherub"]);
            data.forms.set("dat_sg", ["cherub"]);
            data.forms.set("acc_sg", ["cherub"]);
            data.forms.set("abl_sg", ["cherub"]);
            data.forms.set("voc_sg", ["cherub"]);

            data.forms.set("nom_pl", ["cherubim", "cherubin"]);
            data.forms.set("gen_pl", ["cherubim", "cherubin"]);
            data.forms.set("dat_pl", ["cherubim", "cherubin"]);
            data.forms.set("acc_pl", ["cherubim", "cherubin"]);
            data.forms.set("abl_pl", ["cherubim", "cherubin"]);
            data.forms.set("voc_pl", ["cherubim", "cherubin"]);
        } else if (stem == "deus") {
            data.forms.set("nom_sg", ["deus"]);
            data.forms.set("gen_sg", ["deī"]);
            data.forms.set("dat_sg", ["deō"]);
            data.forms.set("acc_sg", ["deum"]);
            data.forms.set("abl_sg", ["deō"]);
            data.forms.set("voc_sg", ["deus"]);

            data.forms.set("nom_pl", ["dī", "diī", "deī"]);
            data.forms.set("gen_pl", ["deōrum", "deûm", "divom"]);
            data.forms.set("dat_pl", ["dīs", "diīs", "deīs"]);
            data.forms.set("acc_pl", ["deōs"]);
            data.forms.set("abl_pl", ["dīs", "diīs", "deīs"]);
            data.forms.set("voc_pl", ["dī", "diī", "deī"]);
        } else if (stem == "Deus") {
            data.forms.set("nom_sg", ["Deus"]);
            data.forms.set("gen_sg", ["Deī"]);
            data.forms.set("dat_sg", ["Deō"]);
            data.forms.set("acc_sg", ["Deum"]);
            data.forms.set("abl_sg", ["Deō"]);
            data.forms.set("voc_sg", ["Deus"]);
            data.num = NumberTantum.Singular;
        } else if (stem == "domus") {
            data.title = "fourth/second-declension noun";

            data.forms.set("nom_sg", ["domus"]);
            data.forms.set("gen_sg", ["domūs", "domī"]);
            data.forms.set("dat_sg", ["domuī", "domō", "domū"]);
            data.forms.set("acc_sg", ["domum"]);
            data.forms.set("abl_sg", ["domū", "domō"]);
            data.forms.set("voc_sg", ["domus"]);
            data.forms.set("loc_sg", ["domī"]);

            data.forms.set("nom_pl", ["domūs"]);
            data.forms.set("gen_pl", ["domuum", "domōrum"]);
            data.forms.set("dat_pl", ["domibus"]);
            data.forms.set("acc_pl", ["domūs", "domōs"]);
            data.forms.set("abl_pl", ["domibus"]);
            data.forms.set("voc_pl", ["domūs"]);
            data.forms.set("loc_pl", ["domibus"]);

            data.loc = true;
        } else if (stem == "Iēsus" || stem == "Jēsus" || stem == "Iēsūs" || stem == "Jēsūs") {
            data.subtitles.push("highly irregular");
            const ij = stem[0];
            data.forms.set("nom_sg", [stem]);
            data.forms.set("gen_sg", [ij + "ēsū"]);
            data.forms.set("dat_sg", [ij + "ēsū"]);
            data.forms.set("acc_sg", [ij + "ēsum"]);
            data.forms.set("abl_sg", [ij + "ēsū"]);
            data.forms.set("voc_sg", [ij + "ēsū"]);
            data.num = NumberTantum.Singular;
        } else if (stem == "iūgerum" || stem == "jūgerum") {
            const ij = stem[0];
            data.title = "second–third-declension hybrid noun";
            data.subtitles.push("neuter");

            data.forms.set("nom_sg", [ij + "ūgerum"]);
            data.forms.set("gen_sg", [ij + "ūgerī"]);
            data.forms.set("dat_sg", [ij + "ūgerō"]);
            data.forms.set("acc_sg", [ij + "ūgerum"]);
            data.forms.set("abl_sg", [ij + "ūgerō"]);
            data.forms.set("voc_sg", [ij + "ūgerum"]);
            data.forms.set("nom_pl", [ij + "ūgera"]);
            data.forms.set("gen_pl", [ij + "ūgerum"]);
            data.forms.set("dat_pl", [ij + "ūgeribus"]);
            data.forms.set("acc_pl", [ij + "ūgera"]);
            data.forms.set("abl_pl", [ij + "ūgeribus", ij + "ūgerīs"]);
            data.forms.set("voc_pl", [ij + "ūgera"]);

            data.notes.set("abl_pl2", "Once only, in:<br/>M. Terentius Varro, 'Res Rusticae', bk I, ch. x");
        } else if (stem == "sūs") {
            data.forms.set("nom_sg", ["sūs"]);
            data.forms.set("gen_sg", ["suis"]);
            data.forms.set("dat_sg", ["suī"]);
            data.forms.set("acc_sg", ["suem"]);
            data.forms.set("abl_sg", ["sue"]);
            data.forms.set("voc_sg", ["sūs"]);

            data.forms.set("nom_pl", ["suēs"]);
            data.forms.set("gen_pl", ["suum"]);
            data.forms.set("dat_pl", ["suibus", "sūbus", "subus"]);
            data.forms.set("acc_pl", ["suēs"]);
            data.forms.set("abl_pl", ["suibus", "sūbus", "subus"]);
            data.forms.set("voc_pl", ["suēs"]);
        } else if (stem == "ēthos") {
            data.subtitles.push("irregular");
            data.subtitles.push("Greek-type");

            data.forms.set("nom_sg", ["ēthos"]);
            data.forms.set("gen_sg", ["ētheos"]);
            data.forms.set("acc_sg", ["ēthos"]);
            data.forms.set("voc_sg", ["ēthos"]);

            data.forms.set("nom_pl", ["ēthea", "ēthē"]);
            data.forms.set("dat_pl", ["ēthesi", "ēthesin"]);
            data.forms.set("acc_pl", ["ēthea", "ēthē"]);
            data.forms.set("abl_pl", ["ēthesi", "ēthesin"]);
            data.forms.set("voc_pl", ["ēthea", "ēthē"]);
        } else if (stem == "lexis") {
            data.subtitles.push("irregular");
            data.subtitles.push("Greek-type");

            data.forms.set("nom_sg", ["lexis"]);
            data.forms.set("gen_sg", ["lexeōs"]);
            data.forms.set("acc_pl", ["lexeis"]);
        } else if (stem == "Athōs") {
            data.subtitles.push("highly irregular");
            data.subtitles.push("Greek-type");

            data.forms.set("nom_sg", ["Athōs"]);
            data.forms.set("gen_sg", ["Athō"]);
            data.forms.set("dat_sg", ["Athō"]);
            data.forms.set("acc_sg", ["Athō", "Athōn"]);
            data.forms.set("abl_sg", ["Athō"]);
            data.forms.set("voc_sg", ["Athōs"]);
            data.num = NumberTantum.Singular;
        } else if (stem == "vēnum") {
            data.title = "fourth/second-declension noun";
            data.subtitles.push("defective");

            data.forms.set("dat_sg", ["vēnuī", "vēnō"]);
            data.forms.set("acc_sg", ["vēnum"]);
            data.num = NumberTantum.Singular;
        } else if (stem == "vīs") {
            data.subtitles.push("irregular");
            data.subtitles.push("defective");

            data.forms.set("nom_sg", ["vīs"]);
            data.forms.set("gen_sg", ["*vīs"]);
            data.forms.set("dat_sg", ["*vī"]);
            data.forms.set("acc_sg", ["vim"]);
            data.forms.set("abl_sg", ["vī"]);
            data.forms.set("voc_sg", ["vīs"]);

            data.forms.set("nom_pl", ["vīrēs"]);
            data.forms.set("gen_pl", ["vīrium"]);
            data.forms.set("dat_pl", ["vīribus"]);
            data.forms.set("acc_pl", ["vīrēs", "vīrīs"]);
            data.forms.set("abl_pl", ["vīribus"]);
            data.forms.set("voc_pl", ["vīrēs"]);
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
