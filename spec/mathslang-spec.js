'use strict';
describe('mathslang', function() {
    var ms = Slang.mathslang;
    it('can compare Strings containing #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: 'x'}, 'x')).toEqual(true);
    });

    it('can compare exponential expressions using #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: '2^(x+1)'}, '2*2^x')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'a^2'}, 'a^(1+1)')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'a^2'}, 'a^(1+1)')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'a'}, '(a^(1/2))^2')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'a'}, '(a^2)^(1/2)')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '4^(1/2)'}, '2')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'x^(-1)'}, '1/x')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'x^(-2)'}, '1/(x^2)')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'x^(-a)'}, '1/(x^a)')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'e^(x+y)'}, '(e^x)*(e^y)')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'e^(x+y)'}, 'e^x')).toEqual(false);
        expect(ms.compare({ fun: '#equals', exp: '1/x^2'}, '1/(x^2)')).toEqual(true);
    });

    it('has not known bugs using #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: 'a+b'}, 'a+b-a+a')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'a+b'}, 'b-a')).toEqual(false);
        expect(ms.compare({ fun: '#equals', exp: '(2-3)/(1-4)'}, '1/3')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '1.2'}, ':§')).toEqual(false);
        expect(ms.compare({ fun: '#equals', exp: '5x+4(7-2x)/3'}, '5x+(7-2x)*4/3')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '5x+4(7-2x)/3'}, '5x+4((7-2x)/3)')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'x+2(1-x)'}, '-x+2')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '3*(-1)'}, '3*-1')).toEqual(false);
    });
    it('can handle empty input using #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: ''}, '0')).toEqual(false);
        expect(ms.compare({ fun: '#equals', exp: 'x+1'}, '')).toEqual(false);
        expect(ms.compare({ fun: '#equals', exp: ''}, 'x+1')).toEqual(false);
        expect(ms.compare({ fun: '#equals', exp: '1/0'}, '.5.5')).toEqual(false);
    });
    it('can handle constants using #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: '2+3'}, '5')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '3-2'}, '1')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '3*2'}, '6')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '2/4'}, '1/2')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '4/8'}, '0,5')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '2/5'}, '0.4')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '2^3'}, '8')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '2^3'}, '8')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '5+3'}, 'a^2+b^2')).toEqual(false);


        expect(ms.compare({ fun: '#equals', exp: 'bug'}, '5')).toEqual(false);
        expect(ms.compare({ fun: '#equals', exp: '5'}, 'bug')).toEqual(false);
        expect(ms.compare({ fun: '#equals', exp: '5'}, 'a^2+b^2')).toEqual(false);
    });
    it('can handle addition using #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: 'a+b'}, 'b+a')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'a+b'}, 'a+b+b')).toEqual(false);
    });
    it('can handle multiplication using #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: 'ab'}, 'b*a')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'ab'}, 'a*b*b')).toEqual(false);
    });
    it('can handle division using #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: 'a/b'}, 'a*1/b')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'a/a'}, '1')).toEqual(true);
    });
    it('can handle unknown variables using #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: 'a+b'}, 'a+c')).toEqual(false);
        expect(ms.compare({ fun: '#equals', exp: 'x+y'}, 'x+y')).toEqual(true);
    });
    it('can handle syntactic sugar for multiplication using #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: 'ab'}, 'ba')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '2ab'}, '2ba')).toEqual(true);
    });
    it('can handle the distributive law using #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: 'a(b+c)'}, 'ab+ac')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'a(b+c)'}, 'ab+ac')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'a(b+c)'}, 'ab+ac')).toEqual(true);
    });
    it('can handle the powers using #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: 'a*a'}, 'a^2')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'y*y*y'}, 'y^3')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'z^4'}, 'z*z*z')).toEqual(false);
        expect(ms.compare({ fun: '#equals', exp: 'a^2+b'}, 'b+a*a')).toEqual(true);
    });
    it('can handle power and multiplication using #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: '3ab^2'}, '3*a*b*b')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '3a^2 b'}, '3*a*a*b')).toEqual(true);
    });
    it('can handle binominals using #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: '(a+b)(a+b)'}, 'a*a+2ab+b*b')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '(a-b)(a-b)'}, 'a*a-2ab+b*b')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '(a+b)(a-b)'}, 'a*a-b*b')).toEqual(true);
    });
    it('can handle binominals with powers using #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: '(a+b)^2'}, 'a^2+2ab+b^2')).toEqual(true);
        // expect(ms.compare({ fun: '#equals', exp: '(a-b)^2'}, 'a^2-2ab+b^2')).toEqual(true);
        // expect(ms.compare({ fun: '#equals', exp: '(a+b)(a-b)'}, 'a^2-b^2')).toEqual(true);
        // expect(ms.compare({ fun: '#equals', exp: 'a*b*b'}, 'a*b^2')).toEqual(true);
    });
    it('can bind stronger in denominator using #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: '1/m'}, '1/m', 'distance')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '1/7331m', units:['distance']}, '1/(7331*m)')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '1/xm', units:['distance']}, '1/(x*m)')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '1/(a+b)m', units:['distance']}, '1/(am+bm)')).toEqual(true);
    });
    it('can handle syntactic sugar `x^-1` using #equals', function() {
        // without sugar
        expect(ms.compare({ fun: '#equals', exp: '(a^(-1)) * (b^(-1))'}, '(ab)^(-1)')).toEqual(true);
        // with ^-sugar
        expect(ms.compare({ fun: '#equals', exp: '(a^-1) * (b^-1)'}, '(ab)^-1')).toEqual(true);
    });
    it('can handle syntactic sugar, binding exponent to denominator', function() {
        var f = Slang.mathslang.extractUnit;
        expect(f('m^.5/s^2', 'distance') == 'm/s^2').toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '(c^2/y^2 - 1)^(1/2)'}, '(c^2/y^2 - 1)^(1/2)')).toEqual(true);
    });
    it('can multiply denominators Z & W as (1/Z)*(1/W) using #equals', function() {
        // already workz
        expect(ms.compare({ fun: '#equals', exp: '1/(xy)'}, '(1/y)*(1/x)')).toEqual(true);
        // problems with summary as denominator
        expect(ms.compare({ fun: '#equals', exp: '1/((a+b)x)'}, '(1/(a+b))*(1/x)')).toEqual(true);
    });
    it('can handle units using #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: '1Kg', units:['weight']}, '1000 g')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '1 Kg', units:['weight']}, '1000g')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '1000 m', units:['distance']}, '1Km')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '1000m', units:['distance']}, '1 Km')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '1min', units:['time']}, '60s', 'time')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 't*5m/s+10m', units:['distance','time']}, '(t+2s)*5m/s')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '1h', units:['time']}, '60m')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'Km/h', units:['distance','time']}, '1000m/60min')).toEqual(true);
        // `Meter im Nenner' (extended denominator)
        // 1/`2m' -> 1/`(2m)'
        expect(ms.compare({ fun: '#equals', exp: '1/2m', units:['distance']}, '0.5/m')).toEqual(true);
        // Knapp vorbei ist auch kein `Meter im Nenner' (real denominator)
        expect(ms.compare({ fun: '#equals', exp: '1/2*m', units:['distance']}, '0.5*m')).toEqual(true);
        // `Sekunde im Nenner' (extended denominator)
        // 1m/`2s' -> 1m/`(2s)'
        expect(ms.compare({ fun: '#equals', exp: '1m/2s', units:['distance','time']}, '0.5m/s')).toEqual(true);

        // unitified variable `x' in the denominator
        // 1/`xm' -> 1/`(xm)'
        expect(ms.compare({ fun: '#equals', exp: '1/xm', units:['distance']}, 'x^-1 m^-1')).toEqual(true);
        // Knapp vorbei ist auch keine einheitisierte Variable im Nenner
        expect(ms.compare({ fun: '#equals', exp: '1/x*m', units:['distance']}, 'x^-1*m')).toEqual(true);
        // Meter im Exponent ?!
        //      expect(ms.compare({ fun: '#equals', exp: '1/x^m'}, 'x^-1m', 'distance')).toEqual(true);

        // extended/unitified summary in the denominator
        // 1/`(a+b)s' -> 1/`((a+b)s)'
        //      expect(ms.compare({ fun: '#equals', exp: '1/(a+b)s'}, '1/(a+b)/s', 'time')).toEqual(true);
        // Knapp vorbei ist auch keine meterisierte Summe im Nenner
        expect(ms.compare({ fun: '#equals', exp: '1/(a+b)*m', units:['distance']}, 'm/(a+b)')).toEqual(true);

            //  expect(ms.compare('#approx 1 Km/(s^2) #epsilon 0.1', '999m/(s^2) ', 'distance time')).toEqual(true);
    });
    it('can handle indexed variables using #equals (stud-style)', function() {
        expect(ms.compare({ fun: '#equals', exp: 'x_0+y_0'}, 'y0+x0')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'x_0y_0'}, 'x0*y0')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'x_0-y_0'}, '-y0+x0')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'x_0+y_0'}, '0')).toEqual(false);
        expect(ms.compare({ fun: '#equals', exp: 'x_0'}, '0x')).toEqual(false);
        // `π'(pi) is the only char left for replacing `x_0' and `x0' to
        expect(ms.compare({ fun: '#equals', exp: 'ΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡ΢ΣΤΥΦΧΨΩabcdefghijklmnopqrstuvwxyz0+x_0'},
            'ABCDEFGHIJKLMNOPQRSTUVWXYZαβγδεζηθικλμνξορςστυφχψω0+x0'
        )).toEqual(true);
    });
    it('can handle indexed variables using #equals (prof-style)', function() {
        expect(true).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'x_0+y_0'}, 'y_0+x_0')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'x_0y_0'}, 'x_0*y_0')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'x_0-y_0'}, '-y_0+x_0')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'x_0+y_0'}, '0')).toEqual(false);
        expect(ms.compare({ fun: '#equals', exp: 'x_0'}, '0_x')).toEqual(false);
    });
    it('can handle special chars using #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: 'a^3'}, 'aa²')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'b³'}, 'bbb')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'a²'}, 'a+a')).toEqual(false);
    });
    it('can handle square roots using #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: 'sqrt(x)'}, 'x^(1/2)')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'sqrt(4)'}, '2')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'Sqrt(4)'}, '2')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'wurzel(9)'}, '3')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'Wurzel(16)'}, '4')).toEqual(true);
    });
    it('can handle linear functions using #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: '2x+1'}, '1+x+x')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'mx+1'}, '1+mx')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '-mx+n'}, 'n-mx')).toEqual(true);
    });
    it('can handle quadratic functions using #equals', function() {
        expect(ms.compare({ fun: '#equals', exp: '2x*x+1'}, '1+x*2*x')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '2x*x+1+2x'}, '2x*(x+1)+1')).toEqual(true);
    });

    it('can handle handle expressions using #identic', function() {
        expect(ms.compare({ fun: '#identic', exp: 'a+b'}, 'b+a')).toEqual(true);
        expect(ms.compare({ fun: '#identic', exp: '3.0'}, '3')).toEqual(true);
        expect(ms.compare({ fun: '#identic', exp: '3+4'}, '7')).toEqual(false);
        expect(ms.compare({ fun: '#identic', exp: 'ca+ba'}, 'ab+ac')).toEqual(true);
        expect(ms.compare({ fun: '#identic', exp: 'a(b+c)'}, 'ab+ac')).toEqual(false);
        expect(ms.compare({ fun: '#identic', exp: '(a+b)^2'}, 'a^2+2ab+b^2')).toEqual(false);
        expect(ms.compare({ fun: '#identic', exp: '(a-b)^2'}, 'a^2-2ab+b^2')).toEqual(false);
        expect(ms.compare({ fun: '#identic', exp: '(a+b)(a-b)'}, 'a^2-b^2')).toEqual(false);
        expect(ms.compare({ fun: '#identic', exp: 'a*b*b'}, 'a*b^2')).toEqual(false);
    });

    it('can handle handle expressions using #approx', function() {
        expect(ms.compare({ fun: '#approx', exp: '3', error:'1'}, '3.5')).toEqual(true);
        expect(ms.compare({ fun: '#approx', exp: '3', error:'1'}, '4.5')).toEqual(false);
        expect(ms.compare({ fun: '#approx', exp: '3', error:'1'}, '1.5')).toEqual(false);
        expect(ms.compare({ fun: '#approx', exp: '3.14',error:'0.01'}, '3.13')).toEqual(true);
    });
   it('can handle handle units using #approx', function() {
        expect(ms.compare({exp:'1 Km/h', fun:'#approx', error:'0.1',units:['distance','time']}, '999m/60min')).toEqual(true);
        expect(ms.compare({exp:'1 Km/(s^2)', fun:'#approx', error:'1',units:['distance','time']}, '999m/(s^2)')).toEqual(true);
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
        expect(ms.compare({ fun: '#equals', exp: 'α'}, 'α')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'α+tino'}, 'inot+α')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'Δ+tino'}, 'inot+Δ')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'α^ψ'}, 'α^ψ')).toEqual(true);
        expect(ms.compare({ fun: '#identic', exp: 'α^ψ'}, 'α^ψ')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: '2π'}, 'π+π')).toEqual(true);
    });


    it('can handle variables', function() {
        expect(ms.compare({fun:'#equals', exp:'1.5', inputExp:'@numerator/@denominator'},{
            numerator: 3,
            denominator: 2
        })).toEqual(true);
        expect(ms.compare({fun:'#equals', exp:'1.5', inputExp:'@numerator/@denominator'}, {
            numerator: 3,
            denominator: 2
        })).toEqual(true);
    });

    it('can handle vectors', function() {
        expect(ms.compare({fun: '#vecEquals', exp: '[1,2]', inputExp:'[@1443385985478, @1443385986479]' }, {
            1443385985478: '20',
            1443385986479: '40'
        })).toEqual(true);
        expect(ms.compare({ fun: '#vecEquals', exp: '[1,2]'}, '[1,2]')).toEqual(true);
        expect(ms.compare({ fun: '#vecEquals', exp: '[3,2]'}, '[6,4]')).toEqual(true);
        expect(ms.compare({ fun: '#vecEquals', exp: '[3.2,2.2]'}, '[3.2,2.2]')).toEqual(true);
        expect(ms.compare({ fun: '#vecEquals', exp: '[1,2,1]'}, '[1,2,1]')).toEqual(true);
        expect(ms.compare({ fun: '#vecEquals', exp: '[1,0,1.5]'}, '[2,0,3]')).toEqual(true);
        expect(ms.compare({ fun: '#vecEquals', exp: '[1,2]'}, '[2,4]')).toEqual(true);
        expect(ms.compare({ fun: '#vecEquals', exp: '[2,4]', inputExp:'[@x1,@x2]' }, {
            x1: 1,
            x2: 2
        })).toEqual(true);

    });

    it('can handle fancy indentifiers', function() {
        expect(ms.compare({ fun: '#equals', exp: 't\''}, 't\'')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'k\'^2'}, 'k\'k\'')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 't\'^2'}, 'k\'k\'')).toEqual(false);
    });

    it('can handle variables containing underscore', function() {
        expect(ms.compare({ fun: '#equals', exp: 'A+abc+7*x_0'}, 'abc+7*x_0+A')).toEqual(true);
    });

    it('can handle sinus', function() {
        // mathslang semantix
        expect(ms.compare({ fun: '#equals', exp: 'sin(xy)'}, 'sin(yx)')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'sin(x+y)'}, 'sin(y+x)')).toEqual(true);
        // that's why mathslang semantix are not enough
        expect(ms.compare({ fun: '#equals', exp: 'sin(x+y)'}, 'xsin+ysin')).toEqual(false);
    });

    it('can handle complex identifiers', function() {
        expect(ms.compare({ fun: '#equals', exp: 'x_i'}, 'x_i')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'HALLOx_ix_i'}, 'x_i^2HALLO')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'x_ix_i'}, 'x_i^2')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'x_0^2'}, 'x_0^2')).toEqual(true);
        expect(ms.compare({ fun: '#equals', exp: 'x_0^2'}, 'x_1^2')).toEqual(false);
    });

    it('can handle units using #lt, #leq, #gt, #geq ', function() {
        //schnell skizziert... maybe the tests are a little buggy.... 
        expect(ms.compare({ fun: '#lt', exp: '10km'}, '15', 'distance')).toEqual(false);
        expect(ms.compare({ fun: '#lt', exp: '10'}, '15a')).toEqual(false);

        expect(ms.compare({ fun: '#lt', exp: '10km', units:'distance'}, '15km' )).toEqual(true);
        expect(ms.compare({ fun: '#lt', exp: '10km', units:'distance'}, '5km')).toEqual(false);
        expect(ms.compare({ fun: '#gt', exp: '10km', units:'distance'}, '5m')).toEqual(true);
        expect(ms.compare({ fun: '#gt', exp: '10m', units:'distance'}, '15km')).toEqual(false);

        expect(ms.compare({ fun: '#lt', exp: '10s', units:'time'}, '15h')).toEqual(true);
        expect(ms.compare({ fun: '#lt', exp: '10s', units:'time'}, '5h')).toEqual(false);
        expect(ms.compare({ fun: '#gt', exp: '10s', units:'time'}, '5h')).toEqual(true);
        expect(ms.compare({ fun: '#gt', exp: '10s', units:'time'}, '15h')).toEqual(false);

    });
});
