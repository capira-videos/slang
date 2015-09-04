describe('hausdorffslang', function() {

    var hs = Slang.hausdorffslang;

    it('can compare sets', function() {
        expect(hs.compare(
            [{
                x: 1,
                y: 2
            }, {
                x: 2,
                y: 1
            }], [{
                x: 1,
                y: 2
            }, {
                x: 2,
                y: 1
            }])).toEqual(1);

        expect(hs.compare(
            [{
                x: 1,
                y: 2
            }, {
                x: 2,
                y: 1
            }], [{
                x: 1,
                y: 2
            }, {
                x: 2,
                y: 1.2
            }])).toEqual(0.8);

    });


});
