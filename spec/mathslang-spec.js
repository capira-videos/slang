describe('mathslang', function() {
    var ms = Slang.mathslang;
    it('can compare Strings containing #equals', function() {
        expect(ms.compare('#equals x', 'x')).toEqual(true);
    });

    it('can compare exponential expressions using #equals', function() {
        expect(ms.compare('#equals 2^(x+1)', '2*2^x')).toEqual(true);
        expect(ms.compare('#equals a^2', 'a^(1+1)')).toEqual(true);
        expect(ms.compare('#equals a^2', 'a^(1+1)')).toEqual(true);
        expect(ms.compare('#equals a', '(a^(1/2))^2')).toEqual(true);
        expect(ms.compare('#equals a', '(a^2)^(1/2)')).toEqual(true);
        expect(ms.compare('#equals 4^(1/2)', '2')).toEqual(true);
        expect(ms.compare('#equals x^(-1)', '1/x')).toEqual(true);
        expect(ms.compare('#equals x^(-2)', '1/(x^2)')).toEqual(true);
        expect(ms.compare('#equals x^(-a)', '1/(x^a)')).toEqual(true);
        expect(ms.compare('#equals e^(x+y)', '(e^x)*(e^y)')).toEqual(true);
        expect(ms.compare('#equals e^(x+y)', 'e^x')).toEqual(false);
    });

    it('has not known bugs using #equals', function() {
        expect(ms.compare('#equals a+b', 'a+b-a+a')).toEqual(true);
        expect(ms.compare('#equals a+b', 'b-a')).toEqual(false);
        expect(ms.compare('#equals (2-3)/(1-4)', '1/3')).toEqual(true);
        expect(ms.compare('#equals 1.2', ':§')).toEqual(false);
        expect(ms.compare('#equals 5x+4(7-2x)/3', '5x+(7-2x)*4/3')).toEqual(true);
        expect(ms.compare('#equals 5x+4(7-2x)/3', '5x+4((7-2x)/3)')).toEqual(true);
        expect(ms.compare('#equals x+2(1-x)', '-x+2')).toEqual(true);
        expect(ms.compare('#equals 3*(-1)', '3*-1')).toEqual(false);
    });
    it('can handle empty input using #equals', function() {
        expect(ms.compare('#equals ', '0')).toEqual(false);
        expect(ms.compare('#equals x+1', '')).toEqual(false);
        expect(ms.compare('#equals ', 'x+1')).toEqual(false);
        expect(ms.compare('#equals 1/0', '.5.5')).toEqual(false);
    });
    it('can handle constants using #equals', function() {
        expect(ms.compare('#equals 2+3', '5')).toEqual(true);
        expect(ms.compare('#equals 3-2', '1')).toEqual(true);
        expect(ms.compare('#equals 3*2', '6')).toEqual(true);
        expect(ms.compare('#equals 2/4', '1/2')).toEqual(true);
        expect(ms.compare('#equals 4/8', '0,5')).toEqual(true);
        expect(ms.compare('#equals 2/5', '0.4')).toEqual(true);
        expect(ms.compare('#equals 2^3', '8')).toEqual(true);
        expect(ms.compare('#equals 2^3', '8')).toEqual(true);
        expect(ms.compare('#equals 5+3', 'a^2+b^2')).toEqual(false);
        expect(ms.compare('#equals bug', '5')).toEqual(false);
        expect(ms.compare('#equals 5', 'bug')).toEqual(false);
        expect(ms.compare('#equals 5', 'a^2+b^2')).toEqual(false);
    });
    it('can handle addition using #equals', function() {
        expect(ms.compare('#equals a+b', 'b+a')).toEqual(true);
        expect(ms.compare('#equals a+b', 'a+b+b')).toEqual(false);
    });
    it('can handle multiplication using #equals', function() {
        expect(ms.compare('#equals ab', 'b*a')).toEqual(true);
        expect(ms.compare('#equals ab', 'a*b*b')).toEqual(false);
    });
    it('can handle division using #equals', function() {
        expect(ms.compare('#equals a/b', 'a*1/b')).toEqual(true);
        expect(ms.compare('#equals a/a', '1')).toEqual(true);
    });
    it('can handle unknown variables using #equals', function() {
        expect(ms.compare('#equals a+b', 'a+c')).toEqual(false);
    });
    it('can handle syntactic sugar for multiplication using #equals', function() {
        expect(ms.compare('#equals ab', 'ba')).toEqual(true);
        expect(ms.compare('#equals 2ab', '2ba')).toEqual(true);
    });
    it('can handle the distributive law using #equals', function() {
        expect(ms.compare('#equals a(b+c)', 'ab+ac')).toEqual(true);
        expect(ms.compare('#equals a(b+c)', 'ab+ac')).toEqual(true);
        expect(ms.compare('#equals a(b+c)', 'ab+ac')).toEqual(true);
    });
    it('can handle the powers using #equals', function() {
        expect(ms.compare('#equals a*a', 'a^2')).toEqual(true);
        expect(ms.compare('#equals y*y*y', 'y^3')).toEqual(true);
        expect(ms.compare('#equals z^4', 'z*z*z')).toEqual(false);
        expect(ms.compare('#equals a^2+b', 'b+a*a')).toEqual(true);
    });
    it('can handle power and multiplication using #equals', function() {
        expect(ms.compare('#equals 3ab^2', '3*a*b*b')).toEqual(true);
        expect(ms.compare('#equals 3a^2 b', '3*a*a*b')).toEqual(true);
    });
    it('can handle binominals using #equals', function() {
        expect(ms.compare('#equals (a+b)(a+b)', 'a*a+2ab+b*b')).toEqual(true);
        expect(ms.compare('#equals (a-b)(a-b)', 'a*a-2ab+b*b')).toEqual(true);
        expect(ms.compare('#equals (a+b)(a-b)', 'a*a-b*b')).toEqual(true);
    });
    it('can handle binominals with powers using #equals', function() {
        expect(ms.compare('#equals (a+b)^2', 'a^2+2ab+b^2')).toEqual(true);
        expect(ms.compare('#equals (a-b)^2', 'a^2-2ab+b^2')).toEqual(true);
        expect(ms.compare('#equals (a+b)(a-b)', 'a^2-b^2')).toEqual(true);
        expect(ms.compare('#equals a*b*b', 'a*b^2')).toEqual(true);
    });
    it('can handle units using #equals', function() {
        expect(ms.compare('#equals 1Kg', '1000 g')).toEqual(true);
        expect(ms.compare('#equals 1 Kg', '1000g')).toEqual(true);
        expect(ms.compare('#equals 1000 m', '1Km')).toEqual(true);
        expect(ms.compare('#equals 1000m', '1 Km')).toEqual(true);
    });
    it('can handle indexed variables using #equals', function() {
        expect(ms.compare('#equals x0+y0', 'y0+x0')).toEqual(true);
        expect(ms.compare('#equals x0y0', 'y0*y0')).toEqual(true);
        expect(ms.compare('#equals x0-y0', '-y0+x0')).toEqual(true);
        expect(ms.compare('#equals x0+y0', '0')).toEqual(false);
        expect(ms.compare('#equals x0', '0x')).toEqual(false);
    });
    it('can handle special chars using #equals', function() {
        expect(ms.compare('#equals a^3', 'aa²')).toEqual(true);
        expect(ms.compare('#equals b&sup3;', 'bbb')).toEqual(true);
        expect(ms.compare('#equals a²', 'a+a')).toEqual(false);
    });
    it('can handle square roots using #equals', function() {
        expect(ms.compare('#equals sqrt(x)', 'x^(1/2)')).toEqual(true);
        expect(ms.compare('#equals sqrt(4)', '2')).toEqual(true);
        expect(ms.compare('#equals Sqrt(4)', '2')).toEqual(true);
        expect(ms.compare('#equals wurzel(9)', '3')).toEqual(true);
        expect(ms.compare('#equals Wurzel(16)', '4')).toEqual(true);
    });
    it('can handle linear functions using #equals', function() {
        expect(ms.compare('#equals 2x+1', '1+x+x')).toEqual(true);
        expect(ms.compare('#equals mx+1', '1+mx')).toEqual(true);
        expect(ms.compare('#equals -mx+n', 'n-mx')).toEqual(true);
    });
    it('can handle quadratic functions using #equals', function() {
        expect(ms.compare('#equals 2x*x+1', '1+x*2*x')).toEqual(true);
        expect(ms.compare('#equals 2x*x+1+2x', '2x*(x+1)+1')).toEqual(true);
    });

    it('can handle handle expressions using #identic', function() {
        expect(ms.compare('#identic a+b', 'b+a')).toEqual(true);
        expect(ms.compare('#identic 3.0', '3')).toEqual(true);
        expect(ms.compare('#identic 3+4', '7')).toEqual(false);
        expect(ms.compare('#identic ca+ba', 'ab+ac')).toEqual(true);
        expect(ms.compare('#identic a(b+c)', 'ab+ac')).toEqual(false);
        expect(ms.compare('#identic (a+b)^2', 'a^2+2ab+b^2')).toEqual(false);
        expect(ms.compare('#identic (a-b)^2', 'a^2-2ab+b^2')).toEqual(false);
        expect(ms.compare('#identic (a+b)(a-b)', 'a^2-b^2')).toEqual(false);
        expect(ms.compare('#identic a*b*b', 'a*b^2')).toEqual(false);
    });

    it('can handle handle expressions using #approx', function() {
        expect(ms.compare('#approx 3 #epsilon 1', '3.5')).toEqual(true);
        expect(ms.compare('#approx 3 #epsilon 1', '4.5')).toEqual(false);
        expect(ms.compare('#approx 3 #epsilon 1', '1.5')).toEqual(false);

    });

    it('can handle variables', function() {
        expect(ms.compare('<& @numerator/@denominator& #equals 1.5>',
                {numerator : 3, denominator: 2})).toEqual(true);
        expect(ms.compare('<& @numerator/@denominator & #equals 1.5> #and <& @numerator + @denominator & #equals 5>',
                {numerator : 3, denominator: 2})).toEqual(true);
    });
});
