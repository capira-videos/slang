describe('colorslang', function() {

    var cs = Slang.colorslang;

    it('can compare colors encoded in hex', function() {
        expect(cs.compare('#0000ff', [0,0,255])).toEqual(true);
        expect(cs.compare('#00ff00', [0,255,0])).toEqual(true);
        expect(cs.compare("#FF00FF",[255,0,255])).toEqual(true);
        expect(cs.compare('#ff0000', [255,0,0])).toEqual(true);

        expect(cs.compare('#ff0000', [0,255,0])).toEqual(false);
        expect(cs.compare('#ff0000', [0,0,255])).toEqual(false);
    }); 

   
});
