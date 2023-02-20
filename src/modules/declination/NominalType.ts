import { is_enum_value } from "../common";

export enum NominalType {
    Singular = "sg",
    NoSingular = "-sg",
    Plural = "pl",
    NoPlural = "-pl",
    Both = "both",
    NotBoth = "not_both",

    Masculine = "M",
    masculine = "m",
    Feminine = "F",
    feminine = "f",
    Neuter = "N",
    neuter = "n",
    NoMasculine = "-M",
    NotMasculine = "not_M",
    NotMe = "not_Me",
    NotFeminine = "not_F",
    NoFeminine = "-F",
    NoNeuter = "-N",
    NotNeuter = "not_N",
    NotNoNeuter = "not_-N",

    GenPluM = "genplum",
    NotGenPluM = "not_genplum",

    AccIm = "acc_im",
    NotAccIm = "not_acc_im",
    AccImEm = "acc_im_em",
    NotAccImEm = "not_acc_im_em",
    AccEmIm = "acc_em_im",
    NotAccEmIm = "not_acc_em_im",
    AccImIn = "acc_im_in",
    AccImInEm = "acc_im_in_em",
    NotAccImInEm = "not_acc_im_in_em",
    NotAccImIn = "not_acc_im_in",
    AccImOccEm = "acc_im_occ_em",
    NotAccImOccEm = "not_acc_im_occ_em",
    AblEI = "abl_e_i",
    NotAblEI = "not_abl_e_i",
    AblI = "abl_i",
    NotAblI = "not_abl_i",
    AblIE = "abl_i_e",
    NotAblIE = "not_abl_i_e",
    AblEOccI = "abl_e_occ_i",
    NotAblEOccI = "not_abl_e_occ_i",

    VocI = "voci",
    NoVocI = "-voci",

    Abus = "abus",
    NotAbus = "not_abus",
    Ubus = "ubus",
    NotUbus = "not_ubus",

    Ium = "ium",
    NoIum = "-ium",
    Ius = "ius",
    NoIus = "-ius",
    NotIus = "not_ius",
    Us = "us",
    NoUs = "-us",
    NotUs = "not_us",
    Am = "am",
    NoAm = "-am",
    NotAm = "not_am",

    Vos = "vos",
    NoVos = "-vos",
    Vom = "vom",
    NoVom = "-vom",

    Er = "er",
    NoEr = "-er",
    NotNoErr = "not_-er",

    a = "a",
    i = "i",
    I = "I",
    Noi = "-i",
    NoI = "-I",
    NotI = "not_I",
    Pure = "pure",
    NoPure = "-pure",
    NotPure = "not_pure",
    Par = "par",
    NoPar = "-par",
    NotPar = "not_par",
    Ic = "ic",
    NoIc = "-ic",

    greek = "greek",
    Nogreek = "-greek",
    Notgreek = "not_greek",
    Greek = "Greek",
    NoGreek = "-Greek",
    NotGreek = "not_Greek",
    GreekA = "greekA",
    NoGreekA = "-greekA",
    GreekE = "greekE",
    NoGreekE = "-greekE",
    Echo = "echo",
    argo = "argo",
    Callisto = "Callisto",
    Polis = "polis",
    NotPolis = "not_polis",
    NoPolis = "-polis",
    On = "on",
    NoOn = "-on",
    NotOn = "not_on",
    Me = "Me",
    NoMe = "-Me",
    Ma = "Ma",
    NoMa = "-Ma",

    Locative = "loc",
    NoLocative = "-loc",
    Ligature = "lig",
    NoCategories = "nocat",

    SuffixN = "sufn",
    NotSuffixN = "not_sufn",

    poetic_esi = "poetic_esi",

    // added by fpw to explicitly choose -e / -i in -ens adecl
    Participle = "ptc",

    // probably errors
    Gr = "Gr",
    gr = "gr",
    navis = "navis",
    Second = "2nd",
}

export function addNominalType(types: Set<NominalType>, nomType: string) {
    if (!is_enum_value(NominalType, nomType)) {
        throw Error(`Invalid nominal type '${nomType}'`);
    }
    types.add(nomType);
}

export function hasNominalType(types: Set<NominalType>, nomType: string): boolean {
    if (!is_enum_value(NominalType, nomType)) {
        throw Error(`Invalid nominal type '${nomType}'`);
    }
    return types.has(nomType);
}

export function delNominalType(types: Set<NominalType>, nomType: string): void {
    if (!is_enum_value(NominalType, nomType)) {
        throw Error(`Invalid nominal type '${nomType}'`);
    }
    types.delete(nomType);
}
