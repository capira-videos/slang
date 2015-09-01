window.Slang.langslang._damerauLevenshtein = function(a, b) {
    var matrix = []

    // check the easy cases first
    if (a == b) {
        return 0;
    }
    if (a.length == 0) {
        return b.length
    }
    if (b.length == 0) {
        return a.length
    }

    for (var i = 0; i < a.length + 1; i++) {
        matrix[i] = [];

        for (var j = 0; j < b.length + 1; j++) {
            if (i == 0 || j == 0) {
                matrix[i][j] = Math.max(i, j);
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1, // insertion
                    matrix[i][j - 1] + 1, // deletion
                    matrix[i - 1][j - 1] + (a[i - 1] == b[j - 1] ? 0 : 1) // substitution
                );

                // transposition
                if (j > 1 && i > 1 && a[i - 1] == b[j - 2] && a[i - 2] == b[j - 1]) {
                    matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
                }
            }
        }
    }

    return matrix[a.length][b.length];
};
