'use strict';

/*
  Boilerplate for "universal module definition" (UMD).
  In Node.js, you can `require` this file to get a single object containing all the exports.
  In the browser, use `<script src="...">` and the exports will be assigned into `window`.
 */
(function(g,f){if(typeof define==='function'&&define.amd){define([],f)}else if(typeof module==='object'&&module.exports){module.exports=f()}else{Object.assign(g,f())}})(this,function(){

// Import dependencies from standard.js.
var {Matcher, PExp, Terminal, RuleApplication, Choice, Sequence, Repetition, Not} =
    typeof module === 'object' ? require('./standard') : window;

class IncrementalMatcher {
  constructor(rules) {
    this.rules = rules;
    this.memoTable = [];
    this.input = '';
  }

  match() {
    this.pos = 0;
    this.maxExaminedPos = -1;
    var cst = new IncRuleApplication('start').eval(this);
    return this.pos === this.input.length ? cst : null;
  }

  hasMemoizedResult(ruleName) {
    var col = this.memoTable[this.pos];
    return col && col.memo.has(ruleName);
  }

  memoizeResult(pos, ruleName, cst) {
    var col = this.memoTable[pos];
    if (!col) {
      col = this.memoTable[pos] = {
        memo: new Map(),
        maxExaminedLength: -1
      };
    }
    var examinedLength = this.maxExaminedPos - pos + 1;
    var entry = {
      cst: cst,
      examinedLength: examinedLength
    };
    if (cst !== null) {
      entry.matchLength = this.pos - pos;
    }
    col.memo.set(ruleName, entry);
    col.maxExaminedLength =
        Math.max(col.maxExaminedLength, examinedLength);
  }

  useMemoizedResult(ruleName) {
    var col = this.memoTable[this.pos];
    var result = col.memo.get(ruleName);
    this.maxExaminedPos = Math.max(
        this.maxExaminedPos,
        this.pos + result.examinedLength - 1);
    if (result.cst !== null) {
      this.pos += result.matchLength;
      return result.cst;
    } else {
      return null;
    }
  }

  consume(c) {
    this.maxExaminedPos =
        Math.max(this.maxExaminedPos, this.pos);
    if (this.input[this.pos] === c) {
      this.pos++;
      return true;
    } else {
      return false;
    }
  }

  applyEdit(startPos, endPos, r) {
    var s = this.input;
    var m = this.memoTable;

    // Step 1: Apply edit to the input
    this.input =
        s.slice(0, startPos) + r + s.slice(endPos);

    // Step 2: Adjust memo table
    this.memoTable = m.slice(0, startPos).concat(
        new Array(r.length).fill(null),
        m.slice(endPos));

    // Step 3: Invalidate overlapping entries
    for (var pos = 0; pos < startPos; pos++) {
      var col = m[pos];
      if (col != null &&
          pos + col.maxExaminedLength > startPos) {
        var newMax = 0;
        for (var [ruleName, entry] of col.memo) {
          var examinedLen = entry.examinedLength;
          if (pos + examinedLen > startPos) {
            col.memo.delete(ruleName);
          } else if (examinedLen > newMax) {
            newMax = examinedLen;
          }
        }
        col.maxExaminedLength = newMax;
      }
    }
  }
}

class IncRuleApplication extends PExp {
  constructor(ruleName) {
    super();
    this.ruleName = ruleName;
  }

  eval(matcher) {
    var name = this.ruleName;
    if (matcher.hasMemoizedResult(name)) {
      return matcher.useMemoizedResult(name);
    } else {
      var origPos = matcher.pos;
      var origMax = matcher.maxExaminedPos;
      matcher.maxExaminedPos = -1;
      var cst = matcher.rules[name].eval(matcher);
      matcher.memoizeResult(origPos, name, cst);
      matcher.maxExaminedPos = Math.max(
          matcher.maxExaminedPos,
          origMax);
      return cst;
    }
  }
}

// Export the same API as 'standard'.
return {
  // Same as standard
  PExp, Terminal, RuleApplication, Choice, Sequence, Repetition, Not,

  // Stuff that needs to be overriden with incremental version
  Matcher: IncrementalMatcher,
  RuleApplication: IncRuleApplication
};

});  // end of UMD
