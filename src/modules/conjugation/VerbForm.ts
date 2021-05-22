import { FormMap, is_enum_value } from "../common";

export enum VerbForm {
    pres_actv_indc_1s = "1s_pres_actv_indc",
    pres_actv_indc_2s = "2s_pres_actv_indc",
    pres_actv_indc_3s = "3s_pres_actv_indc",
    pres_actv_indc_1p = "1p_pres_actv_indc",
    pres_actv_indc_2p = "2p_pres_actv_indc",
    pres_actv_indc_3p = "3p_pres_actv_indc",

    impf_actv_indc_1s = "1s_impf_actv_indc",
    impf_actv_indc_2s = "2s_impf_actv_indc",
    impf_actv_indc_3s = "3s_impf_actv_indc",
    impf_actv_indc_1p = "1p_impf_actv_indc",
    impf_actv_indc_2p = "2p_impf_actv_indc",
    impf_actv_indc_3p = "3p_impf_actv_indc",

    futr_actv_indc_1s = "1s_futr_actv_indc",
    futr_actv_indc_2s = "2s_futr_actv_indc",
    futr_actv_indc_3s = "3s_futr_actv_indc",
    futr_actv_indc_1p = "1p_futr_actv_indc",
    futr_actv_indc_2p = "2p_futr_actv_indc",
    futr_actv_indc_3p = "3p_futr_actv_indc",

    perf_actv_indc_1s = "1s_perf_actv_indc",
    perf_actv_indc_2s = "2s_perf_actv_indc",
    perf_actv_indc_3s = "3s_perf_actv_indc",
    perf_actv_indc_1p = "1p_perf_actv_indc",
    perf_actv_indc_2p = "2p_perf_actv_indc",
    perf_actv_indc_3p = "3p_perf_actv_indc",

    plup_actv_indc_1s = "1s_plup_actv_indc",
    plup_actv_indc_2s = "2s_plup_actv_indc",
    plup_actv_indc_3s = "3s_plup_actv_indc",
    plup_actv_indc_1p = "1p_plup_actv_indc",
    plup_actv_indc_2p = "2p_plup_actv_indc",
    plup_actv_indc_3p = "3p_plup_actv_indc",

    futp_actv_indc_1s = "1s_futp_actv_indc",
    futp_actv_indc_2s = "2s_futp_actv_indc",
    futp_actv_indc_3s = "3s_futp_actv_indc",
    futp_actv_indc_1p = "1p_futp_actv_indc",
    futp_actv_indc_2p = "2p_futp_actv_indc",
    futp_actv_indc_3p = "3p_futp_actv_indc",

    pres_actv_subj_1s = "1s_pres_actv_subj",
    pres_actv_subj_2s = "2s_pres_actv_subj",
    pres_actv_subj_3s = "3s_pres_actv_subj",
    pres_actv_subj_1p = "1p_pres_actv_subj",
    pres_actv_subj_2p = "2p_pres_actv_subj",
    pres_actv_subj_3p = "3p_pres_actv_subj",

    impf_actv_subj_1s = "1s_impf_actv_subj",
    impf_actv_subj_2s = "2s_impf_actv_subj",
    impf_actv_subj_3s = "3s_impf_actv_subj",
    impf_actv_subj_1p = "1p_impf_actv_subj",
    impf_actv_subj_2p = "2p_impf_actv_subj",
    impf_actv_subj_3p = "3p_impf_actv_subj",

    perf_actv_subj_1s = "1s_perf_actv_subj",
    perf_actv_subj_2s = "2s_perf_actv_subj",
    perf_actv_subj_3s = "3s_perf_actv_subj",
    perf_actv_subj_1p = "1p_perf_actv_subj",
    perf_actv_subj_2p = "2p_perf_actv_subj",
    perf_actv_subj_3p = "3p_perf_actv_subj",

    plup_actv_subj_1s = "1s_plup_actv_subj",
    plup_actv_subj_2s = "2s_plup_actv_subj",
    plup_actv_subj_3s = "3s_plup_actv_subj",
    plup_actv_subj_1p = "1p_plup_actv_subj",
    plup_actv_subj_2p = "2p_plup_actv_subj",
    plup_actv_subj_3p = "3p_plup_actv_subj",

    pres_actv_impr_1s = "1s_pres_actv_impr",
    pres_actv_impr_2s = "2s_pres_actv_impr",
    pres_actv_impr_3s = "3s_pres_actv_impr",
    pres_actv_impr_1p = "1p_pres_actv_impr",
    pres_actv_impr_2p = "2p_pres_actv_impr",
    pres_actv_impr_3p = "3p_pres_actv_impr",

    futr_actv_impr_1s = "1s_futr_actv_impr",
    futr_actv_impr_2s = "2s_futr_actv_impr",
    futr_actv_impr_3s = "3s_futr_actv_impr",
    futr_actv_impr_1p = "1p_futr_actv_impr",
    futr_actv_impr_2p = "2p_futr_actv_impr",
    futr_actv_impr_3p = "3p_futr_actv_impr",

    pres_pasv_indc_1s = "1s_pres_pasv_indc",
    pres_pasv_indc_2s = "2s_pres_pasv_indc",
    pres_pasv_indc_3s = "3s_pres_pasv_indc",
    pres_pasv_indc_1p = "1p_pres_pasv_indc",
    pres_pasv_indc_2p = "2p_pres_pasv_indc",
    pres_pasv_indc_3p = "3p_pres_pasv_indc",

    impf_pasv_indc_1s = "1s_impf_pasv_indc",
    impf_pasv_indc_2s = "2s_impf_pasv_indc",
    impf_pasv_indc_3s = "3s_impf_pasv_indc",
    impf_pasv_indc_1p = "1p_impf_pasv_indc",
    impf_pasv_indc_2p = "2p_impf_pasv_indc",
    impf_pasv_indc_3p = "3p_impf_pasv_indc",

    futr_pasv_indc_1s = "1s_futr_pasv_indc",
    futr_pasv_indc_2s = "2s_futr_pasv_indc",
    futr_pasv_indc_3s = "3s_futr_pasv_indc",
    futr_pasv_indc_1p = "1p_futr_pasv_indc",
    futr_pasv_indc_2p = "2p_futr_pasv_indc",
    futr_pasv_indc_3p = "3p_futr_pasv_indc",

    perf_pasv_indc_1s = "1s_perf_pasv_indc",
    perf_pasv_indc_2s = "2s_perf_pasv_indc",
    perf_pasv_indc_3s = "3s_perf_pasv_indc",
    perf_pasv_indc_1p = "1p_perf_pasv_indc",
    perf_pasv_indc_2p = "2p_perf_pasv_indc",
    perf_pasv_indc_3p = "3p_perf_pasv_indc",

    plup_pasv_indc_1s = "1s_plup_pasv_indc",
    plup_pasv_indc_2s = "2s_plup_pasv_indc",
    plup_pasv_indc_3s = "3s_plup_pasv_indc",
    plup_pasv_indc_1p = "1p_plup_pasv_indc",
    plup_pasv_indc_2p = "2p_plup_pasv_indc",
    plup_pasv_indc_3p = "3p_plup_pasv_indc",

    futp_pasv_indc_1s = "1s_futp_pasv_indc",
    futp_pasv_indc_2s = "2s_futp_pasv_indc",
    futp_pasv_indc_3s = "3s_futp_pasv_indc",
    futp_pasv_indc_1p = "1p_futp_pasv_indc",
    futp_pasv_indc_2p = "2p_futp_pasv_indc",
    futp_pasv_indc_3p = "3p_futp_pasv_indc",

    pres_pasv_subj_1s = "1s_pres_pasv_subj",
    pres_pasv_subj_2s = "2s_pres_pasv_subj",
    pres_pasv_subj_3s = "3s_pres_pasv_subj",
    pres_pasv_subj_1p = "1p_pres_pasv_subj",
    pres_pasv_subj_2p = "2p_pres_pasv_subj",
    pres_pasv_subj_3p = "3p_pres_pasv_subj",

    impf_pasv_subj_1s = "1s_impf_pasv_subj",
    impf_pasv_subj_2s = "2s_impf_pasv_subj",
    impf_pasv_subj_3s = "3s_impf_pasv_subj",
    impf_pasv_subj_1p = "1p_impf_pasv_subj",
    impf_pasv_subj_2p = "2p_impf_pasv_subj",
    impf_pasv_subj_3p = "3p_impf_pasv_subj",

    perf_pasv_subj_1s = "1s_perf_pasv_subj",
    perf_pasv_subj_2s = "2s_perf_pasv_subj",
    perf_pasv_subj_3s = "3s_perf_pasv_subj",
    perf_pasv_subj_1p = "1p_perf_pasv_subj",
    perf_pasv_subj_2p = "2p_perf_pasv_subj",
    perf_pasv_subj_3p = "3p_perf_pasv_subj",

    plup_pasv_subj_1s = "1s_plup_pasv_subj",
    plup_pasv_subj_2s = "2s_plup_pasv_subj",
    plup_pasv_subj_3s = "3s_plup_pasv_subj",
    plup_pasv_subj_1p = "1p_plup_pasv_subj",
    plup_pasv_subj_2p = "2p_plup_pasv_subj",
    plup_pasv_subj_3p = "3p_plup_pasv_subj",

    pres_pasv_impr_1s = "1s_pres_pasv_impr",
    pres_pasv_impr_2s = "2s_pres_pasv_impr",
    pres_pasv_impr_3s = "3s_pres_pasv_impr",
    pres_pasv_impr_1p = "1p_pres_pasv_impr",
    pres_pasv_impr_2p = "2p_pres_pasv_impr",
    pres_pasv_impr_3p = "3p_pres_pasv_impr",

    futr_pasv_impr_1s = "1s_futr_pasv_impr",
    futr_pasv_impr_2s = "2s_futr_pasv_impr",
    futr_pasv_impr_3s = "3s_futr_pasv_impr",
    futr_pasv_impr_1p = "1p_futr_pasv_impr",
    futr_pasv_impr_2p = "2p_futr_pasv_impr",
    futr_pasv_impr_3p = "3p_futr_pasv_impr",

    pres_actv_inf = "pres_actv_inf",
    perf_actv_inf = "perf_actv_inf",
    futr_actv_inf = "futr_actv_inf",
    pres_pasv_inf = "pres_pasv_inf",
    perf_pasv_inf = "perf_pasv_inf",
    futr_pasv_inf = "futr_pasv_inf",
    pres_actv_ptc = "pres_actv_ptc",
    perf_actv_ptc = "perf_actv_ptc",
    futr_actv_ptc = "futr_actv_ptc",
    pres_pasv_ptc = "pres_pasv_ptc",
    perf_pasv_ptc = "perf_pasv_ptc",
    futr_pasv_ptc = "futr_pasv_ptc",

    linked_pres_actv_indc_1s = "linked_1s_pres_actv_indc",
    linked_pres_actv_indc_3s = "linked_3s_pres_actv_indc",
    linked_perf_actv_indc_1s = "linked_1s_perf_actv_indc",
    linked_perf_actv_indc_3s = "linked_3s_perf_actv_indc",

    plup_pasv_subj = "plup_pasv_subj",
    perf_pasv_subj = "perf_pasv_subj",
    futp_pasv_indc = "futp_pasv_indc",
    plup_pasv_indc = "plup_pasv_indc",
    perf_pasv_indc = "perf_pasv_indc",
    plup_actv_subj = "plup_actv_subj",
    perf_actv_subj = "perf_actv_subj",
    futp_actv_indc = "futp_actv_indc",
    plup_actv_indc = "plup_actv_indc",
    perf_actv_indc = "perf_actv_indc",

    ger_nom = "ger_nom",
    ger_gen = "ger_gen",
    ger_dat = "ger_dat",
    ger_acc = "ger_acc",
    ger_abl = "ger_abl",

    sup_acc = "sup_acc",
    sup_abl = "sup_abl",
}

export function setVerbForm(forms: FormMap<VerbForm>, form: string, values: string[]) {
    if (!is_enum_value(VerbForm, form)) {
        throw Error(`Invalid verb form ${form}: ${values}`);
    }
    forms.set(form, values);
}

export function getVerbForm(forms: FormMap<VerbForm>, form: string): string[] | undefined {
    if (!is_enum_value(VerbForm, form)) {
        throw Error(`Invalid verb form ${form}`);
    }
    return forms.get(form);
}
