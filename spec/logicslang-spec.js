describe('logicslang', function() {

    var ls = Slang.logicslang;

    _compareFn = function(a, b) {
        return a === b;
    };

    it('can compare Strings containing #or', function() {
        expect(ls.compare('y #or x', 'x', _compareFn)).toEqual(true);
        expect(ls.compare('y #or x', 'z', _compareFn)).toEqual(false);
    });
    it('can compare Strings containing #and', function() {
        expect(ls.compare('x #and x', 'x', _compareFn)).toEqual(true);
    });
    it('can compare Strings containing #not', function() {
        expect(ls.compare('#not y', 'x', _compareFn)).toEqual(true);
        expect(ls.compare('#not y', 'y', _compareFn)).toEqual(false);
    });
    it('can compare Strings containing #and and #not', function() {
        expect(ls.compare('x #and #not y', 'x', _compareFn)).toEqual(true);
        expect(ls.compare('x #and #not y', 'y', _compareFn)).toEqual(false);
    });
    it('can compare Strings containing #or and #not', function() {
        expect(ls.compare('#not y #or x', 'x', _compareFn)).toEqual(true);
        expect(ls.compare('#not y #or x', 'y', _compareFn)).toEqual(false);
        expect(ls.compare('y #or #not x', 'x', _compareFn)).toEqual(false);
        expect(ls.compare('y #or #not x', 'y', _compareFn)).toEqual(true);

    });
});
