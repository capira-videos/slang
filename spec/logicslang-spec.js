describe('logicslang', function() {

    var ls = Slang.logicslang;

    _compareFn = function(a, b) {
        return a === b;
    };

    it('can compare Strings containing #or', function() {
        expect(ls.compare('y #or x', 'x',_compareFn)).toEqual(true);
    });
});
