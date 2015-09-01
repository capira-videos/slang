describe('langslang', function() {

    var ls = Slang.langslang;

    it('can compare expressions containing no tag', function() {
        expect(ls.compare('berlin', 'berlin')).toEqual(true);
        expect(ls.compare('berlin', 'Berlin')).toEqual(false);
    }); 

    it('can compare expressions containing #typo', function() {
        expect(ls.compare('#typo berlin', 'Börlin')).toEqual(true);
    });
    it('can compare expressions containing #nocase', function() {
        expect(ls.compare('#nocase Berlin', 'berlin')).toEqual(true);
    });
    it('can compare expressions containing #regex', function() {
        expect(ls.compare('#regex Berlin', 'Berlin')).toEqual(true);
    });
});
