describe('langslang', function() {

    var ls = Slang.langslang;

    it('can detect typo', function() {
        expect(ls.compare('#typo berlin', 'Börlin')).toEqual(true);
    });
});
