export type ArgMap = Map<string, string>;
export type FormMap = Map<string, string[]>;

/**
 * Parse a MediaWiki template string like {{a|b|c=d}} into a key-value map.
 * Unnamed parameters will use number strings starting at '0'.
 * @param desc the MediaWiki template string
 * @returns a map of keys and values
 */
export function parse_template(desc: string): ArgMap {
    // remove {{ }}
    const paramStr = desc
        .replace(/[\r\n]/g, "")
        .replace(/^{{(.*)}}$/, "$1");

    const partStr = remove_links(paramStr);

    const parts = partStr.split("|");

    const res = new Map<string, string>();
    let i = 0;
    for (const part of parts) {
        if (part.includes("=")) {
            const [key, value] = part.split("=");
            res.set(key, value);
        } else {
            res.set(`${i++}`, part);
        }
    }

    return res;
}

/**
 * Read a parameter list from a MediaWiki template string.
 * Example: {{...|p=a,p2=b,p3=c}} will become [a, b, c] if p is read
 * @param args a parsed MediaWiki template string
 * @param elem the name of the list
 * @returns elemnts of the lists
 */
export function read_list(args: ArgMap, elem: string): string[] {
    const entries: string[] = [];

    for (const [key, value] of args.entries()) {
        const match = key.match(new RegExp(`^${elem}([0-9]*)$`));
        if (!match) {
            continue;
        }
        let idx = 0;
        if (match[1]) {
            idx = Number.parseInt(match[1], 10) - 1;
        }
        entries[idx] = value;
    }

    return entries;
}

/**
 * Removes MediaWiki links by replacing them with their displayed value.
 * Example [[a|title]] will be replaced with 'title'
 * @param str a string that can contain MediaWiki links
 * @returns the string with all links replaced by their title
 */
export function remove_links(str: string): string {
    // flatten links [[a|b]] to [[b]]
    const norm1 = str.replace(/\[\[[^\]]*?\|([^\]]*?)\]\]/g, "[[$1]]");

    // replace [[b]] with b
    const norm2 = norm1.replace(/\[\[([^\]]*?)\]\]/g, "$1");

    return norm2;
}

/**
 * Very basic HTML remover to remove simple, non-nested tags from a string.
 * @param str a string containing simple HTML markup
 * @returns a string with HTML tags removed
 */
export function remove_html(str: string): string {
    return str.replace(/<.*?>(.*?)<\/.*?>/g, "$1");
}

/**
 * Removes macrons from a string.
 * Example: 'Āfrica' will become 'Africa'
 * @param str a string containing macrons
 * @returns string without macrons
 */
export function strip_macrons(str: string): string {
    return str
        .normalize("NFD")
        .replace(/\u0304/g, "")
        .normalize("NFC");
}

/**
 * Removes all diacritical parts from a string except for macrons.
 * Example: 'Thēse͡us' will become 'Thēseus'
 * @param str string containing diactricial characters
 * @returns string with all diactricial marks except macrons removed
 */
export function remove_diacritical(str: string): string {
    const noDias = str
        .normalize("NFD")
        .replace(/[\u0300-\u0303\u0305-\u036F]/g, "")
        .normalize("NFC");

    return noDias;
}

/**
 * Given a word and an ending, returns the base part of the word excluding the ending.
 * The given ending can be a RegEx with a capture group - in that case, the first group will be returned.
 * @param lemma word to extract the base from
 * @param ending ending to remove, can be a RegEx
 * @returns
 */
export function extract_base(lemma: string, ending: string): string | undefined {
    let regex: string;
    if (ending.includes("(")) {
        regex = ending;
    } else {
        regex = `^(.*)${ending}$`;
    }
    const match = lemma.match(new RegExp(regex));
    if (match) {
        return match[1];
    }
    return undefined;
}

/**
 * Checks if two one-dimensional arrays are equal.
 * @param a array a
 * @param b array b
 * @returns true if the arrays are equal
 */
export function array_equals(a: string[] | undefined, b: string[] | undefined): boolean {
    if ((!a && b) || (a && !b)) {
        return false;
    }
    if (!a || !b) {
        return true;
    }

    return (a.length == b.length) && a.every((x, i) => b[i] == x);
}

/**
 * Check if a value is a value of a given enum
 * @param enumType pass the enum type as value
 * @param val the value to check
 * @returns whether the value is part of the enum values
 */
export function is_enum_value<E>(enumType: E, val: any) : val is E[keyof E] {
    for (const key in enumType) {
        if (enumType[key] === val ) {
            return true;
        }
    }

    return false;
}
