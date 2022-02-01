import { NetworkAdapter, Network, StationProvider } from "../Network";
import { TimedDrawable } from "../drawables/TimedDrawable";
import { BoundingBox } from "../BoundingBox";
import { Vector } from "../Vector";
import { Rotation } from "../Rotation";
import { Station } from "../drawables/Station";
import { Line } from "../drawables/Line";
import { SvgLine } from "./SvgLine";
import { SvgStation } from "./SvgStation";
import { Label } from "../drawables/Label";
import { SvgLabel } from "./SvgLabel";
import { GenericTimedDrawable } from "../drawables/GenericTimedDrawable";
import { SvgGenericTimedDrawable } from "./SvgGenericTimedDrawable";
import { Train } from "../drawables/Train";
import { SvgTrain } from "./SvgTrain";
import { SvgAnimator } from "./SvgAnimator";
import { SvgKenImage } from "./SvgImage";
import { KenImage } from "../drawables/Image";
import { Config } from "../Config";

export class SvgNetwork implements NetworkAdapter {

    static SVGNS = "http://www.w3.org/2000/svg";

    private currentZoomCenter: Vector = Vector.NULL;
    private currentZoomScale: number = 1;

    constructor() {
        this.svgConfig();
    }

    private svgConfig() {
        const svg = document.querySelector('svg');
        if (svg?.dataset.autoStart != undefined) {
            Config.default.autoStart = svg?.dataset.autoStart != 'false';
        }
        if (svg?.dataset.zoomMaxScale != undefined) {
            Config.default.zoomMaxScale = parseFloat(svg?.dataset.zoomMaxScale);
        }
        if (svg?.dataset.beckStyle != undefined) {
            Config.default.beckStyle = svg?.dataset.beckStyle != 'false';
        }
        if (svg?.dataset.trainTimetableSpeed != undefined) {
            Config.default.trainTimetableSpeed = parseFloat(svg?.dataset.trainTimetableSpeed);
        }
    }

    get canvasSize(): BoundingBox {
        const svg = document.querySelector('svg');
        const box = svg?.viewBox.baseVal;
        if (box) {
            return new BoundingBox(new Vector(box.x, box.y), new Vector(box.x+box.width, box.y+box.height));
        }
        return new BoundingBox(Vector.NULL, Vector.NULL);
    }

    initialize(network: Network): void {
        if (!document.getElementById("elements")) {
            console.warn('A group with the id "elements" is missing in the SVG source. It might be needed for helper stations and labels.');
        }
        let elements = document.getElementsByTagName("*");
        for (let i=0; i<elements.length; i++) {
            const element: TimedDrawable | null = this.mirrorElement(elements[i], network);
            if (element != null) {
                network.addToIndex(element);
            }
        }
    }

    private mirrorElement(element: any, network: StationProvider): TimedDrawable | null {
        if (element.localName == 'path' && element.dataset.line != undefined) {
            return new Line(new SvgLine(element), network, Config.default);
        } else if (element.localName == 'path' && element.dataset.train != undefined) {
            return new Train(new SvgTrain(element), network, Config.default);
        } else if (element.localName == 'rect' && element.dataset.station != undefined) {
            return new Station(new SvgStation(element));
        } else if (element.localName == 'text' && (element.dataset.station != undefined || element.dataset.line != undefined)) {
            return new Label(new SvgLabel(element), network);
        } else if (element.localName == 'image' && element.dataset.zoom != undefined) {
            return new KenImage(new SvgKenImage(element));
        } else if (element.dataset.from != undefined || element.dataset.to != undefined) {
            return new GenericTimedDrawable(new SvgGenericTimedDrawable(element));
        }
        return null;
    }

    createVirtualStop(id: string, baseCoords: Vector, rotation: Rotation): Station {
        const helpStop = <SVGRectElement> document.createElementNS(SvgNetwork.SVGNS, 'rect');
        helpStop.setAttribute('data-station', id);
        helpStop.setAttribute('data-dir', rotation.name);
        this.setCoord(helpStop, baseCoords);
        helpStop.className.baseVal = 'helper';
        document.getElementById('elements')?.appendChild(helpStop);
        return new Station(new SvgStation(helpStop));  
    }

    private setCoord(element: any, coord: Vector): void {
        element.setAttribute('x', coord.x);
        element.setAttribute('y', coord.y);
    }

    drawEpoch(epoch: string): void {
        const event = new CustomEvent('epoch', { detail: epoch });
        document.dispatchEvent(event);
        
        let epochLabel;
        if (document.getElementById('epoch-label') != undefined) {
            epochLabel = <SVGTextElement> <unknown> document.getElementById('epoch-label');
            epochLabel.textContent = epoch;       
        }
    }
   
    zoomTo(zoomCenter: Vector, zoomScale: number, animationDurationSeconds: number) {
        const animator = new SvgAnimator();
        const defaultBehaviour = animationDurationSeconds <= Config.default.zoomDuration;
        animator.wait(defaultBehaviour ? 0 : Config.default.zoomDuration * 1000, () => {
            const currentZoomCenter = this.currentZoomCenter;
            const currentZoomScale = this.currentZoomScale;
            animator
                .ease(defaultBehaviour ? SvgAnimator.EASE_CUBIC : SvgAnimator.EASE_NONE)
                .animate(animationDurationSeconds * 1000, (x, isLast) => {
                    this.animateFrame(x, isLast, currentZoomCenter, zoomCenter, currentZoomScale, zoomScale);
                    return true;
                });
            this.currentZoomCenter = zoomCenter;
            this.currentZoomScale = zoomScale;
        });
    }

    private animateFrame(x: number, isLast: boolean, fromCenter: Vector, toCenter: Vector, fromScale: number, toScale: number): void {
        if (!isLast) {
            const delta = fromCenter.delta(toCenter)
            const center = new Vector(delta.x * x, delta.y * x).add(fromCenter);
            const scale = (toScale - fromScale) * x + fromScale;
            this.updateZoom(center, scale);
        } else {
            this.updateZoom(toCenter, toScale);
        }
    }

    private updateZoom(center: Vector, scale: number) {
        const zoomable = document.getElementById('zoomable');
        if (zoomable != undefined) {
            const origin = this.canvasSize.tl.between(this.canvasSize.br, 0.5);
            zoomable.style.transformOrigin = origin.x + 'px ' + origin.y + 'px';
            zoomable.style.transform = 'scale(' + scale + ') translate(' + (origin.x - center.x) + 'px,' + (origin.y - center.y) + 'px)';
        }
    }
}
