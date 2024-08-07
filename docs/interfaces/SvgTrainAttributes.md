[transport-network-animator](../README.md) / SvgTrainAttributes

# Interface: SvgTrainAttributes

An animated Train that runs on a Line.

SVG: `path`

**`example`**
``` 
<path data-train="IR2013" data-stops="Bern -4+30 Olten +33+61 BaselSBB" data-from="2022 2 keepzoom" data-to="2022 120 keepzoom" data-length="4" />
```

## Hierarchy

- [`SvgAbstractTimedDrawableAttributes`](SvgAbstractTimedDrawableAttributes.md)

  ↳ **`SvgTrainAttributes`**

## Table of contents

### Properties

- [from](SvgTrainAttributes.md#from)
- [length](SvgTrainAttributes.md#length)
- [name](SvgTrainAttributes.md#name)
- [offset](SvgTrainAttributes.md#offset)
- [stops](SvgTrainAttributes.md#stops)
- [to](SvgTrainAttributes.md#to)

## Properties

### from

• **from**: `Instant`

Indicates when this element shall appear.

Pattern: `(?<epoch>\d+) (?<second>\d+)(?<flag> [\w-]+)?` e.g. `2020 5 noanim-nozoom`

`epoch`: Epochs will be executed in order. Years can be used as epochs.
`second`: Seconds reset to 0 with every epoch.
`flag`: Optional. `reverse`, `noanim`, `nozoom`, `keepzoom`. Can be combined with `-`.

See further explanations in root Readme.

SVG: `data-from`

#### Inherited from

[SvgAbstractTimedDrawableAttributes](SvgAbstractTimedDrawableAttributes.md).[from](SvgAbstractTimedDrawableAttributes.md#from)

#### Defined in

[svg/SvgApi.ts:31](https://github.com/Vin2nt/transport-network-animator/blob/master/src/svg/SvgApi.ts#L31)

___

### length

• **length**: `number`

The length of the train (i.e. how many "carriages").

**`defaultvalue`** `2`

SVG: `data-length`

#### Defined in

[svg/SvgApi.ts:286](https://github.com/Vin2nt/transport-network-animator/blob/master/src/svg/SvgApi.ts#L286)

___

### name

• **name**: `string`

The name, referring to a Line name defined elsewhere in the SVG ([SvgLineAttributes.name](SvgLineAttributes.md#name)).
The Train will run on this Line.
Attention: The SVG attribute is different for Trains!

Required.

SVG: `data-train`

#### Overrides

[SvgAbstractTimedDrawableAttributes](SvgAbstractTimedDrawableAttributes.md).[name](SvgAbstractTimedDrawableAttributes.md#name)

#### Defined in

[svg/SvgApi.ts:263](https://github.com/Vin2nt/transport-network-animator/blob/master/src/svg/SvgApi.ts#L263)

___

### offset

• **offset**: `number`

Offset in minutes of the timetable given in [SvgTrainAttributes.stops](SvgTrainAttributes.md#stops). This is useful to more easily model a cyclic schedule. Instead of having to calculate manually the times for different trips of e.g. an hourly service, one can just repeat the same schedule definition and set an offset of e.g. 60 min.

#### Defined in

[svg/SvgApi.ts:291](https://github.com/Vin2nt/transport-network-animator/blob/master/src/svg/SvgApi.ts#L291)

___

### stops

• **stops**: `Stop`[]

Stops of the Line given above at which the Train is supposed to stop, with departure and arrival times in between.

Pattern: `((?<stationId>\w+)( (?<depArrInfo>[-+]\d+[-+]\d+) |$))+` e.g. `Berlin +11+50 Hannover +56+120 Frankfurt`

`stationId`: The identifier of a station defined elsewhere in the SVG ([SvgStationAttributes.id](SvgStationAttributes.md#id)). Must be a stop of the Line on which the train runs.
`depArrInfo`: see [https://github.com/traines-source/transport-network-animator#trains-beta](https://github.com/traines-source/transport-network-animator#trains-beta)

Required.

SVG: `data-stops`

#### Defined in

[svg/SvgApi.ts:277](https://github.com/Vin2nt/transport-network-animator/blob/master/src/svg/SvgApi.ts#L277)

___

### to

• **to**: `Instant`

Indicates when this element shall disappear.

Pattern: `(?<epoch>\d+) (?<second>\d+)(?<flag> [\w-]+)?` e.g. `2020 5 noanim-nozoom`

`epoch`: Epochs will be executed in order. Years can be used as epochs.
`second`: Seconds reset to 0 with every epoch.
`flag`: Optional. `reverse`, `noanim`, `nozoom`, `keepzoom`. Can be combined with `-`.

See further explanations in root Readme.

SVG: `data-to`

#### Inherited from

[SvgAbstractTimedDrawableAttributes](SvgAbstractTimedDrawableAttributes.md).[to](SvgAbstractTimedDrawableAttributes.md#to)

#### Defined in

[svg/SvgApi.ts:46](https://github.com/Vin2nt/transport-network-animator/blob/master/src/svg/SvgApi.ts#L46)
