import { Station, Stop } from "./Station";
import { Vector } from "../Vector";
import { StationProvider } from "../Network";
import { Rotation } from "../Rotation";
import { Utils } from "../Utils";
import { PreferredTrack } from "../PreferredTrack";
import { AbstractTimedDrawableAdapter, AbstractTimedDrawable } from "./AbstractTimedDrawable";
import { Config } from "../Config";

export interface LineAdapter extends AbstractTimedDrawableAdapter  {
    stops: Stop[];
    weight: number | undefined;
    totalLength: number;
    termini: Vector[];
    speed: number | undefined;
    animOrder: Rotation | undefined;
    beckStyle: boolean;
    draw(delaySeconds: number, animationDurationSeconds: number, reverse: boolean, path: Vector[], length: number, colorDeviation: number): void;
    move(delaySeconds: number, animationDurationSeconds: number, from: Vector[], to: Vector[], colorFrom: number, colorTo: number): void;
    erase(delaySeconds: number, animationDurationSeconds: number, reverse: boolean, length: number): void;
}

export class Line extends AbstractTimedDrawable {
    static NODE_DISTANCE = 0;
    static SPEED = 100;

    constructor(protected adapter: LineAdapter, private stationProvider: StationProvider, private config: Config = Config.default) {
        super(adapter);
    }

    weight = this.adapter.weight;
    animOrder = this.adapter.animOrder;
    
    private precedingStop: Station | undefined = undefined;
    private precedingDir: Rotation | undefined = undefined;
    private _path: Vector[] = [];

    draw(delay: number, animate: boolean, reverse: boolean): number {
        if (!(this.adapter.totalLength > 0)) {
            this.createLine(delay, animate);
        }        
        let duration = this.getAnimationDuration(this._path, animate);
        const lineGroup = this.stationProvider.lineGroupById(this.name);
        lineGroup.addLine(this);
        this.adapter.draw(delay, duration, reverse, this._path, this.getTotalLength(this._path), lineGroup.strokeColor);
        return duration;
    }

    move(delay: number, animationDurationSeconds: number, path: Vector[], colorDeviation: number) {
        let oldPath = this._path;
        if (oldPath.length < 2 || path.length < 2) {
            console.warn('Trying to move a non-existing line');
            return;
        }
        if (oldPath.length != path.length) {
            oldPath = [oldPath[0], oldPath[oldPath.length-1]];
            path = [path[0], path[path.length-1]];
        }
        const lineGroup = this.stationProvider.lineGroupById(this.name);
        this.adapter.move(delay, animationDurationSeconds, this._path, path, lineGroup.strokeColor, colorDeviation);
        lineGroup.strokeColor = colorDeviation;
        this._path = path;
    }

    erase(delay: number, animate: boolean, reverse: boolean): number {
        let duration = this.getAnimationDuration(this._path, animate);
        this.stationProvider.lineGroupById(this.name).removeLine(this);
        this.adapter.erase(delay, duration, reverse, this.getTotalLength(this._path));
        const stops = this.adapter.stops;
        for (let j=0; j<stops.length; j++) {
            const stop = this.stationProvider.stationById(stops[j].stationId);
            if (stop == undefined)
                throw new Error(this.name + ': Station with ID ' + stops[j].stationId + ' is undefined');
            stop.removeLine(this);
            stop.draw(delay, animate);
            if (j > 0) {
                const helpStopId = 'h_' + Utils.alphabeticId(stops[j-1].stationId, stops[j].stationId);
                let helpStop = this.stationProvider.stationById(helpStopId);
                if (helpStop != undefined) {
                    helpStop.removeLine(this);
                }
            }
        }
        return duration;
    }

    private createLine(delay: number, animate: boolean) {
        const stops = this.adapter.stops;
        const path = this._path;

        let track = new PreferredTrack('+');
        for (let j=0; j<stops.length; j++) {
            track = track.fromString(stops[j].trackInfo);
            const stop = this.stationProvider.stationById(stops[j].stationId);
            if (stop == undefined)
                throw new Error(this.name + ': Station with ID ' + stops[j].stationId + ' is undefined');
            if (path.length == 0)
                track = track.fromExistingLineAtStation(stop.axisAndTrackForExistingLine(this.name));
            
            stops[j].coord = this.createConnection(stop, this.nextStopBaseCoord(stops, j, stop.baseCoords), track, path, delay, animate, true);
            track = track.keepOnlySign();
        }
    }

    private nextStopBaseCoord(stops: Stop[], currentStopIndex: number, defaultCoords: Vector) {
        if (currentStopIndex+1 < stops.length) {
            const id = stops[currentStopIndex+1].stationId;
            const stop = this.stationProvider.stationById(id);
            if (stop == undefined)
                throw new Error(this.name + ': Station with ID ' + id + ' is undefined');
            return stop.baseCoords;            
        }
        return defaultCoords;
    }

    private createConnection(station: Station, nextStopBaseCoord: Vector, track: PreferredTrack, path: Vector[], delay: number, animate: boolean, recurse: boolean): Vector {
        const dir = station.rotation;
        const baseCoord = station.baseCoords;
        const newDir = this.getStopOrientationBasedOnThreeStops(station, nextStopBaseCoord, dir, path);
        const newPos = station.assignTrack(newDir.isVertical() ? 'x' : 'y', track, this);

        const newCoord = station.rotatedTrackCoordinates(newDir, newPos);
    
        if (path.length != 0) {
            const oldCoord = path[path.length-1];
    
            this.precedingDir = this.getPrecedingDir(this.precedingDir, this.precedingStop, oldCoord, newCoord);
    
            const stationDir = newDir.add(dir);
            const found = this.insertNode(oldCoord, this.precedingDir, newCoord, stationDir, path);
    
            if (!found && recurse && this.precedingStop != undefined) {
                const helpStop = this.getOrCreateHelperStop(this.precedingDir, this.precedingStop, station);
                
                this.precedingDir = this.precedingDir.add(new Rotation(180));
                this.createConnection(helpStop, baseCoord, track.keepOnlySign(), path, delay, animate, false);
                return this.createConnection(station, nextStopBaseCoord, track, path, delay, animate, false);
            } else if (!found) {
                console.warn('path to fix on line', this.adapter.name, 'at station', station.id);
            }
            this.precedingDir = stationDir;
        }
        station.addLine(this, newDir.isVertical() ? 'x' : 'y', newPos);
        path.push(newCoord);

        delay = this.getAnimationDuration(path, animate) + delay;
        station.draw(delay, animate);
        this.precedingStop = station;
        return newCoord;
    }

    private getStopOrientationBasedOnThreeStops(station: Station, nextStopBaseCoord: Vector, dir: Rotation, path: Vector[]): Rotation {
        if (path.length != 0) {
            const oldCoord = path[path.length-1];
            return nextStopBaseCoord.delta(oldCoord).inclination().quarterDirection(dir);
        }
        const delta = station.baseCoords.delta(nextStopBaseCoord);
        const existingAxis = station.axisAndTrackForExistingLine(this.name)?.axis;
        if (existingAxis != undefined) {
            const existingStopOrientiation = delta.inclination().halfDirection(dir, existingAxis == 'x' ? new Rotation(90) : new Rotation(0));
            if (this.precedingDir == undefined) {
                this.precedingDir = existingStopOrientiation.add(dir).add(new Rotation(180));
            }
            return existingStopOrientiation;
        }
        return delta.inclination().quarterDirection(dir);
    }
    

    private getPrecedingDir(precedingDir: Rotation | undefined, precedingStop: Station | undefined, oldCoord: Vector, newCoord: Vector): Rotation {
        if (precedingDir == undefined) {
            const precedingStopRotation = precedingStop?.rotation ?? new Rotation(0);
            precedingDir = oldCoord.delta(newCoord).inclination().quarterDirection(precedingStopRotation).add(precedingStopRotation);
        } else {
            precedingDir = precedingDir.add(new Rotation(180));
        }
        return precedingDir;
    }

    private insertNode(fromCoord: Vector, fromDir: Rotation, toCoord: Vector, toDir: Rotation, path: Vector[]): boolean {
        if (!this.config.beckStyle || !this.adapter.beckStyle) {
            return true;
        }
        const delta: Vector = fromCoord.delta(toCoord);
        const oldDirV = Vector.UNIT.rotate(fromDir);
        const newDirV = Vector.UNIT.rotate(toDir);
        if (delta.isDeltaMatchingParallel(oldDirV, newDirV)) {
            return true;
        }
        const solution = delta.solveDeltaForIntersection(oldDirV, newDirV)
        if (solution.a > Line.NODE_DISTANCE && solution.b > Line.NODE_DISTANCE) {
            path.push(new Vector(fromCoord.x+oldDirV.x*solution.a, fromCoord.y+oldDirV.y*solution.a));
            return true;
        }
        return false;
    }

    private getOrCreateHelperStop(fromDir: Rotation, fromStop: Station, toStop: Station): Station {
        const helpStopId = 'h_' + Utils.alphabeticId(fromStop.id, toStop.id);
        let helpStop = this.stationProvider.stationById(helpStopId);
        if (helpStop == undefined) {
            const oldCoord = fromStop.baseCoords;
            const newCoord = toStop.baseCoords;
            const delta = newCoord.delta(oldCoord);
            const deg = oldCoord.delta(newCoord).inclination();
            const intermediateDir = fromStop.rotation.nearestRoundedInDirection(deg, fromDir.delta(deg).degrees);
            const intermediateCoord = delta.withLength(delta.length/2).add(newCoord);

            helpStop = this.stationProvider.createVirtualStop(helpStopId, intermediateCoord, intermediateDir);
        }
        return helpStop;
    }

    get animationDurationSeconds(): number {
        return this.getAnimationDuration(this._path, true);
    }

    get speed(): number {
        return this.adapter.speed || Line.SPEED;
    }

    private getAnimationDuration(path: Vector[], animate: boolean): number {
        if (!animate)
            return 0;
        return this.getTotalLength(path) / this.speed;
    }
    
    private getTotalLength(path: Vector[]): number {
        const actualLength = this.adapter.totalLength;
        if (actualLength > 0) {
            return actualLength;
        }
        let length = 0;
        for (let i=0; i<path.length-1; i++) {
            length += path[i].delta(path[i+1]).length;
        }
        return length;
    }

    get termini(): Stop[] {
        const stops = this.adapter.stops;
        if (stops.length == 0) 
            return [];
        return [stops[0], stops[stops.length-1]];
    }

    get path(): Vector[] {
        if (this._path.length == 0) {
            return this.adapter.termini;
        }
        return this._path;
    }

    getStop(stationId: string): Stop | null {
        for (const stop of Object.values(this.adapter.stops)) {
            if (stop.stationId == stationId) {
                return stop;
            }
        }
        return null;
    }
}