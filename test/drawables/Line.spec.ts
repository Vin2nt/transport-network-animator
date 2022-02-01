import { expect } from 'chai';
import { StationProvider } from '../../src/Network';
import { Station, StationAdapter, Stop } from '../../src/drawables/Station';
import { Vector } from '../../src/Vector';
import { Rotation } from '../../src/Rotation';
import { Line, LineAdapter } from '../../src/drawables/Line';
import { instance, mock, when, anyNumber, anything } from 'ts-mockito';
import { LineGroup } from '../../src/LineGroup';
import { Config } from '../../src/Config';

describe('Line', () => {
    let lineAdapter: LineAdapter;
    let stationProvider: StationProvider;

    beforeEach(() => {
        lineAdapter = mock();
        when(lineAdapter.speed).thenReturn(undefined);
        stationProvider = mockStationProvider();
    })

    it('givenFirstStationNotExists_thenThrow', () => {
        when(lineAdapter.stops).thenReturn([new Stop('a', ''), new Stop('b', ''), new Stop('c', '')]);
        const l = new Line(instance(lineAdapter), instance(stationProvider));
        expect(() => l.draw(2, false, false)).to.throw(Error);
        expect(() => l.erase(2, false, false)).to.throw(Error);
    })

    it('givenNextStationNotExists_thenThrow', () => {
        when(lineAdapter.stops).thenReturn([new Stop('a', ''), new Stop('b', ''), new Stop('c', '')]);
        when(stationProvider.stationById('a')).thenReturn(mockStation('a', new Vector(1, 0), new Rotation(0)));
        when(stationProvider.stationById('b')).thenReturn(mockStation('b', new Vector(0, 50), new Rotation(0)));
        const l = new Line(instance(lineAdapter), instance(stationProvider));
        expect(() => l.draw(2, false, false)).to.throw(Error);
    })
    
    it('givenSimpleLineWithoutAnimation_thenNoDuration', () => {
        when(lineAdapter.stops).thenReturn([new Stop('a', ''), new Stop('b', '')]);
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, reverse: boolean, path: Vector[]) => {
            expect(duration).eql(0);
            expect(path).eql([new Vector(10, 0), new Vector(10, 50)]);
            expect(reverse).is.false;
        })
        when(stationProvider.stationById('a')).thenReturn(mockStation('a', new Vector(10, 0), new Rotation(0)));
        when(stationProvider.stationById('b')).thenReturn(mockStation('b', new Vector(10, 50), new Rotation(0)));
        const l = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l.draw(2, false, false)).eql(0);
    })

    it('givenSimpleLineWithAnimation_thenDuration', () => {
        when(lineAdapter.stops).thenReturn([new Stop('a', ''), new Stop('b', '')]);
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, reverse: boolean, path: Vector[]) => {
            expect(duration).approximately(50 / Config.default.animSpeed, 0.1);
            expect(path).eql([new Vector(0, 10), new Vector(50, 10)]);
            expect(reverse).is.true;
        })
        when(stationProvider.stationById('a')).thenReturn(mockStation('a', new Vector(0, 10), new Rotation(0)));
        when(stationProvider.stationById('b')).thenReturn(mockStation('b', new Vector(50, 10), new Rotation(0)));
        const l = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l.draw(2, true, true)).approximately(50 / Config.default.animSpeed, 0.1);
    })

    it('givenFourStopLineWithAnimation_thenCreateNodes', () => {
        when(lineAdapter.stops).thenReturn([new Stop('a', ''), new Stop('b', ''), new Stop('c', ''), new Stop('d', '')]);
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, reverse: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()).eql(new Vector(0, 0));
            expect(path.shift()?.delta(new Vector(0, 50)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(50, 100));
            expect(path.shift()?.delta(new Vector(100, 150)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(200, 150));
            expect(path.shift()).eql(new Vector(300, 150));
        })
        when(stationProvider.stationById('a')).thenReturn(mockStation('a', new Vector(0, 0), Rotation.from('n')));
        when(stationProvider.stationById('b')).thenReturn(mockStation('b', new Vector(50, 100), Rotation.from('nw')));
        when(stationProvider.stationById('c')).thenReturn(mockStation('c', new Vector(200, 150), Rotation.from('w')));
        when(stationProvider.stationById('d')).thenReturn(mockStation('d', new Vector(300, 150), Rotation.from('w')));
        const l = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l.draw(2, true, true)).approximately(400 / Config.default.animSpeed, 0.1);
    })

    it('givenFourStopLineWithHelperStopNecessary_thenCreateHelperStop', () => {
        when(lineAdapter.stops).thenReturn([new Stop('a', ''), new Stop('b', ''), new Stop('c', ''), new Stop('d', '')]);
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, reverse: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()).eql(new Vector(500, 500));
            expect(path.shift()?.delta(new Vector(450, 500)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(400, 450));
            expect(path.shift()?.delta(new Vector(325, 375)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(250, 375));
            expect(path.shift()?.delta(new Vector(175, 375)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(100, 300));
            expect(path.shift()?.delta(new Vector(0, 200)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(0, 100));
        })
        when(stationProvider.stationById('a')).thenReturn(mockStation('a', new Vector(500, 500), Rotation.from('n')));
        when(stationProvider.stationById('b')).thenReturn(mockStation('b', new Vector(400, 450), Rotation.from('ne')));
        when(stationProvider.stationById('c')).thenReturn(mockStation('c', new Vector(100, 300), Rotation.from('ne')));
        when(stationProvider.stationById('d')).thenReturn(mockStation('d', new Vector(0, 100), Rotation.from('w')));
        when(stationProvider.createVirtualStop('h_b_c', anything(), anything())).thenCall((id: string, v: Vector, r: Rotation) => {
            expect(r).eql(new Rotation(0));
            expect(v).eql(new Vector(250, 375));
            return mockStation(id, v, r);
        });
        const l = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l.draw(2, true, false)).approximately(725 / Config.default.animSpeed, 0.1);
    })

    it('givenFourStopLineWithAllNorth_thenCreateHelperStop', () => {
        when(lineAdapter.stops).thenReturn([new Stop('a', ''), new Stop('b', ''), new Stop('c', ''), new Stop('d', '')]);
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, reverse: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()).eql(new Vector(500, 500));
            expect(path.shift()).eql(new Vector(600, 500));
            expect(path.shift()?.delta(new Vector(650, 500)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(700, 550));
            expect(path.shift()?.delta(new Vector(750, 600)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(800, 600));
            expect(path.shift()).eql(new Vector(900, 600));
        })
        when(stationProvider.stationById('a')).thenReturn(mockStation('a', new Vector(500, 500), Rotation.from('n')));
        when(stationProvider.stationById('b')).thenReturn(mockStation('b', new Vector(600, 500), Rotation.from('n')));
        when(stationProvider.stationById('c')).thenReturn(mockStation('c', new Vector(800, 600), Rotation.from('n')));
        when(stationProvider.stationById('d')).thenReturn(mockStation('d', new Vector(900, 600), Rotation.from('n')));
        when(stationProvider.createVirtualStop('h_b_c', anything(), anything())).thenCall((id: string, v: Vector, r: Rotation) => {
            expect(r).eql(new Rotation(45));
            expect(v).eql(new Vector(700, 550));
            return mockStation(id, v, r);
        });
        const l = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l.draw(2, true, false)).approximately(441 / Config.default.animSpeed, 0.1);
    })

    it('givenFourStopLineWithRightAngle_thenCreateHelperStopsWhereNecessary', () => {
        when(lineAdapter.stops).thenReturn([new Stop('d', ''), new Stop('c', ''), new Stop('b', ''), new Stop('a', '')]);
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, reverse: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()).eql(new Vector(500, 500));
            expect(path.shift()?.delta(new Vector(500, 475)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(525, 450));
            expect(path.shift()?.delta(new Vector(550, 425)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(550, 400));
            expect(path.shift()).eql(new Vector(550, 350));
            expect(path.shift()).eql(new Vector(475, 350));
            expect(path.shift()?.delta(new Vector(450, 350)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(400, 300));
            expect(path.shift()?.delta(new Vector(387.5, 287.5)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(350, 325));
            expect(path.shift()?.delta(new Vector(325, 350)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(300, 350));
        })
        when(stationProvider.stationById('d')).thenReturn(mockStation('d', new Vector(500, 500), Rotation.from('n')));
        when(stationProvider.stationById('c')).thenReturn(mockStation('c', new Vector(550, 400), Rotation.from('e')));
        when(stationProvider.stationById('b')).thenReturn(mockStation('b', new Vector(400, 300), Rotation.from('ne')));
        when(stationProvider.stationById('a')).thenReturn(mockStation('a', new Vector(300, 350), Rotation.from('n')));
        when(stationProvider.createVirtualStop('h_c_d', anything(), anything())).thenCall((id: string, v: Vector, r: Rotation) => {
            expect(r).eql(new Rotation(45));
            expect(v).eql(new Vector(525, 450));
            return mockStation(id, v, r);
        });
        when(stationProvider.createVirtualStop('h_b_c', anything(), anything())).thenCall((id: string, v: Vector, r: Rotation) => {
            expect(r).eql(new Rotation(90));
            expect(v).eql(new Vector(475, 350));
            return mockStation(id, v, r);
        });
        when(stationProvider.createVirtualStop('h_a_b', anything(), anything())).thenCall((id: string, v: Vector, r: Rotation) => {
            expect(r).eql(new Rotation(45));
            expect(v).eql(new Vector(350, 325));
            return mockStation(id, v, r);
        });
        const l = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l.draw(2, true, false)).approximately(470 / Config.default.animSpeed, 0.1);
    })

    it('givenLineForkWithSameName_thenUseSameTrack', () => {
        const a = mockStation('a', new Vector(500, 500), Rotation.from('n'));
        const b = mockStation('b', new Vector(500, 400), Rotation.from('n'));
        const c = mockStation('c', new Vector(400, 200), Rotation.from('nw'));
        const d = mockStation('d', new Vector(600, 200), Rotation.from('nw'));

        createAndAssertStandardLine(a, b, c);

        when(lineAdapter.stops).thenReturn([new Stop('b', ''), new Stop('d', '')]);
        when(lineAdapter.name).thenReturn('l1');
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, reverse: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()).eql(new Vector(500, 400));
            expect(path.shift()?.delta(new Vector(500, 300)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(600, 200));
        })
        when(stationProvider.stationById('b')).thenReturn(b);
        when(stationProvider.stationById('d')).thenReturn(d);
        const l2 = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l2.draw(2, true, false)).approximately(240 / Config.default.animSpeed, 0.1);
    })

    it('givenLineForkWithSameNameAndTwoCommonStations_thenUseSameTrackOnlyOnceAndHavePathToFix', () => {
        const a = mockStation('a', new Vector(500, 500), Rotation.from('n'));
        const b = mockStation('b', new Vector(500, 400), Rotation.from('w'));
        const c = mockStation('c', new Vector(400, 200), Rotation.from('nw'));
        const d = mockStation('d', new Vector(600, 200), Rotation.from('nw'));

        createAndAssertStandardLine(a, b, c);

        when(lineAdapter.stops).thenReturn([new Stop('a', ''), new Stop('b', ''), new Stop('d', '')]);
        when(lineAdapter.name).thenReturn('l1');
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, reverse: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()).eql(new Vector(500, 500));
            expect(path.shift()).eql(new Vector(500, 450));
            expect(path.shift()).eql(new Vector(500+Config.default.lineDistance, 400));
            expect(path.shift()?.delta(new Vector(500+Config.default.lineDistance, 300-Config.default.lineDistance)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(600, 200));
        })
        when(stationProvider.stationById('a')).thenReturn(a);
        when(stationProvider.stationById('b')).thenReturn(b);
        when(stationProvider.stationById('d')).thenReturn(d);
        when(stationProvider.createVirtualStop('h_a_b', anything(), anything())).thenCall((id: string, v: Vector, r: Rotation) => {
            expect(r).eql(new Rotation(0));
            expect(v).eql(new Vector(500, 450));
            return mockStation(id, v, r);
        });
        const l2 = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l2.draw(2, true, false)).approximately(340 / Config.default.animSpeed, 0.1);
    })

    it('givenLineForkWithSameNameAndPerpendicularDirectionOptimal_thenStillUseParallelDirection', () => {
        const a = mockStation('a', new Vector(500, 500), Rotation.from('n'));
        const b = mockStation('b', new Vector(500, 400), Rotation.from('n'));
        const c = mockStation('c', new Vector(400, 200), Rotation.from('nw'));
        const d = mockStation('d', new Vector(600, 350), Rotation.from('ne'));

        createAndAssertStandardLine(a, b, c);

        when(lineAdapter.stops).thenReturn([new Stop('b', ''), new Stop('d', '')]);
        when(lineAdapter.name).thenReturn('l1');
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, reverse: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()).eql(new Vector(500, 400));
            expect(path.shift()).eql(new Vector(500, 375));
            expect(path.shift()).eql(new Vector(550, 375));
            expect(path.shift()).eql(new Vector(575, 375));
            expect(path.shift()).eql(new Vector(600, 350));
        })
        when(stationProvider.stationById('b')).thenReturn(b);
        when(stationProvider.stationById('d')).thenReturn(d);
        when(stationProvider.createVirtualStop('h_b_d', anything(), anything())).thenCall((id: string, v: Vector, r: Rotation) => {
            expect(r).eql(new Rotation(0));
            expect(v).eql(new Vector(550, 375));
            return mockStation(id, v, r);
        });
        const l2 = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l2.draw(2, true, false)).approximately(130 / Config.default.animSpeed, 0.1);
    })

    it('givenLineJoinWithSameNameAndPerpendicularDirectionOptimal_thenUseOptimalDirection', () => {
        const a = mockStation('a', new Vector(500, 500), Rotation.from('n'));
        const b = mockStation('b', new Vector(500, 400), Rotation.from('n'));
        const c = mockStation('c', new Vector(400, 200), Rotation.from('nw'));
        const d = mockStation('d', new Vector(600, 350), Rotation.from('ne'));

        createAndAssertStandardLine(a, b, c);

        when(lineAdapter.stops).thenReturn([new Stop('d', ''), new Stop('b', '')]);
        when(lineAdapter.name).thenReturn('l1');
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, reverse: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()).eql(new Vector(600, 350));
            expect(path.shift()).eql(new Vector(550, 400));
            expect(path.shift()).eql(new Vector(500, 400));
        })
        when(stationProvider.stationById('b')).thenReturn(b);
        when(stationProvider.stationById('d')).thenReturn(d);
        const l2 = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l2.draw(2, true, false)).approximately(120 / Config.default.animSpeed, 0.1);
    })

    it('givenLineForkWithDifferentName_thenUseDifferentTrack', () => {
        const a = mockStation('a', new Vector(500, 500), Rotation.from('n'));
        const b = mockStation('b', new Vector(500, 400), Rotation.from('n'));
        const c = mockStation('c', new Vector(400, 200), Rotation.from('nw'));
        const d = mockStation('d', new Vector(600, 200), Rotation.from('nw'));

        createAndAssertStandardLine(a, b, c);

        when(lineAdapter.stops).thenReturn([new Stop('b', ''), new Stop('d', '')]);
        when(lineAdapter.name).thenReturn('l2');
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, reverse: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()).eql(new Vector(500+Config.default.lineDistance, 400));
            expect(path.shift()?.delta(new Vector(500+Config.default.lineDistance, 300-Config.default.lineDistance)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(600, 200));
        })
        when(stationProvider.stationById('b')).thenReturn(b);
        when(stationProvider.stationById('d')).thenReturn(d);
        const l2 = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l2.draw(2, true, false)).approximately(240 / Config.default.animSpeed, 0.1);
    })

    it('givenLineJoin_thenUseDifferentTrack', () => {
        const a = mockStation('a', new Vector(500, 500), Rotation.from('n'));
        const b = mockStation('b', new Vector(500, 400), Rotation.from('n'));
        const c = mockStation('c', new Vector(400, 200), Rotation.from('nw'));
        const d = mockStation('d', new Vector(600, 200), Rotation.from('nw'));

        createAndAssertStandardLine(a, b, c);

        when(lineAdapter.stops).thenReturn([new Stop('d', ''), new Stop('b', '')]);
        when(lineAdapter.name).thenReturn('l1');
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, reverse: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()).eql(new Vector(600, 200));
            expect(path.shift()?.delta(new Vector(500+Config.default.lineDistance, 300-Config.default.lineDistance)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(500+Config.default.lineDistance, 400));
        })
        when(stationProvider.stationById('b')).thenReturn(b);
        when(stationProvider.stationById('d')).thenReturn(d);
        const l2 = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l2.draw(2, true, false)).approximately(240 / Config.default.animSpeed, 0.1);
    })

    it('givenLineCross_thenDoNotInterfere', () => {
        const a = mockStation('a', new Vector(500, 500), Rotation.from('n'));
        const b = mockStation('b', new Vector(500, 400), Rotation.from('n'));
        const c = mockStation('c', new Vector(400, 200), Rotation.from('nw'));
        const d = mockStation('d', new Vector(600, 350), Rotation.from('nw'));

        createAndAssertStandardLine(a, b, c);

        when(lineAdapter.stops).thenReturn([new Stop('d', ''), new Stop('b', ''), new Stop('c', '')]);
        when(lineAdapter.name).thenReturn('l2');
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, reverse: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()).eql(new Vector(600, 350));
            expect(path.shift()).eql(new Vector(550, 400));
            expect(path.shift()).eql(new Vector(500, 400));
            expect(path.shift()).eql(new Vector(450, 400));
            expect(path.shift()).eql(new Vector(450, 300));
            expect(path.shift()?.delta(new Vector(450, 242)).length).lessThan(0.5);
            expect(path.shift()).eql(new Vector(400+Config.default.lineDistance/Math.sqrt(2), 200-Config.default.lineDistance/Math.sqrt(2)));
        })
        when(stationProvider.stationById('b')).thenReturn(b);
        when(stationProvider.stationById('c')).thenReturn(c);
        when(stationProvider.stationById('d')).thenReturn(d);
        when(stationProvider.createVirtualStop('h_b_c', anything(), anything())).thenCall((id: string, v: Vector, r: Rotation) => {
            expect(r).eql(new Rotation(0));
            expect(v).eql(new Vector(450, 300));
            return mockStation(id, v, r);
        });
        const l2 = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l2.draw(2, true, false)).approximately(390 / Config.default.animSpeed, 0.1);
    })

    it('givenLineCrossWithTrackPreference_thenDoNotInterfere', () => {
        const a = mockStation('a', new Vector(500, 500), Rotation.from('n'));
        const b = mockStation('b', new Vector(500, 400), Rotation.from('n'));
        const c = mockStation('c', new Vector(400, 200), Rotation.from('nw'));
        const d = mockStation('d', new Vector(600, 350), Rotation.from('nw'));

        createAndAssertStandardLine(a, b, c);

        when(lineAdapter.stops).thenReturn([new Stop('d', '-'), new Stop('b', ''), new Stop('c', '')]);
        when(lineAdapter.name).thenReturn('l2');
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, reverse: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()).eql(new Vector(600, 350));
            expect(path.shift()).eql(new Vector(550, 400));
            expect(path.shift()).eql(new Vector(500, 400));
            expect(path.shift()).eql(new Vector(450, 400));
            expect(path.shift()).eql(new Vector(450, 300));
            expect(path.shift()?.delta(new Vector(450, 258)).length).lessThan(0.5);
            expect(path.shift()).eql(new Vector(400-Config.default.lineDistance/Math.sqrt(2), 200+Config.default.lineDistance/Math.sqrt(2)));
        })
        when(stationProvider.stationById('b')).thenReturn(b);
        when(stationProvider.stationById('c')).thenReturn(c);
        when(stationProvider.stationById('d')).thenReturn(d);
        when(stationProvider.stationById('h_b_c')).thenReturn(mockStation('h_b_c', new Vector(450, 300), new Rotation(-0)));
        const l2 = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l2.draw(2, true, false)).approximately(390 / Config.default.animSpeed, 0.1);
    })

    it('givenParallelLinesWithManuallySetTracks_thenUseTheseTracks', () => {
        const a = mockStation('a', new Vector(500, 500), Rotation.from('n'));
        const b = mockStation('b', new Vector(500, 400), Rotation.from('w'));
        const c = mockStation('c', new Vector(400, 200), Rotation.from('nw'));
        const d = mockStation('d', new Vector(600, 200), Rotation.from('nw'));
        
        createAndAssertStandardLine(a, b, c);

        when(lineAdapter.stops).thenReturn([new Stop('d', ''), new Stop('b', '-1'), new Stop('a', '+1')]);
        when(lineAdapter.name).thenReturn('l2');
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, r: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()).eql(new Vector(600, 200));
            expect(path.shift()).eql(new Vector(500+Config.default.lineDistance, 300-Config.default.lineDistance));

            expect(path.shift()).eql(new Vector(500+Config.default.lineDistance, 400));
            expect(path.shift()).eql(new Vector(500+Config.default.lineDistance, 500));
        })
        when(stationProvider.stationById('a')).thenReturn(mockStation('a', new Vector(500, 500), Rotation.from('n')));
        when(stationProvider.stationById('b')).thenReturn(mockStation('b', new Vector(500, 400), Rotation.from('e')));
        when(stationProvider.stationById('d')).thenReturn(mockStation('d', new Vector(600, 200), Rotation.from('nw')));
        const l2 = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l2.draw(2, true, false)).approximately(340 / Config.default.animSpeed, 0.1);

        lineAdapter = mock();
        stationProvider = mockStationProvider();
        when(lineAdapter.stops).thenReturn([new Stop('d', '+1'), new Stop('b', '-2')]);
        when(lineAdapter.name).thenReturn('l3');
        when(lineAdapter.speed).thenReturn(155);
        when(lineAdapter.draw(4, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, r: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()).eql(new Vector(600+Config.default.lineDistance/Math.sqrt(2), 200+Config.default.lineDistance/Math.sqrt(2)));
            expect(path.shift()?.delta(new Vector(500+2*Config.default.lineDistance, 296)).length).lessThan(0.5);
            expect(path.shift()).eql(new Vector(500+2*Config.default.lineDistance, 400));
        })
        when(stationProvider.stationById('b')).thenReturn(mockStation('b', new Vector(500, 400), Rotation.from('e')));
        when(stationProvider.stationById('d')).thenReturn(mockStation('d', new Vector(600, 200), Rotation.from('nw')));
        const l3 = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l3.draw(4, true, false)).approximately(240 / 155, 0.1);
    })

    it('givenParallelLinesWithAutomaticTracks_thenUseNewTracks', () => {
        const a = mockStation('a', new Vector(500, 500), Rotation.from('n'));
        const b = mockStation('b', new Vector(500, 400), Rotation.from('w'));
        const c = mockStation('c', new Vector(400, 200), Rotation.from('nw'));
        const d = mockStation('d', new Vector(600, 200), Rotation.from('nw'));

        createAndAssertStandardLine(a, b, c);

        when(lineAdapter.stops).thenReturn([new Stop('d', ''), new Stop('b', ''), new Stop('a', '')]);
        when(lineAdapter.name).thenReturn('l2');
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, r: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()).eql(new Vector(600, 200));
            expect(path.shift()).eql(new Vector(500+Config.default.lineDistance, 300-Config.default.lineDistance));
            expect(path.shift()).eql(new Vector(500+Config.default.lineDistance, 400));
            expect(path.shift()).eql(new Vector(500+Config.default.lineDistance, 500));
        })
        when(stationProvider.stationById('a')).thenReturn(a);
        when(stationProvider.stationById('b')).thenReturn(b);
        when(stationProvider.stationById('d')).thenReturn(d);
        const l2 = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l2.draw(2, true, false)).approximately(340 / Config.default.animSpeed, 0.1);

        lineAdapter = mock();
        stationProvider = mockStationProvider();
        when(lineAdapter.stops).thenReturn([new Stop('d', ''), new Stop('b', '')]);
        when(lineAdapter.name).thenReturn('l3');
        when(lineAdapter.speed).thenReturn(undefined);
        when(lineAdapter.draw(4, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, r: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()).eql(new Vector(600+Config.default.lineDistance/Math.sqrt(2), 200+Config.default.lineDistance/Math.sqrt(2)));
            expect(path.shift()?.delta(new Vector(500+2*Config.default.lineDistance, 296)).length).lessThan(0.5);
            expect(path.shift()).eql(new Vector(500+2*Config.default.lineDistance, 400));
        })
        when(stationProvider.stationById('b')).thenReturn(b);
        when(stationProvider.stationById('d')).thenReturn(d);
        const l3 = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l3.draw(4, true, false)).approximately(240 / Config.default.animSpeed, 0.1);
    })

    it('givenParallelLinesWithStationRotationNotMatching_thenPathToFix', () => {
        const a = mockStation('a', new Vector(500, 500), Rotation.from('n'));
        const b = mockStation('b', new Vector(500, 400), Rotation.from('e'));
        const c = mockStation('c', new Vector(400, 200), Rotation.from('nw'));
        const d = mockStation('d', new Vector(600, 200), Rotation.from('nw'));

        createAndAssertStandardLine(a, b, c);

        when(lineAdapter.stops).thenReturn([new Stop('d', ''), new Stop('b', ''), new Stop('a', '')]);
        when(lineAdapter.name).thenReturn('l2');
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, r: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()).eql(new Vector(600, 200));
            expect(path.shift()).eql(new Vector(500-Config.default.lineDistance, 300+Config.default.lineDistance));
            expect(path.shift()).eql(new Vector(500-Config.default.lineDistance, 400));
            expect(path.shift()).eql(new Vector(500, 450));
            expect(path.shift()).eql(new Vector(500+Config.default.lineDistance, 500));
        })
        when(stationProvider.stationById('a')).thenReturn(a);
        when(stationProvider.stationById('b')).thenReturn(b);
        when(stationProvider.stationById('d')).thenReturn(d);
        when(stationProvider.createVirtualStop('h_a_b', anything(), anything())).thenCall((id: string, v: Vector, r: Rotation) => {
            expect(r).eql(new Rotation(90));
            expect(v).eql(new Vector(500, 450));
            return mockStation(id, v, r);
        });
        const l2 = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l2.draw(2, true, false)).approximately(340 / Config.default.animSpeed, 0.1);
    })


    it('whenDrawAndErase_givenSameName_thenReusePhantomTrack', () => {
        const a = mockStation('a', new Vector(500, 500), Rotation.from('n'));
        const b = mockStation('b', new Vector(500, 400), Rotation.from('n'));
        const c = mockStation('c', new Vector(400, 200), Rotation.from('nw'));
        const d = mockStation('d', new Vector(600, 200), Rotation.from('nw'));

        const l1 = createAndAssertStandardLine(a, b, c);

        when(lineAdapter.stops).thenReturn([new Stop('d', ''), new Stop('b', ''), new Stop('a', '')]);
        when(lineAdapter.name).thenReturn('l2');
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, r: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()).eql(new Vector(600, 200));
            expect(path.shift()?.delta(new Vector(500+Config.default.lineDistance, 300-Config.default.lineDistance)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(500+Config.default.lineDistance, 400));
            expect(path.shift()).eql(new Vector(500+Config.default.lineDistance, 500));
        })
        when(stationProvider.stationById('a')).thenReturn(a);
        when(stationProvider.stationById('b')).thenReturn(b);
        when(stationProvider.stationById('d')).thenReturn(d);
        const l2 = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l2.draw(2, true, false)).approximately(340 / Config.default.animSpeed, 0.1);

        expect(l1.erase(0, false, false)).approximately(0, 0.1);

        lineAdapter = mock();
        stationProvider = mockStationProvider();
        when(lineAdapter.stops).thenReturn([new Stop('d', ''), new Stop('b', ''), new Stop('a', '')]);
        when(lineAdapter.name).thenReturn('l1');
        when(lineAdapter.speed).thenReturn(undefined);
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, r: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()?.delta(new Vector(600+Config.default.lineDistance/Math.sqrt(2), 200+Config.default.lineDistance/Math.sqrt(2))).length).lessThan(0.1);
            expect(path.shift()?.delta(new Vector(500, 300+Config.default.lineDistance/Math.sqrt(2)*2)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(500, 400));
            expect(path.shift()).eql(new Vector(500, 500));
        })
        when(stationProvider.stationById('a')).thenReturn(a);
        when(stationProvider.stationById('b')).thenReturn(b);
        when(stationProvider.stationById('d')).thenReturn(d);
        const l1_1 = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l1_1.draw(2, true, false)).approximately(340 / Config.default.animSpeed, 0.1);
    })

    it('whenDrawAndErase_givenDifferentName_thenUseNewTrack', () => {
        const a = mockStation('a', new Vector(500, 500), Rotation.from('n'));
        const b = mockStation('b', new Vector(500, 400), Rotation.from('w'));
        const c = mockStation('c', new Vector(400, 200), Rotation.from('nw'));
        const d = mockStation('d', new Vector(600, 200), Rotation.from('nw'));

        const l1 = createAndAssertStandardLine(a, b, c);
        
        when(lineAdapter.stops).thenReturn([new Stop('d', ''), new Stop('b', ''), new Stop('a', '')]);
        when(lineAdapter.name).thenReturn('l2');
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, r: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()).eql(new Vector(600, 200));
            expect(path.shift()?.delta(new Vector(500+Config.default.lineDistance, 300-Config.default.lineDistance)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(500+Config.default.lineDistance, 400));
            expect(path.shift()).eql(new Vector(500+Config.default.lineDistance, 500));
        })
        when(stationProvider.stationById('a')).thenReturn(a);
        when(stationProvider.stationById('b')).thenReturn(b);
        when(stationProvider.stationById('d')).thenReturn(d);
        const l2 = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l2.draw(2, true, false)).approximately(340 / Config.default.animSpeed, 0.1);

        expect(l1.erase(0, false, false)).approximately(0, 0.1);

        lineAdapter = mock();
        stationProvider = mockStationProvider();
        when(lineAdapter.stops).thenReturn([new Stop('d', ''), new Stop('b', ''), new Stop('a', '')]);
        when(lineAdapter.name).thenReturn('l3');
        when(lineAdapter.speed).thenReturn(undefined);
        when(lineAdapter.draw(2, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, r: boolean, p: Vector[]) => {
            const path = [...p];
            expect(path.shift()?.delta(new Vector(600+Config.default.lineDistance/Math.sqrt(2), 200+Config.default.lineDistance/Math.sqrt(2))).length).lessThan(0.1);
            expect(path.shift()?.delta(new Vector(500+2*Config.default.lineDistance, 300+Config.default.lineDistance/Math.sqrt(2)*2-2*Config.default.lineDistance)).length).lessThan(0.1);
            expect(path.shift()).eql(new Vector(500+2*Config.default.lineDistance, 400));
            expect(path.shift()).eql(new Vector(500+2*Config.default.lineDistance, 500));
        })
        when(stationProvider.stationById('a')).thenReturn(a);
        when(stationProvider.stationById('b')).thenReturn(b);
        when(stationProvider.stationById('d')).thenReturn(d);
        const l1_1 = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l1_1.draw(2, true, false)).approximately(340 / Config.default.animSpeed, 0.1);
    })

    it('whenTermini_givenNoStops', () => { 
        when(lineAdapter.stops).thenReturn([]);
        const l = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l.termini).eql([]);
    })

    it('whenTermini_givenStops', () => { 
        when(lineAdapter.stops).thenReturn([new Stop('d', ''), new Stop('b', ''), new Stop('a', '')]);
        const l = new Line(instance(lineAdapter), instance(stationProvider));
        expect(l.termini).eql([new Stop('d', ''), new Stop('a', '')]);
    })

})

function mockStation(id: string, baseCoords: Vector, rotation: Rotation): Station {
    const stationAdapter: StationAdapter = mock();
    when(stationAdapter.id).thenReturn(id);
    when(stationAdapter.baseCoords).thenReturn(baseCoords);
    when(stationAdapter.rotation).thenReturn(rotation);
    when(stationAdapter.lonLat).thenReturn(undefined);
    return new Station(instance(stationAdapter));
}

function mockStationProvider(): StationProvider {
    const stationProvider: StationProvider = mock();
    when(stationProvider.lineGroupById(anything())).thenReturn(new LineGroup()).thenReturn(new LineGroup()).thenReturn(new LineGroup()).thenReturn(new LineGroup());
    return stationProvider;
}

function createAndAssertStandardLine(a: Station, b: Station, c: Station): Line {
    const lineAdapter: LineAdapter = mock();
    const stationProvider: StationProvider = mockStationProvider();

    when(lineAdapter.stops).thenReturn([new Stop('a', ''), new Stop('b', ''), new Stop('c', '')]);
    when(lineAdapter.name).thenReturn('l1');
    when(lineAdapter.speed).thenReturn(undefined);
    when(lineAdapter.draw(0, anyNumber(), anything(), anything(), anything(), anything())).thenCall((delay: number, duration: number, r: boolean, p: Vector[]) => {
        const path = [...p];
        expect(path.shift()).eql(new Vector(500, 500));
        expect(path.shift()).eql(new Vector(500, 400));
        expect(path.shift()?.delta(new Vector(500, 300)).length).lessThan(0.1);
        expect(path.shift()).eql(new Vector(400, 200));
    })
    when(stationProvider.stationById('a')).thenReturn(a);
    when(stationProvider.stationById('b')).thenReturn(b);
    when(stationProvider.stationById('c')).thenReturn(c);
    const l1 = new Line(instance(lineAdapter), instance(stationProvider));
    expect(l1.draw(0, true, false)).approximately(340 / Config.default.animSpeed, 0.1);
    return l1;
}