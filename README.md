# en-wiktionary-la-modules
This module implements most of the la-* modules from the English Wiktionary in TypeScript.

The license for this project is CC BY-SA 3.0 since that's the license of Wiktionary
on which these modules are based.

Especially the inflections (la-ndecl, la-adecl) and conjugation (la-verb) are fully
implemented and unit-tested against all original outputs from the original Lua modules.

The code uses Lua naming conventions and idioms because it's basically a conversion.
It should be kept compatible with the original code as much as possible so that later
changes to the Wiktionary modules can easily be ported.

For this reason and due to the CC license, it's suggested to create wrapper modules around
this code with proper idioms and safer types.
