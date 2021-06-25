import { FormMap } from "../common";

export enum PPronForm {
    NomSg1 = "nom_1s",
    GenSg1 = "gen_1s",
    DatSg1 = "dat_1s",
    AccSg1 = "acc_1s",
    AblSg1 = "abl_1s",

    NomPl1 = "nom_1p",
    GenPl1 = "gen_1p",
    DatPl1 = "dat_1p",
    AccPl1 = "acc_1p",
    AblPl1 = "abl_1p",

    NomSg2 = "nom_2s",
    GenSg2 = "gen_2s",
    DatSg2 = "dat_2s",
    AccSg2 = "acc_2s",
    AblSg2 = "abl_2s",

    NomPl2 = "nom_2p",
    GenPl2 = "gen_2p",
    DatPl2 = "dat_2p",
    AccPl2 = "acc_2p",
    AblPl2 = "abl_2p",

    GenRef = "gen_ref",
    DatRef = "dat_ref",
    AccRef = "acc_ref",
    AblRef = "abl_ref",
}

export interface PersonalPronounData {
    templateType: "ppron";
    forms: FormMap<PPronForm>;
}

export class LaPersonalPronoun {
    public make_data(): PersonalPronounData {
        const forms = new Map<PPronForm, string[]>([
            [PPronForm.NomSg1, ["ego"]],
            [PPronForm.AccSg1, ["mē"]],
            [PPronForm.GenSg1, ["meī"]],
            [PPronForm.DatSg1, ["mihi"]],
            [PPronForm.AblSg1, ["mē"]],

            [PPronForm.NomPl1, ["nōs"]],
            [PPronForm.AccPl1, ["nōs"]],
            [PPronForm.GenPl1, ["nostrum", "nostrī"]],
            [PPronForm.DatPl1, ["nōbīs"]],
            [PPronForm.AblPl1, ["nōbīs"]],

            [PPronForm.NomSg2, ["tū"]],
            [PPronForm.AccSg2, ["tē"]],
            [PPronForm.GenSg2, ["tuī"]],
            [PPronForm.DatSg2, ["tibi", "tibī"]],
            [PPronForm.AblSg2, ["tē"]],

            [PPronForm.NomPl2, ["vōs"]],
            [PPronForm.AccPl2, ["vōs"]],
            [PPronForm.GenPl2, ["vestrum", "vestrī"]],
            [PPronForm.DatPl2, ["vōbīs"]],
            [PPronForm.AblPl2, ["vōbīs"]],

            [PPronForm.AccRef, ["sē", "sēsē"]],
            [PPronForm.GenRef, ["suī"]],
            [PPronForm.DatRef, ["sibi"]],
            [PPronForm.AblRef, ["sē", "sēsē"]],
        ]);

        return {
            templateType: "ppron",
            forms: forms
        };
    }
}
