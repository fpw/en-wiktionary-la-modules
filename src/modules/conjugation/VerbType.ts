import { is_enum_value } from "../common";

export enum VerbType {
    Impersonal = "impers",
    Irregular = "irreg",
    ThirdPersOnly = "3only",
    Deponent = "depon",
    SemiDeponent = "semidepon",
    OptSemiDeponent = "optsemidepon",
    NoPassive = "nopass",
    PassiveThirdOnly = "pass3only",
    PassiveImpersonal = "passimpers",
    PerfectAsPresence = "perfaspres",
    NoPerfect = "noperf",
    NoPassivePerfect = "nopasvperf",
    NoSupine = "nosup",
    SupineFutrActvOnly = "supfutractvonly",
    NoImperfect = "noimp",
    NoFuture = "nofut",
    PoeticInfinitive = "p3inf",
    PoetSyncopatedPerfect = "poetsyncperf",
    OptionalSyncopatedPerfect = "optsyncperf",
    AlwaysSyncopatedPerfect = "alwayssyncperf",
    IStem = "I",
    Masculine = "m",
    Feminine = "f",
    Neuter = "n",
    MasculinePlural = "mp",
    FemininePlural = "fp",
    NeuterPlural = "np",
    HighlyDefective = "highlydef",

    NoIStem = "-I",
    NoDeponent = "-depon",
    NoImpersonal = "-impers",
}

export function addVerbType(types: Set<VerbType>, verbType: string) {
    if (!is_enum_value(VerbType, verbType)) {
        throw Error(`Invalid verb type ${verbType}`);
    }
    types.add(verbType);
}

export function hasVerbType(types: Set<VerbType>, verbType: string): boolean {
    if (!is_enum_value(VerbType, verbType)) {
        throw Error(`Invalid verb type ${verbType}`);
    }
    return types.has(verbType);
}
