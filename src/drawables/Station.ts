import { Vector } from "../Vector";
import { Rotation } from "../Rotation";
import { Line } from "./Line";
import { Utils } from "../Utils";
import { PreferredTrack } from "../PreferredTrack";
import { Label } from "./Label";
import { BoundingBox } from "../BoundingBox";
import { AbstractTimedDrawable, AbstractTimedDrawableAdapter } from "./AbstractTimedDrawable";
import { Projection } from "../Projection";

export interface StationAdapter extends AbstractTimedDrawableAdapter {
    baseCoords: Vector;
    lonLat: Vector | undefined;
    rotation: Rotation;
    labelDir: Rotation;
    id: string;
    draw(delaySeconds: number, getPositionBoundaries: () => {[id: string]: [number, number]}): void;
    erase(delaySeconds: number): void;
    move(delaySeconds: number, animationDurationSeconds: number, from: Vector, to: Vector, callback: () => void): void;
}

export class Stop {
    constructor(public stationId: string, public trackInfo: string) {

    }

    public coord: Vector | null = null;
}

export interface LineAtStation {
    line?: Line;
    axis: string;
    track: number;
}

export class Station extends AbstractTimedDrawable {
    static LINE_DISTANCE = 6;
    static DEFAULT_STOP_DIMEN = 10;
    static LABEL_DISTANCE = 0;


    private existingLines: {[id: string]: LineAtStation[]} = {x: [], y: []};
    private existingLabels: Label[] = [];
    private phantom?: LineAtStation = undefined;
    rotation = this.adapter.rotation;
    labelDir = this.adapter.labelDir;
    id = this.adapter.id;

    constructor(protected adapter: StationAdapter) {
        super(adapter);
        console.log(this.adapter.lonLat);
        if (this.adapter.lonLat != undefined) {
            this.adapter.baseCoords = new Vector(Projection.default.x(this.adapter.lonLat.x), Projection.default.y(this.adapter.lonLat.y));
        }
    }

    get baseCoords() {
        return this.adapter.baseCoords;
    }

    set baseCoords(baseCoords: Vector) {
        this.adapter.baseCoords = baseCoords;
    }

    get boundingBox() {
        return new BoundingBox(this.adapter.baseCoords, this.adapter.baseCoords);
    }

    addLine(line: Line, axis: string, track: number): void {
        this.phantom = undefined;
        this.existingLines[axis].push({line: line, axis: axis, track: track});
    }

    removeLine(line: Line): void {
        this.removeLineAtAxis(line, this.existingLines.x);
        this.removeLineAtAxis(line, this.existingLines.y);
    }

    addLabel(label: Label): void {
        if (!this.existingLabels.includes(label))
            this.existingLabels.push(label);
    }

    removeLabel(label: Label): void {
        let i = 0;
        while (i < this.existingLabels.length) {
            if (this.existingLabels[i] == label) {
                this.existingLabels.splice(i, 1);
            } else {
                i++;
            }
        }
    }

    get labels(): Label[] {
        return this.existingLabels;
    }

    private removeLineAtAxis(line: Line, existingLinesForAxis: LineAtStation[]): void {
        let i = 0;
        while (i < existingLinesForAxis.length) {
            if (existingLinesForAxis[i].line == line) {
                this.phantom = existingLinesForAxis[i];
                existingLinesForAxis.splice(i, 1);
            } else {
                i++;
            }
        }
    }

    axisAndTrackForExistingLine(lineName: string): LineAtStation | undefined {
        const x = this.trackForLineAtAxis(lineName, this.existingLines.x);
        if (x != undefined) {
            return x;
        }
        const y = this.trackForLineAtAxis(lineName, this.existingLines.y);
        if (y != undefined) {
            return y;
        }
        return undefined;
    }

    private trackForLineAtAxis(lineName: string, existingLinesForAxis: LineAtStation[]): LineAtStation | undefined {
        let i = 0;
        while (i < existingLinesForAxis.length) {
            if (existingLinesForAxis[i].line?.name == lineName) {
                return existingLinesForAxis[i];
            }
            i++;
        }
        return undefined;
    }

    assignTrack(axis: string, preferredTrack: PreferredTrack, line: Line): number { 
        if (preferredTrack.hasTrackNumber()) {
            return preferredTrack.trackNumber;
        }
        if (this.phantom?.line?.name == line.name && this.phantom?.axis == axis) {
            return this.phantom?.track;
        }
        const positionBoundariesForAxis = this.positionBoundaries()[axis];
        return preferredTrack.isPositive() ? positionBoundariesForAxis[1] + 1 : positionBoundariesForAxis[0] - 1;
    }

    rotatedTrackCoordinates(incomingDir: Rotation, assignedTrack: number): Vector { 
        let newCoord: Vector;
        if (incomingDir.degrees % 180 == 0) {
            newCoord = new Vector(assignedTrack * Station.LINE_DISTANCE, 0);
        } else {
            newCoord = new Vector(0, assignedTrack * Station.LINE_DISTANCE);
        }
        newCoord = newCoord.rotate(this.rotation);
        newCoord = this.baseCoords.add(newCoord);
        return newCoord;
    }

    private positionBoundaries(): {[id: string]: [number, number]} {
        return {
            x: this.positionBoundariesForAxis(this.existingLines.x),
            y: this.positionBoundariesForAxis(this.existingLines.y)
        };
    }
    
    private positionBoundariesForAxis(existingLinesForAxis: LineAtStation[]): [number, number] {
        if (existingLinesForAxis.length == 0) {
            return [1, -1];
        }
        let left = 0;
        let right = 0;
        for (let i=0; i<existingLinesForAxis.length; i++) {
            if (right < existingLinesForAxis[i].track) {
                right = existingLinesForAxis[i].track;
            }
            if (left > existingLinesForAxis[i].track) {
                left = existingLinesForAxis[i].track;
            }
        }
        return [left, right];
    }

    draw(delaySeconds: number, animate: boolean): number {
        const station = this;
        this.existingLabels.forEach(l => l.draw(delaySeconds, false));
        const t = station.positionBoundaries();
        this.adapter.draw(delaySeconds, function() { return t; });
        return 0;
    }

    move(delaySeconds: number, animationDurationSeconds: number, to: Vector) {
        const station = this;
        this.adapter.move(delaySeconds, animationDurationSeconds, this.baseCoords, to, () => station.existingLabels.forEach(l => l.draw(0, false)));
    }

    erase(delaySeconds: number, animate: boolean, reverse: boolean): number {
        this.adapter.erase(delaySeconds);
        return 0;
    }

    stationSizeForAxis(axis: string, vector: number): number {
        if (Utils.equals(vector, 0))
            return 0;
        const dir = Math.sign(vector);
        let dimen = this.positionBoundariesForAxis(this.existingLines[axis])[vector < 0 ? 0 : 1];
        if (dir*dimen < 0) {
            dimen = 0;
        }
        return dimen * Station.LINE_DISTANCE + dir * (Station.DEFAULT_STOP_DIMEN + Station.LABEL_DISTANCE);
    }

    linesExisting(): boolean {
        if (this.existingLines.x.length > 0 || this.existingLines.y.length > 0) {
            return true;
        }
        return false;
    }

  
}