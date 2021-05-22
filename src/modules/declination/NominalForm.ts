import { FormMap, is_enum_value } from "../common";

export enum NominalForm {
    NomSg = "nom_sg",
    LinkedNomSg = "linked_nom_sg",
    NomPl = "nom_pl",
    LinkedNomPl = "linked_nom_pl",
    AccSg = "acc_sg",
    AccPl = "acc_pl",
    GenSg = "gen_sg",
    GenPl = "gen_pl",
    LocSg = "loc_sg",
    LocPl = "loc_pl",
    DatSg = "dat_sg",
    DatPl = "dat_pl",
    AblSg = "abl_sg",
    AblPl = "abl_pl",
    VocSg = "voc_sg",
    VocPl = "voc_pl",

    NomSgM = "nom_sg_m",
    LinkedNomSgM = "linked_nom_sg_m",
    NomPlM = "nom_pl_m",
    LinkedNomPlM = "linked_nom_pl_m",
    AccSgM = "acc_sg_m",
    AccPlM = "acc_pl_m",
    GenSgM = "gen_sg_m",
    GenPlM = "gen_pl_m",
    LocSgM = "loc_sg_m",
    LocPlM = "loc_pl_m",
    DatSgM = "dat_sg_m",
    DatPlM = "dat_pl_m",
    AblSgM = "abl_sg_m",
    AblPlM = "abl_pl_m",
    VocSgM = "voc_sg_m",
    VocPlM = "voc_pl_m",

    NomSgF = "nom_sg_f",
    LinkedNomSgF = "linked_nom_sg_f",
    NomPlF = "nom_pl_f",
    LinkedNomPlF = "linked_nom_pl_f",
    AccSgF = "acc_sg_f",
    AccPlF = "acc_pl_f",
    GenSgF = "gen_sg_f",
    GenPlF = "gen_pl_f",
    LocSgF = "loc_sg_f",
    LocPlF = "loc_pl_f",
    DatSgF = "dat_sg_f",
    DatPlF = "dat_pl_f",
    AblSgF = "abl_sg_f",
    AblPlF = "abl_pl_f",
    VocSgF = "voc_sg_f",
    VocPlF = "voc_pl_f",

    NomSgN = "nom_sg_n",
    LinkedNomSgN = "linked_nom_sg_n",
    NomPlN = "nom_pl_n",
    LinkedNomPlN = "linked_nom_pl_n",
    AccSgN = "acc_sg_n",
    AccPlN = "acc_pl_n",
    GenSgN = "gen_sg_n",
    GenPlN = "gen_pl_n",
    LocSgN = "loc_sg_n",
    LocPlN = "loc_pl_n",
    DatSgN = "dat_sg_n",
    DatPlN = "dat_pl_n",
    AblSgN = "abl_sg_n",
    AblPlN = "abl_pl_n",
    VocSgN = "voc_sg_n",
    VocPlN = "voc_pl_n",
}

export function setNominalForm(forms: FormMap<NominalForm>, form: string, values: string[] | undefined) {
    if (!is_enum_value(NominalForm, form)) {
        throw Error(`Invalid nominal form ${form}: ${values}`);
    }
    if (values) {
        forms.set(form, values);
    } else {
        forms.delete(form);
    }
}

export function getNominalForm(forms: FormMap<NominalForm>, form: string): string[] | undefined {
    if (!is_enum_value(NominalForm, form)) {
        throw Error(`Invalid nominal form ${form}`);
    }
    return forms.get(form);
}
