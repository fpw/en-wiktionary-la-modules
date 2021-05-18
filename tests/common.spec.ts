import { expect } from "chai";
import "mocha";
import { parse_template, read_list, remove_diacritical, remove_html, remove_links, strip_macrons } from "../src/modules/common";

describe("parse_template", () => {
    it("should parse properly", () => {
        const args = parse_template("{{la-noun|abc|a=1}}");
        expect(args.get("0")).equals("la-noun");
        expect(args.get("1")).equals("abc");
        expect(args.get("a")).equals("1");
    });

    it("should handle empty args", () => {
        const args = parse_template("{{la-noun||abc}}");
        expect(args.get("0")).equals("la-noun");
        expect(args.get("2")).equals("abc");
    });
});

describe("read_list", () => {
    it("should parse properly", () => {
        const args = parse_template("{{la-noun|head=a|d|head3=c|head2=b}}");
        const list = read_list(args, "head");
        expect(list[0]).equals("a");
        expect(list[1]).equals("b");
        expect(list[2]).equals("c");
    });
});

describe("remove_links", () => {
    it("should remove nested links", () => {
        const nonLink = remove_links("[[Lemma|This is the title]]");
        expect(nonLink).equals("This is the title");
    });

    it("should remove non-nested links", () => {
        const nonLink = remove_links("[[lemma]]");
        expect(nonLink).equals("lemma");
    });
});

describe("remove_html", () => {
    it("should remove simple HTML", () => {
        const noHTML = remove_html("This is a <small>test</small>.");
        expect(noHTML).equals("This is a test.");
    });

    it("should remove HTML including attributes", () => {
        const noHTML = remove_html("<i class=\"Latn mention\" lang=\"la\">data</i>");
        expect(noHTML).equals("data");
    });
});

describe("strip_macrons", () => {
    it("should remove macrons", () => {
        const noMacrons = strip_macrons("yĀēīōūy");
        expect(noMacrons).equals("yAeiouy");
    });
});

describe("remove_diacritical", () => {
    it("should remove diacritical symbols and keep macrons", () => {
        const noMacrons = remove_diacritical("Thēse͡us ê");
        expect(noMacrons).equals("Thēseus e");
    });
});
