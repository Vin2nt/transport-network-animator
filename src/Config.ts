export class Config {
    private static _default: Config;

    /**
     * Whether to automatically start TNA. Set to false if you want to run custom code (e.g. setting up paths etc. programmatically) beforehand.
     * This needs to be set in the SVG to the SVG tag (data-auto-start="false"). Setting it in JavaScript will not have any effect.
     * If set to false, you will need to fire an event from your JavaScript if you eventually want to start TNA: `document.dispatchEvent(new Event('startTransportNetworkAnimator'));`
     */
    autoStart = true;

    /**
     * Which map projection to use if you use data-lonlat attributes on stations. For choices and custom projections, see {@link Projection}
     */
    mapProjection = 'epsg3857';

    /**
     * Scale of the map projection when converting to SVG coordinate system.
     */
    mapProjectionScale = 200;

    /**
     * Maximum zoom level.
     */
    zoomMaxScale = 3;

    /**
     * Whether to enable Harry Beck style drawing (only lines in 45 degree steps, as usually done for public transport maps).
     * This can also be set for each SVG path individually (data-beck-style="false").
     */
    beckStyle = true;

    /**
     * Minimum distance of corners for Harry Beck style.
     */
    minNodeDistance = 0;

    /**
     * Animation speed for lines.
     */
    animSpeed = 100;

    /**
     * Distance of neighboring lines at stations.
     */
    lineDistance = 6;

    /**
     * Size of a station with a single line.
     */
    defaultStationDimen = 10;

    /**
     * Height of labels. This influences the spacing of labels to stations.
     */
    labelHeight = 12;

    /**
     * Extra distance of labels from the station.
     */
    labelDistance = 0;

    /**
     * Duration of zoom at the beginning of every instant.
     */
    zoomDuration = 1;

    /**
     * How much padding to add around bounding box of zoomed elements to calculate the actual canvas extent.
     */
    zoomPaddingFactor = 40;

    /**
     * Length of one train section.
     */
    trainWagonLength = 10;

    /**
     * Offset of train relative to line.
     */
    trainTrackOffset = 0;

    /**
     * How fast to animate trains according to given timetables, measured in real seconds per animated second.
     * The default (60) means that if numbers given in the timetables are interpreted as minutes, one minute in reality corresponds to one second in the animation. 
     */
    trainTimetableSpeed = 60;

    /**
     * How much to take into account the original and current positions of nodes/stations to optimize the new positions.
     * This is meant to avoid nodes flapping around and keeping the network in a recognizable layout, even if it is not the optimal layout.
     * This should be adjusted by experimentation depending on how far the nodes move from their starting positions during your animation.
     * Set to 0 to disable.
     */
    gravitatorInertness = 100;

    /**
     * Gradient scaling to ensure gradient is not extremely large or extremely small.
     * The default value should be fine in most cases.
     * Do experimentally adjust it if the optimization takes a long time or leads to bad results (large deviations). 
     */
    gravitatorGradientScale = 0.1;

    /**
     * When true, distances will be adjusted to the average ratio between all given weights and the sum of euclidian distances between nodes.
     * That means edge lengths will be to scale compared to eachother. A distortion will occur on the first iteration.
     * Suitable if your initial weights are not a universally valid ground truth (e.g. train travel times in a particular year).
     * When false, the initial weight for each edge is taken as ground truth, which means that edges cannot necessarily be compared to eachother visually,
     * they are just scaled relative to their respective ground truth throughout the animation. Consequently, on the first iteration, no distortion will occur.
     * Suitable if your initial weights are universally valid (e.g. geographic linear distance).
     * 
     * If you choose true, you might want to add a copy of every edge to the SVG without specifying a weight at the beginning.
     * This way, you can animate from the undistorted graph with the nodes at their indicated positions
     * to the first iteration where the distances are adjusted according to the weights.
     * Bear in mind that the euclidian distance depends on your chosen map projection and is not the exact geographic linear distance. 
     */
    gravitatorInitializeRelativeToEuclidianDistance = true;

    /**
     * How fast to animate the distortion. Depends on the scale of your map.
     */
    gravitatorAnimSpeed = 250;

    /**
     * Upper bound for animation duration.
     */
    gravitatorAnimMaxDurationSeconds = 6;

    /**
     * Color edges that are unusually long in red and those that are unusually short in blue. Set to 0 to disable, or override it using CSS.
     */
    gravitatorColorDeviation = 0.02;

    /**
     * The default Config that will be used everywhere except when specifically overriden. Access it from your JavaScript code to set config values using `TNA.Config.default`, e.g. `TNA.Config.default.beckStyle = false;` 
     */
    public static get default(): Config {
        return this._default || (this._default = new Config());
    }
}