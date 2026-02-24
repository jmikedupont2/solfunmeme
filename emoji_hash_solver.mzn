% MiniZinc model to find emoji inputs that generate target hash
% Monster Group: 71 × 59 × 47 = 196,883

include "globals.mzn";

% 24 emoji alphabet (base-24 encoding)
int: EMOJI_COUNT = 24;

% 3 emoji positions (24^3 = 13,824 combinations)
var 0..EMOJI_COUNT-1: emoji1;
var 0..EMOJI_COUNT-1: emoji2;
var 0..EMOJI_COUNT-1: emoji3;

% Target hash (first 16 hex chars)
array[1..16] of 0..15: target_hash;

% Hash function approximation (simplified)
function var int: simple_hash(var int: e1, var int: e2, var int: e3) =
    ((e1 * 71 + e2 * 59 + e3 * 47) mod 256);

% Constraint: hash matches first 2 hex digits
constraint simple_hash(emoji1, emoji2, emoji3) == target_hash[1] * 16 + target_hash[2];

% Monster Group constraint
constraint (emoji1 * 71 + emoji2 * 59 + emoji3 * 47) mod 196883 >= 0;

% Solve
solve satisfy;

output [
    "Emoji indices: ", show(emoji1), " ", show(emoji2), " ", show(emoji3), "\n",
    "Hash: ", show(simple_hash(emoji1, emoji2, emoji3)), "\n",
    "Monster Group: ", show((emoji1 * 71 + emoji2 * 59 + emoji3 * 47) mod 196883), "\n"
];
