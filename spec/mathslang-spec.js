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
        expect(ms.compare('#equals 1/x^2', '1/(x^2)')).toEqual(true);
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
        expect(ms.compare('#equals x+y', 'x+y')).toEqual(true);
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
        // expect(ms.compare('#equals (a-b)^2', 'a^2-2ab+b^2')).toEqual(true);
        // expect(ms.compare('#equals (a+b)(a-b)', 'a^2-b^2')).toEqual(true);
        // expect(ms.compare('#equals a*b*b', 'a*b^2')).toEqual(true);
    });
    it('can bind stronger in denominator using #equals', function() {
        expect(ms.compare('#equals 1/m', '1/m', 'distance')).toEqual(true);
        expect(ms.compare('#equals 1/7331m', '1/(7331*m)', 'distance')).toEqual(true);
        expect(ms.compare('#equals 1/xm', '1/(x*m)', 'distance')).toEqual(true);
        expect(ms.compare('#equals 1/(a+b)m', '1/(am+bm)', 'distance')).toEqual(true);
    });
    it("can handle syntactic sugar `x^-1' using #equals", function() {
        // without sugar
        expect(ms.compare('#equals (a^(-1)) * (b^(-1))', '(ab)^(-1)')).toEqual(true);
        // with ^-sugar
        expect(ms.compare('#equals (a^-1) * (b^-1)', '(ab)^-1')).toEqual(true);
    });
    it('can handle syntactic sugar, binding exponent to denominator', function() {
        var f = Slang.mathslang.extractUnit;
        expect(f('m^.5/s^2', 'distance') == 'm/s^2').toEqual(true);
    });
    it("can multiply denominators Z & W as (1/Z)*(1/W) using #equals", function() {
        // already workz
        expect(ms.compare('#equals 1/(xy)', '(1/y)*(1/x)')).toEqual(true);
        // problems with summary as denominator
        expect(ms.compare('#equals 1/((a+b)x)', '(1/(a+b))*(1/x)')).toEqual(true);
    });
    it('can handle units using #equals', function() {
        expect(ms.compare('#equals 1Kg', '1000 g', 'weight')).toEqual(true);
        expect(ms.compare('#equals 1 Kg', '1000g', 'weight')).toEqual(true);
        expect(ms.compare('#equals 1000 m', '1Km', 'distance')).toEqual(true);
        expect(ms.compare('#equals 1000m', '1 Km', 'distance')).toEqual(true);
        expect(ms.compare('#equals 1min', '60s', 'time')).toEqual(true);
        expect(ms.compare('#equals t*5m/s+10m', '(t+2s)*5m/s', 'distance time')).toEqual(true);
        expect(ms.compare('#equals 1h', '60m', 'time')).toEqual(true);
        expect(ms.compare('#equals Km/h', '1000m/60min', 'distance time')).toEqual(true);
        // `Meter im Nenner' (extended denominator)
        // 1/`2m' -> 1/`(2m)'
        expect(ms.compare('#equals 1/2m', '0.5/m', 'distance')).toEqual(true);
        // Knapp vorbei ist auch kein `Meter im Nenner' (real denominator)
        expect(ms.compare('#equals 1/2*m', '0.5*m', 'distance')).toEqual(true);
        // `Sekunde im Nenner' (extended denominator)
        // 1m/`2s' -> 1m/`(2s)'
        expect(ms.compare('#equals 1m/2s', '0.5m/s', 'distance time')).toEqual(true);

        // unitified variable `x' in the denominator
        // 1/`xm' -> 1/`(xm)'
        expect(ms.compare('#equals 1/xm', 'x^-1 m^-1', 'distance')).toEqual(true);
        // Knapp vorbei ist auch keine einheitisierte Variable im Nenner
        expect(ms.compare('#equals 1/x*m', 'x^-1*m', 'distance')).toEqual(true);
        // Meter im Exponent ?!
        //      expect(ms.compare('#equals 1/x^m', 'x^-1m', 'distance')).toEqual(true);

        // extended/unitified summary in the denominator
        // 1/`(a+b)s' -> 1/`((a+b)s)'
        //      expect(ms.compare('#equals 1/(a+b)s', '1/(a+b)/s', 'time')).toEqual(true);
        // Knapp vorbei ist auch keine meterisierte Summe im Nenner
        expect(ms.compare('#equals 1/(a+b)*m', 'm/(a+b)', 'distance')).toEqual(true);

        expect(ms.compare('#approx 1 Km/h #epsilon 0.1', '999m/60min', 'distance time')).toEqual(true);
        expect(ms.compare('#approx 1 Km/(s^2) #epsilon 1', '999m/(s^2) ', 'distance time')).toEqual(true);
        //  expect(ms.compare('#approx 1 Km/(s^2) #epsilon 0.1', '999m/(s^2) ', 'distance time')).toEqual(true);
    });
    it('can handle indexed variables using #equals (stud-style)', function() {
        expect(ms.compare('#equals x_0+y_0', 'y0+x0')).toEqual(true);
        expect(ms.compare('#equals x_0y_0', 'x0*y0')).toEqual(true);
        expect(ms.compare('#equals x_0-y_0', '-y0+x0')).toEqual(true);
        expect(ms.compare('#equals x_0+y_0', '0')).toEqual(false);
        expect(ms.compare('#equals x_0', '0x')).toEqual(false);
        // `π'(pi) is the only char left for replacing `x_0' and `x0' to
        expect(ms.compare('#equals ΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡ΢ΣΤΥΦΧΨΩabcdefghijklmnopqrstuvwxyz0+x_0',
            'ABCDEFGHIJKLMNOPQRSTUVWXYZαβγδεζηθικλμνξορςστυφχψω0+x0'
        )).toEqual(true);
    });
    it('can handle indexed variables using #equals (prof-style)', function() {
        expect(true).toEqual(true);
        expect(ms.compare('#equals x_0+y_0', 'y_0+x_0')).toEqual(true);
        expect(ms.compare('#equals x_0y_0', 'x_0*y_0')).toEqual(true);
        expect(ms.compare('#equals x_0-y_0', '-y_0+x_0')).toEqual(true);
        expect(ms.compare('#equals x_0+y_0', '0')).toEqual(false);
        expect(ms.compare('#equals x_0', '0_x')).toEqual(false);
    });
    it('can handle special chars using #equals', function() {
        expect(ms.compare('#equals a^3', 'aa²')).toEqual(true);
        expect(ms.compare('#equals b³', 'bbb')).toEqual(true);
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
        expect(ms.compare('#approx 3.14 #epsilon 0.01', '3.13')).toEqual(true);
    });

    it('can compute a term\'s unit', function() {
        var f = Slang.mathslang.stringUnit;
        expect(f('1/s+m^25m+7m^2', 'distance time') == 'm^2 + m^26 + /s').toEqual(true);
        expect(f('1/2*m/s+7', 'distance time') == 'm/s').toEqual(true);
        expect(f('1/(1+1)m', 'distance') == '/m').toEqual(true);
        expect(f('1/(1+1)m^-7', 'distance') == '/m^7').toEqual(true);
        expect(f('(m^.5/s)^2', 'distance') == 'm/s^2').toEqual(true);
        expect(f('(/m)^-1*s^-2') == 'm/s^2').toEqual(true);
    });

    it('can compute trival unit', function() {
        var f = Slang.mathslang.extractUnit;
        expect(f('m') == 'distance').toEqual(true);
        expect(f('s') == 'time').toEqual(true);
        expect(f('g') == 'weight').toEqual(true);
    });
    it('can compute combined unit', function() {
        var f = Slang.mathslang.extractUnit;
        expect(f('m/s') == 'distance time').toEqual(true);
        expect(f('m/s^2') == 'distance time').toEqual(true);
        expect(f('Kg/s') == 'weight time').toEqual(true);
        expect(f('h/g') == 'weight time').toEqual(true);
    });
    it('can handle greek letters', function() {
        expect(ms.compare('#equals α', 'α')).toEqual(true);
        expect(ms.compare('#equals α+tino', 'inot+α')).toEqual(true);
        expect(ms.compare('#equals Δ+tino', 'inot+Δ')).toEqual(true);
        expect(ms.compare('#equals α^ψ', 'α^ψ')).toEqual(true);
        expect(ms.compare('#identic α^ψ', 'α^ψ')).toEqual(true);
        expect(ms.compare('#equals 2π', 'π+π')).toEqual(true);
    });


    it('can handle variables', function() {
        expect(ms.compare('<& @numerator/@denominator& #equals 1.5>', {
            numerator: 3,
            denominator: 2
        })).toEqual(true);
        expect(ms.compare('<& @numerator/@denominator & #equals 1.5> #and <& @numerator + @denominator & #equals 5>', {
            numerator: 3,
            denominator: 2
        })).toEqual(true);
    });

    it('can handle vectors', function() {
        expect(ms.compare('<& [@1443385985478, @1443385986479] & #vecEquals [1,2]>', {
            1443385985478: '20',
            1443385986479: '40'
        })).toEqual(true);
        expect(ms.compare('#vecEquals [1,2]', '[1,2]')).toEqual(true);
        expect(ms.compare('#vecEquals [3,2]', '[6,4]')).toEqual(true);
        expect(ms.compare('#vecEquals [3.2,2.2]', '[3.2,2.2]')).toEqual(true);
        expect(ms.compare('#vecEquals [1,2,1]', '[1,2,1]')).toEqual(true);
        expect(ms.compare('#vecEquals [1,0,1.5]', '[2,0,3]')).toEqual(true);
        expect(ms.compare('#vecEquals [1,2]', '[2,4]')).toEqual(true);
        expect(ms.compare('<& [@x1,@x2] & #vecEquals [2,4]>', {
            x1: 1,
            x2: 2
        })).toEqual(true);

    });

    it('can handle fancy indentifiers', function() {
        expect(ms.compare('#equals t\'', 't\'')).toEqual(true);
        expect(ms.compare('#equals k\'^2', 'k\'k\'')).toEqual(true);
        expect(ms.compare('#equals t\'^2', 'k\'k\'')).toEqual(false);
    });

    it('can handle variables containing underscore', function() {
        expect(ms.compare('#equals A+abc+7*x_0', 'abc+7*x_0+A')).toEqual(true);
    });

    it('can handle sinus', function() {
        // mathslang semantix
        expect(ms.compare('#equals sin(xy)', 'sin(yx)')).toEqual(true);
        expect(ms.compare('#equals sin(x+y)', 'sin(y+x)')).toEqual(true);
        // that's why mathslang semantix are not enough
        expect(ms.compare('#equals sin(x+y)', 'xsin+ysin')).toEqual(false);
    });

    it('can handle complex identifiers', function() {
        expect(ms.compare('#equals x_i', 'x_i')).toEqual(true);
        expect(ms.compare('#equals HALLOx_ix_i', 'x_i^2HALLO')).toEqual(true);
        expect(ms.compare('#equals x_ix_i', 'x_i^2')).toEqual(true);
        expect(ms.compare('#equals x_0^2', 'x_0^2')).toEqual(true);
        expect(ms.compare('#equals x_0^2', 'x_1^2')).toEqual(false);
    });

    it('can handle units using #lt, #leq, #gt, #geq ', function() {
        //schnell skizziert... maybe the tests are a little buggy.... 
        expect(ms.compare('#lt 10km', '15', 'distance')).toEqual(false);
        expect(ms.compare('#lt 10', '15a')).toEqual(false);

        expect(ms.compare('#lt 10km', '15km', 'distance')).toEqual(true);
        expect(ms.compare('#lt 10km', '5km', 'distance')).toEqual(false);
        expect(ms.compare('#gt 10km', '5m', 'distance')).toEqual(true);
        expect(ms.compare('#gt 10m', '15km', 'distance')).toEqual(false);

        expect(ms.compare('#lt 10s', '15h', 'time')).toEqual(true);
        expect(ms.compare('#lt 10s', '5h', 'time')).toEqual(false);
        expect(ms.compare('#gt 10s', '5h', 'time')).toEqual(true);
        expect(ms.compare('#gt 10s', '15h', 'time')).toEqual(false);

    });
});
