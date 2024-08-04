[transport-network-animator](../README.md) / SvgLineAttributes

# Interface: SvgLineAttributes

An animated Line.

SVG: `path`

**`example`**
```
<path data-line="IR2013" data-stops="- Bern Olten Liestal BaselSBB" data-from="2022 0 noanim-nozoom" data-to="2022 120 noanim-nozoom" data-speed="300" />
```

## Hierarchy

- [`SvgAbstractTimedDrawableAttributes`](SvgAbstractTimedDrawableAttributes.md)

  ↳ **`SvgLineAttributes`**

## Table of contents

### Properties

- [animOrder](SvgLineAttributes.md#animorder)
- [beckStyle](SvgLineAttributes.md#beckstyle)
- [from](SvgLineAttributes.md#from)
- [name](SvgLineAttributes.md#name)
- [speed](SvgLineAttributes.md#speed)
- [stops](SvgLineAttributes.md#stops)
- [to](SvgLineAttributes.md#to)
- [weight](SvgLineAttributes.md#weight)

## Properties

### animOrder

• **animOrder**: `undefined` \| [`Rotation`](../classes/Rotation.md)

If set, indicates the geographical animation order, e.g. from north to south,
instead of animating elements with the same name and for the same Instant by the order in which they appear in the SVG.
e.g. `n`, `sw`.

SVG: `data-anim-order`

#### Defined in

[svg/SvgApi.ts:177](https://github.com/Vin2nt/transport-network-animator/blob/master/src/svg/SvgApi.ts#L177)

___

### beckStyle

• **beckStyle**: `boolean`

Whether to use the "Harry Beck style" for this Line segment. If set to false, overrides [Config.beckStyle](../classes/Config.md#beckstyle).

SVG: `data-beck-style`

#### Defined in

[svg/SvgApi.ts:184](https://github.com/Vin2nt/transport-network-animator/blob/master/src/svg/SvgApi.ts#L184)

___

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

### name

• **name**: `string`

The name. In certain circumstances, this will be used a grouping identifier.
Attention: The SVG attribute is different for Lines!

Required.

SVG: `data-line`

#### Overrides

[SvgAbstractTimedDrawableAttributes](SvgAbstractTimedDrawableAttributes.md).[name](SvgAbstractTimedDrawableAttributes.md#name)

#### Defined in

[svg/SvgApi.ts:140](https://github.com/Vin2nt/transport-network-animator/blob/master/src/svg/SvgApi.ts#L140)

___

### speed

• **speed**: `undefined` \| `number`

The animation speed of that Line segment. This overrides [Config.animSpeed](../classes/Config.md#animspeed).

SVG: `data-speed`

#### Defined in

[svg/SvgApi.ts:168](https://github.com/Vin2nt/transport-network-animator/blob/master/src/svg/SvgApi.ts#L168)

___

### stops

• **stops**: `Stop`[]

A space-separated list of Station identifiers, and, optionally, a preceding track info.

Pattern: `((?<trackInfo>[-+]\d*\*? )?(?<stationId>\w+( |$)))+` e.g. `+1 Frankfurt - Hannover +2* Berlin`

`stationId`: The identifier of a station defined elsewhere in the SVG ([SvgStationAttributes.id](SvgStationAttributes.md#id)).
`trackInfo`: see [https://github.com/traines-source/transport-network-animator#tracks](https://github.com/traines-source/transport-network-animator#tracks)

Required.

SVG: `data-stops`

#### Defined in

[svg/SvgApi.ts:154](https://github.com/Vin2nt/transport-network-animator/blob/master/src/svg/SvgApi.ts#L154)

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

___

### weight

• **weight**: `undefined` \| `number`

The graph weight of that Line segment, used for Gravitator.

`data-weight`

#### Defined in

[svg/SvgApi.ts:161](https://github.com/Vin2nt/transport-network-animator/blob/master/src/svg/SvgApi.ts#L161)
