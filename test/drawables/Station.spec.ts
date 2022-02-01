import { expect } from 'chai';
import { StationProvider } from '../../src/Network';
import { Station, StationAdapter } from '../../src/drawables/Station';
import { Vector } from '../../src/Vector';
import { Rotation } from '../../src/Rotation';
import { Line, LineAdapter } from '../../src/drawables/Line';
import { instance, mock, when } from 'ts-mockito';
import { Utils } from '../../src/Utils';
import { PreferredTrack } from '../../src/PreferredTrack';
import { Config } from '../../src/Config';

describe('Station', () => {
    let stationAdapter: StationAdapter;
    let lineAdapter: LineAdapter;
    let stationProvider: StationProvider;

    beforeEach(() => {
        stationAdapter = mock();
        when(stationAdapter.lonLat).thenReturn(undefined);
        lineAdapter = mock();
        stationProvider = mock();
    })

    it('whenAxisAndTrackForExistingLine', () => {
        when(lineAdapter.name).thenReturn('name');
        const s = new Station(instance(stationAdapter));
        const l = new Line(instance(lineAdapter), instance(stationProvider));
        
        expect(s.axisAndTrackForExistingLine(l.name)).eql(undefined);

        s.addLine(l, 'y', 4);

        const result2 = s.axisAndTrackForExistingLine('name');
        expect(result2?.axis).eql('y');
        expect(result2?.track).eql(4);

        s.addLine(l, 'x', 0);

        const result = s.axisAndTrackForExistingLine('name');
        expect(result?.axis).eql('x');
        expect(result?.track).eql(0);        

        s.removeLine(l);

        expect(s.axisAndTrackForExistingLine(l.name)).eql(undefined);
    })

    it('whenStationSizeForAxis_givenNoLines', () => {
        const s = new Station(instance(stationAdapter));

        expect(s.stationSizeForAxis('x', 1)).eql(Config.default.defaultStationDimen+Config.default.labelDistance);
        expect(s.stationSizeForAxis('x', -1)).eql(-(Config.default.defaultStationDimen+Config.default.labelDistance));
        expect(s.stationSizeForAxis('y', 1)).eql(Config.default.defaultStationDimen+Config.default.labelDistance);
        expect(s.stationSizeForAxis('y', -1)).eql(-(Config.default.defaultStationDimen+Config.default.labelDistance));
    })

    it('whenStationSizeForAxis_givenOnlyLinesOnXAxis', () => {
        const s = new Station(instance(stationAdapter));
        const l = new Line(instance(lineAdapter), instance(stationProvider));

        s.addLine(l, 'x', -1);
        s.addLine(l, 'x', 4);
        expect(s.stationSizeForAxis('x', 1)).eql(4*Config.default.lineDistance+Config.default.defaultStationDimen+Config.default.labelDistance);
        expect(s.stationSizeForAxis('x', -1)).eql(-(Config.default.lineDistance+Config.default.defaultStationDimen+Config.default.labelDistance));
        expect(s.stationSizeForAxis('x', 0.00001)).eql(0);
        expect(s.stationSizeForAxis('y', 1)).eql(Config.default.defaultStationDimen+Config.default.labelDistance);
        expect(s.stationSizeForAxis('y', -1)).eql(-(Config.default.defaultStationDimen+Config.default.labelDistance));
    })

    it('whenStationSizeForAxis_givenSingleLineOnZero', () => {
        const s = new Station(instance(stationAdapter));
        const l = new Line(instance(lineAdapter), instance(stationProvider));
        
        s.addLine(l, 'y', 0);
        expect(s.stationSizeForAxis('y', 5)).eql(Config.default.defaultStationDimen+Config.default.labelDistance);
        expect(s.stationSizeForAxis('y', -1)).eql(-(Config.default.defaultStationDimen+Config.default.labelDistance));
        expect(s.stationSizeForAxis('y', 0)).eql(0);
    })

    it('whenStationSizeForAxis_givenLinesInAllQuadrants', () => {
        const s = new Station(instance(stationAdapter));
        const l = new Line(instance(lineAdapter), instance(stationProvider));
        const l2 = new Line(instance(lineAdapter), instance(stationProvider));

        s.addLine(l, 'x', -1);
        s.addLine(l, 'x', 4);
        s.addLine(l, 'y', 0);        
        s.addLine(l2, 'y', -2);
        expect(s.stationSizeForAxis('y', 5)).eql(Config.default.defaultStationDimen+Config.default.labelDistance);
        expect(s.stationSizeForAxis('y', -1)).eql(-(2*Config.default.lineDistance+Config.default.defaultStationDimen+Config.default.labelDistance));
    })

    it('whenStationSizeForAxis_givenAddedAndRemovedLines', () => {
        const s = new Station(instance(stationAdapter));
        const l = new Line(instance(lineAdapter), instance(stationProvider));
        const l2 = new Line(instance(lineAdapter), instance(stationProvider));
   
        s.addLine(l, 'x', -1);
        s.addLine(l, 'x', 4);
        s.addLine(l, 'y', 0);        
        s.addLine(l2, 'y', -2);
        s.removeLine(l);
        expect(s.stationSizeForAxis('x', 1)).eql(Config.default.defaultStationDimen+Config.default.labelDistance);
        expect(s.stationSizeForAxis('x', -1)).eql(-(Config.default.defaultStationDimen+Config.default.labelDistance));
        expect(s.stationSizeForAxis('y', 5)).eql(Config.default.defaultStationDimen+Config.default.labelDistance);
        expect(s.stationSizeForAxis('y', -1)).eql(-(2*Config.default.lineDistance+Config.default.defaultStationDimen+Config.default.labelDistance));
    })

    it('whenAssignTrack_givenLines', () => {
        const s = new Station(instance(stationAdapter));
        const l = new Line(instance(lineAdapter), instance(stationProvider));
   
        expect(s.assignTrack('x', new PreferredTrack('+'), l)).eql(0);
        expect(s.assignTrack('x', new PreferredTrack('+1'), l)).eql(1);
        expect(s.assignTrack('x', new PreferredTrack('-2'), l)).eql(-2);
        expect(s.assignTrack('x', new PreferredTrack('-'), l)).eql(0);
    })

    it('whenAssignTrack_givenSingleLine', () => {
        const s = new Station(instance(stationAdapter));
        const l = new Line(instance(lineAdapter), instance(stationProvider));
   
        s.addLine(l, 'x', -1);
        expect(s.assignTrack('x', new PreferredTrack('+'), l)).eql(1); //TODO
        expect(s.assignTrack('x', new PreferredTrack('+1'), l)).eql(1);
        expect(s.assignTrack('x', new PreferredTrack('-1'), l)).eql(-1);
        expect(s.assignTrack('x', new PreferredTrack('-2'), l)).eql(-2);
        expect(s.assignTrack('x', new PreferredTrack('-'), l)).eql(-2);
    })

    it('whenAssignTrack_givenSingleLineOnZero', () => {
        const s = new Station(instance(stationAdapter));
   
        const l = new Line(instance(lineAdapter), instance(stationProvider));
   
        s.addLine(l, 'x', 0);
        expect(s.assignTrack('x', new PreferredTrack('+'), l)).eql(1);
        expect(s.assignTrack('x', new PreferredTrack('+0'), l)).eql(0);
        expect(s.assignTrack('x', new PreferredTrack('-2'), l)).eql(-2);
        expect(s.assignTrack('x', new PreferredTrack('-'), l)).eql(-1);
    })

    it('whenAssignTrack_givenMultipleLines', () => {
        const s = new Station(instance(stationAdapter));
   
        const l = new Line(instance(lineAdapter), instance(stationProvider));

        s.addLine(l, 'x', 1);   
        s.addLine(l, 'y', -1);
        s.addLine(l, 'y', 0);
        s.addLine(l, 'y', 3);
        expect(s.assignTrack('y', new PreferredTrack('+'), l)).eql(4);
        expect(s.assignTrack('y', new PreferredTrack('+1'), l)).eql(1);
        expect(s.assignTrack('y', new PreferredTrack('-2'), l)).eql(-2);
        expect(s.assignTrack('y', new PreferredTrack('-'), l)).eql(-2);
    })

    it('whenAssignTrack_givenJustDeletedPathOnLine', () => {
        const s = new Station(instance(stationAdapter));
   
        when(lineAdapter.name).thenReturn('name1');
        const l = new Line(instance(lineAdapter), instance(stationProvider));

        lineAdapter = mock();
        when(lineAdapter.name).thenReturn('name2');
        const l2 = new Line(instance(lineAdapter), instance(stationProvider));

        s.addLine(l, 'x', 1);   
        s.addLine(l2, 'x', 2);   
        s.removeLine(l);
        expect(s.assignTrack('x', new PreferredTrack('+'), l2)).eql(3);
        expect(s.assignTrack('x', new PreferredTrack('+'), l)).eql(1);
        expect(s.assignTrack('x', new PreferredTrack('-1'), l)).eql(-1);
    })

    it('whenRotatedTrackCoordinates_givenNorthStation', () => {
        when(stationAdapter.baseCoords).thenReturn(new Vector(50, 60));
        when(stationAdapter.rotation).thenReturn(Rotation.from('n'));
        const s = new Station(instance(stationAdapter));
        
        expect(s.rotatedTrackCoordinates(new Rotation(0), 3)).eql(new Vector(50+3*Config.default.lineDistance, 60));
        expect(s.rotatedTrackCoordinates(new Rotation(90), 0)).eql(new Vector(50, 60));
        expect(s.rotatedTrackCoordinates(new Rotation(90), -1)).eql(new Vector(50, 60-Config.default.lineDistance));
    })

    it('whenRotatedTrackCoordinates_givenNorthWestStation', () => {
        const base = new Vector(50, 60);
        when(stationAdapter.baseCoords).thenReturn(base);
        when(stationAdapter.rotation).thenReturn(Rotation.from('nw'));
        const s = new Station(instance(stationAdapter));
        
        const v1 = s.rotatedTrackCoordinates(new Rotation(0), -5);
        expect(Utils.equals(v1.delta(base).length, 5*Config.default.lineDistance)).eql(true);
        expect(v1.x).lessThan(50);
        expect(v1.y).greaterThan(60);

        const v2 = s.rotatedTrackCoordinates(new Rotation(-90), 3);
        expect(Utils.equals(v2.delta(base).length, 3*Config.default.lineDistance)).eql(true);
        expect(v2.x).greaterThan(50);
        expect(v2.y).greaterThan(60);

        const v3 = s.rotatedTrackCoordinates(new Rotation(180), 2);
        expect(Utils.equals(v3.delta(base).length, 2*Config.default.lineDistance)).eql(true);
        expect(v3.x).greaterThan(50);
        expect(v3.y).lessThan(60);

        const v4 = s.rotatedTrackCoordinates(new Rotation(-90), 0);
        expect(Utils.equals(v4.delta(base).length, 0)).eql(true);
        expect(v4.x).eql(50);
        expect(v4.y).eql(60);        
    })

    it('whenRotatedTrackCoordinates_givenNorthEastStation', () => {
        const base = new Vector(50, 60);
        when(stationAdapter.baseCoords).thenReturn(base);
        when(stationAdapter.rotation).thenReturn(Rotation.from('ne'));
        const s = new Station(instance(stationAdapter));
        
        const v1 = s.rotatedTrackCoordinates(new Rotation(0), -5);
        expect(Utils.equals(v1.delta(base).length, 5*Config.default.lineDistance)).eql(true);
        expect(v1.x).lessThan(50);
        expect(v1.y).lessThan(60);

        const v2 = s.rotatedTrackCoordinates(new Rotation(-90), 3);
        expect(Utils.equals(v2.delta(base).length, 3*Config.default.lineDistance)).eql(true);
        expect(v2.x).lessThan(50);
        expect(v2.y).greaterThan(60);

        const v3 = s.rotatedTrackCoordinates(new Rotation(180), 2);
        expect(Utils.equals(v3.delta(base).length, 2*Config.default.lineDistance)).eql(true);
        expect(v3.x).greaterThan(50);
        expect(v3.y).greaterThan(60);

        const v4 = s.rotatedTrackCoordinates(new Rotation(-90), 0);
        expect(Utils.equals(v4.delta(base).length, 0)).eql(true);
        expect(v4.x).eql(50);
        expect(v4.y).eql(60);        
    })

    it('whenRotatedTrackCoordinates_givenWestStation', () => {
        const base = new Vector(0, 0);
        when(stationAdapter.baseCoords).thenReturn(base);
        when(stationAdapter.rotation).thenReturn(Rotation.from('w'));
        const s = new Station(instance(stationAdapter));
        
        const v1 = s.rotatedTrackCoordinates(new Rotation(0), -5);
        expect(Utils.equals(v1.delta(base).length, 5*Config.default.lineDistance)).eql(true);
        expect(Utils.equals(v1.x, 0)).eql(true);
        expect(v1.y).greaterThan(0);

        const v2 = s.rotatedTrackCoordinates(new Rotation(-90), 3);
        expect(Utils.equals(v2.delta(base).length, 3*Config.default.lineDistance)).eql(true);
        expect(v2.x).greaterThan(0);
        expect(Utils.equals(v2.y, 0)).eql(true);

        const v3 = s.rotatedTrackCoordinates(new Rotation(180), 2);
        expect(Utils.equals(v3.delta(base).length, 2*Config.default.lineDistance)).eql(true);
        expect(Utils.equals(v3.x, 0)).eql(true);
        expect(v3.y).lessThan(0);

        const v4 = s.rotatedTrackCoordinates(new Rotation(-90), 0);
        expect(Utils.equals(v4.delta(base).length, 0)).eql(true);
        expect(v4.x).eql(0);
        expect(v4.y).eql(0);        
    })
})