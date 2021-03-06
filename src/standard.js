'use strict';

// UMD-style boilerplate for a module that works in both Node.js and browsers.
(function(r,f){if(typeof module==='object'&&module.exports){module.exports=f()}else{Object.assign(r,f())}})(this,function(){  // eslint-disable-line

  class Matcher {
    constructor(rules) {
      this.rules = rules;
    }

    match(input) {
      this.input = input;
      this.pos = 0;
      this.memoTable = [];
      var cst = new RuleApplication('start').eval(this);
      return this.pos === this.input.length ? cst : null;
    }

    hasMemoizedResult(ruleName) {
      var col = this.memoTable[this.pos];
      return col && col.has(ruleName);
    }

    memoizeResult(pos, ruleName, cst) {
      var col = this.memoTable[pos];
      if (!col) {
        col = this.memoTable[pos] = new Map();
      }
      if (cst !== null) {
        col.set(ruleName, {cst: cst, nextPos: this.pos});
      } else {
        col.set(ruleName, {cst: null});
      }
    }

    useMemoizedResult(ruleName) {
      var col = this.memoTable[this.pos];
      var result = col.get(ruleName);
      if (result.cst !== null) {
        this.pos = result.nextPos;
        return result.cst;
      }
      return null;
    }

    consume(c) {
      if (this.input[this.pos] === c) {
        this.pos++;
        return true;
      }
      return false;
    }
  }

  class PExp {
    eval(matcher) {
      throw new Error('abstract method');
    }
  }

  class RuleApplication extends PExp {
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
        var cst = matcher.rules[name].eval(matcher);
        matcher.memoizeResult(origPos, name, cst);
        return cst;
      }
    }
  }

  class Terminal extends PExp {
    constructor(str) {
      super();
      this.str = str;
    }

    eval(matcher) {
      for (var i = 0; i < this.str.length; i++) {
        if (!matcher.consume(this.str[i])) {
          return null;
        }
      }
      return this.str;
    }
  }

  class Choice extends PExp {
    constructor(exps) {
      super();
      this.exps = exps;
    }

    eval(matcher) {
      var origPos = matcher.pos;
      for (var i = 0; i < this.exps.length; i++) {
        matcher.pos = origPos;
        var cst = this.exps[i].eval(matcher);
        if (cst !== null) {
          return cst;
        }
      }
      return null;
    }
  }

  class Sequence extends PExp {
    constructor(exps) {
      super();
      this.exps = exps;
    }

    eval(matcher) {
      var ans = [];
      for (var i = 0; i < this.exps.length; i++) {
        var exp = this.exps[i];
        var cst = exp.eval(matcher);
        if (cst === null) {
          return null;
        }
        if (!(exp instanceof Not)) {
          ans.push(cst);
        }
      }
      return ans;
    }
  }

  class Lookahead extends PExp {
    constructor(exp) {
      super();
      this.exp = exp;
    }

    eval(matcher) {
      var origPos = matcher.pos;
      var ans = this.exp.eval(matcher);
      matcher.pos = origPos;
      return ans;
    }
  }

  class Not extends Lookahead {
    eval(matcher) {
      var ans = super.eval(matcher);
      return ans === null ? true : null;
    }
  }

  class Repetition extends PExp {
    constructor(exp) {
      super();
      this.exp = exp;
    }

    eval(matcher) {
      var ans = [];
      while (true) {
        var origPos = matcher.pos;
        var cst = this.exp.eval(matcher);
        if (cst === null) {
          matcher.pos = origPos;
          break;
        } else {
          ans.push(cst);
        }
      }
      return ans;
    }
  }

  // Exports
  return {Matcher, PExp, Terminal, RuleApplication, Choice, Sequence, Repetition, Lookahead, Not};
});
