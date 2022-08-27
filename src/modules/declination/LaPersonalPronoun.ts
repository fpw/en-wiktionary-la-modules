import { ArgMap, FormMap } from "../common";
import { NumberTantum } from "./LaNominal";
import { NominalForm } from "./NominalForm";

export interface PersonalPronounData {
    templateType: "ppron";
    forms: FormMap<NominalForm>;
    pers: 1 | 2 | 3;
    num: NumberTantum;
}

export class LaPersonalPronoun {
    public make_data(args: ArgMap): PersonalPronounData {
        const lemma = args.get("1");
        let forms: Map<NominalForm, string[]>;
        let num: NumberTantum;
        let pers: 1 | 2 | 3;

        switch (lemma) {
            case undefined:
            case "":
            case "ego":
                forms = new Map<NominalForm, string[]>([
                    [NominalForm.NomSg, ["ego"]],
                    [NominalForm.AccSg, ["mē"]],
                    [NominalForm.GenSg, ["meī"]],
                    [NominalForm.DatSg, ["mihi"]],
                    [NominalForm.AblSg, ["mē"]],
                ]);
                pers = 1;
                num = NumberTantum.Singular;
                break;
            case "nōs":
                forms = new Map<NominalForm, string[]>([
                    [NominalForm.NomPl, ["nōs"]],
                    [NominalForm.AccPl, ["nōs"]],
                    [NominalForm.GenPl, ["nostrum", "nostrī"]],
                    [NominalForm.DatPl, ["nōbīs"]],
                    [NominalForm.AblPl, ["nōbīs"]],
                ]);
                pers = 1;
                num = NumberTantum.Plural;
                break;
            case "tū":
                forms = new Map<NominalForm, string[]>([
                    [NominalForm.NomSg, ["tū"]],
                    [NominalForm.AccSg, ["tē"]],
                    [NominalForm.GenSg, ["tuī"]],
                    [NominalForm.DatSg, ["tibi", "tibī"]],
                    [NominalForm.AblSg, ["tē"]],
                ]);
                pers = 2;
                num = NumberTantum.Singular;
                break;
            case "vōs":
                forms = new Map<NominalForm, string[]>([
                    [NominalForm.NomPl, ["vōs"]],
                    [NominalForm.AccPl, ["vōs"]],
                    [NominalForm.GenPl, ["vestrum", "vestrī"]],
                    [NominalForm.DatPl, ["vōbīs"]],
                    [NominalForm.AblPl, ["vōbīs"]],
                ]);
                pers = 2;
                num = NumberTantum.Plural;
                break;
            case "sē":
                forms = new Map<NominalForm, string[]>([
                    [NominalForm.AccSg, ["sē", "sēsē"]],
                    [NominalForm.GenSg, ["suī"]],
                    [NominalForm.DatSg, ["sibi"]],
                    [NominalForm.AblSg, ["sē", "sēsē"]],

                    [NominalForm.AccPl, ["sē", "sēsē"]],
                    [NominalForm.GenPl, ["suī"]],
                    [NominalForm.DatPl, ["sibi"]],
                    [NominalForm.AblPl, ["sē", "sēsē"]],
                ]);
                pers = 3;
                num = NumberTantum.Both;
                break;
            default:
                throw Error(`Unknown ppron lemma: ${lemma}`);
        }

        return {
            templateType: "ppron",
            forms: forms,
            pers: pers,
            num: num,
        };
    }
}
