const PREC = {
  first: ($) => prec(100, $),
  last: ($) => prec(-100, $),
};

const common = {
  whitespace: /[ \r\n\t\f\v\p{Zs}\p{Zl}\p{Zp}]/,
  any_char: /.|[\r\n\u{85}\u{2028}\u{2029}]/,
  symbol_element: /[^ \r\n\t\f\v\p{Zs}\p{Zl}\p{Zp}"\(\)\\\|]/,
};

const hidden_node = {
  symbol: token(
    choice(
      repeat1(common.symbol_element),
      seq(
        "|",
        repeat(choice(/[^\|\\]+/, /\\[xX][0-9a-fA-F]+;/, /\\[abtnr]/, "\\|")),
        "|",
      ),
    ),
  ),
};

module.exports = grammar({
  name: "kanata",

  extras: (_) => [],

  rules: {
    program: ($) => repeat($._token),

    _token: ($) => choice($._intertoken, $._datum),

    _intertoken: ($) =>
      choice(
        // NOTE: `repeat1` here can significantly reduce code size than `repeat`
        token(repeat1(common.whitespace)),
        $.comment,
        $.block_comment,
      ),

    comment: ($) => /;;.*/,

    block_comment: ($) => seq("#|", repeat(common.any_char), PREC.first("|#")),

    _datum: ($) => choice($.boolean, $.string, $.symbol, $.list),

    boolean: (_) => token(choice("yes", "no")),
    string: ($) => seq('"', repeat(/[^"]+/), '"'),
    symbol: (_) => token(hidden_node.symbol),
    list: ($) => choice(seq("(", repeat($._token), ")")),
  },
});
