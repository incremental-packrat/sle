/*
  Exports a function which is a factory for ES5 parsers.
  To build a parser, call the function with either the `standard` or `incremental`
  module as an argument. E.g., in Node.js:

      var es5 = require('./es5');
      var matcher = es5(require('./standard'));
      var incMatcher = es5(require('./incremental'));
 */
module.exports = ns => {
  const _ = value => new ns.Terminal(value);
  const app = ruleName => new ns.RuleApplication(ruleName);
  const seq = (...exps) => new ns.Sequence(exps);
  const choice = (...exps) => new ns.Choice(exps);
  const rep = exp => new ns.Repetition(exp);
  const not = exp => new ns.Not(exp);

  const fixme = str => null;

  class Range extends ns.PExp {
    constructor(start, end) {
      super();
      this.start = start;
      this.end = end;
    }

    eval(matcher) {
      const nextChar = matcher.input[matcher.pos];
      if (this.start <= nextChar && nextChar <= this.end) {
        matcher.pos++;
        return nextChar;
      }
      return null;
    }
  }
  const range = (start, end) => new Range(start, end);
  const lookahead = exp => not(not(exp));
  const lexIgnored = exp => exp;

  return new ns.Matcher({
    start: app("program"),
    any: range("\u0000", "\uFFFF"),
    end: not(app("any")),
    program: seq(lookahead(rep(app("directive"))), rep(app("sourceElement")), app("spaces")),
    sourceCharacter: app("any"),
    space: choice(app("whitespace"), app("lineTerminator"), app("comment")),
    spaces: rep(app("space")),
    whitespace: choice(_("\t"), _("\x0B"), _("\x0C"), _(" "), _("\u00A0"), _("\uFEFF"), app("unicodeSpaceSeparator")),
    lineTerminator: choice(_("\n"), _("\r"), _("\u2028"), _("\u2029")),
    lineTerminatorSequence: choice(_("\n"), seq(_("\r"), not(_("\n"))), _("\u2028"), _("\u2029"), _("\r\n")),
    comment: choice(app("multiLineComment"), app("singleLineComment")),
    multiLineComment: seq(_("/*"), rep(seq(not(_("*/")), app("sourceCharacter"))), _("*/")),
    singleLineComment: seq(_("//"), rep(seq(not(app("lineTerminator")), app("sourceCharacter")))),
    identifier: seq(not(app("reservedWord")), app("identifierName")),
    identifierName: seq(app("identifierStart"), rep(app("identifierPart"))),
    identifierStart: choice(app("letter"), _("$"), _("_"), seq(_("\\"), app("unicodeEscapeSequence"))),
    identifierPart: choice(app("identifierStart"), app("unicodeCombiningMark"), app("unicodeDigit"), app("unicodeConnectorPunctuation"), _("\u200C"), _("\u200D")),
    letter: choice(range("a", "z"), range("A", "Z"), range("À", "ÿ"), app("unicodeCategoryNl")),
    unicodeCategoryNl: choice(range("\u2160", "\u2182"), _("\u3007"), range("\u3021", "\u3029")),
    unicodeDigit: choice(range("\u0030", "\u0039"), range("\u0660", "\u0669"), range("\u06F0", "\u06F9"), range("\u0966", "\u096F"), range("\u09E6", "\u09EF"), range("\u0A66", "\u0A6F"), range("\u0AE6", "\u0AEF"), range("\u0B66", "\u0B6F"), range("\u0BE7", "\u0BEF"), range("\u0C66", "\u0C6F"), range("\u0CE6", "\u0CEF"), range("\u0D66", "\u0D6F"), range("\u0E50", "\u0E59"), range("\u0ED0", "\u0ED9"), range("\u0F20", "\u0F29"), range("\uFF10", "\uFF19")),
    unicodeCombiningMark: choice(range("\u0300", "\u0345"), range("\u0360", "\u0361"), range("\u0483", "\u0486"), range("\u0591", "\u05A1"), range("\u05A3", "\u05B9"), range("\u05BB", "\u05BD"), range("\u05BF", "\u05BF"), range("\u05C1", "\u05C2"), range("\u05C4", "\u05C4"), range("\u064B", "\u0652"), range("\u0670", "\u0670"), range("\u06D6", "\u06DC"), range("\u06DF", "\u06E4"), range("\u06E7", "\u06E8"), range("\u06EA", "\u06ED"), range("\u0901", "\u0902"), range("\u093C", "\u093C"), range("\u0941", "\u0948"), range("\u094D", "\u094D"), range("\u0951", "\u0954"), range("\u0962", "\u0963"), range("\u0981", "\u0981"), range("\u09BC", "\u09BC"), range("\u09C1", "\u09C4"), range("\u09CD", "\u09CD"), range("\u09E2", "\u09E3"), range("\u0A02", "\u0A02"), range("\u0A3C", "\u0A3C"), range("\u0A41", "\u0A42"), range("\u0A47", "\u0A48"), range("\u0A4B", "\u0A4D"), range("\u0A70", "\u0A71"), range("\u0A81", "\u0A82"), range("\u0ABC", "\u0ABC"), range("\u0AC1", "\u0AC5"), range("\u0AC7", "\u0AC8"), range("\u0ACD", "\u0ACD"), range("\u0B01", "\u0B01"), range("\u0B3C", "\u0B3C"), range("\u0B3F", "\u0B3F"), range("\u0B41", "\u0B43"), range("\u0B4D", "\u0B4D"), range("\u0B56", "\u0B56"), range("\u0B82", "\u0B82"), range("\u0BC0", "\u0BC0"), range("\u0BCD", "\u0BCD"), range("\u0C3E", "\u0C40"), range("\u0C46", "\u0C48"), range("\u0C4A", "\u0C4D"), range("\u0C55", "\u0C56"), range("\u0CBF", "\u0CBF"), range("\u0CC6", "\u0CC6"), range("\u0CCC", "\u0CCD"), range("\u0D41", "\u0D43"), range("\u0D4D", "\u0D4D"), range("\u0E31", "\u0E31"), range("\u0E34", "\u0E3A"), range("\u0E47", "\u0E4E"), range("\u0EB1", "\u0EB1"), range("\u0EB4", "\u0EB9"), range("\u0EBB", "\u0EBC"), range("\u0EC8", "\u0ECD"), range("\u0F18", "\u0F19"), range("\u0F35", "\u0F35"), range("\u0F37", "\u0F37"), range("\u0F39", "\u0F39"), range("\u0F71", "\u0F7E"), range("\u0F80", "\u0F84"), range("\u0F86", "\u0F87"), range("\u0F90", "\u0F95"), range("\u0F97", "\u0F97"), range("\u0F99", "\u0FAD"), range("\u0FB1", "\u0FB7"), range("\u0FB9", "\u0FB9"), range("\u20D0", "\u20DC"), range("\u20E1", "\u20E1"), range("\u302A", "\u302F"), range("\u3099", "\u309A"), range("\uFB1E", "\uFB1E"), range("\uFE20", "\uFE23")),
    unicodeConnectorPunctuation: choice(_("\u005F"), range("\u203F", "\u2040"), _("\u30FB"), range("\uFE33", "\uFE34"), range("\uFE4D", "\uFE4F"), _("\uFF3F"), _("\uFF65")),
    unicodeSpaceSeparator: choice(range("\u2000", "\u200B"), _("\u3000")),
    reservedWord: choice(app("keyword"), app("futureReservedWord"), app("nullLiteral"), app("booleanLiteral")),
    keyword: choice(app("break"), app("do"), app("instanceof"), app("typeof"), app("case"), app("else"), app("new"), app("var"), app("catch"), app("finally"), app("return"), app("void"), app("continue"), app("for"), app("switch"), app("while"), app("debugger"), app("function"), app("this"), app("with"), app("default"), app("if"), app("throw"), app("delete"), app("in"), app("try")),
    futureReservedWordLax: choice(app("class"), app("enum"), app("extends"), app("super"), app("const"), app("export"), app("import")),
    futureReservedWordStrict: choice(app("futureReservedWordLax"), app("implements"), app("let"), app("private"), app("public"), app("interface"), app("package"), app("protected"), app("static"), app("yield")),
    futureReservedWord: app("futureReservedWordStrict"),
    literal: choice(app("nullLiteral"), app("booleanLiteral"), app("numericLiteral"), app("stringLiteral"), app("regularExpressionLiteral")),
    nullLiteral: seq(_("null"), not(app("identifierPart"))),
    booleanLiteral: seq(choice(_("true"), _("false")), not(app("identifierPart"))),
    numericLiteral: choice(app("octalIntegerLiteral"), app("hexIntegerLiteral"), app("decimalLiteral")),
    decimalLiteral: choice(seq(app("decimalIntegerLiteral"), _("."), rep(app("decimalDigit")), app("exponentPart")), seq(_("."), seq(app("decimalDigit"), rep(app("decimalDigit"))), app("exponentPart")), seq(app("decimalIntegerLiteral"), app("exponentPart"))),
    decimalIntegerLiteral: choice(seq(app("nonZeroDigit"), rep(app("decimalDigit"))), _("0")),
    decimalDigit: range("0", "9"),
    nonZeroDigit: range("1", "9"),
    exponentPart: choice(seq(app("exponentIndicator"), app("signedInteger")), seq()),
    exponentIndicator: choice(_("e"), _("E")),
    signedInteger: choice(seq(_("+"), rep(app("decimalDigit"))), seq(_("-"), rep(app("decimalDigit"))), seq(app("decimalDigit"), rep(app("decimalDigit")))),
    hexIntegerLiteral: choice(seq(_("0x"), seq(app("hexDigit"), rep(app("hexDigit")))), seq(_("0X"), seq(app("hexDigit"), rep(app("hexDigit"))))),
    hexDigit: choice(range("0", "9"), range("a", "f"), range("A", "F")),
    octalIntegerLiteral: seq(_("0"), seq(app("octalDigit"), rep(app("octalDigit")))),
    octalDigit: range("0", "7"),
    stringLiteral: choice(seq(_("\""), rep(app("doubleStringCharacter")), _("\"")), seq(_("'"), rep(app("singleStringCharacter")), _("'"))),
    doubleStringCharacter: choice(seq(not(choice(_("\""), _("\\"), app("lineTerminator"))), app("sourceCharacter")), seq(_("\\"), app("escapeSequence")), app("lineContinuation")),
    singleStringCharacter: choice(seq(not(choice(_("'"), _("\\"), app("lineTerminator"))), app("sourceCharacter")), seq(_("\\"), app("escapeSequence")), app("lineContinuation")),
    lineContinuation: seq(_("\\"), app("lineTerminatorSequence")),
    escapeSequence: choice(app("unicodeEscapeSequence"), app("hexEscapeSequence"), app("octalEscapeSequence"), app("characterEscapeSequence")),
    characterEscapeSequence: choice(app("singleEscapeCharacter"), app("nonEscapeCharacter")),
    singleEscapeCharacter: choice(_("'"), _("\""), _("\\"), _("b"), _("f"), _("n"), _("r"), _("t"), _("v")),
    nonEscapeCharacter: seq(not(choice(app("escapeCharacter"), app("lineTerminator"))), app("sourceCharacter")),
    escapeCharacter: choice(app("singleEscapeCharacter"), app("decimalDigit"), _("x"), _("u")),
    octalEscapeSequence: choice(seq(app("zeroToThree"), app("octalDigit"), app("octalDigit")), seq(app("fourToSeven"), app("octalDigit")), seq(app("zeroToThree"), app("octalDigit"), not(app("decimalDigit"))), seq(app("octalDigit"), not(app("decimalDigit")))),
    hexEscapeSequence: seq(_("x"), app("hexDigit"), app("hexDigit")),
    unicodeEscapeSequence: seq(_("u"), app("hexDigit"), app("hexDigit"), app("hexDigit"), app("hexDigit")),
    zeroToThree: range("0", "3"),
    fourToSeven: range("4", "7"),
    regularExpressionLiteral: seq(_("/"), app("regularExpressionBody"), _("/"), app("regularExpressionFlags")),
    regularExpressionBody: seq(app("regularExpressionFirstChar"), rep(app("regularExpressionChar"))),
    regularExpressionFirstChar: choice(seq(not(choice(_("*"), _("\\"), _("/"), _("["))), app("regularExpressionNonTerminator")), app("regularExpressionBackslashSequence"), app("regularExpressionClass")),
    regularExpressionChar: choice(seq(not(choice(_("\\"), _("/"), _("["))), app("regularExpressionNonTerminator")), app("regularExpressionBackslashSequence"), app("regularExpressionClass")),
    regularExpressionBackslashSequence: seq(_("\\"), app("regularExpressionNonTerminator")),
    regularExpressionNonTerminator: seq(not(app("lineTerminator")), app("sourceCharacter")),
    regularExpressionClass: seq(_("["), rep(app("regularExpressionClassChar")), _("]")),
    regularExpressionClassChar: choice(seq(not(choice(_("]"), _("\\"))), app("regularExpressionNonTerminator")), app("regularExpressionBackslashSequence")),
    regularExpressionFlags: rep(app("identifierPart")),
    multiLineCommentNoNL: seq(_("/*"), rep(seq(not(choice(_("*/"), app("lineTerminator"))), app("sourceCharacter"))), _("*/")),
    spacesNoNL: rep(choice(app("whitespace"), app("singleLineComment"), app("multiLineCommentNoNL"))),
    sc: choice(seq(rep(app("space")), choice(_(";"), app("end"))), seq(app("spacesNoNL"), choice(app("lineTerminator"), seq(not(app("multiLineCommentNoNL")), app("multiLineComment")), lookahead(_("}"))))),
    break: seq(_("break"), not(app("identifierPart"))),
    do: seq(_("do"), not(app("identifierPart"))),
    instanceof: seq(_("instanceof"), not(app("identifierPart"))),
    typeof: seq(_("typeof"), not(app("identifierPart"))),
    case: seq(_("case"), not(app("identifierPart"))),
    else: seq(_("else"), not(app("identifierPart"))),
    new: seq(_("new"), not(app("identifierPart"))),
    var: seq(_("var"), not(app("identifierPart"))),
    catch: seq(_("catch"), not(app("identifierPart"))),
    finally: seq(_("finally"), not(app("identifierPart"))),
    return: seq(_("return"), not(app("identifierPart"))),
    void: seq(_("void"), not(app("identifierPart"))),
    continue: seq(_("continue"), not(app("identifierPart"))),
    for: seq(_("for"), not(app("identifierPart"))),
    switch: seq(_("switch"), not(app("identifierPart"))),
    while: seq(_("while"), not(app("identifierPart"))),
    debugger: seq(_("debugger"), not(app("identifierPart"))),
    function: seq(_("function"), not(app("identifierPart"))),
    this: seq(_("this"), not(app("identifierPart"))),
    with: seq(_("with"), not(app("identifierPart"))),
    default: seq(_("default"), not(app("identifierPart"))),
    if: seq(_("if"), not(app("identifierPart"))),
    throw: seq(_("throw"), not(app("identifierPart"))),
    delete: seq(_("delete"), not(app("identifierPart"))),
    in: seq(_("in"), not(app("identifierPart"))),
    try: seq(_("try"), not(app("identifierPart"))),
    get: seq(_("get"), not(app("identifierPart"))),
    set: seq(_("set"), not(app("identifierPart"))),
    class: seq(_("class"), not(app("identifierPart"))),
    enum: seq(_("enum"), not(app("identifierPart"))),
    extends: seq(_("extends"), not(app("identifierPart"))),
    super: seq(_("super"), not(app("identifierPart"))),
    const: seq(_("const"), not(app("identifierPart"))),
    export: seq(_("export"), not(app("identifierPart"))),
    import: seq(_("import"), not(app("identifierPart"))),
    implements: seq(_("implements"), not(app("identifierPart"))),
    let: seq(_("let"), not(app("identifierPart"))),
    private: seq(_("private"), not(app("identifierPart"))),
    public: seq(_("public"), not(app("identifierPart"))),
    interface: seq(_("interface"), not(app("identifierPart"))),
    package: seq(_("package"), not(app("identifierPart"))),
    protected: seq(_("protected"), not(app("identifierPart"))),
    static: seq(_("static"), not(app("identifierPart"))),
    yield: seq(_("yield"), not(app("identifierPart"))),
    primaryExpression: choice(seq(app("spaces"), app("this")), seq(app("spaces"), app("identifier")), seq(app("spaces"), app("literal")), app("arrayLiteral"), app("objectLiteral"), seq(app("spaces"), _("("), app("expression"), app("spaces"), _(")"))),
    arrayLiteral: choice(seq(app("spaces"), _("["), app("assignmentExpressionOrElision"), rep(seq(app("spaces"), _(","), app("assignmentExpressionOrElision"))), app("spaces"), _("]")), seq(app("spaces"), _("["), app("spaces"), _("]"))),
    assignmentExpressionOrElision: choice(app("assignmentExpression"), seq()),
    objectLiteral: choice(seq(app("spaces"), _("{"), app("propertyAssignment"), rep(seq(app("spaces"), _(","), app("propertyAssignment"))), app("spaces"), _("}")), seq(app("spaces"), _("{"), app("spaces"), _("}")), seq(app("spaces"), _("{"), app("propertyAssignment"), rep(seq(app("spaces"), _(","), app("propertyAssignment"))), app("spaces"), _(","), app("spaces"), _("}"))),
    propertyAssignment: choice(seq(app("spaces"), app("get"), app("propertyName"), app("spaces"), _("("), app("spaces"), _(")"), app("spaces"), _("{"), app("functionBody"), app("spaces"), _("}")), seq(app("spaces"), app("set"), app("propertyName"), app("spaces"), _("("), app("formalParameter"), app("spaces"), _(")"), app("spaces"), _("{"), app("functionBody"), app("spaces"), _("}")), seq(app("propertyName"), app("spaces"), _(":"), app("assignmentExpression"))),
    propertyName: choice(seq(app("spaces"), app("identifierName")), seq(app("spaces"), app("stringLiteral")), seq(app("spaces"), app("numericLiteral"))),
    memberExpression: seq(app("memberExpressionHead"), rep(app("memberExpressionTail"))),
    memberExpressionHead: choice(seq(app("spaces"), app("new"), app("memberExpression"), app("arguments")), app("primaryExpression"), app("functionExpression")),
    memberExpressionTail: choice(seq(app("spaces"), _("["), app("expression"), app("spaces"), _("]")), seq(app("spaces"), _("."), app("spaces"), app("identifierName"))),
    newExpression: choice(app("memberExpression"), seq(app("spaces"), app("new"), app("newExpression"))),
    callExpression: seq(app("memberExpression"), rep(app("callExpressionTail"))),
    callExpressionTail: choice(app("arguments"), seq(app("spaces"), _("["), app("expression"), app("spaces"), _("]")), seq(app("spaces"), _("."), app("spaces"), app("identifierName"))),
    arguments: choice(seq(app("spaces"), _("("), app("assignmentExpression"), rep(seq(app("spaces"), _(","), app("assignmentExpression"))), app("spaces"), _(")")), seq(app("spaces"), _("("), app("spaces"), _(")"))),
    leftHandSideExpression: choice(app("callExpression"), app("newExpression")),
    postfixExpression: choice(seq(app("leftHandSideExpression"), lexIgnored(seq(app("spacesNoNL"), _("++")))), seq(app("leftHandSideExpression"), lexIgnored(seq(app("spacesNoNL"), _("--")))), app("leftHandSideExpression")),
    unaryExpression: choice(seq(app("spaces"), app("delete"), app("unaryExpression")), seq(app("spaces"), app("void"), app("unaryExpression")), seq(app("spaces"), app("typeof"), app("unaryExpression")), seq(app("spaces"), _("++"), app("unaryExpression")), seq(app("spaces"), _("--"), app("unaryExpression")), seq(app("spaces"), _("+"), app("unaryExpression")), seq(app("spaces"), _("-"), app("unaryExpression")), seq(app("spaces"), _("~"), app("unaryExpression")), seq(app("spaces"), _("!"), app("unaryExpression")), app("postfixExpression")),
    multiplicativeExpression: choice(seq(app("unaryExpression"), app("spaces"), _("*"), app("multiplicativeExpression")), seq(app("unaryExpression"), app("spaces"), _("/"), app("multiplicativeExpression")), seq(app("unaryExpression"), app("spaces"), _("%"), app("multiplicativeExpression")), app("unaryExpression")),
    additiveExpression: choice(seq(app("multiplicativeExpression"), app("spaces"), _("+"), app("additiveExpression")), seq(app("multiplicativeExpression"), app("spaces"), _("-"), app("additiveExpression")), app("multiplicativeExpression")),
    shiftExpression: choice(seq(app("additiveExpression"), app("spaces"), _("<<"), app("shiftExpression")), seq(app("additiveExpression"), app("spaces"), _(">>>"), app("shiftExpression")), seq(app("additiveExpression"), app("spaces"), _(">>"), app("shiftExpression")), app("additiveExpression")),
    relationalExpression: choice(seq(app("shiftExpression"), app("spaces"), _("<"), app("relationalExpression")), seq(app("shiftExpression"), app("spaces"), _(">"), app("relationalExpression")), seq(app("shiftExpression"), app("spaces"), _("<="), app("relationalExpression")), seq(app("shiftExpression"), app("spaces"), _(">="), app("relationalExpression")), seq(app("shiftExpression"), app("spaces"), app("instanceof"), app("relationalExpression")), seq(app("shiftExpression"), app("spaces"), app("in"), app("relationalExpression")), app("shiftExpression")),
    relationalExpressionNoIn: choice(seq(app("shiftExpression"), app("spaces"), _("<"), app("relationalExpressionNoIn")), seq(app("shiftExpression"), app("spaces"), _(">"), app("relationalExpressionNoIn")), seq(app("shiftExpression"), app("spaces"), _("<="), app("relationalExpressionNoIn")), seq(app("shiftExpression"), app("spaces"), _(">="), app("relationalExpressionNoIn")), seq(app("shiftExpression"), app("spaces"), app("instanceof"), app("relationalExpressionNoIn")), app("shiftExpression")),
    equalityExpression: choice(seq(app("relationalExpression"), app("spaces"), _("=="), app("equalityExpression")), seq(app("relationalExpression"), app("spaces"), _("!="), app("equalityExpression")), seq(app("relationalExpression"), app("spaces"), _("==="), app("equalityExpression")), seq(app("relationalExpression"), app("spaces"), _("!=="), app("equalityExpression")), app("relationalExpression")),
    equalityExpressionNoIn: choice(seq(app("relationalExpressionNoIn"), app("spaces"), _("=="), app("equalityExpressionNoIn")), seq(app("relationalExpressionNoIn"), app("spaces"), _("!="), app("equalityExpressionNoIn")), seq(app("relationalExpressionNoIn"), app("spaces"), _("==="), app("equalityExpressionNoIn")), seq(app("relationalExpressionNoIn"), app("spaces"), _("!=="), app("equalityExpressionNoIn")), app("relationalExpressionNoIn")),
    bitwiseANDExpression: choice(seq(app("equalityExpression"), app("spaces"), _("&"), app("bitwiseANDExpression")), app("equalityExpression")),
    bitwiseANDExpressionNoIn: choice(seq(app("equalityExpressionNoIn"), app("spaces"), _("&"), app("bitwiseANDExpressionNoIn")), app("equalityExpressionNoIn")),
    bitwiseXORExpression: choice(seq(app("bitwiseANDExpression"), app("spaces"), _("^"), app("bitwiseXORExpression")), app("bitwiseANDExpression")),
    bitwiseXORExpressionNoIn: choice(seq(app("bitwiseANDExpressionNoIn"), app("spaces"), _("^"), app("bitwiseXORExpressionNoIn")), app("bitwiseANDExpressionNoIn")),
    bitwiseORExpression: choice(seq(app("bitwiseXORExpression"), app("spaces"), _("|"), app("bitwiseORExpression")), app("bitwiseXORExpression")),
    bitwiseORExpressionNoIn: choice(seq(app("bitwiseXORExpressionNoIn"), app("spaces"), _("|"), app("bitwiseORExpressionNoIn")), app("bitwiseXORExpressionNoIn")),
    logicalANDExpression: choice(seq(app("bitwiseORExpression"), app("spaces"), _("&&"), app("logicalANDExpression")), app("bitwiseORExpression")),
    logicalANDExpressionNoIn: choice(seq(app("bitwiseORExpressionNoIn"), app("spaces"), _("&&"), app("logicalANDExpressionNoIn")), app("bitwiseORExpressionNoIn")),
    logicalORExpression: choice(seq(app("logicalANDExpression"), app("spaces"), _("||"), app("logicalORExpression")), app("logicalANDExpression")),
    logicalORExpressionNoIn: choice(seq(app("logicalANDExpressionNoIn"), app("spaces"), _("||"), app("logicalORExpressionNoIn")), app("logicalANDExpressionNoIn")),
    conditionalExpression: choice(seq(app("logicalORExpression"), app("spaces"), _("?"), app("assignmentExpression"), app("spaces"), _(":"), app("assignmentExpression")), app("logicalORExpression")),
    conditionalExpressionNoIn: choice(seq(app("logicalORExpressionNoIn"), app("spaces"), _("?"), app("assignmentExpression"), app("spaces"), _(":"), app("assignmentExpressionNoIn")), app("logicalORExpressionNoIn")),
    assignmentExpression: choice(seq(app("leftHandSideExpression"), app("spaces"), app("assignmentOperator"), app("assignmentExpression")), app("conditionalExpression")),
    assignmentExpressionNoIn: choice(seq(app("leftHandSideExpression"), app("spaces"), app("assignmentOperator"), app("assignmentExpressionNoIn")), app("conditionalExpressionNoIn")),
    expression: seq(app("assignmentExpression"), rep(seq(app("spaces"), _(","), app("assignmentExpression")))),
    expressionNoIn: seq(app("assignmentExpressionNoIn"), rep(seq(app("spaces"), _(","), app("assignmentExpressionNoIn")))),
    assignmentOperator: choice(_("="), _(">>>="), _("<<="), _(">>="), _("*="), _("/="), _("%="), _("+="), _("-="), _("&="), _("^="), _("|=")),
    statement: choice(app("block"), app("variableStatement"), app("emptyStatement"), app("expressionStatement"), app("ifStatement"), app("iterationStatement"), app("continueStatement"), app("breakStatement"), app("returnStatement"), app("withStatement"), app("labelledStatement"), app("switchStatement"), app("throwStatement"), app("tryStatement"), app("debuggerStatement")),
    block: seq(app("spaces"), _("{"), app("statementList"), app("spaces"), _("}")),
    statementList: rep(app("statement")),
    variableStatement: seq(app("spaces"), app("var"), app("variableDeclarationList"), lexIgnored(app("sc"))),
    variableDeclarationList: seq(app("variableDeclaration"), rep(seq(app("spaces"), _(","), app("variableDeclaration")))),
    variableDeclarationListNoIn: seq(app("variableDeclarationNoIn"), rep(seq(app("spaces"), _(","), app("variableDeclarationNoIn")))),
    variableDeclaration: seq(app("spaces"), app("identifier"), choice(app("initialiser"), seq())),
    variableDeclarationNoIn: seq(app("spaces"), app("identifier"), choice(app("initialiserNoIn"), seq())),
    initialiser: seq(app("spaces"), _("="), app("assignmentExpression")),
    initialiserNoIn: seq(app("spaces"), _("="), app("assignmentExpressionNoIn")),
    emptyStatement: seq(app("spaces"), _(";")),
    expressionStatement: seq(not(seq(app("spaces"), choice(_("{"), app("function")))), app("expression"), lexIgnored(app("sc"))),
    ifStatement: seq(app("spaces"), app("if"), app("spaces"), _("("), app("expression"), app("spaces"), _(")"), app("statement"), choice(seq(app("spaces"), app("else"), app("statement")), seq())),
    iterationStatement: choice(seq(app("spaces"), app("do"), app("statement"), app("spaces"), app("while"), app("spaces"), _("("), app("expression"), app("spaces"), _(")"), lexIgnored(app("sc"))), seq(app("spaces"), app("while"), app("spaces"), _("("), app("expression"), app("spaces"), _(")"), app("statement")), seq(app("spaces"), app("for"), app("spaces"), _("("), choice(app("expressionNoIn"), seq()), app("spaces"), _(";"), choice(app("expression"), seq()), app("spaces"), _(";"), choice(app("expression"), seq()), app("spaces"), _(")"), app("statement")), seq(app("spaces"), app("for"), app("spaces"), _("("), app("spaces"), app("var"), app("variableDeclarationListNoIn"), app("spaces"), _(";"), choice(app("expression"), seq()), app("spaces"), _(";"), choice(app("expression"), seq()), app("spaces"), _(")"), app("statement")), seq(app("spaces"), app("for"), app("spaces"), _("("), app("leftHandSideExpression"), app("spaces"), app("in"), app("expression"), app("spaces"), _(")"), app("statement")), seq(app("spaces"), app("for"), app("spaces"), _("("), app("spaces"), app("var"), app("variableDeclarationNoIn"), app("spaces"), app("in"), app("expression"), app("spaces"), _(")"), app("statement"))),
    continueStatement: seq(app("spaces"), app("continue"), lexIgnored(seq(choice(seq(app("spacesNoNL"), app("identifier")), seq()), app("sc")))),
    breakStatement: seq(app("spaces"), app("break"), lexIgnored(seq(choice(seq(app("spacesNoNL"), app("identifier")), seq()), app("sc")))),
    returnStatement: seq(app("spaces"), app("return"), choice(seq(lexIgnored(seq(app("spacesNoNL"), not(app("space")))), app("expression")), seq()), lexIgnored(app("sc"))),
    withStatement: seq(app("spaces"), app("with"), app("spaces"), _("("), app("expression"), app("spaces"), _(")"), app("statement")),
    switchStatement: seq(app("spaces"), app("switch"), app("spaces"), _("("), app("expression"), app("spaces"), _(")"), app("caseBlock")),
    caseBlock: choice(seq(app("spaces"), _("{"), rep(app("caseClause")), app("defaultClause"), rep(app("caseClause")), app("spaces"), _("}")), seq(app("spaces"), _("{"), rep(app("caseClause")), app("spaces"), _("}"))),
    caseClause: seq(app("spaces"), app("case"), app("expression"), app("spaces"), _(":"), rep(app("statement"))),
    defaultClause: seq(app("spaces"), app("default"), app("spaces"), _(":"), rep(app("statement"))),
    labelledStatement: seq(app("spaces"), app("identifier"), app("spaces"), _(":"), app("statement")),
    throwStatement: seq(app("spaces"), app("throw"), app("expression"), lexIgnored(app("sc"))),
    tryStatement: choice(seq(app("spaces"), app("try"), app("block"), app("catchBlock"), app("finallyBlock")), seq(app("spaces"), app("try"), app("block"), app("finallyBlock")), seq(app("spaces"), app("try"), app("block"), app("catchBlock"))),
    catchBlock: seq(app("spaces"), app("catch"), app("spaces"), _("("), app("formalParameter"), app("spaces"), _(")"), app("block")),
    finallyBlock: seq(app("spaces"), app("finally"), app("block")),
    debuggerStatement: seq(app("spaces"), lexIgnored(seq(app("debugger"), app("sc")))),
    functionDeclaration: seq(app("spaces"), app("function"), app("spaces"), app("identifier"), app("spaces"), _("("), app("formalParameterList"), app("spaces"), _(")"), app("spaces"), _("{"), app("functionBody"), app("spaces"), _("}")),
    functionExpression: choice(seq(app("spaces"), app("function"), app("spaces"), app("identifier"), app("spaces"), _("("), app("formalParameterList"), app("spaces"), _(")"), app("spaces"), _("{"), app("functionBody"), app("spaces"), _("}")), seq(app("spaces"), app("function"), app("spaces"), _("("), app("formalParameterList"), app("spaces"), _(")"), app("spaces"), _("{"), app("functionBody"), app("spaces"), _("}"))),
    formalParameterList: choice(seq(app("formalParameter"), rep(seq(app("spaces"), _(","), app("formalParameter")))), seq()),
    formalParameter: seq(app("spaces"), app("identifier")),
    functionBody: seq(lookahead(rep(app("directive"))), rep(app("sourceElement"))),
    sourceElement: choice(app("functionDeclaration"), app("statement")),
    directive: seq(app("spaces"), app("stringLiteral"), lexIgnored(app("sc")))
});
};
